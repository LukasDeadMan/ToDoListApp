"""historical cleanup no-op

Revision ID: 377daad0598b
Revises: 5a8a70d1cdce
Create Date: 2025-08-26 02:43:35.642090

"""
# revision identifiers, used by Alembic.
revision = '377daad0598b'
down_revision = '5a8a70d1cdce'
branch_labels = None
depends_on = None


def upgrade():
    # English: Historical migration kept as a no-op after normalizing the base
    # schema in the initial revision for fresh installs.
    # Portugues: Migracao historica mantida como no-op apos normalizar o schema
    # base na revisao inicial para novas instalacoes.
    pass


def downgrade():
    pass
