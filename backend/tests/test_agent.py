import unittest
import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas.a2a import A2ALineItemContract, A2AInspectRequest
from app.agent.state import AgentPhase, AgentState, ReceivingAgentState
from app.agent.tools import (
    CartonMathTool,
    VariantMatchTool,
    SealIntegrityTool,
    BarcodeDecoderTool,
    AQLSamplingTool,
)
from app.agent.core import ReceivingAgent

class TestReceivingAgentAndTools(unittest.TestCase):

    def test_carton_math_tool_match(self):
        result = CartonMathTool.execute(expected_units=30, units_per_carton=10, observed_cartons=3)
        self.assertTrue(result["is_carton_count_match"])
        self.assertEqual(result["status"], "PASS")

    def test_carton_math_tool_mismatch(self):
        result = CartonMathTool.execute(expected_units=30, units_per_carton=10, observed_cartons=2)
        self.assertFalse(result["is_carton_count_match"])
        self.assertEqual(result["status"], "FAIL")

    def test_variant_match_tool(self):
        res_pass = VariantMatchTool.execute(expected_variant="Matte Black", detected_variant="matte black")
        self.assertTrue(res_pass["is_match"])
        self.assertEqual(res_pass["status"], "PASS")

        res_fail = VariantMatchTool.execute(expected_variant="Matte Black", detected_variant="Blue")
        self.assertFalse(res_fail["is_match"])
        self.assertEqual(res_fail["status"], "FAIL")

    def test_seal_integrity_tool(self):
        res_intact = SealIntegrityTool.execute(seal_status="INTACT")
        self.assertEqual(res_intact["status"], "PASS")

        res_broken = SealIntegrityTool.execute(seal_status="BROKEN")
        self.assertEqual(res_broken["status"], "FAIL")

    def test_barcode_decoder_tool(self):
        res_valid = BarcodeDecoderTool.execute(expected_barcode="123456789012", detected_barcode="123456789012")
        self.assertTrue(res_valid["is_match"])
        self.assertEqual(res_valid["status"], "PASS")

        res_mismatch = BarcodeDecoderTool.execute(expected_barcode="123456789012", detected_barcode="999999999999")
        self.assertFalse(res_mismatch["is_match"])
        self.assertEqual(res_mismatch["status"], "FAIL")

    def test_aql_sampling_tool(self):
        res_small = AQLSamplingTool.execute(total_units=50, sampling_rate_pct=10.0)
        self.assertEqual(res_small["sample_draw_units"], 5)

        res_large = AQLSamplingTool.execute(total_units=1500, sampling_rate_pct=10.0)
        self.assertEqual(res_large["sample_draw_units"], 150)

    def test_agent_run_fail_open_when_no_images(self):
        contract = A2ALineItemContract(
            sku="BLUE-BOTTLE-001",
            item_name="Premium Water Bottle",
            expected_variant="Blue",
            expected_units=24,
            units_per_carton=12,
            expected_cartons=2
        )
        agent = ReceivingAgent()
        req = A2AInspectRequest(
            manifest_id="MAN-001",
            line_item=contract,
            evidence_images=[]
        )
        response = agent.run(req)
        # Without images, agent must fail open to HOLD_FOR_MANUAL_REVIEW
        self.assertEqual(response.disposition, "HOLD_FOR_MANUAL_REVIEW")
        self.assertTrue(len(response.checks) > 0)
        self.assertTrue(any(c.check_name == "image_quality" for c in response.checks))

if __name__ == "__main__":
    unittest.main()
