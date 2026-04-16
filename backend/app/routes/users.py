from flask import Blueprint, jsonify, request
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


def get_password_error(password):
    """Return a validation error for weak passwords, or None when valid."""

    if not isinstance(password, str):
        return "password is required"

    normalized = password.strip()
    if len(normalized) < 8:
        return "password must have at least 8 characters"

    if normalized.lower() in WEAK_PASSWORDS:
        return "choose a less predictable password"

    if re.search(r"[a-z]", normalized) is None:
        return "password must include a lowercase letter"

    if re.search(r"[A-Z]", normalized) is None:
        return "password must include an uppercase letter"

    if re.search(r"\d", normalized) is None:
        return "password must include a number"

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
        "nickname": normalize_text(data.get("nickname")),
        "email": normalize_text(data.get("email"), lowercase=True),
    }
    required_fields = ("username", "nickname", "email", "password")
    missing_fields = [field for field in required_fields if is_blank(data.get(field))]
    if missing_fields:
        return jsonify({"error": f"missing fields: {', '.join(missing_fields)}"}), 400

    password_error = get_password_error(data.get("password"))
    if password_error:
        return jsonify({"error": password_error}), 400

    existing_user = User.query.filter(
        or_(
            User.email == normalized_fields["email"],
            User.nickname == normalized_fields["nickname"],
        )
    ).first()
    if existing_user:
        return jsonify({"error": "email or nickname already in use"}), 409

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
    nickname = normalize_text(data.get("nickname"))
    identifier = email or nickname
    password = data.get("password")

    if not identifier or is_blank(password):
        return jsonify({"error": "email or nickname and password are required"}), 400

    user = User.query.filter(
        or_(User.email == identifier, User.nickname == identifier)
    ).first()
    if user is None or not user.check_password(password):
        return jsonify({"error": "invalid credentials"}), 401

    login_user(user)
    return jsonify({"message": "login successful", "user": user_to_dict(user)})


@bp.post("/logout")
@login_required
def logout():
    """Close the current authenticated session.

    English: Requires a logged user because there is no session otherwise.
    Portugues: Exige usuario logado porque fora disso nao ha sessao para encerrar.
    """

    logout_user()
    return jsonify({"message": "logout successful"})


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
            return jsonify({"error": "username cannot be empty"}), 400
        current_user.username = username

    if "nickname" in data:
        nickname = normalize_text(data["nickname"])
        if not nickname:
            return jsonify({"error": "nickname cannot be empty"}), 400
        if nickname != current_user.nickname and User.query.filter_by(nickname=nickname).first():
            return jsonify({"error": "nickname already in use"}), 409
        current_user.nickname = nickname

    if "email" in data:
        email = normalize_text(data["email"], lowercase=True)
        if not email:
            return jsonify({"error": "email cannot be empty"}), 400
        if email != current_user.email and User.query.filter_by(email=email).first():
            return jsonify({"error": "email already in use"}), 409
        current_user.email = email

    if "password" in data:
        if is_blank(data["password"]):
            return jsonify({"error": "password cannot be empty"}), 400
        password_error = get_password_error(data["password"])
        if password_error:
            return jsonify({"error": password_error}), 400
        current_user.set_password(data["password"])

    db.session.commit()
    return jsonify({"message": "user updated", "user": user_to_dict(current_user)})


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

    return jsonify({"message": "user deleted"})
