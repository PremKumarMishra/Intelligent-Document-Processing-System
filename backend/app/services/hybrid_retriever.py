from sentence_transformers import SentenceTransformer
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict,List,Any

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

async def hybrid_search(query:str,db:AsyncSession,top_k:int=4,rrf_k:int =60) ->List[Dict[str,Any]]:
    query_vector = embedding_model.encode(query).tolist()
    sql = text("""
    WITH semantic_search AS (
        SELECT "ID", page_content, page_number, document_id,
               ROW_NUMBER() OVER (ORDER BY embedding <=> :vector) as rank
        FROM document_chunks
        ORDER BY embedding <=> :vector
        LIMIT 20
    ),
    keyword_search AS (
        SELECT "ID", page_content, page_number, document_id,
               ROW_NUMBER() OVER (ORDER BY ts_rank(fts_tokens, plainto_tsquery('english', :query)) DESC) as rank
        FROM document_chunks
        WHERE fts_tokens @@ plainto_tsquery('english', :query)
        LIMIT 20
    )
    SELECT 
        COALESCE(s."ID", k."ID") as chunk_id,
        COALESCE(s.page_content, k.page_content) as page_content,
        COALESCE(s.page_number, k.page_number) as page_number,
        COALESCE(s.document_id, k.document_id) as document_id,
        (COALESCE(1.0 / (:rrf_k + s.rank), 0.0) + COALESCE(1.0 / (:rrf_k + k.rank), 0.0)) as rrf_score
    FROM semantic_search s
    FULL OUTER JOIN keyword_search k ON s."ID" = k."ID"
    ORDER BY rrf_score DESC
    LIMIT :top_k;
    """)

    result = await db.execute(sql,{
        "vector" : str(query_vector),
        "query" : query,
        "rrf_k" : rrf_k,
        "top_k" :top_k
    })

    rows = result.fetchall()
    return [
        {
            "chunk_id" : r.chunk_id,
            "document_id" : r.document_id,
            "page_number" : r.page_number,
            "page_content" : r.page_content,
            "score": r.rrf_score
        }
        for r in rows
    ]

