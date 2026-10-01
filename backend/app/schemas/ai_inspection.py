from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

class EvidenceCitation(BaseModel):
    image: str
    finding: str
    category: Optional[str] = None
    image_url: Optional[str] = None

class VerificationCheck(BaseModel):
    status: Literal["PASS", "FAIL", "UNCERTAIN"]
    expected: Any
    observed: Any
    confidence: float
    evidence: List[EvidenceCitation] = []
    explanation: str

class AIInspectionReport(BaseModel):
    inspection_id: int
    inspection_number: Optional[str] = None
    po_number: str
    supplier_name: Optional[str] = "Unknown Supplier"
    date_time: Optional[datetime] = None
    sku: str
    product_name: str
    inspection_mode: Literal["LIVE_AI_MODEL", "DETERMINISTIC_DEMO_MODE"]
    engine_name: str
    overall_verdict: Literal["PASS", "FAIL", "FLAGGED_FOR_REVIEW"]
    overall_decision: Literal["ACCEPTED", "EXCEPTION", "UNCERTAIN"] = "UNCERTAIN"
    confidence_score: float
    checks: Dict[str, VerificationCheck]
    damage_breakdown: Optional[Dict[str, VerificationCheck]] = None
    attached_photos: Optional[List[Dict[str, Any]]] = None
    summary: str
    recommendation: Literal["ACCEPT", "ACCEPT_WITH_EXCEPTIONS", "HOLD_FOR_MANUAL_REVIEW", "REJECT"]
    timestamp: datetime
