import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateInflationAdjustedCost,
  calculateLumpSumFutureValue,
  calculateRequiredMonthlySip,
  calculateGoalPlan,
  calculateRetirementPlan,
  calculateScenarios,
  calculateGlidePath,
  runPortfolioBacktest,
} from './financialMath';

test('calculateInflationAdjustedCost correctly compounds cost over years', () => {
  // ₹10,00,000 at 6% inflation over 10 years
  // 1000000 * (1.06)^10 = ~1790848
  const fv = calculateInflationAdjustedCost(1000000, 0.06, 10);
  assert.equal(fv, 1790848);

  // Zero years should return initial cost
  assert.equal(calculateInflationAdjustedCost(500000, 0.07, 0), 500000);

  // Zero cost should return zero
  assert.equal(calculateInflationAdjustedCost(0, 0.06, 10), 0);
});

test('calculateLumpSumFutureValue calculates compounding accurately', () => {
  // ₹5,00,000 at 10% annual return over 5 years
  // 500000 * (1.10)^5 = 805255
  const fv = calculateLumpSumFutureValue(500000, 0.10, 5);
  assert.equal(fv, 805255);
});

test('calculateRequiredMonthlySip handles zero returns, zero years, and standard compounding', () => {
  // Zero net corpus should require zero SIP
  assert.equal(calculateRequiredMonthlySip(0, 0.12, 10), 0);

  // Zero years should require zero SIP
  assert.equal(calculateRequiredMonthlySip(1000000, 0.12, 0), 0);

  // Zero return: ₹1,20,000 needed over 1 year (12 months) = ₹10,000/month
  const zeroReturnSip = calculateRequiredMonthlySip(120000, 0, 1);
  assert.equal(zeroReturnSip, 10000);

  // Standard case: ₹10,00,000 in 5 years at 12%
  const sip = calculateRequiredMonthlySip(1000000, 0.12, 5);
  assert.ok(sip > 11500 && sip < 12500, `Expected SIP in range, got ${sip}`);
});

test('calculateGoalPlan accurately detects fully funded status and affordability', () => {
  // Already funded goal: present cost 500k, earmarked 1000k
  const fundedPlan = calculateGoalPlan({
    presentCost: 500000,
    targetYears: 5,
    assumedInflationRate: 0.05,
    currentEarmarked: 1000000,
    assumedAnnualReturn: 0.10,
    monthlyContributionBudget: 20000,
  });

  assert.equal(fundedPlan.isFullyFunded, true);
  assert.equal(fundedPlan.requiredMonthlySip, 0);

  // Goal requiring more SIP than budget
  const deficitPlan = calculateGoalPlan({
    presentCost: 5000000,
    targetYears: 5,
    assumedInflationRate: 0.06,
    currentEarmarked: 0,
    assumedAnnualReturn: 0.11,
    monthlyContributionBudget: 15000,
  });

  assert.equal(deficitPlan.isFullyFunded, false);
  assert.equal(deficitPlan.affordabilityStatus, 'Deficit');
  assert.ok(deficitPlan.requiredMonthlySip > 15000);
});

test('calculateRetirementPlan integrates pension and withdrawal duration', () => {
  const retPlan = calculateRetirementPlan({
    currentAge: 35,
    retirementAge: 60,
    lifeExpectancyAge: 85,
    currentMonthlyExpense: 50000,
    inflationPreRetirement: 0.06,
    inflationPostRetirement: 0.05,
    preRetirementReturn: 0.11,
    postRetirementReturn: 0.08,
    currentRetirementSavings: 500000,
    expectedMonthlyPension: 0,
  });

  assert.equal(retPlan.yearsToRetirement, 25);
  assert.equal(retPlan.yearsInRetirement, 25);
  assert.ok(retPlan.targetRetirementCorpus > 10000000);
  assert.ok(retPlan.requiredMonthlySip > 0);
  assert.equal(retPlan.isCoveredByPensionAlone, false);
});

test('calculateGlidePath derisks equity as target approaches', () => {
  const path = calculateGlidePath(2026, 2036, 70);
  assert.equal(path.length, 11);
  assert.equal(path[0].equityPercent, 70); // start
  const finalYear = path[path.length - 1];
  assert.equal(finalYear.equityPercent, 0); // end at 0% equity for capital protection
  assert.ok(finalYear.cashPercent >= 25);
});

test('runPortfolioBacktest computes CAGR and handles synthetic 10-year weights', () => {
  const summary = runPortfolioBacktest({
    largeCap: 40,
    flexiCap: 30,
    debt: 20,
    liquid: 5,
    gold: 5,
  });

  assert.equal(summary.yearlyHistory.length, 10);
  assert.equal(summary.startYear, 2016);
  assert.equal(summary.endYear, 2025);
  assert.ok(summary.cagrPortfolio > 5 && summary.cagrPortfolio < 25);
  assert.ok(summary.maxDrawdownPortfolio >= 0);
  assert.ok(summary.finalPortfolioValue > summary.initialInvestment);
});
