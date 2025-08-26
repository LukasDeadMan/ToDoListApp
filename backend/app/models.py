from .extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), nullable=False)   # nome real
    nickname = db.Column(db.String(80), unique=True, nullable=False)  # handle único
    email = db.Column(db.String(120), unique=True, nullable=False)    # único
    password = db.Column(db.String(200), nullable=False)   # hash da senha

    todos = db.relationship(
        "Todo",
        back_populates="user",
        cascade="all, delete-orphan"
    )


    def set_password(self, password_plain):
        self.password = generate_password_hash(password_plain)

    def check_password(self, password_plain):
        return check_password_hash(self.password, password_plain)

    def __repr__(self):
        return f"<User {self.nickname}>"


class Todo(db.Model):
    __tablename__ = "todos"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    done = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", back_populates="todos")