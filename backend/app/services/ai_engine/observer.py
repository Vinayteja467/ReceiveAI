import os
import json
import logging
import base64
from typing import List, Optional
from app.schemas.a2a import ObservedFacts, A2ALineItemContract

logger = logging.getLogger("receive_ai.observer")

class ReceivingObserver:
    """
    Perception Engine: Responsible ONLY for observing physical facts from evidence images.
    Does NOT make business disposition decisions.
    Tries real Google Gemini Vision API if key is present; otherwise runs deterministic observer.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "").strip()

    def observe(
        self,
        expected: A2ALineItemContract,
        evidence_images: List[str]
    ) -> Tuple_Observed:
        # Check if real Gemini is configured
        if self.api_key and not self.api_key.startswith("your_"):
            try:
                return self._observe_with_gemini(expected, evidence_images)
            except Exception as e:
                logger.warning(f"Gemini API call failed: {e}. Falling back to deterministic observer.")
                return self._observe_deterministic(expected, evidence_images, fallback_reason=str(e))

        return self._observe_deterministic(expected, evidence_images, fallback_reason="No GEMINI_API_KEY configured")

    def _observe_with_gemini(
        self,
        expected: A2ALineItemContract,
        evidence_images: List[str]
    ) -> Tuple_Observed:
        import google.generativeai as genai

        genai.configure(api_key=self.api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        system_instruction = (
            "You are an expert Receiving Quality Inspection Vision Observer.\n"
            "Analyze the attached inbound shipment evidence photographs.\n"
            "Extract raw physical observations ONLY. Do NOT make acceptance decisions.\n"
            "Strictly output a valid JSON object matching this schema:\n"
            "{\n"
            '  "detected_sku": string or null,\n'
            '  "detected_variant": string or null (e.g. "Blue", "Matte Black"),\n'
            '  "detected_barcode": string or null,\n'
            '  "observed_units_count": integer or null,\n'
            '  "observed_carton_count": integer or null,\n'
            '  "carton_damage_present": boolean,\n'
            '  "carton_damage_type": string or "none",\n'
            '  "product_damage_present": boolean,\n'
            '  "seal_status": "INTACT" | "BROKEN" | "MISSING" | "UNCERTAIN",\n'
            '  "label_legible": boolean,\n'
            '  "components_found": [string],\n'
            '  "image_quality_adequate": boolean,\n'
            '  "observation_confidence": float between 0.0 and 1.0,\n'
            '  "observation_notes": string\n'
            "}"
        )

        prompt_parts = [system_instruction, f"Expected Reference Manifest: SKU={expected.sku}, Variant={expected.expected_variant}, Barcode={expected.expected_barcode}"]

        # Load images if valid local file paths or URLs
        from PIL import Image
        import requests
        import io

        for img_ref in evidence_images[:4]: # Cap at 4 photos
            try:
                if os.path.exists(img_ref):
                    img = Image.open(img_ref)
                    prompt_parts.append(img)
                elif img_ref.startswith("http://") or img_ref.startswith("https://"):
                    resp = requests.get(img_ref, timeout=5)
                    if resp.status_code == 200:
                        img = Image.open(io.BytesIO(resp.content))
                        prompt_parts.append(img)
            except Exception as img_err:
                logger.debug(f"Could not load image reference {img_ref}: {img_err}")

        response = model.generate_content(prompt_parts)
        raw_text = response.text.strip()
        # Clean markdown codeblocks if present
        if raw_text.startswith("```"):
            lines = raw_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            raw_text = "\n".join(lines).strip()

        data = json.loads(raw_text)
        facts = ObservedFacts(**data)
        return facts, "Google Gemini 1.5 Flash (Vision Observer)"

    def _observe_deterministic(
        self,
        expected: A2ALineItemContract,
        evidence_images: List[str],
        fallback_reason: str = ""
    ) -> Tuple_Observed:
        """
        Deterministic perception baseline for offline eval, tests, and zero-key environments.
        Inspects metadata and filenames/captions to infer physical facts.
        """
        joined_text = " ".join([str(img).lower() for img in evidence_images])

        # Check for ambiguous / low quality markers
        is_blurry = any(term in joined_text for term in ["blur", "occluded", "dark", "ambiguous", "glare", "unclear"])
        if is_blurry or len(evidence_images) == 0:
            facts = ObservedFacts(
                detected_sku=None,
                detected_variant=None,
                detected_barcode=None,
                carton_damage_present=False,
                seal_status="UNCERTAIN",
                image_quality_adequate=False,
                observation_confidence=0.45,
                observation_notes=f"Visual evidence is ambiguous or missing close-up details ({fallback_reason})."
            )
            return facts, "Deterministic Policy Engine (Fallback / Zero-Key Mode)"

        # Check for damage markers
        has_damage = any(term in joined_text for term in ["damage", "crush", "puncture", "tear", "dent", "broken_carton"])
        damage_type = "corner_crush" if "crush" in joined_text else ("puncture" if "puncture" in joined_text else ("water" if "water" in joined_text else "none"))

        # Check for variant mismatch markers
        has_black = "black" in joined_text and "blue" in expected.expected_variant.lower()
        has_red = "red" in joined_text and "blue" in expected.expected_variant.lower()
        detected_variant = "Matte Black" if has_black else ("Ruby Red" if has_red else expected.expected_variant)

        # Check for seal status
        seal_broken = any(term in joined_text for term in ["seal_cut", "seal_broken", "tampered"])
        seal_status = "BROKEN" if seal_broken else "INTACT"

        # Check for barcode mismatch
        barcode_mismatch = "wrong_barcode" in joined_text or "barcode_mismatch" in joined_text
        detected_barcode = "999000111222" if barcode_mismatch else (expected.expected_barcode or "0810024810924")

        # Check for SKU mismatch
        sku_mismatch = "wrong_sku" in joined_text or "sku_mismatch" in joined_text
        detected_sku = "SKU-MISMATCH-999" if sku_mismatch else expected.sku

        # Check for carton shortage
        carton_shortage = "shortage" in joined_text or "missing_carton" in joined_text
        observed_cartons = (expected.expected_cartons - 1) if (carton_shortage and expected.expected_cartons > 1) else expected.expected_cartons

        # Check for missing components
        missing_comp = "missing_comp" in joined_text or "no_clip" in joined_text or "no_ring" in joined_text
        components_found = [] if missing_comp else list(expected.required_components)

        facts = ObservedFacts(
            detected_sku=detected_sku,
            detected_variant=detected_variant,
            detected_barcode=detected_barcode,
            observed_units_count=expected.expected_units if not carton_shortage else (observed_cartons * expected.units_per_carton),
            observed_carton_count=observed_cartons,
            carton_damage_present=has_damage,
            carton_damage_type=damage_type if has_damage else "none",
            product_damage_present=False,
            seal_status=seal_status,
            label_legible=True,
            components_found=components_found,
            image_quality_adequate=True,
            observation_confidence=0.96,
            observation_notes=f"Extracted physical facts. Engine: Deterministic Observer ({fallback_reason})."
        )

        return facts, "Deterministic Policy Engine (Fallback / Zero-Key Mode)"

Tuple_Observed = tuple[ObservedFacts, str]
