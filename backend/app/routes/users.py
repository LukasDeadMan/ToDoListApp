from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required, login_user, logout_user
from sqlalchemy import or_

from ..extensions import db
from ..models import User

bp = Blueprint("users", __name__)


def get_json():
    """Read JSON safely from the request body.

    English: Returns an empty dict when the body is missing or invalid.
    Portugues: Retorna um dict vazio quando o corpo nao existe ou e invalido.
    """

    return request.get_json(silent=True) or {}


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
    required_fields = ("username", "nickname", "email", "password")
    missing_fields = [field for field in required_fields if not data.get(field)]
    if missing_fields:
        return jsonify({"error": f"missing fields: {', '.join(missing_fields)}"}), 400

    existing_user = User.query.filter(
        or_(User.email == data["email"], User.nickname == data["nickname"])
    ).first()
    if existing_user:
        return jsonify({"error": "email or nickname already in use"}), 409

    user = User(
        username=data["username"],
        nickname=data["nickname"],
        email=data["email"],
        password="",
    )
    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    return jsonify(user_to_dict(user)), 201


@bp.post("/login")
def login():
    """Authenticate a user and open a session.

    English: Accepts email or nickname as the login identifier.
    Portugues: Aceita email ou nickname como identificador de login.
    """

    data = get_json()
    identifier = data.get("email") or data.get("nickname")
    password = data.get("password")

    if not identifier or not password:
        return jsonify({"error": "email or nickname and password are required"}), 400

    user = User.query.filter(
        or_(User.email == identifier, User.nickname == identifier)
    ).first()
    if user is None or not user.check_password(password):
        return jsonify({"error": "invalid credentials"}), 401

    login_user(user)
    return jsonify({"message": "login successful", "user": user_to_dict(user)})


@bp.get("/logout")
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

    if "nickname" in data and data["nickname"] != current_user.nickname:
        if User.query.filter_by(nickname=data["nickname"]).first():
            return jsonify({"error": "nickname already in use"}), 409

    if "email" in data and data["email"] != current_user.email:
        if User.query.filter_by(email=data["email"]).first():
            return jsonify({"error": "email already in use"}), 409

    current_user.username = data.get("username", current_user.username)
    current_user.nickname = data.get("nickname", current_user.nickname)
    current_user.email = data.get("email", current_user.email)

    if "password" in data and data["password"]:
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
