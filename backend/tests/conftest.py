import io
from httpx import AsyncClient,ASGITransport
from app.main import app
from app.db.session import engine
import pytest 
import pytest_asyncio

@pytest_asyncio.fixture
async def client():
    transport = ASGITransport(app)
    async with AsyncClient(transport=transport,base_url="http://test") as ac:
        yield ac

@pytest_asyncio.fixture(autouse=True)
async def cleanup_db_engine():
    yield
    await engine.dispose()


@pytest.fixture
async def dummy_pdf_file():
    pdf_content = (
        b"%PDF-1.4\n"
        b"1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n"
        b"3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\n"
        b"xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\n"
        b"trailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF"
    )
    return ("sample.pdf",io.BytesIO(pdf_content),"application/pdf")

