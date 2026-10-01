from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class MetricItem(BaseModel):
    label: str
    value: str
    change: str
    is_positive: bool
    description: str

class DockDoorStatus(BaseModel):
    door: str
    status: str # OCCUPIED, AVAILABLE, INSPECTING, HOLD
    carrier: Optional[str] = None
    po_number: Optional[str] = None
    elapsed_minutes: Optional[int] = None

class DashboardMetrics(BaseModel):
    kpis: List[MetricItem]
    dock_doors: List[DockDoorStatus]
    recent_inspections: List[Dict[str, Any]]
    recent_exceptions: List[Dict[str, Any]]
    volume_by_category: Dict[str, int]
    first_pass_yield_pct: float
    total_received_today: int
    open_exceptions_count: int
