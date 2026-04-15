from flask import Blueprint, jsonify, request
from flask_login import current_user, login_required

from ..extensions import db
from ..models import Task

bp = Blueprint("tasks", __name__)


def get_json():
    """Read JSON safely from the request body.

    English: Returns an empty dict when no valid JSON is sent.
    Portugues: Retorna um dict vazio quando nenhum JSON valido e enviado.
    """

    return request.get_json(silent=True) or {}


def normalize_title(value):
    """Normalize a task title before persisting it."""

    if not isinstance(value, str):
        return ""

    return value.strip()


def parse_done(value):
    """Validate the task completion flag."""

    if isinstance(value, bool):
        return value

    raise ValueError("done must be a boolean")


def task_to_dict(task):
    """Serialize a Task model into JSON.

    English: Keeps task responses predictable for the frontend.
    Portugues: Mantem as respostas de tarefa previsiveis para o frontend.
    """

    return {
        "id": task.id,
        "title": task.title,
        "done": task.done,
        "created_at": task.created_at.isoformat() if task.created_at else None,
        "user_id": task.user_id,
    }


@bp.post("")
@login_required
def create_task():
    """Create a task for the logged user.

    English: The API ignores any client-side user id and trusts the session.
    Portugues: A API ignora qualquer user id vindo do cliente e confia na sessao.
    """

    data = get_json()
    title = normalize_title(data.get("title"))
    if not title:
        return jsonify({"error": "title is required"}), 400

    task = Task(title=title, user_id=current_user.id)
    db.session.add(task)
    db.session.commit()

    return jsonify(task_to_dict(task)), 201


@bp.get("")
@login_required
def list_tasks():
    """List only the tasks that belong to the current user.

    English: This keeps data isolated between accounts.
    Portugues: Isso mantem os dados isolados entre as contas.
    """

    tasks = (
        Task.query.filter_by(user_id=current_user.id)
        .order_by(Task.created_at.desc())
        .all()
    )
    return jsonify([task_to_dict(task) for task in tasks])


@bp.get("/<int:task_id>")
@login_required
def get_task(task_id):
    """Return one task only when it belongs to the session owner.

    English: Query filters by both task id and current user id.
    Portugues: A busca filtra ao mesmo tempo pelo id da tarefa e pelo usuario atual.
    """

    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    return jsonify(task_to_dict(task))


@bp.put("/<int:task_id>")
@login_required
def update_task(task_id):
    """Update title or completion state for one owned task.

    English: Empty titles are rejected to preserve data quality.
    Portugues: Titulos vazios sao rejeitados para preservar a qualidade dos dados.
    """

    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    data = get_json()

    if "title" in data:
        title = normalize_title(data["title"])
        if not title:
            return jsonify({"error": "title cannot be empty"}), 400
        task.title = title

    if "done" in data:
        try:
            task.done = parse_done(data["done"])
        except ValueError as exc:
            return jsonify({"error": str(exc)}), 400

    db.session.commit()
    return jsonify({"message": "task updated", "task": task_to_dict(task)})


@bp.delete("/<int:task_id>")
@login_required
def delete_task(task_id):
    """Delete one task owned by the logged user.

    English: Ownership is enforced in the query itself.
    Portugues: A posse e validada na propria consulta ao banco.
    """

    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first_or_404()
    db.session.delete(task)
    db.session.commit()

    return jsonify({"message": "task deleted"})
