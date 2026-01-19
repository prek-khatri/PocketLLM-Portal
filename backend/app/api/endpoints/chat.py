from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime
from app.db.database import get_db, SessionLocal
from app.api.models.schemas import (
    InferenceRequest,
    InferenceResponse,
    ChatSessionCreate,
    ChatSessionResponse,
    ChatSessionListResponse,
    ChatSessionUpdate,
    MessageResponse,
    ChatMessageResponse
)
from app.services.auth_service import AuthService, security
from app.services.chat_service import ChatService
from app.services.inference_service import inference_service
from app.db.models import User, ChatMessage

router = APIRouter(prefix="/chat", tags=["Chat"])

def get_current_user(db: Session = Depends(get_db), credentials = Depends(security)) -> User:

    return AuthService.get_current_user(credentials, db)

@router.post("/inference", response_model=InferenceResponse)
async def generate_response(
    request: InferenceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if request.session_id:
        session = ChatService.get_session(db, request.session_id, current_user)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
    else:

        session = ChatService.create_session(
            db,
            current_user,
            ChatSessionCreate(title=request.prompt[:50] + "..." if len(request.prompt) > 50 else request.prompt)
        )

    user_message = ChatService.add_message(
        db,
        session.id,
        role="user",
        content=request.prompt
    )

    try:
        llm_response = inference_service.generate_response(
            prompt=request.prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            top_p=request.top_p
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response: {str(e)}"
        )

    assistant_message = ChatService.add_message(
        db,
        session.id,
        role="assistant",
        content=llm_response
    )

    return InferenceResponse(
        response=llm_response,
        session_id=session.id,
        user_message=ChatMessageResponse.model_validate(user_message),
        assistant_message=ChatMessageResponse.model_validate(assistant_message)
    )

@router.post("/inference/stream")
async def generate_response_stream(
    request: InferenceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if request.session_id:
        session = ChatService.get_session(db, request.session_id, current_user)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )
    else:

        session = ChatService.create_session(
            db,
            current_user,
            ChatSessionCreate(title=request.prompt[:50] + "..." if len(request.prompt) > 50 else request.prompt)
        )

    user_message = ChatService.add_message(
        db,
        session.id,
        role="user",
        content=request.prompt
    )

    recent_messages = ChatService.get_recent_messages(db, session.id, limit=7)

    messages = []
    for msg in recent_messages:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })

    messages.append({
        "role": "user",
        "content": request.prompt
    })

    async def event_stream():

        try:
            full_response = ""

            yield f"data: {json.dumps({'type': 'start', 'session_id': session.id, 'user_message_id': user_message.id})}\n\n"

            async for token in inference_service.generate_response_stream_async(
                messages=messages,
                max_tokens=request.max_tokens,
                temperature=request.temperature,
                top_p=request.top_p
            ):
                full_response += token
                yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

            assistant_message = ChatService.add_message(
                db,
                session.id,
                role="assistant",
                content=full_response
            )

            if ChatService.is_first_message_in_session(db, session.id):
                try:

                    words = request.prompt.split()[:10]
                    title = " ".join(words)
                    if len(title) > 50:
                        title = title[:47] + "..."
                    elif len(words) == 10:
                        title = title + "..."

                    ChatService.update_session_title(db, session.id, title)
                    print(f"✓ Generated title for session {session.id}: {title}")
                except Exception as e:
                    print(f"Error generating title: {e}")

            yield f"data: {json.dumps({'type': 'done', 'assistant_message_id': assistant_message.id, 'full_response': full_response})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@router.post("/inference/save-partial")
