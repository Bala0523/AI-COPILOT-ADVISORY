/**
 * AdvisoryOS Approval Centre (Screen 7)
 * Formal RIA review & sign-off workflow: Draft -> Needs Review -> Changes Requested -> Approved -> Shared.
 * Strict watermark control, digital signature stamping, and client export unlocking.
 */

import React, { useState } from 'react';
import { useAdvisory } from '../context/AdvisoryContext';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Lock,
  Download,
  Share2,
  FileText,
  ShieldCheck,
  Edit,
  ExternalLink,
  Award,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { formatINR, formatDateTime } from '../utils/formatters';
import { evaluateClientSuitability } from '../utils/suitabilityRules';

export const ApprovalCentreScreen: React.FC = () => {
  const {
    selectedClient,
    adviserProfile,
    approvePlan,
    requestPlanChanges,
    openClientPresentation,
    setActiveTab,
  } = useAdvisory();

  const plan = selectedClient.activePlan || {
    id: 'plan-default',
    clientId: selectedClient.id,
    goalId: selectedClient.goals[0]?.id || '',
    version: 'v1.0',
    versionNumber: 10,
    status: 'Needs Review' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    adviserNotes: 'Review required for newly drafted goal plan.',
    conflictsDisclosed: true,
    feesDisclosed: true,
    modelLimitationsAcknowledged: true,
    watermark: 'DRAFT—NOT FOR CLIENT DISTRIBUTION' as const,
  };

  const [adviserNotes, setAdviserNotes] = useState<string>(plan.adviserNotes || '');
  const [fiduciaryDeclarationAccepted, setFiduciaryDeclarationAccepted] = useState<boolean>(false);
  const [disclosuresConfirmed, setDisclosuresConfirmed] = useState<boolean>(true);
  const [showRevisionModal, setShowRevisionModal] = useState<boolean>(false);
  const [revisionFeedback, setRevisionFeedback] = useState<string>('');

  const suitability = evaluateClientSuitability(
    selectedClient.riskCapacity,
    selectedClient.riskTolerance
  );

  const goal = selectedClient.goals[0];
  const portfolio = selectedClient.proposedPortfolio;
  const isApproved = plan.status === 'Approved';
  const hasHardBlocks = (portfolio?.suitabilityValidation.hardBlocks.length ?? 0) > 0;

  const handleApprove = () => {
    if (!fiduciaryDeclarationAccepted) return;
    approvePlan(selectedClient.id, adviserNotes);
  };

  const handleSendRevision = () => {
    if (!revisionFeedback.trim()) return;
    requestPlanChanges(selectedClient.id, revisionFeedback);
    setShowRevisionModal(false);
  };

  // Workflow steps
  const workflowSteps = [
    { label: 'Draft', active: true, done: plan.status !== 'Draft' },
    {
      label: 'Needs Review',
      active: plan.status === 'Needs Review' || isApproved,
      done: isApproved,
    },
    {
      label: plan.status === 'Changes Requested' ? 'Changes Requested' : 'Adviser Review',
      active: plan.status === 'Changes Requested',
      done: isApproved,
      isAlert: plan.status === 'Changes Requested',
    },
    {
      label: 'Approved & Signed',
      active: isApproved,
      done: isApproved,
    },
    {
      label: 'Client Deliverable',
      active: isApproved,
      done: isApproved,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#10243A]">Adviser Approval & Fiduciary Sign-Off</h1>
          <p className="text-xs text-slate-500">
            SEBI RIA Mandate: No advice may be released to clients without registered individual review and digital signature.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isApproved ? (
            <button
              onClick={() => openClientPresentation(selectedClient.id)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-xs transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Open Approved Client Presentation</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Export Locked: Requires RIA Approval</span>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between max-w-4xl mx-auto relative">
          {/* Connector Line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

          {workflowSteps.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors shadow-xs ${
                  step.done
                    ? 'bg-teal-600 text-white'
                    : step.isAlert
                    ? 'bg-rose-500 text-white'
                    : step.active
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step.done ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] font-semibold mt-2 text-center ${
                  step.done
                    ? 'text-teal-700'
                    : step.isAlert
                    ? 'text-rose-600'
                    : step.active
                    ? 'text-amber-800 font-bold'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Watermark Banner */}
      <div
        className={`p-4 rounded-2xl border-2 flex flex-wrap items-center justify-between gap-4 transition-all ${
          isApproved
            ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950'
            : 'bg-amber-50/80 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex items-center gap-3">
          {isApproved ? (
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm uppercase tracking-wide">
                Document Status: {plan.watermark}
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/80 border">
                Version: {plan.version}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isApproved
                ? `Digitally stamped by ${plan.reviewedBy} on ${formatDateTime(plan.reviewedAt || '')}.`
                : 'Any subsequent input edit creates a new draft version and immediately invalidates prior approvals.'}
            </p>
          </div>
        </div>

        {isApproved && (
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">SEBI Digital Signature</span>
            <span className="font-mono text-[11px] text-emerald-900 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded">
              {plan.approvalSignature || 'SIG-SEBI-RIA-VERIFIED'}
            </span>
          </div>
        )}
      </div>

      {/* Main Review Dossier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Comprehensive Plan Review Dossier */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-[#10243A]">Advisory Dossier for {selectedClient.name}</h2>
              <p className="text-xs text-slate-500">
                Client Code: {selectedClient.code} • Goal: {goal?.name || 'Retirement'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Target: {goal ? formatINR(goal.futureTargetCorpus) : '₹0'}
            </span>
          </div>

          {/* Section 1: Suitability Alignment Check */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              1. Suitability & Risk Profile Compliance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Risk Capacity</span>
                <div className="text-sm font-bold text-teal-800 mt-0.5">
                  {suitability.capacityScore}/100 ({suitability.capacityBand})
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Risk Tolerance</span>
                <div className="text-sm font-bold text-indigo-800 mt-0.5">
                  {suitability.toleranceScore}/100 ({suitability.toleranceBand})
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                <span className="text-teal-700 text-[10px] block uppercase font-bold">Permitted Risk Mandate</span>
                <div className="text-sm font-bold text-teal-900 mt-0.5">
                  {suitability.recommendedBand}
                </div>
              </div>
            </div>

            {suitability.conflictDetected && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                <strong>Suitability Warning:</strong> {suitability.conflictMessage}
              </div>
            )}
          </div>

          {/* Section 2: Portfolio Allocations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                2. Proposed Direct-Plan Model Portfolio
              </h3>
              <button
                onClick={() => setActiveTab('portfolio')}
                className="text-[11px] font-semibold text-teal-600 hover:text-teal-700"
              >
                Edit in Portfolio Lab
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {portfolio?.allocations.map((alloc) => (
                <div
                  key={alloc.assetClass}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800">{alloc.assetClass}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{alloc.rationale}</p>
                  </div>
                  <span className="font-mono font-extrabold text-sm text-teal-700">
                    {alloc.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Statutory Disclosures Check */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              3. Regulatory Disclosures Verified
            </h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={disclosuresConfirmed}
                  onChange={(e) => setDisclosuresConfirmed(e.target.checked)}
                  className="mt-0.5 accent-teal-600 rounded"
                />
                <span className="text-slate-700 text-[11px] leading-relaxed">
                  I confirm that all conflicts of interest, zero-commission fee structure, model calculation limitations, and the 6-point statutory disclosures are attached to this dossier.
                </span>
              </label>
            </div>
          </div>

          {/* Section 4: Adviser Notes */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              4. Adviser Observations & Personalized Fiduciary Rationale
            </h3>
            <textarea
              rows={3}
              value={adviserNotes}
              onChange={(e) => setAdviserNotes(e.target.value)}
              placeholder="Enter specific client advice, tax considerations, or review remarks..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Right 4 Cols: Sign-Off Actions & Fiduciary Declaration Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-sm text-[#10243A]">Fiduciary Declaration</h3>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-2">
              <p className="font-semibold text-[#10243A]">{adviserProfile.name}</p>
              <p className="text-slate-500 font-mono text-[10px]">
                Registration: {adviserProfile.registrationNo}
              </p>
              <p className="text-slate-500">{adviserProfile.firmName}</p>
            </div>

            {/* Checkbox declaration */}
            <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 text-xs text-teal-950 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fiduciaryDeclarationAccepted}
                  onChange={(e) => setFiduciaryDeclarationAccepted(e.target.checked)}
                  disabled={hasHardBlocks}
                  className="mt-1 accent-teal-600 rounded"
                />
                <span className="text-[11px] font-medium leading-relaxed">
                  I have independently reviewed this advice under SEBI (Investment Advisers) Regulations, 2013, confirmed suitability against the client's risk profile, and take personal responsibility for this deliverable.
                </span>
              </label>
            </div>

            {hasHardBlocks && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
                <strong>Approval Blocked:</strong> Unresolved suitability conflicts exist in this portfolio. Resolve issues in Portfolio Lab first.
              </div>
            )}

            {/* Approve Action Button */}
            <button
              onClick={handleApprove}
              disabled={!fiduciaryDeclarationAccepted || hasHardBlocks || isApproved}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-900/20 transition-all flex items-center justify-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{isApproved ? 'Version Approved & Signed ✓' : 'Approve Exact Version & Sign'}</span>
            </button>

            {/* Request Changes Action */}
            <button
              onClick={() => setShowRevisionModal(true)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
            >
              Request Changes / Revision
            </button>

            {/* Client Presentation View Button */}
            {isApproved && (
              <button
                onClick={() => openClientPresentation(selectedClient.id)}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>Open Approved Presentation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-[#10243A]">Request Plan Modifications</h3>
            <p className="text-xs text-slate-500">
              Explain why this draft requires changes (e.g., debt rebalancing, lower assumed return, or additional emergency reserves).
            </p>

            <textarea
              rows={4}
              value={revisionFeedback}
              onChange={(e) => setRevisionFeedback(e.target.value)}
              placeholder="State required adjustments for the planning co-pilot..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-teal-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRevision}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg"
              >
                Submit Revision Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
