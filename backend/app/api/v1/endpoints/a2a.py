import time
import asyncio
from datetime import datetime
from fastapi import APIRouter
from app.schemas.a2a import A2AInspectRequest, A2AInspectResponse, CUBECheck, ObservedFacts
from app.agent.core import ReceivingAgent

router = APIRouter()

@router.post("/inspect", response_model=A2AInspectResponse)
async def a2a_inspect(request: A2AInspectRequest):
    start_time = time.time()
    agent = ReceivingAgent()

    async def _execute_agent():
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, agent.run, request)

    try:
        response = await asyncio.wait_for(
            _execute_agent(),
            timeout=request.timeout_seconds
        )
        return response

    except asyncio.TimeoutError:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        timeout_check = CUBECheck(
            check_name="execution_budget",
            status="UNCERTAIN",
            expected=f"< {request.timeout_seconds}s",
            observed=f"Timed out ({elapsed_ms}ms)",
            confidence=0.0,
            explanation="A2A execution timeout budget exceeded; fail-open activated."
        )
        cube_record = {
            "record_id": f"CUBE-TIMEOUT-{request.manifest_id}",
            "manifest_id": request.manifest_id,
            "sku": request.line_item.sku,
            "disposition": "HOLD_FOR_MANUAL_REVIEW",
            "checks": [timeout_check.model_dump()],
            "confidence_score": 0.0,
            "violations_count": 1,
            "engine": "FAILSAFE_TIMEOUT_HANDLER",
            "timestamp": datetime.utcnow().isoformat()
        }
        return A2AInspectResponse(
            contract_version="1.0.0",
            manifest_id=request.manifest_id,
            sku=request.line_item.sku,
            disposition="HOLD_FOR_MANUAL_REVIEW",
            confidence_score=0.0,
            checks=[timeout_check],
            cube_evidence_record=cube_record,
            observed_facts=ObservedFacts(
                image_quality_adequate=False,
                observation_confidence=0.0,
                observation_notes="Execution exceeded agent timeout limit."
            ),
            policy_violations=["TIMEOUT_EXCEEDED: Vision processing budget exceeded."],
            disposition_rationale="A2A Timeout failsafe activated. Shipment routed to manual review to prevent dock stoppage.",
            engine_used="FAILSAFE_TIMEOUT_HANDLER",
            execution_time_ms=elapsed_ms,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        error_check = CUBECheck(
            check_name="system_integrity",
            status="UNCERTAIN",
            expected="Clean execution",
            observed=f"Error: {str(e)}",
            confidence=0.0,
            explanation=str(e)
        )
        cube_record = {
            "record_id": f"CUBE-ERROR-{request.manifest_id}",
            "manifest_id": request.manifest_id,
            "sku": request.line_item.sku,
            "disposition": "HOLD_FOR_MANUAL_REVIEW",
            "checks": [error_check.model_dump()],
            "confidence_score": 0.0,
            "violations_count": 1,
            "engine": "FAILSAFE_ERROR_HANDLER",
            "timestamp": datetime.utcnow().isoformat()
        }
        return A2AInspectResponse(
            contract_version="1.0.0",
            manifest_id=request.manifest_id,
            sku=request.line_item.sku,
            disposition="HOLD_FOR_MANUAL_REVIEW",
            confidence_score=0.0,
            checks=[error_check],
            cube_evidence_record=cube_record,
            observed_facts=ObservedFacts(
                image_quality_adequate=False,
                observation_confidence=0.0,
                observation_notes=f"Unexpected agent error: {str(e)}"
            ),
            policy_violations=[f"AGENT_ERROR: {str(e)}"],
            disposition_rationale="Failsafe activated on exception. Routed to manual inspection.",
            engine_used="FAILSAFE_ERROR_HANDLER",
            execution_time_ms=elapsed_ms,
            timestamp=datetime.utcnow()
        )
