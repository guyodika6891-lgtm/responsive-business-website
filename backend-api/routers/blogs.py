from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db

router = APIRouter()

@router.get("/")
def get_blogs(db: Session = Depends(get_db)):
    return db.query(models.Blog).all()

@router.post("/")
def create_blog(blog: schemas.BlogCreate, db: Session = Depends(get_db)):
    new_blog = models.Blog(**blog.dict())
    db.add(new_blog)
    db.commit()
    db.refresh(new_blog)
    return new_blog

@router.delete("/{blog_id}")
def delete_blog(blog_id: int, db: Session = Depends(get_db)):
    blog = db.query(models.Blog).filter(models.Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    db.delete(blog)
    db.commit()
    return {"message": "Deleted"}