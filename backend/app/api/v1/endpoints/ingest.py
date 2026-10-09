from fastapi import status,APIRouter,UploadFile,File,Depends,HTTPException
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.ingest import DocumentResponse
from app.services.ingestion_service import process_ingest_pdf

router = APIRouter()

@router.post("/upload",response_model=DocumentResponse,status_code=status.HTTP_201_CREATED)
async def upload_file(file:UploadFile = File(...),db:AsyncSession = Depends(get_db)):
    if not file.filename.endswith("pdf"):
        raise  HTTPException(status.HTTP_400_BAD_REQUEST,"Invalid file type. Only PDF documents are supported.")
    content = await file.read()
    if not content:
        raise  HTTPException(status.HTTP_400_BAD_REQUEST,"Document's content is empty")
    doc = await process_ingest_pdf(file.filename,content,db)
    return doc



