import os
import secrets
from urllib.parse import urlparse

from flask import Flask, jsonify, request
from flask_login import current_user
from werkzeug.exceptions import HTTPException

from .extensions import cors, db, login_manager, migrate


def _env_flag(name, default=False):
    """Parse a boolean flag from environment variables."""

    value = os.environ.get(name)
    if value is None:
        return default

    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_int(name, default):
    """Parse an integer value from environment variables."""

    value = os.environ.get(name)
    if value is None:
        return default

    try:
        return int(value.strip())
    except ValueError:
        return default


def _is_development_mode():
    """Detect whether the app is running in a local development mode."""

    flask_env = os.environ.get("FLASK_ENV", "").strip().lower()
    if flask_env == "development":
        return True

    return _env_flag("FLASK_DEBUG")


def _split_origins(value):
    """Parse a comma-separated list of allowed frontend origins."""

    if not value:
        return []

    return [item.strip().rstrip("/") for item in value.split(",") if item.strip()]


def _normalize_origin(value):
    """Normalize Origin or Referer values into scheme://host[:port]."""

    if not value:
        return ""

    parsed = urlparse(value)
    if not parsed.scheme or not parsed.netloc:
        return value.rstrip("/")

    return f"{parsed.scheme}://{parsed.netloc}".rstrip("/")


def create_app(test_config=None):
    """Create and configure the Flask application.

    English: Builds the app, loads configuration, initializes
    extensions, and registers routes.
    Portugues: Monta a app, carrega configuracoes, inicializa
    extensoes e registra as rotas.
    """

    app = Flask(__name__, instance_relative_config=True)
    configured_frontend_origins = _split_origins(
        os.environ.get("FRONTEND_ORIGINS")
    ) or [_normalize_origin(os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000"))]
    cross_site_cookies = _env_flag("SESSION_COOKIE_CROSS_SITE")
    session_cookie_samesite = os.environ.get("SESSION_COOKIE_SAMESITE") or (
        "None" if cross_site_cookies else "Lax"
    )
    session_cookie_secure = _env_flag(
        "SESSION_COOKIE_SECURE", default=cross_site_cookies
    )
    remember_cookie_secure = _env_flag(
        "REMEMBER_COOKIE_SECURE", default=session_cookie_secure
    )
    login_max_attempts = _env_int("LOGIN_MAX_ATTEMPTS", 5)
    login_window_seconds = _env_int("LOGIN_WINDOW_SECONDS", 300)
    login_block_seconds = _env_int("LOGIN_BLOCK_SECONDS", 300)

    # English: Default local configuration.
    # Portugues: Configuracao padrao para ambiente local.
    app.config.from_mapping(
        SECRET_KEY=os.environ.get("SECRET_KEY"),
        SQLALCHEMY_DATABASE_URI=os.environ.get(
            "DATABASE_URL",
            f"sqlite:///{os.path.join(app.instance_path, 'app.db')}",
        ),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        FRONTEND_ORIGIN=configured_frontend_origins[0],
        FRONTEND_ORIGINS=configured_frontend_origins,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE=session_cookie_samesite,
        SESSION_COOKIE_SECURE=session_cookie_secure,
        REMEMBER_COOKIE_HTTPONLY=True,
        REMEMBER_COOKIE_SECURE=remember_cookie_secure,
        SESSION_COOKIE_CROSS_SITE=cross_site_cookies,
        LOGIN_MAX_ATTEMPTS=login_max_attempts,
        LOGIN_WINDOW_SECONDS=login_window_seconds,
        LOGIN_BLOCK_SECONDS=login_block_seconds,
    )

    if test_config is None:
        # English: Override with instance config when available.
        # Portugues: Sobrescreve com a config da instancia quando existir.
        app.config.from_pyfile("config.py", silent=True)
    else:
        # English: Tests can inject a custom configuration.
        # Portugues: Os testes podem injetar uma configuracao customizada.
        app.config.from_mapping(test_config)

    if not app.config.get("SECRET_KEY"):
        if app.config.get("TESTING"):
            app.config["SECRET_KEY"] = "test-secret-key"
        elif _is_development_mode():
            app.config["SECRET_KEY"] = secrets.token_hex(32)
            app.logger.warning(
                "SECRET_KEY not configured; using an ephemeral value for this process."
            )
        else:
            raise RuntimeError(
                "SECRET_KEY environment variable is required outside development and tests."
            )

    if app.config.get("SESSION_COOKIE_CROSS_SITE"):
        if str(app.config["SESSION_COOKIE_SAMESITE"]).lower() != "none":
            app.logger.warning(
                "Cross-site session cookies require SESSION_COOKIE_SAMESITE=None."
            )

        if not app.config["SESSION_COOKIE_SECURE"]:
            app.logger.warning(
                "Cross-site session cookies should enable SESSION_COOKIE_SECURE=True."
            )

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
        resources={r"/api/*": {"origins": app.config["FRONTEND_ORIGINS"]}},
    )

    @app.before_request
    def protect_session_mutations():
        """Reject cross-site state changes for session-authenticated API calls."""

        if not request.path.startswith("/api/"):
            return None

        if request.method in {"GET", "HEAD", "OPTIONS"}:
            return None

        allowed_origins = {
            _normalize_origin(origin)
            for origin in app.config.get("FRONTEND_ORIGINS", [])
            if origin
        }
        allowed_origins.add(_normalize_origin(request.host_url))

        origin = _normalize_origin(request.headers.get("Origin"))
        if origin:
            if origin in allowed_origins:
                return None

            return jsonify({"error": "cross-site request blocked"}), 403

        referer = _normalize_origin(request.headers.get("Referer"))
        if referer in allowed_origins:
            return None

        return jsonify({"error": "cross-site request blocked"}), 403

    # English: Import models before migrations so SQLAlchemy metadata is ready.
    # Portugues: Importa os models antes das migracoes para preparar o metadata.
    from . import models  # noqa: F401
    from .models import User
    from .security import LoginAttemptLimiter

    migrate.init_app(app, db)
    app.extensions["login_attempt_limiter"] = LoginAttemptLimiter(
        max_attempts=app.config["LOGIN_MAX_ATTEMPTS"],
        window_seconds=app.config["LOGIN_WINDOW_SECONDS"],
        block_seconds=app.config["LOGIN_BLOCK_SECONDS"],
    )

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

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """Return JSON errors for API routes.

        English: Keeps API failures machine-readable for the frontend.
        Portugues: Mantem as falhas da API legiveis por maquina para o frontend.
        """

        if not request.path.startswith("/api/"):
            return error

        return (
            jsonify(
                {
                    "error": error.name.lower(),
                    "message": error.description,
                }
            ),
            error.code,
        )

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
