/**
 * AdvisoryOS Financial Mathematics Engine
 * Transparent, deterministic calculations for RIA financial planning
 */

export interface GoalCalculationInputs {
  presentCost: number;
  targetYears: number;
  assumedInflationRate: number; // e.g. 0.06 for 6%
  currentEarmarked: number;
  assumedAnnualReturn: number; // e.g. 0.11 for 11%
  monthlyContributionBudget: number;
}

export interface GoalCalculationResult {
  futureTargetCorpus: number;
  futureValueOfCurrentSavings: number;
  netCorpusNeeded: number;
  requiredMonthlySip: number;
  totalInvestmentOverHorizon: number;
  estimatedWealthGain: number;
  isFullyFunded: boolean;
  fundingGap: number;
  affordabilityStatus: 'Surplus' | 'Adequate' | 'Deficit';
  affordabilityDelta: number; // budget - required
}

export interface RetirementCashflowInputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancyAge: number;
  currentMonthlyExpense: number;
  inflationPreRetirement: number;
  inflationPostRetirement: number;
  preRetirementReturn: number;
  postRetirementReturn: number;
  currentRetirementSavings: number;
  expectedMonthlyPension: number; // starting at retirement
}

export interface RetirementCalculationResult {
  yearsToRetirement: number;
  yearsInRetirement: number;
  firstYearMonthlyExpenseAtRetirement: number;
  netMonthlyWithdrawalRequired: number; // after pension
  targetRetirementCorpus: number;
  currentSavingsFutureValue: number;
  corpusShortfall: number;
  requiredMonthlySip: number;
  realReturnInRetirement: number;
  isCoveredByPensionAlone: boolean;
}

/**
 * Calculates future inflation-adjusted cost
 * FV = PV * (1 + inflation)^years
 */
export function calculateInflationAdjustedCost(
  presentCost: number,
  inflationRate: number,
  years: number
): number {
  if (presentCost <= 0) return 0;
  if (years <= 0) return presentCost;
  return Math.round(presentCost * Math.pow(1 + inflationRate, years));
}

/**
 * Calculates future value of an initial lump sum
 * FV = PV * (1 + r)^years
 */
export function calculateLumpSumFutureValue(
  principal: number,
  annualReturn: number,
  years: number
): number {
  if (principal <= 0) return 0;
  if (years <= 0) return principal;
  return Math.round(principal * Math.pow(1 + annualReturn, years));
}

/**
 * Calculates required monthly Systematic Investment Plan (SIP)
 * Formula uses annuity due with monthly compounding:
 * FV = SIP * [((1 + i)^n - 1) / i] * (1 + i)
 * where i = annualReturn / 12 and n = years * 12
 */
export function calculateRequiredMonthlySip(
  netCorpusNeeded: number,
  annualReturn: number,
  years: number
): number {
  if (netCorpusNeeded <= 0 || years <= 0) return 0;
  
  const totalMonths = Math.round(years * 12);
  if (totalMonths <= 0) return 0;

  // Handle zero return case
  if (annualReturn <= 0.0001) {
    return Math.ceil(netCorpusNeeded / totalMonths);
  }

  const monthlyRate = annualReturn / 12;
  // Annuity factor for beginning of month investment (Annuity Due)
  const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
  const annuityFactor = ((compoundFactor - 1) / monthlyRate) * (1 + monthlyRate);

  const sip = netCorpusNeeded / annuityFactor;
  return Math.ceil(sip);
}

/**
 * Full goal planner calculation
 */