async def save_partial_response(
    request: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    session_id = request.get('session_id')
    user_message_id = request.get('user_message_id')
    partial_response = request.get('partial_response')

    if not session_id or not partial_response:
        raise HTTPException(status_code=400, detail="Missing required fields")

    session = ChatService.get_session(db, session_id, current_user)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    user_message = None
    if user_message_id:
        user_message = db.query(ChatMessage).filter(ChatMessage.id == user_message_id).first()

    assistant_message = ChatService.add_message(db, session_id, role="assistant", content=partial_response)

    if ChatService.is_first_message_in_session(db, session_id):
        try:

            if user_message:
                user_prompt = user_message.content
            else:

                user_message = db.query(ChatMessage).filter(
                    ChatMessage.session_id == session_id,
                    ChatMessage.role == "user"
                ).order_by(ChatMessage.created_at.desc()).first()
                user_prompt = user_message.content if user_message else "Chat"

            words = user_prompt.split()[:10]
            title = " ".join(words)
            if len(title) > 50:
                title = title[:47] + "..."
            elif len(words) == 10:
                title = title + "..."

            ChatService.update_session_title(db, session_id, title)
            print(f"✓ Generated title for session {session_id}: {title}")
        except Exception as e:
            print(f"Error generating title: {e}")

    return {
        "user_message_id": user_message.id if user_message else None,
        "assistant_message_id": assistant_message.id,
        "session_id": session_id
    }

@router.post("/sessions", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    session_data: ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    session = ChatService.create_session(db, current_user, session_data)
    return ChatSessionResponse.model_validate(session)

@router.get("/sessions", response_model=List[ChatSessionListResponse])
async def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 100
):

    sessions = ChatService.get_user_sessions(db, current_user, limit)
    return sessions

@router.get("/search", response_model=List[ChatSessionListResponse])
async def search_sessions(
    q: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 50
):

    from app.db.models import ChatSession
    from sqlalchemy import or_

    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id,
        or_(
            ChatSession.title.ilike(f"%{q}%"),
            ChatSession.messages.any(ChatMessage.content.ilike(f"%{q}%"))
        )
    ).order_by(ChatSession.updated_at.desc()).limit(limit).all()

    result = []
    for session in sessions:
        result.append(ChatSessionListResponse(
            id=session.id,
            title=session.title,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=len(session.messages)
        ))

    return result

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
async def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    session = ChatService.get_session(db, session_id, current_user)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    return ChatSessionResponse.model_validate(session)

@router.delete("/sessions/{session_id}", response_model=MessageResponse)
async def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    ChatService.delete_session(db, session_id, current_user)
    return MessageResponse(message="Session deleted successfully")

@router.patch("/sessions/{session_id}", response_model=ChatSessionResponse)
async def rename_session(
    session_id: int,
    update_data: ChatSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    session = ChatService.get_session(db, session_id, current_user)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    session.title = update_data.title
    db.commit()
    db.refresh(session)

    return ChatSessionResponse.model_validate(session)

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
async def get_session_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    messages = ChatService.get_session_messages(db, session_id, current_user)
    return [ChatMessageResponse.model_validate(msg) for msg in messages]

@router.delete("/sessions/{session_id}/messages/{message_id}", response_model=MessageResponse)
async def delete_messages_from(
    session_id: int,
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a message and all messages after it (for edit functionality)."""
    deleted_count = ChatService.delete_messages_from(db, session_id, message_id, current_user)
    return MessageResponse(message=f"Deleted {deleted_count} messages")

@router.get("/sessions/{session_id}/export")
async def export_session(
    session_id: int,
    format: str = "json",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    session = ChatService.get_session(db, session_id, current_user)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    messages = ChatService.get_session_messages(db, session_id, current_user)

    if format.lower() == "json":

        export_data = {
            "session_id": session.id,
            "title": session.title,
            "created_at": session.created_at.isoformat(),
            "updated_at": session.updated_at.isoformat(),
            "messages": [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.created_at.isoformat()
                }
                for msg in messages
            ]
        }
        content = json.dumps(export_data, indent=2)
        media_type = "application/json"
        filename = f"chat_{session_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

    elif format.lower() == "txt":

        lines = [f"Chat Session: {session.title}", f"Created: {session.created_at}", "=" * 50, ""]
        for msg in messages:
            lines.append(f"{msg.role.upper()} ({msg.created_at}):")
            lines.append(msg.content)
            lines.append("-" * 50)
        content = "\n".join(lines)
        media_type = "text/plain"
        filename = f"chat_{session_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"

    elif format.lower() in ["md", "markdown"]:

        lines = [f"# {session.title}", f"**Created:** {session.created_at}", ""]
        for msg in messages:
            role_emoji = "👤" if msg.role == "user" else "🤖"
            lines.append(f"### {role_emoji} {msg.role.title()}")
            lines.append(f"*{msg.created_at}*")
            lines.append("")
            lines.append(msg.content)
            lines.append("")
            lines.append("---")
            lines.append("")
        content = "\n".join(lines)
        media_type = "text/markdown"
        filename = f"chat_{session_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid format. Use 'json', 'txt', or 'md'"
        )

    return Response(
        content=content,
        media_type=media_type,
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
