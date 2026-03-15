from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float, Enum, Boolean
from sqlalchemy.orm import relationship
from database import Base
import enum

class Role(str, enum.Enum):
    ADMIN = "ADMIN"
    STUDENT = "STUDENT"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(Role), default=Role.STUDENT)

    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    phone_number = Column(String)
    date_of_birth = Column(Date)
    is_alumni = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="student_profile")
    enrollments = relationship("CourseEnrollment", back_populates="student", cascade="all, delete-orphan")
    higher_education = relationship("HigherEducation", back_populates="student", cascade="all, delete-orphan")
    placements = relationship("Placement", back_populates="student", cascade="all, delete-orphan")
    alumni_details = relationship("AlumniDetails", back_populates="student", uselist=False, cascade="all, delete-orphan")


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    course_name = Column(String, index=True) # e.g., BCA, BBA, BCOM
    enrollment_date = Column(Date)
    status = Column(String, default="Active")

    student = relationship("Student", back_populates="enrollments")


class HigherEducation(Base):
    __tablename__ = "higher_education"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    degree_name = Column(String)
    institution = Column(String)
    passing_year = Column(Integer)
    percentage_or_cgpa = Column(Float)

    student = relationship("Student", back_populates="higher_education")


class Placement(Base):
    __tablename__ = "placements"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    company_name = Column(String, index=True)
    job_role = Column(String)
    package = Column(Float) # LPA
    placement_date = Column(Date)
    offer_letter_url = Column(String, nullable=True) # Will point to local file path

    student = relationship("Student", back_populates="placements")


class AlumniDetails(Base):
    __tablename__ = "alumni_details"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True)
    current_status = Column(String) # e.g., "Working", "Higher Studies", "Looking for Job"
    passing_year = Column(Integer)
    
    student = relationship("Student", back_populates="alumni_details")