export function calculateGoalPlan(inputs: GoalCalculationInputs): GoalCalculationResult {
  const {
    presentCost,
    targetYears,
    assumedInflationRate,
    currentEarmarked,
    assumedAnnualReturn,
    monthlyContributionBudget,
  } = inputs;

  const futureTargetCorpus = calculateInflationAdjustedCost(presentCost, assumedInflationRate, targetYears);
  const futureValueOfCurrentSavings = calculateLumpSumFutureValue(currentEarmarked, assumedAnnualReturn, targetYears);
  
  const netCorpusNeeded = Math.max(0, futureTargetCorpus - futureValueOfCurrentSavings);
  const requiredMonthlySip = calculateRequiredMonthlySip(netCorpusNeeded, assumedAnnualReturn, targetYears);
  
  const totalMonths = Math.round(targetYears * 12);
  const totalInvestmentOverHorizon = currentEarmarked + (requiredMonthlySip * totalMonths);
  const estimatedWealthGain = Math.max(0, futureTargetCorpus - totalInvestmentOverHorizon);
  const isFullyFunded = netCorpusNeeded <= 0;
  const fundingGap = netCorpusNeeded;

  const affordabilityDelta = monthlyContributionBudget - requiredMonthlySip;
  let affordabilityStatus: 'Surplus' | 'Adequate' | 'Deficit' = 'Adequate';
  if (affordabilityDelta < 0) {
    affordabilityStatus = 'Deficit';
  } else if (affordabilityDelta > 5000) {
    affordabilityStatus = 'Surplus';
  }

  return {
    futureTargetCorpus,
    futureValueOfCurrentSavings,
    netCorpusNeeded,
    requiredMonthlySip,
    totalInvestmentOverHorizon,
    estimatedWealthGain,
    isFullyFunded,
    fundingGap,
    affordabilityStatus,
    affordabilityDelta,
  };
}

/**
 * Retirement income & corpus calculator with pension adjustment
 */
export function calculateRetirementPlan(inputs: RetirementCashflowInputs): RetirementCalculationResult {
  const yearsToRetirement = Math.max(0, inputs.retirementAge - inputs.currentAge);
  const yearsInRetirement = Math.max(1, inputs.lifeExpectancyAge - inputs.retirementAge);

  // Inflation adjusted monthly expense at year 1 of retirement
  const firstYearMonthlyExpenseAtRetirement = Math.round(
    inputs.currentMonthlyExpense * Math.pow(1 + inputs.inflationPreRetirement, yearsToRetirement)
  );

  const netMonthlyWithdrawalRequired = Math.max(
    0,
    firstYearMonthlyExpenseAtRetirement - inputs.expectedMonthlyPension
  );

  const isCoveredByPensionAlone = netMonthlyWithdrawalRequired === 0;

  // Real rate of return in retirement: r_real = (1 + r_post)/(1 + infl_post) - 1
  const realReturnInRetirement =
    (1 + inputs.postRetirementReturn) / (1 + inputs.inflationPostRetirement) - 1;

  let targetRetirementCorpus = 0;

  if (!isCoveredByPensionAlone) {
    const annualWithdrawalYear1 = netMonthlyWithdrawalRequired * 12;
    if (Math.abs(realReturnInRetirement) < 0.0001) {
      targetRetirementCorpus = Math.round(annualWithdrawalYear1 * yearsInRetirement);
    } else {
      // Capitalization formula for growing annuity in real terms
      const pvFactor = (1 - Math.pow(1 + realReturnInRetirement, -yearsInRetirement)) / realReturnInRetirement;
      targetRetirementCorpus = Math.round(annualWithdrawalYear1 * pvFactor);
    }
  }

  const currentSavingsFutureValue = calculateLumpSumFutureValue(
    inputs.currentRetirementSavings,
    inputs.preRetirementReturn,
    yearsToRetirement
  );

  const corpusShortfall = Math.max(0, targetRetirementCorpus - currentSavingsFutureValue);
  const requiredMonthlySip = calculateRequiredMonthlySip(
    corpusShortfall,
    inputs.preRetirementReturn,
    yearsToRetirement
  );

  return {
    yearsToRetirement,
    yearsInRetirement,
    firstYearMonthlyExpenseAtRetirement,
    netMonthlyWithdrawalRequired,
    targetRetirementCorpus,
    currentSavingsFutureValue,
    corpusShortfall,
    requiredMonthlySip,
    realReturnInRetirement,
    isCoveredByPensionAlone,
  };
}

