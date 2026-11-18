from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db

router = APIRouter()

@router.post("/")
def create_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    new_msg = models.Message(**message.dict(), date="2026-11-08", read=False)
    db.add(new_msg)
    db.commit()
    return {"message": "Message sent"}

@router.get("/")
def get_messages(db: Session = Depends(get_db)):
    # In a real app, you would protect this route so only Admins can see it!
    return db.query(models.Message).order_by(models.Message.id.desc()).all()

@router.patch("/{msg_id}")
def toggle_read(msg_id: int, db: Session = Depends(get_db)):
    msg = db.query(models.Message).filter(models.Message.id == msg_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.read = not msg.read
    db.commit()
    return msg

@router.delete("/{msg_id}")
def delete_message(msg_id: int, db: Session = Depends(get_db)):
    msg = db.query(models.Message).filter(models.Message.id == msg_id).first()
    if msg:
        db.delete(msg)
        db.commit()
    return {"message": "Deleted"}