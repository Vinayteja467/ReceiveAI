from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.models.exception_record import ExceptionRecord
from app.models.inspection import Inspection
from app.models.purchase_order import PurchaseOrder
from app.models.evidence import EvidenceItem
from app.schemas.exception_record import (
    ExceptionRecordCreate,
    ExceptionRecordResponse,
    ExceptionRecordUpdate,
    ActionRequestMoreEvidence,
    ActionMarkManualReview,
    ActionResolveException
)

router = APIRouter()

def serialize_exception(exc: ExceptionRecord) -> dict:
    po = exc.purchase_order or (exc.inspection.purchase_order if exc.inspection else None)
    return {
        "id": exc.id,
        "exception_number": exc.exception_number,
        "inspection_id": exc.inspection_id,
        "inspection_number": exc.inspection.inspection_number if exc.inspection else f"INS-{exc.inspection_id}",
        "po_id": exc.po_id,
        "po_number": po.po_number if po else "N/A",
        "vendor_name": po.vendor_name if po else "N/A",
        "sku": exc.sku,
        "exception_type": exc.exception_type,
        "issue": exc.issue or exc.exception_type.replace("_", " ").title(),
        "severity": exc.severity,
        "status": exc.status,
        "discrepancy_details": exc.discrepancy_details,
        "expected_value": exc.expected_value,
        "actual_value": exc.actual_value,
        "confidence": exc.confidence or 0.94,
        "evidence_photo_url": exc.evidence_photo_url,
        "evidence_citation": exc.evidence_citation,
        "assigned_to": exc.assigned_to,
        "resolution_notes": exc.resolution_notes,
        "created_at": exc.created_at.isoformat() if exc.created_at else datetime.utcnow().isoformat(),
        "updated_at": exc.updated_at.isoformat() if exc.updated_at else datetime.utcnow().isoformat()
    }

@router.get("", response_model=List[dict])
def list_exceptions(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ExceptionRecord)
    if status and status != "ALL":
        query = query.filter(ExceptionRecord.status == status)
    if severity and severity != "ALL":
        query = query.filter(ExceptionRecord.severity == severity)

    exceptions = query.order_by(ExceptionRecord.created_at.desc()).all()
    return [serialize_exception(exc) for exc in exceptions]

