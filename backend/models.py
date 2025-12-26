from sqlalchemy import Column, Integer, String, Text, DateTime, Index, CheckConstraint
from sqlalchemy.sql import func
from database import Base

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    link = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Constraint: at least title or link must be provided
    __table_args__ = (
        CheckConstraint("title IS NOT NULL OR link IS NOT NULL", name="title_or_link_required"),
        Index("ix_recipes_created_at", "created_at"),
    )