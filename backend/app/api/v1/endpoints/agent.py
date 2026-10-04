from fastapi import APIRouter
from app.schemas.a2a import A2AInspectRequest, A2AInspectResponse
from app.agent.core import ReceivingAgent

router = APIRouter()

@router.get("/status")
def get_agent_status():
    return {
        "agent_name": "ReceiveAI Autonomous Receiving Agent",
        "version": "1.0.0",
        "status": "HEALTHY",
        "phases": ["PLANNING", "PERCEPTION", "VERIFICATION", "DECISION", "AUDIT"],
        "tools": [
            "VisionPerceptionTool (Google Gemini 2.5 Flash)",
            "CartonMathTool (Master Pack Packaging Hierarchy)",
            "BarcodeDecoderTool (1D/2D Symbology Matcher)",
            "SealIntegrityTool (Trailer Bolt Seal Auditor)",
            "VariantMatchTool (Product Finish & Color Validator)",
            "AQLSamplingTool (ANSI/ASQ Z1.4 Defect Calculator)"
        ],
        "contract": "CUBE A2A Receiving Protocol v1.0",
        "fail_open_failsafe": "HOLD_FOR_MANUAL_REVIEW on timeout"
    }

@router.post("/run", response_model=A2AInspectResponse)
def run_agent_inspection(request: A2AInspectRequest):
    agent = ReceivingAgent()
    return agent.run(request)
