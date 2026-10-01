from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, List

from app.models.inspection import Inspection
from app.models.purchase_order import PurchaseOrder, POLineItem
from app.models.product import Product
from app.models.evidence import EvidenceItem
from app.models.exception_record import ExceptionRecord
from app.schemas.ai_inspection import AIInspectionReport
from app.services.ai_engine.factory import get_vision_engine

ISSUE_MAPPING = {
    "sku_identity": ("Wrong SKU", "INCORRECT_SKU", "CRITICAL"),
    "variant_color": ("Wrong variant", "INCORRECT_VARIANT", "HIGH"),
    "carton_damage": ("Crushed carton", "PHYSICAL_DAMAGE", "CRITICAL"),
    "product_damage": ("Product damage", "PHYSICAL_DAMAGE", "HIGH"),
    "water_damage": ("Water damage", "PHYSICAL_DAMAGE", "CRITICAL"),
    "torn_packaging": ("Torn packaging", "TAMPER_DAMAGE", "HIGH"),
    "missing_components": ("Missing components", "MISSING_COMPONENTS", "CRITICAL")
}

def create_exceptions_from_inspection_report(
    inspection: Inspection,
    po: PurchaseOrder,
    primary_line: POLineItem,
    report: AIInspectionReport,
    db: Session
) -> List[ExceptionRecord]:
    """
    Whenever an inspection produces FAIL results, automatically create an exception record.
    Strict Rule: DO NOT automatically mark uncertain cases as failures. Only status == 'FAIL' creates an exception.
    """
    created_exceptions = []
    checks = report.checks or {}

    for check_key, check_val in checks.items():
        # STRICT RULE: Ignore UNCERTAIN and PASS! Never force uncertain into failure.
        if check_val.status != "FAIL":
            continue

        # Determine Issue Title and Severity
        if check_key == "quantity":
            try:
                exp_num = float(check_val.expected)
                obs_num = float(check_val.observed)
                if obs_num < exp_num:
                    issue_title = "Short shipment"
                    exc_type = "QUANTITY_SHORTAGE"
                    severity = "HIGH"
                else:
                    issue_title = "Extra units"
                    exc_type = "QUANTITY_OVERAGE"
                    severity = "MEDIUM"
            except Exception:
                issue_title = "Short shipment"
                exc_type = "QUANTITY_SHORTAGE"
                severity = "HIGH"
        elif check_key in ISSUE_MAPPING:
            issue_title, exc_type, severity = ISSUE_MAPPING[check_key]
        else:
            issue_title = check_key.replace("_", " ").title()
            exc_type = "COMPLIANCE_FAILURE"
            severity = "HIGH"

        # Evidence photo & quotation
        photo_url = None
        evidence_quote = None
        if check_val.evidence and len(check_val.evidence) > 0:
            first_ev = check_val.evidence[0]
            photo_url = first_ev.image_url
            evidence_quote = first_ev.finding

        # Check if already created for this inspection and issue to avoid duplicate
        existing = db.query(ExceptionRecord).filter(
            ExceptionRecord.inspection_id == inspection.id,
            ExceptionRecord.issue == issue_title
        ).first()

        if existing:
            # Update existing with latest observation
            existing.issue = issue_title
            existing.exception_type = exc_type
            existing.expected_value = str(check_val.expected)
            existing.actual_value = str(check_val.observed)
            existing.discrepancy_details = check_val.explanation or f"Automated inspection check {issue_title} failed."
            existing.confidence = float(check_val.confidence) if check_val.confidence else 0.90
            if photo_url:
                existing.evidence_photo_url = photo_url
            if evidence_quote:
                existing.evidence_citation = evidence_quote
            created_exceptions.append(existing)
        else:
            count = db.query(ExceptionRecord).count() + 1
            exc_num = f"EXC-2026-{count:04d}"
            sku_val = (primary_line.sku if primary_line else None) or (po.line_items[0].sku if po and po.line_items else None) or "SKU-RCV-001"

            new_exc = ExceptionRecord(
                exception_number=exc_num,
                inspection_id=inspection.id,
                po_id=po.id if po else None,
                sku=sku_val,
                exception_type=exc_type,
                issue=issue_title,
                severity=severity,
                status="OPEN",
                discrepancy_details=check_val.explanation or f"Inspection failure detected: {issue_title}",
                expected_value=str(check_val.expected),
                actual_value=str(check_val.observed),
                confidence=float(check_val.confidence) if check_val.confidence else 0.90,
                evidence_photo_url=photo_url,
                evidence_citation=evidence_quote or check_val.explanation,
                assigned_to="Inbound Operations QA",
                resolution_notes=None
            )
            db.add(new_exc)
            created_exceptions.append(new_exc)

    if created_exceptions:
        db.commit()
        for exc in created_exceptions:
            db.refresh(exc)

    return created_exceptions

def run_ai_inspection_placeholder(inspection_id: int, db: Session) -> AIInspectionReport:
    """
    Executes the modular Vision AI inspection engine (Gemini or Deterministic Demo Mode).
    Compares Purchase Order + Product Catalogue + Receiving Photographs across 10 checks.
    Automatically creates exception records whenever FAIL checks are encountered.
    """
    inspection = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not inspection:
        raise ValueError(f"Inspection #{inspection_id} not found.")

    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == inspection.po_id).first()
    primary_line = None
    product = None

    if po and po.line_items:
        primary_line = po.line_items[0]
        if primary_line.product_id:
            product = db.query(Product).filter(Product.id == primary_line.product_id).first()
        elif primary_line.sku:
            product = db.query(Product).filter(Product.sku == primary_line.sku).first()

    # Evidence items linked to inspection or PO
    evidence_items = db.query(EvidenceItem).filter(
        (EvidenceItem.inspection_id == inspection_id) |
        (EvidenceItem.po_id == (po.id if po else None))
    ).all()

    engine = get_vision_engine()
    report = engine.analyze_inspection(
        inspection=inspection,
        po=po,
        primary_line=primary_line,
        product=product,
        evidence_items=evidence_items
    )

    # AUTOMATIC EXCEPTION CREATION: If any check produces FAIL results, create exception record
    create_exceptions_from_inspection_report(
        inspection=inspection,
        po=po,
        primary_line=primary_line,
        report=report,
        db=db
    )

    return report
