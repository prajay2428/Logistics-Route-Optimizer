from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient, APITestCase


class SessionAuthenticationTests(APITestCase):
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)
        self.user = get_user_model().objects.create_user(
            username="session-user",
            email="session@example.com",
            password="test-password-123",
        )

    def get_csrf_token(self):
        response = self.client.get("/api/accounts/csrf/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("csrftoken", response.cookies)
        return response.data["csrfToken"]

    def test_login_restores_user_and_logout_ends_session(self):
        csrf_token = self.get_csrf_token()
        login_response = self.client.post(
            "/api/accounts/login/",
            {"username": self.user.username, "password": "test-password-123"},
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertEqual(login_response.data["user"]["username"], self.user.username)
        self.assertIn("csrfToken", login_response.data)
        self.assertNotIn("access", login_response.data)
        self.assertNotIn("refresh", login_response.data)
        self.assertIn(settings.SESSION_COOKIE_NAME, self.client.cookies)

        me_response = self.client.get("/api/accounts/me/")
        self.assertEqual(me_response.status_code, status.HTTP_200_OK)
        self.assertEqual(me_response.data["id"], self.user.id)

        logout_response = self.client.post(
            "/api/accounts/logout/",
            format="json",
            HTTP_X_CSRFTOKEN=login_response.data["csrfToken"],
        )
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)

        logged_out_response = self.client.get("/api/accounts/me/")
        self.assertEqual(logged_out_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_login_rejects_a_request_without_csrf(self):
        response = self.client.post(
            "/api/accounts/login/",
            {"username": self.user.username, "password": "test-password-123"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_registration_accepts_a_valid_csrf_token(self):
        csrf_token = self.get_csrf_token()
        response = self.client.post(
            "/api/accounts/register/",
            {
                "username": "new-user",
                "email": "new@example.com",
                "password": "another-password-123",
                "password2": "another-password-123",
            },
            format="json",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(get_user_model().objects.filter(username="new-user").exists())
