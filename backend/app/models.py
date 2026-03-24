from datetime import datetime

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from .extensions import db


class User(UserMixin, db.Model):
    """User account model.

    English: Stores identity fields and the relationship with tasks.
    Portugues: Armazena dados de identidade e o relacionamento com tarefas.
    """

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), nullable=False)
    nickname = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    tasks = db.relationship(
        "Task",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def set_password(self, password_plain):
        """Hash and store the plain password.

        English: Never store the password in plain text.
        Portugues: Nunca armazene a senha em texto puro.
        """

        self.password = generate_password_hash(password_plain)

    def check_password(self, password_plain):
        """Validate a plain password against the stored hash.

        English: Returns True only when the hash matches.
        Portugues: Retorna True somente quando o hash confere.
        """

        return check_password_hash(self.password, password_plain)

    def __repr__(self):
        return f"<User {self.nickname}>"


class Task(db.Model):
    """Task model owned by a single user.

    English: Represents one to-do item linked to its creator.
    Portugues: Representa um item da lista ligado ao seu criador.
    """

    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    done = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", back_populates="tasks")
