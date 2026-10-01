from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from app.models.base import TimestampMixin

class PurchaseOrder(Base, TimestampMixin):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String(64), unique=True, index=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True, index=True)
    vendor_name = Column(String(255), nullable=False) # Fallback/display name
    carrier = Column(String(128), default="Freight Express")
    tracking_number = Column(String(128), nullable=True)
    status = Column(String(64), default="AT_DOCK", index=True)  # PENDING, AT_DOCK, PARTIALLY_RECEIVED, RECEIVED, CLOSED
    order_date = Column(DateTime, default=datetime.utcnow)
    expected_delivery = Column(DateTime, default=datetime.utcnow)
    assigned_dock = Column(String(64), default="Dock 01")
    total_lines = Column(Integer, default=0)
    total_expected_units = Column(Integer, default=0)
    total_received_units = Column(Integer, default=0)
    notes = Column(Text, nullable=True)

    supplier = relationship("Supplier", back_populates="purchase_orders")
    line_items = relationship("POLineItem", back_populates="purchase_order", cascade="all, delete-orphan")
    inspections = relationship("Inspection", back_populates="purchase_order")

class POLineItem(Base, TimestampMixin):
    __tablename__ = "po_line_items"

    id = Column(Integer, primary_key=True, index=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    sku = Column(String(64), nullable=False)
    item_name = Column(String(255), nullable=False)
    expected_variant = Column(String(100), default="Standard")
    expected_units_per_carton = Column(Integer, default=12)
    expected_carton_count = Column(Integer, default=1)
    expected_qty = Column(Integer, nullable=False)
    received_qty = Column(Integer, default=0)
    unit_price = Column(Float, default=0.0)
    inspection_required = Column(Boolean, default=True)
    status = Column(String(64), default="PENDING")  # PENDING, INSPECTION, ACCEPTED, SHORTAGE, OVERAGE, REJECTED

    purchase_order = relationship("PurchaseOrder", back_populates="line_items")
    product = relationship("Product")
