import React, { useState } from 'react';
import { SavedQuote } from '../../types/pricing';
import { formatForCrm } from '../../utils/pricingEngine';
import {
  FileText,
  Trash2,
  Copy,
  Check,
  Search,
  ArrowUpRight,
  Database,
  Video,
  Calendar,
  UserCheck,
} from 'lucide-react';

interface SavedQuotesListProps {
  quotes: SavedQuote[];
  onDeleteQuote: (id: string) => void;
  onLoadQuote: (quote: SavedQuote) => void;
}

export const SavedQuotesList: React.FC<SavedQuotesListProps> = ({
  quotes,
  onDeleteQuote,
  onLoadQuote,
}) => {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = quotes.filter((q) => {
    const term = search.toLowerCase();
    return (
      q.title.toLowerCase().includes(term) ||
      q.clientName.toLowerCase().includes(term) ||
      q.cmsType.toLowerCase().includes(term)
    );
  });

  const handleCopyCrm = (quote: SavedQuote) => {
    const text = formatForCrm(quote.inputState, quote.tiers);
    navigator.clipboard.writeText(text);
    setCopiedId(quote.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Saved Quotations History ({quotes.length})</span>
          </h2>
          <p className="text-xs text-slate-400">
            Previously computed CMS quotations saved for client proposal reference
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search client or quote..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input text-white text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Quotes Cards Grid */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center border border-slate-800">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No saved quotes found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            {search
              ? 'No quotations matched your search keywords.'
              : 'Generate a quotation using the calculator and click "Save Quote" to store it here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((q) => {
            const dateStr = new Date(q.createdAt).toLocaleDateString([], {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const mainTier = q.tiers.find((t) => t.licenses === 50) || q.tiers[0];

            return (
              <div
                key={q.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`p-1.5 rounded-lg ${
                            q.cmsType === 'ai_ml'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {q.cmsType === 'ai_ml' ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <Database className="w-4 h-4" />
                          )}
                        </span>
                        <h3 className="font-bold text-base text-white">{q.title}</h3>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center space-x-1">
                          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                          <strong className="text-slate-200">{q.clientName}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{dateStr}</span>
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        q.cmsType === 'ai_ml'
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                      }`}
                    >
                      {q.cmsType === 'ai_ml' ? 'AI/ML CMS' : 'Normal CMS'}
                    </span>
                  </div>

                  {/* Summary Tiers list */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="text-slate-400 font-semibold flex justify-between">
                      <span>Configured Markup:</span>
                      <span className="text-emerald-400 font-mono">
                        {q.inputState.markupPercent}%
                      </span>
                    </div>

                    <div className="text-slate-400 font-semibold flex justify-between">
                      <span>Tiers Saved:</span>
                      <span className="text-slate-200 font-mono">
                        {q.tiers.map((t) => `${t.licenses}u`).join(', ')}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                      <span className="text-slate-300">Ref (50 License Tier):</span>
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        ${mainTier ? mainTier.finalTotalPrice.toFixed(2) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {q.notes && (
                    <p className="text-xs text-slate-400 italic mt-3 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
                      "{q.notes}"
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => onLoadQuote(q)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/20"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Load into Calculator</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyCrm(q)}
                      className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        copiedId === q.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {copiedId === q.id ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedId === q.id ? 'Copied!' : 'Copy Quote'}</span>
                    </button>

                    <button
                      onClick={() => onDeleteQuote(q.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete saved quote"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
