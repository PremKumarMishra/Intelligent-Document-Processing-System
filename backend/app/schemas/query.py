from pydantic import BaseModel,Field
from typing import List,Optional

class Citation(BaseModel):
    document_number:str
    page_number:int
    content_snippet:str

class QueryRequest(BaseModel):
    query:str =  Field(..., min_length=3, description="User query string")
    doc_id:Optional[List[str]] = Field(default=None, description="Optional target document filters")
    top_k:int = Field(default=4, ge=1, le=20)

class QueryResponse(BaseModel):
    answer:str
    citations: List[Citation]
    latency_ms:float