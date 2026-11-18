import models
from database import SessionLocal, engine
import auth

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()

admin = db.query(models.User).filter(models.User.email == "admin@example.com").first()

if not admin:
    hashed_pw = auth.hash_password("admin123")
    new_admin = models.User(
        name="Admin",
        email="admin@example.com",
        password=hashed_pw,
        role="admin"
    )
    db.add(new_admin)
    db.commit()
    print("✅ Admin user created: admin@example.com / admin123")
else:
    # Force reset the password just in case
    admin.password = auth.hash_password("admin123")
    db.commit()
    print("🔄 Admin password reset to admin123")

db.close()