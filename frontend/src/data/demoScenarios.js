// CUBE Buildathon — RCV Receiving Manager Demo Scenarios Data Registry
// 10 realistic warehouse receiving scenarios with strict zero-guessing enforcement

export const DEMO_SCENARIOS = [
  {
    id: 'scenario-1',
    number: 1,
    title: 'Correct Shipment',
    tag: 'COMPLIANT',
    tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    summary: '100% compliant delivery. Expected 24 units in 2 cartons unboxed on QA bench, matching barcodes, blue powder-coat finish, and full BOM components.',
    overallDecision: 'ACCEPTED',
    po: {
      id: 101,
      po_number: 'PO-2026-00101',
      vendor_name: 'HydroVessel Technologies Inc.',
      order_date: '2026-09-27',
      expected_delivery: '2026-09-30',
      total_expected_units: 24,
      total_lines: 1,
      assigned_dock: 'Dock Door 02',
      carrier: 'FedEx Freight Priority',
      tracking_number: 'FXF-00101-US'
    },
    product: {
      sku: 'BLUE-BOTTLE-001',
      name: 'Premium Water Bottle',
      category: 'Beverageware & Hydration',
      variant: 'Blue',
      units_per_carton: 12,
      expected_carton_count: 2,
      required_components: [
        'Stainless Steel Insulated Cap',
        'Food-Grade Silicone Seal Ring',
        'Ergonomic Carabiner Clip'
      ]
    },
    evidencePhotos: [
      {
        id: 's1-p1',
        file_name: 'pallet_cartons_intact_s1.jpg',
        file_path: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
        category: 'CARTONS',
        caption: '2 intact master cartons neatly stacked on receiving pallet with corner protectors.',
        finding: '2 master cartons present and undamaged matching expected packaging density.'
      },
      {
        id: 's1-p2',
        file_name: 'unboxed_24_units_bench_s1.jpg',
        file_path: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
        category: 'PRODUCTS',
        caption: 'All 24 units unboxed and arranged on receiving bench for physical count.',
        finding: '24 physical units clearly visible and counted across inspection workspace.'
      },
      {
        id: 's1-p3',
        file_name: 'shipping_label_barcode_s1.jpg',
        file_path: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
        category: 'LABELS',
        caption: 'Legible barcode label showing UPC 0810024810924 and SKU BLUE-BOTTLE-001.',
        finding: 'Barcode scan and text string unambiguously corroborate SKU BLUE-BOTTLE-001.'
      },
      {
        id: 's1-p4',
        file_name: 'bom_component_inspection_s1.jpg',
        file_path: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80',
        category: 'PACKAGING',
        caption: 'Sample bottle cap unscrewed showing silicone seal and carabiner loop.',
        finding: 'All 3 required BOM components (cap, silicone gasket, carabiner) verified intact.'
      }
    ],
    checks: {
      sku_identity: {
        status: 'PASS',
        expected: 'BLUE-BOTTLE-001',
        observed: 'BLUE-BOTTLE-001',
        confidence: 0.99,
        evidence: [{ image: 'shipping_label_barcode_s1.jpg', finding: 'Barcode scan matches SKU: BLUE-BOTTLE-001', category: 'LABELS', image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Physical barcode scan and packaging slip unambiguously confirm SKU identity BLUE-BOTTLE-001.'
      },
      quantity: {
        status: 'PASS',
        expected: 24,
        observed: 24,
        confidence: 0.98,
        evidence: [{ image: 'unboxed_24_units_bench_s1.jpg', finding: '24 unboxed units counted across workspace', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'All 24 units are visually spread and clearly counted. Quantity matches PO.'
      },
      carton_count: {
        status: 'PASS',
        expected: 2,
        observed: 2,
        confidence: 0.97,
        evidence: [{ image: 'pallet_cartons_intact_s1.jpg', finding: '2 master cartons verified on pallet', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Exactly 2 master shipper cartons are present on the receiving pallet.'
      },
      variant_color: {
        status: 'PASS',
        expected: 'Blue',
        observed: 'Blue',
        confidence: 0.97,
        evidence: [{ image: 'unboxed_24_units_bench_s1.jpg', finding: 'Blue matte powder coat matches PO variant specification', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Product color and surface finish correspond to ordered Blue variant.'
      },
      damage: {
        status: 'PASS',
        expected: '0 Defects / Clean Shipment',
        observed: 'Intact (0 crushing, water, or tears)',
        confidence: 0.96,
        evidence: [{ image: 'pallet_cartons_intact_s1.jpg', finding: 'Cartons dry, square, and strapping taut', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Outer cartons, strapping bands, and individual bottle finishes show zero damage.'
      },
      missing_components: {
        status: 'PASS',
        expected: 'Cap, Silicone Gasket, Carabiner Clip',
        observed: 'Complete assembly present',
        confidence: 0.95,
        evidence: [{ image: 'bom_component_inspection_s1.jpg', finding: 'All 3 BOM parts attached to sampled bottle', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Cap, silicone seal gasket, and carabiner clip are properly assembled.'
      }
    }
  },
  {
    id: 'scenario-2',
    number: 2,
    title: 'Short Shipment',
    tag: 'DISCREPANCY',
    tagColor: 'bg-rose-100 text-rose-800 border-rose-300',
    summary: 'Discrepancy: Expected 24 units, but receiving photos show only 20 unboxed units on the cart. 4 units short against purchase order line item.',
    overallDecision: 'EXCEPTION',
    po: {
      id: 102,
      po_number: 'PO-2026-00102',
      vendor_name: 'Apex Telematics & Micro Solutions',
      order_date: '2026-09-26',
      expected_delivery: '2026-09-30',
      total_expected_units: 24,
      total_lines: 1,
      assigned_dock: 'Dock Door 03',
      carrier: 'FedEx Freight Priority',
      tracking_number: 'FXF-00102-US'
    },
    product: {
      sku: 'SKU-ELEC-4091',
      name: 'Precision IoT Gateway Hub v4',
      category: 'Industrial Electronics',
      variant: 'Titanium Gray',
      units_per_carton: 12,
      expected_carton_count: 2,
      required_components: ['DIN Rail Bracket', 'Antenna', 'Terminal Connector']
    },
    evidencePhotos: [
      {
        id: 's2-p1',
        file_name: 'cart_unboxed_short_20_units.jpg',
        file_path: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        category: 'PRODUCTS',
        caption: 'Staging cart holding exactly 20 unboxed IoT gateways. One carton compartment was empty.',
        finding: '20 units are visibly identifiable across the receiving photographs.'
      },
      {
        id: 's2-p2',
        file_name: 'barcode_label_elec_4091.jpg',
        file_path: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
        category: 'LABELS',
        caption: 'Barcode label matching SKU-ELEC-4091.',
        finding: 'SKU identity confirmed as SKU-ELEC-4091.'
      }
    ],
    checks: {
      sku_identity: {
        status: 'PASS',
        expected: 'SKU-ELEC-4091',
        observed: 'SKU-ELEC-4091',
        confidence: 0.98,
        evidence: [{ image: 'barcode_label_elec_4091.jpg', finding: 'SKU matches SKU-ELEC-4091', category: 'LABELS', image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Barcode label matches PO SKU specification.'
      },
      quantity: {
        status: 'FAIL',
        expected: 24,
        observed: 20,
        confidence: 0.94,
        evidence: [{ image: 'cart_unboxed_short_20_units.jpg', finding: '20 units are visibly identifiable across the receiving photographs.', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' }],
        explanation: '20 units are visibly identifiable across the receiving photographs. Expected 24 units. 4 units short.'
      },
      carton_count: {
        status: 'PASS',
        expected: 2,
        observed: 2,
        confidence: 0.95,
        evidence: [{ image: 'cart_unboxed_short_20_units.jpg', finding: '2 outer cartons present', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Carton count matches 2 cartons, but inner packaging had 4 vacant slots.'
      },
      variant_color: {
        status: 'PASS',
        expected: 'Titanium Gray',
        observed: 'Titanium Gray',
        confidence: 0.95,
        evidence: [{ image: 'cart_unboxed_short_20_units.jpg', finding: 'Finish matches Titanium Gray', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Product finish matches specified Titanium Gray variant.'
      },
      damage: {
        status: 'PASS',
        expected: '0 Defects',
        observed: 'Clean units',
        confidence: 0.93,
        evidence: [{ image: 'cart_unboxed_short_20_units.jpg', finding: 'No physical damage on delivered units', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'The 20 received units are in undamaged condition.'
      },
      missing_components: {
        status: 'PASS',
        expected: 'Complete BOM',
        observed: 'Components attached',
        confidence: 0.92,
        evidence: [{ image: 'cart_unboxed_short_20_units.jpg', finding: 'Brackets and antennas present on verified units', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Included units have all required sub-assemblies.'
      }
    }
  },
  {
    id: 'scenario-3',
    number: 3,
    title: 'Extra Units (Over-Shipment)',
    tag: 'DISCREPANCY',
    tagColor: 'bg-rose-100 text-rose-800 border-rose-300',
    summary: 'Discrepancy: PO specifies 50 units of Heavy-Duty Carabiners, but receiving photograph count reveals 60 units (an extra 10-pack carton included).',
    overallDecision: 'EXCEPTION',
    po: {
      id: 103,
      po_number: 'PO-2026-00103',
      vendor_name: 'HydroVessel Technologies Inc.',
      order_date: '2026-09-28',
      expected_delivery: '2026-09-30',
      total_expected_units: 50,
      total_lines: 1,
      assigned_dock: 'Dock Door 02',
      carrier: 'UPS Freight Ground',
      tracking_number: '1Z-99482-00103'
    },
    product: {
      sku: 'SKU-HD-CARAB-50',
      name: 'Heavy-Duty Steel Carabiners (Bulk Pack)',
      category: 'Hardware & Accessories',
      variant: 'Zinc Silver',
      units_per_carton: 50,
      expected_carton_count: 1,
      required_components: ['Gate Lock Collar', 'Tension Spring']
    },
    evidencePhotos: [
      {
        id: 's3-p1',
        file_name: 'extra_units_count_60_pieces.jpg',
        file_path: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80',
        category: 'PRODUCTS',
        caption: 'Overpack container holding 6 sub-boxes of 10 carabiners each (total 60 units).',
        finding: '60 physical units counted across receiving photos vs expected 50.'
      }
    ],
    checks: {
      sku_identity: {
        status: 'PASS',
        expected: 'SKU-HD-CARAB-50',
        observed: 'SKU-HD-CARAB-50',
        confidence: 0.98,
        evidence: [{ image: 'extra_units_count_60_pieces.jpg', finding: 'SKU verified as SKU-HD-CARAB-50', category: 'LABELS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Barcode correctly indicates SKU-HD-CARAB-50.'
      },
      quantity: {
        status: 'FAIL',
        expected: 50,
        observed: 60,
        confidence: 0.95,
        evidence: [{ image: 'extra_units_count_60_pieces.jpg', finding: '60 units are visibly identifiable across the receiving photographs.', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: '60 units are visibly identifiable across receiving photographs. 10 excess units above ordered 50 units.'
      },
      carton_count: {
        status: 'PASS',
        expected: 1,
        observed: 1,
        confidence: 0.95,
        evidence: [{ image: 'extra_units_count_60_pieces.jpg', finding: '1 master shipper received', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: '1 master container received as expected.'
      },
      variant_color: {
        status: 'PASS',
        expected: 'Zinc Silver',
        observed: 'Zinc Silver',
        confidence: 0.96,
        evidence: [{ image: 'extra_units_count_60_pieces.jpg', finding: 'Zinc silver finish verified', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Finish matches Zinc Silver.'
      },
      damage: {
        status: 'PASS',
        expected: '0 Defects',
        observed: 'Clean',
        confidence: 0.94,
        evidence: [{ image: 'extra_units_count_60_pieces.jpg', finding: 'No defect detected', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Units and inner packaging are intact.'
      },
      missing_components: {
        status: 'PASS',
        expected: 'Complete',
        observed: 'All parts present',
        confidence: 0.95,
        evidence: [{ image: 'extra_units_count_60_pieces.jpg', finding: 'Lock collar and springs present', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'All carabiners have lock collars.'
      }
    }
  },
  {
    id: 'scenario-4',
    number: 4,
    title: 'Wrong SKU (Barcode Mismatch)',
    tag: 'DISCREPANCY',
    tagColor: 'bg-rose-100 text-rose-800 border-rose-300',
    summary: 'Discrepancy: PO specifies BLUE-BOTTLE-001, but the master carton shipping label and product barcode clearly read GREEN-BOTTLE-002.',
    overallDecision: 'EXCEPTION',
    po: {
      id: 104,
      po_number: 'PO-2026-00104',
      vendor_name: 'HydroVessel Technologies Inc.',
      order_date: '2026-09-28',
      expected_delivery: '2026-09-30',
      total_expected_units: 24,
      total_lines: 1,
      assigned_dock: 'Dock Door 02',
      carrier: 'FedEx Freight Priority',
      tracking_number: 'FXF-00104-US'
    },
    product: {
      sku: 'BLUE-BOTTLE-001',
      name: 'Premium Water Bottle',
      category: 'Beverageware & Hydration',
      variant: 'Blue',
      units_per_carton: 12,
      expected_carton_count: 2,
      required_components: ['Stainless Steel Insulated Cap', 'Silicone Seal Ring', 'Carabiner Clip']
    },
    evidencePhotos: [
      {
        id: 's4-p1',
        file_name: 'wrong_sku_barcode_green_bottle.jpg',
        file_path: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
        category: 'LABELS',
        caption: 'High-resolution macro shot of outer barcode label reading GREEN-BOTTLE-002 (UPC 0810024810999).',
        finding: 'Physical barcode label scan reads SKU: GREEN-BOTTLE-002.'
      }
    ],
    checks: {
      sku_identity: {
        status: 'FAIL',
        expected: 'BLUE-BOTTLE-001',
        observed: 'GREEN-BOTTLE-002',
        confidence: 0.99,
        evidence: [{ image: 'wrong_sku_barcode_green_bottle.jpg', finding: 'Physical barcode scan reads GREEN-BOTTLE-002', category: 'LABELS', image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Barcode scan and text label on shipper cartons show GREEN-BOTTLE-002 instead of expected BLUE-BOTTLE-001. Mis-shipment from vendor.'
      },
      quantity: {
        status: 'PASS',
        expected: 24,
        observed: 24,
        confidence: 0.95,
        evidence: [{ image: 'wrong_sku_barcode_green_bottle.jpg', finding: '24 units present (in wrong SKU)', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Quantity matches 24 units, but product identity is invalid.'
      },
      carton_count: {
        status: 'PASS',
        expected: 2,
        observed: 2,
        confidence: 0.95,
        evidence: [{ image: 'wrong_sku_barcode_green_bottle.jpg', finding: '2 cartons received', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80' }],
        explanation: '2 cartons received.'
      },
      variant_color: {
        status: 'FAIL',
        expected: 'Blue',
        observed: 'Green',
        confidence: 0.97,
        evidence: [{ image: 'wrong_sku_barcode_green_bottle.jpg', finding: 'Label and finish indicate Green variant', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Wrong product line and color variant.'
      },
      damage: {
        status: 'PASS',
        expected: '0 Defects',
        observed: 'Intact',
        confidence: 0.95,
        evidence: [{ image: 'wrong_sku_barcode_green_bottle.jpg', finding: 'No structural damage', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Cartons are clean.'
      },
      missing_components: {
        status: 'PASS',
        expected: 'Complete',
        observed: 'Complete',
        confidence: 0.92,
        evidence: [{ image: 'wrong_sku_barcode_green_bottle.jpg', finding: 'BOM intact', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Assembly complete.'
      }
    }
  },
  {
    id: 'scenario-5',
    number: 5,
    title: 'Wrong Variant (Color Finish Mismatch)',
    tag: 'DISCREPANCY',
    tagColor: 'bg-rose-100 text-rose-800 border-rose-300',
    summary: 'Discrepancy: PO specifies Blue variant. Scanned SKU is correct, but unboxed bottle visual inspection reveals Matte Crimson Red powder-coat finish.',
    overallDecision: 'EXCEPTION',
    po: {
      id: 105,
      po_number: 'PO-2026-00105',
      vendor_name: 'HydroVessel Technologies Inc.',
      order_date: '2026-09-28',
      expected_delivery: '2026-09-30',
      total_expected_units: 24,
      total_lines: 1,
      assigned_dock: 'Dock Door 02',
      carrier: 'FedEx Freight Priority',
      tracking_number: 'FXF-00105-US'
    },
    product: {
      sku: 'BLUE-BOTTLE-001',
      name: 'Premium Water Bottle',
      category: 'Beverageware & Hydration',
      variant: 'Blue',
      units_per_carton: 12,
      expected_carton_count: 2,
      required_components: ['Stainless Steel Insulated Cap', 'Silicone Seal Ring', 'Carabiner Clip']
    },
    evidencePhotos: [
      {
        id: 's5-p1',
        file_name: 'crimson_red_bottle_unboxed.jpg',
        file_path: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80',
        category: 'PRODUCTS',
        caption: 'Unboxed sample showing dark Crimson Red coating instead of Blue.',
        finding: 'Visual finish matches Crimson Red instead of ordered Blue variant.'
      },
      {
        id: 's5-p2',
        file_name: 'carton_label_blue_bottle.jpg',
        file_path: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
        category: 'LABELS',
        caption: 'Outer carton label reading BLUE-BOTTLE-001.',
        finding: 'Carton label matches BLUE-BOTTLE-001.'
      }
    ],
    checks: {
      sku_identity: {
        status: 'PASS',
        expected: 'BLUE-BOTTLE-001',
        observed: 'BLUE-BOTTLE-001',
        confidence: 0.98,
        evidence: [{ image: 'carton_label_blue_bottle.jpg', finding: 'Outer label matches BLUE-BOTTLE-001', category: 'LABELS', image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Barcode and outer carton label indicate BLUE-BOTTLE-001.'
      },
      quantity: {
        status: 'PASS',
        expected: 24,
        observed: 24,
        confidence: 0.95,
        evidence: [{ image: 'crimson_red_bottle_unboxed.jpg', finding: '24 units verified', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: '24 physical units present.'
      },
      carton_count: {
        status: 'PASS',
        expected: 2,
        observed: 2,
        confidence: 0.95,
        evidence: [{ image: 'carton_label_blue_bottle.jpg', finding: '2 cartons verified', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80' }],
        explanation: '2 master cartons present.'
      },
      variant_color: {
        status: 'FAIL',
        expected: 'Blue',
        observed: 'Matte Crimson Red',
        confidence: 0.98,
        evidence: [{ image: 'crimson_red_bottle_unboxed.jpg', finding: 'Visual coating inspection reveals Matte Crimson Red finish', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Visual color coating analysis detected Matte Crimson Red finish instead of ordered Blue. Incorrect variant packaged inside shipper.'
      },
      damage: {
        status: 'PASS',
        expected: '0 Defects',
        observed: 'Pristine finish',
        confidence: 0.94,
        evidence: [{ image: 'crimson_red_bottle_unboxed.jpg', finding: 'No cosmetic defects', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Bottles are pristine without scratches.'
      },
      missing_components: {
        status: 'PASS',
        expected: 'Complete',
        observed: 'Complete',
        confidence: 0.94,
        evidence: [{ image: 'crimson_red_bottle_unboxed.jpg', finding: 'Cap and gasket present', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'BOM complete.'
      }
    }
  },
  {
    id: 'scenario-6',
    number: 6,
    title: 'Crushed Carton (Structural Damage)',
    tag: 'DAMAGE',
    tagColor: 'bg-rose-100 text-rose-800 border-rose-300',
    summary: 'Defect: Severe physical corrugated compression and buckled flute on outer master carton corner. Package integrity compromised.',
    overallDecision: 'EXCEPTION',
    po: {
      id: 106,
      po_number: 'PO-2026-00106',
      vendor_name: 'Vanguard Braking Systems GmbH',
      order_date: '2026-09-25',
      expected_delivery: '2026-09-30',
      total_expected_units: 4,
      total_lines: 1,
      assigned_dock: 'Dock Door 04',
      carrier: 'DHL Heavy Logistics',
      tracking_number: 'DHL-00106-EU'
    },
    product: {
      sku: 'SKU-AUTO-1055',
      name: 'High-Performance Ceramic Brake Rotors',
      category: 'Automotive Hardware',
      variant: 'Front Pair (380mm)',
      units_per_carton: 2,
      expected_carton_count: 2,
      required_components: ['Vented Left Rotor', 'Vented Right Rotor', 'Anti-Rattle Clip Set']
    },
    evidencePhotos: [
      {
        id: 's6-p1',
        file_name: 'crushed_carton_corner_deformation.jpg',
        file_path: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
        category: 'CARTONS',
        caption: 'Lower corner of master carton compressed inward with ruptured corrugated paper.',
        finding: 'Severe corrugated corner crush deformation detected on master carton.'
      }
    ],
    checks: {
      sku_identity: {
        status: 'PASS',
        expected: 'SKU-AUTO-1055',
        observed: 'SKU-AUTO-1055',
        confidence: 0.98,
        evidence: [{ image: 'crushed_carton_corner_deformation.jpg', finding: 'SKU label matches SKU-AUTO-1055', category: 'LABELS', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Barcode matches PO specification.'
      },
      quantity: {
        status: 'PASS',
        expected: 4,
        observed: 4,
        confidence: 0.92,
        evidence: [{ image: 'crushed_carton_corner_deformation.jpg', finding: '4 units accounted for in shipment', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Quantity matches 4 units.'
      },
      carton_count: {
        status: 'PASS',
        expected: 2,
        observed: 2,
        confidence: 0.95,
        evidence: [{ image: 'crushed_carton_corner_deformation.jpg', finding: '2 cartons received', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: '2 cartons present.'
      },
      variant_color: {
        status: 'PASS',
        expected: 'Front Pair (380mm)',
        observed: 'Front Pair (380mm)',
        confidence: 0.94,
        evidence: [{ image: 'crushed_carton_corner_deformation.jpg', finding: '380mm specification confirmed', category: 'LABELS', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Specification matches.'
      },
      damage: {
        status: 'FAIL',
        expected: '0 Defects / Intact Packaging',
        observed: 'Severe Corner Compression & Crushed Corrugate',
        confidence: 0.98,
        evidence: [{ image: 'crushed_carton_corner_deformation.jpg', finding: 'Severe corrugated corner crush deformation detected on master carton.', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Physical impact crushing detected on bottom carton corner. Risk of internal rotor disc warping or stress fracture.'
      },
      missing_components: {
        status: 'PASS',
        expected: 'All components present',
        observed: 'All components present',
        confidence: 0.90,
        evidence: [{ image: 'crushed_carton_corner_deformation.jpg', finding: 'Rotors and hardware clip set inside', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Hardware clip set accounted for.'
      }
    }
  },
  {
    id: 'scenario-7',
    number: 7,
    title: 'Water Damage (Moisture Ingress)',
    tag: 'DAMAGE',
    tagColor: 'bg-rose-100 text-rose-800 border-rose-300',
    summary: 'Defect: Outer shipper packaging exhibits dark wavy moisture stain rings and soggy bottom corrugated wall from internal melted packaging ice.',
    overallDecision: 'EXCEPTION',
    po: {
      id: 107,
      po_number: 'PO-2026-00107',
      vendor_name: 'BioPharma Logistics Express',
      order_date: '2026-09-28',
      expected_delivery: '2026-09-30',
      total_expected_units: 8,
      total_lines: 1,
      assigned_dock: 'Dock Door 01 (Cold Dock)',
      carrier: 'DHL Medical Cold Fleet',
      tracking_number: 'DHL-COLD-00107'
    },
    product: {
      sku: 'SKU-COLD-8820',
      name: 'Diagnostic Reagents (Box of 50)',
      category: 'Biomedical / Cold Chain',
      variant: '50-Vial Kit',
      units_per_carton: 8,
      expected_carton_count: 1,
      required_components: ['50 Sterile Vials', 'Temp Logger', 'Compliance Certificate']
    },
    evidencePhotos: [
      {
        id: 's7-p1',
        file_name: 'water_damage_moisture_stains_carton.jpg',
        file_path: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80',
        category: 'PACKAGING',
        caption: 'Dark water ingress watermark spreading across bottom 4 inches of the outer carton.',
        finding: 'Water damage detected: Dark moisture rings and soggy corrugate observed on shipper carton.'
      }
    ],
    checks: {
      sku_identity: {
        status: 'PASS',
        expected: 'SKU-COLD-8820',
        observed: 'SKU-COLD-8820',
        confidence: 0.98,
        evidence: [{ image: 'water_damage_moisture_stains_carton.jpg', finding: 'SKU matches SKU-COLD-8820', category: 'LABELS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Barcode matches PO specification.'
      },
      quantity: {
        status: 'PASS',
        expected: 8,
        observed: 8,
        confidence: 0.94,
        evidence: [{ image: 'water_damage_moisture_stains_carton.jpg', finding: '8 kits accounted for', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Quantity matches 8 kits.'
      },
      carton_count: {
        status: 'PASS',
        expected: 1,
        observed: 1,
        confidence: 0.96,
        evidence: [{ image: 'water_damage_moisture_stains_carton.jpg', finding: '1 cold shipper received', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: '1 carton received.'
      },
      variant_color: {
        status: 'PASS',
        expected: '50-Vial Kit',
        observed: '50-Vial Kit',
        confidence: 0.95,
        evidence: [{ image: 'water_damage_moisture_stains_carton.jpg', finding: '50-Vial kit confirmed', category: 'LABELS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Variant matches PO.'
      },
      damage: {
        status: 'FAIL',
        expected: 'Dry / 0 Moisture Ingress',
        observed: 'Water Damage: Dark moisture stain rings & soggy base',
        confidence: 0.97,
        evidence: [{ image: 'water_damage_moisture_stains_carton.jpg', finding: 'Water damage detected: Dark moisture rings and soggy corrugate observed on shipper carton.', category: 'PACKAGING', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Extensive moisture ingress detected. Soggy corrugate indicates dry ice/gel-pack condensation rupture. High risk of compromised reagents.'
      },
      missing_components: {
        status: 'PASS',
        expected: 'All components present',
        observed: 'Logger and cert present',
        confidence: 0.90,
        evidence: [{ image: 'water_damage_moisture_stains_carton.jpg', finding: 'Vials and logger present inside', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Vials and temp logger present.'
      }
    }
  },
  {
    id: 'scenario-8',
    number: 8,
    title: 'Torn Packaging (Broken Tamper Tape)',
    tag: 'DAMAGE',
    tagColor: 'bg-rose-100 text-rose-800 border-rose-300',
    summary: 'Defect: Security tamper-evident tape is sliced open along top center seam; polypropylene strapping is severed. Evidence of unauthorized opening.',
    overallDecision: 'EXCEPTION',
    po: {
      id: 108,
      po_number: 'PO-2026-00108',
      vendor_name: 'Apex Telematics & Micro Solutions',
      order_date: '2026-09-27',
      expected_delivery: '2026-09-30',
      total_expected_units: 10,
      total_lines: 1,
      assigned_dock: 'Dock Door 03',
      carrier: 'FedEx Freight Priority',
      tracking_number: 'FXF-00108-US'
    },
    product: {
      sku: 'SKU-ELEC-4091',
      name: 'Precision IoT Gateway Hub v4',
      category: 'Industrial Electronics',
      variant: 'Titanium Gray',
      units_per_carton: 10,
      expected_carton_count: 1,
      required_components: ['DIN Rail Bracket', 'Antenna', 'Terminal Connector']
    },
    evidencePhotos: [
      {
        id: 's8-p1',
        file_name: 'sliced_tamper_tape_broken_strapping.jpg',
        file_path: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
        category: 'PACKAGING',
        caption: 'Macro shot of severed plastic strapping band and cut holographic security tamper seal.',
        finding: 'Tamper-evident holographic security tape sliced open and plastic strapping severed.'
      }
    ],
    checks: {
      sku_identity: {
        status: 'PASS',
        expected: 'SKU-ELEC-4091',
        observed: 'SKU-ELEC-4091',
        confidence: 0.98,
        evidence: [{ image: 'sliced_tamper_tape_broken_strapping.jpg', finding: 'SKU matches SKU-ELEC-4091', category: 'LABELS', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Barcode verified.'
      },
      quantity: {
        status: 'PASS',
        expected: 10,
        observed: 10,
        confidence: 0.93,
        evidence: [{ image: 'sliced_tamper_tape_broken_strapping.jpg', finding: '10 units present inside box', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: '10 units accounted for.'
      },
      carton_count: {
        status: 'PASS',
        expected: 1,
        observed: 1,
        confidence: 0.95,
        evidence: [{ image: 'sliced_tamper_tape_broken_strapping.jpg', finding: '1 carton received', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: '1 carton received.'
      },
      variant_color: {
        status: 'PASS',
        expected: 'Titanium Gray',
        observed: 'Titanium Gray',
        confidence: 0.94,
        evidence: [{ image: 'sliced_tamper_tape_broken_strapping.jpg', finding: 'Titanium Gray confirmed', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Variant matches.'
      },
      damage: {
        status: 'FAIL',
        expected: 'Intact factory tamper tape and strapping',
        observed: 'Broken tamper tape seal & severed strapping band',
        confidence: 0.98,
        evidence: [{ image: 'sliced_tamper_tape_broken_strapping.jpg', finding: 'Tamper-evident holographic security tape sliced open and plastic strapping severed.', category: 'PACKAGING', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Packaging violation: Factory holographic tamper seal is severed. Package was opened in transit. Potential tampering or pilferage.'
      },
      missing_components: {
        status: 'PASS',
        expected: 'Complete',
        observed: 'Complete',
        confidence: 0.91,
        evidence: [{ image: 'sliced_tamper_tape_broken_strapping.jpg', finding: 'Components present inside', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Internal parts present.'
      }
    }
  },
  {
    id: 'scenario-9',
    number: 9,
    title: 'Missing Components (Incomplete BOM)',
    tag: 'DISCREPANCY',
    tagColor: 'bg-rose-100 text-rose-800 border-rose-300',
    summary: 'Discrepancy: Unboxed unit inspection reveals bottle neck has no food-grade silicone seal ring and carabiner clip is missing from cap loop.',
    overallDecision: 'EXCEPTION',
    po: {
      id: 109,
      po_number: 'PO-2026-00109',
      vendor_name: 'HydroVessel Technologies Inc.',
      order_date: '2026-09-28',
      expected_delivery: '2026-09-30',
      total_expected_units: 24,
      total_lines: 1,
      assigned_dock: 'Dock Door 02',
      carrier: 'FedEx Freight Priority',
      tracking_number: 'FXF-00109-US'
    },
    product: {
      sku: 'BLUE-BOTTLE-001',
      name: 'Premium Water Bottle',
      category: 'Beverageware & Hydration',
      variant: 'Blue',
      units_per_carton: 12,
      expected_carton_count: 2,
      required_components: ['Stainless Steel Insulated Cap', 'Food-Grade Silicone Seal Ring', 'Ergonomic Carabiner Clip']
    },
    evidencePhotos: [
      {
        id: 's9-p1',
        file_name: 'missing_gasket_and_carabiner_bottle.jpg',
        file_path: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
        category: 'PRODUCTS',
        caption: 'Close-up of unscrewed cap showing empty groove where silicone gasket should be; no carabiner attached.',
        finding: 'Silicone seal gasket and carabiner clip missing from sampled bottle assembly.'
      }
    ],
    checks: {
      sku_identity: {
        status: 'PASS',
        expected: 'BLUE-BOTTLE-001',
        observed: 'BLUE-BOTTLE-001',
        confidence: 0.98,
        evidence: [{ image: 'missing_gasket_and_carabiner_bottle.jpg', finding: 'SKU confirmed BLUE-BOTTLE-001', category: 'LABELS', image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'SKU identity verified.'
      },
      quantity: {
        status: 'PASS',
        expected: 24,
        observed: 24,
        confidence: 0.95,
        evidence: [{ image: 'missing_gasket_and_carabiner_bottle.jpg', finding: '24 units present', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80' }],
        explanation: '24 units accounted for.'
      },
      carton_count: {
        status: 'PASS',
        expected: 2,
        observed: 2,
        confidence: 0.95,
        evidence: [{ image: 'missing_gasket_and_carabiner_bottle.jpg', finding: '2 cartons received', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80' }],
        explanation: '2 master cartons present.'
      },
      variant_color: {
        status: 'PASS',
        expected: 'Blue',
        observed: 'Blue',
        confidence: 0.96,
        evidence: [{ image: 'missing_gasket_and_carabiner_bottle.jpg', finding: 'Blue finish verified', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Color matches Blue.'
      },
      damage: {
        status: 'PASS',
        expected: '0 Defects',
        observed: 'Clean finish',
        confidence: 0.94,
        evidence: [{ image: 'missing_gasket_and_carabiner_bottle.jpg', finding: 'No scratches or dents', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Bottle body is free of scratches.'
      },
      missing_components: {
        status: 'FAIL',
        expected: 'Cap, Silicone Seal Ring, Carabiner Clip',
        observed: 'Silicone Seal Ring and Carabiner Clip Missing',
        confidence: 0.96,
        evidence: [{ image: 'missing_gasket_and_carabiner_bottle.jpg', finding: 'Silicone seal gasket and carabiner clip missing from sampled bottle assembly.', category: 'PRODUCTS', image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Critical Bill of Materials non-conformance: Sampled units lack the internal silicone sealing gasket and carabiner clip. Products cannot seal liquid without gasket.'
      }
    }
  },
  {
    id: 'scenario-10',
    number: 10,
    title: 'Ambiguous Evidence (Zero-Guessing Benchmark)',
    tag: 'ZERO_GUESSING',
    tagColor: 'bg-amber-100 text-amber-800 border-amber-300',
    summary: 'Zero-Guessing Enforcement: Only 2 distant photos showing sealed master cartons wrapped in black stretch film. Result MUST strictly be UNCERTAIN.',
    overallDecision: 'UNCERTAIN',
    isAmbiguous: true,
    ambiguousMessage: 'Insufficient visual evidence to determine the shipment quantity.',
    po: {
      id: 110,
      po_number: 'PO-2026-00110',
      vendor_name: 'HydroVessel Technologies Inc.',
      order_date: '2026-09-28',
      expected_delivery: '2026-09-30',
      total_expected_units: 24,
      total_lines: 1,
      assigned_dock: 'Dock Door 02',
      carrier: 'FedEx Freight Priority',
      tracking_number: 'FXF-00110-US'
    },
    product: {
      sku: 'BLUE-BOTTLE-001',
      name: 'Premium Water Bottle',
      category: 'Beverageware & Hydration',
      variant: 'Blue',
      units_per_carton: 12,
      expected_carton_count: 2,
      required_components: ['Stainless Steel Insulated Cap', 'Food-Grade Silicone Seal Ring', 'Ergonomic Carabiner Clip']
    },
    evidencePhotos: [
      {
        id: 's10-p1',
        file_name: 'distant_pallet_black_film_wrap.jpg',
        file_path: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80',
        category: 'RECEIVING_AREA',
        caption: 'Pallet on trailer bed wrapped in opaque black stretch film. Individual carton contents invisible.',
        finding: 'Distant photo showing black stretch-wrapped pallet; internal cartons and bottles fully obscured.'
      },
      {
        id: 's10-p2',
        file_name: 'dock_door_overview_threshold.jpg',
        file_path: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
        category: 'CARTONS',
        caption: 'Overview of trailer door from 15 feet away. Barcode labels are unreadable at this resolution.',
        finding: 'Outer carton outline visible, but barcode text and quantity are unreadable at distance.'
      }
    ],
    checks: {
      sku_identity: {
        status: 'UNCERTAIN',
        expected: 'BLUE-BOTTLE-001',
        observed: 'Barcode obscured by black stretch film',
        confidence: 0.40,
        evidence: [{ image: 'dock_door_overview_threshold.jpg', finding: 'Barcode label unreadable at distance', category: 'LABELS', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Barcode labels cannot be read from the provided photographs. SKU identity cannot be confirmed without closer photograph.'
      },
      quantity: {
        status: 'UNCERTAIN',
        expected: 24,
        observed: 'Insufficient visual evidence (bottles sealed inside cartons)',
        confidence: 0.45,
        evidence: [{ image: 'distant_pallet_black_film_wrap.jpg', finding: 'Distant photo showing black stretch-wrapped pallet; internal cartons and bottles fully obscured.', category: 'RECEIVING_AREA', image_url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Insufficient visual evidence to determine the shipment quantity. Photographs show sealed master cartons wrapped in black film. Individual 24 units are not visibly identifiable without unboxing.'
      },
      carton_count: {
        status: 'PASS',
        expected: 2,
        observed: 2,
        confidence: 0.85,
        evidence: [{ image: 'distant_pallet_black_film_wrap.jpg', finding: '2 carton silhouettes visible under stretch wrap', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Approximately 2 master shipper cartons are identifiable under the pallet stretch wrap.'
      },
      variant_color: {
        status: 'UNCERTAIN',
        expected: 'Blue',
        observed: 'Units not unboxed in photographs',
        confidence: 0.40,
        evidence: [],
        explanation: 'No photograph shows unboxed product units. Color and surface finish cannot be verified.'
      },
      damage: {
        status: 'PASS',
        expected: '0 Defects / Intact Packaging',
        observed: 'Stretch film intact; no crushing visible',
        confidence: 0.88,
        evidence: [{ image: 'distant_pallet_black_film_wrap.jpg', finding: 'Outer pallet wrap secure', category: 'CARTONS', image_url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80' }],
        explanation: 'Pallet outer film is intact with no catastrophic crush marks, though inner carton condition is unverified.'
      },
      missing_components: {
        status: 'UNCERTAIN',
        expected: 'All components present',
        observed: 'Component breakdown not photographed',
        confidence: 0.40,
        evidence: [],
        explanation: 'Sub-components cannot be evaluated while products remain sealed.'
      }
    }
  }
];
