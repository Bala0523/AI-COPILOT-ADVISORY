import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRiskCapacity,
  calculateRiskTolerance,
  evaluateClientSuitability,
  validatePortfolioSuitability,
  evaluateGuardrailPrompt,
  invalidatePlanOnEdit,
} from './suitabilityRules';
import { RiskCapacityInputs, RiskToleranceInputs, PlanDossier } from '../types/advisory';

test('calculateRiskCapacity flags missing required fields as incomplete', () => {
  const incompleteInputs: RiskCapacityInputs = {
    monthlyIncome: 0, // missing
    monthlyEssentialExpenses: 30000,
    monthlyEmiLiabilities: 0,
    dependantsCount: 0,
    emergencyFundMonths: 6,
    incomeStabilityScore: 4,
    investmentHorizonYears: 10,
    liquidityNeedsNext3Years: 0,
  };

  const result = calculateRiskCapacity(incompleteInputs);
  assert.equal(result.isComplete, false);
  assert.ok(result.missingFields.includes('Monthly Income'));
});

test('evaluateClientSuitability selects the lower of capacity and tolerance', () => {
  // Capacity: High (Income 200k, low emi, 12m emergency buffer, 15y horizon)
  const highCapacity: RiskCapacityInputs = {
    monthlyIncome: 200000,
    monthlyEssentialExpenses: 40000,
    monthlyEmiLiabilities: 10000,
    dependantsCount: 1,
    emergencyFundMonths: 12,
    incomeStabilityScore: 5,
    investmentHorizonYears: 15,
    liquidityNeedsNext3Years: 100000,
  };

  // Tolerance: Conservative (panic sell, 5% drop max)
  const lowTolerance: RiskToleranceInputs = {
    drawdownReaction: 'panic_sell',
    maxTolerableDropPercent: 5,
    investingExperienceYears: 1,
    priorityBalance: 'capital_preservation',
    lossAcceptanceScore: 1,
  };

  const evalResult = evaluateClientSuitability(highCapacity, lowTolerance);
  assert.equal(evalResult.isComplete, true);
  // Capacity is Aggressive/Moderately Aggressive, Tolerance is Conservative -> Min is Conservative
  assert.equal(evalResult.recommendedBand, 'Conservative');
  // Should detect conflict: ample capacity but low tolerance
  assert.equal(evalResult.conflictDetected, true);
});

test('evaluateClientSuitability flags aggressive trader conflict (high tolerance, low capacity)', () => {
  // Capacity: Low (heavy EMI, no emergency fund, variable income)
  const lowCapacity: RiskCapacityInputs = {
    monthlyIncome: 80000,
    monthlyEssentialExpenses: 45000,
    monthlyEmiLiabilities: 30000, // EMI ratio high
    dependantsCount: 2,
    emergencyFundMonths: 0,
    incomeStabilityScore: 1,
    investmentHorizonYears: 2,
    liquidityNeedsNext3Years: 500000,
  };

  // Tolerance: Aggressive (buy more on drop, max wealth, 50% drop acceptable)
  const highTolerance: RiskToleranceInputs = {
    drawdownReaction: 'buy_more',
    maxTolerableDropPercent: 50,
    investingExperienceYears: 3,
    priorityBalance: 'maximum_wealth',
    lossAcceptanceScore: 5,
  };

  const evalResult = evaluateClientSuitability(lowCapacity, highTolerance);
  assert.equal(evalResult.isComplete, true);
  // Lower of the two sets recommended band
  assert.ok(evalResult.recommendedBand === 'Conservative' || evalResult.recommendedBand === 'Moderately Conservative');
  assert.equal(evalResult.conflictDetected, true);
  assert.ok(evalResult.conflictMessage?.includes('High willingness to take risk, but limited financial capacity'));
});

test('validatePortfolioSuitability checks 100% total allocation and equity caps', () => {
  // Test invalid sum
  const badSumAllocations = [
    { assetClass: 'Large Cap Equity' as const, percentage: 50, fundIds: [], rationale: 'Core' },
    { assetClass: 'High Quality Debt' as const, percentage: 40, fundIds: [], rationale: 'Debt' },
  ];
  const res1 = validatePortfolioSuitability(badSumAllocations, 'Moderate');
  assert.equal(res1.passed, false);
  assert.ok(res1.hardBlocks.some((b) => b.includes('total exactly 100%')));

  // Test equity exceeding conservative cap (cap is 20%)
  const overEquityAllocations = [
    { assetClass: 'Large Cap Equity' as const, percentage: 50, fundIds: [], rationale: 'Core' },
    { assetClass: 'High Quality Debt' as const, percentage: 50, fundIds: [], rationale: 'Debt' },
  ];
  const res2 = validatePortfolioSuitability(overEquityAllocations, 'Conservative');
  assert.equal(res2.passed, false);
  assert.ok(res2.hardBlocks.some((b) => b.includes('exceeds the strict limit')));
});

test('evaluateGuardrailPrompt detects compliance violations', () => {
  const g1 = evaluateGuardrailPrompt('Guarantee me 20% returns.');
  assert.equal(g1.isTriggered, true);
  assert.equal(g1.matchedRule?.category, 'Return Guarantee');

  const g2 = evaluateGuardrailPrompt('Put my entire retirement corpus into small-cap funds.');
  assert.equal(g2.isTriggered, true);
  assert.equal(g2.matchedRule?.category, 'Unsuitable Concentration');

  const g3 = evaluateGuardrailPrompt('Ignore my risk profile and buy anyway.');
  assert.equal(g3.isTriggered, true);
  assert.equal(g3.matchedRule?.category, 'Risk Override');

  const g4 = evaluateGuardrailPrompt('Send this plan to the client without adviser approval.');
  assert.equal(g4.isTriggered, true);
  assert.equal(g4.matchedRule?.category, 'Workflow Bypass');

  const safePrompt = evaluateGuardrailPrompt('What is the recommended debt allocation for a 5-year goal?');
  assert.equal(safePrompt.isTriggered, false);
});

test('invalidatePlanOnEdit invalidates approved plans and creates new version', () => {
  const approvedPlan: PlanDossier = {
    id: 'plan-1',
    clientId: 'c1',
    goalId: 'g1',
    version: 'v1.0',
    versionNumber: 10,
    status: 'Approved',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    reviewedBy: 'Vikram Malhotra, CFP',
    reviewedAt: '2026-01-01T10:00:00Z',
    approvalSignature: 'SIG-VERIFIED-123',
    adviserNotes: 'Approved as per mandate',
    conflictsDisclosed: true,
    feesDisclosed: true,
    modelLimitationsAcknowledged: true,
    watermark: 'APPROVED FOR CLIENT PRESENTATION',
  };

  const invalidated = invalidatePlanOnEdit(approvedPlan);
  assert.equal(invalidated.status, 'Needs Review');
  assert.equal(invalidated.version, 'v1.1');
  assert.equal(invalidated.versionNumber, 11);
  assert.equal(invalidated.reviewedBy, undefined);
  assert.equal(invalidated.approvalSignature, undefined);
  assert.equal(invalidated.watermark, 'DRAFT—NOT FOR CLIENT DISTRIBUTION');
});
