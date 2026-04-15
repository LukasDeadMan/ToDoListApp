"""historical rename no-op

Revision ID: 5d911f034f26
Revises: 377daad0598b
Create Date: 2025-08-28 01:55:33.153390

"""
# revision identifiers, used by Alembic.
revision = '5d911f034f26'
down_revision = '377daad0598b'
branch_labels = None
depends_on = None


def upgrade():
    # English: Fresh databases already create the final tasks table in the
    # initial migration, so this historical revision no longer needs to mutate
    # schema objects.
    # Portugues: Bancos novos ja criam a tabela final tasks na migracao
    # inicial, entao esta revisao historica nao precisa mais alterar o schema.
    pass


def downgrade():
    pass
