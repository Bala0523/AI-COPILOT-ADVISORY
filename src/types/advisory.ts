/**
 * AdvisoryOS Core Types
 * SEBI RIA Compliant Financial Planning & Research Architecture
 */

export type RiskBand = 'Conservative' | 'Moderately Conservative' | 'Moderate' | 'Moderately Aggressive' | 'Aggressive';

export type PlanStatus = 'Draft' | 'Needs Review' | 'Changes Requested' | 'Approved' | 'Shared';

export interface RiskCapacityInputs {
  monthlyIncome: number;
  monthlyEssentialExpenses: number;
  monthlyEmiLiabilities: number;
  dependantsCount: number;
  emergencyFundMonths: number; // e.g. 6 months
  incomeStabilityScore: 1 | 2 | 3 | 4 | 5; // 1 = volatile/unpredictable, 5 = highly secure
  investmentHorizonYears: number;
  liquidityNeedsNext3Years: number;
}

export interface RiskToleranceInputs {
  drawdownReaction: 'panic_sell' | 'anxious_hold' | 'stay_course' | 'buy_more';
  maxTolerableDropPercent: 5 | 10 | 20 | 35 | 50;
  investingExperienceYears: number;
  priorityBalance: 'capital_preservation' | 'balanced_growth' | 'maximum_wealth';
  lossAcceptanceScore: 1 | 2 | 3 | 4 | 5;
}

export interface RiskEvaluation {
  capacityScore: number; // 0 to 100
  capacityBand: RiskBand;
  toleranceScore: number; // 0 to 100
  toleranceBand: RiskBand;
  recommendedBand: RiskBand;
  conflictDetected: boolean;
  conflictMessage?: string;
  isComplete: boolean;
  missingFields: string[];
  scoringBreakdown: {
    factor: string;
    score: number;
    maxScore: number;
    notes: string;
  }[];
}

export interface ClientGoal {
  id: string;
  name: string;
  type: 'emergency_fund' | 'wealth_accumulation' | 'child_education' | 'retirement' | 'medical_corpus' | 'custom';
  targetYear: number;
  presentCost: number;
  futureTargetCorpus: number;
  currentEarmarked: number;
  monthlyContributionBudget: number;
  requiredMonthlySip: number;
  assumedAnnualReturn: number;
  assumedInflationRate: number;
  fundingGap: number;
  fundingStatus: 'Fully Funded' | 'On Track' | 'Shortfall' | 'Critical Gap';
  // Retirement specific fields
  isRetirement?: boolean;
  retirementYears?: number;
  pensionMonthly?: number;
  desiredMonthlyIncome?: number;
}

export interface DirectFund {
  id: string;
  name: string;
  isin: string;
  category: 'Large Cap Index' | 'Flexi Cap' | 'Short Duration Debt' | 'Corporate Bond' | 'Liquid' | 'Mid Cap' | 'Gold / Multi Asset';
  isDirect: boolean;
  expenseRatio: number; // percentage, e.g. 0.20
  aumCrores: number;
  cagr3Y: number;
  cagr5Y?: number;
  maxDrawdown1Y: number;
  trackingError?: number; // only for passive index funds
  managerTenureYears: number;
  riskRating: RiskBand;
  asOfDate: string;
  sourceDocumentId: string;
  sourceFactsheetUrl?: string;
  suitabilityNote: string;
}

export interface AssetAllocationItem {
  assetClass: 'Large Cap Equity' | 'Flexi / Mid Cap Equity' | 'High Quality Debt' | 'Arbitrage / Liquid' | 'Sovereign Gold';
  percentage: number;
  fundIds: string[];
  rationale: string;
}

export interface ProposedPortfolio {
  id: string;
  clientId: string;
  version: string; // e.g. "v1.0"
  targetRiskBand: RiskBand;
  allocations: AssetAllocationItem[];
  expectedReturnBase: number;
  rebalancingFrequency: 'Annual' | 'Semi-Annual';
  draftRationale: string;
  suitabilityValidation: {
    passed: boolean;
    warnings: string[];
    hardBlocks: string[];
  };
}

export interface ResearchDocument {
  id: string;
  title: string;
  schemeName: string;
  docType: 'Factsheet' | 'Scheme Information Document (SID)' | 'Monthly Portfolio Disclosure';
  reportingDate: string;
  sourceUrl?: string;
  pageNumber: number;
  extractedSnippet: string;
  keyFacts: { label: string; value: string }[];
}

export interface PlanDossier {
  id: string;
  clientId: string;
  goalId: string;
  version: string;
  versionNumber: number;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  approvalSignature?: string;
  adviserNotes: string;
  clientFeedbackNotes?: string;
  conflictsDisclosed: boolean;
  feesDisclosed: boolean;
  modelLimitationsAcknowledged: boolean;
  watermark: 'DRAFT—NOT FOR CLIENT DISTRIBUTION' | 'APPROVED FOR CLIENT PRESENTATION';
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  entityId: string;
  entityType: 'CLIENT' | 'RISK_PROFILE' | 'GOAL' | 'PORTFOLIO' | 'APPROVAL' | 'GUARDRAIL' | 'RESEARCH';
  action: string;
  actor: string;
  versionId?: string;
  summary: string;
  details?: Record<string, any>;
}

export interface ClientProfile {
  id: string;
  code: string;
  name: string;
  location: string;
  age: number;
  occupation: string;
  personaSummary: string;
  email: string;
  phone: string;
  monthlyTakeHome: number;
  netWorth: number;
  riskCapacity: RiskCapacityInputs;
  riskTolerance: RiskToleranceInputs;
  goals: ClientGoal[];
  proposedPortfolio?: ProposedPortfolio;
  activePlan?: PlanDossier;
  isDemoPersona?: boolean;
}

export interface GuardrailTest {
  id: string;
  prompt: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium';
  category: 'Return Guarantee' | 'Unsuitable Concentration' | 'Risk Override' | 'Workflow Bypass' | 'Speculative Recovery' | 'Compliance Concealment';
  triggeredPolicy: string;
  issueDetected: string;
  whyFlagged: string;
  saferAlternative: string;
  actionBlocked: boolean;
  requiresAdviserReview: boolean;
}
