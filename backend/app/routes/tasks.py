from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models import Task, User

bp = Blueprint("tasks", __name__)

@bp.post("")
def create_task():
    data = request.get_json(force=True)
    t = Task(title=data["title"], user_id=data["user_id"])
    db.session.add(t)
    db.session.commit()
    return jsonify({"id": t.id, "title": t.title, "user_id": t.user_id}), 201

@bp.get("")
def list_tasks():
    tasks = Task.query.all()
    return jsonify([{
        "id": t.id, "title": t.title, "done": t.done, "user_id": t.user_id
    } for t in tasks])