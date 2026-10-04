from typing import List, Tuple
from app.schemas.a2a import ObservedFacts, A2ALineItemContract

class ReceivingDispositionPolicy:
    """
    Deterministic Receiving Disposition Policy.
    Strictly separates observation (facts extracted from vision model)
    from business rules (contract comparison).
    """

    @staticmethod
    def evaluate(
        expected: A2ALineItemContract,
        observed: ObservedFacts
    ) -> Tuple[str, List[str], str]:
        """
        Returns (disposition, violations, rationale).
        Disposition is strictly: 'ACCEPTED', 'EXCEPTION', or 'HOLD_FOR_MANUAL_REVIEW'.
        """
        violations = []

        # Rule 1: Zero-Guessing / Image Quality check
        if not observed.image_quality_adequate or observed.observation_confidence < 0.65:
            return (
                "HOLD_FOR_MANUAL_REVIEW",
                ["IMAGE_QUALITY_INADEQUATE: Visual evidence is blurry, occluded, or inconclusive. Zero-guessing enforced."],
                f"Inspection routed to supervisor review. Visual confidence is {observed.observation_confidence:.2f}."
            )

        # Rule 2: Trailer Seal Integrity
        if observed.seal_status == "BROKEN":
            violations.append("SEAL_BREACH: Trailer door bolt seal was photographed broken or tampered.")
        elif observed.seal_status == "UNCERTAIN":
            violations.append("SEAL_UNCERTAIN: Trailer bolt seal integrity could not be corroborated from evidence.")

        # Rule 3: SKU Identity Match
        if observed.detected_sku and observed.detected_sku.strip():
            if observed.detected_sku.strip().upper() != expected.sku.strip().upper():
                violations.append(
                    f"SKU_MISMATCH: Expected SKU '{expected.sku}', but observed '{observed.detected_sku}' on shipping label/item."
                )

        # Rule 4: Product Variant Match (Color / Finish)
        if observed.detected_variant and observed.detected_variant.strip():
            exp_var = expected.expected_variant.strip().lower()
            obs_var = observed.detected_variant.strip().lower()
            if exp_var != "standard" and obs_var != "standard" and exp_var not in obs_var and obs_var not in exp_var:
                violations.append(
                    f"VARIANT_MISMATCH: Expected variant '{expected.expected_variant}', but vision observed '{observed.detected_variant}'."
                )

        # Rule 5: Carton Packaging Damage
        if observed.carton_damage_present:
            violations.append(
                f"PACKAGING_DAMAGE: Master carton exhibited structural compromise ({observed.carton_damage_type})."
            )

        # Rule 6: Product Physical Damage
        if observed.product_damage_present:
            violations.append("PRODUCT_DAMAGE: Sample item exhibited visible surface dents, cracks, or finish defects.")

        # Rule 7: Barcode Decodability & Match
        if expected.expected_barcode and observed.detected_barcode:
            if expected.expected_barcode.strip() != observed.detected_barcode.strip():
                violations.append(
                    f"BARCODE_MISMATCH: Expected barcode '{expected.expected_barcode}', but scanned '{observed.detected_barcode}'."
                )

        # Rule 8: Carton Count Verification
        if observed.observed_carton_count is not None and expected.expected_cartons is not None:
            if observed.observed_carton_count != expected.expected_cartons:
                violations.append(
                    f"CARTON_COUNT_DISCREPANCY: Expected {expected.expected_cartons} master cartons, but physical intake counted {observed.observed_carton_count} cartons."
                )

        # Rule 9: Required Components Checklist
        if expected.required_components:
            obs_comps_lower = [c.lower() for c in observed.components_found]
            for req in expected.required_components:
                req_lower = req.lower()
                if not any(req_lower in c for c in obs_comps_lower):
                    violations.append(f"MISSING_COMPONENT: Mandatory accessory '{req}' was absent from inspection sample.")

        # Disposition Decision
        if len(violations) > 0:
            rationale = f"Shipment flagged with {len(violations)} non-compliance exception(s)."
            return ("EXCEPTION", violations, rationale)

        return (
            "ACCEPTED",
            [],
            f"All receiving criteria verified successfully against manifest. Confidence: {observed.observation_confidence:.2f}."
        )
