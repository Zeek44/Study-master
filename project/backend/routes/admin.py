from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session, func
from pydantic import BaseModel
from datetime import timedelta
from ..main import get_db, create_access_token, verify_admin, User, Document, AdminSettings
import shutil
import os

router = APIRouter()

class AdminLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    subscription_status: str

@router.post("/login")
async def admin_login(admin_data: AdminLogin):
    # Check hardcoded admin credentials
    if admin_data.email != "ssnarib@outlook.com" or admin_data.password != "Nikita214ever":
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    access_token = create_access_token(
        data={"admin": True, "sub": "admin"},
        expires_delta=timedelta(hours=8)
    )
    
    return {"token": access_token}

@router.get("/users")
async def get_all_users(db: Session = Depends(get_db), admin: bool = Depends(verify_admin)):
    users = db.query(User).all()
    result = []
    
    for user in users:
        document_count = db.query(func.count(Document.id)).filter(Document.user_id == user.id).scalar()
        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "subscription_status": user.subscription_status,
            "created_at": user.created_at.isoformat(),
            "documents_count": document_count
        })
    
    return result

@router.patch("/users/{user_id}/subscription")
async def update_user_subscription(
    user_id: str, 
    update_data: UserUpdate, 
    db: Session = Depends(get_db),
    admin: bool = Depends(verify_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.subscription_status = update_data.subscription_status
    db.commit()
    
    return {"message": f"User subscription updated to {update_data.subscription_status}"}

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str, 
    db: Session = Depends(get_db),
    admin: bool = Depends(verify_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Delete user's documents from filesystem
    documents = db.query(Document).filter(Document.user_id == user_id).all()
    for doc in documents:
        try:
            os.remove(doc.file_path)
        except:
            pass
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}

@router.get("/stats")
async def get_admin_stats(db: Session = Depends(get_db), admin: bool = Depends(verify_admin)):
    total_users = db.query(func.count(User.id)).scalar()
    premium_users = db.query(func.count(User.id)).filter(User.subscription_status == "premium").scalar()
    total_documents = db.query(func.count(Document.id)).scalar()
    
    return {
        "totalUsers": total_users,
        "premiumUsers": premium_users,
        "totalDocuments": total_documents,
        "activeToday": 142  # This would be calculated based on last activity
    }

@router.post("/upload-sound")
async def upload_ambient_sound(
    sound: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: bool = Depends(verify_admin)
):
    # Validate file type
    if not sound.content_type or not sound.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Save file
    file_path = f"uploads/sounds/ambient_{int(datetime.now().timestamp())}.{sound.filename.split('.')[-1]}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(sound.file, buffer)
    
    # Update admin settings
    settings = db.query(AdminSettings).first()
    if not settings:
        settings = AdminSettings()
        db.add(settings)
    
    settings.ambient_sound_url = f"/{file_path}"
    settings.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Ambient sound uploaded successfully", "url": settings.ambient_sound_url}

@router.get("/ambient-sound")
async def get_ambient_sound(db: Session = Depends(get_db)):
    settings = db.query(AdminSettings).first()
    if settings and settings.ambient_sound_url:
        return {"sound_url": settings.ambient_sound_url}
    return {"sound_url": None}