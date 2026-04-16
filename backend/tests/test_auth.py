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

    def test_register_opens_a_session_for_the_new_user(self):
        self.register_user()

        response = self.client.get("/api/v1/users/me")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["email"], "lucas@example.com")

    def test_register_rejects_missing_fields(self):
        response = self.client.post("/api/v1/users/register", json={})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "missing fields: username, nickname, email, password"},
        )

    def test_register_rejects_untrusted_origin(self):
        response = self.client.post(
            "/api/v1/users/register",
            json={
                "username": "Lucas",
                "nickname": "lukas",
                "email": "lucas@example.com",
                "password": "Teste123A",
            },
            headers={"Origin": "https://evil.example"},
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json(), {"error": "cross-site request blocked"})

    def test_register_rejects_weak_passwords(self):
        response = self.client.post(
            "/api/v1/users/register",
            json={
                "username": "Lucas",
                "nickname": "lukas",
                "email": "lucas@example.com",
                "password": "12345678",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.get_json(),
            {"error": "choose a less predictable password"},
        )

    def test_register_rejects_duplicate_email_after_normalization(self):
        self.register_user()

        response = self.register_user_with(
            self.client,
            username="Outro",
            nickname="outra-pessoa",
            email=" lucas@EXAMPLE.com ",
            password="Outra123A",
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
            password="Outra123A",
        )

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.get_json(), {"error": "email or nickname already in use"})

    def test_login_accepts_normalized_nickname(self):
        self.register_user()

        response = self.login_user_with(
            self.client,
            nickname="  lukas  ",
            password="Teste123A",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["user"]["nickname"], "lukas")

    def test_login_accepts_normalized_email(self):
        self.register_user()

        response = self.login_user_with(
            self.client,
            email="  LUCAS@EXAMPLE.COM  ",
            password="Teste123A",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["user"]["email"], "lucas@example.com")

    def test_login_rejects_missing_identifier(self):
        response = self.login_user_with(self.client, password="Teste123A")

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

    def test_login_rejects_untrusted_origin(self):
        self.register_user()
        self.client.post("/api/v1/users/logout")

        response = self.client.post(
            "/api/v1/users/login",
            json={
                "email": "lucas@example.com",
                "password": "Teste123A",
            },
            headers={"Origin": "https://evil.example"},
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json(), {"error": "cross-site request blocked"})

    def test_protected_routes_require_authentication(self):
        response = self.client.get("/api/v1/tasks")

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json(), {"error": "authentication required"})

    def test_mutating_routes_reject_untrusted_origin(self):
        self.register_user()

        response = self.client.post(
            "/api/v1/tasks",
            json={"title": "Ataque"},
            headers={"Origin": "https://evil.example"},
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json(), {"error": "cross-site request blocked"})

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
