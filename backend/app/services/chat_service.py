from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.models import User, ChatSession, ChatMessage
from app.api.models.schemas import ChatSessionCreate, InferenceRequest
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import HTTPException, status

class ChatService:

    @staticmethod
    def create_session(db: Session, user: User, session_data: ChatSessionCreate) -> ChatSession:

        session = ChatSession(
            user_id=user.id,
            title=session_data.title or "New Chat"
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def get_session(db: Session, session_id: int, user: User) -> Optional[ChatSession]:

        session = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user.id
        ).first()
        return session

    @staticmethod
    def get_user_sessions(db: Session, user: User, limit: int = 100) -> List[dict]:

        sessions = db.query(
            ChatSession,
            func.count(ChatMessage.id).label('message_count')
        ).outerjoin(
            ChatMessage, ChatSession.id == ChatMessage.session_id
        ).filter(
            ChatSession.user_id == user.id
        ).group_by(ChatSession.id).order_by(
            ChatSession.updated_at.desc()
        ).limit(limit).all()

        return [
            {
                "id": session.id,
                "title": session.title,
                "created_at": session.created_at,
                "updated_at": session.updated_at,
                "message_count": message_count
            }
            for session, message_count in sessions
        ]

    @staticmethod
    def delete_session(db: Session, session_id: int, user: User) -> bool:

        session = ChatService.get_session(db, session_id, user)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        db.delete(session)
        db.commit()
        return True

    @staticmethod
    def add_message(
        db: Session,
        session_id: int,
        role: str,
        content: str
    ) -> ChatMessage:

        message = ChatMessage(
            session_id=session_id,
            role=role,
            content=content
        )
        db.add(message)
        db.commit()
        db.refresh(message)

        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if session:
            session.updated_at = datetime.utcnow()
            db.commit()

        return message

    @staticmethod
    def get_session_messages(db: Session, session_id: int, user: User) -> List[ChatMessage]:

        session = ChatService.get_session(db, session_id, user)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.created_at.asc()).all()

        return messages

    @staticmethod
    def get_recent_messages(db: Session, session_id: int, limit: int = 10) -> List[ChatMessage]:

        messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(
            ChatMessage.created_at.desc()
        ).limit(limit).all()

        return list(reversed(messages))

    @staticmethod
    def update_session_title(db: Session, session_id: int, title: str) -> ChatSession:

        session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if session:
            session.title = title
            session.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(session)
        return session

    @staticmethod
    def is_first_message_in_session(db: Session, session_id: int) -> bool:

        message_count = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).count()
        return message_count == 2

    @staticmethod
    def delete_messages_from(db: Session, session_id: int, message_id: int, user: User) -> int:
        """Delete a message and all messages after it in the session."""
        session = ChatService.get_session(db, session_id, user)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        # Get the message to find its created_at timestamp
        target_message = db.query(ChatMessage).filter(
            ChatMessage.id == message_id,
            ChatMessage.session_id == session_id
        ).first()

        if not target_message:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found"
            )

        # Delete the target message and all messages after it
        deleted_count = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id,
            ChatMessage.created_at >= target_message.created_at
        ).delete(synchronize_session=False)

        db.commit()
        return deleted_count

    @staticmethod
    def cleanup_old_sessions(db: Session, retention_days: int = 60):

        cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
        old_sessions = db.query(ChatSession).filter(
            ChatSession.updated_at < cutoff_date
        ).all()

        for session in old_sessions:
            db.delete(session)

        db.commit()
        return len(old_sessions)
