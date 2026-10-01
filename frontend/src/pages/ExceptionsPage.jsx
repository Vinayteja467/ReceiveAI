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
  'Short shipment': 'bg-amber-100 text-amber-900 border-amber-300',
  'Extra units': 'bg-blue-100 text-blue-900 border-blue-300',
  'Wrong SKU': 'bg-rose-100 text-rose-900 border-rose-300',
  'Wrong variant': 'bg-purple-100 text-purple-900 border-purple-300',
  'Crushed carton': 'bg-red-100 text-red-900 border-red-300',
  'Water damage': 'bg-cyan-100 text-cyan-900 border-cyan-300',
  'Torn packaging': 'bg-orange-100 text-orange-900 border-orange-300',
  'Missing components': 'bg-rose-100 text-rose-900 border-rose-300',
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Receiving Exception Management</h1>
          <p className="text-xs text-slate-500">
            Automated exception tracking generated from receiving inspection failures. Review evidence, dispatch recount work-orders, or resolve discrepancies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            {exceptions.filter(e => e.status !== 'RESOLVED').length} Active Discrepancies
          </span>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-rose-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Critical & High Flags</span>
            <p className="text-xl font-bold text-rose-700">{criticalCount} incidents</p>
          </div>
        </div>

        <div className="bg-white border border-amber-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quantity Discrepancies</span>
            <p className="text-xl font-bold text-amber-700">{shortageCount} shortages</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
          <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Physical Damage Claims</span>
            <p className="text-xl font-bold text-slate-900">{damageCount} quarantined</p>
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st.id
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, Issue, PO, Supplier..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>
      </div>

      {/* Required Table View:
          - Exception ID
          - Inspection ID
          - PO Number
          - Supplier
          - Issue
          - Severity
          - Status
          - Created At
      */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400 animate-pulse">
                    Loading receiving exceptions...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    No exceptions logged matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(exc => {
                  const issueColor = ISSUE_BADGE_COLORS[exc.issue] || 'bg-slate-100 text-slate-800 border-slate-200';
                  return (
                    <tr 
                      key={exc.id} 
                      onClick={() => handleRowClick(exc.id)}
                      className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                    >
                      {/* 1. Exception ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                        {exc.exception_number}
                      </td>

                      {/* 2. Inspection ID */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {exc.inspection_number || `INS-${exc.inspection_id}`}
                      </td>

                      {/* 3. PO Number */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {exc.po_number || 'N/A'}
                      </td>

                      {/* 4. Supplier */}
                      <td className="py-3.5 px-4 font-medium text-slate-800 max-w-[160px] truncate" title={exc.vendor_name}>
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
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
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
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors"
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
