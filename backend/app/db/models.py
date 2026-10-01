import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID,TSVECTOR
from sqlalchemy import *
from sqlalchemy.orm import mapped_column,Mapped,DeclarativeBase,relationship
from pgvector.sqlalchemy import Vector
from typing import List

class Base(DeclarativeBase):
    pass

class Document(Base):
    __tablename__ = "documents"
    ID:Mapped[UUID] = mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4())
    file_name:Mapped[str] = mapped_column(String(255),nullable=False)
    file_type:Mapped[str] = mapped_column(String(255),nullable=False)
    created_at:Mapped[datetime] = mapped_column(DateTime(timezone=True),server_default=func.now())
    chunks:Mapped[List["DocumentChunk"]] = relationship("DocumentChunk",back_populates="document",cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"
    ID:Mapped[UUID] = mapped_column(UUID(as_uuid=True),primary_key=True,default=uuid.uuid4())
    document_id:Mapped[UUID] = mapped_column(UUID(as_uuid=True),ForeignKey("documents.ID",ondelete="CASCADE"),nullable=False)
    page_number:Mapped[int] = mapped_column(Integer,nullable=False)
    page_content:Mapped[str] = mapped_column(Text,nullable=False)
    embedding:Mapped[List[float]] = mapped_column(Vector(384),nullable=False)
    fts_tokens:Mapped[str] = mapped_column(TSVECTOR,nullable=False) 
    document:Mapped["Document"] = relationship("Document",back_populates="chunks")

Index("idx_chunks_embedding",
      DocumentChunk.embedding,
      postgresql_using="hnsw",
      postgresql_with={"m": 16, "ef_construction": 64},
      postgresql_ops = {"embedding":"vector_cosine_ops"}
      )
Index("idx_chunks_fts", DocumentChunk.fts_tokens, postgresql_using="gin")