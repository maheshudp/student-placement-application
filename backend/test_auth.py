import requests

BASE_URL = "http://127.0.0.1:8002"

print("1. Testing Admin Registration...")
r = requests.post(f"{BASE_URL}/register", json={
    "email": "admin3@test.com",
    "password": "password123",
    "role": "ADMIN"
})
print("Register Admin:", r.status_code, r.text)

print("\n2. Testing Admin Login...")
r = requests.post(f"{BASE_URL}/auth/login", data={
    "username": "admin3@test.com",
    "password": "password123"
})
print("Login Admin:", r.status_code, r.text)
admin_token = r.json().get("access_token") if r.status_code == 200 else None

print("\n3. Testing Student Registration...")
r = requests.post(f"{BASE_URL}/register", json={
    "email": "student3@test.com",
    "password": "password123",
    "role": "STUDENT"
})
print("Register Student:", r.status_code, r.text)
student_id = r.json().get("id") if r.status_code == 200 else None

if student_id:
    print("\n4. Testing Student Login...")
    r = requests.post(f"{BASE_URL}/auth/login", data={
        "username": "student3@test.com",
        "password": "password123"
    })
    print("Login Student:", r.status_code, r.text)
    student_token = r.json().get("access_token") if r.status_code == 200 else None

    print("\n5. Student Profile Creation (Authorized)...")
    r = requests.post(f"{BASE_URL}/students/", json={
        "user_id": student_id,
        "first_name": "Test",
        "last_name": "Student",
        "phone_number": "1234567890",
        "date_of_birth": "2000-01-01",
        "enrollments": [],
        "higher_education": []
    }, headers={"Authorization": f"Bearer {student_token}"})
    print("Create Profile:", r.status_code, r.text)

