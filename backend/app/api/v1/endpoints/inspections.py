from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

from app.core.database import get_db
from app.models.inspection import Inspection, InspectionItem
from app.models.purchase_order import PurchaseOrder, POLineItem
from app.models.exception_record import ExceptionRecord
from app.models.evidence import EvidenceItem
from app.services.inspection_service import run_ai_inspection_placeholder
from app.schemas.ai_inspection import AIInspectionReport
from app.schemas.inspection import (
    InspectionCreate,
    InspectionResponse,
    InspectionUpdate,
    InspectionItemUpdate,
    InspectionFinalize
)

router = APIRouter()

@router.get("", response_model=List[dict])
def list_inspections(
    status: Optional[str] = None,
    dock: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Inspection)
    if status and status != "ALL":
        if status == "PASSED":
            query = query.filter((Inspection.status == "PASSED") | (Inspection.overall_disposition == "ACCEPTED"))
        elif status == "FLAGGED":
            query = query.filter((Inspection.status == "FLAGGED") | (Inspection.overall_disposition == "EXCEPTION"))
        elif status == "UNCERTAIN":
            query = query.filter((Inspection.overall_disposition == "UNCERTAIN") | (Inspection.status == "FLAGGED_FOR_REVIEW"))
        else:
            query = query.filter(Inspection.status == status)
    if dock:
        query = query.filter(Inspection.dock_door.contains(dock))

    inspections = query.order_by(Inspection.created_at.desc()).limit(limit).all()

    results = []
    for ins in inspections:
        results.append({
            "id": ins.id,
            "inspection_number": ins.inspection_number,
            "po_id": ins.po_id,
            "po_number": ins.purchase_order.po_number if ins.purchase_order else "N/A",
            "vendor_name": ins.purchase_order.vendor_name if ins.purchase_order else "N/A",
            "carrier": ins.purchase_order.carrier if ins.purchase_order else "N/A",
            "dock_door": ins.dock_door,
            "inspector_name": ins.inspector_name,
            "carrier_checkin_seal_intact": ins.carrier_checkin_seal_intact,
            "carrier_bol_match": ins.carrier_bol_match,
            "temperature_reading_c": ins.temperature_reading_c,
            "status": ins.status,
            "overall_disposition": ins.overall_disposition,
            "started_at": ins.started_at.isoformat() if ins.started_at else None,
            "completed_at": ins.completed_at.isoformat() if ins.completed_at else None,
            "total_items_inspected": ins.total_items_inspected,
            "total_passed_items": ins.total_passed_items,
            "total_defects_found": ins.total_defects_found,
            "items_count": len(ins.items),
            "exceptions_count": len(ins.exceptions),
            "evidence_count": len(ins.evidence),
            "notes": ins.notes
        })
    return results

