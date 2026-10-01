import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  ExternalLink,
  ChevronRight,
  Eye,
  Box,
  Droplets,
  Scissors,
  Layers,
  ArrowRight
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { exceptionsApi } from '../services/api';

const ISSUE_BADGE_COLORS = {
  'Short shipment': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Extra units': 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  'Wrong SKU': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  'Wrong variant': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  'Crushed carton': 'bg-red-500/15 text-red-300 border-red-500/30',
  'Water damage': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  'Torn packaging': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'Missing components': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

export default function ExceptionsPage({ onExceptionsChange, onSelectException, setActiveTab, initialStatusFilter }) {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || 'ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  useEffect(() => {
    loadExceptions();
  }, [statusFilter, severityFilter]);

  const loadExceptions = async () => {
    try {
      setLoading(true);
      const data = await exceptionsApi.list({ 
        status: statusFilter,
        severity: severityFilter
      });
      setExceptions(data);
      if (onExceptionsChange) {
        const openCount = data.filter(e => e.status !== 'RESOLVED').length;
        onExceptionsChange(openCount);
      }
    } catch (err) {
      console.error("Failed to load exceptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (excId) => {
    if (onSelectException) {
      onSelectException(excId);
    } else if (setActiveTab) {
      setActiveTab('exception-details');
    }
  };

  const filtered = exceptions.filter(e => {
    const q = search.toLowerCase();
    return (
      e.exception_number?.toLowerCase().includes(q) ||
      e.issue?.toLowerCase().includes(q) ||
      e.inspection_number?.toLowerCase().includes(q) ||
      e.po_number?.toLowerCase().includes(q) ||
      e.vendor_name?.toLowerCase().includes(q) ||
      e.sku?.toLowerCase().includes(q) ||
      e.discrepancy_details?.toLowerCase().includes(q)
    );
  });

  const criticalCount = exceptions.filter(e => e.severity === 'HIGH' || e.severity === 'CRITICAL').length;
  const shortageCount = exceptions.filter(e => e.issue === 'Short shipment' || e.exception_type === 'QUANTITY_SHORTAGE').length;
  const damageCount = exceptions.filter(e => e.issue === 'Crushed carton' || e.issue === 'Water damage' || e.issue === 'Torn packaging').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-neutral-200">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Receiving Exception Management</h1>
          <p className="text-xs text-neutral-400">
            Automated exception tracking generated from receiving inspection failures. Review evidence, dispatch recount work-orders, or resolve discrepancies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            {exceptions.filter(e => e.status !== 'RESOLVED').length} Active Discrepancies
          </span>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e0e13]/85 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 shadow-xl">
          <div className="p-3 bg-rose-500/15 text-rose-400 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Critical & High Flags</span>
            <p className="text-xl font-extrabold text-rose-400">{criticalCount} incidents</p>
          </div>
        </div>

        <div className="bg-[#0e0e13]/85 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 shadow-xl">
          <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Quantity Discrepancies</span>
            <p className="text-xl font-extrabold text-amber-400">{shortageCount} shortages</p>
          </div>
        </div>

        <div className="bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 flex items-center gap-3 shadow-xl">
          <div className="p-3 bg-white/[0.04] text-neutral-300 rounded-xl">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Physical Damage Claims</span>
            <p className="text-xl font-extrabold text-white">{damageCount} quarantined</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Exceptions' },
            { id: 'OPEN', label: 'Open' },
            { id: 'MANUAL_REVIEW', label: 'Manual Review' },
            { id: 'MORE_EVIDENCE_REQUESTED', label: 'Evidence Requested' },
            { id: 'RESOLVED', label: 'Resolved' }
          ].map(st => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-[0_0_12px_rgba(255,87,34,0.35)] font-bold'
                  : 'bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, Issue, PO, Supplier..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#121217] border border-white/[0.1] rounded-xl focus:border-orange-500 text-white placeholder-neutral-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table View */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-neutral-400 font-bold border-b border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Exception ID</th>
                <th className="py-3 px-4">Inspection ID</th>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Issue</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-neutral-300">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-neutral-500 animate-pulse">
                    Loading receiving exceptions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-neutral-500">
                    No exceptions logged matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(exc => {
                  const issueColor = ISSUE_BADGE_COLORS[exc.issue] || 'bg-white/[0.04] text-neutral-300 border-white/[0.08]';
                  return (
                    <tr 
                      key={exc.id} 
                      onClick={() => handleRowClick(exc.id)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    >
                      {/* 1. Exception ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-orange-400">
                        {exc.exception_number}
                      </td>

                      {/* 2. Inspection ID */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-white">
                        {exc.inspection_number || `INS-${exc.inspection_id}`}
                      </td>

                      {/* 3. PO Number */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-neutral-300">
                        {exc.po_number || 'N/A'}
                      </td>

                      {/* 4. Supplier */}
                      <td className="py-3.5 px-4 font-medium text-neutral-200 max-w-[160px] truncate" title={exc.vendor_name}>
                        {exc.vendor_name || 'N/A'}
                      </td>

                      {/* 5. Issue */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${issueColor}`}>
                          {exc.issue}
                        </span>
                      </td>

                      {/* 6. Severity */}
                      <td className="py-3.5 px-4">
                        <Badge status={exc.severity} size="xs" />
                      </td>

                      {/* 7. Status */}
                      <td className="py-3.5 px-4">
                        <Badge status={exc.status} size="xs" />
                      </td>

                      {/* 8. Created At */}
                      <td className="py-3.5 px-4 text-neutral-400 whitespace-nowrap">
                        {new Date(exc.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(exc.id);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 group-hover:text-orange-300 transition-colors"
                        >
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
