/**
 * AdvisoryOS 12-Step Guided Walkthrough Tour
 * Interactive step-by-step assistant guiding the evaluator across all 12 core requirements.
 */

import React from 'react';
import { useAdvisory } from '../context/AdvisoryContext';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Clock,
  CheckCircle2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { formatDemoTimer } from '../utils/formatters';

interface TourStepInfo {
  step: number;
  title: string;
  tab: string;
  instruction: string;
  hint: string;
}

const TOUR_STEPS: TourStepInfo[] = [
  {
    step: 1,
    title: 'Select a Persona',
    tab: 'Overview',
    instruction: 'Start at the Overview dashboard. Notice the 6 distinct seeded personas and live practice KPIs.',
    hint: 'Click "Run Next" to select a persona in Clients & Profiling.',
  },
  {
    step: 2,
    title: 'Complete / Confirm Sample Inputs',
    tab: 'Clients',
    instruction: 'Inspect the client roster: Fresh graduate Bengaluru, Doctor Patna, Retiree Chennai, Aggressive trader Mumbai.',
    hint: 'AdvisoryOS never silently fills missing details without labelling them as demo assumptions.',
  },
  {
    step: 3,
    title: 'Capacity & Tolerance Separation',
    tab: 'Clients',
    instruction: 'Notice two independent scores: Objective Capacity (income, liabilities, emergency buffer) vs Subjective Tolerance (drawdown behavior).',
    hint: 'The lower of the two sets the permitted regulatory risk ceiling.',
  },
  {
    step: 4,
    title: 'Goal Planner & Cashflows',
    tab: 'Planner',
    instruction: 'Interactive inflation-adjusted goal calculator with required monthly SIP and affordability warnings.',
    hint: 'Also models retirement pension drawdown and 3-year dynamic glidepaths.',
  },
  {
    step: 5,
    title: 'Portfolio Lab & Direct Funds',
    tab: 'Portfolio',
    instruction: 'Only Direct-Plan mutual funds shortlisted (zero commissions). Allocation sliders must total exactly 100%.',
    hint: 'Observe real-time equity cap suitability validation.',
  },
  {
    step: 6,
    title: '10-Year Backtest & Limitations',
    tab: 'Portfolio',
    instruction: 'Switch to the 10-Year Backtest tab. Prominently watermarked: "Synthetic demo backtest—not actual fund performance."',
    hint: 'Computed from proxy indices with CAGR, volatility, and maximum drawdown.',
  },
  {
    step: 7,
    title: 'Research Copilot & SIDs',
    tab: 'Research',
    instruction: 'Ask questions grounded in actual Scheme Information Documents (SIDs). Clicking any citation opens the exact page excerpt.',
    hint: 'Try an unsupported question to see the strict zero-hallucination refusal.',
  },
  {
    step: 8,
    title: 'Guardrail Enforcement & Refusal',
    tab: 'Guardrails',
    instruction: 'Test prohibited requests like "Guarantee me 20% returns" or "Ignore my risk profile".',
    hint: 'Enforced in application logic, not just refusal text.',
  },
  {
    step: 9,
    title: 'Adviser Review & Versioning',
    tab: 'Approvals',
    instruction: 'Inspect the plan dossier in Approval Centre. Watermarked "DRAFT—NOT FOR CLIENT DISTRIBUTION".',
    hint: 'Client export and sharing is strictly disabled until formal approval.',
  },
  {
    step: 10,
    title: 'Approve & Digital Sign-Off',
    tab: 'Approvals',
    instruction: 'Check the RIA fiduciary declaration and click "Approve Exact Version & Sign".',
    hint: 'Stamps reviewer identity, version number, and tamper-evident digital seal.',
  },
  {
    step: 11,
    title: 'Approved Client Presentation',
    tab: 'Presentation',
    instruction: 'Unlocks the official approved client presentation report ready for export and printing.',
    hint: 'Any subsequent input edit creates a new version and revokes approval!',
  },
  {
    step: 12,
    title: 'Immutable Audit Trail',
    tab: 'Audit',
    instruction: 'View the chronological ledger of every client change, risk calculation, guardrail event, and approval.',
    hint: 'Complete regulatory accountability for the RIA practice.',
  },
];

export const GuidedDemoTour: React.FC = () => {
  const {
    demoStep,
    isDemoActive,
    nextDemoStep,
    prevDemoStep,
    exitDemo,
    demoElapsedSeconds,
  } = useAdvisory();

  if (!isDemoActive || demoStep < 1 || demoStep > 12) return null;

  const currentStepInfo = TOUR_STEPS[demoStep - 1];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-[#10243A] text-white rounded-2xl shadow-2xl border-2 border-teal-500/40 p-5 animate-slide-up">
      {/* Top row */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-700/60 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-teal-500/20 text-teal-300">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="font-extrabold text-xs uppercase tracking-wider text-teal-300">
            Guided Tour • Step {demoStep} of 12
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            <Clock className="w-3 h-3" /> {formatDemoTimer(demoElapsedSeconds)}
          </span>
          <button
            onClick={exitDemo}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            title="Exit Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Content */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <h4 className="font-extrabold text-sm text-white">{currentStepInfo.title}</h4>
          <span className="text-[10px] bg-slate-800 text-teal-400 px-2 py-0.5 rounded font-mono">
            {currentStepInfo.tab}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{currentStepInfo.instruction}</p>

        <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-teal-300 flex items-start gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
          <span>{currentStepInfo.hint}</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <button
          onClick={prevDemoStep}
          disabled={demoStep === 1}
          className="text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex items-center gap-1">
          {TOUR_STEPS.map((s) => (
            <span
              key={s.step}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                s.step === demoStep ? 'bg-teal-400 w-3' : s.step < demoStep ? 'bg-teal-700' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextDemoStep}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 shadow-md shadow-teal-500/20 transition-all hover:scale-105"
        >
          <span>{demoStep === 12 ? 'Finish Tour ✓' : 'Next Step'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
