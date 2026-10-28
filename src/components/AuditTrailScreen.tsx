/**
 * AdvisoryOS Audit Trail (Screen 8)
 * Searchable, filterable event timeline capturing inputs, risk updates, approvals, and guardrail violations.
 */

import React, { useState } from 'react';
import { useAdvisory } from '../context/AdvisoryContext';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  FileCheck2,
  Users,
  Target,
  PieChart,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';
import { AuditEvent } from '../types/advisory';

export const AuditTrailScreen: React.FC = () => {
  const { auditLogs } = useAdvisory();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    if (filterType !== 'ALL' && log.entityType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.summary.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.actor.toLowerCase().includes(q) ||
        log.entityId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getEntityIcon = (type: AuditEvent['entityType']) => {
    switch (type) {
      case 'CLIENT':
        return <Users className="w-4 h-4 text-teal-600" />;
      case 'RISK_PROFILE':
        return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
      case 'GOAL':
        return <Target className="w-4 h-4 text-emerald-600" />;
      case 'PORTFOLIO':
        return <PieChart className="w-4 h-4 text-sky-600" />;
      case 'APPROVAL':
        return <FileCheck2 className="w-4 h-4 text-amber-600" />;
      case 'GUARDRAIL':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      case 'RESEARCH':
        return <BookOpenCheck className="w-4 h-4 text-purple-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#10243A]">Compliance Audit Trail & Evidence Log</h1>
          <p className="text-xs text-slate-500">
            Chronological record of risk evaluations, portfolio revisions, guardrail refusals, and RIA approvals
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {auditLogs.length} Logged Events
          </span>
        </div>
      </div>

      {/* Production Disclaimer Box */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-600 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Local Demonstration Trail:</strong> Logged within local storage for evaluation. In production deployment, this stream pipes to an immutable, append-only WORM (Write Once, Read Many) cloud audit ledger as mandated by SEBI.
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search events, client IDs, actors, or summaries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {[
            'ALL',
            'APPROVAL',
            'GUARDRAIL',
            'RISK_PROFILE',
            'PORTFOLIO',
            'GOAL',
            'CLIENT',
          ].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filterType === type
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Event Timeline List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-400">
            No audit records matching criteria.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                  log.entityType === 'GUARDRAIL'
                    ? 'bg-rose-50/40 border-rose-200 hover:bg-rose-50'
                    : log.entityType === 'APPROVAL'
                    ? 'bg-amber-50/30 border-amber-200 hover:bg-amber-50'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-white rounded-lg shadow-2xs border border-slate-200">
                      {getEntityIcon(log.entityType)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#10243A]">{log.action}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.2 rounded border">
                          {log.entityId}
                        </span>
                        {log.versionId && (
                          <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded font-bold border border-teal-200">
                            {log.versionId}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{log.summary}</p>
                    </div>
                  </div>

                  <div className="text-right text-[11px]">
                    <span className="font-mono text-slate-500 block">{formatDateTime(log.timestamp)}</span>
                    <span className="text-[10px] text-slate-400">{log.actor}</span>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && log.details && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 font-mono text-[10px] text-slate-700 bg-white p-2.5 rounded-lg border">
                    <span className="font-bold text-slate-500 block mb-1">Payload Audit Metadata:</span>
                    <pre className="overflow-x-auto">{JSON.stringify(log.details, null, 2)}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
