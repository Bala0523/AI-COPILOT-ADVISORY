/**
 * AdvisoryOS Sidebar Navigation
 * Deep Navy #10243A theme with clear active states, badge alerts, and RIA credential card
 */

import React from 'react';
import { useAdvisory, NavigationTab } from '../context/AdvisoryContext';
import {
  LayoutDashboard,
  Users,
  Target,
  PieChart,
  BookOpenCheck,
  ShieldAlert,
  FileCheck2,
  History,
  ShieldCheck,
  AlertCircle,
  Award,
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, clients, adviserProfile } = useAdvisory();

  // Calculate pending review count and unresolved flags
  const pendingApprovalsCount = clients.filter(
    (c) => c.activePlan?.status === 'Needs Review' || c.activePlan?.status === 'Changes Requested'
  ).length;

  const unresolvedFlagsCount = clients.filter(
    (c) => (c.proposedPortfolio?.suitabilityValidation.hardBlocks.length ?? 0) > 0
  ).length;

  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      sublabel: 'Practice Dashboard & KPIs',
      icon: LayoutDashboard,
    },
    {
      id: 'clients',
      label: 'Clients & Profiling',
      sublabel: 'Capacity vs Tolerance',
      icon: Users,
    },
    {
      id: 'planner',
      label: 'Goal Planner',
      sublabel: 'Inflation, SIP & Glide Path',
      icon: Target,
    },
    {
      id: 'portfolio',
      label: 'Portfolio Lab',
      sublabel: 'Direct Funds & 10Y Backtest',
      icon: PieChart,
    },
    {
      id: 'research',
      label: 'Research Copilot',
      sublabel: 'SIDs, Factsheets & Citations',
      icon: BookOpenCheck,
    },
    {
      id: 'guardrails',
      label: 'Guardrails',
      sublabel: 'SEBI Compliance & Refusals',
      icon: ShieldAlert,
      badge: unresolvedFlagsCount > 0 ? unresolvedFlagsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'approvals',
      label: 'Approval Centre',
      sublabel: 'RIA Fiduciary Sign-Off',
      icon: FileCheck2,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-900 font-bold',
    },
    {
      id: 'audit',
      label: 'Audit Trail',
      sublabel: 'Immutable Activity Log',
      icon: History,
    },
  ];

  return (
    <aside className="w-64 bg-[#10243A] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Advisory Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-teal-500/15 text-white border border-teal-500/30 shadow-sm'
                  : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-xs'
                      : 'bg-slate-800/80 text-slate-400 group-hover:text-teal-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className={`font-semibold ${isActive ? 'text-teal-300' : 'text-slate-200'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal leading-tight">
                    {item.sublabel}
                  </div>
                </div>
              </div>

              {item.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-xs ${
                    item.badgeColor || 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Practitioner Credential Footer */}
      <div className="p-3 m-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px]">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white text-xs">Registered Adviser</span>
        </div>
        <p className="text-slate-300 font-semibold">{adviserProfile.name}</p>
        <p className="text-teal-400 font-mono text-[10px]">{adviserProfile.registrationNo}</p>
        <p className="text-slate-400 text-[10px] mt-1">{adviserProfile.firmName}</p>
        <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-teal-400 shrink-0" />
          <span>Fiduciary duty active • Zero commission</span>
        </div>
      </div>
    </aside>
  );
};
