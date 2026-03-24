"""Route registration module.

English: Keeps blueprint wiring in a single place.
Portugues: Mantem o registro dos blueprints em um unico lugar.
"""

from .tasks import bp as tasks_bp
from .users import bp as users_bp


def init_app(app):
    """Register all API blueprints.

    English: Separates route declaration from application setup.
    Portugues: Separa a declaracao das rotas da configuracao da aplicacao.
    """

    app.register_blueprint(users_bp, url_prefix="/api/v1/users")
    app.register_blueprint(tasks_bp, url_prefix="/api/v1/tasks")
