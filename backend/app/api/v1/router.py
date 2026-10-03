from fastapi import APIRouter
from .endpoints import ingest,extraction,query

api_router = APIRouter()
api_router.include_router(ingest.router,prefix="/documents",tags=["Ingestion"])
api_router.include_router(extraction.router,prefix="/idp",tags=["Structured Extraction"])
api_router.include_router(query.router,prefix="/rag",tags=["Retrieval And Generation"])

