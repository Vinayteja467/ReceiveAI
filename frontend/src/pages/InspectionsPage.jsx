import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Camera, 
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Bot
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import AIInspectionAuditView from '../components/inspection/AIInspectionAuditView';
import { inspectionsApi } from '../services/api';

export default function InspectionsPage({ selectedInspectionId, setSelectedInspectionId, setActiveTab, initialStatusFilter }) {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(initialStatusFilter || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Detailed Modal state
  const [activeDetail, setActiveDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [aiReport, setAiReport] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (initialStatusFilter) {
      setFilterStatus(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  useEffect(() => {
    loadInspections();
  }, [filterStatus]);

  useEffect(() => {
    if (selectedInspectionId) {
      openDetailModal(selectedInspectionId);
    }
  }, [selectedInspectionId]);

  const loadInspections = async () => {
    try {
      setLoading(true);
      const data = await inspectionsApi.list({ status: filterStatus });
      setInspections(data);
    } catch (err) {
      console.error("Failed to load inspections:", err);
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = async (id) => {
    try {
      setDetailLoading(true);
      setAiReport(null);
      const detail = await inspectionsApi.get(id);
      setActiveDetail(detail);
    } catch (err) {
      console.error("Failed to load inspection details:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRunAiAudit = async (inspectionId) => {
    try {
      setAiLoading(true);
      const report = await inspectionsApi.runAiInspection(inspectionId);
      setAiReport(report);
    } catch (err) {
      console.error("Failed to run AI audit:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const filtered = inspections.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.inspection_number.toLowerCase().includes(q) ||
      item.po_number?.toLowerCase().includes(q) ||
      item.vendor_name?.toLowerCase().includes(q) ||
      item.inspector_name?.toLowerCase().includes(q)
    );
  });

  const filterTabs = [
    { label: 'All Records', value: 'ALL' },
    { label: 'Passed / Compliant', value: 'PASSED' },
    { label: 'Flagged / Exceptions', value: 'FLAGGED' },
    { label: 'Uncertain Evidence', value: 'UNCERTAIN' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {filterTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === tab.value
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-[0_0_12px_rgba(255,87,34,0.35)]'
                  : 'bg-white/[0.04] border border-white/[0.08] text-neutral-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PO, inspection #, or vendor..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#121217] text-white border border-white/[0.1] rounded-xl placeholder-neutral-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Main Inspections Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-neutral-400 font-bold border-b border-white/[0.08]">
              <tr>
                <th className="py-3 px-4">Inspection #</th>
                <th className="py-3 px-4">PO & Supplier</th>
                <th className="py-3 px-4">Dock / Inspector</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Disposition</th>
                <th className="py-3 px-4">Defects</th>
                <th className="py-3 px-4">Proofs</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-neutral-300">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-neutral-500 animate-pulse">
                    Loading receiving inspections...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-neutral-500">
                    No inspections found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {item.inspection_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{item.po_number}</div>
                      <div className="text-[11px] text-neutral-400 truncate max-w-[200px]">{item.vendor_name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-neutral-200 font-medium">{item.dock_door}</div>
                      <div className="text-[11px] text-neutral-400">{item.inspector_name?.split('-')[0]}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={item.status} size="xs" />
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={item.overall_disposition} size="xs" />
                    </td>
                    <td className="py-3.5 px-4">
                      {item.total_defects_found > 0 ? (
                        <span className="font-bold text-rose-300 bg-rose-500/15 px-2 py-0.5 rounded-lg text-[11px] border border-rose-500/30">
                          {item.total_defects_found} defects
                        </span>
                      ) : (
                        <span className="text-emerald-300 font-medium bg-emerald-500/15 px-2 py-0.5 rounded-lg text-[11px] border border-emerald-500/30">
                          Clean
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium">
                        <Camera className="w-3.5 h-3.5 text-neutral-500" />
                        {item.evidence_count || 0}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (setSelectedInspectionId) setSelectedInspectionId(item.id);
                            if (setActiveTab) setActiveTab('inspection-results');
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-lg transition-all inline-flex items-center gap-1 shadow-[0_0_10px_rgba(255,87,34,0.3)]"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Results</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openDetailModal(item.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.1] rounded-lg transition-all"
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Drill-Down Inspection Modal */}
      <Modal
        isOpen={!!activeDetail}
        onClose={() => {
          setActiveDetail(null);
          if (setSelectedInspectionId) setSelectedInspectionId(null);
        }}
        title={`Inspection Record: ${activeDetail?.inspection_number}`}
        subtitle={`PO: ${activeDetail?.purchase_order?.po_number || 'N/A'} — ${activeDetail?.purchase_order?.vendor_name || 'N/A'}`}
        maxWidth="max-w-4xl"
      >
        {activeDetail && (
          <div className="space-y-6 text-xs text-neutral-200">
            {/* Quick jump to dedicated Inspection Results page */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-orange-200 text-xs">Official 6-Point Inspection Results & Evidence Viewer</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveDetail(null);
                  if (setSelectedInspectionId) setSelectedInspectionId(activeDetail.id);
                  if (setActiveTab) setActiveTab('inspection-results');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl text-xs font-bold shadow-[0_0_12px_rgba(255,87,34,0.3)] transition-all shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Inspection Results Page</span>
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-white/[0.02] border border-white/[0.08] rounded-2xl">
              <div>
                <span className="text-neutral-400 block mb-1">Status</span>
                <Badge status={activeDetail.status} size="xs" />
              </div>
              <div>
                <span className="text-neutral-400 block mb-1">Disposition</span>
                <Badge status={activeDetail.overall_disposition} size="xs" />
              </div>
              <div>
                <span className="text-neutral-400 block mb-1">Dock Bay</span>
                <span className="font-semibold text-white">{activeDetail.dock_door}</span>
              </div>
              <div>
                <span className="text-neutral-400 block mb-1">Cargo Temp</span>
                <span className="font-semibold text-white">{activeDetail.temperature_reading_c ?? 'N/A'} °C</span>
              </div>
            </div>

            {/* Checklist findings */}
            <div>
              <h4 className="font-bold uppercase tracking-wider text-white mb-2">Sampled Line Items Findings</h4>
              <div className="border border-white/[0.08] rounded-2xl overflow-hidden bg-[#0e0e13]/85 backdrop-blur-xl shadow-lg">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.03] border-b border-white/[0.08] font-bold text-neutral-400">
                    <tr>
                      <th className="p-2.5">SKU & Description</th>
                      <th className="p-2.5">Sampled</th>
                      <th className="p-2.5">Passed</th>
                      <th className="p-2.5">Defects</th>
                      <th className="p-2.5">Defect Reason</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {activeDetail.items.map((it) => (
                      <tr key={it.id} className="hover:bg-white/[0.02]">
                        <td className="p-2.5">
                          <span className="font-mono font-bold text-white block">{it.sku}</span>
                          <span className="text-neutral-400 text-[11px]">{it.item_name}</span>
                        </td>
                        <td className="p-2.5 font-semibold text-neutral-200">{it.sampled_quantity}</td>
                        <td className="p-2.5 text-emerald-400 font-semibold">{it.passed_quantity}</td>
                        <td className="p-2.5">
                          {it.defective_quantity > 0 ? (
                            <span className="text-rose-400 font-bold">{it.defective_quantity}</span>
                          ) : (
                            <span className="text-neutral-500">0</span>
                          )}
                        </td>
                        <td className="p-2.5 text-neutral-300">{it.defect_category || 'Clean'}</td>
                        <td className="p-2.5"><Badge status={it.status} size="xs" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Exceptions & Evidence Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold uppercase tracking-wider text-white mb-2">Discrepancies & Exceptions ({activeDetail.exceptions.length})</h4>
                {activeDetail.exceptions.length === 0 ? (
                  <p className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-neutral-400 italic">No exceptions logged.</p>
                ) : (
                  <div className="space-y-2">
                    {activeDetail.exceptions.map(exc => (
                      <div key={exc.id} className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-rose-300">{exc.exception_number}</span>
                          <Badge status={exc.severity} size="xs" />
                        </div>
                        <p className="mt-1 text-neutral-200 font-medium">{exc.discrepancy_details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-white mb-2">Attached Receiving Evidence ({activeDetail.evidence.length})</h4>
                {activeDetail.evidence.length === 0 ? (
                  <p className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-neutral-400 italic">No photo evidence uploaded.</p>
                ) : (
                  <div className="space-y-2">
                    {activeDetail.evidence.map(ev => (
                      <div key={ev.id} className="p-2.5 bg-white/[0.02] border border-white/[0.08] rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-orange-400" />
                          <div>
                            <p className="font-medium text-white">{ev.file_name}</p>
                            <p className="text-[10px] text-neutral-400">{ev.caption || ev.file_type}</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-orange-500/15 text-orange-300 font-bold px-2 py-0.5 rounded-lg border border-orange-500/30">
                          {ev.file_type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Vision Inspection Audit Engine Section */}
            <div className="p-4 border border-orange-500/20 rounded-2xl bg-white/[0.02] backdrop-blur-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">AI Receiving Inspection Engine</h4>
                    <p className="text-[11px] text-neutral-400">10-point PO vs Product Catalogue vs Evidence photographs evaluation</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunAiAudit(activeDetail.id)}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl text-xs font-bold shadow-[0_0_12px_rgba(255,87,34,0.3)] transition-all disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                  <span>{aiLoading ? 'Analyzing Evidence...' : (aiReport ? 'Re-run AI Inspection' : 'Run AI Inspection Audit')}</span>
                </button>
              </div>

              {aiReport && (
                <div className="pt-2">
                  <AIInspectionAuditView report={aiReport} />
                </div>
              )}
            </div>

            {/* Inspector Notes */}
            {activeDetail.notes && (
              <div className="p-3 bg-white/[0.02] border border-white/[0.08] rounded-xl">
                <span className="font-bold text-white block mb-1">Inspector Log & Observations:</span>
                <p className="text-neutral-300 whitespace-pre-wrap">{activeDetail.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
