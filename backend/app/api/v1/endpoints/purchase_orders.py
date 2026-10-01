from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import math

from app.core.database import get_db
from app.models.purchase_order import PurchaseOrder, POLineItem
from app.models.supplier import Supplier
from app.schemas.purchase_order import PurchaseOrderCreate, PurchaseOrderResponse

router = APIRouter()

@router.get("", response_model=List[PurchaseOrderResponse])
def list_purchase_orders(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(PurchaseOrder)
    if status and status != "ALL":
        query = query.filter(PurchaseOrder.status == status)
    return query.order_by(PurchaseOrder.created_at.desc()).all()

@router.get("/{id}", response_model=PurchaseOrderResponse)
def get_purchase_order(id: int, db: Session = Depends(get_db)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    return po

@router.post("", response_model=PurchaseOrderResponse)
def create_purchase_order(payload: PurchaseOrderCreate, db: Session = Depends(get_db)):
    existing = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == payload.po_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Purchase order number already exists")

    vendor_name = payload.vendor_name
    if payload.supplier_id:
        supplier = db.query(Supplier).filter(Supplier.id == payload.supplier_id).first()
        if supplier:
            vendor_name = supplier.name

    total_lines = len(payload.line_items)
    total_expected = sum(item.expected_qty for item in payload.line_items)

    po = PurchaseOrder(
        po_number=payload.po_number,
        supplier_id=payload.supplier_id,
        vendor_name=vendor_name,
        carrier=payload.carrier,
        tracking_number=payload.tracking_number,
        status=payload.status,
        order_date=payload.order_date or datetime.utcnow(),
        expected_delivery=payload.expected_delivery or datetime.utcnow(),
        assigned_dock=payload.assigned_dock,
        total_lines=total_lines,
        total_expected_units=total_expected,
        notes=payload.notes
    )
    db.add(po)
    db.flush()

    for item in payload.line_items:
        # Calculate carton count if not passed or 0
        units_per_carton = max(1, item.expected_units_per_carton)
        carton_count = item.expected_carton_count if item.expected_carton_count > 0 else math.ceil(item.expected_qty / units_per_carton)

        line_item = POLineItem(
            po_id=po.id,
            sku=item.sku,
            item_name=item.item_name,
            expected_variant=item.expected_variant or "Standard",
            expected_units_per_carton=units_per_carton,
            expected_carton_count=carton_count,
            expected_qty=item.expected_qty,
            unit_price=item.unit_price,
            inspection_required=item.inspection_required,
            product_id=item.product_id
        )
        db.add(line_item)

    db.commit()
    db.refresh(po)
    return po
