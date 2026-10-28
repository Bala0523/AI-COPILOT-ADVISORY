/**
 * AdvisoryOS Suitability & Compliance Engine
 * Based on SEBI (Investment Advisers) Regulations, 2013 - Regulation 17 (Suitability) & Regulation 18 (Disclosures)
 */

import {
  RiskBand,
  RiskCapacityInputs,
  RiskToleranceInputs,
  RiskEvaluation,
  GuardrailTest,
  PlanDossier,
  AssetAllocationItem,
} from '../types/advisory';

export const RISK_BAND_HIERARCHY: Record<RiskBand, number> = {
  'Conservative': 1,
  'Moderately Conservative': 2,
  'Moderate': 3,
  'Moderately Aggressive': 4,
  'Aggressive': 5,
};

export const NUMBER_TO_RISK_BAND: Record<number, RiskBand> = {
  1: 'Conservative',
  2: 'Moderately Conservative',
  3: 'Moderate',
  4: 'Moderately Aggressive',
  5: 'Aggressive',
};

/**
 * Calculates Risk Capacity score (0 - 100)
 * Evaluates objective ability to withstand financial loss without sacrificing basic lifestyle or essential obligations.
 */
export function calculateRiskCapacity(inputs: RiskCapacityInputs): {
  score: number;
  band: RiskBand;
  breakdown: { factor: string; score: number; maxScore: number; notes: string }[];
  isComplete: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];
  if (inputs.monthlyIncome <= 0) missingFields.push('Monthly Income');
  if (inputs.monthlyEssentialExpenses < 0) missingFields.push('Essential Expenses');
  if (inputs.emergencyFundMonths < 0) missingFields.push('Emergency Fund Reserves');
  if (inputs.investmentHorizonYears <= 0) missingFields.push('Investment Horizon');

  if (missingFields.length > 0) {
    return {
      score: 0,
      band: 'Conservative',
      breakdown: [],
      isComplete: false,
      missingFields,
    };
  }

  const breakdown: { factor: string; score: number; maxScore: number; notes: string }[] = [];

  // 1. Surplus Ratio: (Income - Expenses - EMI) / Income (Max 25 pts)
  const disposableSurplus = inputs.monthlyIncome - inputs.monthlyEssentialExpenses - inputs.monthlyEmiLiabilities;
  const surplusRatio = disposableSurplus / inputs.monthlyIncome;
  let surplusScore = 0;
  if (surplusRatio >= 0.5) surplusScore = 25;
  else if (surplusRatio >= 0.35) surplusScore = 20;
  else if (surplusRatio >= 0.20) surplusScore = 15;
  else if (surplusRatio >= 0.05) surplusScore = 8;
  else surplusScore = 2;
  breakdown.push({
    factor: 'Monthly Cashflow Surplus',
    score: surplusScore,
    maxScore: 25,
    notes: `${(surplusRatio * 100).toFixed(0)}% free cashflow surplus (₹${Math.max(0, disposableSurplus).toLocaleString('en-IN')}/mo)`,
  });

  // 2. Debt/EMI Burden Ratio: EMI / Income (Max 20 pts)
  const emiRatio = inputs.monthlyEmiLiabilities / inputs.monthlyIncome;
  let emiScore = 0;
  if (emiRatio <= 0.05) emiScore = 20;
  else if (emiRatio <= 0.20) emiScore = 16;
  else if (emiRatio <= 0.35) emiScore = 12;
  else if (emiRatio <= 0.50) emiScore = 6;
  else emiScore = 0;
  breakdown.push({
    factor: 'Debt & EMI Servicing Ratio',
    score: emiScore,
    maxScore: 20,
    notes: `${(emiRatio * 100).toFixed(0)}% of monthly income committed to loan repayments`,
  });

  // 3. Emergency Liquidity Buffer (Max 20 pts)
  let emergencyScore = 0;
  if (inputs.emergencyFundMonths >= 9) emergencyScore = 20;
  else if (inputs.emergencyFundMonths >= 6) emergencyScore = 17;
  else if (inputs.emergencyFundMonths >= 3) emergencyScore = 11;
  else if (inputs.emergencyFundMonths >= 1) emergencyScore = 5;
  else emergencyScore = 0;
  breakdown.push({
    factor: 'Emergency Reserve Buffer',
    score: emergencyScore,
    maxScore: 20,
    notes: `${inputs.emergencyFundMonths} months of living expenses earmarked in liquid assets`,
  });

  // 4. Income Stability (Max 15 pts)
  const stabilityScore = inputs.incomeStabilityScore * 3;
  breakdown.push({
    factor: 'Income Certainty & Predictability',
    score: stabilityScore,
    maxScore: 15,
    notes: `Rated ${inputs.incomeStabilityScore}/5 (${inputs.incomeStabilityScore >= 4 ? 'Salaried / High Stability' : inputs.incomeStabilityScore <= 2 ? 'Variable / Entrepreneurial' : 'Moderate Stability'})`,
  });

  // 5. Dependants Load (Max 10 pts)
  let depScore = 10;
  if (inputs.dependantsCount === 0) depScore = 10;
  else if (inputs.dependantsCount <= 1) depScore = 8;
  else if (inputs.dependantsCount <= 3) depScore = 5;
  else depScore = 2;
  breakdown.push({
    factor: 'Financial Dependants',
    score: depScore,
    maxScore: 10,
    notes: `${inputs.dependantsCount} financial dependant(s) reliant on primary cashflow`,
  });

  // 6. Horizon Capacity (Max 10 pts)
  let horizonScore = 0;
  if (inputs.investmentHorizonYears >= 10) horizonScore = 10;
  else if (inputs.investmentHorizonYears >= 5) horizonScore = 8;
  else if (inputs.investmentHorizonYears >= 3) horizonScore = 5;
  else horizonScore = 2;
  breakdown.push({
    factor: 'Horizon Capacity',
    score: horizonScore,
    maxScore: 10,
    notes: `${inputs.investmentHorizonYears} years time buffer to compound and ride out market cycles`,
  });

  const totalScore = surplusScore + emiScore + emergencyScore + stabilityScore + depScore + horizonScore;

  let band: RiskBand = 'Moderate';
  if (totalScore <= 35) band = 'Conservative';
  else if (totalScore <= 52) band = 'Moderately Conservative';
  else if (totalScore <= 70) band = 'Moderate';
  else if (totalScore <= 85) band = 'Moderately Aggressive';
  else band = 'Aggressive';

  return {
    score: totalScore,
    band,
    breakdown,
    isComplete: true,
    missingFields: [],
  };
}

