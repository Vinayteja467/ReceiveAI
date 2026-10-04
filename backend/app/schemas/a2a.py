from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime

class CUBECheck(BaseModel):
    check_name: str
    status: Literal["PASS", "FAIL", "UNCERTAIN"]
    expected: Any
    observed: Any
    confidence: float
    explanation: str

class ObservedFacts(BaseModel):
    detected_sku: Optional[str] = None
    detected_variant: Optional[str] = None
    detected_barcode: Optional[str] = None
    observed_units_count: Optional[int] = None
    observed_carton_count: Optional[int] = None
    carton_damage_present: bool = False
    carton_damage_type: Optional[str] = "none"
    product_damage_present: bool = False
    seal_status: Literal["INTACT", "BROKEN", "MISSING", "UNCERTAIN"] = "INTACT"
    label_legible: bool = True
    components_found: List[str] = Field(default_factory=list)
    image_quality_adequate: bool = True
    observation_confidence: float = 0.95
    observation_notes: str = ""

class A2ALineItemContract(BaseModel):
    sku: str
    item_name: str
    expected_variant: str = "Standard"
    expected_units: int = 24
    units_per_carton: int = 12
    expected_cartons: int = 2
    expected_barcode: Optional[str] = None
    required_components: List[str] = Field(default_factory=list)

class A2AInspectRequest(BaseModel):
    manifest_id: str = "PO-2026-00124"
    line_item: A2ALineItemContract
    evidence_images: List[str] = Field(
        default_factory=list,
        description="List of image URLs, local file paths, or Base64 data strings"
    )
    timeout_seconds: float = Field(default=12.0, ge=1.0, le=60.0)

class A2AInspectResponse(BaseModel):
    contract_version: str = "1.0.0"
    manifest_id: str
    sku: str
    disposition: Literal["ACCEPTED", "EXCEPTION", "HOLD_FOR_MANUAL_REVIEW"]
    confidence_score: float
    checks: List[CUBECheck] = Field(
        default_factory=list,
        description="CUBE standardized checks[] array with PASS, FAIL, UNCERTAIN status"
    )
    cube_evidence_record: Dict[str, Any] = Field(
        default_factory=dict,
        description="Standardized CUBE evidence record payload for the orchestrator"
    )
    observed_facts: ObservedFacts
    policy_violations: List[str] = Field(default_factory=list)
    disposition_rationale: str
    engine_used: str
    execution_time_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
