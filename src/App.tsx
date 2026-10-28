/**
 * AdvisoryOS Application Shell
 * "AI-powered planning. Adviser-led decisions."
 */

import React from 'react';
import { AdvisoryProvider, useAdvisory } from './context/AdvisoryContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewScreen } from './components/OverviewScreen';
import { ClientsScreen } from './components/ClientsScreen';
import { GoalPlannerScreen } from './components/GoalPlannerScreen';
import { PortfolioLabScreen } from './components/PortfolioLabScreen';
import { ResearchCopilotScreen } from './components/ResearchCopilotScreen';
import { GuardrailsScreen } from './components/GuardrailsScreen';
import { ApprovalCentreScreen } from './components/ApprovalCentreScreen';
import { AuditTrailScreen } from './components/AuditTrailScreen';
import { ClientPresentationModal } from './components/ClientPresentationModal';
import { GuidedDemoTour } from './components/GuidedDemoTour';

const MainContent: React.FC = () => {
  const { activeTab } = useAdvisory();

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#F5F7FB]">
      <div className="max-w-7xl mx-auto pb-16">
        {activeTab === 'overview' && <OverviewScreen />}
        {activeTab === 'clients' && <ClientsScreen />}
        {activeTab === 'planner' && <GoalPlannerScreen />}
        {activeTab === 'portfolio' && <PortfolioLabScreen />}
        {activeTab === 'research' && <ResearchCopilotScreen />}
        {activeTab === 'guardrails' && <GuardrailsScreen />}
        {activeTab === 'approvals' && <ApprovalCentreScreen />}
        {activeTab === 'audit' && <AuditTrailScreen />}
      </div>
    </main>
  );
};

export default function App() {
  return (
    <AdvisoryProvider>
      <div className="min-h-screen flex flex-col bg-[#F5F7FB] font-sans antialiased text-slate-900 selection:bg-teal-500 selection:text-white">
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>
        <ClientPresentationModal />
        <GuidedDemoTour />
      </div>
    </AdvisoryProvider>
  );
}
