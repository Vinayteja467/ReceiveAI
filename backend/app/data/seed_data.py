from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json
import math

from app.models.supplier import Supplier
from app.models.product import Product
from app.models.purchase_order import PurchaseOrder, POLineItem
from app.models.inspection import Inspection, InspectionItem
from app.models.exception_record import ExceptionRecord
from app.models.evidence import EvidenceItem
from app.models.warehouse_setting import WarehouseSetting

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Inspection).first():
        return

    print("Seeding ReceiveAI database with Suppliers, Products, POs, Inspections, and Evidence...")

    # Clear partially populated tables to prevent unique constraint conflicts
    try:
        db.query(EvidenceItem).delete()
        db.query(ExceptionRecord).delete()
        db.query(InspectionItem).delete()
        db.query(Inspection).delete()
        db.query(POLineItem).delete()
        db.query(PurchaseOrder).delete()
        db.query(Product).delete()
        db.query(Supplier).delete()
        db.query(WarehouseSetting).delete()
        db.commit()
    except Exception as e:
        db.rollback()

    # 1. Suppliers
    s_hydro = Supplier(
        name="HydroVessel Technologies Inc.",
        contact_name="Rachel Adams",
        email="orders@hydrovessel.com",
        phone="+1 (800) 493-7683",
        address="1400 Hydration Way, Boulder, CO 80301",
        rating=4.9,
        notes="Primary supplier for double-walled stainless insulated hydration containers."
    )
    s_apex = Supplier(
        name="Apex Telematics & Micro Solutions",
        contact_name="David Lin",
        email="fulfillment@apextelematics.io",
        phone="+1 (512) 884-9021",
        address="780 Silicon Blvd, Austin, TX 78701",
        rating=4.7,
        notes="High-precision industrial telematics hardware supplier."
    )
    s_bio = Supplier(
        name="BioPharma Logistics Express",
        contact_name="Dr. Julian Vance",
        email="coldchain@biopharmalogistics.com",
        phone="+1 (617) 220-4910",
        address="90 Life Sciences Way, Cambridge, MA 02142",
        rating=4.95,
        notes="Certified cold-chain pharmaceuticals supplier."
    )
    s_vanguard = Supplier(
        name="Vanguard Braking Systems GmbH",
        contact_name="Klaus Weber",
        email="export@vanguard-brake.de",
        phone="+49 711 48201",
        address="Industriestrasse 14, Stuttgart, Germany",
        rating=4.8,
        notes="Commercial vehicle OEM brake rotors and ceramic pads."
    )

    db.add_all([s_hydro, s_apex, s_bio, s_vanguard])
    db.commit()

    # 2. Products / SKUs
    p_bottle = Product(
        sku="BLUE-BOTTLE-001",
        name="Premium Water Bottle",
        description="Vacuum-insulated 32oz 18/8 stainless steel bottle with leakproof lid, powder coat finish",
        category="Beverageware & Hydration",
        variant="Blue",
        units_per_carton=12,
        required_components=json.dumps([
            "Stainless Steel Insulated Cap",
            "Food-Grade Silicone Seal Ring",
            "Ergonomic Carabiner Clip"
        ]),
        reference_image="https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
        barcode="0810024810924",
        weight_kg=0.48,
        dimensions_cm="9x9x28",
        unit_of_measure="EA",
        packaging_type="Custom Retail Sleeve + Master Shipper",
        is_temperature_controlled=False,
        is_fragile=False,
        is_hazardous=False,
        sampling_rate_pct=15.0,
        acceptable_defect_tolerance_pct=1.0,
        inspection_notes="Verify matte blue powder coat for scratches or pinholes; ensure silicone gasket is seated inside cap."
    )

    p_elec = Product(
        sku="SKU-ELEC-4091",
        name="Precision IoT Gateway Hub v4",
        description="Industrial DIN-rail mounted IoT telematics edge controller with multi-band antenna",
        category="Industrial Electronics",
        variant="Titanium Gray",
        units_per_carton=10,
        required_components=json.dumps([
            "DIN Rail Mounting Bracket",
            "Dual-Band Cellular Antenna",
            "24V DC Terminal Block Connector"
        ]),
        reference_image="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
        barcode="0793573184912",
        weight_kg=1.45,
        dimensions_cm="18x12x6",
        unit_of_measure="EA",
        packaging_type="ESD Shielded Antistatic Box",
        is_temperature_controlled=False,
        is_fragile=True,
        is_hazardous=False,
        sampling_rate_pct=15.0,
        acceptable_defect_tolerance_pct=0.5,
        inspection_notes="Inspect tamper tape on anti-static bag; verify MAC address QR scan matches barcode."
    )

    p_cold = Product(
        sku="SKU-COLD-8820",
        name="Lyophilized Diagnostic Reagents (Box of 50)",
        description="Ultra-sensitive immunoassay test vials requiring continuous refrigerated transport",
        category="Biomedical / Cold Chain",
        variant="50-Vial Kit",
        units_per_carton=8,
        required_components=json.dumps([
            "50 Sterile Reagent Vials",
            "Continuous Temperature Data Logger",
            "Quality Compliance Certificate"
        ]),
        reference_image="https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80",
        barcode="0884920412841",
        weight_kg=0.85,
        dimensions_cm="24x16x12",
        unit_of_measure="BOX",
        packaging_type="Insulated Styrofoam + Dry Ice Shippers",
        is_temperature_controlled=True,
        is_fragile=True,
        is_hazardous=False,
        sampling_rate_pct=25.0,
        acceptable_defect_tolerance_pct=0.0,
        inspection_notes="Verify logger reading between 2.0C and 8.0C. Reject immediately if indicator red."
    )

    p_auto = Product(
        sku="SKU-AUTO-1055",
        name="Brembo High-Performance Ceramic Brake Rotors",
        description="Slotted vented front ceramic brake rotor discs for commercial logistics vans",
        category="Automotive Hardware",
        variant="Front Pair (380mm)",
        units_per_carton=2,
        required_components=json.dumps([
            "Vented Left Rotor Disc",
            "Vented Right Rotor Disc",
            "Anti-Rattle Hardware Clip Set"
        ]),
        reference_image="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80",
        barcode="0948271055301",
        weight_kg=14.2,
        dimensions_cm="38x38x8",
        unit_of_measure="PAIR",
        packaging_type="Reinforced Heavy Carton with Wood Core",
        is_temperature_controlled=False,
        is_fragile=False,
        is_hazardous=False,
        sampling_rate_pct=10.0,
        acceptable_defect_tolerance_pct=1.0,
        inspection_notes="Check anti-corrosion grease seal and confirm rotor surface is free of gouges or pitting."
    )

    db.add_all([p_bottle, p_elec, p_cold, p_auto])
    db.commit()

    # 3. Purchase Orders
    po_demo = PurchaseOrder(
        po_number="PO-2026-00124",
        supplier_id=s_hydro.id,
        vendor_name=s_hydro.name,
        carrier="FedEx Freight Priority",
        tracking_number="FXF-881920-US",
        status="AT_DOCK",
        order_date=datetime.utcnow() - timedelta(days=3),
        expected_delivery=datetime.utcnow(),
        assigned_dock="Dock Door 02",
        total_lines=1,
        total_expected_units=24,
        total_received_units=0,
        notes="High-priority retail fulfillment batch for Premium Water Bottle (Blue). Inspect packaging and component integrity."
    )

    po1 = PurchaseOrder(
        po_number="PO-2026-9041",
        supplier_id=s_apex.id,
        vendor_name=s_apex.name,
        carrier="FedEx Freight Priority",
        tracking_number="FXF-948201-US",
        status="RECEIVED",
        order_date=datetime.utcnow() - timedelta(days=5),
        expected_delivery=datetime.utcnow() - timedelta(hours=2),
        assigned_dock="Dock Door 03",
        total_lines=1,
        total_expected_units=300,
        total_received_units=300,
        notes="IoT edge telematics controllers."
    )

    po2 = PurchaseOrder(
        po_number="PO-2026-9042",
        supplier_id=s_bio.id,
        vendor_name=s_bio.name,
        carrier="DHL Medical Cold Fleet",
        tracking_number="DHL-MED-77190",
        status="PARTIALLY_RECEIVED",
        order_date=datetime.utcnow() - timedelta(days=2),
        expected_delivery=datetime.utcnow() - timedelta(hours=4),
        assigned_dock="Dock Door 01 (Cold Dock)",
        total_lines=1,
        total_expected_units=200,
        total_received_units=180,
        notes="Cold chain shipment. Mandatory temp logging on receipt."
    )

    db.add_all([po_demo, po1, po2])
    db.commit()

    # 4. Line Items
    li_demo = POLineItem(
        po_id=po_demo.id,
        product_id=p_bottle.id,
        sku="BLUE-BOTTLE-001",
        item_name="Premium Water Bottle",
        expected_variant="Blue",
        expected_units_per_carton=12,
        expected_carton_count=2,
        expected_qty=24,
        received_qty=0,
        unit_price=28.50,
        inspection_required=True,
        status="PENDING"
    )

    li1 = POLineItem(
        po_id=po1.id,
        product_id=p_elec.id,
        sku=p_elec.sku,
        item_name=p_elec.name,
        expected_variant="Titanium Gray",
        expected_units_per_carton=10,
        expected_carton_count=30,
        expected_qty=300,
        received_qty=300,
        unit_price=189.50,
        inspection_required=True,
        status="ACCEPTED"
    )

    li2 = POLineItem(
        po_id=po2.id,
        product_id=p_cold.id,
        sku=p_cold.sku,
        item_name=p_cold.name,
        expected_variant="50-Vial Kit",
        expected_units_per_carton=8,
        expected_carton_count=25,
        expected_qty=200,
        received_qty=180,
        unit_price=340.00,
        inspection_required=True,
        status="SHORTAGE"
    )

    db.add_all([li_demo, li1, li2])
    db.commit()

    # 5. Seed Inspections
    ins1 = Inspection(
        inspection_number="INS-2026-0001",
        po_id=po1.id,
        dock_door="Dock Door 03",
        inspector_name="Carlos Mendez - Senior QA Specialist",
        carrier_checkin_seal_intact=True,
        carrier_bol_match=True,
        temperature_reading_c=21.4,
        status="PASSED",
        overall_disposition="ACCEPTED",
        started_at=datetime.utcnow() - timedelta(hours=2, minutes=30),
        completed_at=datetime.utcnow() - timedelta(hours=1, minutes=45),
        total_items_inspected=30,
        total_passed_items=30,
        total_defects_found=0,
        notes="Trailer seal matched BOL #774102. Pallets in pristine condition. Barcodes 100% verified."
    )

    ins2 = Inspection(
        inspection_number="INS-2026-0002",
        po_id=po2.id,
        dock_door="Dock Door 01 (Cold Dock)",
        inspector_name="Elena Rostova - Cold QA Lead",
        carrier_checkin_seal_intact=True,
        carrier_bol_match=False,
        temperature_reading_c=4.1,
        status="FLAGGED",
        overall_disposition="ACCEPTED_WITH_EXCEPTIONS",
        started_at=datetime.utcnow() - timedelta(hours=3, minutes=15),
        completed_at=datetime.utcnow() - timedelta(hours=2, minutes=10),
        total_items_inspected=25,
        total_passed_items=21,
        total_defects_found=4,
        notes="20 carton count shortage vs BOL manifest. 4 cartons had crushed outer styrofoam corners."
    )

    db.add_all([ins1, ins2])
    db.commit()

    # 6. Inspection Items
    it1 = InspectionItem(
        inspection_id=ins1.id,
        sku=p_elec.sku,
        item_name=p_elec.name,
        sampled_quantity=30,
        passed_quantity=30,
        defective_quantity=0,
        defect_category=None,
        status="PASSED",
        notes="Anti-static bag seals intact. Barcodes clear."
    )
    it2 = InspectionItem(
        inspection_id=ins2.id,
        sku=p_cold.sku,
        item_name=p_cold.name,
        sampled_quantity=25,
        passed_quantity=21,
        defective_quantity=4,
        defect_category="CRUSHED_BOX",
        status="FLAGGED",
        notes="4 cartons compressed corners. Vials intact."
    )
    db.add_all([it1, it2])
    db.commit()

    # 7. Seed Evidence Items across categories
    ev1 = EvidenceItem(
        inspection_id=ins1.id,
        po_id=po1.id,
        file_name="carton_strapping_check.jpg",
        file_path="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
        file_type="IMAGE",
        category="CARTONS",
        file_size_bytes=1420500,
        caption="Master carton banding intact on arrival.",
        confidence_score=0.99,
        tags="receiving,cartons"
    )
    ev2 = EvidenceItem(
        inspection_id=ins1.id,
        po_id=po1.id,
        file_name="telematics_barcode_label.jpg",
        file_path="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80",
        file_type="IMAGE",
        category="LABELS",
        file_size_bytes=1180200,
        caption="High resolution barcode label scan matching PO-2026-9041.",
        confidence_score=0.98,
        tags="receiving,labels"
    )
    ev3 = EvidenceItem(
        inspection_id=ins2.id,
        po_id=po2.id,
        file_name="shippers_compressed_foam.jpg",
        file_path="https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=600&q=80",
        file_type="IMAGE",
        category="PACKAGING",
        file_size_bytes=2480100,
        caption="Corner crush on outer packaging.",
        confidence_score=0.94,
        tags="receiving,packaging"
    )
    ev4 = EvidenceItem(
        inspection_id=ins1.id,
        po_id=po1.id,
        file_name="dock_bay_unloading_staging.jpg",
        file_path="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80",
        file_type="IMAGE",
        category="RECEIVING_AREA",
        file_size_bytes=3120000,
        caption="Dock Door 03 staging view upon trailer unlatch.",
        confidence_score=0.97,
        tags="receiving,receiving_area"
    )

    # Pre-staged demo evidence for PO-2026-00124 (Premium Water Bottle)
    ev_demo1 = EvidenceItem(
        inspection_id=None,
        po_id=po_demo.id,
        file_name="outer_carton_seal_inspection.jpg",
        file_path="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
        file_type="IMAGE",
        category="CARTONS",
        file_size_bytes=1450000,
        caption="Master corrugated outer cartons stacked on pallet with corner protectors.",
        confidence_score=0.98,
        tags="demo,cartons"
    )
    ev_demo2 = EvidenceItem(
        inspection_id=None,
        po_id=po_demo.id,
        file_name="product_bottle_blue_finish.jpg",
        file_path="https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80",
        file_type="IMAGE",
        category="PRODUCTS",
        file_size_bytes=1450000,
        caption="Unboxed Premium Water Bottle sample in Blue powder-coat finish.",
        confidence_score=0.99,
        tags="demo,products"
    )
    ev_demo3 = EvidenceItem(
        inspection_id=None,
        po_id=po_demo.id,
        file_name="shipping_barcode_label.jpg",
        file_path="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80",
        file_type="IMAGE",
        category="LABELS",
        file_size_bytes=1180200,
        caption="Clear 1D/2D shipping label with readable UPC barcode and SKU: BLUE-BOTTLE-001.",
        confidence_score=0.98,
        tags="demo,labels"
    )
    ev_demo4 = EvidenceItem(
        inspection_id=None,
        po_id=po_demo.id,
        file_name="dock_trailer_receiving_bay.jpg",
        file_path="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80",
        file_type="IMAGE",
        category="RECEIVING_AREA",
        file_size_bytes=3120000,
        caption="Inbound trailer staging area at Dock Door 02.",
        confidence_score=0.97,
        tags="demo,receiving_area"
    )
    db.add_all([ev1, ev2, ev3, ev4, ev_demo1, ev_demo2, ev_demo3, ev_demo4])
    db.commit()

    # 8. Warehouse Settings
    settings_records = [
        WarehouseSetting(key="facility_code", value="WH-DFW-04", category="GENERAL", description="Primary distribution and cross-dock facility code"),
        WarehouseSetting(key="dock_doors_total", value="8", category="DOCK_GATES", description="Total operational inbound dock bays"),
        WarehouseSetting(key="default_sampling_pct", value="10.0", category="SAMPLING", description="Default AQL inspection sampling percentage"),
        WarehouseSetting(key="auto_quarantine_damaged", value="true", category="TOLERANCE", description="Automatically flag and quarantine shipments with critical damage"),
        WarehouseSetting(key="temperature_variance_tolerance_c", value="2.0", category="TOLERANCE", description="Maximum allowable deviation from designated storage temp"),
        WarehouseSetting(key="strict_barcode_check", value="true", category="WORKFLOW", description="Require 100% SKU barcode scan match against PO manifest"),
        WarehouseSetting(key="require_seal_photo", value="true", category="WORKFLOW", description="Mandatory high-res photo capture of trailer seal before trailer unlatch")
    ]
    for s in settings_records:
        db.add(s)
    db.commit()

    print("Complete database seeded with Suppliers, Products, POs, Inspections, and Categorized Evidence!")
