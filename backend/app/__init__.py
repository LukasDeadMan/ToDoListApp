import os

from flask import Flask, jsonify
from flask_login import current_user

from .extensions import cors, db, login_manager, migrate


def create_app(test_config=None):
    """Create and configure the Flask application.

    English: Builds the app, loads configuration, initializes
    extensions, and registers routes.
    Portugues: Monta a app, carrega configuracoes, inicializa
    extensoes e registra as rotas.
    """

    app = Flask(__name__, instance_relative_config=True)

    # English: Default local configuration.
    # Portugues: Configuracao padrao para ambiente local.
    app.config.from_mapping(
        SECRET_KEY="dev",
        SQLALCHEMY_DATABASE_URI=f"sqlite:///{os.path.join(app.instance_path, 'app.db')}",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        FRONTEND_ORIGIN="http://localhost:3000",
    )

    if test_config is None:
        # English: Override with instance config when available.
        # Portugues: Sobrescreve com a config da instancia quando existir.
        app.config.from_pyfile("config.py", silent=True)
    else:
        # English: Tests can inject a custom configuration.
        # Portugues: Os testes podem injetar uma configuracao customizada.
        app.config.from_mapping(test_config)

    # English: SQLite is stored inside the instance folder.
    # Portugues: O SQLite fica dentro da pasta de instancia.
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    db.init_app(app)
    login_manager.init_app(app)
    cors.init_app(
        app,
        supports_credentials=True,
        resources={r"/api/*": {"origins": app.config["FRONTEND_ORIGIN"]}},
    )

    # English: Import models before migrations so SQLAlchemy metadata is ready.
    # Portugues: Importa os models antes das migracoes para preparar o metadata.
    from . import models  # noqa: F401
    from .models import User

    migrate.init_app(app, db)

    @login_manager.user_loader
    def load_user(user_id):
        """Resolve a session user id into a User instance.

        English: Flask-Login uses this callback to restore the logged user.
        Portugues: O Flask-Login usa este callback para restaurar o usuario logado.
        """

        return db.session.get(User, int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        """Return JSON instead of an HTML redirect for protected APIs.

        English: Frontend clients expect a 401 JSON response.
        Portugues: Clientes frontend esperam uma resposta JSON com 401.
        """

        return jsonify({"error": "authentication required"}), 401

    from .routes import init_app as init_routes

    init_routes(app)

    @app.route("/status")
    def status():
        """Expose a minimal health endpoint.

        English: Confirms the API is online and whether a session exists.
        Portugues: Confirma que a API esta online e se existe uma sessao.
        """

        return {
            "ok": True,
            "authenticated": current_user.is_authenticated,
        }

    return app
