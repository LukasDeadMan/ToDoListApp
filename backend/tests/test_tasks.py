import unittest

from tests.api_case import ApiTestCase
from app.models import Task


class TasksApiTestCase(ApiTestCase):
    def test_create_task_requires_title(self):
        self.register_user()
        self.login_user()

        response = self.create_task("   ")

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"error": "title is required"})

    def test_create_task_normalizes_title(self):
        self.register_user()
        self.login_user()

        response = self.create_task("  Estudar Flask  ")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["title"], "Estudar Flask")

    def test_list_tasks_returns_only_current_user_tasks(self):
        first_client = self.client
        second_client = self.make_client()

        self.register_and_login(
            first_client,
            username="Lucas",
            nickname="lukas",
            email="lucas@example.com",
            password="123456",
        )
        first_client.post("/api/v1/tasks", json={"title": "Tarefa Lucas"})

        self.register_and_login(
            second_client,
            username="Maria",
            nickname="maria",
            email="maria@example.com",
            password="654321",
        )
        second_client.post("/api/v1/tasks", json={"title": "Tarefa Maria"})

        response = first_client.get("/api/v1/tasks")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.get_json()), 1)
        self.assertEqual(response.get_json()[0]["title"], "Tarefa Lucas")

    def test_update_task_updates_title_and_done(self):
        self.register_user()
        self.login_user()
        task_id = self.create_task("Primeira").get_json()["id"]

        response = self.client.put(
            f"/api/v1/tasks/{task_id}",
            json={"title": "  Atualizada  ", "done": True},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["task"]["title"], "Atualizada")
        self.assertTrue(response.get_json()["task"]["done"])

    def test_update_task_rejects_blank_title(self):
        self.register_user()
        self.login_user()
        task_id = self.create_task().get_json()["id"]

        response = self.client.put(
            f"/api/v1/tasks/{task_id}",
            json={"title": "   "},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {"error": "title cannot be empty"})

    def test_update_task_rejects_non_boolean_done(self):
        self.register_user()
        self.login_user()
        task_id = self.create_task().get_json()["id"]

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

    def test_delete_task_removes_record(self):
        self.register_user()
        self.login_user()
        task_id = self.create_task().get_json()["id"]

        response = self.client.delete(f"/api/v1/tasks/{task_id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"message": "task deleted"})
        with self.app.app_context():
            self.assertEqual(Task.query.count(), 0)

    def test_tasks_are_isolated_between_users(self):
        first_client = self.client
        second_client = self.make_client()

        self.register_user_with(
            first_client,
            username="Lucas",
            nickname="lukas",
            email="lucas@example.com",
            password="123456",
        )
        self.login_user_with(
            first_client,
            email="lucas@example.com",
            password="123456",
        )
        task_id = first_client.post("/api/v1/tasks", json={"title": "Privada"}).get_json()["id"]

        self.register_user_with(
            second_client,
            username="Maria",
            nickname="maria",
            email="maria@example.com",
            password="654321",
        )
        self.login_user_with(
            second_client,
            email="maria@example.com",
            password="654321",
        )

        response = second_client.get(f"/api/v1/tasks/{task_id}")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json()["error"], "not found")

    def test_delete_task_from_another_user_returns_not_found(self):
        first_client = self.client
        second_client = self.make_client()

        self.register_and_login(
            first_client,
            username="Lucas",
            nickname="lukas",
            email="lucas@example.com",
            password="123456",
        )
        task_id = first_client.post("/api/v1/tasks", json={"title": "Privada"}).get_json()["id"]
        self.register_and_login(
            second_client,
            username="Maria",
            nickname="maria",
            email="maria@example.com",
            password="654321",
        )

        response = second_client.delete(f"/api/v1/tasks/{task_id}")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.get_json()["error"], "not found")


if __name__ == "__main__":
    unittest.main()
