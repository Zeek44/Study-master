from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from sqlalchemy.orm import Session
from ..main import get_db, get_current_user, User, Document
import shutil
import os
from datetime import datetime

router = APIRouter()

@router.get("/")
async def get_user_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    documents = db.query(Document).filter(Document.user_id == current_user.id).all()
    return [{
        "id": doc.id,
        "name": doc.filename,
        "size": f"{doc.file_size / 1024 / 1024:.1f} MB" if doc.file_size else "Unknown",
        "uploadDate": doc.upload_date.strftime("%Y-%m-%d"),
        "type": doc.filename.split('.')[-1].lower(),
        "processed": doc.processed
    } for doc in documents]

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check upload limits for free users
    if current_user.subscription_status == "free":
        document_count = db.query(Document).filter(Document.user_id == current_user.id).count()
        if document_count >= 4:
            raise HTTPException(status_code=403, detail="Upload limit reached. Upgrade to Premium.")
    
    # Validate file type
    allowed_types = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    # Save file
    file_path = f"uploads/documents/{current_user.id}_{int(datetime.now().timestamp())}_{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create document record
    new_document = Document(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_size=os.path.getsize(file_path)
    )
    
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    
    # Simulate processing (in real implementation, this would trigger document analysis)
    # For now, we'll mark as processed after a delay
    
    return {"message": "Document uploaded successfully", "document_id": new_document.id}

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete file from filesystem
    try:
        os.remove(document.file_path)
    except:
        pass
    
    # Delete from database
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"}