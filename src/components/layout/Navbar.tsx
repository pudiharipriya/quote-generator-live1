import React from 'react';
import {
  Calculator,
  Settings,
  FileText,
  MessageSquareCode,
  Sparkles,
  Server,
  Layers,
} from 'lucide-react';

export type ActiveTab = 'calculator' | 'rates' | 'history' | 'chat_demo';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  savedQuotesCount: number;
  leadsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedQuotesCount,
  leadsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('calculator')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-white tracking-tight">CMS QuoteEngine</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  v1.0 Internal
                </span>
              </div>
              <p className="text-xs text-slate-400">Normal & AI/ML CMS Pricing Tool</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'calculator'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Quote Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('rates')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'rates'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Rate Config</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Saved Quotes</span>
              {savedQuotesCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-700 text-slate-200">
                  {savedQuotesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('chat_demo')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'chat_demo'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <MessageSquareCode className="w-4 h-4" />
              <span>Chat Widget & Leads</span>
              {leadsCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {leadsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Quick status badge */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Markup Bound: <strong className="text-slate-200">45%-50%</strong></span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around border-t border-slate-800/80 py-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`p-2 rounded-md text-xs font-medium flex flex-col items-center space-y-1 ${
              activeTab === 'calculator' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span>Calc</span>
          </button>
          <button
            onClick={() => setActiveTab('rates')}
            className={`p-2 rounded-md text-xs font-medium flex flex-col items-center space-y-1 ${
              activeTab === 'rates' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Rates</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`p-2 rounded-md text-xs font-medium flex flex-col items-center space-y-1 ${
              activeTab === 'history' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Quotes ({savedQuotesCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('chat_demo')}
            className={`p-2 rounded-md text-xs font-medium flex flex-col items-center space-y-1 ${
              activeTab === 'chat_demo' ? 'text-blue-400' : 'text-slate-400'
            }`}
          >
            <MessageSquareCode className="w-5 h-5" />
            <span>Widget ({leadsCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
