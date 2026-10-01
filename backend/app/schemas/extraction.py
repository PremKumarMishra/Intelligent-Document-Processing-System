from pydantic import BaseModel,Field
from typing import List,Dict,Any,Optional
from uuid import UUID

class ExtractionRequest(BaseModel):
    document_id : UUID = Field(...,description="Target Document ID")
    fields_to_extract:Optional[List[str]] = Field(default=None,description="Optional list of specific key fields to extract (e.g., ['invoice_number', 'date', 'total'])")

class ExtractionResponse(BaseModel):
    document_id: str
    extracted_data: Dict[str, Any] = Field(..., description="Structured JSON containing key-value pairs extracted from document context")
    latency_ms: float = Field(..., description="Processing time in milliseconds")

