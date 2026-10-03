from httpx import AsyncClient
from fastapi import status
import pytest

@pytest.mark.asyncio
async def test_validate_query(client:AsyncClient):
    query = {"query" : "hi","top_k" : 4}
    response = await client.post("/api/v1/rag/query",json=query)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

@pytest.mark.asyncio
async def test_extraction_missing_document(client:AsyncClient):
    payload = {
        "document_id": "00000000-0000-0000-0000-000000000000",
        "fields_to_extract": ["invoice_number", "total_amount"]
    }
    response = await client.post("/api/v1/idp/extract",json=payload)
    assert response.status_code == 404

