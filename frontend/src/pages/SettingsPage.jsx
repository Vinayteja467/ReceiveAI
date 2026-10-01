import React, { useState, useEffect } from 'react';
import { Settings2, Save, CheckCircle2, ShieldCheck, Warehouse, Sliders, BellRing } from 'lucide-react';
import Card from '../components/common/Card';
import { settingsApi } from '../services/api';

export default function SettingsPage() {
  const [config, setConfig] = useState({
    facility_code: 'WH-DFW-04',
    dock_doors_total: 8,
    default_sampling_pct: 10.0,
    auto_quarantine_damaged: true,
    temperature_variance_tolerance_c: 2.0,
    strict_barcode_check: true,
    require_seal_photo: true
  });
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsApi.get();
      if (data && data.config) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await settingsApi.update({
        assigned_facility_code: config.facility_code,
        dock_doors_total: parseInt(config.dock_doors_total, 10),
        default_sampling_pct: parseFloat(config.default_sampling_pct),
        auto_quarantine_damaged: config.auto_quarantine_damaged,
        temperature_variance_tolerance_c: parseFloat(config.temperature_variance_tolerance_c),
        strict_barcode_check: config.strict_barcode_check,
        require_seal_photo: config.require_seal_photo
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save settings.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Warehouse inspection thresholds and dock configuration updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Facility & Dock Layout */}
        <Card title="Facility & Inbound Dock Allocation" subtitle="Operational cross-dock parameters">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Facility Identifier Code</label>
              <input
                type="text"
                value={config.facility_code}
                onChange={e => setConfig({...config, facility_code: e.target.value})}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Assigned logistics node ID</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Active Receiving Dock Bays</label>
              <input
                type="number"
                min="1"
                max="32"
                value={config.dock_doors_total}
                onChange={e => setConfig({...config, dock_doors_total: parseInt(e.target.value, 10) || 8})}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Inbound trailer bays monitored in real-time</span>
            </div>
          </div>
        </Card>

        {/* Quality Tolerances */}
        <Card title="AQL Inspection & Tolerance Controls" subtitle="Sampling thresholds for inbound goods inspection">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default AQL Sampling Rate (%)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="100"
                value={config.default_sampling_pct}
                onChange={e => setConfig({...config, default_sampling_pct: parseFloat(e.target.value) || 10.0})}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default percentage of units drawn per line item</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Cold Chain Temp Variance Tolerance (±°C)</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="5.0"
                value={config.temperature_variance_tolerance_c}
                onChange={e => setConfig({...config, temperature_variance_tolerance_c: parseFloat(e.target.value) || 2.0})}
                className="w-full border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Allowable variance from target storage range</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.auto_quarantine_damaged}
                onChange={e => setConfig({...config, auto_quarantine_damaged: e.target.checked})}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Auto-Quarantine On Severe Carton Damage</span>
                <span className="text-[11px] text-slate-500">Automatically place shipment in hold status if critical packaging crush is found</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.strict_barcode_check}
                onChange={e => setConfig({...config, strict_barcode_check: e.target.checked})}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Strict Barcode Scan Verification</span>
                <span className="text-[11px] text-slate-500">Require exact 1D/2D barcode match before allowing line item acceptance</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.require_seal_photo}
                onChange={e => setConfig({...config, require_seal_photo: e.target.checked})}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Mandatory Trailer Seal Photographic Proof</span>
                <span className="text-[11px] text-slate-500">Require photo proof of intact bolt seal before opening trailer doors</span>
              </div>
            </label>
          </div>
        </Card>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
