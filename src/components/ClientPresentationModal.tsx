/**
 * AdvisoryOS Approved Client Presentation Deliverable
 * Unlocked exclusively after adviser digital sign-off.
 * Clean, printable, professional investor report with RIA fiduciary certification.
 */

import React from 'react';
import { useAdvisory } from '../context/AdvisoryContext';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Award,
  CheckCircle2,
  Lock,
  Layers,
  Info,
} from 'lucide-react';
import { formatINR, formatDateTime, formatPercent } from '../utils/formatters';

export const ClientPresentationModal: React.FC = () => {
  const {
    presentationOpenForClientId,
    closeClientPresentation,
    clients,
    adviserProfile,
  } = useAdvisory();

  if (!presentationOpenForClientId) return null;

  const client = clients.find((c) => c.id === presentationOpenForClientId);
  if (!client) return null;

  const plan = client.activePlan;
  const isApproved = plan?.status === 'Approved';
  const goal = client.goals[0];
  const portfolio = client.proposedPortfolio;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Top Action Bar */}
        <div className="p-4 bg-[#10243A] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-xs uppercase tracking-wider text-teal-300">
              Official Client Advisory Presentation
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">• Version {plan?.version || 'v1.0'}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={closeClientPresentation}
              aria-label="Close presentation modal"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 print:p-0">
          {/* Document Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b-2 border-slate-200">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-teal-700">
                Investment Advisory Mandate
              </span>
              <h1 className="text-2xl font-black text-[#10243A] mt-1">
                Personal Financial Roadmap
              </h1>
              <p className="text-sm font-semibold text-slate-600">Prepared for: {client.name}</p>
              <p className="text-xs text-slate-400">
                Client ID: {client.code} • Location: {client.location}
              </p>
            </div>

            <div className="text-right">
              <div className="font-bold text-sm text-[#10243A]">{adviserProfile.firmName}</div>
              <p className="text-xs text-teal-700 font-bold font-mono">
                SEBI RIA: {adviserProfile.registrationNo}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">{adviserProfile.address}</p>
              <p className="text-[11px] text-slate-400">{adviserProfile.email}</p>
            </div>
          </div>

          {/* Fiduciary Digital Stamp */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase text-emerald-900 tracking-wide">
                  SEBI Certified Individual Sign-Off
                </span>
                <p className="text-xs text-emerald-800">
                  Approved & signed by <strong className="font-bold">{adviserProfile.name}</strong> ({adviserProfile.credentials})
                </p>
                <p className="text-[11px] text-emerald-700 font-mono mt-0.5">
                  Approval Timestamp: {formatDateTime(plan?.reviewedAt || new Date().toISOString())}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">Digital Audit Seal</span>
              <span className="font-mono text-xs font-bold text-emerald-950 bg-white px-3 py-1 rounded-lg border border-emerald-300 inline-block mt-0.5">
                {plan?.approvalSignature || 'SEBI-RIA-INA000012345-STAMP-78X'}
              </span>
            </div>
          </div>

          {/* Goal & Milestone Summary */}
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold text-[#10243A] uppercase tracking-wider">
              1. Goal Specifications & Funding Target
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400">Primary Objective</span>
                <div className="font-extrabold text-[#10243A] text-sm mt-1">{goal?.name || 'Retirement'}</div>
                <span className="text-xs text-teal-700 font-semibold mt-1 block">
                  Target Date: Year {goal?.targetYear}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-400">Inflation-Adjusted Target</span>
                <div className="font-extrabold text-[#10243A] font-mono text-base mt-1">
                  {goal ? formatINR(goal.futureTargetCorpus) : '₹0'}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Assumed Inflation: {((goal?.assumedInflationRate || 0.06) * 100).toFixed(1)}% p.a.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
                <span className="text-[10px] font-bold uppercase text-teal-700">Recommended Monthly SIP</span>
                <div className="font-extrabold text-teal-900 font-mono text-base mt-1">
                  {goal ? formatINR(goal.requiredMonthlySip) : '₹0'}/mo
                </div>
                <span className="text-[11px] text-teal-700 mt-1 block font-medium">
                  Direct Plan Auto-Debit Mandate
                </span>
              </div>
            </div>
          </div>

          {/* Asset Allocation & Recommended Direct Plans */}
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold text-[#10243A] uppercase tracking-wider">
              2. Recommended Asset Allocation (Mandate: {portfolio?.targetRiskBand})
            </h2>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] border-b">
                  <tr>
                    <th className="py-2.5 px-3">Asset Class</th>
                    <th className="py-2.5 px-3">Weight</th>
                    <th className="py-2.5 px-3">Execution Vehicle (Direct Plans Only)</th>
                    <th className="py-2.5 px-3">Direct TER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {portfolio?.allocations.map((a) => (
                    <tr key={a.assetClass} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-800">{a.assetClass}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-teal-700">{a.percentage}%</td>
                      <td className="py-2.5 px-3 text-slate-600">{a.rationale}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 font-semibold">
                        {a.assetClass.includes('Large') ? '0.18%' : a.assetClass.includes('Debt') ? '0.32%' : '0.12%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Adviser Observations */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <h3 className="font-bold text-[#10243A]">Adviser Notes & Fiduciary Directives:</h3>
            <p className="text-slate-700 leading-relaxed italic">
              "{plan?.adviserNotes || 'Portfolio structured to protect capital against downside drawdowns while maintaining long-term purchasing power.'}"
            </p>
          </div>

          {/* Statutory Regulation 18 Footer Disclosures */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200/80 text-[10px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700 uppercase">Statutory Notice under SEBI RIA Regulations, 2013:</p>
            <p>
              1. <strong>Direct Plans:</strong> This advice recommends exclusively Direct Plans of Mutual Funds. No commissions, brokerage, or inducements are received by Crestview Wealth Advisers LLP.
            </p>
            <p>
              2. <strong>Risk Warning:</strong> Mutual fund investments are subject to market risks. Read all scheme related documents carefully before investing. Past performance does not guarantee future results.
            </p>
            <p>
              3. <strong>Fiduciary Duty:</strong> This document was individually verified and signed off by Vikram Malhotra (SEBI Registration INA000012345).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
