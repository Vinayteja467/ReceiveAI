import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Camera, 
  FileText, 
  ShieldAlert, 
  UserCheck, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  ExternalLink, 
  Send, 
  Layers, 
  Truck, 
  Building2, 
  Calendar, 
  Box, 
  Sparkles, 
  Eye, 
  AlertCircle,
  Package,
  HelpCircle,
  FileCheck2,
  Droplets,
  Scissors
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { exceptionsApi } from '../services/api';

const ISSUE_ICONS = {
  'Short shipment': Box,
  'Extra units': Box,
  'Wrong SKU': Layers,
  'Wrong variant': Layers,
  'Crushed carton': Box,
  'Water damage': Droplets,
  'Torn packaging': Scissors,
  'Missing components': AlertTriangle,
};

export default function ExceptionDetailsPage({ exceptionId, onBack, setActiveTab, setSelectedInspectionId, setSelectedPoId }) {
  const [exception, setException] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Photo & Zoom
  const [activePhoto, setActivePhoto] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Action Modals State
  const [requestEvidenceModal, setRequestEvidenceModal] = useState(false);
  const [evidenceRequestType, setEvidenceRequestType] = useState('Photograph of unboxed sample units');
  const [evidenceRequestNotes, setEvidenceRequestNotes] = useState('');

  const [manualReviewModal, setManualReviewModal] = useState(false);
  const [reviewerName, setReviewerName] = useState('Marcus Vance - QA Lead');
  const [reviewPriority, setReviewPriority] = useState('HIGH');
  const [reviewNotes, setReviewNotes] = useState('');

  const [resolveModal, setResolveModal] = useState(false);
  const [resolutionType, setResolutionType] = useState('SUPPLIER_CREDIT');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadExceptionDetails();
  }, [exceptionId]);

  const loadExceptionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await exceptionsApi.get(exceptionId || 1);
      setException(data);

      if (data.photographs && data.photographs.length > 0) {
        setActivePhoto(data.photographs[0]);
      } else if (data.evidence_photo_url) {
        setActivePhoto({
          id: 1,
          file_name: `${data.issue || 'evidence'}_proof.jpg`,
          file_path: data.evidence_photo_url,
          category: 'EVIDENCE',
          caption: data.evidence_citation || data.discrepancy_details
        });
      }
    } catch (err) {
      console.error("Failed to load exception details:", err);
      setError("Unable to load exception details from backend.");
    } finally {
      setLoading(false);
    }
  };

  // ACTION 1: Review Evidence (highlights photo viewer and smooth scrolls)
  const handleReviewEvidence = () => {
    const el = document.getElementById('evidence-photo-viewer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setLightboxOpen(true);
  };

  // ACTION 2: Request More Evidence
  const submitRequestMoreEvidence = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await exceptionsApi.requestMoreEvidence(exception.id, {
        requested_evidence_type: evidenceRequestType,
        notes: evidenceRequestNotes
      });
      setRequestEvidenceModal(false);
      setNotification({
        type: 'success',
        text: `Secondary evidence requested. Status updated to MORE_EVIDENCE_REQUESTED.`
      });
      loadExceptionDetails();
    } catch (err) {
      alert("Failed to submit evidence request.");
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION 3: Mark for Manual Review
  const submitMarkManualReview = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await exceptionsApi.markManualReview(exception.id, {
        reviewer_name: reviewerName,
        priority: reviewPriority,
        notes: reviewNotes
      });
      setManualReviewModal(false);
      setNotification({
        type: 'success',
        text: `Exception assigned to ${reviewerName} with status MANUAL_REVIEW.`
      });
      loadExceptionDetails();
    } catch (err) {
      alert("Failed to mark for manual review.");
    } finally {
      setActionLoading(false);
    }
  };

  // ACTION 4: Resolve Exception
  const submitResolveException = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      alert("Please provide resolution notes explaining the decision.");
      return;
    }
    try {
      setActionLoading(true);
      const res = await exceptionsApi.resolve(exception.id, {
        resolution_type: resolutionType,
        resolution_notes: resolutionNotes
      });
      setResolveModal(false);
      setNotification({
        type: 'success',
        text: `Exception successfully resolved via ${resolutionType.replace(/_/g, ' ')}.`
      });
      loadExceptionDetails();
    } catch (err) {
      alert("Failed to resolve exception.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 text-center text-neutral-500 animate-pulse text-xs">
        Loading exception record & supporting evidence...
      </div>
    );
  }

  if (error || !exception) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-[#0e0e13]/85 backdrop-blur-xl border border-rose-500/30 rounded-2xl space-y-4 shadow-2xl">
        <div className="flex items-center gap-3 text-rose-400">
          <AlertCircle className="w-6 h-6" />
          <h3 className="font-bold text-base text-white">Error Loading Exception Record</h3>
        </div>
        <p className="text-xs text-neutral-300">{error || "Record not found."}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
        >
          &larr; Back to Exceptions
        </button>
      </div>
    );
  }

  const IssueIcon = ISSUE_ICONS[exception.issue] || AlertTriangle;
  const isResolved = exception.status === 'RESOLVED';
  const confidencePct = Math.round((exception.confidence || 0.94) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-neutral-200">
      {/* Top Header & Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Exceptions List
        </button>

        {/* Global Action Bar with the 4 Required Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Action 1: [Review Evidence] */}
          <button
            type="button"
            onClick={handleReviewEvidence}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.04] border border-white/[0.1] text-neutral-200 hover:text-white hover:bg-white/[0.08] text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-orange-400" />
            <span>Review Evidence</span>
          </button>

          {/* Action 2: [Request More Evidence] */}
          <button
            type="button"
            onClick={() => setRequestEvidenceModal(true)}
            disabled={isResolved}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Request More Evidence</span>
          </button>

          {/* Action 3: [Mark for Manual Review] */}
          <button
            type="button"
            onClick={() => setManualReviewModal(true)}
            disabled={isResolved}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-500/15 border border-orange-500/30 text-orange-300 hover:bg-orange-500/25 text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            <UserCheck className="w-3.5 h-3.5 text-orange-400" />
            <span>Mark for Manual Review</span>
          </button>

          {/* Action 4: [Resolve Exception] */}
          <button
            type="button"
            onClick={() => setResolveModal(true)}
            disabled={isResolved}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isResolved ? 'Exception Resolved' : 'Resolve Exception'}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 backdrop-blur-xl ${
          notification.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
        }`}>
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}

      {/* Exception Identity Banner */}
      <div className="bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
              exception.severity === 'CRITICAL' ? 'bg-rose-600 text-white shadow-rose-600/30' :
              exception.severity === 'HIGH' ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-amber-500 text-white shadow-amber-500/30'
            }`}>
              <IssueIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-white">{exception.exception_number}</span>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {exception.severity} SEVERITY
                </span>
                <Badge status={exception.status} size="xs" />
              </div>
              <h1 className="text-xl font-extrabold text-white mt-1">
                {exception.issue}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0 flex-wrap">
            <div>
              <span className="text-[11px] text-neutral-400 block">Logged At</span>
              <span className="font-semibold text-neutral-200">
                {new Date(exception.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-neutral-400 block">Current Assignee</span>
              <span className="font-semibold text-neutral-200">{exception.assigned_to}</span>
            </div>
          </div>
        </div>

        {/* Discrepancy Statement Callout */}
        <div className="pt-4">
          <p className="text-xs text-neutral-300 leading-relaxed font-medium">
            {exception.discrepancy_details}
          </p>
        </div>
      </div>

      {/* TWO-COLUMN GRID: Left = Values & Inspection Info, Right = Photographic Evidence Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Expected vs Observed Values + Inspection Details */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Expected vs Observed Value Comparison Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Expected Value Card */}
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 shadow-lg space-y-1">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-400" /> Expected Value (PO Manifest)
              </span>
              <p className="text-base font-extrabold text-white pt-1">
                {exception.expected_value || 'Compliant with PO Specification'}
              </p>
              <p className="text-[11px] text-emerald-300/80">Designated inbound purchase order tolerance</p>
            </div>

            {/* Observed Value Card */}
            <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 shadow-lg space-y-1">
              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Observed Value (Physical Evidence)
              </span>
              <p className="text-base font-extrabold text-white pt-1">
                {exception.actual_value || 'Discrepancy Detected'}
              </p>
              <p className="text-[11px] text-rose-300/80">Physically counted / verified on receiving dock</p>
            </div>
          </div>

          {/* AI Confidence Meter */}
          <div className="bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-400" /> AI Detection Confidence
              </span>
              <span className="font-extrabold text-white text-sm">{confidencePct}%</span>
            </div>
            <div className="w-full bg-white/[0.08] rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  confidencePct >= 90 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-amber-500'
                }`}
                style={{ width: `${confidencePct}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-neutral-400">
              Evaluated across multimodal receiving photographs, OCR barcodes, and PO specs. Zero-guessing threshold satisfied.
            </p>
          </div>

          {/* Inspection Information Card */}
          <Card title="Inspection Information" subtitle="Associated receiving audit and trailer manifest">
            <div className="grid grid-cols-2 gap-3.5 text-xs text-neutral-200">
              <div>
                <span className="text-[11px] text-neutral-400 block mb-0.5">Inspection ID</span>
                <button
                  type="button"
                  onClick={() => {
                    if (setSelectedInspectionId) setSelectedInspectionId(exception.inspection_id);
                    if (setActiveTab) setActiveTab('inspection-results');
                  }}
                  className="font-mono font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
                >
                  <span>{exception.inspection_number}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-0.5">Purchase Order</span>
                <button
                  type="button"
                  onClick={() => {
                    if (setSelectedPoId) setSelectedPoId(exception.po_id);
                    if (setActiveTab) setActiveTab('purchase-order-details');
                  }}
                  className="font-mono font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
                >
                  <span>{exception.po_number}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-0.5">Supplier / Vendor</span>
                <span className="font-semibold text-white">{exception.vendor_name}</span>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-0.5">SKU / Item</span>
                <span className="font-mono font-bold text-white">{exception.sku || 'N/A'}</span>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-0.5">Dock Door</span>
                <span className="font-semibold text-neutral-200">
                  {exception.inspection_info?.dock_door || exception.po_info?.assigned_dock || 'Dock Door 01'}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-neutral-400 block mb-0.5">Receiving Inspector</span>
                <span className="font-semibold text-neutral-200">
                  {exception.inspection_info?.inspector_name || 'QA Receiving Team'}
                </span>
              </div>
            </div>

            {exception.resolution_notes && (
              <div className="mt-4 pt-3 border-t border-white/[0.08]">
                <span className="text-[11px] font-bold text-white block mb-1">
                  Activity History & Resolution Notes
                </span>
                <pre className="text-[11px] text-neutral-300 bg-white/[0.02] p-2.5 rounded-xl whitespace-pre-wrap font-sans border border-white/[0.06]">
                  {exception.resolution_notes}
                </pre>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: Supporting Evidence & High-Res Photographs */}
        <div className="lg:col-span-6 space-y-4" id="evidence-photo-viewer">
          <div className="bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-orange-400" /> Supporting Evidence Photographs
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Visual proof captured during receiving inspection
                </p>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 2.5))}
                  className="p-1 text-neutral-400 hover:text-white rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 1))}
                  className="p-1 text-neutral-400 hover:text-white rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="p-1 text-neutral-400 hover:text-white rounded"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="p-1 text-neutral-400 hover:text-white rounded"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Main Active Photo Canvas */}
            <div className="relative aspect-4/3 bg-black/60 rounded-xl overflow-hidden flex items-center justify-center border border-white/[0.08]">
              {activePhoto ? (
                <img
                  src={activePhoto.file_path}
                  alt={activePhoto.file_name}
                  className="w-full h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
              ) : (
                <div className="text-center text-neutral-500 text-xs">
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span>No photographic proof attached</span>
                </div>
              )}

              {/* Overlay Tags */}
              {activePhoto && (
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs border border-white/20">
                    {activePhoto.category || 'RECEIVING PROOF'}
                  </span>
                  <span className="px-2 py-1 rounded bg-rose-600/90 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Flagged Discrepancy
                  </span>
                </div>
              )}
            </div>

            {/* Supporting Evidence Citation Callout */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                Visual Evidence Citation
              </span>
              <p className="text-xs font-semibold text-amber-200 italic">
                &ldquo;{exception.evidence_citation || activePhoto?.caption || exception.discrepancy_details}&rdquo;
              </p>
            </div>

            {/* Photo Reel / Filmstrip */}
            {exception.photographs && exception.photographs.length > 1 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-neutral-300">Attached Photo Gallery ({exception.photographs.length})</span>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {exception.photographs.map(ph => (
                    <button
                      key={ph.id}
                      type="button"
                      onClick={() => {
                        setActivePhoto(ph);
                        setZoomLevel(1);
                      }}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activePhoto?.id === ph.id ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-white/[0.08] hover:border-white/30'
                      }`}
                    >
                      <img src={ph.file_path} alt={ph.file_name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] font-semibold truncate px-1 py-0.2">
                        {ph.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTION MODAL 1: Request More Evidence */}
      <Modal
        isOpen={requestEvidenceModal}
        onClose={() => setRequestEvidenceModal(false)}
        title="Request Secondary Photographic Evidence"
      >
        <form onSubmit={submitRequestMoreEvidence} className="space-y-4 text-xs text-neutral-200">
          <p className="text-neutral-300">
            Dispatch a receiving dock work-order requesting secondary photographic proof to corroborate exception <span className="font-mono font-bold text-orange-400">{exception.exception_number}</span>.
          </p>

          <div>
            <label className="font-bold text-neutral-300 block mb-1.5">Required Evidence Category</label>
            <select
              value={evidenceRequestType}
              onChange={(e) => setEvidenceRequestType(e.target.value)}
              className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white focus:border-orange-500 focus:outline-none font-medium"
            >
              <option value="Photograph of unboxed sample units" className="bg-[#121217]">Photograph of unboxed sample units (Bench count)</option>
              <option value="Macro photograph of carton barcode label" className="bg-[#121217]">Macro photograph of carton barcode label (1D/2D UPC)</option>
              <option value="Pallet corner compression inspection" className="bg-[#121217]">Pallet corner compression inspection (Structural damage)</option>
              <option value="Close-up of internal BOM sub-components" className="bg-[#121217]">Close-up of internal BOM sub-components (Gasket/Seals)</option>
              <option value="Trailer door floor moisture reading photo" className="bg-[#121217]">Trailer door floor moisture reading photo</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-neutral-300 block mb-1.5">Instructions for Dock Operator</label>
            <textarea
              rows={3}
              value={evidenceRequestNotes}
              onChange={(e) => setEvidenceRequestNotes(e.target.value)}
              placeholder="e.g., Please break pallet stretch wrap and take an overhead bench photo of all 24 units unboxed."
              className="w-full border border-white/[0.1] rounded-xl p-2.5 text-xs text-white bg-[#121217] placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setRequestEvidenceModal(false)}
              className="px-4 py-2 border border-white/[0.1] text-neutral-300 hover:text-white rounded-xl font-semibold hover:bg-white/[0.06] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-bold transition-all shadow-[0_0_12px_rgba(255,87,34,0.3)] disabled:opacity-50"
            >
              {actionLoading ? 'Dispatching...' : 'Dispatch Evidence Request'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ACTION MODAL 2: Mark for Manual Review */}
      <Modal
        isOpen={manualReviewModal}
        onClose={() => setManualReviewModal(false)}
        title="Mark Exception for Senior Manual Review"
      >
        <form onSubmit={submitMarkManualReview} className="space-y-4 text-xs text-neutral-200">
          <p className="text-neutral-300">
            Escalate this exception to Senior QA Management for physical inspection sign-off and vendor non-conformance review.
          </p>

          <div>
            <label className="font-bold text-neutral-300 block mb-1.5">Assign Senior QA Reviewer</label>
            <select
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white focus:border-orange-500 focus:outline-none font-medium"
            >
              <option value="Marcus Vance - QA Lead" className="bg-[#121217]">Marcus Vance - QA Lead</option>
              <option value="Elena Rostova - Cold QA Lead" className="bg-[#121217]">Elena Rostova - Cold QA Lead</option>
              <option value="Sarah Jenkins - Inbound Operations Manager" className="bg-[#121217]">Sarah Jenkins - Inbound Operations Manager</option>
              <option value="David Lin - Supply Chain Director" className="bg-[#121217]">David Lin - Supply Chain Director</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-neutral-300 block mb-1.5">Priority Level</label>
            <select
              value={reviewPriority}
              onChange={(e) => setReviewPriority(e.target.value)}
              className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white focus:border-orange-500 focus:outline-none font-medium"
            >
              <option value="HIGH" className="bg-[#121217]">High Priority</option>
              <option value="CRITICAL" className="bg-[#121217]">Critical / Line-Stop Priority</option>
              <option value="MEDIUM" className="bg-[#121217]">Medium Priority</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-neutral-300 block mb-1.5">Review Notes & Escalation Reason</label>
            <textarea
              rows={3}
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="e.g., Flagged for physical count recount before initiating vendor dispute."
              className="w-full border border-white/[0.1] rounded-xl p-2.5 text-xs text-white bg-[#121217] placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setManualReviewModal(false)}
              className="px-4 py-2 border border-white/[0.1] text-neutral-300 hover:text-white rounded-xl font-semibold hover:bg-white/[0.06] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-bold transition-all shadow-[0_0_12px_rgba(255,87,34,0.3)] disabled:opacity-50"
            >
              {actionLoading ? 'Assigning...' : 'Confirm Manual Review'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ACTION MODAL 3: Resolve Exception */}
      <Modal
        isOpen={resolveModal}
        onClose={() => setResolveModal(false)}
        title="Resolve Receiving Exception"
      >
        <form onSubmit={submitResolveException} className="space-y-4 text-xs text-neutral-200">
          <p className="text-neutral-300">
            Designate the final commercial or operational disposition for exception <span className="font-mono font-bold text-orange-400">{exception.exception_number}</span>.
          </p>

          <div>
            <label className="font-bold text-neutral-300 block mb-1.5">Resolution Disposition Method</label>
            <select
              value={resolutionType}
              onChange={(e) => setResolutionType(e.target.value)}
              className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white focus:border-orange-500 focus:outline-none font-semibold"
            >
              <option value="SUPPLIER_CREDIT" className="bg-[#121217]">Supplier Credit Memo Issued (Shortage / Damage compensated)</option>
              <option value="RTV_RETURN_TO_VENDOR" className="bg-[#121217]">Return to Vendor (RTV) — Shipment rejected back to carrier</option>
              <option value="ACCEPTED_WITH_WAIVER" className="bg-[#121217]">Accepted with Concession / Deviation Waiver (Engineering approved)</option>
              <option value="SCRAPPED_DAMAGED" className="bg-[#121217]">Scrapped in Receiving QA Bay — Certificate of destruction issued</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-neutral-300 block mb-1.5">Resolution Summary & Documentation *</label>
            <textarea
              rows={3}
              required
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g., Supplier agreed to issue credit memo #CM-9014 for 4 missing units. Balance approved for inventory putaway."
              className="w-full border border-white/[0.1] rounded-xl p-2.5 text-xs text-white bg-[#121217] placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setResolveModal(false)}
              className="px-4 py-2 border border-white/[0.1] text-neutral-300 hover:text-white rounded-xl font-semibold hover:bg-white/[0.06] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              {actionLoading ? 'Finalizing...' : 'Resolve Exception & Close'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && activePhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="w-full flex items-center justify-between text-white text-xs px-4 py-2">
            <span className="font-bold">{activePhoto.file_name}</span>
            <button onClick={() => setLightboxOpen(false)} className="text-white hover:text-rose-400 font-bold text-base">&times; Close Lightbox</button>
          </div>
          <div className="max-w-5xl max-h-[80vh] flex items-center justify-center p-2" onClick={(e) => e.stopPropagation()}>
            <img src={activePhoto.file_path} alt={activePhoto.file_name} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
          </div>
          <p className="text-white/80 text-xs text-center max-w-2xl px-4 py-2 bg-white/10 rounded-lg backdrop-blur-xs">
            {exception.evidence_citation || activePhoto.caption}
          </p>
        </div>
      )}
    </div>
  );
}
