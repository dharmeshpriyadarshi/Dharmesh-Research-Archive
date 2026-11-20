"""Add planned project status.

Revision ID: b8c4e7a1d902
Revises: 2ad9595a382a
"""

from alembic import op

revision = "b8c4e7a1d902"
down_revision = "2ad9595a382a"
branch_labels = None
depends_on = None


def upgrade():
    op.execute(
        "ALTER TYPE project_status ADD VALUE 'Planned'"
    )


def downgrade():
    op.execute("""
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1 FROM projects
                WHERE status::text = 'Planned'
            ) THEN
                RAISE EXCEPTION
                    'Cannot downgrade while planned projects exist';
            END IF;
        END $$;
    """)

    op.execute(
        "ALTER TYPE project_status RENAME TO project_status_old"
    )

    op.execute("""
        CREATE TYPE project_status AS ENUM (
            'In Progress', 'Completed', 'Deployed'
        )
    """)

    op.execute("""
        ALTER TABLE projects
        ALTER COLUMN status TYPE project_status
        USING status::text::project_status
    """)

    op.execute("DROP TYPE project_status_old")
