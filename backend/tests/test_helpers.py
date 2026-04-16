from datetime import datetime
from types import SimpleNamespace
import unittest

from app.routes.tasks import normalize_title, parse_done, task_to_dict
from app.routes.users import is_blank, normalize_text, user_to_dict


class UserHelpersTestCase(unittest.TestCase):
    def test_normalize_text_trims_value(self):
        self.assertEqual(normalize_text("  Lucas  "), "Lucas")

    def test_normalize_text_lowercases_when_requested(self):
        self.assertEqual(normalize_text("  Lucas@Example.COM  ", lowercase=True), "lucas@example.com")

    def test_normalize_text_returns_empty_string_for_non_string(self):
        self.assertEqual(normalize_text(None), "")
        self.assertEqual(normalize_text(123), "")

    def test_is_blank_flags_invalid_values(self):
        self.assertTrue(is_blank(None))
        self.assertTrue(is_blank("   "))
        self.assertTrue(is_blank(1))
        self.assertFalse(is_blank("ok"))

    def test_user_to_dict_exposes_only_public_fields(self):
        user = SimpleNamespace(
            id=1,
            username="Lucas",
            nickname="lukas",
            email="lucas@example.com",
            password="secret",
        )

        payload = user_to_dict(user)

        self.assertEqual(
            payload,
            {
                "id": 1,
                "username": "Lucas",
                "nickname": "lukas",
                "email": "lucas@example.com",
            },
        )
        self.assertNotIn("password", payload)


class TaskHelpersTestCase(unittest.TestCase):
    def test_normalize_title_trims_value(self):
        self.assertEqual(normalize_title("  Minha tarefa  "), "Minha tarefa")

    def test_normalize_title_returns_empty_string_for_non_string(self):
        self.assertEqual(normalize_title(None), "")
        self.assertEqual(normalize_title(123), "")

    def test_parse_done_accepts_boolean_values(self):
        self.assertTrue(parse_done(True))
        self.assertFalse(parse_done(False))

    def test_parse_done_rejects_non_boolean_values(self):
        with self.assertRaisesRegex(ValueError, "O campo done precisa ser booleano."):
            parse_done("false")

    def test_task_to_dict_serializes_created_at(self):
        task = SimpleNamespace(
            id=7,
            title="Estudar Flask",
            done=False,
            created_at=datetime(2025, 8, 26, 12, 30, 45),
            user_id=3,
        )

        self.assertEqual(
            task_to_dict(task),
            {
                "id": 7,
                "title": "Estudar Flask",
                "done": False,
                "created_at": "2025-08-26T12:30:45+00:00",
                "user_id": 3,
            },
        )


if __name__ == "__main__":
    unittest.main()
