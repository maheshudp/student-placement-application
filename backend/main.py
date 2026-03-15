from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from jose import JWTError, jwt
import os
import shutil

import models, schemas, crud, auth
from database import SessionLocal, engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Student Information System API")

# Setup uploads directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.Role.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

@app.get("/")
def read_root():
    return {"message": "Welcome to the Student API. Please visit /docs"}

@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/auth/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"email": user.email, "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.get("/students/me", response_model=schemas.Student)
def read_own_student_profile(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    student = crud.get_student_by_user_id(db, user_id=current_user.id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student

# Protected Routes - Admin only for raw list
@app.get("/students/", response_model=List[schemas.Student])
def read_students(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_admin)):
    students = crud.get_students(db, skip=skip, limit=limit)
    return students

@app.post("/students/", response_model=schemas.Student)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # If not admin, you can only create your own profile
    if current_user.role != models.Role.ADMIN and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Can only create own profile")
    
    db_student = crud.get_student_by_user_id(db, user_id=student.user_id)
    if db_student:
        raise HTTPException(status_code=400, detail="Profile already exists for this user")
    return crud.create_student(db=db, student=student)

@app.get("/students/{student_id}", response_model=schemas.Student)
def read_student(student_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_student = crud.get_student(db, student_id=student_id)
    if db_student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    # Only admin or the student themselves can view
    if current_user.role != models.Role.ADMIN and db_student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return db_student

@app.put("/students/{student_id}", response_model=schemas.Student)
def update_student(student_id: int, student: schemas.StudentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_student = crud.get_student(db, student_id=student_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    if current_user.role != models.Role.ADMIN and db_student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.update_student(db, student_id, student)

@app.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_admin)):
    success = crud.delete_student(db, student_id)
    if not success:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"}

# --- Uploads endpoint ---
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    # Ensure filename uniqueness in a real app, here we just save it directly
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "url": f"/uploads/{file.filename}"}

# --- Reports endpoint ---
@app.get("/reports/")
def get_reports(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_admin)):
    total_students = db.query(models.Student).count()
    total_placements = db.query(models.Placement).count()
    placed_students = db.query(models.Placement.student_id).distinct().count()
    
    # Calculate average package
    placements = db.query(models.Placement).all()
    avg_package = sum([p.package for p in placements if p.package]) / len(placements) if placements else 0.0

    total_alumni = db.query(models.AlumniDetails).count()

    return {
        "total_students": total_students,
        "total_placements": total_placements,
        "placed_students": placed_students,
        "average_package_lpa": round(avg_package, 2),
        "total_alumni": total_alumni
    }
