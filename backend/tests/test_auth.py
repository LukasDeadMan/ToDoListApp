import unittest

from tests.api_case import ApiTestCase


class AuthApiTestCase(ApiTestCase):
    def test_register_normalizes_identity_fields(self):
        response = self.register_user()

        self.assertEqual(response.status_code, 201)
        self.assertEqual(
            response.get_json(),
            {
                "id": 1,
                "username": "Lucas",
                "nickname": "lukas",
                "email": "lucas@example.com",
            },
        )

    def test_register_rejects_missing_fields(self):
        response = self.client.post("/api/v1/users/register", json={})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "missing fields: username, nickname, email, password"},
        )

    def test_register_rejects_duplicate_email_after_normalization(self):
        self.register_user()

        response = self.register_user_with(
            self.client,
            username="Outro",
            nickname="outra-pessoa",
            email=" lucas@EXAMPLE.com ",
            password="abcdef",
        )

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.get_json(), {"error": "email or nickname already in use"})

    def test_register_rejects_duplicate_nickname_after_normalization(self):
        self.register_user()

        response = self.register_user_with(
            self.client,
            username="Outra Pessoa",
            nickname="  lukas  ",
            email="outra@example.com",
            password="abcdef",
        )

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.get_json(), {"error": "email or nickname already in use"})

    def test_login_accepts_normalized_nickname(self):
        self.register_user()

        response = self.login_user_with(
            self.client,
            nickname="  lukas  ",
            password="123456",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["user"]["nickname"], "lukas")

    def test_login_accepts_normalized_email(self):
        self.register_user()

        response = self.login_user_with(
            self.client,
            email="  LUCAS@EXAMPLE.COM  ",
            password="123456",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["user"]["email"], "lucas@example.com")

    def test_login_rejects_missing_identifier(self):
        response = self.login_user_with(self.client, password="123456")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "email or nickname and password are required"},
        )

    def test_login_rejects_invalid_password(self):
        self.register_user()

        response = self.login_user_with(
            self.client,
            email="lucas@example.com",
            password="senha-errada",
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json(), {"error": "invalid credentials"})

    def test_protected_routes_require_authentication(self):
        response = self.client.get("/api/v1/tasks")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json(), {"error": "authentication required"})

    def test_logout_only_accepts_post_and_returns_json_error(self):
        response = self.client.get("/api/v1/users/logout")

        self.assertEqual(response.status_code, 405)
        self.assertEqual(response.get_json()["error"], "method not allowed")

    def test_logout_invalidates_session(self):
        self.register_user()
        self.login_user()

        logout_response = self.client.post("/api/v1/users/logout")
        me_response = self.client.get("/api/v1/users/me")

        self.assertEqual(logout_response.status_code, 200)
        self.assertEqual(me_response.status_code, 401)
        self.assertEqual(me_response.get_json(), {"error": "authentication required"})


if __name__ == "__main__":
    unittest.main()