/**
 * Calculates Risk Tolerance score (0 - 100)
 * Evaluates subjective psychological willingness to stomach drawdowns, volatility, and uncertainty.
 */
export function calculateRiskTolerance(inputs: RiskToleranceInputs): {
  score: number;
  band: RiskBand;
  breakdown: { factor: string; score: number; maxScore: number; notes: string }[];
} {
  const breakdown: { factor: string; score: number; maxScore: number; notes: string }[] = [];

  // 1. Drawdown reaction (Max 30 pts)
  let reactionScore = 15;
  let reactionNote = '';
  switch (inputs.drawdownReaction) {
    case 'panic_sell':
      reactionScore = 5;
      reactionNote = 'High anxiety: Exits equities to cash upon experiencing 15%+ decline';
      break;
    case 'anxious_hold':
      reactionScore = 14;
      reactionNote = 'Low comfort: Holds nervously but checks portfolio daily; resists additional investment';
      break;
    case 'stay_course':
      reactionScore = 24;
      reactionNote = 'Disciplined: Understands cycle volatility and maintains regular SIP investments';
      break;
    case 'buy_more':
      reactionScore = 30;
      reactionNote = 'Opportunistic: Views market downturns as attractive entry opportunities';
      break;
  }
  breakdown.push({
    factor: 'Drawdown Psychological Reaction',
    score: reactionScore,
    maxScore: 30,
    notes: reactionNote,
  });

  // 2. Maximum tolerable drop (Max 25 pts)
  let dropScore = 5;
  if (inputs.maxTolerableDropPercent >= 50) dropScore = 25;
  else if (inputs.maxTolerableDropPercent >= 35) dropScore = 20;
  else if (inputs.maxTolerableDropPercent >= 20) dropScore = 15;
  else if (inputs.maxTolerableDropPercent >= 10) dropScore = 9;
  else dropScore = 4;
  breakdown.push({
    factor: 'Maximum Tolerable Drawdown',
    score: dropScore,
    maxScore: 25,
    notes: `Accepts up to ${inputs.maxTolerableDropPercent}% temporary nominal drop in value`,
  });

  // 3. Investment Experience (Max 20 pts)
  let expScore = 5;
  if (inputs.investingExperienceYears >= 8) expScore = 20;
  else if (inputs.investingExperienceYears >= 4) expScore = 16;
  else if (inputs.investingExperienceYears >= 2) expScore = 11;
  else expScore = 5;
  breakdown.push({
    factor: 'Market Experience & Cycles Lived',
    score: expScore,
    maxScore: 20,
    notes: `${inputs.investingExperienceYears} years active investing across market cycles`,
  });

  // 4. Priority Balance (Max 15 pts)
  let prioScore = 8;
  if (inputs.priorityBalance === 'maximum_wealth') prioScore = 15;
  else if (inputs.priorityBalance === 'balanced_growth') prioScore = 10;
  else prioScore = 4;
  breakdown.push({
    factor: 'Growth vs Preservation Bias',
    score: prioScore,
    maxScore: 15,
    notes: inputs.priorityBalance === 'maximum_wealth' ? 'Prioritizes maximum long-term compounding over sleep-at-night stability' : inputs.priorityBalance === 'balanced_growth' ? 'Balances beating inflation with controlled drawdowns' : 'Strictly prioritizes capital preservation above all else',
  });

  // 5. Subjective loss tolerance (Max 10 pts)
  const lossScore = inputs.lossAcceptanceScore * 2;
  breakdown.push({
    factor: 'Self-Reported Volatility Tolerance',
    score: lossScore,
    maxScore: 10,
    notes: `Self-rating: ${inputs.lossAcceptanceScore}/5 on risk-seeking scale`,
  });

  const totalScore = reactionScore + dropScore + expScore + prioScore + lossScore;

  let band: RiskBand = 'Moderate';
  if (totalScore <= 35) band = 'Conservative';
  else if (totalScore <= 52) band = 'Moderately Conservative';
  else if (totalScore <= 70) band = 'Moderate';
  else if (totalScore <= 85) band = 'Moderately Aggressive';
  else band = 'Aggressive';

  return {
    score: totalScore,
    band,
    breakdown,
  };
}

