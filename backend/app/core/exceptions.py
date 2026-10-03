from fastapi.responses import JSONResponse
from fastapi import Request,status
import logging


logger = logging.getLogger(__name__)

class IDPBaseException(Exception):
    def __init__(self,message:str ,status_code:int = status.HTTP_500_INTERNAL_SERVER_ERROR):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class LLMServiceException(IDPBaseException):
    def __init__(self,message:str):
        super().__init__(f"LLM Provider Error: {message}", status_code=status.HTTP_502_BAD_GATEWAY)

class DocumentProcessingException(IDPBaseException):
    def __init__(self,message:str):
            super().__init__(message=f"Document Ingestion Error: {message}", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

class VectorSearchException(IDPBaseException):
    def __init__(self,message:str):
            super().__init__(message=f"Retrieval Error: {message}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

async def idp_exception_handler(request: Request, exc: IDPBaseException) -> JSONResponse:
    """Global exception handler for custom IDP exceptions."""
    logger.error(f"IDP Error on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.__class__.__name__,
            "message": exc.message,
            "path": str(request.url.path)
        }
    )

async def global_unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.critical(f"Unhandled Exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred. Please check server logs.",
            "path": str(request.url.path)
        }
    )

async def global_unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.critical(f"Unhandled Exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred. Please check server logs.",
            "path": str(request.url.path)
        }
    )