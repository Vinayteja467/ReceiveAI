import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({
  activeTab,
  setActiveTab,
  openExceptionsCount,
  onRefresh,
  onOpenDemoScenarios,
  isRefreshing,
  children
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#040406] text-neutral-100 font-sans relative selection:bg-orange-500/30 selection:text-orange-200">
      {/* Background Ambient Lighting & Planetary Glow (MyAdSphere Aesthetic) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Top-Center Warm Ember Aura */}
        <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[1100px] h-[500px] rounded-full bg-gradient-to-b from-orange-600/25 via-red-600/15 to-transparent blur-3xl opacity-80" />
        
        {/* Bottom-Right Planetary Eclipse Sphere */}
        <div className="absolute -bottom-28 -right-28 w-[420px] h-[420px] rounded-full bg-gradient-to-tl from-orange-600/30 via-red-600/15 to-transparent blur-2xl" />
        
        {/* Celestial Orbital Rings */}
        <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full border border-orange-500/15 pointer-events-none" />
        <div className="absolute -bottom-60 -right-60 w-[720px] h-[720px] rounded-full border border-rose-500/10 pointer-events-none" />

        {/* Left Ambient Subtle Glow */}
        <div className="absolute top-1/3 -left-36 w-80 h-80 rounded-full bg-orange-600/10 blur-3xl" />
      </div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openExceptionsCount={openExceptionsCount}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header
          activeTab={activeTab}
          onNewInspection={() => setActiveTab('new-inspection')}
          onRefresh={onRefresh}
          onOpenDemoScenarios={onOpenDemoScenarios}
          isRefreshing={isRefreshing}
        />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