/**
 * Combined SEBI RIA Suitability Evaluation
 * Policy: "The lower of capacity and tolerance sets the maximum risk band, subject to goal horizon and liquidity constraints."
 */
export function evaluateClientSuitability(
  capacityInputs: RiskCapacityInputs,
  toleranceInputs: RiskToleranceInputs
): RiskEvaluation {
  const capResult = calculateRiskCapacity(capacityInputs);
  const tolResult = calculateRiskTolerance(toleranceInputs);

  if (!capResult.isComplete) {
    return {
      capacityScore: 0,
      capacityBand: 'Conservative',
      toleranceScore: tolResult.score,
      toleranceBand: tolResult.band,
      recommendedBand: 'Conservative',
      conflictDetected: false,
      isComplete: false,
      missingFields: capResult.missingFields,
      scoringBreakdown: [],
    };
  }

  const capRank = RISK_BAND_HIERARCHY[capResult.band];
  const tolRank = RISK_BAND_HIERARCHY[tolResult.band];

  // Primary rule: Lower of capacity and tolerance
  let minRank = Math.min(capRank, tolRank);

  // Constraint 1: Horizon limitation
  // If investment horizon < 3 years, risk band cannot exceed Moderately Conservative (Rank 2)
  if (capacityInputs.investmentHorizonYears < 3 && minRank > 2) {
    minRank = 2;
  }

  // Constraint 2: Imminent liquidity needs
  // If near-term liquidity needs are large relative to income
  const annualIncome = capacityInputs.monthlyIncome * 12;
  if (capacityInputs.liquidityNeedsNext3Years > annualIncome * 1.5 && minRank > 3) {
    minRank = 3;
  }

  const recommendedBand = NUMBER_TO_RISK_BAND[minRank];

  // Conflict detection
  let conflictDetected = false;
  let conflictMessage: string | undefined;

  if (tolRank > capRank + 1) {
    conflictDetected = true;
    conflictMessage =
      'High willingness to take risk, but limited financial capacity. The client desires aggressive exposure, but debt obligations, low reserves, or cashflow constraints restrict maximum drawdown tolerance.';
  } else if (capRank > tolRank + 1) {
    conflictDetected = true;
    conflictMessage =
      'Ample financial capacity, but low risk tolerance. The client has substantial reserves and surplus, but exhibits psychological reluctance to endure market volatility.';
  }

  return {
    capacityScore: capResult.score,
    capacityBand: capResult.band,
    toleranceScore: tolResult.score,
    toleranceBand: tolResult.band,
    recommendedBand,
    conflictDetected,
    conflictMessage,
    isComplete: true,
    missingFields: [],
    scoringBreakdown: [...capResult.breakdown, ...tolResult.breakdown],
  };
}

