from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.models.schemas import UserCreate, UserLogin, Token, UserResponse, MessageResponse, UserUpdate
from app.services.auth_service import AuthService, security
from app.db.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:

    return AuthService.get_current_user(credentials, db)

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):

    user = AuthService.create_user(db, user_data)

    login_data = UserLogin(username=user_data.username, password=user_data.password)
    token_data = AuthService.login(db, login_data)

    return token_data

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):

    token_data = AuthService.login(db, login_data)
    return token_data

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):

    return current_user

@router.put("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    updated_user = AuthService.update_user(db, current_user, update_data)
    return updated_user
