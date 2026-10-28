/**
 * AdvisoryOS Clients & Risk Profiling (Screen 2)
 * Features 6 personas, independent Capacity vs Tolerance evaluation, conflict detection, and interactive tabs.
 */

import React, { useState } from 'react';
import { useAdvisory } from '../context/AdvisoryContext';
import {
  Users,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Target,
  PieChart,
  FileText,
  Activity,
  Edit3,
  HelpCircle,
  TrendingUp,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import {
  evaluateClientSuitability,
  calculateRiskCapacity,
  calculateRiskTolerance,
} from '../utils/suitabilityRules';
import { formatINR } from '../utils/formatters';
import { RiskBand } from '../types/advisory';

export const ClientsScreen: React.FC = () => {
  const {
    clients,
    selectedClientId,
    selectClient,
    selectedClient,
    updateClientCapacity,
    updateClientTolerance,
    setActiveTab,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useAdvisory();

  const [activeSubTab, setActiveSubTab] = useState<
    'overview' | 'risk_profile' | 'goals' | 'portfolio' | 'documents' | 'activity'
  >('risk_profile');

  const [showScoringRules, setShowScoringRules] = useState<boolean>(true);
  const [isEditingRisk, setIsEditingRisk] = useState<boolean>(false);

  // Filter clients based on search query
  const filteredClients = clients.filter((c) => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.occupation.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  // Evaluate suitability
  const suitability = evaluateClientSuitability(
    selectedClient.riskCapacity,
    selectedClient.riskTolerance
  );

  return (
    <div className="space-y-6">
      {/* Top Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#10243A]">Clients & Risk Profiling</h1>
          <p className="text-xs text-slate-500">
            SEBI Regulation 17 Mandate: Independent Capacity vs Tolerance Assessment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter Personas:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => selectClient(c.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  c.id === selectedClientId
                    ? 'bg-white text-[#10243A] shadow-xs'
                    : 'text-slate-600 hover:text-[#10243A]'
                }`}
              >
                {c.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6 Persona Selection Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredClients.map((client) => {
          const isSelected = client.id === selectedClientId;
          const evalResult = evaluateClientSuitability(client.riskCapacity, client.riskTolerance);

          return (
            <div
              key={client.id}
              onClick={() => selectClient(client.id)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                isSelected
                  ? 'bg-teal-50/40 border-teal-500 shadow-sm ring-1 ring-teal-500'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#10243A]">{client.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({client.code})</span>
                  </div>
                  <div className="text-[11px] text-slate-500">{client.occupation}</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold shrink-0">
                  Age {client.age}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 line-clamp-2 mb-3 bg-slate-50/80 p-1.5 rounded-lg border border-slate-100">
                {client.personaSummary}
              </p>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
                <span className="text-slate-400">
                  Take-home: <strong className="text-slate-700 font-mono">{formatINR(client.monthlyTakeHome)}/m</strong>
                </span>

                <div className="flex items-center gap-1">
                  {evalResult.conflictDetected && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      <AlertTriangle className="w-2.5 h-2.5 text-rose-600" /> Conflict
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {evalResult.recommendedBand}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Client Profile Dossier */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Client Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-[#10243A] text-white p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-indigo-500 text-slate-950 font-extrabold text-xl flex items-center justify-center shadow-md">
              {selectedClient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-white">{selectedClient.name}</h2>
                <span className="text-xs font-mono text-teal-300 bg-teal-900/50 px-2 py-0.5 rounded border border-teal-500/30">
                  {selectedClient.code}
                </span>
                <span className="text-xs text-slate-300">
                  {selectedClient.location} • Age {selectedClient.age}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{selectedClient.personaSummary}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Declared Net Worth</span>
              <span className="text-sm font-bold font-mono text-white">
                {formatINR(selectedClient.netWorth, { compact: true })}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Plan</span>
              <span className="text-xs font-bold text-teal-300">
                {selectedClient.activePlan?.version || 'v1.0'} ({selectedClient.activePlan?.status || 'Draft'})
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/50 px-4 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview', icon: Users },
            { id: 'risk_profile', label: 'Risk Profile (Capacity vs Tolerance)', icon: ShieldAlert },
            { id: 'goals', label: `Goals (${selectedClient.goals.length})`, icon: Target },
            { id: 'portfolio', label: 'Proposed Portfolio', icon: PieChart },
            { id: 'documents', label: 'Documents & KYC', icon: FileText },
            { id: 'activity', label: 'Activity Trail', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`py-3 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-teal-600 text-teal-700 bg-white font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6">
          {activeSubTab === 'risk_profile' && (
            <div className="space-y-6">
              {/* Conflict Alert Banner if any */}
              {suitability.conflictDetected && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="font-bold block text-sm text-rose-800 mb-1">
                      Suitability Conflict Detected (SEBI Reg 17)
                    </strong>
                    <p className="leading-relaxed">{suitability.conflictMessage}</p>
                    <p className="mt-2 text-[11px] text-rose-700 font-semibold">
                      Policy Applied: Regulatory ceiling is pinned to the LOWER band ({suitability.recommendedBand}) to protect client from ruin.
                    </p>
                  </div>
                </div>
              )}

              {/* Policy Header Box */}
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between gap-4 text-xs">
                <div>
                  <span className="font-bold text-indigo-950">Statutory Planning Policy:</span>
                  <p className="text-indigo-800 text-[11px]">
                    "The lower of capacity and tolerance sets the maximum risk band, subject to goal horizon and liquidity constraints."
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] uppercase font-semibold text-indigo-500 block">Evaluated Risk Mandate</span>
                  <span className="font-extrabold text-indigo-900 text-sm">{suitability.recommendedBand}</span>
                </div>
              </div>

              {/* Two Independent Columns: Capacity vs Tolerance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Risk Capacity Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-sm text-[#10243A]">1. Financial Risk Capacity</h3>
                      <p className="text-[11px] text-slate-500">Objective ability to absorb financial losses</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-teal-700 font-mono">
                        {suitability.capacityScore}/100
                      </span>
                      <span className="block text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                        Band: {suitability.capacityBand}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Monthly Disposable Surplus:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {formatINR(
                          selectedClient.riskCapacity.monthlyIncome -
                            selectedClient.riskCapacity.monthlyEssentialExpenses -
                            selectedClient.riskCapacity.monthlyEmiLiabilities
                        )}
                        /m
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Debt & EMI Liabilities:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {formatINR(selectedClient.riskCapacity.monthlyEmiLiabilities)}/m (
                        {(
                          (selectedClient.riskCapacity.monthlyEmiLiabilities /
                            selectedClient.riskCapacity.monthlyIncome) *
                          100
                        ).toFixed(0)}
                        % of income)
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Emergency Liquidity Buffer:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedClient.riskCapacity.emergencyFundMonths} months of expenses
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Income Certainty / Predictability:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedClient.riskCapacity.incomeStabilityScore}/5
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Financial Dependants:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedClient.riskCapacity.dependantsCount} person(s)
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Investment Horizon Buffer:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedClient.riskCapacity.investmentHorizonYears} years
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 italic">Objective calculations</span>
                    <button
                      onClick={() => setIsEditingRisk(!isEditingRisk)}
                      className="text-teal-600 font-semibold hover:text-teal-700 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Edit Inputs
                    </button>
                  </div>
                </div>

                {/* 2. Risk Tolerance Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="font-bold text-sm text-[#10243A]">2. Psychological Risk Tolerance</h3>
                      <p className="text-[11px] text-slate-500">Subjective willingness to stomach market volatility</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-indigo-700 font-mono">
                        {suitability.toleranceScore}/100
                      </span>
                      <span className="block text-[10px] font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
                        Band: {suitability.toleranceBand}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Drawdown Reaction:</span>
                      <span className="font-semibold text-slate-800 capitalize">
                        {selectedClient.riskTolerance.drawdownReaction.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Max Tolerable Drop:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {selectedClient.riskTolerance.maxTolerableDropPercent}% temporary loss
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Market Experience:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedClient.riskTolerance.investingExperienceYears} years lived
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-50">
                      <span className="text-slate-500">Priority Balance:</span>
                      <span className="font-semibold text-slate-800 capitalize">
                        {selectedClient.riskTolerance.priorityBalance.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Self-Reported Volatility Appetite:</span>
                      <span className="font-semibold text-slate-800">
                        {selectedClient.riskTolerance.lossAcceptanceScore}/5
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 italic">Psychological questionnaire</span>
                    <button
                      onClick={() => setIsEditingRisk(!isEditingRisk)}
                      className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> Adjust Tolerance
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Risk Parameters Editor Drawer */}
              {isEditingRisk && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-300 text-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#10243A]">Interactive Risk Profiler Inputs</h4>
                      <p className="text-[11px] text-slate-500">
                        Adjusting inputs re-runs the deterministic suitability rules and creates a new plan draft version.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsEditingRisk(false)}
                      className="text-slate-500 hover:text-slate-800 font-bold"
                    >
                      Close ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Monthly Income (₹)
                      </label>
                      <input
                        type="number"
                        value={selectedClient.riskCapacity.monthlyIncome}
                        onChange={(e) =>
                          updateClientCapacity(selectedClient.id, {
                            monthlyIncome: Math.max(1000, Number(e.target.value)),
                          })
                        }
                        className="w-full p-2 bg-white rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Monthly Essential Expenses (₹)
                      </label>
                      <input
                        type="number"
                        value={selectedClient.riskCapacity.monthlyEssentialExpenses}
                        onChange={(e) =>
                          updateClientCapacity(selectedClient.id, {
                            monthlyEssentialExpenses: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="w-full p-2 bg-white rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Monthly EMI Liabilities (₹)
                      </label>
                      <input
                        type="number"
                        value={selectedClient.riskCapacity.monthlyEmiLiabilities}
                        onChange={(e) =>
                          updateClientCapacity(selectedClient.id, {
                            monthlyEmiLiabilities: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="w-full p-2 bg-white rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Emergency Fund (Months)
                      </label>
                      <input
                        type="number"
                        value={selectedClient.riskCapacity.emergencyFundMonths}
                        onChange={(e) =>
                          updateClientCapacity(selectedClient.id, {
                            emergencyFundMonths: Math.max(0, Number(e.target.value)),
                          })
                        }
                        className="w-full p-2 bg-white rounded-lg border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Drawdown Reaction
                      </label>
                      <select
                        aria-label="Drawdown Psychological Reaction"
                        value={selectedClient.riskTolerance.drawdownReaction}
                        onChange={(e) =>
                          updateClientTolerance(selectedClient.id, {
                            drawdownReaction: e.target.value as any,
                          })
                        }
                        className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="panic_sell">Panic Sell (Exits to Cash)</option>
                        <option value="anxious_hold">Anxious Hold (Daily Worry)</option>
                        <option value="stay_course">Stay the Course (Disciplined SIP)</option>
                        <option value="buy_more">Opportunistic Buy (Accumulate)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Max Tolerable Drop (%)
                      </label>
                      <select
                        aria-label="Max Tolerable Drop Percentage"
                        value={selectedClient.riskTolerance.maxTolerableDropPercent}
                        onChange={(e) =>
                          updateClientTolerance(selectedClient.id, {
                            maxTolerableDropPercent: Number(e.target.value) as any,
                          })
                        }
                        className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs focus:ring-1 focus:ring-teal-500"
                      >
                        <option value="5">5% (Minimal)</option>
                        <option value="10">10% (Low)</option>
                        <option value="20">20% (Moderate)</option>
                        <option value="35">35% (High)</option>
                        <option value="50">50% (Extreme)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      Notice: Changing risk profile invalidates any existing approved plan and increments the plan version.
                    </span>
                  </div>
                </div>
              )}

              {/* Transparent Expandable Scoring Rules */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setShowScoringRules(!showScoringRules)}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-xs text-[#10243A]">
                      Transparent Factor Scoring Rules (Audit Evidence)
                    </span>
                  </div>
                  {showScoringRules ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {showScoringRules && (
                  <div className="p-4 bg-white divide-y divide-slate-100 text-xs">
                    {suitability.scoringBreakdown.map((row, idx) => (
                      <div key={idx} className="py-2.5 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <span className="font-bold text-slate-800">{row.factor}</span>
                          <p className="text-[11px] text-slate-500">{row.notes}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-teal-700">
                            {row.score} / {row.maxScore} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'overview' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Contact & Location</span>
                  <div className="mt-2 space-y-1">
                    <p className="text-slate-800 font-semibold">{selectedClient.email}</p>
                    <p className="text-slate-800">{selectedClient.phone}</p>
                    <p className="text-slate-600">{selectedClient.location}</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Financial Overview</span>
                  <div className="mt-2 space-y-1">
                    <p className="text-slate-800">
                      Take-Home: <strong className="font-mono">{formatINR(selectedClient.monthlyTakeHome)}/mo</strong>
                    </p>
                    <p className="text-slate-800">
                      Net Worth: <strong className="font-mono">{formatINR(selectedClient.netWorth)}</strong>
                    </p>
                    <p className="text-slate-600">
                      Essential Expenses: {formatINR(selectedClient.riskCapacity.monthlyEssentialExpenses)}/mo
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-teal-950">Ready to plan goals for {selectedClient.name}?</h4>
                  <p className="text-[11px] text-teal-800">
                    Switch to Goal Planner to simulate inflation-adjusted SIP contributions.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('planner')}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg"
                >
                  Open Goal Planner →
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'goals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#10243A]">Documented Financial Goals</h3>
                <button
                  onClick={() => setActiveTab('planner')}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  + Add / Edit in Goal Planner
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedClient.goals.map((g) => (
                  <div key={g.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800">{g.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                        {g.targetYear} ({g.targetYear - 2026}y)
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex justify-between">
                        <span>Target Corpus (Infl-Adj):</span>
                        <strong className="font-mono text-[#10243A]">{formatINR(g.futureTargetCorpus)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Earmarked:</span>
                        <strong className="font-mono text-slate-700">{formatINR(g.currentEarmarked)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Required Monthly SIP:</span>
                        <strong className="font-mono text-teal-700">{formatINR(g.requiredMonthlySip)}/mo</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Assumed Inflation / Return:</span>
                        <span>
                          {(g.assumedInflationRate * 100).toFixed(0)}% / {(g.assumedAnnualReturn * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'portfolio' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#10243A]">Current Proposed Model Portfolio</h3>
                  <p className="text-[11px] text-slate-500">
                    Target Risk Band: {selectedClient.proposedPortfolio?.targetRiskBand}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs"
                >
                  Open in Portfolio Lab →
                </button>
              </div>

              <div className="space-y-2">
                {selectedClient.proposedPortfolio?.allocations.map((alloc) => (
                  <div
                    key={alloc.assetClass}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{alloc.assetClass}</span>
                      <p className="text-[11px] text-slate-500">{alloc.rationale}</p>
                    </div>
                    <span className="font-extrabold text-teal-700 font-mono text-sm">{alloc.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'documents' && (
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-sm text-[#10243A]">Client Documents & Mandatory Disclosures</h3>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-600" />
                    <div>
                      <div className="font-semibold text-slate-800">Risk Assessment Questionnaire Form</div>
                      <div className="text-[11px] text-slate-400">Completed & verified electronically</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="font-semibold text-slate-800">SEBI RIA Statutory Conflict Disclosure</div>
                      <div className="text-[11px] text-slate-400">Regulation 18 transparency schedule</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    Attached
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'activity' && (
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-sm text-[#10243A]">Client Activity Timeline</h3>
              <p className="text-[11px] text-slate-500">All advisory state changes and revisions logged.</p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600">
                  Plan status: <strong>{selectedClient.activePlan?.status || 'Draft'}</strong> • Version:{' '}
                  <strong>{selectedClient.activePlan?.version || 'v1.0'}</strong>
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Adviser note: {selectedClient.activePlan?.adviserNotes || 'No notes added yet.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
