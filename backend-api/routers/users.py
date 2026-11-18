from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models
from database import get_db

router = APIRouter()

@router.get("/")
def get_users(db: Session = Depends(get_db)):
    # In a real app, protect this route so only admins can see it!
    users = db.query(models.User).all()
    # Do not send passwords back to the frontend
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role} for u in users]