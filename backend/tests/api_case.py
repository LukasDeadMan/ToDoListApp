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
        return self.register_user_with(
            self.client,
            username="  Lucas  ",
            nickname="  lukas  ",
            email="  LUCAS@example.com  ",
            password="123456",
        )

    def register_user_with(self, client, *, username, nickname, email, password):
        return client.post(
            "/api/v1/users/register",
            json={
                "username": username,
                "nickname": nickname,
                "email": email,
                "password": password,
            },
        )

    def login_user(self):
        return self.login_user_with(
            self.client,
            email="lucas@example.com",
            password="123456",
        )

    def login_user_with(self, client, *, email=None, nickname=None, password):
        payload = {"password": password}
        if email is not None:
            payload["email"] = email
        if nickname is not None:
            payload["nickname"] = nickname

        return client.post("/api/v1/users/login", json=payload)

    def create_task(self, title="Primeira tarefa"):
        return self.client.post("/api/v1/tasks", json={"title": title})

    def make_client(self):
        return self.app.test_client()

    def register_and_login(self, client, *, username, nickname, email, password):
        register_response = self.register_user_with(
            client,
            username=username,
            nickname=nickname,
            email=email,
            password=password,
        )
        login_response = self.login_user_with(
            client,
            email=email.strip().lower(),
            password=password,
        )

        return register_response, login_response
