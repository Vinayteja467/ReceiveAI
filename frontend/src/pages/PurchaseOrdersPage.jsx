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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-[0_0_12px_rgba(255,87,34,0.35)]'
                  : 'bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PO, vendor, or SKU..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#121217] border border-white/[0.1] text-white placeholder-neutral-500 focus:border-orange-500 rounded-xl focus:outline-none transition-colors"
            />
          </div>

          <button
            onClick={onCreatePO}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,87,34,0.35)] whitespace-nowrap transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* PO List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-neutral-400 bg-[#0e0e13]/85 backdrop-blur-xl rounded-2xl border border-white/[0.08] animate-pulse">
            Loading purchase orders...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 bg-[#0e0e13]/85 backdrop-blur-xl rounded-2xl border border-white/[0.08]">
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
                className="bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl hover:border-orange-500/40 hover:shadow-[0_0_25px_rgba(255,87,34,0.12)] transition-all"
              >
                {/* PO Header Bar */}
                <div 
                  onClick={() => onSelectPO && onSelectPO(po.id)}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-xl shrink-0 border border-orange-500/20">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{po.po_number}</span>
                        <Badge status={po.status} size="xs" />
                        {po.po_number === 'PO-2026-00124' && (
                          <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Demo Order
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-neutral-200 mt-1 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                        {po.vendor_name}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-400 mt-1">
                        <span>Carrier: <strong className="text-neutral-200">{po.carrier}</strong></span>
                        <span>•</span>
                        <span>Dock: <strong className="text-neutral-200">{po.assigned_dock}</strong></span>
                        {po.expected_delivery && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-neutral-400" />
                              Exp: {new Date(po.expected_delivery).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right metrics: Total units, Cartons, and Actions */}
                  <div className="flex items-center gap-5 border-t md:border-t-0 pt-3 md:pt-0 border-white/[0.06] justify-between md:justify-end">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-white">
                        <Boxes className="w-3.5 h-3.5 text-orange-400" />
                        <span>{totalCartons} cartons</span>
                      </div>
                      <span className="text-[11px] text-neutral-400 block">
                        {po.total_received_units} / {po.total_expected_units} units ({progress}%)
                      </span>
                      <div className="w-28 bg-white/[0.08] rounded-full h-1.5 overflow-hidden mt-1 ml-auto">
                        <div 
                          className={`h-1.5 rounded-full transition-all ${
                            progress >= 100 
                              ? 'bg-emerald-500' 
                              : progress > 0 
                                ? 'bg-gradient-to-r from-orange-500 to-red-600' 
                                : 'bg-neutral-600'
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
                        className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-[0_0_12px_rgba(255,87,34,0.3)] flex items-center gap-1"
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
                        className="px-3 py-1.5 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-neutral-200 rounded-xl text-xs font-semibold transition-all"
                      >
                        Details
                      </button>

                      <button
                        type="button"
                        onClick={(e) => toggleExpand(po.id, e)}
                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Line Items Detail */}
                {isExpanded && (
                  <div className="bg-black/30 border-t border-white/[0.08] p-4">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                      Inbound Line Items & Carton Breakdown ({po.line_items?.length || 0})
                    </h5>
                    <div className="border border-white/[0.08] rounded-xl bg-[#09090d]/80 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white/[0.03] text-neutral-400 font-bold border-b border-white/[0.08]">
                          <tr>
                            <th className="py-2.5 px-3">SKU</th>
                            <th className="py-2.5 px-3">Item Description</th>
                            <th className="py-2.5 px-3">Variant</th>
                            <th className="py-2.5 px-3 text-center">Units / Carton</th>
                            <th className="py-2.5 px-3 text-center">Expected Cartons</th>
                            <th className="py-2.5 px-3 text-center">Expected Units</th>
                            <th className="py-2.5 px-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.06] text-neutral-300">
                          {po.line_items?.map((li) => (
                            <tr key={li.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-white">{li.sku}</td>
                              <td className="py-2.5 px-3 font-medium text-neutral-200">{li.item_name}</td>
                              <td className="py-2.5 px-3">
                                <span className="font-medium text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 text-[11px]">
                                  {li.expected_variant || 'Standard'}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-semibold text-neutral-200">
                                {li.expected_units_per_carton || 12}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-orange-400 bg-orange-500/5">
                                {li.expected_carton_count || 1} ctns
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-white">
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
