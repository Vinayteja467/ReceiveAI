from sqlalchemy import Column, Integer, String, Float, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin

class Supplier(Base, TimestampMixin):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    contact_name = Column(String(128), nullable=True)
    email = Column(String(128), nullable=True)
    phone = Column(String(64), nullable=True)
    address = Column(String(255), nullable=True)
    rating = Column(Float, default=4.8)
    notes = Column(Text, nullable=True)

    purchase_orders = relationship("PurchaseOrder", back_populates="supplier")
