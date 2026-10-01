from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin

class EvidenceItem(Base, TimestampMixin):
    __tablename__ = "evidence_items"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("inspections.id"), nullable=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=True, index=True)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_type = Column(String(64), default="IMAGE") # MIME or format
    category = Column(String(64), default="CARTONS", index=True) # CARTONS, PRODUCTS, LABELS, PACKAGING, RECEIVING_AREA
    file_size_bytes = Column(Integer, default=0)
    caption = Column(String(255), nullable=True)
    confidence_score = Column(Float, nullable=True) # For future AI integration
    tags = Column(String(255), default="receiving,dock")
    notes = Column(Text, nullable=True)

    inspection = relationship("Inspection", back_populates="evidence")
    purchase_order = relationship("PurchaseOrder")
