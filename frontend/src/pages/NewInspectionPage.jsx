import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  ShieldCheck, 
  Layers, 
  Camera, 
  ArrowRight, 
  ArrowLeft,
  Boxes,
  Upload,
  Trash2,
  Eye,
  Sparkles,
  FileText,
  Clock,
  Building2,
  Calendar,
  X,
  Bot
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import AIInspectionAuditView from '../components/inspection/AIInspectionAuditView';
import { purchaseOrdersApi, inspectionsApi, evidenceApi } from '../services/api';

const PHOTO_CATEGORIES = [
  { id: 'CARTONS', label: 'Cartons', desc: 'Outer box condition, strapping, corner seams' },
  { id: 'PRODUCTS', label: 'Products', desc: 'Unboxed unit, surface finish, color variant' },
  { id: 'LABELS', label: 'Labels', desc: '1D/2D Barcodes, UPC, serial & date codes' },
  { id: 'PACKAGING', label: 'Packaging', desc: 'Inner foam, styrofoam dunnage, protective wrap' },
  { id: 'RECEIVING_AREA', label: 'Receiving Area', desc: 'Trailer floor, dock staging bay, pallet placement' },
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export default function NewInspectionPage({ setActiveTab, onInspectionCreated, initialPoId, setSelectedInspectionId, scenarioData }) {
  const [step, setStep] = useState(1);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Step 1: PO & Expected Shipment State
  const [selectedPoId, setSelectedPoId] = useState('');
  const [selectedPo, setSelectedPo] = useState(null);
  const [dockDoor, setDockDoor] = useState('Dock Door 01');
  const [inspectorName, setInspectorName] = useState('Marcus Vance - QA Lead');
  const [sealIntact, setSealIntact] = useState(true);
  const [bolMatch, setBolMatch] = useState(true);

  // Step 2: Evidence Photographs State
  const [selectedCategory, setSelectedCategory] = useState('CARTONS');
  const [uploadedEvidence, setUploadedEvidence] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // Step 3: Inspection Findings & AI Service
  const [activeInspectionId, setActiveInspectionId] = useState(null);
  const [inspectionItems, setInspectionItems] = useState([]);
  const [temperatureReading, setTemperatureReading] = useState('20.5');
  const [disposition, setDisposition] = useState('ACCEPTED');
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [aiRunning, setAiRunning] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [submittingFinal, setSubmittingFinal] = useState(false);

  useEffect(() => {
    loadPOs();
  }, [initialPoId]);

  useEffect(() => {
    if (scenarioData) {
      if (scenarioData.po) {
        setPos(prev => {
          if (!prev.some(p => p.id === scenarioData.po.id)) {
            return [scenarioData.po, ...prev];
          }
          return prev;
        });
        setSelectedPoId(scenarioData.po.id);
        setSelectedPo(scenarioData.po);
        setDockDoor(scenarioData.po.assigned_dock || 'Dock Door 02');
      }
      if (scenarioData.evidencePhotos && scenarioData.evidencePhotos.length > 0) {
        setUploadedEvidence(scenarioData.evidencePhotos.map((p, idx) => ({
          id: p.id || `demo-ev-${idx + 1}`,
          file_name: p.file_name,
          file_path: p.file_path,
          url: p.file_path,
          category: p.category,
          file_size_bytes: 1450000,
          caption: p.caption,
          status: 'READY'
        })));
      }
      if (scenarioData.po && scenarioData.product) {
        const lineItems = (scenarioData.po.line_items && scenarioData.po.line_items.length > 0)
          ? scenarioData.po.line_items
          : [{
              id: 1,
              sku: scenarioData.product.sku,
              item_name: scenarioData.product.name,
              expected_variant: scenarioData.product.variant,
              expected_units_per_carton: scenarioData.product.units_per_carton,
              expected_carton_count: scenarioData.product.expected_carton_count,
              expected_qty: scenarioData.po.total_expected_units
            }];
        setInspectionItems(lineItems.map(li => {
          const sample = Math.max(1, Math.round(li.expected_qty * 0.1));
          return {
            po_line_item_id: li.id,
            product_id: li.product_id || 1,
            sku: li.sku,
            item_name: li.item_name,
            expected_variant: li.expected_variant || 'Standard',
            expected_units_per_carton: li.expected_units_per_carton || 12,
            expected_carton_count: li.expected_carton_count || 1,
            expected_qty: li.expected_qty,
            sampled_quantity: sample,
            passed_quantity: sample,
            defective_quantity: 0,
            defect_category: '',
            status: 'PASSED',
            notes: ''
          };
        }));
      }
    }
  }, [scenarioData]);

  const loadPOs = async () => {
    try {
      setLoading(true);
      const data = await purchaseOrdersApi.list();
      setPos(data);
      if (initialPoId) {
        const found = data.find(p => p.id === parseInt(initialPoId, 10));
        if (found) {
          handleSelectPO(found);
          return;
        }
      }
      if (data.length > 0) {
        handleSelectPO(data[0]);
      }
    } catch (err) {
      console.error("Failed to load POs:", err);
      setError("Unable to load purchase orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPO = (po) => {
    setSelectedPoId(po.id);
    setSelectedPo(po);
    setDockDoor(po.assigned_dock || 'Dock Door 01');

    // Populate line items for inspection checklist
    const items = (po.line_items || []).map((li) => {
      const sample = Math.max(1, Math.round(li.expected_qty * 0.1));
      return {
        po_line_item_id: li.id,
        product_id: li.product_id,
        sku: li.sku,
        item_name: li.item_name,
        expected_variant: li.expected_variant || 'Standard',
        expected_units_per_carton: li.expected_units_per_carton || 12,
        expected_carton_count: li.expected_carton_count || 1,
        expected_qty: li.expected_qty,
        sampled_quantity: sample,
        passed_quantity: sample,
        defective_quantity: 0,
        defect_category: '',
        status: 'PASSED',
        notes: ''
      };
    });
    setInspectionItems(items);
  };

  // File Upload Handling & Validation
  const handleFilesSelected = async (files) => {
    if (!files || files.length === 0) return;
    setError(null);
    setIsUploading(true);

    const validFiles = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = '.' + file.name.split('.').pop().toLowerCase();

      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setError(`File "${file.name}" rejected. Allowed image formats: JPG, JPEG, PNG, WEBP.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File "${file.name}" rejected. Exceeds 15MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    // Upload each valid file to backend
    for (const file of validFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', selectedCategory);
        if (selectedPoId) formData.append('po_id', selectedPoId);
        formData.append('caption', `${selectedCategory} receiving proof: ${file.name}`);

        const result = await evidenceApi.upload(formData);
        setUploadedEvidence(prev => [result, ...prev]);
      } catch (err) {
        console.error("Upload error:", err);
        setError(`Failed to upload ${file.name}: ${err.response?.data?.detail || err.message}`);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 1-Click Load Demo Warehouse Photos
  const loadDemoReceivingPhotos = async () => {
    setError(null);
    setIsUploading(true);

    const demoPhotos = [
      {
        file_name: 'outer_carton_seal_inspection.jpg',
        file_path: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
        category: 'CARTONS',
        caption: 'Master corrugated outer cartons stacked on pallet with corner protectors.'
      },
      {
        file_name: 'product_bottle_blue_finish.jpg',
        file_path: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
        category: 'PRODUCTS',
        caption: 'Unboxed Premium Water Bottle sample in Blue powder-coat finish.'
      },
      {
        file_name: 'shipping_barcode_label.jpg',
        file_path: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80',
        category: 'LABELS',
        caption: 'Clear 1D/2D shipping label with readable UPC barcode and SKU.'
      },
      {
        file_name: 'dock_trailer_receiving_bay.jpg',
        file_path: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=600&q=80',
        category: 'RECEIVING_AREA',
        caption: 'Inbound trailer staging area at Dock Door 02.'
      }
    ];

    try {
      for (const photo of demoPhotos) {
        const record = await evidenceApi.record({
          po_id: selectedPoId ? parseInt(selectedPoId, 10) : null,
          file_name: photo.file_name,
          file_path: photo.file_path,
          file_type: 'IMAGE',
          category: photo.category,
          file_size_bytes: 1450000,
          caption: photo.caption,
          confidence_score: 0.98,
          tags: `demo,${photo.category.toLowerCase()}`
        });

        setUploadedEvidence(prev => [
          {
            id: record.id,
            file_name: photo.file_name,
            file_path: photo.file_path,
            url: photo.file_path,
            category: photo.category,
            file_size_bytes: 1450000,
            caption: photo.caption,
            status: 'READY'
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error("Demo load error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveEvidence = async (id, e) => {
    e.stopPropagation();
    try {
      await evidenceApi.delete(id);
      setUploadedEvidence(prev => prev.filter(ev => ev.id !== id));
    } catch (err) {
      setUploadedEvidence(prev => prev.filter(ev => ev.id !== id));
    }
  };

  // Step 3: Run AI Inspection (connected to placeholder service)
  const handleRunAiInspection = async () => {
    try {
      setAiRunning(true);
      setError(null);

      // Instant evaluation for staged hackathon scenario
      if (scenarioData && scenarioData.checks) {
        await new Promise(r => setTimeout(r, 800));
        const simulatedReport = {
          inspection_id: scenarioData.po.id,
          inspection_number: `INS-DEMO-${String(scenarioData.number).padStart(4, '0')}`,
          engine_name: 'CUBE Vision & Inspection Engine',
          inspection_mode: 'DETERMINISTIC_DEMO_MODE',
          overall_verdict: scenarioData.overallDecision === 'ACCEPTED' ? 'PASS' : (scenarioData.overallDecision === 'EXCEPTION' ? 'FAIL' : 'FLAGGED_FOR_REVIEW'),
          overall_decision: scenarioData.overallDecision,
          recommendation: scenarioData.overallDecision === 'ACCEPTED' ? 'ACCEPT_AND_STOW' : (scenarioData.overallDecision === 'EXCEPTION' ? 'LOG_EXCEPTION_AND_HOLD' : 'REQUEST_MORE_EVIDENCE'),
          confidence_score: 0.94,
          summary: scenarioData.ambiguousMessage || (scenarioData.overallDecision === 'ACCEPTED' ? 'All receiving visual compliance checks passed with high confidence.' : `Visual discrepancies detected: ${scenarioData.summary}`),
          checks: {
            sku_identity: scenarioData.checks.sku_identity,
            quantity: scenarioData.checks.quantity,
            carton_count: scenarioData.checks.carton_count,
            units_per_carton: {
              status: scenarioData.checks.carton_count?.status || 'PASS',
              expected: scenarioData.product?.units_per_carton || 12,
              observed: scenarioData.product?.units_per_carton || 12,
              confidence: 0.95,
              explanation: 'Standard packaging density verified.',
              evidence: []
            },
            variant_color: scenarioData.checks.variant_color,
            carton_damage: scenarioData.checks.damage,
            product_damage: scenarioData.checks.damage,
            water_damage: scenarioData.checks.damage,
            torn_packaging: scenarioData.checks.damage,
            missing_components: scenarioData.checks.missing_components
          }
        };
        setAiResult(simulatedReport);
        setActiveInspectionId(scenarioData.po.id);
        setAiRunning(false);
        return;
      }

      // 1. If inspection not created yet, create it now linking the evidence
      let insId = activeInspectionId;
      if (!insId) {
        const payload = {
          po_id: parseInt(selectedPoId, 10),
          dock_door: dockDoor,
          inspector_name: inspectorName,
          carrier_checkin_seal_intact: sealIntact,
          carrier_bol_match: bolMatch,
          temperature_reading_c: parseFloat(temperatureReading) || 20.5,
          notes: inspectorNotes || 'Receiving inspection initiated with evidence photography.',
          evidence_ids: uploadedEvidence.map(ev => ev.id),
          items: inspectionItems.map(it => ({
            sku: it.sku,
            item_name: it.item_name,
            sampled_quantity: parseInt(it.sampled_quantity, 10) || 1,
            passed_quantity: parseInt(it.passed_quantity, 10) || 1,
            defective_quantity: parseInt(it.defective_quantity, 10) || 0,
            defect_category: it.defect_category || null,
            status: it.status,
            notes: it.notes || '',
            product_id: it.product_id,
            po_line_item_id: it.po_line_item_id
          }))
        };
        const created = await inspectionsApi.create(payload);
        insId = created.id;
        setActiveInspectionId(insId);
      }

      // 2. Call the placeholder AI inspection service
      const res = await inspectionsApi.runAiInspection(insId);
      setAiResult(res);
    } catch (err) {
      console.error("AI Inspection error:", err);
      setError(err.response?.data?.detail || "AI Inspection service error.");
    } finally {
      setAiRunning(false);
    }
  };

  // Finalize Inspection
  const handleFinalize = async () => {
    try {
      setSubmittingFinal(true);
      let insId = activeInspectionId;

      if (!insId) {
        const payload = {
          po_id: parseInt(selectedPoId, 10),
          dock_door: dockDoor,
          inspector_name: inspectorName,
          carrier_checkin_seal_intact: sealIntact,
          carrier_bol_match: bolMatch,
          temperature_reading_c: parseFloat(temperatureReading) || 20.5,
          notes: inspectorNotes,
          evidence_ids: uploadedEvidence.map(ev => ev.id),
          items: inspectionItems
        };
        const created = await inspectionsApi.create(payload);
        insId = created.id;
      }

      await inspectionsApi.finalize(insId, {
        overall_disposition: disposition,
        notes: inspectorNotes || `Receiving inspection finalized with disposition: ${disposition}`
      });

      if (onInspectionCreated) onInspectionCreated();
      setActiveTab('inspections');
    } catch (err) {
      console.error("Finalize error:", err);
      setError(err.response?.data?.detail || "Failed to finalize inspection.");
    } finally {
      setSubmittingFinal(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Staged CUBE Demo Scenario Banner */}
      {scenarioData && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between text-xs gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded font-black text-[10px] bg-amber-200 text-amber-900 border border-amber-300 uppercase">
              CUBE Scenario #{scenarioData.number}
            </span>
            <span className="font-bold text-amber-950">{scenarioData.title}</span>
            <span className="text-amber-800 hidden md:inline text-[11px]">— {scenarioData.summary}</span>
          </div>
          <button
            type="button"
            onClick={() => setStep(3)}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 transition-colors"
          >
            Jump to Step 3 AI Check &rarr;
          </button>
        </div>
      )}

      {/* Wizard Progress Steps */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 transition-all ${step >= 1 ? 'text-white font-bold' : 'text-neutral-400'}`}
          >
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
              step === 1 ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-[0_0_12px_rgba(255,87,34,0.4)]' : 'bg-white/[0.08] text-neutral-300 border border-white/[0.1]'
            }`}>1</span>
            <span>PO & Shipment Manifest</span>
          </button>

          <div className={`w-12 h-px ${step >= 2 ? 'bg-orange-500/50' : 'bg-white/[0.08]'}`}></div>

          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 transition-all ${step >= 2 ? 'text-white font-bold' : 'text-neutral-400'}`}
          >
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
              step === 2 ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-[0_0_12px_rgba(255,87,34,0.4)]' : 'bg-white/[0.08] text-neutral-300 border border-white/[0.1]'
            }`}>2</span>
            <span>Receiving Evidence ({uploadedEvidence.length})</span>
          </button>

          <div className={`w-12 h-px ${step >= 3 ? 'bg-orange-500/50' : 'bg-white/[0.08]'}`}></div>

          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-2 transition-all ${step >= 3 ? 'text-white font-bold' : 'text-neutral-400'}`}
          >
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
              step === 3 ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-[0_0_12px_rgba(255,87,34,0.4)]' : 'bg-white/[0.08] text-neutral-300 border border-white/[0.1]'
            }`}>3</span>
            <span>Verification & AI Inspection</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: SELECT PURCHASE ORDER & SEE EXPECTED SHIPMENT */}
      {step === 1 && (
        <div className="space-y-6">
          <Card title="Step 1: Select Purchase Order" subtitle="Select inbound delivery and verify trailer details">
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-neutral-300 block mb-1.5">
                  Inbound Purchase Order Manifest
                </label>
                <select
                  value={selectedPoId}
                  onChange={(e) => {
                    const found = pos.find(p => p.id === parseInt(e.target.value, 10));
                    if (found) handleSelectPO(found);
                  }}
                  className="w-full text-xs font-bold border border-white/[0.1] rounded-xl px-3.5 py-2.5 bg-[#121217] text-white focus:border-orange-500 focus:outline-none"
                >
                  {pos.map(po => (
                    <option key={po.id} value={po.id} className="bg-[#121217] text-white">
                      {po.po_number} — {po.vendor_name} ({po.total_expected_units} units) [{po.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-neutral-300 block mb-1.5">Dock Door Assignment</label>
                  <select
                    value={dockDoor}
                    onChange={(e) => setDockDoor(e.target.value)}
                    className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white focus:border-orange-500 focus:outline-none font-medium"
                  >
                    <option className="bg-[#121217]">Dock Door 01 (Cold Dock)</option>
                    <option className="bg-[#121217]">Dock Door 02</option>
                    <option className="bg-[#121217]">Dock Door 03</option>
                    <option className="bg-[#121217]">Dock Door 04</option>
                    <option className="bg-[#121217]">Dock Door 05</option>
                    <option className="bg-[#121217]">Dock Door 06</option>
                    <option className="bg-[#121217]">Dock Door 07</option>
                    <option className="bg-[#121217]">Dock Door 08 (HazMat)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-neutral-300 block mb-1.5">Inspector Name & Badge</label>
                  <input
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white focus:border-orange-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Security seal checks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3.5 border border-white/[0.08] rounded-xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] hover:border-orange-500/30 transition-all">
                  <input
                    type="checkbox"
                    checked={sealIntact}
                    onChange={(e) => setSealIntact(e.target.checked)}
                    className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-white block">Trailer Bolt Seal Intact</span>
                    <span className="text-[11px] text-neutral-400">Seal verified before trailer door opening</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3.5 border border-white/[0.08] rounded-xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] hover:border-orange-500/30 transition-all">
                  <input
                    type="checkbox"
                    checked={bolMatch}
                    onChange={(e) => setBolMatch(e.target.checked)}
                    className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-white block">BOL Packing Slip Matches Digital PO</span>
                    <span className="text-[11px] text-neutral-400">Bill of Lading manifest verified</span>
                  </div>
                </label>
              </div>
            </div>
          </Card>

          {/* Expected Shipment Information Card */}
          {selectedPo && (
            <Card
              title="Expected Shipment Information"
              subtitle={`Supplier: ${selectedPo.vendor_name} • Carrier: ${selectedPo.carrier}`}
              noPadding
            >
              <div className="p-4 bg-white/[0.03] border-b border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-neutral-400 block text-[11px]">PO Number</span>
                  <span className="font-mono font-bold text-white">{selectedPo.po_number}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Carrier & Tracking</span>
                  <span className="font-bold text-white">{selectedPo.carrier}</span>
                  <span className="text-[10px] font-mono text-neutral-400 block">{selectedPo.tracking_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Total Expected Cartons</span>
                  <span className="font-black text-orange-400 text-sm">
                    {(selectedPo.line_items || []).reduce((acc, li) => acc + (li.expected_carton_count || 1), 0)} cartons
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Total Units</span>
                  <span className="font-black text-white text-sm">{selectedPo.total_expected_units} units</span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.03] text-neutral-400 font-bold border-b border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Expected Variant</th>
                      <th className="py-3 px-4 text-center">Units / Carton</th>
                      <th className="py-3 px-4 text-center">Expected Cartons</th>
                      <th className="py-3 px-4 text-right">Expected Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-neutral-300">
                    {selectedPo.line_items?.map((li) => (
                      <tr key={li.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-4 font-mono font-bold text-white">{li.sku}</td>
                        <td className="py-3 px-4 font-medium text-white">{li.item_name}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-orange-300 bg-orange-500/15 px-2.5 py-0.5 rounded-full border border-orange-500/30 text-[11px]">
                            {li.expected_variant || 'Standard'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-white">{li.expected_units_per_carton || 12}</td>
                        <td className="py-3 px-4 text-center font-bold text-orange-400">
                          {li.expected_carton_count || 1} ctns
                        </td>
                        <td className="py-3 px-4 text-right font-black text-white">{li.expected_qty} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-full text-xs font-extrabold shadow-[0_0_20px_rgba(255,87,34,0.4)] transition-all hover:scale-[1.02]"
            >
              <span>Proceed to Evidence Photography</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: RECEIVING EVIDENCE & MULTI-PHOTOGRAPH CAPTURE */}
      {step === 2 && (
        <div className="space-y-6">
          <Card
            title="Step 2: Upload Receiving Photographs"
            subtitle="Capture and categorize evidence across cartons, products, labels, packaging, and receiving dock"
            action={
              <button
                type="button"
                onClick={loadDemoReceivingPhotos}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-full text-xs font-bold shadow-[0_0_15px_rgba(255,87,34,0.35)] transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Load Demo Receiving Photos</span>
              </button>
            }
          >
            <div className="space-y-5 text-xs">
              {/* Category Selector Tabs */}
              <div>
                <label className="font-bold text-neutral-300 block mb-2 uppercase tracking-wider text-[11px]">
                  Select Evidence Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PHOTO_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedCategory === cat.id
                          ? 'border-orange-500 bg-orange-500/15 text-white font-bold shadow-[0_0_12px_rgba(255,87,34,0.25)]'
                          : 'border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-neutral-300'
                      }`}
                    >
                      <span className="block text-xs font-bold">{cat.label}</span>
                      <span className="text-[10px] text-neutral-400 font-normal line-clamp-1 mt-0.5">{cat.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFilesSelected(e.dataTransfer.files);
                }}
                className="border-2 border-dashed border-white/[0.12] hover:border-orange-500/50 rounded-2xl p-7 text-center bg-white/[0.02] hover:bg-white/[0.04] transition-all cursor-pointer group"
              >
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  ref={fileInputRef}
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                />

                <div className="w-12 h-12 bg-white/[0.06] rounded-full flex items-center justify-center mx-auto mb-2.5 text-orange-400 border border-white/[0.1] shadow-inner group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>

                <p className="font-extrabold text-white text-sm">
                  Click to browse or drag and drop photographs here
                </p>
                <p className="text-neutral-400 text-xs mt-1">
                  Tagging under: <strong className="text-orange-400">{selectedCategory}</strong> • Supports JPG, PNG, WEBP (max 15MB each)
                </p>
              </div>

              {/* Uploaded Photographs Gallery */}
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-white/[0.08] pb-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-orange-400" />
                    <h4 className="font-bold text-white text-xs">
                      Attached Receiving Evidence ({uploadedEvidence.length} photographs)
                    </h4>
                  </div>
                  {uploadedEvidence.length > 0 && (
                    <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      ✓ Ready for Inspection
                    </span>
                  )}
                </div>

                {uploadedEvidence.length === 0 ? (
                  <div className="p-8 text-center bg-white/[0.02] border border-white/[0.08] rounded-2xl text-neutral-400">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-neutral-500" />
                    <p className="font-medium">No receiving photographs attached yet.</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Upload packaging/product photos or click "Load Demo Receiving Photos" above.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {uploadedEvidence.map((ev, index) => (
                      <div
                        key={ev.id || index}
                        className="bg-[#121217] border border-white/[0.08] rounded-xl overflow-hidden shadow-lg group hover:border-orange-500/40 transition-all flex flex-col justify-between"
                      >
                        {/* Thumbnail Container */}
                        <div 
                          className="h-32 bg-black/40 relative overflow-hidden cursor-pointer"
                          onClick={() => setPreviewImage(ev.url || ev.file_path)}
                        >
                          <img
                            src={ev.url || ev.file_path}
                            alt={ev.file_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="h-full flex items-center justify-center text-neutral-500 text-xs">Image Preview</div>';
                            }}
                          />

                          {/* Category Tag */}
                          <div className="absolute top-2 left-2">
                            <span className="bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 shadow-xs">
                              {ev.category}
                            </span>
                          </div>

                          {/* Quick Zoom Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-5 h-5 drop-shadow" />
                          </div>
                        </div>

                        {/* File details & Remove */}
                        <div className="p-3 space-y-1.5">
                          <p className="font-bold text-white text-xs truncate" title={ev.file_name}>
                            {ev.file_name}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-neutral-400">
                            <span>{(ev.file_size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                            <span className="text-emerald-400 font-bold">Stored</span>
                          </div>

                          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setPreviewImage(ev.url || ev.file_path)}
                              className="text-[11px] font-bold text-orange-400 hover:text-orange-300"
                            >
                              Zoom In
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleRemoveEvidence(ev.id, e)}
                              className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-500/10 rounded transition-colors"
                              title="Remove photograph"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-white/[0.1] text-neutral-300 hover:text-white hover:bg-white/[0.05] rounded-full text-xs font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Shipment
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-full text-xs font-extrabold shadow-[0_0_20px_rgba(255,87,34,0.4)] transition-all hover:scale-[1.02]"
              >
                <span>Proceed to Inspection & AI Check</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 3: START INSPECTION & RUN AI INSPECTION */}
      {step === 3 && (
        <div className="space-y-6">
          {/* AI Inspection Card with Required Button */}
          <Card
            title="AI-Powered Receiving Inspection Service"
            subtitle="Trigger vision model pipeline to verify evidence photos against purchase order specifications"
          >
            <div className="p-5 bg-gradient-to-r from-orange-500/10 via-neutral-900 to-rose-500/10 border border-orange-500/25 rounded-2xl space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,87,34,0.4)] shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Computer Vision Inspection Pipeline</h4>
                    <p className="text-xs text-neutral-400">
                      Staged for: {uploadedEvidence.length} evidence photographs across {new Set(uploadedEvidence.map(e => e.category)).size} categories
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* The Required "Run AI Inspection" Button */}
                  <button
                    type="button"
                    onClick={handleRunAiInspection}
                    disabled={aiRunning || uploadedEvidence.length === 0}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-full text-xs font-extrabold shadow-[0_0_20px_rgba(255,87,34,0.45)] transition-all disabled:opacity-50"
                  >
                    <Sparkles className={`w-4 h-4 ${aiRunning ? 'animate-spin' : ''}`} />
                    <span>{aiRunning ? 'Connecting AI Pipeline...' : 'Run AI Inspection'}</span>
                  </button>

                  {/* Direct Link to Dedicated Inspection Results Page */}
                  {aiResult && (
                    <button
                      type="button"
                      onClick={() => {
                        if (setSelectedInspectionId) setSelectedInspectionId(aiResult.inspection_id || activeInspectionId);
                        if (setActiveTab) setActiveTab('inspection-results');
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.15] text-white rounded-full text-xs font-bold transition-all shadow-sm"
                    >
                      <FileText className="w-4 h-4 text-orange-400" />
                      <span>View Full Inspection Results Page</span>
                    </button>
                  )}
                </div>
              </div>

              {/* AI Inspection Audit Result (10-Check Evaluation) */}
              {aiResult && (
                <div className="pt-2">
                  <AIInspectionAuditView report={aiResult} />
                </div>
              )}
            </div>
          </Card>

          {/* Line Items Checklist & Defect Logging */}
          <Card
            title="Sampled Line Items Physical Findings"
            subtitle="Record sampled unit counts, defect classifications, and packaging integrity"
          >
            <div className="space-y-4 text-xs">
              {inspectionItems.map((item, index) => (
                <div key={item.sku} className="p-4 border border-white/[0.08] rounded-xl bg-white/[0.02] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-orange-400 mr-2">{item.sku}</span>
                      <span className="font-bold text-white text-xs">{item.item_name}</span>
                      <span className="ml-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/15 text-orange-300 border border-orange-500/30">
                        Variant: {item.expected_variant || 'Standard'}
                      </span>
                    </div>
                    <Badge status={item.status} size="xs" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-400 block mb-1">Expected PO Qty</span>
                      <span className="font-bold text-white">{item.expected_qty} units ({item.expected_carton_count} ctns)</span>
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Sample Count</label>
                      <input
                        type="number"
                        min="1"
                        value={item.sampled_quantity}
                        onChange={(e) => {
                          const copy = [...inspectionItems];
                          copy[index].sampled_quantity = parseInt(e.target.value, 10) || 1;
                          copy[index].passed_quantity = Math.max(0, copy[index].sampled_quantity - copy[index].defective_quantity);
                          setInspectionItems(copy);
                        }}
                        className="w-full border border-white/[0.1] bg-[#121217] text-white rounded-lg px-2.5 py-1.5 text-xs focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Defects Found</label>
                      <input
                        type="number"
                        min="0"
                        value={item.defective_quantity}
                        onChange={(e) => {
                          const def = parseInt(e.target.value, 10) || 0;
                          const copy = [...inspectionItems];
                          copy[index].defective_quantity = def;
                          copy[index].passed_quantity = Math.max(0, copy[index].sampled_quantity - def);
                          copy[index].status = def > 0 ? 'FLAGGED' : 'PASSED';
                          setInspectionItems(copy);
                        }}
                        className="w-full border border-white/[0.1] bg-[#121217] text-rose-400 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:border-orange-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-neutral-400 block mb-1">Defect Reason</label>
                      <select
                        value={item.defect_category}
                        onChange={(e) => {
                          const copy = [...inspectionItems];
                          copy[index].defect_category = e.target.value;
                          setInspectionItems(copy);
                        }}
                        className="w-full border border-white/[0.1] bg-[#121217] text-white rounded-lg px-2.5 py-1.5 text-xs focus:border-orange-500 focus:outline-none"
                      >
                        <option value="" className="bg-[#121217]">None / Clean</option>
                        <option value="CRUSHED_BOX" className="bg-[#121217]">Crushed / Torn Carton</option>
                        <option value="WATER_DAMAGE" className="bg-[#121217]">Moisture / Water Stain</option>
                        <option value="LABEL_MISMATCH" className="bg-[#121217]">Barcode Unreadable</option>
                        <option value="EXPIRY_PASSED" className="bg-[#121217]">Expired Date Code</option>
                        <option value="BROKEN_SEAL" className="bg-[#121217]">Broken Tamper Tape</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {/* Disposition & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="font-bold text-neutral-300 block mb-1.5">Cargo Temp Reading (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperatureReading}
                    onChange={(e) => setTemperatureReading(e.target.value)}
                    className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] text-white focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-neutral-300 block mb-1.5">Final Quality Disposition</label>
                  <select
                    value={disposition}
                    onChange={(e) => setDisposition(e.target.value)}
                    className="w-full border border-white/[0.1] rounded-xl p-2.5 bg-[#121217] font-bold text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="ACCEPTED" className="bg-[#121217]">ACCEPTED (Clear for Putaway)</option>
                    <option value="ACCEPTED_WITH_EXCEPTIONS" className="bg-[#121217]">ACCEPTED WITH EXCEPTIONS</option>
                    <option value="QUARANTINED" className="bg-[#121217]">QUARANTINED (Hold in QA Bay)</option>
                    <option value="REJECTED" className="bg-[#121217]">REJECTED (Refuse Delivery)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-neutral-300 block mb-1.5">Inspector Log & Observation Notes</label>
                <textarea
                  rows="2"
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  placeholder="Receiving findings, trailer condition, packaging remarks..."
                  className="w-full border border-white/[0.1] rounded-xl p-3 bg-[#121217] text-white placeholder-neutral-500 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-white/[0.1] text-neutral-300 hover:text-white hover:bg-white/[0.05] rounded-full text-xs font-bold transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Evidence
              </button>

              <button
                type="button"
                onClick={handleFinalize}
                disabled={submittingFinal}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white rounded-full text-xs font-extrabold shadow-[0_0_20px_rgba(255,87,34,0.4)] transition-all disabled:opacity-50 hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submittingFinal ? 'Finalizing Inspection...' : 'Finalize & Record Inspection'}</span>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <Modal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        title="Receiving Evidence Photograph Zoom"
        maxWidth="max-w-4xl"
      >
        <div className="flex items-center justify-center p-2 bg-slate-900 rounded-lg overflow-hidden">
          <img
            src={previewImage}
            alt="Evidence preview"
            className="max-h-[70vh] object-contain rounded"
          />
        </div>
      </Modal>
    </div>
  );
}
