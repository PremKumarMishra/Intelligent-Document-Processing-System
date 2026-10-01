import io
from db.models import Document,DocumentChunk
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

async def  process_ingest_pdf(file_name:str,file_bytes:bytes,db:AsyncSession) -> Document:
    document = Document(file_name=file_name,file_type="pdf")
    db.add(document)
    await db.flush()
    reader = PdfReader(io.BytesIO(file_bytes))
    chunk_list = []
    for page_idx,page in enumerate(reader.pages):
        raw_text = page.extract_text() or ""
        if not raw_text.strip():
            continue

        chunk_size = 500
        overlap = 50
        start = 0
        while start < len(raw_text):
            chunk = raw_text[start:start+chunk_size]
            if chunk.strip():
                vector = embedding_model.encode(chunk).tolist()
                print(vector)
                print(len(vector))
                document_chunk = DocumentChunk(
                    document_id = document.ID,
                    page_number = page_idx,
                    page_content = chunk,
                    embedding = vector,
                    fts_tokens = func.to_tsvector("english",chunk)
                )
                chunk_list.append(document_chunk)
            start+= (chunk_size - overlap)
    db.add_all(chunk_list)
    await db.commit()
    await db.refresh(document)
    return document

    