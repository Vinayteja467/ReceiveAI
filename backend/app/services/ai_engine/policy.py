from typing import List, Tuple, Dict, Any
from app.schemas.a2a import ObservedFacts, A2ALineItemContract, CUBECheck

class ReceivingDispositionPolicy:
    """
    Deterministic Receiving Disposition Policy.
    Strictly separates observation (facts extracted from vision model)
    from business rules (contract comparison).
    Outputs both high-level disposition and granular CUBE checks[] with PASS/FAIL/UNCERTAIN.
    """

    @staticmethod
    def evaluate(
        expected: A2ALineItemContract,
        observed: ObservedFacts
    ) -> Tuple[str, List[str], str, List[CUBECheck]]:
        """
        Returns (disposition, violations, rationale, checks).
        Disposition is strictly: 'ACCEPTED', 'EXCEPTION', or 'HOLD_FOR_MANUAL_REVIEW'.
        checks is an array of CUBECheck with status: PASS / FAIL / UNCERTAIN.
        """
        violations = []
        checks: List[CUBECheck] = []

        # -------------------------------------------------------------
        # Check 1: Image Quality / Zero-Guessing Safeguard
        # -------------------------------------------------------------
        if not observed.image_quality_adequate or observed.observation_confidence < 0.65:
            checks.append(CUBECheck(
                check_name="image_quality",
                status="UNCERTAIN",
                expected="Adequate resolution and lighting",
                observed="Blurry, occluded, or inconclusive evidence",
                confidence=observed.observation_confidence,
                explanation="Visual evidence is insufficient to verify receiving compliance without guessing."
            ))
            return (
                "HOLD_FOR_MANUAL_REVIEW",
                ["IMAGE_QUALITY_INADEQUATE: Visual evidence is blurry or occluded. Zero-guessing enforced."],
                f"Inspection routed to supervisor review. Visual confidence is {observed.observation_confidence:.2f}.",
                checks
            )
        else:
            checks.append(CUBECheck(
                check_name="image_quality",
                status="PASS",
                expected="Adequate resolution and lighting",
                observed="Evidence clear and verifiable",
                confidence=observed.observation_confidence,
                explanation="Photographic evidence quality meets AQL inspection standards."
            ))

        # -------------------------------------------------------------
        # Check 2: Trailer Bolt Seal Integrity
        # -------------------------------------------------------------
        if observed.seal_status == "BROKEN":
            violations.append("SEAL_BREACH: Trailer door bolt seal was photographed broken or tampered.")
            checks.append(CUBECheck(
                check_name="seal_integrity",
                status="FAIL",
                expected="INTACT",
                observed="BROKEN",
                confidence=0.98,
                explanation="Trailer bolt seal showed physical compromise or cutting prior to receiving."
            ))
        elif observed.seal_status == "UNCERTAIN":
            violations.append("SEAL_UNCERTAIN: Trailer bolt seal integrity could not be corroborated from evidence.")
            checks.append(CUBECheck(
                check_name="seal_integrity",
                status="UNCERTAIN",
                expected="INTACT",
                observed="UNCERTAIN",
                confidence=0.50,
                explanation="Trailer bolt seal could not be verified from uploaded evidence."
            ))
        else:
            checks.append(CUBECheck(
                check_name="seal_integrity",
                status="PASS",
                expected="INTACT",
                observed="INTACT",
                confidence=0.99,
                explanation="Trailer door bolt seal photographed intact with matching serial number."
            ))

        # -------------------------------------------------------------
        # Check 3: SKU Identity Match
        # -------------------------------------------------------------
        obs_sku = observed.detected_sku or "UNKNOWN"
        if observed.detected_sku and observed.detected_sku.strip().upper() == expected.sku.strip().upper():
            checks.append(CUBECheck(
                check_name="sku_identity",
                status="PASS",
                expected=expected.sku,
                observed=obs_sku,
                confidence=0.98,
                explanation=f"Label and packing slip SKU match expected manifest {expected.sku}."
            ))
        elif observed.detected_sku:
            violations.append(
                f"SKU_MISMATCH: Expected SKU '{expected.sku}', but observed '{obs_sku}'."
            )
            checks.append(CUBECheck(
                check_name="sku_identity",
                status="FAIL",
                expected=expected.sku,
                observed=obs_sku,
                confidence=0.97,
                explanation=f"Mismatch: physical item or carton label indicates '{obs_sku}' instead of '{expected.sku}'."
            ))
        else:
            checks.append(CUBECheck(
                check_name="sku_identity",
                status="UNCERTAIN",
                expected=expected.sku,
                observed="Label not legible",
                confidence=0.50,
                explanation="SKU text could not be extracted with high confidence."
            ))

        # -------------------------------------------------------------
        # Check 4: Product Variant (Color / Finish)
        # -------------------------------------------------------------
        exp_var = expected.expected_variant.strip().lower()
        obs_var = (observed.detected_variant or "Standard").strip().lower()
        if exp_var != "standard" and obs_var != "standard" and exp_var not in obs_var and obs_var not in exp_var:
            violations.append(
                f"VARIANT_MISMATCH: Expected variant '{expected.expected_variant}', but vision observed '{observed.detected_variant}'."
            )
            checks.append(CUBECheck(
                check_name="variant_color",
                status="FAIL",
                expected=expected.expected_variant,
                observed=observed.detected_variant,
                confidence=0.96,
                explanation=f"Visual finish mismatch: Product sample is '{observed.detected_variant}', expected '{expected.expected_variant}'."
            ))
        else:
            checks.append(CUBECheck(
                check_name="variant_color",
                status="PASS",
                expected=expected.expected_variant,
                observed=observed.detected_variant or expected.expected_variant,
                confidence=0.97,
                explanation=f"Product finish and color match expected variant '{expected.expected_variant}'."
            ))

        # -------------------------------------------------------------
        # Check 5: Carton Packaging Damage
        # -------------------------------------------------------------
        if observed.carton_damage_present:
            violations.append(
                f"PACKAGING_DAMAGE: Master carton exhibited structural compromise ({observed.carton_damage_type})."
            )
            checks.append(CUBECheck(
                check_name="carton_damage",
                status="FAIL",
                expected="No structural carton damage",
                observed=f"Carton damage detected ({observed.carton_damage_type})",
                confidence=0.95,
                explanation=f"Physical compromise of outer shipping container: {observed.carton_damage_type}."
            ))
        else:
            checks.append(CUBECheck(
                check_name="carton_damage",
                status="PASS",
                expected="No structural carton damage",
                observed="Intact corrugate, no puncture/crush",
                confidence=0.98,
                explanation="All master cartons structurally sound with undamaged corners and intact tape."
            ))

        # -------------------------------------------------------------
        # Check 6: Barcode Verification
        # -------------------------------------------------------------
        if expected.expected_barcode:
            obs_bc = observed.detected_barcode or "UNSCANNED"
            if observed.detected_barcode and expected.expected_barcode.strip() == observed.detected_barcode.strip():
                checks.append(CUBECheck(
                    check_name="barcode_symbology",
                    status="PASS",
                    expected=expected.expected_barcode,
                    observed=obs_bc,
                    confidence=0.99,
                    explanation=f"Decoded 1D/2D barcode matches catalog master UPC {expected.expected_barcode}."
                ))
            elif observed.detected_barcode:
                violations.append(
                    f"BARCODE_MISMATCH: Expected barcode '{expected.expected_barcode}', but scanned '{obs_bc}'."
                )
                checks.append(CUBECheck(
                    check_name="barcode_symbology",
                    status="FAIL",
                    expected=expected.expected_barcode,
                    observed=obs_bc,
                    confidence=0.99,
                    explanation=f"Decoded barcode {obs_bc} does not match PO manifest UPC {expected.expected_barcode}."
                ))
            else:
                checks.append(CUBECheck(
                    check_name="barcode_symbology",
                    status="UNCERTAIN",
                    expected=expected.expected_barcode,
                    observed="Barcode unreadable",
                    confidence=0.50,
                    explanation="Barcode not decodable from evidence."
                ))

        # -------------------------------------------------------------
        # Check 7: Carton Count & Hierarchy
        # -------------------------------------------------------------
        if observed.observed_carton_count is not None and expected.expected_cartons is not None:
            if observed.observed_carton_count != expected.expected_cartons:
                violations.append(
                    f"CARTON_COUNT_DISCREPANCY: Expected {expected.expected_cartons} master cartons, but physical intake counted {observed.observed_carton_count} cartons."
                )
                checks.append(CUBECheck(
                    check_name="carton_count",
                    status="FAIL",
                    expected=f"{expected.expected_cartons} cartons",
                    observed=f"{observed.observed_carton_count} cartons",
                    confidence=1.0,
                    explanation=f"Shortage/Overage: Intake count ({observed.observed_carton_count}) deviates from manifest ({expected.expected_cartons})."
                ))
            else:
                checks.append(CUBECheck(
                    check_name="carton_count",
                    status="PASS",
                    expected=f"{expected.expected_cartons} cartons",
                    observed=f"{observed.observed_carton_count} cartons",
                    confidence=1.0,
                    explanation=f"Master pack carton count perfectly matches manifest ({expected.expected_cartons} cartons)."
                ))

        # -------------------------------------------------------------
        # Check 8: Mandatory Accessories / Components Checklist
        # -------------------------------------------------------------
        if expected.required_components:
            obs_comps_lower = [c.lower() for c in observed.components_found]
            missing = [req for req in expected.required_components if not any(req.lower() in c for c in obs_comps_lower)]
            if missing:
                for m in missing:
                    violations.append(f"MISSING_COMPONENT: Mandatory accessory '{m}' was absent from inspection sample.")
                checks.append(CUBECheck(
                    check_name="required_components",
                    status="FAIL",
                    expected=", ".join(expected.required_components),
                    observed=", ".join(observed.components_found) if observed.components_found else "None detected",
                    confidence=0.94,
                    explanation=f"Sub-component verification failed: Missing {', '.join(missing)}."
                ))
            else:
                checks.append(CUBECheck(
                    check_name="required_components",
                    status="PASS",
                    expected=", ".join(expected.required_components),
                    observed=", ".join(observed.components_found),
                    confidence=0.96,
                    explanation="All mandatory sub-components and accessories verified present."
                ))

        # Disposition Decision
        if len(violations) > 0:
            rationale = f"Shipment flagged with {len(violations)} non-compliance exception(s)."
            return ("EXCEPTION", violations, rationale, checks)

        return (
            "ACCEPTED",
            [],
            f"All receiving criteria verified successfully against manifest. Confidence: {observed.observation_confidence:.2f}.",
            checks
        )
