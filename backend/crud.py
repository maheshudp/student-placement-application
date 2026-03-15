from sqlalchemy.orm import Session
import models, schemas, auth

# --- User CRUD ---
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password, role=user.role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Student CRUD ---
def get_student(db: Session, student_id: int):
    return db.query(models.Student).filter(models.Student.id == student_id).first()

def get_student_by_user_id(db: Session, user_id: int):
    return db.query(models.Student).filter(models.Student.user_id == user_id).first()

def get_students(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Student).offset(skip).limit(limit).all()

def create_student(db: Session, student: schemas.StudentCreate):
    db_student = models.Student(
        user_id=student.user_id,
        first_name=student.first_name,
        last_name=student.last_name,
        phone_number=student.phone_number,
        date_of_birth=student.date_of_birth,
        is_alumni=student.is_alumni
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)

    # Add enrollments
    for enrollment in student.enrollments:
        db_enrollment = models.CourseEnrollment(**enrollment.model_dump(), student_id=db_student.id)
        db.add(db_enrollment)

    # Add higher education
    for edu in student.higher_education:
        db_edu = models.HigherEducation(**edu.model_dump(), student_id=db_student.id)
        db.add(db_edu)

    # Add placements
    if hasattr(student, 'placements') and student.placements:
        for placement in student.placements:
            db_placement = models.Placement(**placement.model_dump(), student_id=db_student.id)
            db.add(db_placement)

    # Add alumni details
    if hasattr(student, 'alumni_details') and student.alumni_details:
        db_alumni = models.AlumniDetails(**student.alumni_details.model_dump(), student_id=db_student.id)
        db.add(db_alumni)

    if student.enrollments or student.higher_education or (hasattr(student, 'placements') and student.placements) or (hasattr(student, 'alumni_details') and student.alumni_details):
        db.commit()
        db.refresh(db_student)

    return db_student

def delete_student(db: Session, student_id: int):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if student:
        db.delete(student)
        db.commit()
        return True
    return False

def update_student(db: Session, student_id: int, student: schemas.StudentCreate):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not db_student:
        return None
    
    db_student.first_name = student.first_name
    db_student.last_name = student.last_name
    db_student.phone_number = student.phone_number
    db_student.date_of_birth = student.date_of_birth
    db_student.is_alumni = student.is_alumni

    db.query(models.CourseEnrollment).filter(models.CourseEnrollment.student_id == student_id).delete()
    db.query(models.HigherEducation).filter(models.HigherEducation.student_id == student_id).delete()
    db.query(models.Placement).filter(models.Placement.student_id == student_id).delete()
    db.query(models.AlumniDetails).filter(models.AlumniDetails.student_id == student_id).delete()
    
    for enrollment in student.enrollments:
        db_enrollment = models.CourseEnrollment(**enrollment.model_dump(), student_id=student_id)
        db.add(db_enrollment)

    for edu in student.higher_education:
        db_edu = models.HigherEducation(**edu.model_dump(), student_id=student_id)
        db.add(db_edu)

    if hasattr(student, 'placements') and student.placements:
        for placement in student.placements:
            db_placement = models.Placement(**placement.model_dump(), student_id=student_id)
            db.add(db_placement)

    if hasattr(student, 'alumni_details') and student.alumni_details:
        db_alumni = models.AlumniDetails(**student.alumni_details.model_dump(), student_id=student_id)
        db.add(db_alumni)

    db.commit()
    db.refresh(db_student)
    return db_student
