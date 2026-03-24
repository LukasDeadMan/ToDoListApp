"""Shared Flask extensions.

English: Centralizes extension instances so they can be initialized
inside the application factory.
Portugues: Centraliza as instancias das extensoes para que elas sejam
inicializadas dentro da factory da aplicacao.
"""

from flask_cors import CORS
from flask_login import LoginManager
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

# English: Database access layer.
# Portugues: Camada de acesso ao banco de dados.
db = SQLAlchemy()

# English: Database migration manager.
# Portugues: Gerenciador de migracoes do banco.
migrate = Migrate()

# English: Session-based authentication manager.
# Portugues: Gerenciador de autenticacao baseada em sessao.
login_manager = LoginManager()

# English: Cross-origin request configuration.
# Portugues: Configuracao de requisicoes entre origens.
cors = CORS()
