"""rename legacy todos table to tasks

Revision ID: 5d911f034f26
Revises: 377daad0598b
Create Date: 2025-08-28 01:55:33.153390

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5d911f034f26'
down_revision = '377daad0598b'
branch_labels = None
depends_on = None


def table_names():
    """Return the current table names for online migrations."""

    return set(sa.inspect(op.get_bind()).get_table_names())


def upgrade():
    tables = table_names()
    if "todos" not in tables or "tasks" in tables:
        return

    op.rename_table('todos', 'tasks')


def downgrade():
    tables = table_names()
    if "tasks" not in tables or "todos" in tables:
        return

    op.rename_table('tasks', 'todos')
