from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.supplier import SupplierResponse

class POLineItemBase(BaseModel):
    sku: str
    item_name: str
    expected_variant: str = "Standard"
    expected_units_per_carton: int = 12
    expected_carton_count: int = 1
    expected_qty: int
    received_qty: int = 0
    unit_price: float = 0.0
    inspection_required: bool = True
    status: str = "PENDING"
    product_id: Optional[int] = None

class POLineItemCreate(POLineItemBase):
    pass

class POLineItemResponse(POLineItemBase):
    id: int
    po_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PurchaseOrderBase(BaseModel):
    po_number: str
    supplier_id: Optional[int] = None
    vendor_name: str
    carrier: str = "Freight Express"
    tracking_number: Optional[str] = None
    status: str = "AT_DOCK"
    order_date: Optional[datetime] = None
    expected_delivery: Optional[datetime] = None
    assigned_dock: str = "Dock 01"
    notes: Optional[str] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    line_items: List[POLineItemCreate] = []

class PurchaseOrderResponse(PurchaseOrderBase):
    id: int
    total_lines: int
    total_expected_units: int
    total_received_units: int
    created_at: datetime
    updated_at: datetime
    supplier: Optional[SupplierResponse] = None
    line_items: List[POLineItemResponse] = []

    class Config:
        from_attributes = True