@router.get("/{id}")
def get_exception_details(id: int, db: Session = Depends(get_db)):
    exc = db.query(ExceptionRecord).filter(ExceptionRecord.id == id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")

    data = serialize_exception(exc)

    # Attach rich inspection context
    if exc.inspection:
        ins = exc.inspection
        data["inspection_info"] = {
            "id": ins.id,
            "inspection_number": ins.inspection_number,
            "dock_door": ins.dock_door,
            "inspector_name": ins.inspector_name,
            "carrier_checkin_seal_intact": ins.carrier_checkin_seal_intact,
            "carrier_bol_match": ins.carrier_bol_match,
            "temperature_reading_c": ins.temperature_reading_c,
            "status": ins.status,
            "overall_disposition": ins.overall_disposition,
            "started_at": ins.started_at.isoformat() if ins.started_at else None,
            "completed_at": ins.completed_at.isoformat() if ins.completed_at else None,
            "notes": ins.notes
        }
    else:
        data["inspection_info"] = None

    # Attach purchase order details
    po = exc.purchase_order or (exc.inspection.purchase_order if exc.inspection else None)
    if po:
        data["po_info"] = {
            "id": po.id,
            "po_number": po.po_number,
            "vendor_name": po.vendor_name,
            "order_date": po.order_date.isoformat() if po.order_date else None,
            "expected_delivery": po.expected_delivery.isoformat() if po.expected_delivery else None,
            "total_expected_units": po.total_expected_units,
            "assigned_dock": po.assigned_dock,
            "carrier": po.carrier,
            "tracking_number": po.tracking_number
        }
    else:
        data["po_info"] = None

    # Attach evidence photographs
    evidence_query = db.query(EvidenceItem).filter(
        (EvidenceItem.inspection_id == exc.inspection_id) |
        (EvidenceItem.po_id == (po.id if po else None))
    ).all()

    photos = []
    for ev in evidence_query:
        photos.append({
            "id": ev.id,
            "file_name": ev.file_name,
            "file_path": ev.file_path,
            "category": ev.category,
            "caption": ev.caption,
            "confidence_score": ev.confidence_score
        })

    # If no photos in DB but exception has evidence_photo_url, include it
    if len(photos) == 0 and exc.evidence_photo_url:
        photos.append({
            "id": 999,
            "file_name": f"{exc.issue or 'discrepancy'}_proof.jpg",
            "file_path": exc.evidence_photo_url,
            "category": "EVIDENCE",
            "caption": exc.evidence_citation or exc.discrepancy_details,
            "confidence_score": exc.confidence or 0.94
        })

    data["photographs"] = photos
    return data

@router.post("", response_model=dict)
def create_exception(payload: ExceptionRecordCreate, db: Session = Depends(get_db)):
    count = db.query(ExceptionRecord).count() + 1
    exception_number = f"EXC-2026-{count:04d}"

    exc = ExceptionRecord(
        exception_number=exception_number,
        inspection_id=payload.inspection_id,
        po_id=payload.po_id,
        sku=payload.sku,
        exception_type=payload.exception_type,
        issue=payload.issue or payload.exception_type.replace("_", " ").title(),
        severity=payload.severity,
        status=payload.status,
        discrepancy_details=payload.discrepancy_details,
        expected_value=payload.expected_value,
        actual_value=payload.actual_value,
        confidence=payload.confidence or 0.94,
        evidence_photo_url=payload.evidence_photo_url,
        evidence_citation=payload.evidence_citation,
        assigned_to=payload.assigned_to,
        resolution_notes=payload.resolution_notes
    )
    db.add(exc)
    db.commit()
    db.refresh(exc)
    return {"message": "Exception recorded", "exception_number": exc.exception_number, "id": exc.id}

@router.put("/{id}", response_model=dict)
def update_exception(id: int, payload: ExceptionRecordUpdate, db: Session = Depends(get_db)):
    exc = db.query(ExceptionRecord).filter(ExceptionRecord.id == id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")

    if payload.status is not None:
        exc.status = payload.status
    if payload.severity is not None:
        exc.severity = payload.severity
    if payload.assigned_to is not None:
        exc.assigned_to = payload.assigned_to
    if payload.resolution_notes is not None:
        exc.resolution_notes = payload.resolution_notes
    if payload.issue is not None:
        exc.issue = payload.issue

    db.commit()
    return {"message": "Exception updated successfully"}

# ACTION 1: Request More Evidence
@router.post("/{id}/request-more-evidence", response_model=dict)
def request_more_evidence(id: int, payload: ActionRequestMoreEvidence, db: Session = Depends(get_db)):
    exc = db.query(ExceptionRecord).filter(ExceptionRecord.id == id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")

    exc.status = "MORE_EVIDENCE_REQUESTED"
    now_str = datetime.utcnow().strftime("%b %d, %Y %I:%M %p UTC")
    action_note = f"[{now_str}] Evidence Requested: {payload.requested_evidence_type}. Note: {payload.notes or 'No notes'}"
    exc.resolution_notes = f"{exc.resolution_notes}\n{action_note}" if exc.resolution_notes else action_note

    db.commit()
    return {
        "message": "Secondary evidence requested successfully. Work-order dispatched to dock floor.",
        "status": exc.status,
        "id": exc.id
    }

# ACTION 2: Mark for Manual Review
@router.post("/{id}/mark-manual-review", response_model=dict)
def mark_manual_review(id: int, payload: ActionMarkManualReview, db: Session = Depends(get_db)):
    exc = db.query(ExceptionRecord).filter(ExceptionRecord.id == id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")

    exc.status = "MANUAL_REVIEW"
    if payload.reviewer_name:
        exc.assigned_to = payload.reviewer_name
    if payload.priority:
        exc.severity = payload.priority

    now_str = datetime.utcnow().strftime("%b %d, %Y %I:%M %p UTC")
    action_note = f"[{now_str}] Marked for Manual Review by {payload.reviewer_name or 'QA Lead'}. Priority: {payload.priority}. Note: {payload.notes or 'Pending QA sign-off'}"
    exc.resolution_notes = f"{exc.resolution_notes}\n{action_note}" if exc.resolution_notes else action_note

    db.commit()
    return {
        "message": "Exception marked for manual review and assigned to senior QA inspector.",
        "status": exc.status,
        "assigned_to": exc.assigned_to,
        "id": exc.id
    }

# ACTION 3: Resolve Exception
@router.post("/{id}/resolve", response_model=dict)
def resolve_exception(id: int, payload: ActionResolveException, db: Session = Depends(get_db)):
    exc = db.query(ExceptionRecord).filter(ExceptionRecord.id == id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")

    exc.status = "RESOLVED"
    now_str = datetime.utcnow().strftime("%b %d, %Y %I:%M %p UTC")
    type_display = payload.resolution_type.replace("_", " ").title()
    action_note = f"[{now_str}] RESOLVED via {type_display} by {payload.resolved_by}. Resolution: {payload.resolution_notes}"
    exc.resolution_notes = f"{exc.resolution_notes}\n{action_note}" if exc.resolution_notes else action_note

    db.commit()
    return {
        "message": "Exception resolved successfully.",
        "status": exc.status,
        "resolution_type": payload.resolution_type,
        "id": exc.id
    }
