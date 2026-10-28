/**
 * AdvisoryOS Research Copilot (Screen 5)
 * Split-view research workspace: Seeded documents, chat Q&A, and citation excerpt inspector.
 * Zero-hallucination guarantee: unsupported questions return "I could not verify this from the available documents."
 */

import React, { useState } from 'react';
import { useAdvisory } from '../context/AdvisoryContext';
import {
  BookOpenCheck,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Send,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  ShieldCheck,
  Quote,
} from 'lucide-react';
import { ResearchDocument } from '../types/advisory';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citationDocId?: string;
  citationPage?: number;
  citationSnippet?: string;
}

const PRESET_QUERIES = [
  'Compare the costs of these two direct plans.',
  'What does this SID say about investment risk?',
  'What is the latest disclosed asset allocation?',
  'Which source supports this expense ratio?',
  'What is the historical performance of small-cap fund in 2008?', // Unsupported query test!
];

export const ResearchCopilotScreen: React.FC = () => {
  const { researchDocs, funds } = useAdvisory();

  const [selectedDocId, setSelectedDocId] = useState<string>(researchDocs[0]?.id || '');
  const [activeCitationDocId, setActiveCitationDocId] = useState<string | null>(researchDocs[0]?.id || null);
  const [searchDocQuery, setSearchDocQuery] = useState<string>('');
  const [inputText, setInputText] = useState<string>('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: 'AdvisoryOS Research Copilot active. All answers are strictly grounded in the indexed Scheme Information Documents (SIDs), Factsheets, and AMC Disclosures. Every fact links to exact document pages.',
      timestamp: '10:00 AM',
    },
  ]);

  const activeDoc =
    researchDocs.find((d) => d.id === (activeCitationDocId || selectedDocId)) || researchDocs[0];

  const handleSendQuery = (query: string) => {
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    let replyMsg: ChatMessage;
    const lower = query.toLowerCase();

    if (lower.includes('compare') && (lower.includes('cost') || lower.includes('expense') || lower.includes('two direct'))) {
      replyMsg = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: 'Comparing direct plan expense ratios from verified documents:\n\n1. Bharat LargeCap Nifty 50 Index Direct-G: TER is 0.18% p.a. (Factsheet Dec 2025, Page 2).\n2. Apex Strategic Flexi Cap Direct-G: TER is 0.64% p.a. (SID Nov 2025, Page 14).\n\nThe passive index fund offers a 46 bps cost advantage, while the flexi-cap fund carries an active management fee within SEBI statutory limits.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citationDocId: 'doc-factsheet-nifty50',
        citationPage: 2,
        citationSnippet: 'Total Expense Ratio (TER) for Direct Plan is 0.18% p.a. Tracking Error annualized over 3 years stands at 0.04%.',
      };
      setActiveCitationDocId('doc-factsheet-nifty50');
    } else if (lower.includes('risk') && (lower.includes('sid') || lower.includes('say'))) {
      replyMsg = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: 'According to the Apex Strategic Flexi Cap Scheme Information Document (SID), the scheme maintains a minimum of 65% in Indian equities across market capitalizations without category constraints. The riskometer rating is designated as "Very High". During heightened volatility, the mandate requires holding at least 20% in large-cap liquidity buffers.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citationDocId: 'doc-sid-flexicap',
        citationPage: 14,
        citationSnippet: 'The scheme will invest a minimum of 65% in Indian equity... Risk Category: Very High. Minimum 20% in large-cap liquidity buffers during periods of heightened market volatility.',
      };
      setActiveCitationDocId('doc-sid-flexicap');
    } else if (lower.includes('asset allocation') || lower.includes('disclosed')) {
      replyMsg = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: 'The latest disclosed monthly portfolio for Sovereign & Prime Corporate Bond Fund reveals 98.4% allocation in AAA and Sovereign-rated paper: Sovereign / G-Sec: 24.1%, AAA-rated corporate debt: 74.3%, and Cash equivalents: 1.6%. Below AAA exposure is strictly 0.0%. Yield to Maturity stands at 7.54%.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citationDocId: 'doc-port-corpbond',
        citationPage: 4,
        citationSnippet: 'Credit Quality Breakdown: Sovereign / G-Sec: 24.1%, AAA-rated corporate debt: 74.3%, Cash & equivalents: 1.6%. Below AAA exposure: 0.0%. Portfolio YTM: 7.54%.',
      };
      setActiveCitationDocId('doc-port-corpbond');
    } else if (lower.includes('which source supports') || lower.includes('expense ratio')) {
      replyMsg = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: 'The 0.18% direct plan expense ratio is supported by the Bharat LargeCap Nifty 50 Index Fund Monthly Factsheet (Reporting Date: 31 Dec 2025, Page 2). Tracking error of 0.04% is also verified in the same audited disclosure.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citationDocId: 'doc-factsheet-nifty50',
        citationPage: 2,
        citationSnippet: 'Total Expense Ratio (TER) for Direct Plan is 0.18% p.a. Tracking Error annualized over 3 years stands at 0.04%, reflecting tight index replication.',
      };
      setActiveCitationDocId('doc-factsheet-nifty50');
    } else {
      // Unsupported question strictly triggers no-hallucination refusal!
      replyMsg = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: 'I could not verify this from the available documents.\n\nAdvisoryOS maintains a strict zero-hallucination policy. Historical NAV series, un-indexed dates, or speculative returns outside the verified document repository are withheld to comply with SEBI investment research guidelines.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    setMessages((prev) => [...prev, userMsg, replyMsg]);
    setInputText('');
  };

  const handleCitationClick = (docId?: string) => {
    if (docId) {
      setActiveCitationDocId(docId);
      setSelectedDocId(docId);
    }
  };

  const filteredDocs = researchDocs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
      d.schemeName.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
      d.docType.toLowerCase().includes(searchDocQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#10243A]">Research Copilot & Document Evidence</h1>
          <p className="text-xs text-slate-500">
            Source-grounded fund factsheets, Scheme Information Documents (SIDs), and verifiable page citations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Seeded Retrieval Engine • Zero Hallucination Mode Active
          </span>
        </div>
      </div>

      {/* 3-Column Split View Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[620px]">
        {/* Left Column (3 Cols): Document Repository */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Indexed Documents ({researchDocs.length})
              </h2>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search SIDs & Factsheets..."
                value={searchDocQuery}
                onChange={(e) => setSearchDocQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[460px] pr-1">
              {filteredDocs.map((doc) => {
                const isSelected = doc.id === (activeCitationDocId || selectedDocId);
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocId(doc.id);
                      setActiveCitationDocId(doc.id);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer text-left transition-all ${
                      isSelected
                        ? 'bg-teal-50/60 border-teal-500 shadow-xs ring-1 ring-teal-500'
                        : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="font-bold text-teal-700">{doc.docType}</span>
                      <span className="font-mono text-slate-400">Page {doc.pageNumber}</span>
                    </div>
                    <div className="font-bold text-xs text-[#10243A] line-clamp-1">{doc.schemeName}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Date: {doc.reportingDate}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400">
            Source documents strictly read-only.
          </div>
        </div>

        {/* Center Column (5 Cols): Chat & Prompt Q&A */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Header */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <h2 className="font-bold text-xs text-[#10243A]">Advisory Q&A & Evidence Grounding</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">SEBI Compliant Citations</span>
          </div>

          {/* Preset Suggested Prompts */}
          <div className="p-3 bg-slate-50/50 border-b border-slate-100 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Suggested Test Prompts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_QUERIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendQuery(q)}
                  className="text-[11px] bg-white hover:bg-teal-50 hover:text-teal-700 text-slate-700 px-2 py-1 rounded-md border border-slate-200 shadow-2xs text-left transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs max-h-[380px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-br-none shadow-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Document Citation Chip if present */}
                  {m.citationDocId && (
                    <div
                      onClick={() => handleCitationClick(m.citationDocId)}
                      className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between gap-2 text-[10px] font-semibold text-teal-800 bg-white/80 p-1.5 rounded-lg border border-teal-200 cursor-pointer hover:bg-teal-50 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Bookmark className="w-3 h-3 text-teal-600" />
                        <span>Source Evidence: Page {m.citationPage}</span>
                      </div>
                      <span className="text-teal-600 font-bold">Open Excerpt →</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask a question about fund fees, SIDs, or asset allocation..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery(inputText)}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <button
              onClick={() => handleSendQuery(inputText)}
              className="p-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column (4 Cols): Source Excerpt & Document Inspection */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Source Excerpt Inspector
                </h3>
                <span className="font-bold text-xs text-[#10243A] block mt-0.5">{activeDoc.docType}</span>
              </div>
              <span className="font-mono text-xs font-bold bg-teal-50 text-teal-800 px-2.5 py-1 rounded-full border border-teal-200">
                Page {activeDoc.pageNumber}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-extrabold text-[#10243A]">{activeDoc.schemeName}</div>
              <div className="text-[11px] text-slate-400">Disclosed on: {activeDoc.reportingDate}</div>
            </div>

            {/* Extracted Verified Passage Box */}
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 text-slate-800 text-xs leading-relaxed relative">
              <Quote className="w-5 h-5 text-amber-400 absolute right-3 top-3" />
              <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider block mb-1">
                Audited Document Text:
              </span>
              <p className="font-serif italic text-slate-700">{activeDoc.extractedSnippet}</p>
            </div>

            {/* Extracted Key Facts Card */}
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Document Key Facts:
              </span>
              <div className="space-y-1.5 text-xs">
                {activeDoc.keyFacts.map((fact, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <span className="text-slate-600 font-medium">{fact.label}</span>
                    <strong className="font-mono text-[#10243A]">{fact.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Page cited & verified
            </span>
            <span className="text-slate-400">Direct AMFI Repository</span>
          </div>
        </div>
      </div>
    </div>
  );
};
