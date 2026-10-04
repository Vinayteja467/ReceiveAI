import unittest
import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas.a2a import A2ALineItemContract, ObservedFacts
from app.services.ai_engine.policy import ReceivingDispositionPolicy

class TestReceivingA2AContract(unittest.TestCase):

    def test_clean_receipt_accepted(self):
        contract = A2ALineItemContract(
            sku="BLUE-BOTTLE-001",
            item_name="Premium Water Bottle",
            expected_variant="Blue",
            expected_units=24,
            units_per_carton=12,
            expected_cartons=2,
            expected_barcode="0810024810924",
            required_components=["Cap", "Seal"]
        )
        observed = ObservedFacts(
            detected_sku="BLUE-BOTTLE-001",
            detected_variant="Blue",
            detected_barcode="0810024810924",
            observed_carton_count=2,
            observed_units_count=24,
            carton_damage_present=False,
            seal_status="INTACT",
            components_found=["Cap", "Seal"],
            image_quality_adequate=True,
            observation_confidence=0.98
        )
        disposition, violations, rationale, checks = ReceivingDispositionPolicy.evaluate(contract, observed)
        self.assertEqual(disposition, "ACCEPTED")
        self.assertEqual(len(violations), 0)

    def test_variant_mismatch_exception(self):
        contract = A2ALineItemContract(
            sku="BLUE-BOTTLE-001",
            item_name="Premium Water Bottle",
            expected_variant="Blue"
        )
        observed = ObservedFacts(
            detected_sku="BLUE-BOTTLE-001",
            detected_variant="Matte Black",
            image_quality_adequate=True,
            observation_confidence=0.95
        )
        disposition, violations, rationale, checks = ReceivingDispositionPolicy.evaluate(contract, observed)
        self.assertEqual(disposition, "EXCEPTION")
        self.assertTrue(any("VARIANT_MISMATCH" in v for v in violations))

    def test_damaged_carton_exception(self):
        contract = A2ALineItemContract(
            sku="BLUE-BOTTLE-001",
            item_name="Premium Water Bottle",
            expected_variant="Blue"
        )
        observed = ObservedFacts(
            detected_sku="BLUE-BOTTLE-001",
            detected_variant="Blue",
            carton_damage_present=True,
            carton_damage_type="corner_crush",
            image_quality_adequate=True,
            observation_confidence=0.92
        )
        disposition, violations, rationale, checks = ReceivingDispositionPolicy.evaluate(contract, observed)
        self.assertEqual(disposition, "EXCEPTION")
        self.assertTrue(any("PACKAGING_DAMAGE" in v for v in violations))

    def test_ambiguous_image_fail_open_hold(self):
        contract = A2ALineItemContract(
            sku="BLUE-BOTTLE-001",
            item_name="Premium Water Bottle",
            expected_variant="Blue"
        )
        observed = ObservedFacts(
            image_quality_adequate=False,
            observation_confidence=0.40
        )
        disposition, violations, rationale, checks = ReceivingDispositionPolicy.evaluate(contract, observed)
        self.assertEqual(disposition, "HOLD_FOR_MANUAL_REVIEW")
        self.assertTrue(any("IMAGE_QUALITY_INADEQUATE" in v for v in violations))

    def test_broken_seal_exception(self):
        contract = A2ALineItemContract(
            sku="CRYO-BOX-PRO",
            item_name="Cryo Box"
        )
        observed = ObservedFacts(
            seal_status="BROKEN",
            image_quality_adequate=True,
            observation_confidence=0.95
        )
        disposition, violations, rationale, checks = ReceivingDispositionPolicy.evaluate(contract, observed)
        self.assertEqual(disposition, "EXCEPTION")
        self.assertTrue(any("SEAL_BREACH" in v for v in violations))

if __name__ == "__main__":
    unittest.main()
