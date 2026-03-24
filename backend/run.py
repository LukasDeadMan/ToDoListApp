"""Development entrypoint.

English: Starts the Flask application for local development.
Portugues: Inicia a aplicacao Flask para desenvolvimento local.
"""

from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0")
