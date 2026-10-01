import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Truck, 
  Calendar, 
  Boxes, 
  ClipboardCheck, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Star,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { purchaseOrdersApi } from '../services/api';

export default function PurchaseOrderDetailPage({ poId, onBack, onStartInspection }) {
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (poId) {
      loadPODetail();
    }
  }, [poId]);

  const loadPODetail = async () => {
    try {
      setLoading(true);
      const data = await purchaseOrdersApi.get(poId);
      setPo(data);
    } catch (err) {
      console.error("Failed to load PO detail:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-neutral-400 bg-[#0e0e13]/85 backdrop-blur-xl rounded-2xl border border-white/[0.08] animate-pulse max-w-5xl mx-auto shadow-2xl">
        Loading purchase order details...
      </div>
    );
  }

  if (!po) {
    return (
      <div className="p-8 text-center bg-[#0e0e13]/85 backdrop-blur-xl rounded-2xl border border-white/[0.08] max-w-5xl mx-auto shadow-2xl">
        <p className="text-neutral-400 mb-4">Purchase order not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 border border-white/[0.08] bg-white/[0.04] text-neutral-200 hover:text-white hover:bg-white/[0.08] rounded-xl text-xs font-semibold transition-all"
        >
          Back to Purchase Orders
        </button>
      </div>
    );
  }

  const totalCartons = (po.line_items || []).reduce((acc, li) => acc + (li.expected_carton_count || 1), 0);
  const progress = po.total_expected_units > 0 
    ? Math.round((po.total_received_units / po.total_expected_units) * 100) 
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation & Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-300 hover:text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] px-3.5 py-1.5 rounded-xl shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>

        <button
          onClick={() => onStartInspection && onStartInspection(po.id)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(255,87,34,0.35)] transition-all"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Launch Receiving Inspection</span>
        </button>
      </div>

      {/* PO Header Overview Card */}
      <div className="bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-mono text-xl font-bold text-white">{po.po_number}</h2>
              <Badge status={po.status} />
            </div>
            <p className="text-sm font-semibold text-neutral-200 mt-1">{po.vendor_name}</p>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-neutral-400 block text-[11px]">Total Expected</span>
              <span className="font-bold text-white text-base">{po.total_expected_units} units</span>
            </div>
            <div className="h-8 w-px bg-white/[0.08]"></div>
            <div>
              <span className="text-neutral-400 block text-[11px]">Total Cartons</span>
              <span className="font-bold text-orange-400 text-base">{totalCartons} cartons</span>
            </div>
            <div className="h-8 w-px bg-white/[0.08]"></div>
            <div>
              <span className="text-neutral-400 block text-[11px]">Fulfillment</span>
              <span className="font-bold text-emerald-400 text-base">{progress}%</span>
            </div>
          </div>
        </div>

        {/* PO Dates & Logistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-neutral-400 flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5 text-orange-400" /> Order Date
            </span>
            <span className="font-semibold text-neutral-200">
              {po.order_date ? new Date(po.order_date).toLocaleDateString() : 'Recent'}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-orange-400" /> Expected Delivery
            </span>
            <span className="font-semibold text-neutral-200">
              {po.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString() : 'Today'}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 flex items-center gap-1 mb-1">
              <Truck className="w-3.5 h-3.5 text-orange-400" /> Carrier & Dock
            </span>
            <span className="font-semibold text-neutral-200">
              {po.carrier} • {po.assigned_dock}
            </span>
          </div>

          <div>
            <span className="text-neutral-400 block mb-1">Tracking Number</span>
            <span className="font-mono text-neutral-200 font-medium truncate block">
              {po.tracking_number || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Supplier Profile Card (if linked) */}
      {po.supplier && (
        <Card title="Supplier & Vendor Information" subtitle="Direct manufacturer contact profile">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-neutral-400 flex items-center gap-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-orange-400" /> Supplier Entity
              </span>
              <p className="font-bold text-white">{po.supplier.name}</p>
              <p className="text-[11px] text-neutral-400">Contact: {po.supplier.contact_name || 'Accounts Representative'}</p>
            </div>

            <div>
              <span className="text-neutral-400 flex items-center gap-1 mb-1">
                <Mail className="w-3.5 h-3.5 text-neutral-400" /> Communication
              </span>
              <p className="text-neutral-200">{po.supplier.email || 'orders@vendor.com'}</p>
              <p className="text-neutral-400">{po.supplier.phone || 'N/A'}</p>
            </div>

            <div>
              <span className="text-neutral-400 flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" /> Origin Facility
              </span>
              <p className="text-neutral-200 truncate">{po.supplier.address || 'USA Distribution Center'}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span className="font-semibold text-neutral-300">{po.supplier.rating || 4.8} / 5.0 Rating</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Detailed Line Items Table */}
      <Card 
        title={`Purchase Order Line Items (${po.line_items?.length || 0})`}
        subtitle="Expected variant, units per carton, and carton counts for receiving verification"
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-neutral-400 font-bold border-b border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Expected Variant</th>
                <th className="py-3 px-4 text-center">Units / Carton</th>
                <th className="py-3 px-4 text-center">Expected Cartons</th>
                <th className="py-3 px-4 text-center">Expected Units</th>
                <th className="py-3 px-4 text-center">Received Units</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-neutral-300">
              {po.line_items?.map((li) => (
                <tr key={li.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {li.sku}
                  </td>
                  <td className="py-3 px-4 font-semibold text-neutral-200">
                    {li.item_name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 text-[11px]">
                      {li.expected_variant || 'Standard'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-neutral-200">
                    {li.expected_units_per_carton || 12}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-orange-400 bg-orange-500/5">
                    {li.expected_carton_count || 1} ctns
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-white">
                    {li.expected_qty}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-neutral-200">
                    {li.received_qty}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Badge status={li.status} size="xs" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Special Receiving Notes */}
      {po.notes && (
        <div className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-xs space-y-1">
          <span className="font-bold text-neutral-300 block">Receiving & Handling Notes:</span>
          <p className="text-neutral-400 leading-relaxed">{po.notes}</p>
        </div>
      )}
    </div>
  );
}
