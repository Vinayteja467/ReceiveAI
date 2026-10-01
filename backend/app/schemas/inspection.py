from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class InspectionItemBase(BaseModel):
    sku: str
    item_name: str
    sampled_quantity: int = 1
    passed_quantity: int = 1
    defective_quantity: int = 0
    defect_category: Optional[str] = None
    status: str = "PASSED"
    notes: Optional[str] = None
    product_id: Optional[int] = None
    po_line_item_id: Optional[int] = None

class InspectionItemCreate(InspectionItemBase):
    pass

class InspectionItemUpdate(BaseModel):
    sampled_quantity: Optional[int] = None
    passed_quantity: Optional[int] = None
    defective_quantity: Optional[int] = None
    defect_category: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class InspectionItemResponse(InspectionItemBase):
    id: int
    inspection_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InspectionBase(BaseModel):
    po_id: int
    dock_door: str = "Dock 01"
    inspector_name: str = "Lead Specialist"
    carrier_checkin_seal_intact: bool = True
    carrier_bol_match: bool = True
    temperature_reading_c: Optional[float] = None
    notes: Optional[str] = None

class InspectionCreate(InspectionBase):
    items: List[InspectionItemCreate] = []
    evidence_ids: List[int] = []

class InspectionUpdate(BaseModel):
    status: Optional[str] = None
    overall_disposition: Optional[str] = None
    notes: Optional[str] = None
    carrier_checkin_seal_intact: Optional[bool] = None
    carrier_bol_match: Optional[bool] = None
    temperature_reading_c: Optional[float] = None

class InspectionFinalize(BaseModel):
    overall_disposition: str # ACCEPTED, ACCEPTED_WITH_EXCEPTIONS, QUARANTINED, REJECTED
    notes: Optional[str] = None

class InspectionResponse(InspectionBase):
    id: int
    inspection_number: str
    status: str
    overall_disposition: str
    started_at: datetime
    completed_at: Optional[datetime] = None
    total_items_inspected: int
    total_passed_items: int
    total_defects_found: int
    created_at: datetime
    updated_at: datetime
    items: List[InspectionItemResponse] = []

    class Config:
        from_attributes = True

class InspectionAIResponse(BaseModel):
    status: str
    inspection_id: int
    inspection_number: str
    po_number: str
    total_photographs_scanned: int
    evidence_breakdown: Dict[str, int]
    pipeline_name: str
    message: str
    placeholder_notice: str
    timestamp: str