/**
 * Calculates 3 scenarios: Conservative (Lower), Base, Aggressive (Higher)
 */
export function calculateScenarios(
  netCorpus: number,
  years: number,
  baseReturn: number
): {
  lower: { rate: number; sip: number };
  base: { rate: number; sip: number };
  higher: { rate: number; sip: number };
} {
  const lowerRate = Math.max(0.04, baseReturn - 0.03);
  const higherRate = baseReturn + 0.03;

  return {
    lower: {
      rate: Number((lowerRate * 100).toFixed(1)),
      sip: calculateRequiredMonthlySip(netCorpus, lowerRate, years),
    },
    base: {
      rate: Number((baseReturn * 100).toFixed(1)),
      sip: calculateRequiredMonthlySip(netCorpus, baseReturn, years),
    },
    higher: {
      rate: Number((higherRate * 100).toFixed(1)),
      sip: calculateRequiredMonthlySip(netCorpus, higherRate, years),
    },
  };
}

/**
 * Calculates a dynamic glide path allocation from current year to goal year.
 * De-risks equity within the final 3 years to preserve capital.
 */
export function calculateGlidePath(
  currentYear: number,
  targetYear: number,
  baseEquityPercent: number
): { year: number; equityPercent: number; debtPercent: number; cashPercent: number }[] {
  const totalYears = Math.max(1, targetYear - currentYear);
  const path = [];

  for (let i = 0; i <= totalYears; i++) {
    const yr = currentYear + i;
    const yearsRemaining = totalYears - i;

    let equity = baseEquityPercent;
    let cash = 5;

    if (yearsRemaining === 0) {
      equity = 0;
      cash = 40;
    } else if (yearsRemaining === 1) {
      equity = Math.min(15, baseEquityPercent * 0.2);
      cash = 25;
    } else if (yearsRemaining === 2) {
      equity = Math.min(30, baseEquityPercent * 0.4);
      cash = 15;
    } else if (yearsRemaining === 3) {
      equity = Math.min(50, baseEquityPercent * 0.7);
      cash = 10;
    }

    const debt = Math.max(0, 100 - equity - cash);
    path.push({
      year: yr,
      equityPercent: Math.round(equity),
      debtPercent: Math.round(debt),
      cashPercent: Math.round(cash),
    });
  }

  return path;
}

/**
 * 10-Year Backtest metrics calculation on synthetic dataset
 */
export interface BacktestYearData {
  year: number;
  largeCapReturn: number;
  flexiCapReturn: number;
  debtReturn: number;
  liquidReturn: number;
  goldReturn: number;
  portfolioReturn: number;
  portfolioValue: number;
  benchmarkReturn: number;
  benchmarkValue: number;
}

export interface BacktestSummary {
  startYear: number;
  endYear: number;
  initialInvestment: number;
  finalPortfolioValue: number;
  finalBenchmarkValue: number;
  cagrPortfolio: number;
  cagrBenchmark: number;
  volatilityPortfolio: number;
  maxDrawdownPortfolio: number;
  yearlyHistory: BacktestYearData[];
}

