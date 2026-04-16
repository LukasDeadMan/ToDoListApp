from flask import Blueprint, current_app, jsonify, request
from flask_login import current_user, login_required, login_user, logout_user
from sqlalchemy import or_
import re

from ..extensions import db
from ..models import User

bp = Blueprint("users", __name__)
WEAK_PASSWORDS = {
    "12345678",
    "123456789",
    "1234567890",
    "password",
    "password123",
    "qwerty123",
}


def get_json():
    """Read JSON safely from the request body.

    English: Returns an empty dict when the body is missing or invalid.
    Portugues: Retorna um dict vazio quando o corpo nao existe ou e invalido.
    """

    return request.get_json(silent=True) or {}


def normalize_text(value, *, lowercase=False):
    """Normalize optional text fields received from the API."""

    if not isinstance(value, str):
        return ""

    normalized = value.strip()
    if lowercase:
        normalized = normalized.lower()

    return normalized


def is_blank(value):
    """Check whether a value should be considered empty input."""

    return not isinstance(value, str) or not value.strip()


def normalize_nickname(value):
    """Normalize nicknames and ignore an optional leading @ marker."""

    normalized = normalize_text(value)
    if normalized.startswith("@"):
        return normalized[1:].strip()

    return normalized


def nickname_variants(value):
    """Return normalized nickname variants compatible with legacy @ prefixes."""

    normalized = normalize_nickname(value)
    if not normalized:
        return ()

    return tuple({normalized, f"@{normalized}"})


def get_login_rate_limit_keys(identifier):
    """Build stable rate-limit keys for the current client and identifier."""

    client_ip = request.remote_addr or "unknown"
    keys = [f"ip:{client_ip}"]

    if identifier:
        keys.append(f"identifier:{identifier.lower()}")

    return tuple(keys)


def get_login_limiter():
    """Resolve the shared login limiter instance from the application."""

    return current_app.extensions["login_attempt_limiter"]


def make_rate_limit_response(retry_after):
    """Return a consistent JSON response for blocked login bursts."""

    response = jsonify(
        {
            "error": (
                "Muitas tentativas de login. Aguarde alguns instantes antes de tentar novamente."
            ),
            "retry_after": retry_after,
        }
    )
    response.status_code = 429
    response.headers["Retry-After"] = str(retry_after)
    return response


def get_password_error(password):
    """Return a validation error for weak passwords, or None when valid."""

    if not isinstance(password, str):
        return "Senha obrigatoria."

    normalized = password.strip()
    if password != normalized:
        return "Nao use espacos no inicio ou no fim da senha."

    if len(normalized) < 8:
        return "A senha precisa ter pelo menos 8 caracteres."

    if normalized.lower() in WEAK_PASSWORDS:
        return "Escolha uma senha menos previsivel."

    if re.search(r"[a-z]", normalized) is None:
        return "A senha precisa incluir uma letra minuscula."

    if re.search(r"[A-Z]", normalized) is None:
        return "A senha precisa incluir uma letra maiuscula."

    if re.search(r"\d", normalized) is None:
        return "A senha precisa incluir um numero."

    return None


def user_to_dict(user):
    """Serialize a User model into API-friendly JSON.

    English: Keeps response formatting consistent across endpoints.
    Portugues: Mantem o formato das respostas consistente entre endpoints.
    """

    return {
        "id": user.id,
        "username": user.username,
        "nickname": user.nickname,
        "email": user.email,
    }


@bp.post("/register")
def register():
    """Create a new user account.

    English: Validates required fields and prevents duplicate email/nickname.
    Portugues: Valida campos obrigatorios e impede email/nickname duplicados.
    """

    data = get_json()
    normalized_fields = {
        "username": normalize_text(data.get("username")),
        "nickname": normalize_nickname(data.get("nickname")),
        "email": normalize_text(data.get("email"), lowercase=True),
    }
    required_fields = ("username", "nickname", "email", "password")
    missing_fields = [field for field in required_fields if is_blank(data.get(field))]
    if missing_fields:
        return jsonify({"error": f"Campos obrigatorios: {', '.join(missing_fields)}."}), 400

    if not normalized_fields["username"]:
        return jsonify({"error": "Nome nao pode ficar vazio."}), 400

    if not normalized_fields["nickname"]:
        return jsonify({"error": "Nickname nao pode ficar vazio."}), 400

    if not normalized_fields["email"]:
        return jsonify({"error": "Email nao pode ficar vazio."}), 400

    password_error = get_password_error(data.get("password"))
    if password_error:
        return jsonify({"error": password_error}), 400

    existing_user = User.query.filter(
        or_(
            User.email == normalized_fields["email"],
            User.nickname.in_(nickname_variants(normalized_fields["nickname"])),
        )
    ).first()
    if existing_user:
        return jsonify({"error": "Email ou nickname ja estao em uso."}), 409

    user = User(
        username=normalized_fields["username"],
        nickname=normalized_fields["nickname"],
        email=normalized_fields["email"],
        password="",
    )
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()
    login_user(user)

    return jsonify(user_to_dict(user)), 201


