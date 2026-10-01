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
      <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 animate-pulse max-w-5xl mx-auto">
        Loading purchase order details...
      </div>
    );
  }

  if (!po) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 max-w-5xl mx-auto">
        <p className="text-slate-600 mb-3">Purchase order not found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-slate-50"
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>

        <button
          onClick={() => onStartInspection && onStartInspection(po.id)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
        >
          <ClipboardCheck className="w-4 h-4" />
          <span>Launch Receiving Inspection</span>
        </button>
      </div>

      {/* PO Header Overview Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-mono text-xl font-bold text-slate-900">{po.po_number}</h2>
              <Badge status={po.status} />
            </div>
            <p className="text-sm font-semibold text-slate-800 mt-1">{po.vendor_name}</p>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Total Expected</span>
              <span className="font-bold text-slate-900 text-base">{po.total_expected_units} units</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <span className="text-slate-500 block text-[11px]">Total Cartons</span>
              <span className="font-bold text-indigo-700 text-base">{totalCartons} cartons</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div>
              <span className="text-slate-500 block text-[11px]">Fulfillment</span>
              <span className="font-bold text-emerald-700 text-base">{progress}%</span>
            </div>
          </div>
        </div>

        {/* PO Dates & Logistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-500 flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5" /> Order Date
            </span>
            <span className="font-semibold text-slate-800">
              {po.order_date ? new Date(po.order_date).toLocaleDateString() : 'Recent'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5" /> Expected Delivery
            </span>
            <span className="font-semibold text-slate-800">
              {po.expected_delivery ? new Date(po.expected_delivery).toLocaleDateString() : 'Today'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 flex items-center gap-1 mb-1">
              <Truck className="w-3.5 h-3.5" /> Carrier & Dock
            </span>
            <span className="font-semibold text-slate-800">
              {po.carrier} • {po.assigned_dock}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block mb-1">Tracking Number</span>
            <span className="font-mono text-slate-800 font-medium truncate block">
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
              <span className="text-slate-500 flex items-center gap-1 mb-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Supplier Entity
              </span>
              <p className="font-bold text-slate-900">{po.supplier.name}</p>
              <p className="text-[11px] text-slate-500">Contact: {po.supplier.contact_name || 'Accounts Representative'}</p>
            </div>

            <div>
              <span className="text-slate-500 flex items-center gap-1 mb-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Communication
              </span>
              <p className="text-slate-800">{po.supplier.email || 'orders@vendor.com'}</p>
              <p className="text-slate-500">{po.supplier.phone || 'N/A'}</p>
            </div>

            <div>
              <span className="text-slate-500 flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Origin Facility
              </span>
              <p className="text-slate-800 truncate">{po.supplier.address || 'USA Distribution Center'}</p>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span className="font-semibold text-slate-700">{po.supplier.rating || 4.8} / 5.0 Rating</span>
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
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {po.line_items?.map((li) => (
                <tr key={li.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {li.sku}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {li.item_name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                      {li.expected_variant || 'Standard'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800">
                    {li.expected_units_per_carton || 12}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-indigo-700 bg-indigo-50/50">
                    {li.expected_carton_count || 1} ctns
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-900">
                    {li.expected_qty}
                  </td>
                  <td className="py-3 px-4 text-center font-semibold text-slate-800">
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
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
          <span className="font-bold text-slate-700 block">Receiving & Handling Notes:</span>
          <p className="text-slate-600 leading-relaxed">{po.notes}</p>
        </div>
      )}
    </div>
  );
}
