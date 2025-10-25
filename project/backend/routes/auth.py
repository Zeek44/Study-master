from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from ..main import get_db, verify_password, get_password_hash, create_access_token, User

router = APIRouter()

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    subscription_status: str
    created_at: str

@router.post("/signup")
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": new_user.id},
        expires_delta=timedelta(days=30)
    )
    
    return {
        "token": access_token,
        "user": UserResponse(
            id=new_user.id,
            name=new_user.name,
            email=new_user.email,
            subscription_status=new_user.subscription_status,
            created_at=new_user.created_at.isoformat()
        )
    }

@router.post("/login")
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(days=30)
    )
    
    return {
        "token": access_token,
        "user": UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            subscription_status=user.subscription_status,
            created_at=user.created_at.isoformat()
        )
    }

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        subscription_status=current_user.subscription_status,
        created_at=current_user.created_at.isoformat()
    )