@bp.post("/login")
def login():
    """Authenticate a user and open a session.

    English: Accepts email or nickname as the login identifier.
    Portugues: Aceita email ou nickname como identificador de login.
    """

    data = get_json()
    email = normalize_text(data.get("email"), lowercase=True)
    nickname = normalize_nickname(data.get("nickname"))
    identifier = email or nickname
    password = data.get("password")
    limiter = get_login_limiter()
    rate_limit_keys = get_login_rate_limit_keys(identifier)

    if not identifier or is_blank(password):
        return jsonify({"error": "Email ou nickname e senha sao obrigatorios."}), 400

    retry_after = max(limiter.get_retry_after(key) for key in rate_limit_keys)
    if retry_after:
        return make_rate_limit_response(retry_after)

    if email:
        user = User.query.filter_by(email=identifier).first()
    else:
        user = User.query.filter(User.nickname.in_(nickname_variants(identifier))).first()

    if user is None or not user.check_password(password):
        retry_after = max(limiter.register_failure(key) for key in rate_limit_keys)
        if retry_after:
            return make_rate_limit_response(retry_after)

        return jsonify({"error": "Credenciais invalidas."}), 401

    for key in rate_limit_keys:
        limiter.reset(key)
    login_user(user)
    return jsonify({"message": "Login efetuado com sucesso.", "user": user_to_dict(user)})


@bp.post("/logout")
@login_required
def logout():
    """Close the current authenticated session.

    English: Requires a logged user because there is no session otherwise.
    Portugues: Exige usuario logado porque fora disso nao ha sessao para encerrar.
    """

    logout_user()
    return jsonify({"message": "Sessao encerrada com sucesso."})


@bp.get("/me")
@login_required
def me():
    """Return the currently authenticated user.

    English: Useful for frontend bootstrap after page reloads.
    Portugues: Util para iniciar o frontend depois de recarregar a pagina.
    """

    return jsonify(user_to_dict(current_user))


@bp.get("/<int:user_id>")
@login_required
def get_user(user_id):
    """Return one user only when it matches the session owner.

    English: Prevents one user from reading another user profile directly.
    Portugues: Impede que um usuario leia diretamente o perfil de outro.
    """

    if current_user.id != user_id:
        return jsonify({"error": "forbidden"}), 403

    return jsonify(user_to_dict(current_user))


@bp.put("/<int:user_id>")
@login_required
def update_user(user_id):
    """Update the authenticated user profile.

    English: Ownership is enforced by comparing route id and session id.
    Portugues: A posse e validada comparando o id da rota com o id da sessao.
    """

    if current_user.id != user_id:
        return jsonify({"error": "forbidden"}), 403

    data = get_json()

    if "username" in data:
        username = normalize_text(data["username"])
        if not username:
            return jsonify({"error": "Nome nao pode ficar vazio."}), 400
        current_user.username = username

    if "nickname" in data:
        nickname = normalize_nickname(data["nickname"])
        if not nickname:
            return jsonify({"error": "Nickname nao pode ficar vazio."}), 400
        current_nickname = normalize_nickname(current_user.nickname)
        if nickname != current_nickname and User.query.filter(
            User.id != current_user.id,
            User.nickname.in_(nickname_variants(nickname)),
        ).first():
            return jsonify({"error": "Nickname ja esta em uso."}), 409
        current_user.nickname = nickname

    if "email" in data:
        email = normalize_text(data["email"], lowercase=True)
        if not email:
            return jsonify({"error": "Email nao pode ficar vazio."}), 400
        if email != current_user.email and User.query.filter_by(email=email).first():
            return jsonify({"error": "Email ja esta em uso."}), 409
        current_user.email = email

    if "password" in data:
        if is_blank(data["password"]):
            return jsonify({"error": "Senha nao pode ficar vazia."}), 400
        password_error = get_password_error(data["password"])
        if password_error:
            return jsonify({"error": password_error}), 400
        current_user.set_password(data["password"])

    db.session.commit()
    return jsonify({"message": "Perfil atualizado.", "user": user_to_dict(current_user)})


@bp.delete("/<int:user_id>")
@login_required
def delete_user(user_id):
    """Delete the authenticated user and its dependent tasks.

    English: The relationship cascade removes tasks automatically.
    Portugues: O cascade do relacionamento remove as tarefas automaticamente.
    """

    if current_user.id != user_id:
        return jsonify({"error": "forbidden"}), 403

    user = current_user._get_current_object()
    logout_user()
    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "Conta removida com sucesso."})
