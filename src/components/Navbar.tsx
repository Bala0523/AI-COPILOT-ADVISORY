/**
 * AdvisoryOS Navigation Header
 * Features RIA credentials, persistent safety notice, client switcher, demo timer & search.
 */

import React, { useState } from 'react';
import { useAdvisory } from '../context/AdvisoryContext';
import {
  ShieldAlert,
  Play,
  RotateCcw,
  Clock,
  ChevronRight,
  Database,
  Search,
  User,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
} from 'lucide-react';
import { formatDemoTimer } from '../utils/formatters';

export const Navbar: React.FC = () => {
  const {
    clients,
    selectedClientId,
    selectClient,
    selectedClient,
    adviserProfile,
    isDemoActive,
    demoStep,
    demoElapsedSeconds,
    startGuidedDemo,
    nextDemoStep,
    exitDemo,
    resetAllDemoData,
    globalSearchQuery,
    setGlobalSearchQuery,
    setActiveTab,
  } = useAdvisory();

  const [showFreshnessTooltip, setShowFreshnessTooltip] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner: Persistent Notice */}
      <div className="bg-[#10243A] text-slate-200 text-xs py-1.5 px-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-medium text-[11px] border border-teal-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
            AI-assisted draft • Adviser approval required
          </span>
          <span className="text-slate-400 hidden sm:inline">
            All client-facing recommendations require personal RIA sign-off under SEBI (Investment Advisers) Regulations, 2013.
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <div
            className="relative cursor-pointer flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
            onMouseEnter={() => setShowFreshnessTooltip(true)}
            onMouseLeave={() => setShowFreshnessTooltip(false)}
            onClick={() => setShowFreshnessTooltip(!showFreshnessTooltip)}
          >
            <Database className="w-3 h-3 text-teal-400" />
            <span className="underline decoration-dotted">Data Freshness: Today 08:30 IST</span>
            {showFreshnessTooltip && (
              <div className="absolute right-0 top-6 w-72 bg-slate-900 text-slate-200 p-3 rounded-lg shadow-xl text-xs z-50 border border-slate-700">
                <p className="font-semibold text-white mb-1.5">Market & Factsheet Provenance</p>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  <li>• <strong className="text-teal-300">AMFI NAV:</strong> Synced today 08:30 IST (Demo feed)</li>
                  <li>• <strong className="text-teal-300">Nifty Indices:</strong> 15-minute standard delay</li>
                  <li>• <strong className="text-teal-300">Fund SIDs & TER:</strong> Q3 FY26 AMC Disclosures</li>
                  <li>• <strong className="text-teal-300">Calculations:</strong> Deterministic math, zero LLM variance</li>
                </ul>
              </div>
            )}
          </div>

          <span className="text-slate-600 hidden md:inline">|</span>

          <span className="hidden md:inline font-mono text-teal-300">
            {adviserProfile.name} • {adviserProfile.registrationNo}
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 font-bold text-lg">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-[#10243A]">Advisory<span className="text-teal-600">OS</span></span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">RIA Co-Pilot</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">AI-powered planning. Adviser-led decisions.</p>
          </div>
        </div>

        {/* Global Search & Active Client Selector */}
        <div className="flex-1 max-w-md hidden md:flex items-center gap-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients, goals, or direct funds..."
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
            />
          </div>
        </div>

        {/* Client Persona Selector */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden lg:block">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Active Client</span>
            <span className="text-xs font-bold text-[#10243A] truncate max-w-[140px] inline-block">{selectedClient.name}</span>
          </div>

          <div className="relative">
            <select
              aria-label="Active Client Persona"
              value={selectedClientId}
              onChange={(e) => {
                selectClient(e.target.value);
                setActiveTab('clients');
              }}
              className="bg-slate-100 hover:bg-slate-200/80 text-[#10243A] text-xs font-semibold py-1.5 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code}) - {c.location.split(',')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Demo Controller & Quick Actions */}
        <div className="flex items-center gap-2">
          {isDemoActive ? (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>
                Step {demoStep}/12 • <strong className="font-mono">{formatDemoTimer(demoElapsedSeconds)}</strong>
              </span>
              <button
                onClick={nextDemoStep}
                className="ml-1 bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                Next <ChevronRight className="w-3 h-3" />
              </button>
              <button
                onClick={exitDemo}
                className="text-amber-700 hover:text-amber-900 text-[11px] px-1 ml-1"
                title="Exit Guided Tour"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={startGuidedDemo}
              className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm shadow-teal-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Guided Demo</span>
            </button>
          )}

          <button
            onClick={resetAllDemoData}
            title="Reset All Demo Data to Defaults"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