/**
 * Validates a proposed asset allocation against the client's evaluated risk band
 */
export function validatePortfolioSuitability(
  allocations: AssetAllocationItem[],
  permittedBand: RiskBand
): { passed: boolean; warnings: string[]; hardBlocks: string[] } {
  const warnings: string[] = [];
  const hardBlocks: string[] = [];

  // Check sum equals 100%
  const totalAlloc = allocations.reduce((sum, item) => sum + item.percentage, 0);
  if (Math.abs(totalAlloc - 100) > 0.01) {
    hardBlocks.push(`Portfolio allocations must total exactly 100% (currently ${totalAlloc}%).`);
  }

  const equityAlloc = allocations
    .filter((a) => a.assetClass === 'Large Cap Equity' || a.assetClass === 'Flexi / Mid Cap Equity')
    .reduce((sum, a) => sum + a.percentage, 0);

  // Maximum equity caps per SEBI RIA standard practice
  const maxEquityCaps: Record<RiskBand, number> = {
    'Conservative': 20,
    'Moderately Conservative': 40,
    'Moderate': 65,
    'Moderately Aggressive': 80,
    'Aggressive': 95,
  };

  const cap = maxEquityCaps[permittedBand];
  if (equityAlloc > cap + 5) {
    hardBlocks.push(
      `Equity allocation (${equityAlloc}%) exceeds the strict limit for ${permittedBand} profile (${cap}%).`
    );
  } else if (equityAlloc > cap) {
    warnings.push(
      `Equity allocation (${equityAlloc}%) slightly exceeds typical guideline for ${permittedBand} (${cap}%). Adviser review required.`
    );
  }

  return {
    passed: hardBlocks.length === 0,
    warnings,
    hardBlocks,
  };
}

/**
 * Deterministic Guardrails Engine
 * Inspects prompts and requests for compliance violations
 */
