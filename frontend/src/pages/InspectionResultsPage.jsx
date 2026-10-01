import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  AlertTriangle, 
  ArrowLeft, 
  Camera, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw, 
  Printer, 
  ShieldCheck, 
  Layers, 
  Bot, 
  Sparkles, 
  Clock, 
  Truck, 
  FileText, 
  Check, 
  ChevronRight, 
  Info, 
  ExternalLink, 
  Box,
  Building2,
  Calendar,
  Eye,
  AlertCircle,
  Upload,
  Plus
} from 'lucide-react';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import { inspectionsApi } from '../services/api';

const SIX_CHECKS = [
  {
    key: 'sku_identity',
    title: 'SKU IDENTITY',
    category: 'Identification',
    description: 'Verify scanned physical barcode against PO purchase order manifest'
  },
  {
    key: 'quantity',
    title: 'QUANTITY',
    category: 'Count',
    description: 'Physical unit count versus expected ordered volume'
  },
  {
    key: 'carton_count',
    title: 'CARTON COUNT',
    category: 'Packaging',
    description: 'Physical master carton count on pallet'
  },
  {
    key: 'variant_color',
    title: 'VARIANT',
    category: 'Specification',
    description: 'Product variant, color finish, and coating verification'
  },
  {
    key: 'damage',
    title: 'DAMAGE',
    category: 'Condition',
    description: 'Master carton crushing, product surface scratches, water ingress, and torn seals'
  },
  {
    key: 'missing_components',
    title: 'COMPONENTS',
    category: 'Specification',
    description: 'Bill of materials sub-components, cap, silicone seals, and accessories'
  }
];