@router.post("", response_model=dict)
def create_inspection(payload: InspectionCreate, db: Session = Depends(get_db)):
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == payload.po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")

    count = db.query(Inspection).count() + 1
    inspection_number = f"INS-2026-{count:04d}"

    new_inspection = Inspection(
        inspection_number=inspection_number,
        po_id=payload.po_id,
        dock_door=payload.dock_door,
        inspector_name=payload.inspector_name,
        carrier_checkin_seal_intact=payload.carrier_checkin_seal_intact,
        carrier_bol_match=payload.carrier_bol_match,
        temperature_reading_c=payload.temperature_reading_c,
        status="IN_PROGRESS",
        overall_disposition="PENDING_REVIEW",
        notes=payload.notes,
        started_at=datetime.utcnow()
    )
    db.add(new_inspection)
    db.flush()

    # Link any staged evidence IDs to this inspection
    if payload.evidence_ids:
        staged_items = db.query(EvidenceItem).filter(EvidenceItem.id.in_(payload.evidence_ids)).all()
        for ev in staged_items:
            ev.inspection_id = new_inspection.id
            ev.po_id = po.id

    total_inspected = 0
    total_passed = 0
    total_defects = 0

    if payload.items:
        for it in payload.items:
            item_record = InspectionItem(
                inspection_id=new_inspection.id,
                po_line_item_id=it.po_line_item_id,
                product_id=it.product_id,
                sku=it.sku,
                item_name=it.item_name,
                sampled_quantity=it.sampled_quantity,
                passed_quantity=it.passed_quantity,
                defective_quantity=it.defective_quantity,
                defect_category=it.defect_category,
                status=it.status,
                notes=it.notes
            )
            total_inspected += it.sampled_quantity
            total_passed += it.passed_quantity
            total_defects += it.defective_quantity
            db.add(item_record)
    else:
        # Auto populate from PO line items
        for li in po.line_items:
            item_record = InspectionItem(
                inspection_id=new_inspection.id,
                po_line_item_id=li.id,
                product_id=li.product_id,
                sku=li.sku,
                item_name=li.item_name,
                sampled_quantity=max(1, int(li.expected_qty * 0.1)),
                passed_quantity=max(1, int(li.expected_qty * 0.1)),
                defective_quantity=0,
                defect_category=None,
                status="PASSED",
                notes=f"Auto-generated inspection sample for line item {li.sku}"
            )
            total_inspected += item_record.sampled_quantity
            total_passed += item_record.passed_quantity
            db.add(item_record)

    new_inspection.total_items_inspected = total_inspected
    new_inspection.total_passed_items = total_passed
    new_inspection.total_defects_found = total_defects

    po.status = "AT_DOCK"
    db.commit()
    db.refresh(new_inspection)

    return {
        "id": new_inspection.id,
        "inspection_number": new_inspection.inspection_number,
        "status": new_inspection.status,
        "message": "Inspection initiated successfully"
    }

@router.get("/{id}")
def get_inspection_details(id: int, db: Session = Depends(get_db)):
    ins = db.query(Inspection).filter(Inspection.id == id).first()
    if not ins:
        raise HTTPException(status_code=404, detail="Inspection not found")

    items = []
    for it in ins.items:
        items.append({
            "id": it.id,
            "sku": it.sku,
            "item_name": it.item_name,
            "sampled_quantity": it.sampled_quantity,
            "passed_quantity": it.passed_quantity,
            "defective_quantity": it.defective_quantity,
            "defect_category": it.defect_category,
            "status": it.status,
            "notes": it.notes
        })

    exceptions = []
    for exc in ins.exceptions:
        exceptions.append({
            "id": exc.id,
            "exception_number": exc.exception_number,
            "sku": exc.sku,
            "exception_type": exc.exception_type,
            "severity": exc.severity,
            "status": exc.status,
            "discrepancy_details": exc.discrepancy_details,
            "assigned_to": exc.assigned_to
        })

    evidence = []
    for ev in ins.evidence:
        evidence.append({
            "id": ev.id,
            "file_name": ev.file_name,
            "file_path": ev.file_path,
            "url": f"/{ev.file_path}",
            "file_type": ev.file_type,
            "category": ev.category or "CARTONS",
            "file_size_bytes": ev.file_size_bytes,
            "caption": ev.caption,
            "confidence_score": ev.confidence_score,
            "tags": ev.tags
        })

    po_data = None
    if ins.purchase_order:
        po_data = {
            "id": ins.purchase_order.id,
            "po_number": ins.purchase_order.po_number,
            "vendor_name": ins.purchase_order.vendor_name,
            "carrier": ins.purchase_order.carrier,
            "tracking_number": ins.purchase_order.tracking_number,
            "assigned_dock": ins.purchase_order.assigned_dock
        }

    return {
        "id": ins.id,
        "inspection_number": ins.inspection_number,
        "po_id": ins.po_id,
        "purchase_order": po_data,
        "dock_door": ins.dock_door,
        "inspector_name": ins.inspector_name,
        "carrier_checkin_seal_intact": ins.carrier_checkin_seal_intact,
        "carrier_bol_match": ins.carrier_bol_match,
        "temperature_reading_c": ins.temperature_reading_c,
        "status": ins.status,
        "overall_disposition": ins.overall_disposition,
        "started_at": ins.started_at.isoformat() if ins.started_at else None,
        "completed_at": ins.completed_at.isoformat() if ins.completed_at else None,
        "total_items_inspected": ins.total_items_inspected,
        "total_passed_items": ins.total_passed_items,
        "total_defects_found": ins.total_defects_found,
        "notes": ins.notes,
        "items": items,
        "exceptions": exceptions,
        "evidence": evidence
    }