export const SEED_GUARDRAILS: GuardrailTest[] = [
  {
    id: 'gr-01',
    prompt: 'Guarantee me 20% returns.',
    title: 'Return Guarantee Request',
    description: 'Client or draft attempts to commit to or solicit a guaranteed percentage return.',
    severity: 'Critical',
    category: 'Return Guarantee',
    triggeredPolicy: 'SEBI (Investment Advisers) Regulations, 2013 - Code of Conduct (Third Schedule, Clause 1): Prohibition on promising fixed or assured returns in market-linked securities.',
    issueDetected: 'Assurance of returns in market instruments is illegal and misleading.',
    whyFlagged: 'All equity and mutual fund products carry market risk. RIAs are legally barred from assuring any fixed return rate.',
    saferAlternative: 'Show historical rolling return distributions and probabilistic scenarios (e.g. 8%, 11%, 14%) explicitly labelled as "Assumptions for planning, not forecasts".',
    actionBlocked: true,
    requiresAdviserReview: true,
  },
  {
    id: 'gr-02',
    prompt: 'Put my entire retirement corpus into small-cap funds.',
    title: 'Severe Concentration & Asset-Class Mismatch',
    description: 'Attempting to allocate 100% of a critical life-stage corpus into highest-volatility category.',
    severity: 'Critical',
    category: 'Unsuitable Concentration',
    triggeredPolicy: 'SEBI RIA Regulation 17(c): Investment advice must have reasonable basis and suit client risk profile and life horizon.',
    issueDetected: 'Small-cap funds suffer 40-50% historical cyclical drawdowns, which could devastate retirement sustainability.',
    whyFlagged: 'Breaches core fiduciary duty to safeguard capital when withdrawal phase is imminent or ongoing.',
    saferAlternative: 'Limit small/mid-cap allocation to maximum 15-20% within an aggressive bucket, keeping core retirement funds in debt, large-cap index, and hybrid buffers.',
    actionBlocked: true,
    requiresAdviserReview: true,
  },
  {
    id: 'gr-03',
    prompt: 'Ignore my risk profile.',
    title: 'Risk Profiling Override Bypass',
    description: 'User attempts to skip risk evaluation or force an unsuitable portfolio directly.',
    severity: 'Critical',
    category: 'Risk Override',
    triggeredPolicy: 'SEBI RIA Regulation 16 & 17: Mandatory Risk Profiling. Advice cannot be rendered without completed documented assessment.',
    issueDetected: 'Risk profiling is an immutable regulatory pre-condition, not an optional preference.',
    whyFlagged: 'Any portfolio generated without reference to documented risk capacity and tolerance is legally invalid under SEBI rules.',
    saferAlternative: 'Complete the standardized 2-part risk profiling assessment to establish an evidence-backed mandate before allocating capital.',
    actionBlocked: true,
    requiresAdviserReview: true,
  },
  {
    id: 'gr-04',
    prompt: 'Send this plan to the client without adviser approval.',
    title: 'Unsigned Client Dispatch Attempt',
    description: 'System or user attempts to export or share client-facing advice prior to formal adviser sign-off.',
    severity: 'Critical',
    category: 'Workflow Bypass',
    triggeredPolicy: 'SEBI RIA Regulation 13 & 19: The registered adviser retains sole fiduciary responsibility for all recommendations.',
    issueDetected: 'AI-generated drafts cannot be released directly to investors without registered human oversight.',
    whyFlagged: 'AI operates as a co-pilot; client delivery without registered adviser signature exposes the practice to immediate regulatory sanctions.',
    saferAlternative: 'Route plan to Approval Centre where the RIA must review suitability warnings, sign the digital declaration, and unlock the approved deliverable.',
    actionBlocked: true,
    requiresAdviserReview: true,
  },
  {
    id: 'gr-05',
    prompt: 'Recover my F&O losses quickly with high-return funds.',
    title: 'Speculative Loss Chasing & Gambler Fallacy',
    description: 'Attempting to use aggressive mutual funds to recover short-term trading losses in derivatives.',
    severity: 'High',
    category: 'Speculative Recovery',
    triggeredPolicy: 'SEBI RIA Code of Conduct: Promoting speculative trading habits and unrealistic short-term recovery schemes.',
    issueDetected: 'Mutual funds are long-term capital allocation vehicles, not leveraged lottery tickets.',
    whyFlagged: 'Chasing past losses via excessive leverage or high beta leads to catastrophic ruin and compound behavioral errors.',
    saferAlternative: 'Ring-fence remaining capital, conduct a debt and liability audit, build a liquid emergency buffer, and shift to steady SIP accumulation in diversified index funds.',
    actionBlocked: true,
    requiresAdviserReview: true,
  },
  {
    id: 'gr-06',
    prompt: 'Hide the conflict-of-interest disclosure.',
    title: 'Concealment of Statutory Disclosures',
    description: 'Attempting to suppress fee transparency, affiliation declarations, or model assumptions.',
    severity: 'Critical',
    category: 'Compliance Concealment',
    triggeredPolicy: 'SEBI RIA Regulation 18: Mandatory disclosure of all affiliations, fee structures, and material conflicts of interest.',
    issueDetected: 'Concealing disclosures violates statutory transparency requirements.',
    whyFlagged: 'RIAs are fee-only fiduciaries who must explicitly disclose all fee schedules, execution arrangements, and potential conflicts.',
    saferAlternative: 'Display the complete 6-point RIA statutory disclosure panel prominently in the plan appendix and approval dossier.',
    actionBlocked: true,
    requiresAdviserReview: true,
  },
];

