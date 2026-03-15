from pydantic import BaseModel, EmailStr
from datetime import date
from typing import List, Optional

# --- User & Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "STUDENT"

class User(BaseModel):
    id: int
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# --- Higher Education Schemas ---
class HigherEducationBase(BaseModel):
    degree_name: str
    institution: str
    passing_year: int
    percentage_or_cgpa: float

class HigherEducationCreate(HigherEducationBase):
    pass

class HigherEducation(HigherEducationBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

# --- Course Enrollment Schemas ---
class CourseEnrollmentBase(BaseModel):
    course_name: str
    enrollment_date: date
    status: Optional[str] = "Active"

class CourseEnrollmentCreate(CourseEnrollmentBase):
    pass

class CourseEnrollment(CourseEnrollmentBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

# --- Placement Schemas ---
class PlacementBase(BaseModel):
    company_name: str
    job_role: str
    package: float
    placement_date: date
    offer_letter_url: Optional[str] = None

class PlacementCreate(PlacementBase):
    pass

class Placement(PlacementBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

# --- Alumni Details Schemas ---
class AlumniDetailsBase(BaseModel):
    current_status: str
    passing_year: int

class AlumniDetailsCreate(AlumniDetailsBase):
    pass

class AlumniDetails(AlumniDetailsBase):
    id: int
    student_id: int

    class Config:
        from_attributes = True

# --- Student Schemas ---
class StudentBase(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    date_of_birth: date
    is_alumni: Optional[bool] = False

class StudentCreate(StudentBase):
    user_id: int
    enrollments: Optional[List[CourseEnrollmentCreate]] = []
    higher_education: Optional[List[HigherEducationCreate]] = []
    placements: Optional[List[PlacementCreate]] = []
    alumni_details: Optional[AlumniDetailsCreate] = None

class Student(StudentBase):
    id: int
    user_id: int
    user: Optional[User] = None
    enrollments: List[CourseEnrollment] = []
    higher_education: List[HigherEducation] = []
    placements: List[Placement] = []
    alumni_details: Optional[AlumniDetails] = None

    class Config:
        from_attributes = True
