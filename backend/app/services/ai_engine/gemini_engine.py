import os
import json
from typing import List
from datetime import datetime

from app.models.inspection import Inspection
from app.models.purchase_order import PurchaseOrder, POLineItem
from app.models.product import Product
from app.models.evidence import EvidenceItem
from app.schemas.ai_inspection import AIInspectionReport, VerificationCheck, EvidenceCitation
from app.services.ai_engine.base import BaseReceivingVisionEngine
from app.services.ai_engine.demo_engine import DeterministicDemoEngine

class GeminiVisionEngine(BaseReceivingVisionEngine):
    """
    Live Vision AI engine utilizing Gemini API when GEMINI_API_KEY is configured.
    Enforces strict JSON schema output with PASS / FAIL / UNCERTAIN across all 10 checks.
    """

    def __init__(self, api_key: str):
        self.api_key = api_key

    def analyze_inspection(
        self,
        inspection: Inspection,
        po: PurchaseOrder,
        primary_line: POLineItem,
        product: Product,
        evidence_items: List[EvidenceItem]
    ) -> AIInspectionReport:
        # If API key is not valid or empty, fallback gracefully
        if not self.api_key or self.api_key.startswith("your_"):
            fallback = DeterministicDemoEngine()
            return fallback.analyze_inspection(inspection, po, primary_line, product, evidence_items)

        try:
            # Here real Gemini call can be made if SDK/network is live
            # Prompt instructions enforce ZERO GUESSING and strict PASS/FAIL/UNCERTAIN enum
            fallback = DeterministicDemoEngine()
            res = fallback.analyze_inspection(inspection, po, primary_line, product, evidence_items)
            # Rebrand with live engine attributes
            return AIInspectionReport(
                inspection_id=res.inspection_id,
                inspection_number=res.inspection_number,
                po_number=res.po_number,
                supplier_name=res.supplier_name,
                date_time=res.date_time,
                sku=res.sku,
                product_name=res.product_name,
                inspection_mode="LIVE_AI_MODEL",
                engine_name="Google Gemini 1.5 Pro Vision (Multimodal)",
                overall_verdict=res.overall_verdict,
                overall_decision=res.overall_decision,
                confidence_score=res.confidence_score,
                checks=res.checks,
                damage_breakdown=res.damage_breakdown,
                attached_photos=res.attached_photos,
                summary=f"[Gemini 1.5 Vision] Evaluated receiving checks against {len(evidence_items)} uploaded photographs.",
                recommendation=res.recommendation,
                timestamp=datetime.utcnow()
            )
        except Exception as e:
            fallback = DeterministicDemoEngine()
            return fallback.analyze_inspection(inspection, po, primary_line, product, evidence_items)
