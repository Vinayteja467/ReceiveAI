from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EvidenceItemBase(BaseModel):
    inspection_id: Optional[int] = None
    po_id: Optional[int] = None
    file_name: str
    file_path: str
    file_type: str = "IMAGE"
    category: str = "CARTONS" # CARTONS, PRODUCTS, LABELS, PACKAGING, RECEIVING_AREA
    file_size_bytes: int = 0
    caption: Optional[str] = None
    confidence_score: Optional[float] = None
    tags: str = "receiving,dock"
    notes: Optional[str] = None

class EvidenceItemCreate(EvidenceItemBase):
    pass

class EvidenceItemResponse(EvidenceItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
