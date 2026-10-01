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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === tab.value
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PO, inspection #, or vendor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Main Inspections Table */}
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
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
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 animate-pulse">
                    Loading receiving inspections...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No inspections found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.inspection_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{item.po_number}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{item.vendor_name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{item.dock_door}</div>
                      <div className="text-[11px] text-slate-500">{item.inspector_name?.split('-')[0]}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={item.status} size="xs" />
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={item.overall_disposition} size="xs" />
                    </td>
                    <td className="py-3.5 px-4">
                      {item.total_defects_found > 0 ? (
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
                          {item.total_defects_found} defects
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                          Clean
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium">
                        <Camera className="w-3.5 h-3.5 text-slate-400" />
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
                          className="px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors inline-flex items-center gap-1 shadow-2xs"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Results</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openDetailModal(item.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
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
          <div className="space-y-6 text-xs">
            {/* Quick jump to dedicated Inspection Results page */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-indigo-950 text-xs">Official 6-Point Inspection Results & Evidence Viewer</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveDetail(null);
                  if (setSelectedInspectionId) setSelectedInspectionId(activeDetail.id);
                  if (setActiveTab) setActiveTab('inspection-results');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Inspection Results Page</span>
              </button>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div>
                <span className="text-slate-500 block">Status</span>
                <Badge status={activeDetail.status} size="xs" />
              </div>
              <div>
                <span className="text-slate-500 block">Disposition</span>
                <Badge status={activeDetail.overall_disposition} size="xs" />
              </div>
              <div>
                <span className="text-slate-500 block">Dock Bay</span>
                <span className="font-semibold text-slate-800">{activeDetail.dock_door}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Cargo Temp</span>
                <span className="font-semibold text-slate-800">{activeDetail.temperature_reading_c ?? 'N/A'} °C</span>
              </div>
            </div>

            {/* Checklist findings */}
            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-700 mb-2">Sampled Line Items Findings</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                    <tr>
                      <th className="p-2.5">SKU & Description</th>
                      <th className="p-2.5">Sampled</th>
                      <th className="p-2.5">Passed</th>
                      <th className="p-2.5">Defects</th>
                      <th className="p-2.5">Defect Reason</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeDetail.items.map((it) => (
                      <tr key={it.id}>
                        <td className="p-2.5">
                          <span className="font-mono font-bold text-slate-900 block">{it.sku}</span>
                          <span className="text-slate-500 text-[11px]">{it.item_name}</span>
                        </td>
                        <td className="p-2.5 font-semibold text-slate-800">{it.sampled_quantity}</td>
                        <td className="p-2.5 text-emerald-700 font-semibold">{it.passed_quantity}</td>
                        <td className="p-2.5">
                          {it.defective_quantity > 0 ? (
                            <span className="text-rose-600 font-bold">{it.defective_quantity}</span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-600">{it.defect_category || 'Clean'}</td>
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
                <h4 className="font-bold uppercase tracking-wider text-slate-700 mb-2">Discrepancies & Exceptions ({activeDetail.exceptions.length})</h4>
                {activeDetail.exceptions.length === 0 ? (
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 italic">No exceptions logged.</p>
                ) : (
                  <div className="space-y-2">
                    {activeDetail.exceptions.map(exc => (
                      <div key={exc.id} className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-rose-900">{exc.exception_number}</span>
                          <Badge status={exc.severity} size="xs" />
                        </div>
                        <p className="mt-1 text-slate-700 font-medium">{exc.discrepancy_details}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-700 mb-2">Attached Receiving Evidence ({activeDetail.evidence.length})</h4>
                {activeDetail.evidence.length === 0 ? (
                  <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 italic">No photo evidence uploaded.</p>
                ) : (
                  <div className="space-y-2">
                    {activeDetail.evidence.map(ev => (
                      <div key={ev.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-indigo-600" />
                          <div>
                            <p className="font-medium text-slate-800">{ev.file_name}</p>
                            <p className="text-[10px] text-slate-500">{ev.caption || ev.file_type}</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded border border-indigo-100">
                          {ev.file_type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Vision Inspection Audit Engine Section */}
            <div className="p-4 border border-indigo-100 rounded-xl bg-gradient-to-r from-indigo-50/50 via-white to-blue-50/50 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">AI Receiving Inspection Engine</h4>
                    <p className="text-[11px] text-slate-500">10-point PO vs Product Catalogue vs Evidence photographs evaluation</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunAiAudit(activeDetail.id)}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
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
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-700 block mb-1">Inspector Log & Observations:</span>
                <p className="text-slate-600 whitespace-pre-wrap">{activeDetail.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
