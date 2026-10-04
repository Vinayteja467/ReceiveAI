import time
import asyncio
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.a2a import A2AInspectRequest, A2AInspectResponse
from app.services.ai_engine.observer import ReceivingObserver
from app.services.ai_engine.policy import ReceivingDispositionPolicy

router = APIRouter()

@router.post("/inspect", response_model=A2AInspectResponse)
async def a2a_inspect(request: A2AInspectRequest):
    """
    Receiving Agent-to-Agent (A2A) Contract Endpoint.
    
    Inputs:
      - manifest_id (PO number)
      - line_item: contract specs (SKU, variant, units/carton, expected cartons)
      - evidence_images: image URLs or local paths
      - timeout_seconds: max execution budget before fail-open
      
    Outputs:
      - disposition: ACCEPTED | EXCEPTION | HOLD_FOR_MANUAL_REVIEW
      - observed_facts: raw physical perception extracted from images
      - policy_violations: list of explicit rule violations
      - timeout handling: guaranteed return of HOLD_FOR_MANUAL_REVIEW if timeout occurs
    """
    start_time = time.time()
    observer = ReceivingObserver()

    async def _execute_inspection():
        loop = asyncio.get_event_loop()
        observed_facts, engine_used = await loop.run_in_executor(
            None,
            observer.observe,
            request.line_item,
            request.evidence_images
        )

        # Stage 2: Evaluate deterministic policy
        disposition, violations, rationale = ReceivingDispositionPolicy.evaluate(
            request.line_item,
            observed_facts
        )

        return observed_facts, engine_used, disposition, violations, rationale

    try:
        # Enforce timeout budget with fail-open safety
        observed_facts, engine_used, disposition, violations, rationale = await asyncio.wait_for(
            _execute_inspection(),
            timeout=request.timeout_seconds
        )
        elapsed_ms = round((time.time() - start_time) * 1000, 2)

        return A2AInspectResponse(
            contract_version="1.0.0",
            manifest_id=request.manifest_id,
            sku=request.line_item.sku,
            disposition=disposition,
            confidence_score=observed_facts.observation_confidence,
            observed_facts=observed_facts,
            policy_violations=violations,
            disposition_rationale=rationale,
            engine_used=engine_used,
            execution_time_ms=elapsed_ms,
            timestamp=datetime.utcnow()
        )

    except asyncio.TimeoutError:
        elapsed_ms = round((time.time() - start_time) * 1000, 2)
        # FAIL-OPEN TO HOLD_FOR_MANUAL_REVIEW
        from app.schemas.a2a import ObservedFacts
        return A2AInspectResponse(
            contract_version="1.0.0",
            manifest_id=request.manifest_id,
            sku=request.line_item.sku,
            disposition="HOLD_FOR_MANUAL_REVIEW",
            confidence_score=0.0,
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
        from app.schemas.a2a import ObservedFacts
        return A2AInspectResponse(
            contract_version="1.0.0",
            manifest_id=request.manifest_id,
            sku=request.line_item.sku,
            disposition="HOLD_FOR_MANUAL_REVIEW",
            confidence_score=0.0,
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
