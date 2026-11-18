from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db

router = APIRouter()

@router.get("/")
def get_services(db: Session = Depends(get_db)):
    return db.query(models.Service).all()

@router.post("/")
def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    new_service = models.Service(**service.dict())
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service

@router.delete("/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(service)
    db.commit()
    return {"message": "Deleted"}