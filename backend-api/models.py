from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, DateTime, JSON, func
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default="customer")

class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String)
    description = Column(Text)
    icon = Column(String)
    price = Column(String)
    featured = Column(Boolean, default=False)

class Blog(Base):
    __tablename__ = "blogs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String)
    excerpt = Column(Text)
    content = Column(Text)
    author = Column(String)
    date = Column(String)
    readTime = Column(String)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    message = Column(Text)
    date = Column(String)
    read = Column(Boolean, default=False)

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True, index=True)
    customer_email = Column(String, index=True, nullable=False)
    currency = Column(String(3), nullable=False)
    total_minor = Column(Integer, nullable=False)
    status = Column(String, default="pending", nullable=False)
    items = Column(JSON, nullable=False)
    shipping_address = Column(JSON, nullable=True)
    stripe_session_id = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)