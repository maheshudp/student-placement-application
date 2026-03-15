# student-placement-application

A comprehensive student management system with authentication, placement tracking, and role-based access.

### Features
- JWT Role-based Authentication (Admin/Student)
- Course Enrollments & Higher Education Tracking
- Placement & Alumni Management
- Admin Dashboard with Analytical Reports
- FastAPI Backend (PostgreSQL) 
- React Frontend (Vite)

### How to Run
#### Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
