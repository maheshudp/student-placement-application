from database import SessionLocal
import crud, schemas

db = SessionLocal()
try:
    user = schemas.UserCreate(email='testdb@test.com', password='password123', role='ADMIN')
    crud.create_user(db, user)
    print('Success')
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    db.close()
