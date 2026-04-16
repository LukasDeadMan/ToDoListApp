import os
import unittest
from unittest.mock import patch

from app import create_app


class AppFactoryTestCase(unittest.TestCase):
    def test_testing_mode_uses_a_stable_secret_key(self):
        app = create_app({"TESTING": True})

        self.assertEqual(app.config["SECRET_KEY"], "test-secret-key")

    def test_production_mode_requires_secret_key(self):
        with patch.dict(os.environ, {"FLASK_ENV": "production"}, clear=True):
            with self.assertRaisesRegex(RuntimeError, "SECRET_KEY"):
                create_app({})


if __name__ == "__main__":
    unittest.main()
