from fastapi import APIRouter,status,HTTPException,Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.schemas.extraction import ExtractionRequest,ExtractionResponse
from app.core.config import settings
from app.db.session import get_db
from app.db.models import DocumentChunk
import time
import httpx
import json

router = APIRouter()
@router.post("/extract",response_model=ExtractionResponse)
async def extract(payload:ExtractionRequest,db:AsyncSession = Depends(get_db)):
    start_time = time.perf_counter()
    stmt = (select(DocumentChunk)
            .where(DocumentChunk.document_id == payload.document_id)
            .order_by(DocumentChunk.page_number))
    result = await db.execute(stmt)
    chunks = result.scalars().all()
    if not chunks:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail=f"No document chunks found for document_id: {payload.document_id}")
    
    context_text = "\n\n".join([f"[Page {c['page_number']}]: {c['page_content']}" for c in chunks])
    fields_target = ", ".join(payload.fields_to_extract) if payload.fields_to_extract else "all key information and metadata"

    system_prompt = (
        "You are an enterprise document extraction assistant. "
        "Extract the requested information strictly from the provided text and output valid JSON only."
    )

    user_prompt = f"Target Fields: [{fields_target}]\n\nDocument Text:\n{context_text[:12000]}"

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": settings.DEFAULT_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.1
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        async with client.stream("POST",settings.GROQ_BASE_URL,headers=headers,json=payload) as response:
            if response.status_code != 200:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,detail=f"Extraction provider error: {response.text}")
            raw_content = response.json()["choices"][0]["message"]["content"]
        try:
            extracted_data = json.loads(raw_content)
        except json.JSONDecodeError:
            extracted_data = {"raw_output":raw_content}
        latency = (time.perf_counter() - start_time) * 1000
        return ExtractionResponse(
            document_id=payload.document_id,
            extracted_data=extracted_data,
            latency_ms=round(latency,2)
        )


    