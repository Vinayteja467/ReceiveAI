from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class WarehouseSettingBase(BaseModel):
    key: str
    value: str
    description: Optional[str] = None
    category: str = "GENERAL"

class WarehouseSettingCreate(WarehouseSettingBase):
    pass

class WarehouseSettingUpdate(BaseModel):
    value: str

class WarehouseSettingResponse(WarehouseSettingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WarehouseSettingsBundle(BaseModel):
    dock_doors_total: int = 8
    default_sampling_pct: float = 10.0
    auto_quarantine_damaged: bool = True
    temperature_variance_tolerance_c: float = 2.0
    strict_barcode_check: bool = True
    require_seal_photo: bool = True
    assigned_facility_code: str = "WH-DFW-04"
