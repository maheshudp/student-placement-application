from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
try:
    response = client.post('/register', json={
        'email': 'admin2@test.com',
        'password': 'password123',
        'role': 'ADMIN'
    })
    print(response.status_code, response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
