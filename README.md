# ReceiveAI — Intelligent Receiving Inspection Manager

**Track:** CUBE Buildathon — RCV Receiving Manager  
**Architecture:** Full-Stack Enterprise Warehouse / Commerce SaaS  
**Stack:** FastAPI (Python) + PostgreSQL / SQLite + React 18 + Vite + Tailwind CSS

---

## Overview

**ReceiveAI** is an enterprise-grade receiving inspection and quality management platform built for modern inbound warehouse fulfillment and cross-docking operations. It provides dock managers, QA specialists, and receiving clerks with real-time visibility into inbound trailers, freight condition, purchase order matching, AQL sampling compliance, and exception resolution.

---

## Key Modules & Navigation

1. **Dashboard (`/`)**: Real-time dock KPI board, First-Pass Yield (FPY), trailer dock bay status (Bays 01–08), receiving throughput, and active discrepancies feed.
2. **New Inspection (`/new-inspection`)**: Guided 3-step receiving inspection wizard:
   - *Step 1: PO & Carrier Check-in* (Seal integrity check, BOL match, dock bay assignment).
   - *Step 2: SKU Item Sampling & Verification* (AQL sample sizing, defect logging, packaging check).
   - *Step 3: Quality Disposition & Release* (Cold chain temp log, Accept, Accept with Exceptions, Quarantine, or Reject).
3. **Inspections (`/inspections`)**: Master inspection ledger with status filters (`In Progress`, `Passed`, `Flagged`, `Rejected`) and drill-down inspection detail drawers.
4. **Purchase Orders (`/purchase-orders`)**: Inbound PO tracking, vendor manifests, line items, and fulfillment progress meters.
5. **Products (`/products`)**: SKU master catalog with AQL sampling rules, defect tolerance percentages, and cold-chain/hazmat/fragile indicators.
6. **Exceptions (`/exceptions`)**: Dispute and quarantine management for quantity shortages, freight damage, and packaging issues.
7. **Evidence (`/evidence`)**: Digital proof vault storing package photos, trailer seal verifications, and signed BOL slips.
8. **Settings (`/settings`)**: Warehouse dock gate counts, AQL sampling levels, and temperature variance thresholds.

---

## Quickstart Guide

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Install dependencies (FastAPI, SQLAlchemy, Pydantic v2, Uvicorn)
python -m pip install -r requirements.txt

# Run backend development server
python run.py
```
> The backend runs on `http://127.0.0.1:8000`.  
> API documentation is available at `http://127.0.0.1:8000/docs`.  
> By default, an auto-seeded SQLite database (`receiveai.db`) is initialized with realistic enterprise warehouse data. To connect to PostgreSQL, set `DATABASE_URL=postgresql://user:password@localhost:5432/receiveai` in `backend/.env`.

### 2. Frontend Setup (React + Vite + Tailwind CSS)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server with proxy to backend
npm run dev
```
> The frontend runs on `http://localhost:5173`.  
> API requests to `/api` and `/uploads` are automatically proxied to `http://127.0.0.1:8000`.

---

## Directory Structure

```
receive-ai/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── dashboard.py         # KPIs, throughput & dock activity
│   │   │   │   ├── inspections.py       # Inspection CRUD & disposition
│   │   │   │   ├── purchase_orders.py   # POs and line items
│   │   │   │   ├── products.py          # SKU catalog & tolerances
│   │   │   │   ├── exceptions.py        # Discrepancy management
│   │   │   │   ├── evidence.py          # Photo uploads & proofs
│   │   │   │   └── settings.py          # Dock & warehouse configs
│   │   │   └── router.py                # Consolidated v1 router
│   │   ├── core/
│   │   │   ├── config.py                # Pydantic BaseSettings
│   │   │   └── database.py              # SQLAlchemy engine & session
│   │   ├── data/
│   │   │   └── seed_data.py             # Realistic enterprise seed generator
│   │   ├── models/                      # SQLAlchemy ORM models
│   │   ├── schemas/                     # Pydantic request/response schemas
│   │   └── main.py                      # FastAPI app & lifespan handler
│   ├── run.py                           # Uvicorn runner
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                  # Badge, Card, MetricCard, Modal
│   │   │   └── layout/                  # Sidebar, Header, AppLayout
│   │   ├── pages/                       # 8 Enterprise navigation views
│   │   ├── services/
│   │   │   └── api.js                   # Axios REST client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── docker-compose.yml                   # Optional PostgreSQL container
└── README.md
```

---

## Clean Architecture for Future AI Extension

The data models and API contracts are structured to support future AI vision and document models without refactoring:
- `EvidenceItem.confidence_score` and `tags` support AI defect detection.
- `InspectionItem.defect_category` is mapped to standardized computer vision classification taxonomies.
- Real REST endpoints and Pydantic schemas allow seamless model inference pipelines to be mounted directly.
