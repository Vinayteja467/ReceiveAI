import React, { useEffect, useState } from 'react';
import { 
  PackageCheck, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  UserCheck, 
  TrendingUp, 
  ArrowRight, 
  Truck, 
  Building2, 
  Calendar, 
  Box, 
  ShieldAlert, 
  Layers, 
  DoorOpen, 
  Clock, 
  Filter, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Droplets,
  Scissors
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { dashboardApi } from '../services/api';

const ISSUE_ICONS = {
  'Short shipment': Box,
  'Wrong SKU': Layers,
  'Wrong variant': Layers,
  'Crushed carton': Box,
  'Water damage': Droplets,
  'Torn packaging': Scissors,
  'Missing components': AlertTriangle,
};

export default function DashboardPage({ setActiveTab, setSelectedInspectionId, onNavigateWithFilter }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredTrendDay, setHoveredTrendDay] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getMetrics();
      setData(res);
      setError(null);
    } catch (err) {
      console.error("Dashboard metrics error:", err);
      setError("Unable to load receiving operations telemetry.");
    } finally {
      setLoading(false);
    }
  };

  const handleMetricClick = (tab, filterValue) => {
    if (onNavigateWithFilter) {
      onNavigateWithFilter(tab, filterValue);
    } else if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-28 bg-slate-200/60 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
          <div className="lg:col-span-7 h-72 bg-slate-200/60 rounded-xl"></div>
          <div className="lg:col-span-5 h-72 bg-slate-200/60 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-rose-200 text-rose-700 max-w-2xl mx-auto space-y-3">
        <AlertTriangle className="w-8 h-8 mx-auto text-rose-500" />
        <h3 className="font-bold text-base">Receiving Telemetry Unavailable</h3>
        <p className="text-xs text-slate-600">{error || "Failed to load dashboard metrics."}</p>
        <button 
          onClick={loadDashboard}
          className="px-4 py-2 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-2xs"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { metrics, inspection_trend, issue_breakdown, recent_inspections, supplier_statistics, dock_doors } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Dashboard Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/[0.08] text-white border border-white/[0.1]">
              Warehouse DFW-04
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316]"></span>
              Inbound Dock Shift A
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight mt-1.5 flex items-center gap-2">
            <span>Receiving Manager</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-rose-400 to-red-500">
              Operations Dashboard
            </span>
          </h1>
          <p className="text-xs text-neutral-400">
            Real-time inbound shipment verification, first-pass yield, and exception management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('new-inspection')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 via-rose-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white text-xs font-extrabold rounded-full shadow-[0_0_25px_rgba(255,87,34,0.4)] transition-all hover:scale-[1.02]"
          >
            <Truck className="w-4 h-4" />
            <span>New Inbound Inspection</span>
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          1. FIVE CORE RECEIVING METRIC CARDS (INTERACTIVE & CLICKABLE)
          Clicking any metric navigates to the relevant filtered inspection list.
         ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Total Inspections */}
        <button
          type="button"
          onClick={() => handleMetricClick('inspections', 'ALL')}
          className="text-left bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] hover:border-orange-500/50 hover:shadow-[0_0_20px_rgba(255,87,34,0.15)] rounded-2xl p-5 transition-all duration-200 group relative overflow-hidden focus:outline-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Total Inspections
            </span>
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-red-600 group-hover:text-white transition-all shadow-inner">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white group-hover:text-orange-300 transition-colors">
              {metrics.total_inspections}
            </span>
            <span className="text-[11px] text-neutral-400 font-medium">shipments</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400">
            <span>All inbound receipts</span>
            <span className="font-bold text-orange-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              View All &rarr;
            </span>
          </div>
        </button>

        {/* Metric 2: Accepted */}
        <button
          type="button"
          onClick={() => handleMetricClick('inspections', 'PASSED')}
          className="text-left bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] rounded-2xl p-5 transition-all duration-200 group relative overflow-hidden focus:outline-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Accepted
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {metrics.accepted}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              {metrics.first_pass_yield_pct}% FPY
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-emerald-400">
            <span>Cleared for putaway</span>
            <span className="font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Filter List &rarr;
            </span>
          </div>
        </button>

        {/* Metric 3: Exceptions */}
        <button
          type="button"
          onClick={() => handleMetricClick('exceptions', 'OPEN')}
          className="text-left bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] rounded-2xl p-5 transition-all duration-200 group relative overflow-hidden focus:outline-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
              Exceptions
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:bg-rose-600 group-hover:text-white transition-all shadow-inner">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {metrics.exceptions}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
              Active Holds
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-rose-400">
            <span>Damaged / Discrepancies</span>
            <span className="font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              View Active &rarr;
            </span>
          </div>
        </button>

        {/* Metric 4: Uncertain */}
        <button
          type="button"
          onClick={() => handleMetricClick('inspections', 'UNCERTAIN')}
          className="text-left bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] rounded-2xl p-5 transition-all duration-200 group relative overflow-hidden focus:outline-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Uncertain
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-inner">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {metrics.uncertain}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Zero-Guessing
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-amber-400">
            <span>Awaiting unboxed photos</span>
            <span className="font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Audit Flags &rarr;
            </span>
          </div>
        </button>

        {/* Metric 5: Open Reviews */}
        <button
          type="button"
          onClick={() => handleMetricClick('exceptions', 'MANUAL_REVIEW')}
          className="text-left bg-[#0e0e13]/85 backdrop-blur-xl border border-white/[0.08] hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] rounded-2xl p-5 transition-all duration-200 group relative overflow-hidden focus:outline-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
              Open Reviews
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {metrics.open_reviews}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
              QA Escalations
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-purple-400">
            <span>Supervisor sign-offs</span>
            <span className="font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Review Now &rarr;
            </span>
          </div>
        </button>

      </div>

      {/* -------------------------------------------------------------
          2. TWO-COLUMN SPLIT:
             - LEFT: Inbound Inspection Trend (7-Day Throughput Bar Chart)
             - RIGHT: Receiving Issue Breakdown (Non-Conformance Analysis)
         ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Module A: Inspection Trend */}
        <div className="lg:col-span-7">
          <Card
            title="Inbound Inspection Trend"
            subtitle="7-day receiving throughput & verification disposition volume"
            action={
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span> Accepted
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185]"></span> Exceptions
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"></span> Uncertain
                </span>
              </div>
            }
          >
            <div className="space-y-4 pt-2">
              {/* Multi-Bar Daily Chart Canvas */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-44 pb-2 border-b border-white/[0.08]">
                {inspection_trend.map((pt, idx) => {
                  const maxTotal = 25;
                  const acceptedHeight = (pt.accepted / maxTotal) * 100;
                  const exceptionsHeight = (pt.exceptions / maxTotal) * 100;
                  const uncertainHeight = (pt.uncertain / maxTotal) * 100;

                  return (
                    <div 
                      key={pt.date} 
                      className="flex flex-col items-center h-full justify-end group relative"
                      onMouseEnter={() => setHoveredTrendDay(pt)}
                      onMouseLeave={() => setHoveredTrendDay(null)}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 bg-neutral-900 border border-white/[0.1] text-white text-[10px] py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl">
                        <span className="font-bold text-orange-400">{pt.date}</span>: {pt.total} recpts ({pt.fpy_pct}% pass)
                      </div>

                      {/* Stacked Bar Visual */}
                      <div className="w-full max-w-[36px] bg-white/[0.04] border border-white/[0.06] rounded-t-xl overflow-hidden flex flex-col justify-end p-0.5 gap-0.5 h-full">
                        {/* Uncertain Portion */}
                        {pt.uncertain > 0 && (
                          <div 
                            className="w-full bg-amber-400 rounded-xs transition-all duration-300"
                            style={{ height: `${Math.max(6, uncertainHeight)}%` }}
                            title={`Uncertain: ${pt.uncertain}`}
                          ></div>
                        )}
                        {/* Exceptions Portion */}
                        {pt.exceptions > 0 && (
                          <div 
                            className="w-full bg-rose-500 rounded-xs transition-all duration-300"
                            style={{ height: `${Math.max(8, exceptionsHeight)}%` }}
                            title={`Exceptions: ${pt.exceptions}`}
                          ></div>
                        )}
                        {/* Accepted Portion */}
                        <div 
                          className="w-full bg-emerald-500 rounded-xs transition-all duration-300 group-hover:bg-emerald-400"
                          style={{ height: `${Math.max(12, acceptedHeight)}%` }}
                          title={`Accepted: ${pt.accepted}`}
                        ></div>
                      </div>

                      {/* Day Label */}
                      <span className="text-[10px] font-bold text-neutral-400 mt-2">
                        {pt.day}
                      </span>
                      <span className="text-[9px] text-neutral-500 font-mono">
                        {pt.total}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Summary Bar */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Weekly Volume</span>
                  <span className="font-extrabold text-white mt-0.5 block">
                    {inspection_trend.reduce((acc, p) => acc + p.total, 0)} shipments
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Weekly Compliance</span>
                  <span className="font-extrabold text-emerald-300 mt-0.5 block">
                    {roundPercentage(
                      inspection_trend.reduce((acc, p) => acc + p.accepted, 0) /
                      (inspection_trend.reduce((acc, p) => acc + p.total, 0) || 1) * 100
                    )}%
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Dock Turnaround</span>
                  <span className="font-extrabold text-white mt-0.5 block">38 min avg</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Module B: Issue Breakdown */}
        <div className="lg:col-span-5">
          <Card
            title="Receiving Issue Breakdown"
            subtitle="Frequency & severity distribution across 7 failure modes"
            action={
              <button
                type="button"
                onClick={() => handleMetricClick('exceptions', 'ALL')}
                className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
              >
                Exceptions Log &rarr;
              </button>
            }
          >
            <div className="space-y-2.5 pt-1">
              {issue_breakdown.map((item) => {
                const IconComponent = ISSUE_ICONS[item.issue] || AlertTriangle;
                return (
                  <div 
                    key={item.issue}
                    onClick={() => handleMetricClick('exceptions', 'ALL')}
                    className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-orange-500/40 hover:bg-white/[0.04] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-3.5 h-3.5 text-neutral-400 group-hover:text-orange-400 transition-colors" />
                        <span className="font-bold text-white">{item.issue}</span>
                        <span className="text-[10px] text-neutral-500 hidden sm:inline">
                          ({item.category})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          item.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {item.severity}
                        </span>
                        <span className="font-bold text-white text-xs w-6 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>

                    {/* Progress Fill Bar */}
                    <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.severity === 'CRITICAL' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                        }`}
                        style={{ width: `${Math.max(8, item.percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

      </div>

      {/* -------------------------------------------------------------
          3. SUPPLIER-RELATED INSPECTION STATISTICS (Vendor Scorecard)
         ------------------------------------------------------------- */}
      <Card
        title="Supplier-Related Inspection Statistics"
        subtitle="Inbound vendor delivery quality, first-pass acceptance rates, and primary non-conformances"
        action={
          <span className="text-xs font-bold text-neutral-400">
            {supplier_statistics.length} Monitored Suppliers
          </span>
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-neutral-400 font-bold border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5">Supplier Name</th>
                <th className="py-3.5 px-5">Receipts Inspected</th>
                <th className="py-3.5 px-5">Acceptance Rate</th>
                <th className="py-3.5 px-5">Exceptions Logged</th>
                <th className="py-3.5 px-5">Uncertain Flags</th>
                <th className="py-3.5 px-5">Primary Non-Conformance</th>
                <th className="py-3.5 px-5 text-right">Vendor Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-neutral-300">
              {supplier_statistics.map((sup) => (
                <tr key={sup.supplier_id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-white text-sm">{sup.supplier_name}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">{sup.contact_name} &bull; {sup.email}</div>
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-neutral-200">
                    {sup.total_inspections} shipments
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        sup.pass_rate_pct >= 90 ? 'text-emerald-400' :
                        sup.pass_rate_pct >= 80 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {sup.pass_rate_pct}%
                      </span>
                      <div className="w-16 bg-white/[0.08] rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            sup.pass_rate_pct >= 90 ? 'bg-emerald-500' :
                            sup.pass_rate_pct >= 80 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${sup.pass_rate_pct}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    {sup.exceptions_count > 0 ? (
                      <span className="font-bold text-rose-300 bg-rose-500/15 px-2.5 py-0.5 rounded-full border border-rose-500/30">
                        {sup.exceptions_count} exceptions
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">0 clean</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    {sup.uncertain_count > 0 ? (
                      <span className="font-bold text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        {sup.uncertain_count} flags
                      </span>
                    ) : (
                      <span className="text-neutral-500">0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 font-medium text-neutral-300">
                    {sup.top_issue}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      sup.tier === 'Tier 1 Preferred' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                      sup.tier === 'Under QA Watch' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' :
                      'bg-white/[0.05] text-neutral-300 border border-white/[0.1]'
                    }`}>
                      {sup.tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* -------------------------------------------------------------
          4. RECENT INBOUND INSPECTIONS TABLE (Live Receiving Floor Audit Feed)
         ------------------------------------------------------------- */}
      <Card
        title="Recent Inbound Inspections"
        subtitle="Live feed of receiving dock audits, AI verdicts, and disposition releases"
        action={
          <button
            type="button"
            onClick={() => handleMetricClick('inspections', 'ALL')}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
          >
            All Inspections ({metrics.total_inspections}) &rarr;
          </button>
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-neutral-400 font-bold border-b border-white/[0.08]">
              <tr>
                <th className="py-3.5 px-5">Inspection #</th>
                <th className="py-3.5 px-5">PO & Supplier</th>
                <th className="py-3.5 px-5">Dock Bay</th>
                <th className="py-3.5 px-5">Sampling Volume</th>
                <th className="py-3.5 px-5">Disposition Verdict</th>
                <th className="py-3.5 px-5">Executed At</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-neutral-300">
              {recent_inspections.map((ins) => {
                const isPass = ins.overall_disposition === 'ACCEPTED' || ins.status === 'PASSED';
                const isFail = ins.overall_disposition === 'EXCEPTION' || ins.status === 'FLAGGED';
                const isUncertain = ins.overall_disposition === 'UNCERTAIN' || ins.status === 'FLAGGED_FOR_REVIEW';

                return (
                  <tr key={ins.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-white">
                      {ins.inspection_number}
                    </td>

                    <td className="py-3.5 px-5">
                      <div className="font-bold text-white text-sm">{ins.po_number}</div>
                      <div className="text-[11px] text-neutral-400 truncate max-w-[200px] mt-0.5">{ins.vendor_name}</div>
                    </td>

                    <td className="py-3.5 px-5 text-neutral-300 font-medium">
                      {ins.dock_door}
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="font-bold text-white">{ins.total_items_inspected} units</span>
                      <span className="text-[11px] text-neutral-400 block mt-0.5">
                        {ins.defects_count > 0 ? `${ins.defects_count} defects` : '0 defects'}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      {isPass && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ACCEPTED
                        </span>
                      )}
                      {isFail && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> EXCEPTION
                        </span>
                      )}
                      {isUncertain && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> UNCERTAIN
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-5 text-neutral-400 whitespace-nowrap">
                      {new Date(ins.completed_at || ins.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (setSelectedInspectionId) setSelectedInspectionId(ins.id);
                          setActiveTab('inspection-results');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-orange-400 hover:text-white bg-white/[0.04] hover:bg-orange-500/20 border border-white/[0.08] hover:border-orange-500/30 rounded-full transition-all"
                      >
                        <span>Audit Results</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* -------------------------------------------------------------
          5. DOCK BAY LIVE TELEMETRY (8-BAY RECEIVING GATES)
         ------------------------------------------------------------- */}
      <Card
        title="Dock Bay Operational Telemetry"
        subtitle="Real-time status of all 8 designated inbound freight unloading gates"
        action={
          <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse"></span>
            8 Active Gates Monitored
          </span>
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {dock_doors.map((door) => {
            const isOcc = door.status !== 'AVAILABLE';
            return (
              <div 
                key={door.door} 
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  door.status === 'INSPECTING' 
                    ? 'border-orange-500/40 bg-orange-500/10 shadow-[0_0_15px_rgba(255,87,34,0.15)]' 
                    : door.status === 'OCCUPIED'
                    ? 'border-sky-500/30 bg-sky-500/10'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-neutral-300">
                  <DoorOpen className="w-3.5 h-3.5 text-orange-400" />
                  <span>
                    {door.door.replace('Dock Door ', 'Bay ').replace(' (Cold Dock)', ' [Cold]').replace(' (HazMat)', ' [Haz]')}
                  </span>
                </div>

                <div className="my-2.5">
                  <Badge status={door.status} size="xs" />
                </div>

                {isOcc ? (
                  <div className="text-[10px] text-neutral-300 truncate">
                    <p className="font-bold text-white truncate">{door.po_number}</p>
                    <p className="text-neutral-400 truncate">{door.carrier?.split(' ')[0]}</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-neutral-500 italic">Clear to Dock</p>
                )}
              </div>
            );
          })}
        </div>
      </Card>

    </div>
  );
}

function roundPercentage(num) {
  return Math.round(num * 10) / 10;
}