// Fixed 10-year synthetic historical asset class annual returns (2016-2025)
// Transparently documented as proxy series
export const HISTORICAL_ASSET_RETURNS: {
  year: number;
  largeCap: number; // Nifty 50 TRI proxy
  flexiCap: number; // Nifty 500 Multicap proxy
  debt: number; // Crisil Composite Bond proxy
  liquid: number; // Crisil Liquid Fund proxy
  gold: number; // Domestic spot gold proxy
  benchmark: number; // Nifty 50 TRI benchmark
}[] = [
  { year: 2016, largeCap: 4.4, flexiCap: 5.1, debt: 12.1, liquid: 7.2, gold: 11.8, benchmark: 4.4 },
  { year: 2017, largeCap: 30.3, flexiCap: 37.8, debt: 4.7, liquid: 6.6, gold: 5.1, benchmark: 30.3 },
  { year: 2018, largeCap: 4.6, flexiCap: -2.1, debt: 6.0, liquid: 7.6, gold: 7.9, benchmark: 4.6 },
  { year: 2019, largeCap: 13.5, flexiCap: 9.0, debt: 10.7, liquid: 6.9, gold: 23.8, benchmark: 13.5 },
  { year: 2020, largeCap: 16.1, flexiCap: 17.9, debt: 12.3, liquid: 4.6, gold: 28.0, benchmark: 16.1 },
  { year: 2021, largeCap: 25.6, flexiCap: 31.6, debt: 3.4, liquid: 3.6, gold: -4.2, benchmark: 25.6 },
  { year: 2022, largeCap: 5.7, flexiCap: 4.3, debt: 2.6, liquid: 5.1, gold: 13.9, benchmark: 5.7 },
  { year: 2023, largeCap: 21.3, flexiCap: 26.9, debt: 7.8, liquid: 7.1, gold: 15.2, benchmark: 21.3 },
  { year: 2024, largeCap: 16.8, flexiCap: 20.4, debt: 8.4, liquid: 7.3, gold: 21.6, benchmark: 16.8 },
  { year: 2025, largeCap: 11.2, flexiCap: 13.5, debt: 7.5, liquid: 6.8, gold: 12.4, benchmark: 11.2 },
];

export function runPortfolioBacktest(weights: {
  largeCap: number;
  flexiCap: number;
  debt: number;
  liquid: number;
  gold: number;
}): BacktestSummary {
  const initialInvestment = 100000;
  let pValue = initialInvestment;
  let bValue = initialInvestment;
  let peakValue = initialInvestment;
  let maxDrawdown = 0;

  const yearlyHistory: BacktestYearData[] = [];
  const returnsArray: number[] = [];

  for (const row of HISTORICAL_ASSET_RETURNS) {
    const portfolioReturnPct =
      (weights.largeCap * row.largeCap +
        weights.flexiCap * row.flexiCap +
        weights.debt * row.debt +
        weights.liquid * row.liquid +
        weights.gold * row.gold) /
      100;

    pValue = Math.round(pValue * (1 + portfolioReturnPct / 100));
    bValue = Math.round(bValue * (1 + row.benchmark / 100));

    if (pValue > peakValue) {
      peakValue = pValue;
    } else {
      const dd = ((peakValue - pValue) / peakValue) * 100;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    returnsArray.push(portfolioReturnPct);

    yearlyHistory.push({
      year: row.year,
      largeCapReturn: row.largeCap,
      flexiCapReturn: row.flexiCap,
      debtReturn: row.debt,
      liquidReturn: row.liquid,
      goldReturn: row.gold,
      portfolioReturn: Number(portfolioReturnPct.toFixed(2)),
      portfolioValue: pValue,
      benchmarkReturn: row.benchmark,
      benchmarkValue: bValue,
    });
  }

  const nYears = HISTORICAL_ASSET_RETURNS.length;
  const cagrPortfolio = Number(
    ((Math.pow(pValue / initialInvestment, 1 / nYears) - 1) * 100).toFixed(2)
  );
  const cagrBenchmark = Number(
    ((Math.pow(bValue / initialInvestment, 1 / nYears) - 1) * 100).toFixed(2)
  );

  // Standard deviation of returns
  const meanReturn = returnsArray.reduce((acc, r) => acc + r, 0) / nYears;
  const variance =
    returnsArray.reduce((acc, r) => acc + Math.pow(r - meanReturn, 2), 0) / (nYears - 1);
  const volatilityPortfolio = Number(Math.sqrt(variance).toFixed(2));

  return {
    startYear: HISTORICAL_ASSET_RETURNS[0].year,
    endYear: HISTORICAL_ASSET_RETURNS[nYears - 1].year,
    initialInvestment,
    finalPortfolioValue: pValue,
    finalBenchmarkValue: bValue,
    cagrPortfolio,
    cagrBenchmark,
    volatilityPortfolio,
    maxDrawdownPortfolio: Number(maxDrawdown.toFixed(2)),
    yearlyHistory,
  };
}
