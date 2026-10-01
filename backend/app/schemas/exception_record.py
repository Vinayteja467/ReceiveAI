from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ExceptionRecordBase(BaseModel):
    inspection_id: int
    po_id: Optional[int] = None
    sku: Optional[str] = None
    exception_type: str
    issue: Optional[str] = None # Short shipment, Wrong SKU, Wrong variant, Crushed carton, Water damage, Torn packaging, Missing components
    severity: str = "MEDIUM" # LOW, MEDIUM, HIGH, CRITICAL
    status: str = "OPEN" # OPEN, INVESTIGATING, MANUAL_REVIEW, MORE_EVIDENCE_REQUESTED, SUPPLIER_NOTIFIED, RESOLVED
    discrepancy_details: str
    expected_value: Optional[str] = None
    actual_value: Optional[str] = None
    confidence: Optional[float] = None
    evidence_photo_url: Optional[str] = None
    evidence_citation: Optional[str] = None
    assigned_to: str = "Inbound Operations QA"
    resolution_notes: Optional[str] = None

class ExceptionRecordCreate(ExceptionRecordBase):
    pass

class ExceptionRecordUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None
    issue: Optional[str] = None

class ActionRequestMoreEvidence(BaseModel):
    requested_evidence_type: Optional[str] = "Photograph of unboxed sample units"
    notes: Optional[str] = "Requesting additional visual proof from dock operator."

class ActionMarkManualReview(BaseModel):
    reviewer_name: Optional[str] = "Marcus Vance - QA Lead"
    priority: Optional[str] = "HIGH"
    notes: Optional[str] = "Marked for senior QA inspection review."

class ActionResolveException(BaseModel):
    resolution_type: Optional[str] = "SUPPLIER_CREDIT" # SUPPLIER_CREDIT, RTV_RETURN_TO_VENDOR, ACCEPTED_WITH_WAIVER, SCRAPPED_DAMAGED
    resolution_notes: str
    resolved_by: Optional[str] = "Marcus Vance - QA Lead"

class ExceptionRecordResponse(ExceptionRecordBase):
    id: int
    exception_number: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
