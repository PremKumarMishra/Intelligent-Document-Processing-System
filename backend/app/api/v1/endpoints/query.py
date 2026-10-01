from fastapi import APIRouter,status,Depends,HTTPException
from fastapi.responses import StreamingResponse
from schemas.query import QueryRequest,QueryResponse
from sqlalchemy.ext.asyncio import AsyncSession
from services.hybrid_retriever import hybrid_search
from services.llm_service import stream_rag_response
from db.session import get_db
from schemas.query import Citation
import time

router = APIRouter()

@router.post("/query",response_model=QueryResponse)
async def process_query(payload:QueryRequest,db:AsyncSession = Depends(get_db)):
    start_time  = time.perf_counter()
    chunks = await hybrid_search(payload.query,db,top_k=payload.top_k)
    if not chunks:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="No relevant context found for the query.")
    citations = [
        Citation(
            document_number=str(chunk["document_id"]),
            page_number=chunk["page_number"],
            content_snippet=chunk["page_content"]
        )
        for chunk in chunks
    ]

    answer_tokens = []
    async for token in stream_rag_response(payload.query, chunks):
        answer_tokens.append(token)
    
    full_answer = "".join(answer_tokens)
    latency = (time.perf_counter() - start_time) * 1000

    return QueryResponse(answer=full_answer,citations=citations,latency_ms=round(latency, 2))


@router.post("/query/stream")
async def stream_reponse(payload:QueryRequest,db:AsyncSession = Depends(get_db)):
    chunks = await hybrid_search(payload.query,db,payload.top_k)
    return StreamingResponse(stream_rag_response(payload.query,chunks),media_type="text/event-stream")