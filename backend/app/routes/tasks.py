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

def task_to_dict(t):
    return {
        "id": t.id,
        "title": t.title,
        "done": t.done,
        "created_at": t.created_at.isoformat() if getattr(t, "created_at", None) else None,
        "user_id": t.user_id,
    }

@bp.get("/<int:task_id>")
def get_task(task_id):
    t = Task.query.get_or_404(task_id)
    return task_to_dict(t)

@bp.put("/<int:task_id>")
def update_task(task_id):
    t = Task.query.get_or_404(task_id)
    data = request.get_json(force=True)

    if "title" in data:
        t.title = data["title"]
    if "done" in data:
        t.done = bool(data["done"])
    if "user_id" in data:
        if not User.query.get(data["user_id"]):
            abort(404, description="novo user não encontrado")
        t.user_id = data["user_id"]

    db.session.commit()
    return {"message": "Task updated"}

@bp.delete("/<int:task_id>")
def delete_task(task_id):
    t = Task.query.get_or_404(task_id)
    db.session.delete(t)
    db.session.commit()
    return {"message": "Task deleted"}