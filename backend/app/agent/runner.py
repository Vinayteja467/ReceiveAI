import sys
import os
import json
import argparse

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.agent.core import ReceivingAgent
from app.schemas.a2a import A2AInspectRequest, A2ALineItemContract

def run_cli():
    parser = argparse.ArgumentParser(description="ReceiveAI Autonomous Inbound Receiving Agent CLI")
    parser.add_argument("--manifest", default="PO-2026-00124", help="Purchase Order Manifest ID")
    parser.add_argument("--sku", default="BLUE-BOTTLE-001", help="Expected SKU")
    parser.add_argument("--variant", default="Blue", help="Expected product variant / color")
    parser.add_argument("--units", type=int, default=24, help="Total expected units")
    parser.add_argument("--units-per-carton", type=int, default=12, help="Units per master carton")
    parser.add_argument("--cartons", type=int, default=2, help="Expected master carton count")
    parser.add_argument("--barcode", default="0810024810924", help="Expected catalog barcode UPC")
    parser.add_argument("--images", nargs="*", default=[], help="Image file paths or simulated markers")

    args = parser.parse_args()

    print("=" * 80)
    print("       RECEIVEAI AUTONOMOUS INBOUND RECEIVING AGENT RUNNER")
    print("=" * 80)
    print(f"Manifest ID       : {args.manifest}")
    print(f"Target SKU        : {args.sku}")
    print(f"Expected Variant  : {args.variant}")
    print(f"Carton Hierarchy  : {args.cartons} Cartons x {args.units_per_carton} Units = {args.units} Units")
    print(f"Evidence Photos   : {len(args.images)} uploaded")
    print("-" * 80)

    contract = A2ALineItemContract(
        sku=args.sku,
        item_name="Inbound Manifest Item",
        expected_variant=args.variant,
        expected_units=args.units,
        units_per_carton=args.units_per_carton,
        expected_cartons=args.cartons,
        expected_barcode=args.barcode,
        required_components=["Cap", "Seal Ring"]
    )

    request = A2AInspectRequest(
        manifest_id=args.manifest,
        line_item=contract,
        evidence_images=args.images,
        timeout_seconds=20.0
    )

    agent = ReceivingAgent()
    print("[AGENT] Initializing reasoning loop (Plan -> Perceive -> Verify -> Decide -> Audit)...\n")

    response = agent.run(request)

    print("-" * 80)
    print(f"DISPOSITION        : {response.disposition}")
    print(f"CONFIDENCE SCORE   : {response.confidence_score:.2f}")
    print(f"ENGINE USED        : {response.engine_used}")
    print(f"EXECUTION TIME     : {response.execution_time_ms:.1f} ms")
    print(f"RATIONALE          : {response.disposition_rationale}")
    print(f"POLICY VIOLATIONS  : {len(response.policy_violations)}")
    for v in response.policy_violations:
        print(f"  * {v}")

    print("\nCUBE CHECKS ARRAY (checks[]):")
    for chk in response.checks:
        icon = "[PASS]" if chk.status == "PASS" else ("[FAIL]" if chk.status == "FAIL" else "[UNCERTAIN]")
        print(f"  {icon} {chk.check_name:<20}: {chk.explanation}")

    print("=" * 80)
    print("[AGENT] Inspection completed successfully.")

if __name__ == "__main__":
    run_cli()
