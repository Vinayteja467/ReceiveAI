from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    category: str
    variant: str = "Standard"
    units_per_carton: int = 12
    required_components: Optional[str] = None
    reference_image: Optional[str] = None
    barcode: Optional[str] = None
    weight_kg: float = 1.0
    dimensions_cm: str = "20x20x20"
    unit_of_measure: str = "EA"
    packaging_type: str = "Corrugated Box"
    is_temperature_controlled: bool = False
    is_fragile: bool = False
    is_hazardous: bool = False
    sampling_rate_pct: float = 10.0
    acceptable_defect_tolerance_pct: float = 1.5
    inspection_notes: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