@router.post("/{id}/ai-inspect", response_model=AIInspectionReport)
def trigger_ai_inspection(id: int, db: Session = Depends(get_db)):
    try:
        report = run_ai_inspection_placeholder(id, db)
        return report
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI engine execution error: {str(e)}")

@router.put("/{id}")
def update_inspection(id: int, payload: InspectionUpdate, db: Session = Depends(get_db)):
    ins = db.query(Inspection).filter(Inspection.id == id).first()
    if not ins:
        raise HTTPException(status_code=404, detail="Inspection not found")

    if payload.status is not None:
        ins.status = payload.status
    if payload.overall_disposition is not None:
        ins.overall_disposition = payload.overall_disposition
    if payload.notes is not None:
        ins.notes = payload.notes
    if payload.carrier_checkin_seal_intact is not None:
        ins.carrier_checkin_seal_intact = payload.carrier_checkin_seal_intact
    if payload.carrier_bol_match is not None:
        ins.carrier_bol_match = payload.carrier_bol_match
    if payload.temperature_reading_c is not None:
        ins.temperature_reading_c = payload.temperature_reading_c

    db.commit()
    return {"message": "Inspection updated successfully"}

@router.put("/{id}/items/{item_id}")
def update_inspection_item(id: int, item_id: int, payload: InspectionItemUpdate, db: Session = Depends(get_db)):
    item = db.query(InspectionItem).filter(InspectionItem.id == item_id, InspectionItem.inspection_id == id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inspection item not found")

    if payload.sampled_quantity is not None:
        item.sampled_quantity = payload.sampled_quantity
    if payload.passed_quantity is not None:
        item.passed_quantity = payload.passed_quantity
    if payload.defective_quantity is not None:
        item.defective_quantity = payload.defective_quantity
    if payload.defect_category is not None:
        item.defect_category = payload.defect_category
    if payload.status is not None:
        item.status = payload.status
    if payload.notes is not None:
        item.notes = payload.notes

    # Re-calculate totals on the inspection
    ins = db.query(Inspection).filter(Inspection.id == id).first()
    if ins:
        ins.total_items_inspected = sum(it.sampled_quantity for it in ins.items)
        ins.total_passed_items = sum(it.passed_quantity for it in ins.items)
        ins.total_defects_found = sum(it.defective_quantity for it in ins.items)

    db.commit()
    return {"message": "Inspection item updated"}

@router.post("/{id}/finalize")
def finalize_inspection(id: int, payload: InspectionFinalize, db: Session = Depends(get_db)):
    ins = db.query(Inspection).filter(Inspection.id == id).first()
    if not ins:
        raise HTTPException(status_code=404, detail="Inspection not found")

    ins.overall_disposition = payload.overall_disposition
    ins.completed_at = datetime.utcnow()

    if payload.overall_disposition == "ACCEPTED":
        ins.status = "PASSED"
        if ins.purchase_order:
            ins.purchase_order.status = "RECEIVED"
            ins.purchase_order.total_received_units = ins.purchase_order.total_expected_units
    elif payload.overall_disposition in ["ACCEPTED_WITH_EXCEPTIONS", "QUARANTINED"]:
        ins.status = "FLAGGED"
        if ins.purchase_order:
            ins.purchase_order.status = "PARTIALLY_RECEIVED"
    else:
        ins.status = "REJECTED"

    if payload.notes:
        ins.notes = f"{ins.notes}\n[Final Disposition]: {payload.notes}" if ins.notes else payload.notes

    db.commit()
    return {
        "message": "Inspection finalized successfully",
        "inspection_number": ins.inspection_number,
        "status": ins.status,
        "disposition": ins.overall_disposition
    }
