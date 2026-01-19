from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):

    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):

    username: str
    password: str

class UserUpdate(BaseModel):

    username: Optional[str] = Field(default=None, min_length=3, max_length=50)
    email: Optional[EmailStr] = Field(default=None)
    current_password: Optional[str] = Field(default=None)
    new_password: Optional[str] = Field(default=None, min_length=6)

    class Config:
        populate_by_name = True

class UserResponse(BaseModel):

    id: int
    username: str
    email: str
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):

    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ChatMessageCreate(BaseModel):

    content: str = Field(..., min_length=1)

class ChatMessageResponse(BaseModel):

    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True

class InferenceRequest(BaseModel):

    prompt: str = Field(..., min_length=1)
    session_id: Optional[int] = None
    max_tokens: Optional[int] = 512
    temperature: Optional[float] = 0.7
    top_p: Optional[float] = 0.95

class InferenceResponse(BaseModel):

    response: str
    session_id: int
    user_message: ChatMessageResponse
    assistant_message: ChatMessageResponse

class ChatSessionCreate(BaseModel):

    title: Optional[str] = "New Chat"

class ChatSessionResponse(BaseModel):

    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True

class ChatSessionListResponse(BaseModel):

    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int

    class Config:
        from_attributes = True

class ChatSessionUpdate(BaseModel):

    title: str = Field(..., min_length=1, max_length=200)

class MessageResponse(BaseModel):

    message: str
    success: bool = True

class ErrorResponse(BaseModel):

    detail: str
    success: bool = False

class AdminUserListResponse(BaseModel):

    id: int
    username: str
    email: str
    is_active: bool
    is_admin: bool
    created_at: datetime
    session_count: int

    class Config:
        from_attributes = True

class AdminUserUpdate(BaseModel):

    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None