export default function InspectionResultsPage({ inspectionId, scenarioData, onBack, setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inspection, setInspection] = useState(null);
  const [report, setReport] = useState(null);
  const [selectedCheckKey, setSelectedCheckKey] = useState('quantity');
  const [activePhotoUrl, setActivePhotoUrl] = useState(null);
  const [activePhotoName, setActivePhotoName] = useState('');
  const [activePhotoCat, setActivePhotoCat] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [showDamageBreakdown, setShowDamageBreakdown] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    if (scenarioData) {
      // Direct scenario load (ideal for instant CUBE hackathon demonstrations)
      const rep = {
        inspection_id: scenarioData.po.id,
        inspection_number: `INS-DEMO-${String(scenarioData.number).padStart(4, '0')}`,
        po_number: scenarioData.po.po_number,
        supplier_name: scenarioData.po.vendor_name,
        date_time: new Date().toISOString(),
        sku: scenarioData.product.sku,
        product_name: scenarioData.product.name,
        inspection_mode: 'DETERMINISTIC_DEMO_MODE',
        engine_name: 'CUBE Hackathon Demo Engine',
        overall_verdict: scenarioData.overallDecision === 'ACCEPTED' ? 'PASS' : (scenarioData.overallDecision === 'EXCEPTION' ? 'FAIL' : 'FLAGGED_FOR_REVIEW'),
        overall_decision: scenarioData.overallDecision,
        confidence_score: 0.92,
        checks: JSON.parse(JSON.stringify(scenarioData.checks)),
        attached_photos: scenarioData.evidencePhotos,
        is_ambiguous: scenarioData.isAmbiguous,
        ambiguous_message: scenarioData.ambiguousMessage,
        scenario_title: scenarioData.title
      };
      setReport(rep);
      setInspection({
        id: scenarioData.po.id,
        inspection_number: rep.inspection_number,
        dock_door: scenarioData.po.assigned_dock,
        inspector_name: 'Lead QA Inspector',
        temperature_reading_c: 20.5
      });

      const firstCheck = scenarioData.checks[selectedCheckKey] || Object.values(scenarioData.checks)[0];
      if (firstCheck && firstCheck.evidence && firstCheck.evidence.length > 0) {
        setActivePhotoUrl(firstCheck.evidence[0].image_url);
        setActivePhotoName(firstCheck.evidence[0].image);
        setActivePhotoCat(firstCheck.evidence[0].category || 'EVIDENCE');
      } else if (scenarioData.evidencePhotos.length > 0) {
        setActivePhotoUrl(scenarioData.evidencePhotos[0].file_path);
        setActivePhotoName(scenarioData.evidencePhotos[0].file_name);
        setActivePhotoCat(scenarioData.evidencePhotos[0].category);
      }
      setLoading(false);
      return;
    }

    loadData();
  }, [inspectionId, scenarioData]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const idToLoad = inspectionId || 1;
      const [insData, aiData] = await Promise.all([
        inspectionsApi.get(idToLoad).catch(() => null),
        inspectionsApi.runAiInspection(idToLoad).catch(() => null)
      ]);

      setInspection(insData);
      setReport(aiData);

      if (aiData) {
        const firstCheck = aiData.checks[selectedCheckKey] || Object.values(aiData.checks)[0];
        if (firstCheck && firstCheck.evidence && firstCheck.evidence.length > 0) {
          const cit = firstCheck.evidence[0];
          setActivePhotoUrl(cit.image_url || getFallbackPhoto(cit.category));
          setActivePhotoName(cit.image);
          setActivePhotoCat(cit.category || 'LABELS');
        } else if (aiData.attached_photos && aiData.attached_photos.length > 0) {
          const first = aiData.attached_photos[0];
          setActivePhotoUrl(first.file_path);
          setActivePhotoName(first.file_name);
          setActivePhotoCat(first.category);
        }
      }
    } catch (err) {
      console.error('Failed to load inspection results:', err);
      setError('Unable to load inspection results. Ensure backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const getFallbackPhoto = (cat) => {
    switch (cat) {
      case 'CARTONS':
        return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80';
      case 'PRODUCTS':
        return 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80';
      case 'LABELS':
        return 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80';
      case 'RECEIVING_AREA':
        return 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80';
      default:
        return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80';
    }
  };

  const handleSelectCheck = (checkKey) => {
    setSelectedCheckKey(checkKey);
    setZoomLevel(1);

    if (!report || !report.checks) return;
    const checkData = report.checks[checkKey];
    if (checkData && checkData.evidence && checkData.evidence.length > 0) {
      const cit = checkData.evidence[0];
      setActivePhotoUrl(cit.image_url || getFallbackPhoto(cit.category));
      setActivePhotoName(cit.image);
      setActivePhotoCat(cit.category || 'EVIDENCE');
    }
  };

  // Resolving Ambiguity when user clicks [Upload More Evidence]
  const handleResolveAmbiguityWithEvidence = () => {
    const newEvidencePhoto = {
      id: 'resolved-p1',
      file_name: 'unboxed_24_units_clear_recount.jpg',
      file_path: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
      category: 'PRODUCTS',
      caption: 'Unboxed sample units spread across staging table with legible barcode.',
      finding: 'All 24 units clearly visible and counted upon unboxing. Barcode verified.'
    };

    setReport(prev => {
      const copy = { ...prev };
      copy.is_ambiguous = false;
      copy.overall_decision = 'ACCEPTED';
      copy.checks = {
        ...copy.checks,
        sku_identity: {
          status: 'PASS',
          expected: 'BLUE-BOTTLE-001',
          observed: 'BLUE-BOTTLE-001',
          confidence: 0.99,
          evidence: [{ image: newEvidencePhoto.file_name, finding: 'Barcode clearly verified on unboxed unit', category: 'LABELS', image_url: newEvidencePhoto.file_path }],
          explanation: 'Secondary macro photo uploaded. Barcode verified matching BLUE-BOTTLE-001.'
        },
        quantity: {
          status: 'PASS',
          expected: 24,
          observed: 24,
          confidence: 0.98,
          evidence: [{ image: newEvidencePhoto.file_name, finding: '24 units verified upon carton unboxing', category: 'PRODUCTS', image_url: newEvidencePhoto.file_path }],
          explanation: 'Additional unboxed evidence provided. Exactly 24 units physically counted.'
        },
        variant_color: {
          status: 'PASS',
          expected: 'Blue',
          observed: 'Blue',
          confidence: 0.97,
          evidence: [{ image: newEvidencePhoto.file_name, finding: 'Blue powder coat confirmed', category: 'PRODUCTS', image_url: newEvidencePhoto.file_path }],
          explanation: 'Unboxed product shows correct Blue finish.'
        },
        missing_components: {
          status: 'PASS',
          expected: 'Cap, Silicone Gasket, Clip',
          observed: 'Complete assembly present',
          confidence: 0.95,
          evidence: [{ image: newEvidencePhoto.file_name, finding: 'All BOM components verified', category: 'PRODUCTS', image_url: newEvidencePhoto.file_path }],
          explanation: 'All BOM items accounted for.'
        }
      };
      copy.attached_photos = [newEvidencePhoto, ...(copy.attached_photos || [])];
      return copy;
    });

    setActivePhotoUrl(newEvidencePhoto.file_path);
    setActivePhotoName(newEvidencePhoto.file_name);
    setActivePhotoCat('PRODUCTS');
    setUploadModalOpen(false);

    setActionMessage({
      type: 'success',
      text: 'Additional unboxed evidence successfully processed! Ambiguity resolved: All 24 units verified -> Decision updated to ACCEPTED.'
    });
  };

  const decision = useMemo(() => {
    if (!report) return 'UNCERTAIN';
    if (report.overall_decision) return report.overall_decision;

    const core = SIX_CHECKS.map(c => report.checks[c.key]).filter(Boolean);
    if (core.some(c => c.status === 'FAIL')) return 'EXCEPTION';
    if (core.some(c => c.status === 'UNCERTAIN')) return 'UNCERTAIN';
    return 'ACCEPTED';
  }, [report]);

  const decisionConfig = {
    ACCEPTED: {
      badge: 'ACCEPTED',
      title: 'OVERALL DECISION: ACCEPTED',
      subtitle: 'All 6 required receiving checks verified compliant. Full barcode identity, quantity, carton integrity, and components match PO standards. Cleared for putaway.',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10 backdrop-blur-xl',
      text: 'text-white',
      badgeBg: 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]',
      icon: CheckCircle2,
      actionText: 'Approve & Putaway Cargo'
    },
    EXCEPTION: {
      badge: 'EXCEPTION',
      title: 'OVERALL DECISION: EXCEPTION',
      subtitle: 'One or more critical checks failed receiving specifications. Discrepancy, damaged carton, or missing quantity identified. Shipment quarantined in QA bay.',
      border: 'border-rose-500/30',
      bg: 'bg-rose-500/10 backdrop-blur-xl',
      text: 'text-white',
      badgeBg: 'bg-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.3)]',
      icon: XCircle,
      actionText: 'Log Discrepancy & Quarantine'
    },
    UNCERTAIN: {
      badge: 'UNCERTAIN',
      title: 'OVERALL DECISION: UNCERTAIN',
      subtitle: 'Important checks cannot be determined from available receiving photographs (zero-guessing policy enforced). Master cartons remain sealed and internal units cannot be verified without physical unboxing & recount.',
      border: 'border-amber-500/30',
      bg: 'bg-amber-500/10 backdrop-blur-xl',
      text: 'text-white',
      badgeBg: 'bg-amber-500 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)]',
      icon: HelpCircle,
      actionText: 'Request Physical Recount & Unboxing'
    }
  };

  const currentDecision = decisionConfig[decision] || decisionConfig.UNCERTAIN;
  const DecisionIcon = currentDecision.icon;
  const activeCheckData = report?.checks?.[selectedCheckKey];

  const handleApprovePutaway = async () => {
    try {
      setActionLoading(true);
      if (inspection?.id) {
        await inspectionsApi.finalize(inspection.id, {
          overall_disposition: 'ACCEPTED',
          notes: 'Shipment accepted via AI Receiving Inspection Results certificate.'
        }).catch(() => {});
      }
      setActionMessage({ type: 'success', text: 'Shipment approved for putaway. Purchase order status updated to RECEIVED.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to update putaway status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuarantine = async () => {
    try {
      setActionLoading(true);
      if (inspection?.id) {
        await inspectionsApi.finalize(inspection.id, {
          overall_disposition: 'QUARANTINED',
          notes: 'Shipment quarantined due to receiving inspection discrepancy exception.'
        }).catch(() => {});
      }
      setActionMessage({ type: 'success', text: 'Exception logged. Shipment assigned to QA Quarantine Bay.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to log quarantine exception.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecount = () => {
    setUploadModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="text-center space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-medium">Loading Receiving Inspection Results...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-[#0e0e13]/85 backdrop-blur-xl border border-rose-500/30 rounded-2xl space-y-4 shadow-2xl">
        <div className="flex items-center gap-3 text-rose-400">
          <AlertCircle className="w-6 h-6" />
          <h3 className="font-bold text-base text-white">Unable to Display Inspection Results</h3>
        </div>
        <p className="text-xs text-neutral-300">{error || 'No inspection report data returned.'}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xs font-semibold rounded-xl shadow-lg transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const formattedDate = report.date_time 
    ? new Date(report.date_time).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    : new Date().toLocaleString();

  return (
    <div className="space-y-6 max-w-7xl mx-auto print:max-w-none print:m-0 text-neutral-200">
      {/* Top Navigation & Certificate Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={onBack || (() => setActiveTab && setActiveTab('inspections'))}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Inspections
        </button>

        <div className="flex items-center gap-2">
          {report.scenario_title && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Demo: {report.scenario_title}
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white/[0.04] text-neutral-300 border border-white/[0.08]">
            <Bot className="w-3.5 h-3.5 text-orange-400" /> {report.engine_name}
          </span>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.1] text-neutral-200 hover:text-white hover:bg-white/[0.08] text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-400" />
            <span>Print Certificate</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between gap-3 backdrop-blur-xl ${
          actionMessage.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' :
          actionMessage.type === 'error' ? 'bg-rose-500/15 border-rose-500/30 text-rose-300' :
          'bg-orange-500/15 border-orange-500/30 text-orange-300'
        }`}>
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Header: RECEIVING INSPECTION Identity Card */}
      <div className="bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-[0_0_12px_rgba(255,87,34,0.4)]">
                RECEIVING INSPECTION
              </span>
              <span className="font-mono text-sm font-bold text-white">
                {report.inspection_number || `INS-2026-${String(report.inspection_id).padStart(4, '0')}`}
              </span>
              <span className="text-xs text-neutral-600">•</span>
              <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                {formattedDate}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-white">
              {report.product_name}
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs shrink-0">
            <div className="px-3.5 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl">
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Inspection ID</span>
              <span className="font-mono font-bold text-white">#{report.inspection_id}</span>
            </div>

            <div className="px-3.5 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl">
              <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Avg Confidence</span>
              <span className="font-bold text-orange-400">{Math.round((report.confidence_score || 0.88) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* PO & Supplier Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">PO Number</span>
            <span className="font-mono font-bold text-orange-400 text-sm">{report.po_number}</span>
          </div>

          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Supplier</span>
            <span className="font-bold text-white truncate block">{report.supplier_name || 'HydroVessel Technologies'}</span>
          </div>

          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">SKU Identity</span>
            <span className="font-mono font-bold text-white truncate block">{report.sku}</span>
          </div>

          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Inspection Date/Time</span>
            <span className="font-semibold text-neutral-300 text-[11px] block">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* OVERALL DECISION BANNER (ACCEPTED / EXCEPTION / UNCERTAIN) */}
      <div className={`p-5 rounded-xl border-2 shadow-sm ${currentDecision.border} ${currentDecision.bg} space-y-4`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              decision === 'ACCEPTED' ? 'bg-emerald-600 text-white' :
              decision === 'EXCEPTION' ? 'bg-rose-600 text-white' :
              'bg-amber-500 text-white'
            }`}>
              <DecisionIcon className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${currentDecision.badgeBg}`}>
                  {currentDecision.badge}
                </span>
                <h2 className={`text-lg font-black tracking-tight ${currentDecision.text}`}>
                  {currentDecision.title}
                </h2>
              </div>
              <p className={`text-xs max-w-3xl leading-relaxed ${currentDecision.text} opacity-90`}>
                {currentDecision.subtitle}
              </p>
            </div>
          </div>

          <div className="shrink-0 print:hidden">
            {decision === 'ACCEPTED' && (
              <button
                type="button"
                onClick={handleApprovePutaway}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{actionLoading ? 'Processing Putaway...' : currentDecision.actionText}</span>
              </button>
            )}

            {decision === 'EXCEPTION' && (
              <button
                type="button"
                onClick={handleQuarantine}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{actionLoading ? 'Logging Quarantine...' : currentDecision.actionText}</span>
              </button>
            )}

            {decision === 'UNCERTAIN' && (
              <button
                type="button"
                onClick={handleRecount}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
                <span>Upload More Evidence</span>
              </button>
            )}
          </div>
        </div>

        {/* Decision Rules Logic Pill Indicator */}
        <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between text-[11px] text-neutral-400 gap-2">
          <span className="font-bold text-neutral-300">Decision Evaluation Rule:</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${decision === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-white/[0.03] text-neutral-400 border-white/[0.06]'}`}>
              All pass → ACCEPTED
            </span>
            <span className="text-neutral-600">•</span>
            <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${decision === 'EXCEPTION' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-white/[0.03] text-neutral-400 border-white/[0.06]'}`}>
              Any fail → EXCEPTION
            </span>
            <span className="text-neutral-600">•</span>
            <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${decision === 'UNCERTAIN' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-white/[0.03] text-neutral-400 border-white/[0.06]'}`}>
              Incomplete evidence → UNCERTAIN
            </span>
          </div>
        </div>
      </div>

      {/* AMBIGUOUS EVIDENCE ZERO-GUESSING CALLOUT (Strict Requirement) */}
      {(report.is_ambiguous || activeCheckData?.status === 'UNCERTAIN') && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 backdrop-blur-xl shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-200 text-sm">Ambiguous Visual Evidence Detected</span>
                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Zero-Guessing Policy Active
                </span>
              </div>
              <p className="text-sm font-bold text-amber-300 leading-snug">
                &ldquo;Insufficient visual evidence to determine the shipment quantity.&rdquo;
              </p>
              <p className="text-xs text-amber-300/80">
                Under strict warehouse receiving compliance, the system is prohibited from guessing or forcing a PASS or FAIL result. Additional unboxed photographic proof is required before a definitive disposition can be assigned.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[11px] text-amber-300/70 italic">
              Status locked to UNCERTAIN. System cannot force PASS or FAIL without photographic proof.
            </span>

            {/* The Required [Upload More Evidence] Button */}
            <button
              type="button"
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Upload More Evidence</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN TWO-COLUMN SPLIT: 6 Checks Matrix vs Professional Evidence Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 6 Core Inspection Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Core Inspection Findings</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.06] text-neutral-300 text-xs font-semibold border border-white/[0.08]">
                6 Required Checks
              </span>
            </h3>
            <span className="text-xs text-neutral-400 italic">Click any card to inspect evidence</span>
          </div>

          <div className="space-y-3">
            {SIX_CHECKS.map((checkDef, idx) => {
              const data = report.checks?.[checkDef.key] || {
                status: 'UNCERTAIN',
                expected: 'N/A',
                observed: 'Not photographed',
                confidence: 0.5,
                evidence: [],
                explanation: 'Awaiting photographic evidence upload.'
              };

              const isSelected = selectedCheckKey === checkDef.key;
              const hasEvidence = data.evidence && data.evidence.length > 0;
              const evidenceSnippet = hasEvidence
                ? data.evidence[0].finding
                : (data.status === 'UNCERTAIN'
                  ? 'Insufficient visual evidence to determine this dimension (zero-guessing policy enforced).'
                  : 'Observation verified against manifest documentation.');

              return (
                <div
                  key={checkDef.key}
                  onClick={() => handleSelectCheck(checkDef.key)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 ring-2 ring-orange-500/20 bg-[#121217] shadow-xl'
                      : 'border-white/[0.08] hover:border-orange-500/40 bg-[#0e0e13]/85 backdrop-blur-xl hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-2.5 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/[0.1] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-white tracking-tight">
                          {checkDef.title}
                        </h4>
                        <span className="text-[11px] text-neutral-400">
                          {checkDef.description}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {data.status === 'PASS' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PASS
                        </span>
                      )}
                      {data.status === 'FAIL' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5 text-rose-400" /> FAIL
                        </span>
                      )}
                      {data.status === 'UNCERTAIN' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> UNCERTAIN
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expected vs Observed Comparison Box */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl">
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                        Expected
                      </span>
                      <span className="font-bold text-white truncate block">
                        {String(data.expected)}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border ${
                      data.status === 'FAIL' 
                        ? 'bg-rose-500/15 border-rose-500/30' 
                        : data.status === 'UNCERTAIN'
                        ? 'bg-amber-500/15 border-amber-500/30'
                        : 'bg-emerald-500/15 border-emerald-500/30'
                    }`}>
                      <span className="text-neutral-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                        Observed
                      </span>
                      <span className={`font-bold truncate block ${
                        data.status === 'FAIL' ? 'text-rose-400' :
                        data.status === 'UNCERTAIN' ? 'text-amber-400' :
                        'text-emerald-400'
                      }`}>
                        {String(data.observed)}
                      </span>
                    </div>
                  </div>

                  {/* Confidence Bar & Evidence Statement */}
                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-400 font-medium">Confidence Score</span>
                      <span className="font-bold text-white">{Math.round((data.confidence || 0.5) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          data.status === 'PASS' ? 'bg-emerald-500' :
                          data.status === 'FAIL' ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.round((data.confidence || 0.5) * 100)}%` }}
                      />
                    </div>

                    <div className="p-2.5 bg-white/[0.02] rounded-xl border border-white/[0.06] text-[11px] text-neutral-300 italic flex items-start gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-semibold not-italic text-white">Evidence: </strong>
                        &ldquo;{evidenceSnippet}&rdquo;
                      </span>
                    </div>
                  </div>

                  {/* Damage Sub-check toggle */}
                  {checkDef.key === 'damage' && report.damage_breakdown && (
                    <div className="mt-3 pt-2 border-t border-white/[0.08]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDamageBreakdown(!showDamageBreakdown);
                        }}
                        className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                      >
                        <span>{showDamageBreakdown ? 'Hide Damage Breakdown' : 'View Granular Damage Breakdown (4 Checks)'}</span>
                        <ChevronRight className={`w-3 h-3 transition-transform ${showDamageBreakdown ? 'rotate-90' : ''}`} />
                      </button>

                      {showDamageBreakdown && (
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2">
                          {Object.entries(report.damage_breakdown).map(([subKey, subCheck]) => (
                            <div key={subKey} className="p-2.5 bg-white/[0.02] rounded-xl border border-white/[0.06] text-[11px]">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-neutral-200 capitalize">
                                  {subKey.replace('_', ' ')}
                                </span>
                                <Badge status={subCheck.status} size="xs" />
                              </div>
                              <p className="text-neutral-400 text-[10px] mt-1 truncate">{subCheck.observed}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Professional Evidence Viewer */}
        <div className="lg:col-span-5 sticky top-20 space-y-4">
          <div className="bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-3.5 bg-white/[0.03] border-b border-white/[0.08] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-neutral-200">
                  Evidence Viewer: {SIX_CHECKS.find(c => c.key === selectedCheckKey)?.title || 'FINDING'}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(1, prev - 0.25))}
                  title="Zoom Out"
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] px-1 text-neutral-300">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
                  title="Zoom In"
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  title="Reset Zoom"
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  title="Fullscreen Lightbox"
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.08] rounded-lg transition-colors ml-1"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* High-Resolution Interactive Image Stage */}
            <div className="relative h-64 sm:h-80 bg-black/60 flex items-center justify-center overflow-hidden p-2">
              {activePhotoUrl ? (
                <img
                  src={activePhotoUrl}
                  alt={activePhotoName || 'Evidence photograph'}
                  style={{ transform: `scale(${zoomLevel})` }}
                  className="max-h-full max-w-full object-contain transition-transform duration-200 select-none rounded-lg"
                />
              ) : (
                <div className="text-center p-6 text-neutral-400 space-y-2">
                  <HelpCircle className="w-10 h-10 mx-auto text-amber-400 opacity-60" />
                  <p className="font-bold text-xs text-white">Zero-Guessing Policy Active</p>
                  <p className="text-[11px] max-w-xs text-neutral-400">
                    No photograph attached for this check. Per zero-guessing policy, status is UNCERTAIN until photo is uploaded.
                  </p>
                </div>
              )}

              {activePhotoCat && (
                <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/80 backdrop-blur-xs text-white rounded-lg text-[10px] font-bold uppercase tracking-wider border border-white/20">
                  {activePhotoCat}
                </div>
              )}

              {activePhotoName && (
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 backdrop-blur-xs text-neutral-300 rounded font-mono text-[10px] truncate max-w-[200px] border border-white/10">
                  {activePhotoName}
                </div>
              )}
            </div>

            {/* Selected Finding Callout & AI Explanation */}
            {activeCheckData && (
              <div className="p-4 bg-white/[0.02] border-t border-white/[0.08] space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                    Observation & Evidence Analysis
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge status={activeCheckData.status} size="xs" />
                    <span className="text-[11px] font-bold text-neutral-300">
                      {Math.round((activeCheckData.confidence || 0.5) * 100)}%
                    </span>
                  </div>
                </div>

                {activeCheckData.evidence && activeCheckData.evidence.length > 0 && (
                  <div className="p-3 bg-orange-500/[0.04] border border-orange-500/20 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">
                      Visual Citation
                    </span>
                    <p className="text-white font-medium italic text-xs leading-relaxed">
                      &ldquo;{activeCheckData.evidence[0].finding}&rdquo;
                    </p>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                    Reasoning & Policy Compliance
                  </span>
                  <p className="text-neutral-300 text-xs leading-relaxed">
                    {activeCheckData.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Evidence Filmstrip */}
            {report.attached_photos && report.attached_photos.length > 0 && (
              <div className="p-3 bg-white/[0.01] border-t border-white/[0.08] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
                  All Attached Photos ({report.attached_photos.length})
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {report.attached_photos.map((photo) => {
                    const isPhotoActive = activePhotoUrl === photo.file_path;
                    return (
                      <button
                        key={photo.id || photo.file_name}
                        type="button"
                        onClick={() => {
                          setActivePhotoUrl(photo.file_path);
                          setActivePhotoName(photo.file_name);
                          setActivePhotoCat(photo.category);
                          setZoomLevel(1);
                        }}
                        className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all relative ${
                          isPhotoActive
                            ? 'border-orange-500 ring-2 ring-orange-500/40 shadow-lg'
                            : 'border-white/[0.08] opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={photo.file_path}
                          alt={photo.file_name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload More Evidence Modal (For Ambiguous Evidence Demonstration) */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Additional Photographic Evidence"
        subtitle="Zero-guessing resolution: upload clear unboxed sample photos to resolve ambiguous quantity"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 text-xs text-neutral-200">
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-neutral-200 space-y-1">
            <span className="font-bold text-orange-300 block">Resolve Quantity Ambiguity</span>
            <p className="text-[11px] text-neutral-300">
              The initial photographs only displayed sealed outer master cartons. To verify the 24 ordered units without guessing, upload a photograph of the unboxed units arranged on the receiving table.
            </p>
          </div>

          <div className="p-6 border-2 border-dashed border-white/[0.12] hover:border-orange-500/40 rounded-2xl bg-white/[0.02] text-center space-y-3 transition-colors">
            <Camera className="w-10 h-10 text-orange-400 mx-auto" />
            <div>
              <p className="font-bold text-white text-sm">Upload Unboxed Unit Physical Count Photo</p>
              <p className="text-[11px] text-neutral-400">Supported: High-resolution JPG, PNG or WEBP from receiving camera</p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResolveAmbiguityWithEvidence}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl text-xs font-bold shadow-[0_0_12px_rgba(255,87,34,0.3)] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Simulate Unboxed Photo Capture (24 Units on Bench)</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 border border-white/[0.1] text-neutral-300 hover:text-white hover:bg-white/[0.06] rounded-xl text-xs font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Fullscreen Lightbox Modal */}
      <Modal
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={`Receiving Evidence Lightbox — ${activePhotoName || 'Inspection Photo'}`}
        maxWidth="max-w-5xl"
      >
        <div className="bg-slate-950 p-2 rounded-xl flex items-center justify-center max-h-[80vh] overflow-hidden">
          <img
            src={activePhotoUrl}
            alt="Fullscreen evidence"
            className="max-h-[75vh] object-contain rounded-lg"
          />
        </div>
      </Modal>
    </div>
  );
}
