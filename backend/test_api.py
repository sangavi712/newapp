import urllib.request
import json
import urllib.error

BASE_URL = 'http://localhost:5000/api'

# 1. Login
login_data = json.dumps({
    'identity': 'guest@buddylearn.ai',
    'password': 'guest_password'
}).encode('utf-8')
req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        r = json.loads(response.read().decode('utf-8'))
        token = r.get('access_token')
        print("Login status: 200")
except urllib.error.HTTPError as e:
    print("Login status:", e.code)
    print(e.read().decode('utf-8'))
    exit(1)

headers = {'Authorization': f'Bearer {token}'}

# 2. Get Profile
req2 = urllib.request.Request(f"{BASE_URL}/auth/profile", headers=headers)
try:
    with urllib.request.urlopen(req2) as response:
        print("Profile status: 200")
except urllib.error.HTTPError as e:
    print("Profile status:", e.code)
    print(e.read().decode('utf-8'))

# 3. Get Dashboard
req3 = urllib.request.Request(f"{BASE_URL}/dashboard/", headers=headers)
try:
    with urllib.request.urlopen(req3) as response:
        print("Dashboard status: 200")
except urllib.error.HTTPError as e:
    print("Dashboard status:", e.code)
    print(e.read().decode('utf-8'))

# 4. Check SQLite DB directly
import sqlite3
conn = sqlite3.connect('buddylearn.db')
c = conn.cursor()
c.execute('SELECT id, email FROM users')
print("SQLite users:", c.fetchall())
conn.close()
