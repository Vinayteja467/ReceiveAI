import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Truck, 
  Calendar, 
  Package, 
  ClipboardCheck, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Plus,
  Boxes,
  Building2,
  Clock
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { purchaseOrdersApi } from '../services/api';

export default function PurchaseOrdersPage({ onSelectPO, onCreatePO, onStartInspection }) {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expandedPoId, setExpandedPoId] = useState(null);

  useEffect(() => {
    loadPOs();
  }, [statusFilter]);

  const loadPOs = async () => {
    try {
      setLoading(true);
      const data = await purchaseOrdersApi.list({ status: statusFilter });
      setPos(data);
    } catch (err) {
      console.error("Failed to load POs:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedPoId(prev => prev === id ? null : id);
  };

  const filtered = pos.filter(po => {
    const q = search.toLowerCase();
    return (
      po.po_number.toLowerCase().includes(q) ||
      po.vendor_name.toLowerCase().includes(q) ||
      po.carrier?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Filter and Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'AT_DOCK', 'PARTIALLY_RECEIVED', 'RECEIVED', 'PENDING'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PO, vendor, or SKU..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={onCreatePO}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* PO List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200 animate-pulse">
            Loading purchase orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
            No purchase orders found matching criteria.
          </div>
        ) : (
          filtered.map(po => {
            const isExpanded = expandedPoId === po.id;
            const totalCartons = (po.line_items || []).reduce((acc, li) => acc + (li.expected_carton_count || 1), 0);
            const progress = po.total_expected_units > 0 
              ? Math.min(100, Math.round((po.total_received_units / po.total_expected_units) * 100))
              : 0;

            return (
              <div 
                key={po.id} 
                className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs hover:border-indigo-300 hover:shadow-xs transition-all"
              >
                {/* PO Header Bar */}
                <div 
                  onClick={() => onSelectPO && onSelectPO(po.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/40 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 border border-indigo-100/60">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900">{po.po_number}</span>
                        <Badge status={po.status} size="xs" />
                        {po.po_number === 'PO-2026-00124' && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Demo Order
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {po.vendor_name}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1">
                        <span>Carrier: <strong className="text-slate-700">{po.carrier}</strong></span>
                        <span>•</span>
                        <span>Dock: <strong className="text-slate-700">{po.assigned_dock}</strong></span>
                        {po.expected_delivery && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Exp: {new Date(po.expected_delivery).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right metrics: Total units, Cartons, and Actions */}
                  <div className="flex items-center gap-5 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 justify-between md:justify-end">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-900">
                        <Boxes className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{totalCartons} cartons</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        {po.total_received_units} / {po.total_expected_units} units ({progress}%)
                      </span>
                      <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden mt-1 ml-auto">
                        <div 
                          className={`h-1.5 rounded-full ${
                            progress >= 100 ? 'bg-emerald-500' : progress > 0 ? 'bg-indigo-600' : 'bg-slate-300'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onStartInspection) onStartInspection(po.id);
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <ClipboardCheck className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectPO) onSelectPO(po.id);
                        }}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Details
                      </button>

                      <button
                        type="button"
                        onClick={(e) => toggleExpand(po.id, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Line Items Detail */}
                {isExpanded && (
                  <div className="bg-slate-50/70 border-t border-slate-200/80 p-4">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Inbound Line Items & Carton Breakdown ({po.line_items?.length || 0})
                    </h5>
                    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3">SKU</th>
                            <th className="py-2 px-3">Item Description</th>
                            <th className="py-2 px-3">Variant</th>
                            <th className="py-2 px-3 text-center">Units / Carton</th>
                            <th className="py-2 px-3 text-center">Expected Cartons</th>
                            <th className="py-2 px-3 text-center">Expected Units</th>
                            <th className="py-2 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {po.line_items?.map((li) => (
                            <tr key={li.id}>
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{li.sku}</td>
                              <td className="py-2.5 px-3 font-medium text-slate-800">{li.item_name}</td>
                              <td className="py-2.5 px-3">
                                <span className="font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                                  {li.expected_variant || 'Standard'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-semibold text-slate-800">
                                {li.expected_units_per_carton || 12}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-indigo-700 bg-indigo-50/50">
                                {li.expected_carton_count || 1} ctns
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                                {li.expected_qty}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <Badge status={li.status} size="xs" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
