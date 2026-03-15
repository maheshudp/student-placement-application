import requests
import os

BASE_URL = "http://127.0.0.1:8002"

def main():
    print("--- Testing Phase 2 Endpoints ---")
    
    # 1. Login to get token
    login_data = {
        "username": "admin@university.edu",
        "password": "hashed_password123"
    }
    print("1. Logging in as admin...")
    response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.status_code} {response.text}")
        print("Note: If login fails, test users might not be seeded. Attempting registration...")
        # Try registering an admin user first
        reg_data = {
            "email": "admin@university.edu",
            "password": "hashed_password123",
            "role": "ADMIN"
        }
        requests.post(f"{BASE_URL}/register", json=reg_data)
        response = requests.post(f"{BASE_URL}/auth/login", data=login_data)
        if response.status_code != 200:
            print("Failed to register/login test user.")
            return

    token = response.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")

    # Get my own user id for linkage
    me_resp = requests.get(f"{BASE_URL}/users/me", headers=headers)
    user_id = me_resp.json().get("id")

    # 2. Upload file
    print("2. Testing Offer Letter File Upload...")
    # Create a dummy pdf file
    with open("dummy_offer.pdf", "wb") as f:
        f.write(b"Mock offer letter content")
    
    with open("dummy_offer.pdf", "rb") as f:
        upload_resp = requests.post(
            f"{BASE_URL}/upload/", 
            headers=headers,
            files={"file": f}
        )
    
    if upload_resp.status_code == 200:
        print(f"Upload successful: {upload_resp.json()}")
        offer_url = upload_resp.json().get("url")
    else:
        print(f"Upload failed: {upload_resp.status_code} {upload_resp.text}")
        return

    # 3. Create a student with placements and alumni data
    print("3. Testing Student Creation with Placements/Alumni...")
    student_payload = {
        "user_id": user_id,
        "first_name": "John",
        "last_name": "Doe",
        "phone_number": "1234567890",
        "date_of_birth": "2000-01-01",
        "is_alumni": True,
        "placements": [
            {
                "company_name": "Tech Corp",
                "job_role": "Software Engineer",
                "package": 12.5,
                "placement_date": "2024-05-01",
                "offer_letter_url": offer_url
            }
        ],
        "alumni_details": {
            "passing_year": 2024,
            "current_status": "Employed"
        }
    }

    student_response = requests.post(f"{BASE_URL}/students/", json=student_payload, headers=headers)
    if student_response.status_code == 200:
        print("Student with phase 2 details created successfully.")
        student_id = student_response.json().get("id")
    else:
        print(f"Student creation failed: {student_response.status_code} {student_response.text}")
        return

    # 4. Test Reports Endpoint
    print("4. Testing /reports/ Aggregate Endpoint...")
    reports_resp = requests.get(f"{BASE_URL}/reports/", headers=headers)
    if reports_resp.status_code == 200:
        print("Reports aggregate returned successfully:")
        print(reports_resp.json())
    else:
        print(f"Reports failed: {reports_resp.status_code} {reports_resp.text}")

    print("--- Phase 2 Test Complete ---")

if __name__ == "__main__":
    main()
