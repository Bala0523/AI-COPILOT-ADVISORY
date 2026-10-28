/**
 * AdvisoryOS Overview Dashboard (Screen 1)
 * Practice metrics, approval queue, goal progress charts, and guided demo entrypoint.
 */

import React from 'react';
import { useAdvisory } from '../context/AdvisoryContext';
import {
  Users,
  Clock,
  AlertTriangle,
  FileCheck2,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Play,
  CheckCircle2,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatINR, formatDemoTimer, formatDateTime } from '../utils/formatters';

const ALLOCATION_COLORS = ['#0D9488', '#6366F1', '#38BDF8', '#F59E0B', '#F97373'];

export const OverviewScreen: React.FC = () => {
  const {
    clients,
    selectClient,
    setActiveTab,
    startGuidedDemo,
    isDemoActive,
    demoElapsedSeconds,
    researchDocs,
  } = useAdvisory();

  // Metrics
  const totalClients = clients.length;
  const plansNeedingReview = clients.filter(
    (c) => c.activePlan?.status === 'Needs Review' || c.activePlan?.status === 'Changes Requested'
  ).length;

  const suitabilityConflictsCount = clients.filter(
    (c) => (c.proposedPortfolio?.suitabilityValidation.hardBlocks.length ?? 0) > 0
  ).length;

  // Chart data: Goals funding overview
  const goalProgressData = clients.slice(0, 5).map((c) => {
    const primaryGoal = c.goals[0];
    return {
      name: c.name.split(' ')[0],
      current: primaryGoal ? Math.round(primaryGoal.currentEarmarked / 100000) : 0,
      gap: primaryGoal ? Math.round(primaryGoal.fundingGap / 100000) : 0,
      target: primaryGoal ? Math.round(primaryGoal.futureTargetCorpus / 100000) : 0,
    };
  });

  // Practice aggregate asset allocation
  const practiceAllocationData = [
    { name: 'Large Cap Equity', value: 42 },
    { name: 'Flexi / Mid Cap', value: 18 },
    { name: 'High Quality Debt', value: 26 },
    { name: 'Liquid & Arbitrage', value: 10 },
    { name: 'Sovereign Gold', value: 4 },
  ];

  const handleReviewClick = (clientId: string) => {
    selectClient(clientId);
    setActiveTab('approvals');
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#10243A] via-[#152e4a] to-[#1e3a5f] text-white p-6 sm:p-8 shadow-md border border-slate-700/50">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>AI-Assisted Financial Advisory Co-Pilot</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Your advisory practice, amplified.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
            Synthesize client data, calculate inflation-adjusted goals, benchmark direct mutual funds,
            and inspect source SIDs—while keeping you, the registered adviser, in total control of every recommendation.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                selectClient('client-1');
                setActiveTab('planner');
              }}
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-teal-900/30 transition-all flex items-center gap-2 hover:translate-y-[-1px]"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Create Client Plan</span>
            </button>

            <button
              onClick={startGuidedDemo}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl border border-white/20 backdrop-blur-xs transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current text-teal-400" />
              <span>{isDemoActive ? 'Resume Guided Demo' : 'Run 12-Step Demo'}</span>
            </button>

            <span className="text-xs text-slate-400 italic">
              * Demo operates with pre-seeded personas and synthetic fund datasets.
            </span>
          </div>
        </div>

        {/* Subtle decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 bottom-0 -mb-10 w-60 h-60 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Active Clients</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#10243A]">{totalClients}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">6 Demo Personas</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Diverse profiles from fresh grad to retiree</p>
        </div>

        {/* Plans Awaiting Review */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Plans Awaiting Review</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600">{plansNeedingReview}</span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Requires RIA Sign</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Zero distribution without human approval</p>
        </div>

        {/* Unresolved Suitability Flags */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Suitability Conflicts</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-600">{suitabilityConflictsCount}</span>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">Active Block</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Kabir Mehta (Aggressive Trader conflict)</p>
        </div>

        {/* Measured Demo Workflow Duration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Demo Workflow Duration</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-teal-700">
              {formatDemoTimer(demoElapsedSeconds)}
            </span>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">Live Elapsed (Demo)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Measured time, no simulated claims</p>
        </div>
      </div>

      {/* Main Grid: Approval Queue & Practice Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Approval Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#10243A]">Adviser Approval & Review Queue</h2>
                <p className="text-xs text-slate-500">
                  Every client plan requires formal verification under SEBI RIA Regulation 17
                </p>
              </div>
              <button
                onClick={() => setActiveTab('approvals')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View all in Approval Centre <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5">Client & Persona</th>
                    <th className="pb-2.5">Primary Goal</th>
                    <th className="pb-2.5">Permitted Risk</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map((client) => {
                    const plan = client.activePlan;
                    const goal = client.goals[0];
                    const isFlagged = client.proposedPortfolio?.suitabilityValidation.hardBlocks.length || 0 > 0;

                    let statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        Draft
                      </span>
                    );

                    if (plan?.status === 'Approved') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Approved
                        </span>
                      );
                    } else if (plan?.status === 'Needs Review') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Needs Review
                        </span>
                      );
                    } else if (plan?.status === 'Changes Requested') {
                      statusBadge = (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Changes Needed
                        </span>
                      );
                    }

                    return (
                      <tr key={client.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 pr-2">
                          <div className="font-bold text-[#10243A]">{client.name}</div>
                          <div className="text-[11px] text-slate-400">{client.location.split(',')[0]} • Age {client.age}</div>
                        </td>
                        <td className="py-3 pr-2">
                          <div className="text-slate-700 font-medium truncate max-w-[180px]">{goal?.name || 'No active goal'}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {goal ? formatINR(goal.futureTargetCorpus, { compact: true }) : '-'}
                          </div>
                        </td>
                        <td className="py-3 pr-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isFlagged
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {client.proposedPortfolio?.targetRiskBand || 'Moderate'}
                          </span>
                          {isFlagged && (
                            <span className="block text-[10px] text-rose-600 font-semibold mt-0.5">
                              ⚠️ Conflict Block
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-2">{statusBadge}</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleReviewClick(client.id)}
                            className="bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-[#10243A] font-semibold text-xs px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Watermark status: Plans locked until registered adviser digital signature.</span>
            <span className="text-teal-600 font-medium">SEBI Reg: INA000012345</span>
          </div>
        </div>

        {/* Right Col: Aggregate Practice Asset Allocation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-[#10243A]">Aggregate Asset Allocation</h2>
            <p className="text-xs text-slate-500 mb-3">Model blend across 6 active personas (Demo)</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={practiceAllocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {practiceAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value}%`, 'Allocation']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 mt-2">
              {practiceAllocationData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length] }}
                    />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-bold text-[#10243A] font-mono">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-600 shrink-0" />
            <span>100% Direct Plans shortlisted. No commission kickbacks.</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Goal Progress Chart & Research Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goal Funding Progress (in Lakhs) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-[#10243A]">Client Goal Funding Progress</h2>
              <p className="text-xs text-slate-500">Current savings vs projected funding gap (₹ in Lakhs)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
              Inflation-Adjusted
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`₹${val} Lakhs`, 'Amount']} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="current" name="Current Earmarked (₹ Lakhs)" fill="#0D9488" stackId="a" radius={[0, 0, 4, 4]} />
                <Bar dataKey="gap" name="Remaining Gap (₹ Lakhs)" fill="#6366F1" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Research Activity & SIDs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#10243A]">Recent Research Activity</h2>
              <button
                onClick={() => setActiveTab('research')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                Open Copilot
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">Source-grounded fund documents indexed</p>

            <div className="space-y-3">
              {researchDocs.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setActiveTab('research')}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-teal-700">{doc.docType}</span>
                    <span className="text-slate-400 font-mono">Page {doc.pageNumber}</span>
                  </div>
                  <div className="text-xs font-bold text-[#10243A] line-clamp-1">{doc.schemeName}</div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{doc.extractedSnippet}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Direct AMFI & AMC disclosures</span>
            <span className="text-indigo-600 font-semibold cursor-pointer" onClick={() => setActiveTab('research')}>
              4 Sourced Docs →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
