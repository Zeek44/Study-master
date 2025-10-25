from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..main import get_db, get_current_user, User, Flashcard
from datetime import datetime, timedelta

router = APIRouter()

class FlashcardCreate(BaseModel):
    front: str
    back: str
    difficulty: str = "medium"

class FlashcardUpdate(BaseModel):
    front: str
    back: str
    difficulty: str

@router.get("/")
async def get_user_flashcards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    flashcards = db.query(Flashcard).filter(Flashcard.user_id == current_user.id).all()
    return [{
        "id": card.id,
        "front": card.front,
        "back": card.back,
        "difficulty": card.difficulty,
        "nextReview": card.next_review.isoformat(),
        "reviewCount": card.review_count
    } for card in flashcards]

@router.post("/")
async def create_flashcard(
    card_data: FlashcardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_card = Flashcard(
        user_id=current_user.id,
        front=card_data.front,
        back=card_data.back,
        difficulty=card_data.difficulty
    )
    
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    
    return {"message": "Flashcard created successfully", "card_id": new_card.id}

@router.patch("/{card_id}/review")
async def review_flashcard(
    card_id: str,
    difficulty: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    card = db.query(Flashcard).filter(
        Flashcard.id == card_id,
        Flashcard.user_id == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    # Spaced repetition logic
    intervals = {
        "easy": timedelta(days=4),
        "medium": timedelta(days=2),
        "hard": timedelta(hours=10)
    }
    
    card.difficulty = difficulty
    card.review_count += 1
    card.next_review = datetime.utcnow() + intervals.get(difficulty, timedelta(days=1))
    
    db.commit()
    
    return {"message": "Flashcard reviewed successfully"}

@router.delete("/{card_id}")
async def delete_flashcard(
    card_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    card = db.query(Flashcard).filter(
        Flashcard.id == card_id,
        Flashcard.user_id == current_user.id
    ).first()
    
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    
    db.delete(card)
    db.commit()
    
    return {"message": "Flashcard deleted successfully"}