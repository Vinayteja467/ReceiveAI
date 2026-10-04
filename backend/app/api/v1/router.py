from fastapi import APIRouter
from app.api.v1.endpoints import (
    dashboard,
    inspections,
    purchase_orders,
    products,
    exceptions,
    evidence,
    settings,
    suppliers,
    a2a
)

api_router = APIRouter()

api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(inspections.router, prefix="/inspections", tags=["Inspections"])
api_router.include_router(purchase_orders.router, prefix="/purchase-orders", tags=["Purchase Orders"])
api_router.include_router(products.router, prefix="/products", tags=["Products Catalog"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["Suppliers"])
api_router.include_router(exceptions.router, prefix="/exceptions", tags=["Exceptions & Disputes"])
api_router.include_router(evidence.router, prefix="/evidence", tags=["Inspection Evidence"])
api_router.include_router(settings.router, prefix="/settings", tags=["Settings & Tolerances"])
api_router.include_router(a2a.router, prefix="/a2a", tags=["A2A Receiving Agent Contract"])
