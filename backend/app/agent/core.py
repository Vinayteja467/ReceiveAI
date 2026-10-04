import time
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.agent.state import AgentState, AgentTraceStep, AgentPhase
from app.agent.tools import (
    VisionPerceptionTool,
    CartonMathTool,
    BarcodeDecoderTool,
    SealIntegrityTool,
    VariantMatchTool,
    AQLSamplingTool
)
from app.schemas.a2a import A2ALineItemContract, A2AInspectRequest, A2AInspectResponse, CUBECheck
from app.services.ai_engine.policy import ReceivingDispositionPolicy

class ReceivingAgent:
    def __init__(self, api_key: Optional[str] = None):
        self.vision_tool = VisionPerceptionTool(api_key=api_key)
        self.carton_tool = CartonMathTool()
        self.barcode_tool = BarcodeDecoderTool()
        self.seal_tool = SealIntegrityTool()
        self.variant_tool = VariantMatchTool()
        self.aql_tool = AQLSamplingTool()

    def run(self, request: A2AInspectRequest) -> A2AInspectResponse:
        start_time = time.time()
        session_id = f"AGENT-RCV-{uuid.uuid4().hex[:8]}"

        state = AgentState(
            session_id=session_id,
            manifest_id=request.manifest_id,
            contract=request.line_item,
            evidence_images=request.evidence_images
        )

        step_counter = 1

        def log_step(phase: AgentPhase, action: str, thought: str, tool_in=None, tool_out=None, duration=0.0):
            nonlocal step_counter
            step = AgentTraceStep(
                step_number=step_counter,
                phase=phase,
                action_name=action,
                thought=thought,
                tool_input=tool_in,
                tool_output=tool_out,
                duration_ms=duration
            )
            state.trace.append(step)
            step_counter += 1

        # 1. PLANNING
        state.phase = AgentPhase.PLANNING
        t_plan = time.time()
        expected_cartons = self.carton_tool.execute(
            request.line_item.expected_units,
            request.line_item.units_per_carton,
            request.line_item.expected_cartons
        )["expected_cartons"]

        plan_summary = (
            f"Ingested manifest {request.manifest_id} for SKU {request.line_item.sku}. "
            f"Requirements: Expected {request.line_item.expected_units} units across {expected_cartons} cartons."
        )
        log_step(
            AgentPhase.PLANNING,
            "initialize_manifest_plan",
            plan_summary,
            tool_in={"manifest_id": request.manifest_id, "sku": request.line_item.sku},
            tool_out={"expected_cartons": expected_cartons},
            duration=round((time.time() - t_plan) * 1000, 2)
        )

        # 2. PERCEPTION
        state.phase = AgentPhase.PERCEPTION
        observed_facts, engine_used, v_ms = self.vision_tool.execute(
            request.line_item,
            request.evidence_images
        )
        state.observed_facts = observed_facts
        state.engine_used = engine_used

        log_step(
            AgentPhase.PERCEPTION,
            "multimodal_vision_observation",
            f"Executed {engine_used}. Extracted raw physical facts: SKU={observed_facts.detected_sku or 'N/A'}, "
            f"Variant={observed_facts.detected_variant or 'N/A'}, Seal={observed_facts.seal_status}.",
            tool_in={"evidence_count": len(request.evidence_images)},
            tool_out={"confidence": observed_facts.observation_confidence, "seal": observed_facts.seal_status},
            duration=v_ms
        )

        # 3. VERIFICATION
        state.phase = AgentPhase.VERIFICATION

        # Seal
        t_seal = time.time()
        seal_res = self.seal_tool.execute(observed_facts.seal_status)
        log_step(
            AgentPhase.VERIFICATION,
            "verify_trailer_seal",
            f"Bolt seal: {seal_res['status']}. {seal_res['explanation']}",
            tool_in={"seal_status": observed_facts.seal_status},
            tool_out=seal_res,
            duration=round((time.time() - t_seal) * 1000, 2)
        )

        # Carton Math
        t_math = time.time()
        math_res = self.carton_tool.execute(
            request.line_item.expected_units,
            request.line_item.units_per_carton,
            observed_facts.observed_carton_count or request.line_item.expected_cartons
        )
        log_step(
            AgentPhase.VERIFICATION,
            "verify_carton_math_hierarchy",
            f"Carton math: {math_res['status']}. Observed {math_res['observed_cartons']} vs Expected {math_res['expected_cartons']}.",
            tool_in={"expected_units": request.line_item.expected_units},
            tool_out=math_res,
            duration=round((time.time() - t_math) * 1000, 2)
        )

        # Barcode
        t_bc = time.time()
        bc_res = self.barcode_tool.execute(request.line_item.expected_barcode, observed_facts.detected_barcode)
        log_step(
            AgentPhase.VERIFICATION,
            "verify_barcode_symbology",
            f"Barcode: {bc_res['status']}. {bc_res['explanation']}",
            tool_in={"expected": request.line_item.expected_barcode},
            tool_out=bc_res,
            duration=round((time.time() - t_bc) * 1000, 2)
        )

        # Variant
        t_var = time.time()
        var_res = self.variant_tool.execute(request.line_item.expected_variant, observed_facts.detected_variant)
        log_step(
            AgentPhase.VERIFICATION,
            "verify_product_variant",
            f"Variant: {var_res['status']}. Expected '{request.line_item.expected_variant}' vs Observed '{observed_facts.detected_variant}'.",
            tool_in={"expected": request.line_item.expected_variant},
            tool_out=var_res,
            duration=round((time.time() - t_var) * 1000, 2)
        )

        # 4. DECISION
        state.phase = AgentPhase.DECISION
        t_dec = time.time()
        disposition, violations, rationale, checks = ReceivingDispositionPolicy.evaluate(
            request.line_item,
            observed_facts
        )
        state.disposition = disposition
        state.policy_violations = violations
        state.disposition_rationale = rationale
        state.checks = checks

        log_step(
            AgentPhase.DECISION,
            "evaluate_disposition_policy",
            f"Disposition: {disposition}. Violations: {len(violations)}. Rationale: {rationale}",
            tool_in={"policy_rules_count": 8},
            tool_out={"disposition": disposition, "violations": violations},
            duration=round((time.time() - t_dec) * 1000, 2)
        )

        # 5. AUDIT
        state.phase = AgentPhase.AUDIT
        cube_record = {
            "record_id": f"CUBE-RCV-{request.manifest_id}",
            "session_id": session_id,
            "manifest_id": request.manifest_id,
            "sku": request.line_item.sku,
            "disposition": disposition,
            "checks": [c.model_dump() for c in checks],
            "confidence_score": observed_facts.observation_confidence,
            "violations_count": len(violations),
            "agent_trace_steps": len(state.trace),
            "engine": engine_used,
            "timestamp": datetime.utcnow().isoformat()
        }
        state.cube_evidence_record = cube_record
        state.phase = AgentPhase.COMPLETED
        state.total_execution_ms = round((time.time() - start_time) * 1000, 2)
        state.completed_at = datetime.utcnow()

        return A2AInspectResponse(
            contract_version="1.0.0",
            manifest_id=request.manifest_id,
            sku=request.line_item.sku,
            disposition=disposition,
            confidence_score=observed_facts.observation_confidence,
            checks=checks,
            cube_evidence_record=cube_record,
            observed_facts=observed_facts,
            policy_violations=violations,
            disposition_rationale=rationale,
            engine_used=engine_used,
            execution_time_ms=state.total_execution_ms,
            timestamp=state.completed_at
        )
