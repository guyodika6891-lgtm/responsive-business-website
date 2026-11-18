from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import services, auth, messages, blogs, users, checkout

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Business Website API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://business-frontend-zbs6.onrender.com" # <-- Put your REAL frontend URL here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(services.router, prefix="/api/services", tags=["Services"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(messages.router, prefix="/api/messages", tags=["Messages"])
app.include_router(blogs.router, prefix="/api/blogs", tags=["Blogs"]) # <-- Added
app.include_router(users.router, prefix="/api/users", tags=["Users"]) # <-- Added
app.include_router(checkout.router, prefix="/api/checkout", tags=["Checkout"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}
