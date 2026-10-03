from pydantic import BaseModel,ConfigDict
from datetime import datetime
from uuid import UUID

class DocumentResponse(BaseModel):
    ID:UUID
    file_name: str
    file_type: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True) # A Very Important Brilliancy (Reads Data From Database/Object instead of python dict)

    