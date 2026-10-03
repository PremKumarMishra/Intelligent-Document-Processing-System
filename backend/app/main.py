from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from db.session import engine
from db.models import Base
from core.config import settings
from core.exceptions import IDPBaseException,idp_exception_handler,global_unhandled_exception_handler
from api.v1 import router

async def lifespan(app:FastAPI):
    print(settings.DATABASE_URL)
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
    allow_origins=["*"],

)

app.include_router(router.api_router,prefix=settings.API_V1_STR)

app.add_exception_handler(IDPBaseException,idp_exception_handler)
app.add_exception_handler(Exception,global_unhandled_exception_handler)

@app.get("/health")
async def health_check():
    return {"status" : "online","system" : settings.PROJECT_NAME}
print(settings.GROQ_API_KEY)