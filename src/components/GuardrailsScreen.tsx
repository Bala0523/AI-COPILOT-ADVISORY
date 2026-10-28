/**
 * AdvisoryOS Compliance Guardrails Engine (Screen 6)
 * Deterministic test laboratory for SEBI RIA regulations, prompt refusal policies, and statutory disclosures.
 */

import React, { useState } from 'react';
import { useAdvisory } from '../context/AdvisoryContext';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Info,
  Scale,
  FileCheck2,
  FileWarning,
} from 'lucide-react';
import { SEED_GUARDRAILS, evaluateGuardrailPrompt } from '../utils/suitabilityRules';
import { GuardrailTest } from '../types/advisory';

export const GuardrailsScreen: React.FC = () => {
  const { adviserProfile } = useAdvisory();
  const [selectedRuleId, setSelectedRuleId] = useState<string>(SEED_GUARDRAILS[0].id);
  const [customTestInput, setCustomTestInput] = useState<string>('');
  const [customEvalResult, setCustomEvalResult] = useState<{
    isTriggered: boolean;
    matchedRule?: GuardrailTest;
  } | null>(null);

  const activeRule = SEED_GUARDRAILS.find((r) => r.id === selectedRuleId) || SEED_GUARDRAILS[0];

  const handleTestCustomPrompt = () => {
    if (!customTestInput.trim()) return;
    const res = evaluateGuardrailPrompt(customTestInput);
    setCustomEvalResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#10243A]">Compliance & Guardrails Engine</h1>
          <p className="text-xs text-slate-500">
            Deterministic pre- & post-generation enforcement under SEBI (Investment Advisers) Regulations, 2013
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Zero Tolerance for Assured Returns
          </span>
        </div>
      </div>

      {/* Interactive Prompt Attack / Refusal Laboratory */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
        <div>
          <h2 className="font-bold text-sm text-[#10243A]">Interactive Unsuitable Request Test Suite</h2>
          <p className="text-[11px] text-slate-500">
            Select a prohibited prompt to inspect how AdvisoryOS blocks the action in application logic and generates a compliant alternative.
          </p>
        </div>

        {/* 6 Mandatory Test Prompt Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SEED_GUARDRAILS.map((rule) => {
            const isSelected = rule.id === selectedRuleId;
            return (
              <button
                key={rule.id}
                onClick={() => {
                  setSelectedRuleId(rule.id);
                  setCustomEvalResult(null);
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  isSelected
                    ? 'bg-rose-50 border-rose-400 ring-1 ring-rose-400 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-rose-700 text-[10px] uppercase tracking-wider">
                    {rule.category}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-100 text-rose-800">
                    {rule.severity}
                  </span>
                </div>
                <div className="font-semibold text-slate-800 italic line-clamp-1">"{rule.prompt}"</div>
              </button>
            );
          })}
        </div>

        {/* Custom Input Tester */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Test your own advisory prompt (e.g. 'Can you guarantee 15% return on this portfolio?')..."
            value={customTestInput}
            onChange={(e) => setCustomTestInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTestCustomPrompt()}
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-rose-500"
          />
          <button
            onClick={handleTestCustomPrompt}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            Run Check
          </button>
        </div>

        {customEvalResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              customEvalResult.isTriggered
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {customEvalResult.isTriggered ? (
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              <span>
                {customEvalResult.isTriggered
                  ? `VIOLATION DETECTED: Triggers ${customEvalResult.matchedRule?.category} safeguard!`
                  : 'PROMPT PASSED: No regulatory guardrail triggers found.'}
              </span>
            </div>
            {customEvalResult.isTriggered && (
              <span className="font-bold text-[10px] uppercase bg-rose-200 text-rose-900 px-2 py-0.5 rounded">
                Action Blocked
              </span>
            )}
          </div>
        )}
      </div>

      {/* Flagged Rule Detailed Breakdown Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                Severity: {activeRule.severity}
              </span>
              <span className="text-xs font-semibold text-slate-500">• Blocked by Application Logic</span>
            </div>
            <h3 className="text-base font-extrabold text-[#10243A] mt-1">{activeRule.title}</h3>
            <p className="text-xs text-slate-500 font-mono italic">Prompt: "{activeRule.prompt}"</p>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <Lock className="w-3.5 h-3.5" /> Direct Export Blocked
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Issue Detected */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800 block">Issue Detected & Why Flagged:</span>
            <p className="text-slate-600 leading-relaxed">{activeRule.issueDetected}</p>
            <p className="text-[11px] text-slate-500 mt-1">{activeRule.whyFlagged}</p>
          </div>

          {/* Triggered Policy */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
            <span className="font-bold text-indigo-950 block">Triggered SEBI RIA Regulatory Provision:</span>
            <p className="text-indigo-900 leading-relaxed text-[11px] font-medium">{activeRule.triggeredPolicy}</p>
          </div>
        </div>

        {/* Safer Alternative */}
        <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 text-xs space-y-1">
          <div className="flex items-center gap-2 text-teal-900 font-bold">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Compliant Planning Alternative (Adviser Guidance):</span>
          </div>
          <p className="text-teal-800 leading-relaxed text-[11px] pl-6">{activeRule.saferAlternative}</p>
        </div>
      </div>

      {/* Statutory RIA Disclosure Panel (Regulation 18) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-[#10243A]">SEBI RIA Mandatory Statutory Disclosures</h3>
            <p className="text-[11px] text-slate-500">
              Fiduciary transparency requirements under Regulation 18 of SEBI (Investment Advisers) Regulations, 2013
            </p>
          </div>
          <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            Audit Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              1. Conflicts of Interest
            </span>
            <p className="font-semibold text-slate-800">No conflicts declared</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Fee-only RIA. No commercial affiliations with any Asset Management Company or distributor.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              2. Fee Schedule & Commissions
            </span>
            <p className="font-semibold text-slate-800">Fixed Fee Only (Zero Commission)</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Strictly recommends Direct Plans only. Zero trailer or distribution commissions accepted.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              3. Data Freshness & Provenance
            </span>
            <p className="font-semibold text-slate-800">AMFI Daily Feed & Q3 FY26 SIDs</p>
            <p className="text-[11px] text-slate-500 mt-1">
              NAV data synced daily. Factsheet data extracted directly from AMC regulatory disclosures.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              4. Model Limitations
            </span>
            <p className="font-semibold text-slate-800">Mathematical Scenarios, Not Forecasts</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Annuity and SIP projections assume constant parameters. Actual market outcomes will fluctuate.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              5. Assumed Returns Disclosure
            </span>
            <p className="font-semibold text-slate-800">Risk-Band Bound Assumed Returns</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Historical proxies: Equity 11–12%, Debt 7–8%, Liquid 6%. No return is promised or guaranteed.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              6. Adviser Responsibility
            </span>
            <p className="font-semibold text-slate-800">Vikram Malhotra (INA000012345)</p>
            <p className="text-[11px] text-slate-500 mt-1">
              The registered adviser bears personal fiduciary responsibility for all issued advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