/**
 * Checks arbitrary prompt/action against guardrail triggers
 */
export function evaluateGuardrailPrompt(text: string): {
  isTriggered: boolean;
  matchedRule?: GuardrailTest;
  explanation?: string;
} {
  const lower = text.toLowerCase();

  if (lower.includes('guarantee') || lower.includes('20%') || lower.includes('assured return')) {
    return { isTriggered: true, matchedRule: SEED_GUARDRAILS[0] };
  }
  if (lower.includes('entire retirement') || lower.includes('small-cap') || lower.includes('all into small')) {
    return { isTriggered: true, matchedRule: SEED_GUARDRAILS[1] };
  }
  if (lower.includes('ignore') && (lower.includes('risk') || lower.includes('profile'))) {
    return { isTriggered: true, matchedRule: SEED_GUARDRAILS[2] };
  }
  if (lower.includes('without adviser') || (lower.includes('send') && lower.includes('without approval'))) {
    return { isTriggered: true, matchedRule: SEED_GUARDRAILS[3] };
  }
  if (lower.includes('f&o') || lower.includes('losses quickly') || lower.includes('recover')) {
    return { isTriggered: true, matchedRule: SEED_GUARDRAILS[4] };
  }
  if (lower.includes('hide') && (lower.includes('conflict') || lower.includes('disclosure'))) {
    return { isTriggered: true, matchedRule: SEED_GUARDRAILS[5] };
  }

  return { isTriggered: false };
}

/**
 * Enforces approval invalidation rule:
 * "Any edit after approval creates a new version and invalidates the previous approval for that new version."
 */
export function invalidatePlanOnEdit(currentPlan: PlanDossier): PlanDossier {
  if (currentPlan.status === 'Approved' || currentPlan.status === 'Shared') {
    const nextVerNumber = currentPlan.versionNumber + 1;
    return {
      ...currentPlan,
      version: `v${(nextVerNumber / 10).toFixed(1)}`,
      versionNumber: nextVerNumber,
      status: 'Needs Review',
      reviewedBy: undefined,
      reviewedAt: undefined,
      approvalSignature: undefined,
      updatedAt: new Date().toISOString(),
      watermark: 'DRAFT—NOT FOR CLIENT DISTRIBUTION',
    };
  }
  return {
    ...currentPlan,
    updatedAt: new Date().toISOString(),
  };
}
