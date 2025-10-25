from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, func
from ..main import get_db, get_current_user, User, Flashcard, Document
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get flashcard count
    flashcard_count = db.query(func.count(Flashcard.id)).filter(
        Flashcard.user_id == current_user.id
    ).scalar()
    
    # Get document count
    document_count = db.query(func.count(Document.id)).filter(
        Document.user_id == current_user.id
    ).scalar()
    
    # Calculate study streak (mock calculation)
    study_streak = 12  # This would be calculated based on actual study sessions
    
    # Calculate hours studied (mock calculation)
    hours_studied = 24.5  # This would be calculated from actual session data
    
    # Calculate accuracy (mock calculation)
    accuracy = 87  # This would be calculated from flashcard review data
    
    return {
        "totalFlashcards": flashcard_count,
        "studyStreak": study_streak,
        "documentsUploaded": document_count,
        "hoursStudied": hours_studied,
        "weeklyGoal": 10,
        "accuracy": accuracy
    }