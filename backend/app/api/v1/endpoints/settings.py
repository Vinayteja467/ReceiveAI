from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.warehouse_setting import WarehouseSetting
from app.schemas.settings_schema import WarehouseSettingResponse, WarehouseSettingsBundle

router = APIRouter()

@router.get("", response_model=Dict[str, Any])
def get_all_settings(db: Session = Depends(get_db)):
    settings_items = db.query(WarehouseSetting).all()
    config_dict = {}
    items_list = []
    for s in settings_items:
        config_dict[s.key] = s.value
        items_list.append({
            "key": s.key,
            "value": s.value,
            "category": s.category,
            "description": s.description
        })

    return {
        "raw_settings": items_list,
        "config": {
            "facility_code": config_dict.get("facility_code", "WH-DFW-04"),
            "dock_doors_total": int(config_dict.get("dock_doors_total", "8")),
            "default_sampling_pct": float(config_dict.get("default_sampling_pct", "10.0")),
            "auto_quarantine_damaged": config_dict.get("auto_quarantine_damaged", "true").lower() == "true",
            "temperature_variance_tolerance_c": float(config_dict.get("temperature_variance_tolerance_c", "2.0")),
            "strict_barcode_check": config_dict.get("strict_barcode_check", "true").lower() == "true",
            "require_seal_photo": config_dict.get("require_seal_photo", "true").lower() == "true"
        }
    }

@router.put("", response_model=Dict[str, str])
def update_settings(bundle: WarehouseSettingsBundle, db: Session = Depends(get_db)):
    updates = {
        "facility_code": bundle.assigned_facility_code,
        "dock_doors_total": str(bundle.dock_doors_total),
        "default_sampling_pct": str(bundle.default_sampling_pct),
        "auto_quarantine_damaged": str(bundle.auto_quarantine_damaged).lower(),
        "temperature_variance_tolerance_c": str(bundle.temperature_variance_tolerance_c),
        "strict_barcode_check": str(bundle.strict_barcode_check).lower(),
        "require_seal_photo": str(bundle.require_seal_photo).lower()
    }

    for key, val in updates.items():
        record = db.query(WarehouseSetting).filter(WarehouseSetting.key == key).first()
        if record:
            record.value = val
        else:
            new_rec = WarehouseSetting(key=key, value=val, category="GENERAL")
            db.add(new_rec)

    db.commit()
    return {"message": "Warehouse inspection settings saved successfully"}
