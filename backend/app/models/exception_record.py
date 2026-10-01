from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin

class ExceptionRecord(Base, TimestampMixin):
    __tablename__ = "exception_records"

    id = Column(Integer, primary_key=True, index=True)
    exception_number = Column(String(64), unique=True, index=True, nullable=False)
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=False, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=True, index=True)
    sku = Column(String(64), nullable=True)
    exception_type = Column(String(64), nullable=False) # QUANTITY_SHORTAGE, QUANTITY_OVERAGE, PHYSICAL_DAMAGE, BROKEN_SEAL, INCORRECT_SKU, LABEL_UNREADABLE
    issue = Column(String(128), nullable=True) # Short shipment, Wrong SKU, Wrong variant, Crushed carton, Water damage, Torn packaging, Missing components
    severity = Column(String(32), default="MEDIUM") # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(64), default="OPEN") # OPEN, INVESTIGATING, MANUAL_REVIEW, MORE_EVIDENCE_REQUESTED, SUPPLIER_NOTIFIED, RESOLVED
    discrepancy_details = Column(Text, nullable=False)
    expected_value = Column(String(128), nullable=True)
    actual_value = Column(String(128), nullable=True)
    confidence = Column(Float, nullable=True)
    evidence_photo_url = Column(String(512), nullable=True)
    evidence_citation = Column(Text, nullable=True)
    assigned_to = Column(String(128), default="Inbound Operations QA")
    resolution_notes = Column(Text, nullable=True)

    inspection = relationship("Inspection", back_populates="exceptions")
    purchase_order = relationship("PurchaseOrder")
