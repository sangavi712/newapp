import unittest
import json
# pyrefly: ignore [missing-import]
from app import create_app
# pyrefly: ignore [missing-import]
from app.extensions import db
# pyrefly: ignore [missing-import]
from app.models import User

class AuthIntegrationTestCase(unittest.TestCase):
    def setUp(self):
        # Create app and use the test client
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['JWT_SECRET_KEY'] = 'test-secret-key-123'
        self.client = self.app.test_client()
        
        # Create application context
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # We run the tests in the local SQLite database context
        # Clean up any existing test users triggers cascade cleanly
        users = User.query.filter((User.username == 'testuser') | (User.email == 'testuser@example.com') | (User.phone == '+19999999999') | (User.username == 'legacyuser') | (User.email == 'legacy@example.com')).all()
        for u in users:
            db.session.delete(u)
        db.session.commit()

    def tearDown(self):
        # Clean up test users triggers cascade cleanly
        users = User.query.filter((User.username == 'testuser') | (User.email == 'testuser@example.com') | (User.phone == '+19999999999') | (User.username == 'legacyuser') | (User.email == 'legacy@example.com')).all()
        for u in users:
            db.session.delete(u)
        db.session.commit()
        self.app_context.pop()

    def test_registration_and_login_flow(self):
        # 1. Register user
        reg_payload = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'phone': '+19999999999',
            'password': 'testpassword123',
            'age_group': 'Young Adults'
        }
        res_reg = self.client.post('/api/auth/register', 
                                   data=json.dumps(reg_payload), 
                                   content_type='application/json')
        self.assertEqual(res_reg.status_code, 201)
        self.assertIn('User registered successfully', res_reg.get_json()['message'])
        
        # 2. Login with Email
        login_email_payload = {
            'email': 'testuser@example.com',
            'password': 'testpassword123'
        }
        res_login_email = self.client.post('/api/auth/login', 
                                           data=json.dumps(login_email_payload), 
                                           content_type='application/json')
        self.assertEqual(res_login_email.status_code, 200)
        login_data = res_login_email.get_json()
        self.assertIn('access_token', login_data)
        self.assertEqual(login_data['user']['username'], 'testuser')
        
        token = login_data['access_token']
        
        # 3. Login with Phone
        login_phone_payload = {
            'email': '+19999999999',  # The identity field is sent as email in post payload
            'password': 'testpassword123'
        }
        res_login_phone = self.client.post('/api/auth/login', 
                                           data=json.dumps(login_phone_payload), 
                                           content_type='application/json')
        self.assertEqual(res_login_phone.status_code, 200)
        self.assertIn('access_token', res_login_phone.get_json())
        
        # 4. Fetch Profile using the JWT token
        headers = {
            'Authorization': f'Bearer {token}'
        }
        res_profile = self.client.get('/api/auth/profile', headers=headers)
        self.assertEqual(res_profile.status_code, 200)
        profile_data = res_profile.get_json()
        self.assertEqual(profile_data['username'], 'testuser')
        self.assertEqual(profile_data['phone'], '+19999999999')
        self.assertEqual(profile_data['profile']['age_group'], 'Young Adults')
        
        # 5. Forgot Password OTP generation
        forgot_payload = {
            'identity': 'testuser@example.com'
        }
        res_forgot = self.client.post('/api/auth/forgot-password', 
                                      data=json.dumps(forgot_payload), 
                                      content_type='application/json')
        self.assertEqual(res_forgot.status_code, 200)
        forgot_data = res_forgot.get_json()
        self.assertIn('otp_debug', forgot_data)
        otp = forgot_data['otp_debug']
        
        # 6. Reset Password with generated OTP
        reset_payload = {
            'identity': 'testuser@example.com',
            'otp': otp,
            'new_password': 'newsecretpassword987'
        }
        res_reset = self.client.post('/api/auth/reset-password', 
                                     data=json.dumps(reset_payload), 
                                     content_type='application/json')
        self.assertEqual(res_reset.status_code, 200)
        self.assertIn('Password has been reset successfully', res_reset.get_json()['message'])
        
        # 7. Login with new password
        login_new_payload = {
            'email': 'testuser@example.com',
            'password': 'newsecretpassword987'
        }
        res_login_new = self.client.post('/api/auth/login', 
                                         data=json.dumps(login_new_payload), 
                                         content_type='application/json')
        self.assertEqual(res_login_new.status_code, 200)
        self.assertIn('access_token', res_login_new.get_json())

        # 8. Create a legacy user with Werkzeug security hash
        from werkzeug.security import generate_password_hash
        legacy_hash = generate_password_hash('legacysecret123')
        legacy_user = User(username='legacyuser', email='legacy@example.com', password_hash=legacy_hash)
        db.session.add(legacy_user)
        db.session.commit()
        
        # Log in with legacy user (should succeed via fallback!)
        login_legacy_payload = {
            'email': 'legacy@example.com',
            'password': 'legacysecret123'
        }
        res_login_legacy = self.client.post('/api/auth/login', 
                                            data=json.dumps(login_legacy_payload), 
                                            content_type='application/json')
        self.assertEqual(res_login_legacy.status_code, 200)
        self.assertIn('access_token', res_login_legacy.get_json())

if __name__ == '__main__':
    unittest.main()
