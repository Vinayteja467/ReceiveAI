from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import shutil

from app.core.database import get_db
from app.core.config import settings
from app.models.evidence import EvidenceItem
from app.models.inspection import Inspection
from app.models.purchase_order import PurchaseOrder
from app.schemas.evidence import EvidenceItemCreate, EvidenceItemResponse

router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_CATEGORIES = {"CARTONS", "PRODUCTS", "LABELS", "PACKAGING", "RECEIVING_AREA"}
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024 # 15 MB

@router.get("", response_model=List[dict])
def list_evidence(
    inspection_id: Optional[int] = None,
    po_id: Optional[int] = None,
    category: Optional[str] = None,
    file_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(EvidenceItem)
    if inspection_id:
        query = query.filter(EvidenceItem.inspection_id == inspection_id)
    if po_id:
        query = query.filter(EvidenceItem.po_id == po_id)
    if category and category != "ALL":
        query = query.filter(EvidenceItem.category == category.upper())
    if file_type and file_type != "ALL":
        query = query.filter(EvidenceItem.file_type == file_type)

    evidence_items = query.order_by(EvidenceItem.created_at.desc()).all()
    results = []
    for ev in evidence_items:
        results.append({
            "id": ev.id,
            "inspection_id": ev.inspection_id,
            "inspection_number": ev.inspection.inspection_number if ev.inspection else None,
            "po_id": ev.po_id,
            "po_number": ev.purchase_order.po_number if ev.purchase_order else (ev.inspection.purchase_order.po_number if ev.inspection and ev.inspection.purchase_order else None),
            "file_name": ev.file_name,
            "file_path": ev.file_path,
            "url": f"/{ev.file_path}",
            "file_type": ev.file_type,
            "category": ev.category or "CARTONS",
            "file_size_bytes": ev.file_size_bytes,
            "caption": ev.caption,
            "confidence_score": ev.confidence_score,
            "tags": ev.tags,
            "notes": ev.notes,
            "created_at": ev.created_at.isoformat()
        })
    return results

@router.post("/upload")
async def upload_evidence_file(
    file: UploadFile = File(...),
    category: str = Form("CARTONS"),
    po_id: Optional[int] = Form(None),
    inspection_id: Optional[int] = Form(None),
    caption: Optional[str] = Form(""),
    db: Session = Depends(get_db)
):
    # 1. Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed image formats: JPG, JPEG, PNG, WEBP."
        )

    # 2. Validate category
    cat_upper = category.upper().strip()
    if cat_upper not in ALLOWED_CATEGORIES:
        cat_upper = "CARTONS"

    # 3. Ensure uploads dir exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_prefix = uuid.uuid4().hex[:8]
    clean_name = f"{unique_prefix}_{file.filename}"
    saved_path = os.path.join(settings.UPLOAD_DIR, clean_name)

    # 4. Save to disk and check file size
    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    size = os.path.getsize(saved_path)
    if size > MAX_FILE_SIZE_BYTES:
        os.remove(saved_path)
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowable size of 15MB (uploaded size: {round(size / 1024 / 1024, 2)}MB)."
        )

    # 5. Create database record
    ev = EvidenceItem(
        inspection_id=inspection_id,
        po_id=po_id,
        file_name=file.filename,
        file_path=f"uploads/{clean_name}",
        file_type="IMAGE",
        category=cat_upper,
        file_size_bytes=size,
        caption=caption or f"Receiving photograph of {cat_upper.lower()}",
        confidence_score=0.96,
        tags=f"receiving,{cat_upper.lower()}"
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)

    return {
        "id": ev.id,
        "file_name": ev.file_name,
        "file_path": ev.file_path,
        "url": f"/{ev.file_path}",
        "category": ev.category,
        "file_size_bytes": ev.file_size_bytes,
        "caption": ev.caption,
        "status": "READY"
    }

@router.delete("/{id}")
def delete_evidence(id: int, db: Session = Depends(get_db)):
    ev = db.query(EvidenceItem).filter(EvidenceItem.id == id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence record not found")

    # Try removing file from disk
    try:
        full_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))), ev.file_path)
        if os.path.exists(full_path):
            os.remove(full_path)
    except Exception:
        pass

    db.delete(ev)
    db.commit()
    return {"message": "Evidence record removed successfully", "id": id}

@router.post("/record")
def create_evidence_record(payload: EvidenceItemCreate, db: Session = Depends(get_db)):
    ev = EvidenceItem(
        inspection_id=payload.inspection_id,
        po_id=payload.po_id,
        file_name=payload.file_name,
        file_path=payload.file_path,
        file_type=payload.file_type or "IMAGE",
        category=(payload.category or "CARTONS").upper(),
        file_size_bytes=payload.file_size_bytes or 1500000,
        caption=payload.caption,
        confidence_score=payload.confidence_score or 0.95,
        tags=payload.tags or "receiving,dock",
        notes=payload.notes
    )
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return {"id": ev.id, "message": "Evidence record registered", "file_name": ev.file_name}
