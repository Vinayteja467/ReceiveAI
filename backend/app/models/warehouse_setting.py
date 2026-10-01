from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base
from app.models.base import TimestampMixin

class WarehouseSetting(Base, TimestampMixin):
    __tablename__ = "warehouse_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(128), unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    category = Column(String(64), default="GENERAL") # TOLERANCE, DOCK_GATES, SAMPLING, NOTIFICATIONS
