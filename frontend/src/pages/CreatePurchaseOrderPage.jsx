import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  Plus, 
  Trash2, 
  Building2, 
  Truck, 
  Calendar, 
  Boxes, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import Card from '../components/common/Card';
import { purchaseOrdersApi, suppliersApi, productsApi } from '../services/api';

export default function CreatePurchaseOrderPage({ onBack, onPoCreated }) {
  const [suppliers, setSuppliers] = useState([]);
  const [productsCatalog, setProductsCatalog] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [poNumber, setPoNumber] = useState(`PO-2026-00${Math.floor(100 + Math.random() * 900)}`);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [carrier, setCarrier] = useState('FedEx Freight Priority');
  const [trackingNumber, setTrackingNumber] = useState('FXF-774910-US');
  const [dockDoor, setDockDoor] = useState('Dock Door 02');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDelivery, setExpectedDelivery] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Line items state
  const [lineItems, setLineItems] = useState([
    {
      product_id: null,
      sku: 'BLUE-BOTTLE-001',
      item_name: 'Premium Water Bottle',
      expected_variant: 'Blue',
      expected_units_per_carton: 12,
      expected_qty: 24,
      expected_carton_count: 2,
      unit_price: 28.50,
      inspection_required: true
    }
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [supps, prods] = await Promise.all([
        suppliersApi.list(),
        productsApi.list()
      ]);
      setSuppliers(supps);
      setProductsCatalog(prods);

      // Pre-select HydroVessel if available
      const hydro = supps.find(s => s.name.includes('HydroVessel'));
      if (hydro) {
        setSelectedSupplierId(hydro.id);
        setVendorName(hydro.name);
      } else if (supps.length > 0) {
        setSelectedSupplierId(supps[0].id);
        setVendorName(supps[0].name);
      }
    } catch (err) {
      console.error("Failed to load suppliers/products:", err);
    }
  };

  // 1-Click Load Example Demo PO as specified in prompt!
  const loadDemoExamplePO = () => {
    const hydro = suppliers.find(s => s.name.includes('HydroVessel')) || suppliers[0];
    const bottleProd = productsCatalog.find(p => p.sku === 'BLUE-BOTTLE-001') || productsCatalog[0];

    setPoNumber('PO-2026-00124');
    if (hydro) {
      setSelectedSupplierId(hydro.id);
      setVendorName(hydro.name);
    } else {
      setVendorName('HydroVessel Technologies Inc.');
    }
    setCarrier('FedEx Freight Priority');
    setTrackingNumber('FXF-881920-US');
    setDockDoor('Dock Door 02');
    setNotes('Demo receiving inspection batch: 2 cartons of Premium Water Bottle (Blue variant). Inspect cap seal ring and anti-scratch finish.');

    setLineItems([
      {
        product_id: bottleProd?.id || null,
        sku: 'BLUE-BOTTLE-001',
        item_name: 'Premium Water Bottle',
        expected_variant: 'Blue',
        expected_units_per_carton: 12,
        expected_qty: 24,
        expected_carton_count: 2, // 24 / 12 = 2
        unit_price: 28.50,
        inspection_required: true
      }
    ]);
  };

  const handleSupplierChange = (supId) => {
    setSelectedSupplierId(supId);
    const found = suppliers.find(s => s.id === parseInt(supId, 10));
    if (found) setVendorName(found.name);
  };

  const handleProductSelect = (index, sku) => {
    const prod = productsCatalog.find(p => p.sku === sku);
    if (!prod) return;

    setLineItems(prev => {
      const copy = [...prev];
      const unitsPerCarton = prod.units_per_carton || 12;
      const currentQty = copy[index].expected_qty || unitsPerCarton;
      const cartons = Math.ceil(currentQty / unitsPerCarton);

      copy[index] = {
        ...copy[index],
        product_id: prod.id,
        sku: prod.sku,
        item_name: prod.name,
        expected_variant: prod.variant || 'Standard',
        expected_units_per_carton: unitsPerCarton,
        expected_carton_count: cartons,
        expected_qty: currentQty
      };
      return copy;
    });
  };

  const handleQtyChange = (index, qty) => {
    const parsedQty = parseInt(qty, 10) || 0;
    setLineItems(prev => {
      const copy = [...prev];
      const unitsPerCarton = Math.max(1, copy[index].expected_units_per_carton || 12);
      const cartons = Math.ceil(parsedQty / unitsPerCarton);

      copy[index] = {
        ...copy[index],
        expected_qty: parsedQty,
        expected_carton_count: cartons
      };
      return copy;
    });
  };

  const handleCartonCountChange = (index, cartons) => {
    const parsedCartons = parseInt(cartons, 10) || 0;
    setLineItems(prev => {
      const copy = [...prev];
      const unitsPerCarton = Math.max(1, copy[index].expected_units_per_carton || 12);
      const totalQty = parsedCartons * unitsPerCarton;

      copy[index] = {
        ...copy[index],
        expected_carton_count: parsedCartons,
        expected_qty: totalQty
      };
      return copy;
    });
  };

  const addLineItem = () => {
    const first = productsCatalog[0] || {};
    setLineItems(prev => [
      ...prev,
      {
        product_id: first.id || null,
        sku: first.sku || 'SKU-NEW',
        item_name: first.name || 'General Product',
        expected_variant: first.variant || 'Standard',
        expected_units_per_carton: first.units_per_carton || 12,
        expected_qty: (first.units_per_carton || 12) * 2,
        expected_carton_count: 2,
        unit_price: 20.00,
        inspection_required: true
      }
    ]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!poNumber.trim()) {
      setError("Please provide a PO number.");
      return;
    }
    if (lineItems.length === 0) {
      setError("Please add at least one line item.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        po_number: poNumber,
        supplier_id: selectedSupplierId ? parseInt(selectedSupplierId, 10) : null,
        vendor_name: vendorName || 'Vendor Logistics',
        carrier: carrier,
        tracking_number: trackingNumber,
        status: 'AT_DOCK',
        order_date: new Date(orderDate).toISOString(),
        expected_delivery: new Date(expectedDelivery).toISOString(),
        assigned_dock: dockDoor,
        notes: notes,
        line_items: lineItems.map(li => ({
          sku: li.sku,
          item_name: li.item_name,
          expected_variant: li.expected_variant,
          expected_units_per_carton: parseInt(li.expected_units_per_carton, 10) || 12,
          expected_carton_count: parseInt(li.expected_carton_count, 10) || 1,
          expected_qty: parseInt(li.expected_qty, 10) || 1,
          unit_price: parseFloat(li.unit_price) || 0.0,
          inspection_required: li.inspection_required,
          product_id: li.product_id
        }))
      };

      const result = await purchaseOrdersApi.create(payload);
      if (onPoCreated) onPoCreated(result.id);
    } catch (err) {
      console.error("Failed to create purchase order:", err);
      setError(err.response?.data?.detail || "Failed to create purchase order. Verify PO number uniqueness.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalCalculatedUnits = lineItems.reduce((acc, it) => acc + (parseInt(it.expected_qty, 10) || 0), 0);
  const totalCalculatedCartons = lineItems.reduce((acc, it) => acc + (parseInt(it.expected_carton_count, 10) || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header with Demo 1-Click Preset */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>

        {/* 1-Click Demo Preload Button */}
        <button
          type="button"
          onClick={loadDemoExamplePO}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold shadow-2xs transition-colors"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Load Example Demo PO (PO-2026-00124)</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* PO Header Information */}
        <Card title="Purchase Order Header" subtitle="PO identity, supplier selection, and delivery schedule">
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Purchase Order Number</label>
                <input
                  required
                  value={poNumber}
                  onChange={e => setPoNumber(e.target.value)}
                  placeholder="e.g. PO-2026-00124"
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-mono font-bold text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Supplier Entity</label>
                <select
                  value={selectedSupplierId}
                  onChange={e => handleSupplierChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white font-medium text-slate-800"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.contact_name || 'Rep'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Carrier Fleet</label>
                <input
                  value={carrier}
                  onChange={e => setCarrier(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tracking Number</label>
                <input
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 font-mono bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Dock Door</label>
                <select
                  value={dockDoor}
                  onChange={e => setDockDoor(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-white"
                >
                  <option>Dock Door 01 (Cold Dock)</option>
                  <option>Dock Door 02</option>
                  <option>Dock Door 03</option>
                  <option>Dock Door 04</option>
                  <option>Dock Door 05</option>
                  <option>Dock Door 06</option>
                  <option>Dock Door 07</option>
                  <option>Dock Door 08 (HazMat)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Order Placement Date</label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={e => setOrderDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  value={expectedDelivery}
                  onChange={e => setExpectedDelivery(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Dynamic Line Items Builder with Carton Calculation */}
        <Card
          title="Line Items & Packaging Breakdown"
          subtitle="Define product SKU, expected variant, units per carton, and total carton packaging"
          action={
            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            {lineItems.map((item, index) => (
              <div 
                key={index}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group"
              >
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                  <span className="font-bold text-slate-700">Line Item #{index + 1}</span>
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Product SKU</label>
                    <select
                      value={item.sku}
                      onChange={e => handleProductSelect(index, e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white font-mono font-bold text-slate-800"
                    >
                      {productsCatalog.map(p => (
                        <option key={p.id} value={p.sku}>
                          {p.sku} — {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Product Name</label>
                    <input
                      value={item.item_name}
                      onChange={e => {
                        const copy = [...lineItems];
                        copy[index].item_name = e.target.value;
                        setLineItems(copy);
                      }}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Expected Variant</label>
                    <input
                      value={item.expected_variant}
                      onChange={e => {
                        const copy = [...lineItems];
                        copy[index].expected_variant = e.target.value;
                        setLineItems(copy);
                      }}
                      placeholder="e.g. Blue"
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white font-semibold text-blue-700"
                    />
                  </div>
                </div>

                {/* Carton & Quantity Calculation Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Units per Carton</label>
                    <input
                      type="number"
                      min="1"
                      value={item.expected_units_per_carton}
                      onChange={e => {
                        const units = parseInt(e.target.value, 10) || 1;
                        const copy = [...lineItems];
                        copy[index].expected_units_per_carton = units;
                        copy[index].expected_carton_count = Math.ceil(copy[index].expected_qty / units);
                        setLineItems(copy);
                      }}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white text-center font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-slate-500 block text-center mt-0.5">Master pack</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Expected Cartons</label>
                    <input
                      type="number"
                      min="1"
                      value={item.expected_carton_count}
                      onChange={e => handleCartonCountChange(index, e.target.value)}
                      className="w-full border border-indigo-300 rounded-lg p-2 bg-indigo-50/50 text-center font-bold text-indigo-700"
                    />
                    <span className="text-[10px] text-slate-500 block text-center mt-0.5">Auto-calculated</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Expected Units (Total)</label>
                    <input
                      type="number"
                      min="1"
                      value={item.expected_qty}
                      onChange={e => handleQtyChange(index, e.target.value)}
                      className="w-full border border-emerald-300 rounded-lg p-2 bg-emerald-50/50 text-center font-bold text-emerald-800"
                    />
                    <span className="text-[10px] text-slate-500 block text-center mt-0.5">Total unit count</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Unit Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unit_price}
                      onChange={e => {
                        const copy = [...lineItems];
                        copy[index].unit_price = parseFloat(e.target.value) || 0;
                        setLineItems(copy);
                      }}
                      className="w-full border border-slate-300 rounded-lg p-2 bg-white text-center font-medium text-slate-800"
                    />
                    <span className="text-[10px] text-slate-500 block text-center mt-0.5">Cost basis</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Total Summary Footer */}
            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block text-xs">Total Manifest Expected Volume</span>
                <span className="text-[11px] text-slate-600">{lineItems.length} unique line items scheduled</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Total Cartons</span>
                  <span className="font-bold text-indigo-700 text-sm">{totalCalculatedCartons} cartons</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Total Units</span>
                  <span className="font-bold text-emerald-700 text-sm">{totalCalculatedUnits} units</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Notes & Submission */}
        <Card title="Receiving Instructions & Inbound Notes">
          <textarea
            rows="2"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Special receiving guidelines, trailer seal requirements, cross-dock bay directions..."
            className="w-full text-xs border border-slate-300 rounded-lg p-3 bg-white"
          />
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors disabled:opacity-50"
          >
            {submitting ? 'Generating Purchase Order...' : 'Create Purchase Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
