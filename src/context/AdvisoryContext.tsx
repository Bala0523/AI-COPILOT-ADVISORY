/**
 * AdvisoryOS Central Application State & Reactive Context
 * Manages clients, plans, suitability verification, approval workflows, and audit trail.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ClientProfile,
  ClientGoal,
  DirectFund,
  ResearchDocument,
  AuditEvent,
  PlanDossier,
  AssetAllocationItem,
  RiskCapacityInputs,
  RiskToleranceInputs,
} from '../types/advisory';
import {
  SEED_CLIENTS,
  SEED_FUNDS,
  SEED_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
  ADVISER_PROFILE,
} from '../data/seedData';
import {
  evaluateClientSuitability,
  validatePortfolioSuitability,
  invalidatePlanOnEdit,
} from '../utils/suitabilityRules';

export type NavigationTab =
  | 'overview'
  | 'clients'
  | 'planner'
  | 'portfolio'
  | 'research'
  | 'guardrails'
  | 'approvals'
  | 'audit';

interface AdvisoryContextType {
  clients: ClientProfile[];
  selectedClientId: string;
  selectedClient: ClientProfile;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectClient: (id: string) => void;
  funds: DirectFund[];
  researchDocs: ResearchDocument[];
  auditLogs: AuditEvent[];
  adviserProfile: typeof ADVISER_PROFILE;
  
  // Client & Risk Updates
  updateClientCapacity: (clientId: string, updates: Partial<RiskCapacityInputs>) => void;
  updateClientTolerance: (clientId: string, updates: Partial<RiskToleranceInputs>) => void;
  updateClientGoal: (clientId: string, goal: ClientGoal) => void;
  updateProposedAllocations: (clientId: string, allocations: AssetAllocationItem[]) => void;
  
  // Workflow actions
  submitPlanForReview: (clientId: string) => void;
  approvePlan: (clientId: string, adviserNotes: string) => void;
  requestPlanChanges: (clientId: string, revisionNotes: string) => void;
  openClientPresentation: (clientId: string) => void;
  closeClientPresentation: () => void;
  presentationOpenForClientId: string | null;

  // Demo walkthrough & Timer
  demoStep: number;
  isDemoActive: boolean;
  demoElapsedSeconds: number;
  startGuidedDemo: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  exitDemo: () => void;
  resetAllDemoData: () => void;

  // Search & Filters
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
}

const AdvisoryContext = createContext<AdvisoryContextType | undefined>(undefined);

const STORAGE_KEY_CLIENTS = 'advisoryos_clients_v1';
const STORAGE_KEY_AUDIT = 'advisoryos_audit_v1';

export const AdvisoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<ClientProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLIENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading saved clients', e);
    }
    return SEED_CLIENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed reading audit logs', e);
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [selectedClientId, setSelectedClientId] = useState<string>('client-1');
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [presentationOpenForClientId, setPresentationOpenForClientId] = useState<string | null>(null);

  // Guided demo tour & measured workflow duration
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [demoElapsedSeconds, setDemoElapsedSeconds] = useState<number>(0);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
    } catch (e) {
      console.error('Local storage write error', e);
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Local storage write error', e);
    }
  }, [auditLogs]);

  // Demo timer
  useEffect(() => {
    let interval: any = null;
    if (isDemoActive) {
      interval = setInterval(() => {
        setDemoElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isDemoActive]);

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  const logAuditEvent = (
    entityType: AuditEvent['entityType'],
    entityId: string,
    action: string,
    summary: string,
    details?: Record<string, any>
  ) => {
    const newEvent: AuditEvent = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      entityType,
      entityId,
      action,
      actor: `${ADVISER_PROFILE.name} (${ADVISER_PROFILE.registrationNo})`,
      versionId: selectedClient?.activePlan?.version || 'v1.0',
      summary,
      details,
    };
    setAuditLogs((prev) => [newEvent, ...prev]);
  };

  const updateClientCapacity = (clientId: string, updates: Partial<RiskCapacityInputs>) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const updatedCapacity = { ...c.riskCapacity, ...updates };
        const suitability = evaluateClientSuitability(updatedCapacity, c.riskTolerance);
        
        let activePlan = c.activePlan;
        if (activePlan) {
          activePlan = invalidatePlanOnEdit(activePlan);
        }

        return {
          ...c,
          riskCapacity: updatedCapacity,
          activePlan,
        };
      })
    );

    logAuditEvent(
      'RISK_PROFILE',
      clientId,
      'RISK_CAPACITY_UPDATED',
      `Updated financial capacity parameters for ${selectedClient.name}. Any existing approved plan was re-versioned to Needs Review.`
    );
  };

  const updateClientTolerance = (clientId: string, updates: Partial<RiskToleranceInputs>) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const updatedTolerance = { ...c.riskTolerance, ...updates };
        const suitability = evaluateClientSuitability(c.riskCapacity, updatedTolerance);
        
        let activePlan = c.activePlan;
        if (activePlan) {
          activePlan = invalidatePlanOnEdit(activePlan);
        }

        return {
          ...c,
          riskTolerance: updatedTolerance,
          activePlan,
        };
      })
    );

    logAuditEvent(
      'RISK_PROFILE',
      clientId,
      'RISK_TOLERANCE_UPDATED',
      `Updated psychological risk tolerance parameters for ${selectedClient.name}.`
    );
  };

  const updateClientGoal = (clientId: string, updatedGoal: ClientGoal) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const newGoals = c.goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g));
        let activePlan = c.activePlan;
        if (activePlan) {
          activePlan = invalidatePlanOnEdit(activePlan);
        }
        return {
          ...c,
          goals: newGoals,
          activePlan,
        };
      })
    );

    logAuditEvent(
      'GOAL',
      updatedGoal.id,
      'GOAL_PARAMETERS_MODIFIED',
      `Modified funding assumptions for goal "${updatedGoal.name}". Target: ₹${updatedGoal.futureTargetCorpus.toLocaleString('en-IN')}.`
    );
  };

  const updateProposedAllocations = (clientId: string, allocations: AssetAllocationItem[]) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        const suitability = evaluateClientSuitability(c.riskCapacity, c.riskTolerance);
        const validation = validatePortfolioSuitability(allocations, suitability.recommendedBand);

        const currentPort = c.proposedPortfolio;
        const newPortfolio = {
          id: currentPort?.id || `port-${Date.now()}`,
          clientId,
          version: currentPort ? `v${((parseInt(currentPort.version.replace('v', '')) || 10) + 1) / 10}` : 'v1.0',
          targetRiskBand: suitability.recommendedBand,
          allocations,
          expectedReturnBase: currentPort?.expectedReturnBase || 10.5,
          rebalancingFrequency: currentPort?.rebalancingFrequency || 'Annual',
          draftRationale: currentPort?.draftRationale || 'Balanced allocation tailored to client risk band.',
          suitabilityValidation: validation,
        };

        let activePlan = c.activePlan;
        if (activePlan) {
          activePlan = invalidatePlanOnEdit(activePlan);
        }

        return {
          ...c,
          proposedPortfolio: newPortfolio,
          activePlan,
        };
      })
    );

    logAuditEvent(
      'PORTFOLIO',
      clientId,
      'PORTFOLIO_ALLOCATION_EDITED',
      `Edited asset allocation weights for ${selectedClient.name}. Total equity re-validated.`
    );
  };

  const submitPlanForReview = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId || !c.activePlan) return c;
        return {
          ...c,
          activePlan: {
            ...c.activePlan,
            status: 'Needs Review',
            updatedAt: new Date().toISOString(),
          },
        };
      })
    );

    logAuditEvent(
      'APPROVAL',
      clientId,
      'PLAN_SUBMITTED_FOR_REVIEW',
      `Plan version ${selectedClient.activePlan?.version || 'v1.0'} queued for registered adviser suitability review.`
    );
  };

  const approvePlan = (clientId: string, adviserNotes: string) => {
    const signature = `SEBI-RIA-${ADVISER_PROFILE.registrationNo}-STAMP-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = new Date().toISOString();

    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId || !c.activePlan) return c;
        return {
          ...c,
          activePlan: {
            ...c.activePlan,
            status: 'Approved',
            reviewedBy: `${ADVISER_PROFILE.name}, ${ADVISER_PROFILE.credentials}`,
            reviewedAt: timestamp,
            approvalSignature: signature,
            adviserNotes,
            watermark: 'APPROVED FOR CLIENT PRESENTATION',
            updatedAt: timestamp,
          },
        };
      })
    );

    logAuditEvent(
      'APPROVAL',
      clientId,
      'PLAN_APPROVED_BY_RIA',
      `Adviser Vikram Malhotra executed statutory sign-off for ${selectedClient.name} (${selectedClient.activePlan?.version}). Digital signature generated.`,
      { signature, timestamp }
    );
  };

  const requestPlanChanges = (clientId: string, revisionNotes: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId || !c.activePlan) return c;
        return {
          ...c,
          activePlan: {
            ...c.activePlan,
            status: 'Changes Requested',
            adviserNotes: revisionNotes,
            watermark: 'DRAFT—NOT FOR CLIENT DISTRIBUTION',
            updatedAt: new Date().toISOString(),
          },
        };
      })
    );

    logAuditEvent(
      'APPROVAL',
      clientId,
      'PLAN_CHANGES_REQUESTED',
      `Adviser requested modifications for ${selectedClient.name}: "${revisionNotes}".`
    );
  };

  const openClientPresentation = (clientId: string) => {
    setPresentationOpenForClientId(clientId);
    logAuditEvent(
      'APPROVAL',
      clientId,
      'APPROVED_PREVIEW_GENERATED',
      `Generated approved client presentation deliverable for ${selectedClient.name}.`
    );
  };

  const closeClientPresentation = () => {
    setPresentationOpenForClientId(null);
  };

  // Demo walkthrough actions
  const startGuidedDemo = () => {
    setIsDemoActive(true);
    setDemoStep(1);
    setActiveTab('overview');
    setDemoElapsedSeconds(0);
  };

  const nextDemoStep = () => {
    const next = demoStep + 1;
    if (next > 12) {
      exitDemo();
      return;
    }
    setDemoStep(next);

    // Guide user to appropriate screen
    switch (next) {
      case 1:
        setActiveTab('overview');
        break;
      case 2:
      case 3:
        setActiveTab('clients');
        break;
      case 4:
        setActiveTab('planner');
        break;
      case 5:
      case 6:
        setActiveTab('portfolio');
        break;
      case 7:
        setActiveTab('research');
        break;
      case 8:
        setActiveTab('guardrails');
        break;
      case 9:
      case 10:
        setActiveTab('approvals');
        break;
      case 11:
        openClientPresentation(selectedClientId);
        break;
      case 12:
        closeClientPresentation();
        setActiveTab('audit');
        break;
    }
  };

  const prevDemoStep = () => {
    if (demoStep > 1) {
      setDemoStep(demoStep - 1);
    }
  };

  const exitDemo = () => {
    setIsDemoActive(false);
    setDemoStep(0);
  };

  const resetAllDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_CLIENTS);
    localStorage.removeItem(STORAGE_KEY_AUDIT);
    setClients(SEED_CLIENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSelectedClientId('client-1');
    setActiveTab('overview');
    setIsDemoActive(false);
    setDemoStep(0);
    setDemoElapsedSeconds(0);
    setPresentationOpenForClientId(null);
  };

  return (
    <AdvisoryContext.Provider
      value={{
        clients,
        selectedClientId,
        selectedClient,
        activeTab,
        setActiveTab,
        selectClient: setSelectedClientId,
        funds: SEED_FUNDS,
        researchDocs: SEED_DOCUMENTS,
        auditLogs,
        adviserProfile: ADVISER_PROFILE,
        updateClientCapacity,
        updateClientTolerance,
        updateClientGoal,
        updateProposedAllocations,
        submitPlanForReview,
        approvePlan,
        requestPlanChanges,
        openClientPresentation,
        closeClientPresentation,
        presentationOpenForClientId,
        demoStep,
        isDemoActive,
        demoElapsedSeconds,
        startGuidedDemo,
        nextDemoStep,
        prevDemoStep,
        exitDemo,
        resetAllDemoData,
        globalSearchQuery,
        setGlobalSearchQuery,
      }}
    >
      {children}
    </AdvisoryContext.Provider>
  );
};

export const useAdvisory = () => {
  const context = useContext(AdvisoryContext);
  if (!context) {
    throw new Error('useAdvisory must be used within an AdvisoryProvider');
  }
  return context;
};
