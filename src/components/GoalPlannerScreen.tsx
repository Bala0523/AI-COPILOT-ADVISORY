/**
 * AdvisoryOS Goal Planner (Screen 3)
 * Deterministic financial calculator for inflation-adjusted goals, retirement annuities, SIPs, glidepaths, and scenarios.
 */

import React, { useState } from 'react';
import { useAdvisory } from '../context/AdvisoryContext';
import {
  Target,
  Calculator,
  HelpCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Save,
  Clock,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  calculateGoalPlan,
  calculateRetirementPlan,
  calculateScenarios,
  calculateGlidePath,
} from '../utils/financialMath';
import { formatINR } from '../utils/formatters';
import { ClientGoal } from '../types/advisory';

export const GoalPlannerScreen: React.FC = () => {
  const { selectedClient, updateClientGoal, setActiveTab } = useAdvisory();

  // Selected goal
  const [selectedGoalId, setSelectedGoalId] = useState<string>(
    selectedClient.goals[0]?.id || ''
  );

  const activeGoal =
    selectedClient.goals.find((g) => g.id === selectedGoalId) ||
    selectedClient.goals[0] || {
      id: 'custom-goal',
      name: 'Custom Wealth Goal',
      type: 'wealth_accumulation' as const,
      targetYear: 2036,
      presentCost: 2000000,
      futureTargetCorpus: 3500000,
      currentEarmarked: 200000,
      monthlyContributionBudget: 25000,
      requiredMonthlySip: 18000,
      assumedAnnualReturn: 0.11,
      assumedInflationRate: 0.06,
      fundingGap: 3000000,
      fundingStatus: 'On Track' as const,
    };

  // Editable simulation states
  const [presentCost, setPresentCost] = useState<number>(activeGoal.presentCost);
  const [targetYear, setTargetYear] = useState<number>(activeGoal.targetYear);
  const [currentEarmarked, setCurrentEarmarked] = useState<number>(activeGoal.currentEarmarked);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(activeGoal.monthlyContributionBudget);
  const [inflationRate, setInflationRate] = useState<number>(activeGoal.assumedInflationRate);
  const [annualReturn, setAnnualReturn] = useState<number>(activeGoal.assumedAnnualReturn);
  const [isRetirement, setIsRetirement] = useState<boolean>(activeGoal.isRetirement || false);
  const [pensionMonthly, setPensionMonthly] = useState<number>(activeGoal.pensionMonthly || 0);
  const [desiredMonthlyExpense, setDesiredMonthlyExpense] = useState<number>(
    activeGoal.desiredMonthlyIncome || 60000
  );
  const [retirementDurationYears, setRetirementDurationYears] = useState<number>(
    activeGoal.retirementYears || 25
  );

  const [showFormulaDrawer, setShowFormulaDrawer] = useState<boolean>(false);
  const [savedSuccessNotice, setSavedSuccessNotice] = useState<boolean>(false);

  const currentYear = 2026;
  const targetYears = Math.max(1, targetYear - currentYear);

  // Run calculation
  const planResult = calculateGoalPlan({
    presentCost: isRetirement ? desiredMonthlyExpense * 12 * 20 : presentCost,
    targetYears,
    assumedInflationRate: inflationRate,
    currentEarmarked,
    assumedAnnualReturn: annualReturn,
    monthlyContributionBudget: monthlyBudget,
  });

  // Retirement specific calculation
  const retirementResult = isRetirement
    ? calculateRetirementPlan({
        currentAge: selectedClient.age,
        retirementAge: selectedClient.age + targetYears,
        lifeExpectancyAge: selectedClient.age + targetYears + retirementDurationYears,
        currentMonthlyExpense: desiredMonthlyExpense,
        inflationPreRetirement: inflationRate,
        inflationPostRetirement: Math.max(0.04, inflationRate - 0.01),
        preRetirementReturn: annualReturn,
        postRetirementReturn: Math.max(0.06, annualReturn - 0.03),
        currentRetirementSavings: currentEarmarked,
        expectedMonthlyPension: pensionMonthly,
      })
    : null;

  const effectiveFutureTarget = isRetirement && retirementResult
    ? retirementResult.targetRetirementCorpus
    : planResult.futureTargetCorpus;

  const effectiveRequiredSip = isRetirement && retirementResult
    ? retirementResult.requiredMonthlySip
    : planResult.requiredMonthlySip;

  const scenarios = calculateScenarios(
    Math.max(0, effectiveFutureTarget - currentEarmarked),
    targetYears,
    annualReturn
  );

  // Dynamic Glide Path
  const baseEquity = selectedClient.proposedPortfolio?.targetRiskBand === 'Conservative' ? 20 : 65;
  const glidePath = calculateGlidePath(currentYear, targetYear, baseEquity);

  // Wealth Accumulation projection series
  const projectionSeries = [];
  let runningSavings = currentEarmarked;
  for (let y = 0; y <= targetYears; y++) {
    const yr = currentYear + y;
    const invested = currentEarmarked + effectiveRequiredSip * 12 * y;
    if (y > 0) {
      runningSavings = runningSavings * (1 + annualReturn) + effectiveRequiredSip * 12;
    }
    projectionSeries.push({
      year: yr,
      Invested: Math.round(invested / 100000),
      ProjectedWealth: Math.round(runningSavings / 100000),
      TargetGoal: Math.round(effectiveFutureTarget / 100000),
    });
  }

  // Handle saving goal updates
  const handleSaveGoal = () => {
    const updated: ClientGoal = {
      ...activeGoal,
      presentCost,
      targetYear,
      futureTargetCorpus: effectiveFutureTarget,
      currentEarmarked,
      monthlyContributionBudget: monthlyBudget,
      requiredMonthlySip: effectiveRequiredSip,
      assumedAnnualReturn: annualReturn,
      assumedInflationRate: inflationRate,
      fundingGap: Math.max(0, effectiveFutureTarget - currentEarmarked),
      fundingStatus: effectiveRequiredSip === 0 ? 'Fully Funded' : 'On Track',
      isRetirement,
      pensionMonthly,
      desiredMonthlyIncome: desiredMonthlyExpense,
      retirementYears: retirementDurationYears,
    };

    updateClientGoal(selectedClient.id, updated);
    setSavedSuccessNotice(true);
    setTimeout(() => setSavedSuccessNotice(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#10243A]">Goal Planner & Cashflow Engine</h1>
          <p className="text-xs text-slate-500">
            Inflation-compounded corpus simulations, annuity drawdown modeling, and dynamic glide paths
          </p>
        </div>

        {/* Goal Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Goal:</span>
          <select
            aria-label="Documented Financial Goal Selector"
            value={activeGoal.id}
            onChange={(e) => {
              const g = selectedClient.goals.find((goal) => goal.id === e.target.value);
              if (g) {
                setSelectedGoalId(g.id);
                setPresentCost(g.presentCost);
                setTargetYear(g.targetYear);
                setCurrentEarmarked(g.currentEarmarked);
                setMonthlyBudget(g.monthlyContributionBudget);
                setInflationRate(g.assumedInflationRate);
                setAnnualReturn(g.assumedAnnualReturn);
                setIsRetirement(g.isRetirement || false);
                setPensionMonthly(g.pensionMonthly || 0);
                setDesiredMonthlyExpense(g.desiredMonthlyIncome || 60000);
                setRetirementDurationYears(g.retirementYears || 25);
              }
            }}
            className="p-1.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#10243A] focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            {selectedClient.goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.targetYear})
              </option>
            ))}
          </select>

          <button
            onClick={handleSaveGoal}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to Plan</span>
          </button>
        </div>
      </div>

      {savedSuccessNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            Goal parameters saved for {selectedClient.name}. Any existing approved plan was re-versioned to Needs Review.
          </span>
        </div>
      )}

      {/* Main Grid: Inputs vs Output Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Inputs & Parameters */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-bold text-sm text-[#10243A] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-teal-600" />
              <span>Goal Parameters & Assumptions</span>
            </h2>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
              Horizon: {targetYears} Years
            </span>
          </div>

          {/* Goal Type Toggle: Standard vs Retirement */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setIsRetirement(false)}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                !isRetirement ? 'bg-white text-[#10243A] shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Accumulation Goal
            </button>
            <button
              onClick={() => setIsRetirement(true)}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                isRetirement ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Retirement Cashflow & SWP
            </button>
          </div>

          {/* Input Controls */}
          <div className="space-y-3.5 text-xs">
            {!isRetirement ? (
              <div>
                <label className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Present-Day Cost (Today's ₹)</span>
                  <span className="font-mono text-teal-700">{formatINR(presentCost)}</span>
                </label>
                <input
                  type="number"
                  step="50000"
                  value={presentCost}
                  onChange={(e) => setPresentCost(Math.max(10000, Number(e.target.value)))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:ring-1 focus:ring-teal-500"
                />
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-indigo-50/40 rounded-xl border border-indigo-100">
                <div>
                  <label className="flex justify-between font-semibold text-indigo-950 mb-1">
                    <span>Desired Monthly Retirement Expense (₹)</span>
                    <span className="font-mono text-indigo-700">{formatINR(desiredMonthlyExpense)}/mo</span>
                  </label>
                  <input
                    type="number"
                    step="5000"
                    value={desiredMonthlyExpense}
                    onChange={(e) => setDesiredMonthlyExpense(Math.max(10000, Number(e.target.value)))}
                    className="w-full p-2 bg-white border border-indigo-200 rounded-lg font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-950 mb-1">
                      Expected Pension (₹/mo)
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={pensionMonthly}
                      onChange={(e) => setPensionMonthly(Math.max(0, Number(e.target.value)))}
                      className="w-full p-2 bg-white border border-indigo-200 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-950 mb-1">
                      Retirement Years
                    </label>
                    <input
                      type="number"
                      value={retirementDurationYears}
                      onChange={(e) => setRetirementDurationYears(Math.max(5, Number(e.target.value)))}
                      className="w-full p-2 bg-white border border-indigo-200 rounded-lg font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Target Date / Year</span>
                <span className="font-bold text-slate-900">
                  {targetYear} ({targetYears} years away)
                </span>
              </label>
              <input
                type="range"
                min={currentYear + 1}
                max={currentYear + 35}
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Current Earmarked (₹)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={currentEarmarked}
                  onChange={(e) => setCurrentEarmarked(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Monthly Budget (₹)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Math.max(0, Number(e.target.value)))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white"
                />
              </div>
            </div>

            {/* Assumptions Sliders */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Inflation Assumption:</span>
                  <span className="font-mono text-amber-700 font-bold">{(inflationRate * 100).toFixed(1)}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="0.03"
                  max="0.10"
                  step="0.005"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Assumptions, not forecasts</span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                  <span>Assumed Portfolio CAGR:</span>
                  <span className="font-mono text-teal-700 font-bold">{(annualReturn * 100).toFixed(1)}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.15"
                  step="0.005"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">
                  Target Band limit: {selectedClient.proposedPortfolio?.targetRiskBand}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 7 Cols: Calculated Outputs & Visual Wealth Trajectory */}
        <div className="lg:col-span-7 space-y-4">
          {/* Output Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Target Corpus */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Target Corpus ({targetYear})
              </span>
              <div className="mt-1 text-xl font-extrabold font-mono text-[#10243A]">
                {formatINR(effectiveFutureTarget, { compact: true })}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Full: {formatINR(effectiveFutureTarget)}
              </span>
            </div>

            {/* Required Monthly SIP */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                Required Monthly SIP
              </span>
              <div className="mt-1 text-xl font-extrabold font-mono text-teal-800">
                {formatINR(effectiveRequiredSip)}/mo
              </div>
              <span className="text-[10px] text-teal-700 mt-1 block">
                Monthly Compounding Annuity Due
              </span>
            </div>

            {/* Affordability Delta */}
            <div
              className={`p-4 rounded-2xl border shadow-xs ${
                monthlyBudget >= effectiveRequiredSip
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/60 border-rose-200 text-rose-900'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                Affordability Status
              </span>
              <div className="mt-1 text-lg font-extrabold font-mono">
                {monthlyBudget >= effectiveRequiredSip ? 'Adequate' : 'Deficit Shortfall'}
              </div>
              <span className="text-[10px] mt-1 block font-mono">
                {monthlyBudget >= effectiveRequiredSip
                  ? `+${formatINR(monthlyBudget - effectiveRequiredSip)}/mo Surplus`
                  : `-${formatINR(effectiveRequiredSip - monthlyBudget)}/mo Gap`}
              </span>
            </div>
          </div>

          {/* Affordability Warning Banner if deficit */}
          {monthlyBudget < effectiveRequiredSip && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <strong>Affordability Warning:</strong> Required SIP of {formatINR(effectiveRequiredSip)}/mo exceeds declared budget of {formatINR(monthlyBudget)}/mo.
                Consider extending horizon to {targetYear + 2} or adjusting retirement spend.
              </div>
            </div>
          )}

          {/* Wealth Trajectory Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-sm text-[#10243A]">Projected Wealth Accumulation Trajectory</h3>
                <p className="text-[11px] text-slate-500">Year-by-year compounding at {(annualReturn * 100).toFixed(1)}%</p>
              </div>
              <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold">
                ₹ in Lakhs
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(val: any) => [`₹${val} Lakhs`, '']} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                  <Area
                    type="monotone"
                    dataKey="ProjectedWealth"
                    name="Projected Corpus"
                    stroke="#0D9488"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#wealthGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Invested"
                    name="Total Principal Injected"
                    stroke="#6366F1"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3 Scenarios Cards: Lower / Base / Higher */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Conservative Scenario</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">{scenarios.lower.rate}% CAGR</div>
              <p className="text-[11px] text-slate-600 mt-1">
                SIP: <strong className="font-mono">{formatINR(scenarios.lower.sip)}/mo</strong>
              </p>
            </div>

            <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200 text-xs">
              <span className="text-[10px] text-teal-600 font-semibold block uppercase">Base Scenario</span>
              <div className="font-bold text-teal-900 text-sm mt-0.5">{scenarios.base.rate}% CAGR</div>
              <p className="text-[11px] text-teal-800 mt-1">
                SIP: <strong className="font-mono">{formatINR(scenarios.base.sip)}/mo</strong>
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Optimistic Scenario</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">{scenarios.higher.rate}% CAGR</div>
              <p className="text-[11px] text-slate-600 mt-1">
                SIP: <strong className="font-mono">{formatINR(scenarios.higher.sip)}/mo</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Glide Path Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-sm text-[#10243A]">Dynamic Asset Glide Path</h3>
            <p className="text-[11px] text-slate-500">
              Systematic equity de-risking into debt & cash buffers as {activeGoal.name} approaches {targetYear}
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">3-Year De-risking Policy</span>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={glidePath} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="year" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip formatter={(val: any) => [`${val}%`, '']} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
              <Bar dataKey="equityPercent" name="Equity %" fill="#0D9488" stackId="a" />
              <Bar dataKey="debtPercent" name="Debt %" fill="#6366F1" stackId="a" />
              <Bar dataKey="cashPercent" name="Liquid Cash Buffer %" fill="#F59E0B" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expandable "How this is calculated" Panel */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
        <button
          onClick={() => setShowFormulaDrawer(!showFormulaDrawer)}
          className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-xs text-[#10243A]">
              How this is calculated: Transparent Math, Formulas & Regulatory Assumptions
            </span>
          </div>
          {showFormulaDrawer ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {showFormulaDrawer && (
          <div className="p-5 space-y-4 text-xs text-slate-700 bg-white border-t border-slate-200">
            <div>
              <h4 className="font-bold text-[#10243A] mb-1">1. Future Value of Inflation-Adjusted Goal</h4>
              <p className="font-mono bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] text-slate-800">
                FV = PV × (1 + i)^n
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Where PV = Present cost (₹{presentCost.toLocaleString('en-IN')}), i = {(inflationRate * 100).toFixed(1)}% annual inflation, n = {targetYears} years.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#10243A] mb-1">2. Required Monthly Systematic Investment Plan (SIP)</h4>
              <p className="font-mono bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] text-slate-800">
                SIP = NetCorpusNeeded / [ ((1 + r_m)^m - 1) / r_m × (1 + r_m) ]
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Where r_m = Assumed annual return / 12 ({(annualReturn / 12 * 100).toFixed(3)}%/mo) and m = {targetYears * 12} monthly compounding periods (Annuity Due).
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#10243A] mb-1">3. Retirement Capitalization Annuity</h4>
              <p className="font-mono bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] text-slate-800">
                Corpus = AnnualWithdrawal × [ (1 - (1 + r_real)^(-N)) / r_real ]
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Where r_real = (1 + r_post) / (1 + infl_post) - 1, and N = {retirementDurationYears} years of retirement longevity.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-[11px]">
              <strong>Adviser Responsibility:</strong> In accordance with SEBI circular SEBI/HO/IMD/DF1/CIR/P/2020/182, mathematical projections do not constitute performance guarantees or forward promises. Return assumptions must be tailored to client risk band.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
