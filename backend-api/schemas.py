from pydantic import BaseModel
from typing import Optional, Literal
from pydantic import BaseModel, Field

class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class ServiceCreate(BaseModel):
    title: str
    category: str
    description: str
    icon: str
    price: str
    featured: Optional[bool] = False

class BlogCreate(BaseModel):
    title: str
    category: str
    excerpt: str
    content: str
    author: str
    date: str
    readTime: str

class MessageCreate(BaseModel):
    name: str
    email: str
    message: str

class CheckoutItem(BaseModel):
    catalogType: Literal["service", "product"]
    id: str = Field(min_length=1, max_length=100)
    quantity: int = Field(strict=True, ge=1, le=10)

class CheckoutSessionCreate(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    currency: Literal["USD", "EUR", "GBP", "OMR"]
    items: list[CheckoutItem] = Field(min_length=1, max_length=30)