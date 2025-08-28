from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import User

bp = Blueprint("api", __name__)

@bp.post("")
def create_user():
    data = request.get_json(force=True)
    user = User(
        username=data["username"],
        nickname=data["nickname"],
        email=data["email"],
        password=""  # vai virar hash
    )

    user.set_password(data["password"])
    db.session.add(user)
    db.session.commit()
    return jsonify({"id": user.id, "nickname": user.nickname, "email": user.email}), 201


@bp.get("")
def list_users():
    users = User.query.all()
    return jsonify([
        {"id": u.id, "username": u.username, "nickname": u.nickname, "email": u.email}
        for u in users])

@bp.get("/<int:user_id>")
def get_user(user_id):
    user = User.query.get_or_404(user_id)
    return {
        "id": user.id,
        "username": user.username,
        "nickname": user.nickname,
        "email": user.email
    }

@bp.put("/<int:user_id>")
def update_user(user_id):
    user = User.query.get_or_404(user_id)
    data = request.get_json(force=True)

    user.username = data.get("username", user.username)
    user.nickname = data.get("nickname", user.nickname)
    user.email = data.get("email", user.email)

    if "password" in data:
        user.set_password(data["password"])

    db.session.commit()
    return {"message": "User updated"}


@bp.delete("/<int:user_id>")
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return {"message": "User deleted"}