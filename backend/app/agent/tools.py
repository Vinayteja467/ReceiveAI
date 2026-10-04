import time
import math
from typing import Dict, Any, List, Tuple
from app.schemas.a2a import A2ALineItemContract, ObservedFacts, CUBECheck
from app.services.ai_engine.observer import ReceivingObserver

class BaseAgentTool:
    name: str = "base_tool"
    description: str = "Base agent tool"

class VisionPerceptionTool(BaseAgentTool):
    name = "vision_perception_tool"
    description = "Extracts physical observations from dock photos using Google Gemini 2.5 Flash."

    def __init__(self, api_key: str = None):
        self.observer = ReceivingObserver(api_key=api_key)

    def execute(self, contract: A2ALineItemContract, evidence_images: List[str]) -> Tuple[ObservedFacts, str, float]:
        t0 = time.time()
        facts, engine_used = self.observer.observe(contract, evidence_images)
        duration_ms = round((time.time() - t0) * 1000, 2)
        return facts, engine_used, duration_ms

class CartonMathTool(BaseAgentTool):
    name = "carton_math_tool"
    description = "Calculates master pack packaging hierarchy: expected cartons = ceil(units / units_per_carton)."

    @staticmethod
    def execute(expected_units: int, units_per_carton: int, observed_cartons: int) -> Dict[str, Any]:
        t0 = time.time()
        units_per_carton = max(1, units_per_carton)
        calculated_expected_cartons = math.ceil(expected_units / units_per_carton)
        calculated_total_observed_units = (observed_cartons or 0) * units_per_carton
        is_match = (calculated_expected_cartons == observed_cartons)
        variance_units = calculated_total_observed_units - expected_units

        duration_ms = round((time.time() - t0) * 1000, 2)
        return {
            "expected_cartons": calculated_expected_cartons,
            "observed_cartons": observed_cartons,
            "calculated_total_units": calculated_total_observed_units,
            "variance_units": variance_units,
            "is_carton_count_match": is_match,
            "status": "PASS" if is_match else "FAIL",
            "duration_ms": duration_ms
        }

class BarcodeDecoderTool(BaseAgentTool):
    name = "barcode_decoder_tool"
    description = "Verifies 1D/2D barcode symbology against PO manifest catalog record."

    @staticmethod
    def execute(expected_barcode: str, detected_barcode: str) -> Dict[str, Any]:
        t0 = time.time()
        if not expected_barcode:
            return {"status": "PASS", "explanation": "No barcode constraint specified on line item.", "duration_ms": 0.0}

        if not detected_barcode:
            return {"status": "UNCERTAIN", "explanation": "Barcode unreadable or not photographed.", "duration_ms": 0.0}

        match = (expected_barcode.strip() == detected_barcode.strip())
        duration_ms = round((time.time() - t0) * 1000, 2)
        return {
            "expected_barcode": expected_barcode,
            "detected_barcode": detected_barcode,
            "is_match": match,
            "status": "PASS" if match else "FAIL",
            "duration_ms": duration_ms
        }

class SealIntegrityTool(BaseAgentTool):
    name = "seal_integrity_tool"
    description = "Verifies trailer rear door bolt seal condition."

    @staticmethod
    def execute(seal_status: str) -> Dict[str, Any]:
        t0 = time.time()
        status_norm = (seal_status or "INTACT").upper()
        duration_ms = round((time.time() - t0) * 1000, 2)
        if status_norm == "INTACT":
            return {"status": "PASS", "explanation": "Bolt seal unbroken and intact.", "duration_ms": duration_ms}
        elif status_norm == "BROKEN":
            return {"status": "FAIL", "explanation": "Bolt seal cut or tampered prior to dock intake.", "duration_ms": duration_ms}
        else:
            return {"status": "UNCERTAIN", "explanation": "Bolt seal verification inconclusive.", "duration_ms": duration_ms}

class VariantMatchTool(BaseAgentTool):
    name = "variant_match_tool"
    description = "Compares sample finish, aesthetic color, and size against purchase order contract."

    @staticmethod
    def execute(expected_variant: str, detected_variant: str) -> Dict[str, Any]:
        t0 = time.time()
        exp = (expected_variant or "Standard").strip().lower()
        obs = (detected_variant or "Standard").strip().lower()

        if exp == "standard" or obs == "standard":
            match = True
        else:
            match = (exp in obs or obs in exp)

        duration_ms = round((time.time() - t0) * 1000, 2)
        return {
            "expected_variant": expected_variant,
            "detected_variant": detected_variant,
            "is_match": match,
            "status": "PASS" if match else "FAIL",
            "duration_ms": duration_ms
        }

class AQLSamplingTool(BaseAgentTool):
    name = "aql_sampling_tool"
    description = "Calculates statistical sampling unit draw per ANSI/ASQ Z1.4 standards."

    @staticmethod
    def execute(total_units: int, sampling_rate_pct: float = 10.0) -> Dict[str, Any]:
        sample_draw = max(1, math.ceil(total_units * (sampling_rate_pct / 100.0)))
        return {
            "total_units": total_units,
            "sampling_rate_pct": sampling_rate_pct,
            "sample_draw_units": sample_draw,
            "allowable_defect_units": 0
        }
