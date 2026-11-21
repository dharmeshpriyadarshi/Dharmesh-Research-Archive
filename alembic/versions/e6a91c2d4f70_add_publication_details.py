"""Add academic publication details and lifecycle status.

Revision ID: e6a91c2d4f70
Revises: b8c4e7a1d902
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "e6a91c2d4f70"
down_revision = "b8c4e7a1d902"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("research_papers", sa.Column(
        "authors", postgresql.JSONB(), nullable=False,
        server_default=sa.text("'[]'::jsonb"),
    ))
    op.add_column("research_papers", sa.Column("content", sa.Text(), nullable=True))
    op.add_column("research_papers", sa.Column(
        "publication_status", sa.String(32), nullable=False,
        server_default="Unspecified",
    ))
    op.create_check_constraint(
        "ck_research_papers_publication_status", "research_papers",
        "publication_status IN ('Published', 'Publication in progress', 'Unspecified')",
    )
    # Identify the one known publication; do not classify unknown legacy records.
    op.execute("""UPDATE research_papers SET publication_status = 'Published'
        WHERE slug = 'ecosimulate-research-paper'
        AND doi = '10.1109/ICSCSA66339.2025.11170787'""")


def downgrade():
    op.drop_constraint("ck_research_papers_publication_status", "research_papers", type_="check")
    op.drop_column("research_papers", "publication_status")
    op.drop_column("research_papers", "content")
    op.drop_column("research_papers", "authors")
