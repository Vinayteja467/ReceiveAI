from sqlalchemy import Column, Integer, String, Float, Boolean, Text
from app.core.database import Base
from app.models.base import TimestampMixin

class Product(Base, TimestampMixin):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), index=True, nullable=False)
    variant = Column(String(100), default="Standard")  # e.g. Blue, Matte Black, 500ml
    units_per_carton = Column(Integer, default=12)
    required_components = Column(Text, nullable=True)  # JSON or comma-separated list of parts
    reference_image = Column(String(512), nullable=True)  # Image URL or local asset path
    barcode = Column(String(128), index=True, nullable=True)
    weight_kg = Column(Float, default=1.0)
    dimensions_cm = Column(String(64), default="20x20x20")
    unit_of_measure = Column(String(32), default="EA")
    packaging_type = Column(String(64), default="Corrugated Box")
    is_temperature_controlled = Column(Boolean, default=False)
    is_fragile = Column(Boolean, default=False)
    is_hazardous = Column(Boolean, default=False)
    sampling_rate_pct = Column(Float, default=10.0)
    acceptable_defect_tolerance_pct = Column(Float, default=1.5)
    inspection_notes = Column(Text, nullable=True)
