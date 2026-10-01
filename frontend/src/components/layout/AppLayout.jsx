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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openExceptionsCount={openExceptionsCount}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeTab={activeTab}
          onNewInspection={() => setActiveTab('new-inspection')}
          onRefresh={onRefresh}
          onOpenDemoScenarios={onOpenDemoScenarios}
          isRefreshing={isRefreshing}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
