import tempfile
import unittest
from pathlib import Path

from app import create_app
from app.extensions import db


class ApiTestCase(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        database_path = Path(self.temp_dir.name) / "test.db"

        self.app = create_app(
            {
                "TESTING": True,
                "SQLALCHEMY_DATABASE_URI": f"sqlite:///{database_path}",
            }
        )
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

        self.temp_dir.cleanup()

    def register_user(self):
        return self.client.post(
            "/api/v1/users/register",
            json={
                "username": "  Lucas  ",
                "nickname": "  lukas  ",
                "email": "  LUCAS@example.com  ",
                "password": "123456",
            },
        )

    def login_user(self):
        return self.client.post(
            "/api/v1/users/login",
            json={"email": "lucas@example.com", "password": "123456"},
        )

    def create_task(self, title="Primeira tarefa"):
        return self.client.post("/api/v1/tasks", json={"title": title})

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

    def test_logout_only_accepts_post_and_returns_json_error(self):
        response = self.client.get("/api/v1/users/logout")

        self.assertEqual(response.status_code, 405)
        self.assertEqual(response.get_json()["error"], "method not allowed")

    def test_update_user_rejects_blank_email(self):
        self.register_user()
        self.login_user()

        response = self.client.put("/api/v1/users/1", json={"email": "   "})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"error": "email cannot be empty"})

    def test_update_task_rejects_non_boolean_done(self):
        self.register_user()
        self.login_user()
        task_response = self.create_task()
        task_id = task_response.get_json()["id"]

        response = self.client.put(
            f"/api/v1/tasks/{task_id}",
            json={"done": "false"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"error": "done must be a boolean"})

    def test_missing_task_returns_json_404(self):
        self.register_user()
        self.login_user()

        response = self.client.get("/api/v1/tasks/999")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json()["error"], "not found")


if __name__ == "__main__":
    unittest.main()
