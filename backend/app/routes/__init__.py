from .users import bp as users_bp
from .tasks import bp as tasks_bp

def init_app(app):
    app.register_blueprint(users_bp, url_prefix="/api/v1/users")
    app.register_blueprint(tasks_bp, url_prefix="/api/v1/tasks")
