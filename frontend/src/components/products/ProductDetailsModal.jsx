import React, { useState } from 'react';
import { 
  X, 
  Package, 
  Barcode, 
  Scale, 
  Ruler, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  ThermometerSnowflake, 
  AlertOctagon, 
  ShieldAlert,
  Boxes,
  ClipboardList
} from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';

export default function ProductDetailsModal({ product, isOpen, onClose, onInspect }) {
  if (!product) return null;

  // Parse required components (can be JSON array or comma separated)
  let componentsList = [];
  try {
    if (product.required_components) {
      if (product.required_components.startsWith('[')) {
        componentsList = JSON.parse(product.required_components);
      } else {
        componentsList = product.required_components.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
  } catch (e) {
    componentsList = [product.required_components];
  }

  // Component verification checklist state
  const [checkedComponents, setCheckedComponents] = useState({});

  const toggleComponent = (idx) => {
    setCheckedComponents(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Product Specification: ${product.sku}`}
      subtitle={`${product.category} • Variant: ${product.variant || 'Standard'}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6 text-xs">
        {/* Top Hero Section: Reference Image & Core Info */}
        <div className="flex flex-col sm:flex-row gap-5 p-4 bg-slate-50 border border-slate-200 rounded-xl items-start">
          {/* Reference Image Container */}
          <div className="w-full sm:w-48 h-48 bg-white rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative group shadow-2xs">
            {product.reference_image ? (
              <img
                src={product.reference_image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="text-slate-400 text-center p-4"><svg class="w-10 h-10 mx-auto mb-1 stroke-1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg><span class="text-[10px]">Photo Reference</span></div>';
                }}
              />
            ) : (
              <div className="text-slate-400 text-center p-4">
                <Package className="w-10 h-10 mx-auto mb-1 stroke-1" />
                <span className="text-[10px]">No Reference Image</span>
              </div>
            )}
            <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
              Ref Visual
            </div>
          </div>

          {/* Core Info */}
          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                {product.sku}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Variant: {product.variant || 'Standard'}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {product.units_per_carton || 12} units / carton
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {product.name}
            </h3>

            <p className="text-slate-600 leading-relaxed text-xs">
              {product.description || 'No description provided.'}
            </p>

            {/* Special Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.is_temperature_controlled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                  <ThermometerSnowflake className="w-3 h-3" /> Cold Chain (2-8°C)
                </span>
              )}
              {product.is_fragile && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <AlertTriangle className="w-3 h-3" /> Fragile Handling
                </span>
              )}
              {product.is_hazardous && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertOctagon className="w-3 h-3" /> HazMat Regulated
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Required Components Checklist (Crucial for receiving verification) */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <ClipboardList className="w-4 h-4 text-indigo-600" />
              Required Components Verification ({componentsList.length} items)
            </h4>
            <span className="text-[11px] text-slate-500">
              Check off components during receiving sample
            </span>
          </div>

          {componentsList.length === 0 ? (
            <p className="text-slate-400 italic">No component sub-assemblies specified.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {componentsList.map((comp, idx) => {
                const isChecked = !!checkedComponents[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleComponent(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                      isChecked
                        ? 'border-emerald-300 bg-emerald-50/60 text-emerald-900 font-semibold'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xs">{comp}</span>
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isChecked ? 'text-emerald-600 fill-emerald-100' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Packaging & Carton Master Data */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
          <h4 className="font-bold text-slate-800 text-xs mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <Boxes className="w-4 h-4 text-indigo-600" />
            Packaging & Master Carton Specifications
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Units / Master Carton</span>
              <span className="font-bold text-slate-900 text-sm">{product.units_per_carton || 12} units</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Packaging Type</span>
              <span className="font-semibold text-slate-800 text-xs truncate block">{product.packaging_type}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Weight / Dimensions</span>
              <span className="font-semibold text-slate-800 text-xs block">{product.weight_kg} kg • {product.dimensions_cm} cm</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 block text-[11px]">UPC / EAN Barcode</span>
              <span className="font-mono font-medium text-slate-800 text-xs block truncate">{product.barcode || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* AQL Quality & Inspection Rules */}
        <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              AQL Sampling Standard & Receiving Protocol
            </h4>
            <div className="flex gap-2">
              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[11px] font-bold border border-indigo-100">
                Sample Rate: {product.sampling_rate_pct}%
              </span>
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-100">
                Tolerance: ≤ {product.acceptable_defect_tolerance_pct}%
              </span>
            </div>
          </div>

          <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs leading-relaxed">
            {product.inspection_notes || 'Standard dock visual inspection and seal verification.'}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
