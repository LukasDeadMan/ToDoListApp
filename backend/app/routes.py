from flask import Blueprint, request, jsonify
from .extensions import db
from .models import User

bp = Blueprint("api", __name__)

@bp.post("/users")
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



@bp.get("/users")
def list_users():
    users = User.query.all()
    return jsonify([
        {"id": u.id, "username": u.username, "nickname": u.nickname, "email": u.email}
        for u in users
    ])