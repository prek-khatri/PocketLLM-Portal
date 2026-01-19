from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.db.database import get_db
from app.api.models.schemas import (
    AdminUserListResponse,
    AdminUserUpdate,
    MessageResponse,
    UserResponse
)
from app.services.auth_service import AuthService, security
from app.db.models import User, ChatSession

router = APIRouter(prefix="/admin", tags=["Admin"])

def get_current_admin_user(db: Session = Depends(get_db), credentials = Depends(security)) -> User:

    user = AuthService.get_current_user(credentials, db)
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user

@router.get("/users", response_model=List[AdminUserListResponse])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user),
    limit: int = 100,
    offset: int = 0
):

    users = db.query(
        User,
        func.count(ChatSession.id).label('session_count')
    ).outerjoin(ChatSession).group_by(User.id).limit(limit).offset(offset).all()

    return [
        AdminUserListResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            is_active=user.is_active,
            is_admin=user.is_admin,
            created_at=user.created_at,
            session_count=session_count
        )
        for user, session_count in users
    ]

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user_by_id(
    user_id: int,
    update_data: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user_id == current_user.id and update_data.is_admin is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove your own admin privileges"
        )

    if user_id == current_user.id and update_data.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )

    if update_data.is_active is not None:
        user.is_active = update_data.is_active

    if update_data.is_admin is not None:
        user.is_admin = update_data.is_admin

    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):

    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    db.delete(user)
    db.commit()
    return MessageResponse(message="User deleted successfully")

@router.get("/stats")
async def get_system_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):

    total_users = db.query(func.count(User.id)).scalar()
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    total_sessions = db.query(func.count(ChatSession.id)).scalar()
    admin_count = db.query(func.count(User.id)).filter(User.is_admin == True).scalar()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": total_users - active_users,
        "admin_users": admin_count,
        "total_chat_sessions": total_sessions
    }
