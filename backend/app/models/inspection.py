from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from app.models.base import TimestampMixin

class Inspection(Base, TimestampMixin):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    inspection_number = Column(String(64), unique=True, index=True, nullable=False)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False, index=True)
    dock_door = Column(String(64), default="Dock 01")
    inspector_name = Column(String(128), default="Lead Receiving Specialist")
    carrier_checkin_seal_intact = Column(Boolean, default=True)
    carrier_bol_match = Column(Boolean, default=True)
    temperature_reading_c = Column(Float, nullable=True)
    status = Column(String(64), default="IN_PROGRESS", index=True) # PENDING, IN_PROGRESS, PASSED, FLAGGED, REJECTED
    overall_disposition = Column(String(64), default="PENDING_REVIEW") # ACCEPTED, ACCEPTED_WITH_EXCEPTIONS, QUARANTINED, REJECTED, PENDING_REVIEW
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    total_items_inspected = Column(Integer, default=0)
    total_passed_items = Column(Integer, default=0)
    total_defects_found = Column(Integer, default=0)
    notes = Column(Text, nullable=True)

    purchase_order = relationship("PurchaseOrder", back_populates="inspections")
    items = relationship("InspectionItem", back_populates="inspection", cascade="all, delete-orphan")
    exceptions = relationship("ExceptionRecord", back_populates="inspection", cascade="all, delete-orphan")
    evidence = relationship("EvidenceItem", back_populates="inspection", cascade="all, delete-orphan")

class InspectionItem(Base, TimestampMixin):
    __tablename__ = "inspection_items"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=False, index=True)
    po_line_item_id = Column(Integer, ForeignKey("po_line_items.id"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    sku = Column(String(64), nullable=False)
    item_name = Column(String(255), nullable=False)
    sampled_quantity = Column(Integer, default=1)
    passed_quantity = Column(Integer, default=1)
    defective_quantity = Column(Integer, default=0)
    defect_category = Column(String(64), nullable=True) # CRUSHED_BOX, BROKEN_SEAL, WATER_DAMAGE, LABEL_MISMATCH, EXPIRY_PASSED, MISSING_BARCODE, WRONG_ITEM
    status = Column(String(64), default="PASSED") # PASSED, FLAGGED, FAILED, PENDING
    notes = Column(Text, nullable=True)

    inspection = relationship("Inspection", back_populates="items")
    product = relationship("Product")
