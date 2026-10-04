from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime
from app.schemas.a2a import ObservedFacts, A2ALineItemContract, CUBECheck

class AgentPhase(str, Enum):
    INITIALIZATION = "INITIALIZATION"
    PLANNING = "PLANNING"
    PERCEPTION = "PERCEPTION"
    VERIFICATION = "VERIFICATION"
    DECISION = "DECISION"
    AUDIT = "AUDIT"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class AgentTraceStep(BaseModel):
    step_number: int
    phase: AgentPhase
    action_name: str
    thought: str
    tool_input: Optional[Dict[str, Any]] = None
    tool_output: Optional[Dict[str, Any]] = None
    duration_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AgentState(BaseModel):
    session_id: str
    manifest_id: str
    phase: AgentPhase = AgentPhase.INITIALIZATION
    contract: A2ALineItemContract
    evidence_images: List[str] = Field(default_factory=list)
    observed_facts: Optional[ObservedFacts] = None
    checks: List[CUBECheck] = Field(default_factory=list)
    policy_violations: List[str] = Field(default_factory=list)
    disposition: Literal["ACCEPTED", "EXCEPTION", "HOLD_FOR_MANUAL_REVIEW"] = "HOLD_FOR_MANUAL_REVIEW"
    disposition_rationale: str = ""
    engine_used: str = "Initializing"
    trace: List[AgentTraceStep] = Field(default_factory=list)
    cube_evidence_record: Optional[Dict[str, Any]] = None
    total_execution_ms: float = 0.0
    completed_at: Optional[datetime] = None

ReceivingAgentState = AgentState
