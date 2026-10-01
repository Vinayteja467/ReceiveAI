from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.models.inspection import Inspection
from app.models.purchase_order import PurchaseOrder, POLineItem
from app.models.product import Product
from app.models.evidence import EvidenceItem
from app.schemas.ai_inspection import AIInspectionReport

class BaseReceivingVisionEngine(ABC):
    @abstractmethod
    def analyze_inspection(
        self,
        inspection: Inspection,
        po: PurchaseOrder,
        primary_line: POLineItem,
        product: Product,
        evidence_items: List[EvidenceItem]
    ) -> AIInspectionReport:
        """
        Compares Purchase Order + Product Catalogue + Receiving Photographs across 10 checks:
        1. sku_identity
        2. quantity
        3. carton_count
        4. units_per_carton
        5. variant_color
        6. carton_damage
        7. product_damage
        8. water_damage
        9. torn_packaging
        10. missing_components

        Every check must return strictly: 'PASS', 'FAIL', or 'UNCERTAIN'.
        The engine must NEVER guess when visual evidence is insufficient.
        """
        pass
