/**
 * AdvisoryOS Portfolio Lab (Screen 4)
 * Direct-plan mutual funds shortlist, portfolio construction, allocation controls & 10-year backtest.
 */

import React, { useState } from 'react';
import { useAdvisory } from '../context/AdvisoryContext';
import {
  PieChart as PieIcon,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sliders,
  History,
  Info,
  TrendingUp,
  Layers,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { formatINR, formatPercent } from '../utils/formatters';
import { runPortfolioBacktest } from '../utils/financialMath';
import { validatePortfolioSuitability } from '../utils/suitabilityRules';
import { AssetAllocationItem, DirectFund } from '../types/advisory';

const ASSET_COLORS: Record<string, string> = {
  'Large Cap Equity': '#0D9488', // Teal
  'Flexi / Mid Cap Equity': '#6366F1', // Indigo
  'High Quality Debt': '#38BDF8', // Sky Blue
  'Arbitrage / Liquid': '#F59E0B', // Amber
  'Sovereign Gold': '#EAB308', // Gold
};

export const PortfolioLabScreen: React.FC = () => {
  const {
    selectedClient,
    funds,
    updateProposedAllocations,
    setActiveTab,
  } = useAdvisory();

  // Current proposed allocations
  const currentAllocations: AssetAllocationItem[] = selectedClient.proposedPortfolio?.allocations || [
    { assetClass: 'Large Cap Equity', percentage: 40, fundIds: ['fund-nifty50'], rationale: 'Core low-cost passive compounding' },
    { assetClass: 'Flexi / Mid Cap Equity', percentage: 20, fundIds: ['fund-flexicap'], rationale: 'Mid & multi-cap alpha opportunities' },
    { assetClass: 'High Quality Debt', percentage: 25, fundIds: ['fund-corpbond'], rationale: 'Capital preservation & steady accrual' },
    { assetClass: 'Arbitrage / Liquid', percentage: 10, fundIds: ['fund-liquid'], rationale: 'Liquidity buffer' },
    { assetClass: 'Sovereign Gold', percentage: 5, fundIds: ['fund-gold'], rationale: 'Currency & macro hedge' },
  ];

  const [allocations, setAllocations] = useState<AssetAllocationItem[]>(currentAllocations);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [comparedFundIds, setComparedFundIds] = useState<string[]>(['fund-nifty50', 'fund-flexicap']);
  const [activeSubTab, setActiveSubTab] = useState<'construction' | 'backtest' | 'compare'>('construction');

  // Calculate allocation weights for backtest
  const largeCapWeight = allocations.find((a) => a.assetClass === 'Large Cap Equity')?.percentage || 0;
  const flexiCapWeight = allocations.find((a) => a.assetClass === 'Flexi / Mid Cap Equity')?.percentage || 0;
  const debtWeight = allocations.find((a) => a.assetClass === 'High Quality Debt')?.percentage || 0;
  const liquidWeight = allocations.find((a) => a.assetClass === 'Arbitrage / Liquid')?.percentage || 0;
  const goldWeight = allocations.find((a) => a.assetClass === 'Sovereign Gold')?.percentage || 0;

  const totalAllocation = allocations.reduce((sum, a) => sum + a.percentage, 0);

  // Validate suitability against client's permitted risk band
  const permittedBand = selectedClient.proposedPortfolio?.targetRiskBand || 'Moderate';
  const validation = validatePortfolioSuitability(allocations, permittedBand);

  // Run backtest
  const backtestSummary = runPortfolioBacktest({
    largeCap: largeCapWeight,
    flexiCap: flexiCapWeight,
    debt: debtWeight,
    liquid: liquidWeight,
    gold: goldWeight,
  });

  const handlePercentageChange = (assetClass: AssetAllocationItem['assetClass'], newVal: number) => {
    const val = Math.max(0, Math.min(100, newVal));
    const updated = allocations.map((a) => (a.assetClass === assetClass ? { ...a, percentage: val } : a));
    setAllocations(updated);
  };

  const handleSaveAllocations = () => {
    updateProposedAllocations(selectedClient.id, allocations);
  };

  const toggleCompareFund = (id: string) => {
    if (comparedFundIds.includes(id)) {
      setComparedFundIds(comparedFundIds.filter((f) => f !== id));
    } else {
      if (comparedFundIds.length < 3) {
        setComparedFundIds([...comparedFundIds, id]);
      }
    }
  };

  // Filtered funds
  const filteredFunds = funds.filter((f) => {
    if (selectedCategoryFilter === 'All') return true;
    return f.category === selectedCategoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#10243A]">Portfolio Construction & Lab</h1>
          <p className="text-xs text-slate-500">
            Direct-Plan Mutual Fund Shortlist, Asset Allocation Engine, and 10-Year Backtest Simulator
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('construction')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeSubTab === 'construction' ? 'bg-white text-[#10243A] shadow-xs' : 'text-slate-600'
              }`}
            >
              Portfolio & Allocation
            </button>
            <button
              onClick={() => setActiveSubTab('backtest')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeSubTab === 'backtest' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              10-Year Backtest
            </button>
            <button
              onClick={() => setActiveSubTab('compare')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeSubTab === 'compare' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Fund Comparison ({comparedFundIds.length})
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Construction & Allocation */}
      {activeSubTab === 'construction' && (
        <div className="space-y-6">
          {/* Main Grid: Allocation Controls & Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Allocation Sliders */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="font-bold text-sm text-[#10243A]">Asset Class Allocation Mix</h2>
                  <p className="text-[11px] text-slate-500">
                    Mandate: {permittedBand} • Must total exactly 100%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold text-xs px-2.5 py-1 rounded-full ${
                      totalAllocation === 100
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    Total: {totalAllocation}%
                  </span>
                  <button
                    onClick={handleSaveAllocations}
                    disabled={totalAllocation !== 100}
                    className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs px-3 py-1 rounded-lg transition-colors"
                  >
                    Apply Allocation
                  </button>
                </div>
              </div>

              {/* Validation Alerts */}
              {!validation.passed && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Suitability Blockers Detected</span>
                  </div>
                  {validation.hardBlocks.map((b, i) => (
                    <p key={i} className="text-[11px] pl-6">• {b}</p>
                  ))}
                </div>
              )}

              {/* Sliders list */}
              <div className="space-y-3.5 text-xs">
                {allocations.map((item) => (
                  <div key={item.assetClass} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: ASSET_COLORS[item.assetClass] || '#6366F1' }}
                        />
                        <span className="font-bold text-slate-800">{item.assetClass}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.percentage}
                          onChange={(e) => handlePercentageChange(item.assetClass, Number(e.target.value))}
                          className="w-14 p-1 text-right font-mono font-bold bg-white rounded border border-slate-200 focus:ring-1 focus:ring-teal-500 text-xs"
                        />
                        <span className="font-bold text-slate-500">%</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={item.percentage}
                      onChange={(e) => handlePercentageChange(item.assetClass, Number(e.target.value))}
                      className="w-full accent-teal-600 cursor-pointer"
                    />

                    <p className="text-[11px] text-slate-500 italic">{item.rationale}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 5 Cols: Visual Donut Chart */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#10243A]">Model Portfolio Visualizer</h3>
                <p className="text-[11px] text-slate-500">Asset weighting breakdown for {selectedClient.name}</p>

                <div className="h-56 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocations}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="percentage"
                        nameKey="assetClass"
                      >
                        {allocations.map((entry) => (
                          <Cell
                            key={entry.assetClass}
                            fill={ASSET_COLORS[entry.assetClass] || '#6366F1'}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => [`${val}%`, 'Allocation']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Equity Exposure:</span>
                    <strong className="font-mono text-teal-800">{largeCapWeight + flexiCapWeight}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Debt & Liquid Buffer:</span>
                    <strong className="font-mono text-indigo-800">{debtWeight + liquidWeight}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gold / Macro Hedge:</span>
                    <strong className="font-mono text-amber-700">{goldWeight}%</strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Rebalancing Frequency:</span>
                <span className="font-bold text-slate-800 font-mono">Annual Review</span>
              </div>
            </div>
          </div>

          {/* Direct-Plan Mutual Funds Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-sm text-[#10243A]">Direct-Plan Mutual Fund Shortlist</h3>
                <p className="text-[11px] text-slate-500">
                  Strictly Direct Plans only. Zero commissions. Source verified via factsheets & SIDs.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  aria-label="Filter Funds by Category"
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold p-1 px-2 text-slate-700 focus:ring-1 focus:ring-teal-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Large Cap Index">Large Cap Index</option>
                  <option value="Flexi Cap">Flexi Cap</option>
                  <option value="Corporate Bond">Corporate Bond</option>
                  <option value="Short Duration Debt">Short Duration Debt</option>
                  <option value="Liquid">Liquid Reserve</option>
                  <option value="Gold / Multi Asset">Gold ETF Proxy</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5">Scheme & Identifier</th>
                    <th className="pb-2.5">Category</th>
                    <th className="pb-2.5">Direct TER</th>
                    <th className="pb-2.5">AUM (Cr)</th>
                    <th className="pb-2.5">3Y CAGR</th>
                    <th className="pb-2.5">Max 1Y DD</th>
                    <th className="pb-2.5">Tracking Error</th>
                    <th className="pb-2.5">Manager</th>
                    <th className="pb-2.5 text-right">Compare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredFunds.map((f) => {
                    const isCompared = comparedFundIds.includes(f.id);
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 pr-2">
                          <div className="font-bold text-[#10243A] flex items-center gap-1.5">
                            <span>{f.name}</span>
                            <span className="text-[10px] bg-teal-50 text-teal-700 px-1.5 py-0.2 rounded font-bold border border-teal-200">
                              DIRECT
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">ISIN: {f.isin}</div>
                        </td>
                        <td className="py-3 pr-2">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                            {f.category}
                          </span>
                        </td>
                        <td className="py-3 pr-2 font-mono font-bold text-teal-700">
                          {formatPercent(f.expenseRatio, 2)}
                        </td>
                        <td className="py-3 pr-2 font-mono text-slate-700">
                          ₹{f.aumCrores.toLocaleString('en-IN')} Cr
                        </td>
                        <td className="py-3 pr-2 font-mono font-bold text-emerald-600">
                          +{f.cagr3Y}%
                        </td>
                        <td className="py-3 pr-2 font-mono text-rose-600">
                          {f.maxDrawdown1Y}%
                        </td>
                        <td className="py-3 pr-2 font-mono text-slate-600">
                          {f.trackingError !== undefined ? `${f.trackingError}%` : 'N/A (Active)'}
                        </td>
                        <td className="py-3 pr-2 text-slate-600">
                          {f.managerTenureYears}y tenure
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => toggleCompareFund(f.id)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                              isCompared
                                ? 'bg-teal-50 border-teal-400 text-teal-700'
                                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {isCompared ? 'Comparing ✓' : '+ Compare'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>* Fictional demo fund names with realistic underlying index properties.</span>
              <span
                onClick={() => setActiveTab('research')}
                className="text-teal-600 font-semibold cursor-pointer hover:underline"
              >
                Inspect Scheme SIDs in Research Copilot →
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: 10-Year Backtest */}
      {activeSubTab === 'backtest' && (
        <div className="space-y-6">
          {/* Prominent Watermark Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="block text-sm font-bold text-amber-950 uppercase tracking-wide">
                  Synthetic Demo Backtest — Not Actual Fund Performance
                </strong>
                <p className="text-[11px] text-amber-800">
                  Calculated from fixed 2016–2025 synthetic proxy indices (Nifty 50 TRI, Nifty 500 Multicap, Crisil Composite Bond, Crisil Liquid, Gold).
                  Past performance does not guarantee future returns.
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold bg-amber-200/60 px-3 py-1.5 rounded-lg border border-amber-300 shrink-0">
              10-Year Horizon (2016-2025)
            </span>
          </div>

          {/* Backtest KPI Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Growth of ₹1,00,000</span>
              <div className="mt-1 text-2xl font-extrabold font-mono text-[#10243A]">
                {formatINR(backtestSummary.finalPortfolioValue)}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Benchmark: {formatINR(backtestSummary.finalBenchmarkValue)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-teal-700 block">10-Year CAGR</span>
              <div className="mt-1 text-2xl font-extrabold font-mono text-teal-800">
                {backtestSummary.cagrPortfolio}%
              </div>
              <span className="text-[10px] text-teal-700 mt-1 block">
                Nifty 50 TRI: {backtestSummary.cagrBenchmark}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Annualised Volatility</span>
              <div className="mt-1 text-2xl font-extrabold font-mono text-slate-800">
                {backtestSummary.volatilityPortfolio}%
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Standard deviation of yearly returns</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Max Historical Drawdown</span>
              <div className="mt-1 text-2xl font-extrabold font-mono text-rose-600">
                -{backtestSummary.maxDrawdownPortfolio}%
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">Peak-to-trough decline</span>
            </div>
          </div>

          {/* Growth Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 relative">
            {/* Watermark in background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
              <span className="text-5xl font-extrabold text-slate-900 rotate-12">SYNTHETIC DEMO BACKTEST</span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-[#10243A]">Portfolio Growth vs Nifty 50 TRI Benchmark</h3>
                <p className="text-[11px] text-slate-500">Starting capital: ₹1,00,000 in January 2016 (Annual Rebalancing)</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={backtestSummary.yearlyHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val: any) => [`₹${val.toLocaleString('en-IN')}`, 'Value']} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Line
                    type="monotone"
                    dataKey="portfolioValue"
                    name="Proposed Model Portfolio"
                    stroke="#0D9488"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmarkValue"
                    name="Nifty 50 TRI (100% Equity Benchmark)"
                    stroke="#6366F1"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Year-by-Year Historical Returns Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h3 className="font-bold text-sm text-[#10243A] mb-3">Calendar Year Performance History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-2">Year</th>
                    <th className="pb-2">Large Cap</th>
                    <th className="pb-2">Flexi Cap</th>
                    <th className="pb-2">Debt</th>
                    <th className="pb-2">Liquid</th>
                    <th className="pb-2">Gold</th>
                    <th className="pb-2 font-bold text-teal-800">Portfolio Blend</th>
                    <th className="pb-2 font-bold text-indigo-700">Benchmark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {backtestSummary.yearlyHistory.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/60 font-mono text-[11px]">
                      <td className="py-2 font-bold text-[#10243A]">{row.year}</td>
                      <td className="py-2 text-slate-600">+{row.largeCapReturn}%</td>
                      <td className="py-2 text-slate-600">{row.flexiCapReturn > 0 ? `+${row.flexiCapReturn}` : row.flexiCapReturn}%</td>
                      <td className="py-2 text-slate-600">+{row.debtReturn}%</td>
                      <td className="py-2 text-slate-600">+{row.liquidReturn}%</td>
                      <td className="py-2 text-slate-600">{row.goldReturn > 0 ? `+${row.goldReturn}` : row.goldReturn}%</td>
                      <td className="py-2 font-bold text-teal-700">+{row.portfolioReturn}%</td>
                      <td className="py-2 font-bold text-indigo-600">+{row.benchmarkReturn}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Fund Comparison */}
      {activeSubTab === 'compare' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-[#10243A]">Side-by-Side Fund Attribute Comparison</h3>
              <p className="text-[11px] text-slate-500">
                Comparing {comparedFundIds.length} shortlisted direct funds
              </p>
            </div>
            <button
              onClick={() => setActiveSubTab('construction')}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              ← Back to Portfolio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparedFundIds.map((id) => {
              const fund = funds.find((f) => f.id === id);
              if (!fund) return null;
              return (
                <div key={fund.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase bg-teal-100/60 px-1.5 py-0.5 rounded">
                      {fund.category}
                    </span>
                    <h4 className="font-bold text-sm text-[#10243A] mt-1">{fund.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">ISIN: {fund.isin}</span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200/60 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Direct Expense Ratio:</span>
                      <strong className="font-mono text-teal-800">{fund.expenseRatio}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">AUM:</span>
                      <span className="font-mono text-slate-800">₹{fund.aumCrores} Cr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">3Y CAGR:</span>
                      <span className="font-mono font-bold text-emerald-600">+{fund.cagr3Y}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">1Y Max Drawdown:</span>
                      <span className="font-mono text-rose-600">{fund.maxDrawdown1Y}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tracking Error:</span>
                      <span className="font-mono text-slate-800">
                        {fund.trackingError !== undefined ? `${fund.trackingError}%` : 'N/A (Active)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Manager Tenure:</span>
                      <span className="text-slate-800">{fund.managerTenureYears} Years</span>
                    </div>
                  </div>

                  <p className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                    <strong>Suitability Rationale:</strong> {fund.suitabilityNote}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
