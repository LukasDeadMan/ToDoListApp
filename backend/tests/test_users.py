import unittest

from tests.api_case import ApiTestCase
from app.models import Task, User


class UsersApiTestCase(ApiTestCase):
    def test_me_returns_authenticated_user(self):
        self.register_user()
        self.login_user()

        response = self.client.get("/api/v1/users/me")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json(),
            {
                "id": 1,
                "username": "Lucas",
                "nickname": "lukas",
                "email": "lucas@example.com",
            },
        )

    def test_get_user_forbids_access_to_another_user(self):
        first_client = self.client
        second_client = self.make_client()

        self.register_and_login(
            first_client,
            username="Lucas",
            nickname="lukas",
            email="lucas@example.com",
            password="123456",
        )
        self.register_and_login(
            second_client,
            username="Maria",
            nickname="maria",
            email="maria@example.com",
            password="654321",
        )

        response = second_client.get("/api/v1/users/1")

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json(), {"error": "forbidden"})

    def test_update_user_rejects_blank_email(self):
        self.register_user()
        self.login_user()

        response = self.client.put("/api/v1/users/1", json={"email": "   "})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"error": "email cannot be empty"})

    def test_update_user_rejects_duplicate_nickname(self):
        first_client = self.client
        second_client = self.make_client()

        self.register_and_login(
            first_client,
            username="Lucas",
            nickname="lukas",
            email="lucas@example.com",
            password="123456",
        )
        self.register_and_login(
            second_client,
            username="Maria",
            nickname="maria",
            email="maria@example.com",
            password="654321",
        )

        response = second_client.put("/api/v1/users/2", json={"nickname": "  lukas  "})

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.get_json(), {"error": "nickname already in use"})

    def test_update_user_rejects_duplicate_email(self):
        first_client = self.client
        second_client = self.make_client()

        self.register_and_login(
            first_client,
            username="Lucas",
            nickname="lukas",
            email="lucas@example.com",
            password="123456",
        )
        self.register_and_login(
            second_client,
            username="Maria",
            nickname="maria",
            email="maria@example.com",
            password="654321",
        )

        response = second_client.put("/api/v1/users/2", json={"email": " LUCAS@example.com "})

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.get_json(), {"error": "email already in use"})

    def test_update_user_updates_profile_and_password(self):
        self.register_user()
        self.login_user()

        response = self.client.put(
            "/api/v1/users/1",
            json={
                "username": "  Lucas Silva  ",
                "nickname": "  lks  ",
                "email": "  LKS@example.com  ",
                "password": "nova-senha",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.get_json()["user"],
            {
                "id": 1,
                "username": "Lucas Silva",
                "nickname": "lks",
                "email": "lks@example.com",
            },
        )

        self.client.post("/api/v1/users/logout")
        login_response = self.login_user_with(
            self.client,
            email="lks@example.com",
            password="nova-senha",
        )
        self.assertEqual(login_response.status_code, 200)

    def test_delete_user_forbids_access_to_another_user(self):
        first_client = self.client
        second_client = self.make_client()

        self.register_and_login(
            first_client,
            username="Lucas",
            nickname="lukas",
            email="lucas@example.com",
            password="123456",
        )
        self.register_and_login(
            second_client,
            username="Maria",
            nickname="maria",
            email="maria@example.com",
            password="654321",
        )

        response = second_client.delete("/api/v1/users/1")

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.get_json(), {"error": "forbidden"})

    def test_delete_user_removes_tasks_and_session(self):
        self.register_user()
        self.login_user()
        self.create_task()

        delete_response = self.client.delete("/api/v1/users/1")
        me_response = self.client.get("/api/v1/users/me")

        self.assertEqual(delete_response.status_code, 200)
        self.assertEqual(me_response.status_code, 401)
        self.assertEqual(me_response.get_json(), {"error": "authentication required"})
        with self.app.app_context():
            self.assertEqual(User.query.count(), 0)
            self.assertEqual(Task.query.count(), 0)


if __name__ == "__main__":
    unittest.main()
