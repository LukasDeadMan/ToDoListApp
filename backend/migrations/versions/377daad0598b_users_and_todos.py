"""migrate legacy todo table to todos

Revision ID: 377daad0598b
Revises: 5a8a70d1cdce
Create Date: 2025-08-26 02:43:35.642090

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '377daad0598b'
down_revision = '5a8a70d1cdce'
branch_labels = None
depends_on = None


def table_names():
    """Return the current table names for online migrations."""

    return set(sa.inspect(op.get_bind()).get_table_names())


def upgrade():
    tables = table_names()
    if "todo" not in tables or "todos" in tables or "tasks" in tables:
        return

    # English: Older revisions used an incompatible todo table without user
    # ownership. Keep the historical upgrade behavior by recreating the table
    # in the intermediate format before the final rename revision.
    # Portugues: Revisoes antigas usavam uma tabela todo sem relacionamento de
    # usuario. Mantemos o comportamento historico recriando a tabela no formato
    # intermediario antes da revisao final de rename.
    op.create_table(
        'todos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('done', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column(
            'created_at',
            sa.DateTime(),
            nullable=False,
            server_default=sa.text('CURRENT_TIMESTAMP'),
        ),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.drop_table('todo')


def downgrade():
    tables = table_names()
    if "todos" not in tables or "todo" in tables:
        return

    op.create_table(
        'todo',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.drop_table('todos')
