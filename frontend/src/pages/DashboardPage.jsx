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
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
              Warehouse DFW-04
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Inbound Dock Shift A
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Receiving Manager Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Real-time inbound shipment verification, first-pass yield, and exception management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('new-inspection')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
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
          className="text-left bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md rounded-xl p-4 transition-all duration-150 group relative overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Inspections
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {metrics.total_inspections}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">shipments</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>All inbound receipts</span>
            <span className="font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              View All &rarr;
            </span>
          </div>
        </button>

        {/* Metric 2: Accepted */}
        <button
          type="button"
          onClick={() => handleMetricClick('inspections', 'PASSED')}
          className="text-left bg-white border border-emerald-200/90 hover:border-emerald-500 hover:shadow-md rounded-xl p-4 transition-all duration-150 group relative overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Accepted
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">
              {metrics.accepted}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {metrics.first_pass_yield_pct}% FPY
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-700">
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
          className="text-left bg-white border border-rose-200/90 hover:border-rose-500 hover:shadow-md rounded-xl p-4 transition-all duration-150 group relative overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-rose-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
              Exceptions
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700">
              {metrics.exceptions}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
              Active Holds
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-rose-100 flex items-center justify-between text-[11px] text-rose-700">
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
          className="text-left bg-white border border-amber-200/90 hover:border-amber-500 hover:shadow-md rounded-xl p-4 transition-all duration-150 group relative overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-amber-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
              Uncertain
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">
              {metrics.uncertain}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Zero-Guessing
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-amber-800">
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
          className="text-left bg-white border border-indigo-200/90 hover:border-indigo-500 hover:shadow-md rounded-xl p-4 transition-all duration-150 group relative overflow-hidden focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900">
              Open Reviews
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-800">
              {metrics.open_reviews}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
              QA Escalations
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-purple-100 flex items-center justify-between text-[11px] text-purple-700">
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
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Accepted
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Exceptions
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Uncertain
                </span>
              </div>
            }
          >
            <div className="space-y-4 pt-2">
              {/* Multi-Bar Daily Chart Canvas */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-44 pb-2 border-b border-slate-100">
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
                      <div className="absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                        <span className="font-bold">{pt.date}</span>: {pt.total} recpts ({pt.fpy_pct}% pass)
                      </div>

                      {/* Stacked Bar Visual */}
                      <div className="w-full max-w-[36px] bg-slate-100 rounded-t-lg overflow-hidden flex flex-col justify-end p-0.5 gap-0.5 h-full">
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
                          className="w-full bg-emerald-500 rounded-xs transition-all duration-300 group-hover:bg-emerald-600"
                          style={{ height: `${Math.max(12, acceptedHeight)}%` }}
                          title={`Accepted: ${pt.accepted}`}
                        ></div>
                      </div>

                      {/* Day Label */}
                      <span className="text-[10px] font-bold text-slate-600 mt-2">
                        {pt.day}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {pt.total}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Summary Bar */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Weekly Volume</span>
                  <span className="font-bold text-slate-800">
                    {inspection_trend.reduce((acc, p) => acc + p.total, 0)} shipments
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Weekly Compliance</span>
                  <span className="font-bold text-emerald-800">
                    {roundPercentage(
                      inspection_trend.reduce((acc, p) => acc + p.accepted, 0) /
                      (inspection_trend.reduce((acc, p) => acc + p.total, 0) || 1) * 100
                    )}%
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Dock Turnaround</span>
                  <span className="font-bold text-slate-800">38 min avg</span>
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
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Exceptions Log &rarr;
              </button>
            }
          >
            <div className="space-y-3 pt-1">
              {issue_breakdown.map((item) => {
                const IconComponent = ISSUE_ICONS[item.issue] || AlertTriangle;
                return (
                  <div 
                    key={item.issue}
                    onClick={() => handleMetricClick('exceptions', 'ALL')}
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                        <span className="font-bold text-slate-800">{item.issue}</span>
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          ({item.category})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                          item.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                        }`}>
                          {item.severity}
                        </span>
                        <span className="font-bold text-slate-900 text-xs w-6 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>

                    {/* Progress Fill Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-500'
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
          <span className="text-xs font-semibold text-slate-500">
            {supplier_statistics.length} Monitored Suppliers
          </span>
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">Receipts Inspected</th>
                <th className="py-3 px-4">Acceptance Rate</th>
                <th className="py-3 px-4">Exceptions Logged</th>
                <th className="py-3 px-4">Uncertain Flags</th>
                <th className="py-3 px-4">Primary Non-Conformance</th>
                <th className="py-3 px-4 text-right">Vendor Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {supplier_statistics.map((sup) => (
                <tr key={sup.supplier_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{sup.supplier_name}</div>
                    <div className="text-[11px] text-slate-500">{sup.contact_name} &bull; {sup.email}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {sup.total_inspections} shipments
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        sup.pass_rate_pct >= 90 ? 'text-emerald-700' :
                        sup.pass_rate_pct >= 80 ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {sup.pass_rate_pct}%
                      </span>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
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
                  <td className="py-3 px-4">
                    {sup.exceptions_count > 0 ? (
                      <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {sup.exceptions_count} exceptions
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-medium">0 clean</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {sup.uncertain_count > 0 ? (
                      <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {sup.uncertain_count} flags
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {sup.top_issue}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      sup.tier === 'Tier 1 Preferred' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      sup.tier === 'Under QA Watch' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                      'bg-slate-100 text-slate-700 border border-slate-200'
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
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            All Inspections ({metrics.total_inspections}) &rarr;
          </button>
        }
        noPadding
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Inspection #</th>
                <th className="py-3 px-4">PO & Supplier</th>
                <th className="py-3 px-4">Dock Bay</th>
                <th className="py-3 px-4">Sampling Volume</th>
                <th className="py-3 px-4">Disposition Verdict</th>
                <th className="py-3 px-4">Executed At</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recent_inspections.map((ins) => {
                const isPass = ins.overall_disposition === 'ACCEPTED' || ins.status === 'PASSED';
                const isFail = ins.overall_disposition === 'EXCEPTION' || ins.status === 'FLAGGED';
                const isUncertain = ins.overall_disposition === 'UNCERTAIN' || ins.status === 'FLAGGED_FOR_REVIEW';

                return (
                  <tr key={ins.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {ins.inspection_number}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{ins.po_number}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{ins.vendor_name}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {ins.dock_door}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{ins.total_items_inspected} units</span>
                      <span className="text-[11px] text-slate-400 block">
                        {ins.defects_count > 0 ? `${ins.defects_count} defects` : '0 defects'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {isPass && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ACCEPTED
                        </span>
                      )}
                      {isFail && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> EXCEPTION
                        </span>
                      )}
                      {isUncertain && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <HelpCircle className="w-3 h-3 text-amber-600" /> UNCERTAIN
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(ins.completed_at || ins.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          if (setSelectedInspectionId) setSelectedInspectionId(ins.id);
                          setActiveTab('inspection-results');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
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
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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
                className={`p-3 rounded-xl border text-center transition-all ${
                  door.status === 'INSPECTING' 
                    ? 'border-indigo-300 bg-indigo-50/60 shadow-2xs' 
                    : door.status === 'OCCUPIED'
                    ? 'border-sky-300 bg-sky-50/60 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-700">
                  <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {door.door.replace('Dock Door ', 'Bay ').replace(' (Cold Dock)', ' [Cold]').replace(' (HazMat)', ' [Haz]')}
                  </span>
                </div>

                <div className="my-2">
                  <Badge status={door.status} size="xs" />
                </div>

                {isOcc ? (
                  <div className="text-[10px] text-slate-600 truncate">
                    <p className="font-semibold text-slate-800 truncate">{door.po_number}</p>
                    <p className="text-slate-500 truncate">{door.carrier?.split(' ')[0]}</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">Clear to Dock</p>
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
