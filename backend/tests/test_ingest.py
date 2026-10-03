import pytest
from httpx import AsyncClient
from fastapi import status

@pytest.mark.asyncio
async def test_health_check(client:AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

@pytest.mark.asyncio
async def test_upload_invalid(client:AsyncClient,dummy_pdf_file):
    files ={"file" : ("test.txt",b"Hello World","text/plain")}
    response = await client.post("/api/v1/documents/upload",files=files)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "Invalid file type. Only PDF documents are supported." in response.json()["detail"]

@pytest.mark.asyncio
async def test_upload_valid(client:AsyncClient,dummy_pdf_file):
    files = {"file" : dummy_pdf_file}
    response = await client.post("/api/v1/documents/upload",files=files)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "ID" in data
    assert data["file_name"] == "sample.pdf"


