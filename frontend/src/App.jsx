import React, { useState, useEffect } from 'react';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import NewInspectionPage from './pages/NewInspectionPage';
import InspectionsPage from './pages/InspectionsPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import PurchaseOrderDetailPage from './pages/PurchaseOrderDetailPage';
import CreatePurchaseOrderPage from './pages/CreatePurchaseOrderPage';
import ProductsPage from './pages/ProductsPage';
import ExceptionsPage from './pages/ExceptionsPage';
import ExceptionDetailsPage from './pages/ExceptionDetailsPage';
import EvidencePage from './pages/EvidencePage';
import SettingsPage from './pages/SettingsPage';
import InspectionResultsPage from './pages/InspectionResultsPage';
import DemoScenariosModal from './components/scenarios/DemoScenariosModal';
import { exceptionsApi } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedInspectionId, setSelectedInspectionId] = useState(null);
  const [selectedPoId, setSelectedPoId] = useState(null);
  const [selectedExceptionId, setSelectedExceptionId] = useState(null);
  const [inspectionFilter, setInspectionFilter] = useState('ALL');
  const [exceptionFilter, setExceptionFilter] = useState('ALL');
  const [openExceptionsCount, setOpenExceptionsCount] = useState(3);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [demoScenariosOpen, setDemoScenariosOpen] = useState(false);
  const [activeScenarioData, setActiveScenarioData] = useState(null);

  useEffect(() => {
    // Initial fetch of exception count for the sidebar badge
    exceptionsApi.list({ status: 'OPEN' })
      .then(data => {
        setOpenExceptionsCount(data.length);
      })
      .catch(() => {});
  }, [refreshKey]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            key={refreshKey}
            setActiveTab={setActiveTab}
            setSelectedInspectionId={setSelectedInspectionId}
            onNavigateWithFilter={(targetTab, filter) => {
              if (targetTab === 'inspections') {
                setInspectionFilter(filter || 'ALL');
                setActiveTab('inspections');
              } else if (targetTab === 'exceptions') {
                setExceptionFilter(filter || 'ALL');
                setActiveTab('exceptions');
              } else {
                setActiveTab(targetTab);
              }
            }}
          />
        );
      case 'new-inspection':
        return (
          <NewInspectionPage
            key={refreshKey}
            initialPoId={selectedPoId}
            scenarioData={activeScenarioData}
            setActiveTab={setActiveTab}
            setSelectedInspectionId={setSelectedInspectionId}
            onInspectionCreated={handleRefresh}
          />
        );
      case 'inspections':
        return (
          <InspectionsPage
            key={refreshKey}
            selectedInspectionId={selectedInspectionId}
            setSelectedInspectionId={setSelectedInspectionId}
            setActiveTab={setActiveTab}
            initialStatusFilter={inspectionFilter}
          />
        );
      case 'inspection-results':
        return (
          <InspectionResultsPage
            key={refreshKey}
            inspectionId={selectedInspectionId}
            scenarioData={activeScenarioData}
            onBack={() => {
              setActiveScenarioData(null);
              setActiveTab('inspections');
            }}
            setActiveTab={setActiveTab}
          />
        );
      case 'purchase-orders':
        return (
          <PurchaseOrdersPage
            key={refreshKey}
            onSelectPO={(id) => {
              setSelectedPoId(id);
              setActiveTab('purchase-order-details');
            }}
            onCreatePO={() => setActiveTab('create-purchase-order')}
            onStartInspection={(id) => {
              setSelectedPoId(id);
              setActiveTab('new-inspection');
            }}
          />
        );
      case 'purchase-order-details':
        return (
          <PurchaseOrderDetailPage
            key={refreshKey}
            poId={selectedPoId}
            onBack={() => setActiveTab('purchase-orders')}
            onStartInspection={(id) => {
              setSelectedPoId(id);
              setActiveTab('new-inspection');
            }}
          />
        );
      case 'create-purchase-order':
        return (
          <CreatePurchaseOrderPage
            key={refreshKey}
            onBack={() => setActiveTab('purchase-orders')}
            onPoCreated={(id) => {
              setSelectedPoId(id);
              setActiveTab('purchase-order-details');
              handleRefresh();
            }}
          />
        );
      case 'products':
        return (
          <ProductsPage
            key={refreshKey}
          />
        );
      case 'exceptions':
        return (
          <ExceptionsPage
            key={refreshKey}
            onExceptionsChange={count => setOpenExceptionsCount(count)}
            onSelectException={(id) => {
              setSelectedExceptionId(id);
              setActiveTab('exception-details');
            }}
            setActiveTab={setActiveTab}
          />
        );
      case 'exception-details':
        return (
          <ExceptionDetailsPage
            key={refreshKey}
            exceptionId={selectedExceptionId}
            onBack={() => {
              handleRefresh();
              setActiveTab('exceptions');
            }}
            setActiveTab={setActiveTab}
            setSelectedInspectionId={setSelectedInspectionId}
            setSelectedPoId={setSelectedPoId}
          />
        );
      case 'evidence':
        return (
          <EvidencePage
            key={refreshKey}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            key={refreshKey}
          />
        );
      default:
        return <DashboardPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <>
      <AppLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openExceptionsCount={openExceptionsCount}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenDemoScenarios={() => setDemoScenariosOpen(true)}
      >
        {renderContent()}
      </AppLayout>

      <DemoScenariosModal
        isOpen={demoScenariosOpen}
        onClose={() => setDemoScenariosOpen(false)}
        onSelectScenarioForResults={(sc) => {
          setActiveScenarioData(sc);
          setActiveTab('inspection-results');
        }}
        onSelectScenarioForWizard={(sc) => {
          setActiveScenarioData(sc);
          if (sc.po?.id) {
            setSelectedPoId(sc.po.id);
          }
          setActiveTab('new-inspection');
        }}
      />
    </>
  );
}
