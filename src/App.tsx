import React, { useState, useEffect, useMemo } from 'react';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { CMSQuoteForm } from './components/calculator/CMSQuoteForm';
import { TierComparisonTable } from './components/calculator/TierComparisonTable';
import { RateConfigManager } from './components/admin/RateConfigManager';
import { SavedQuotesList } from './components/history/SavedQuotesList';
import { ChatWidget } from './components/chat/ChatWidget';
import { ChatWidgetDemo } from './components/chat/ChatWidgetDemo';
import {
  QuoteInputState,
  SupabaseRateConfig,
  AwsInstanceConfig,
  SavedQuote,
  ChatLead,
} from './types/pricing';
import {
  DEFAULT_QUOTE_INPUT,
  calculateAllTiers,
  DEFAULT_SUPABASE_RATES,
  DEFAULT_AWS_INSTANCES,
} from './utils/pricingEngine';
import {
  loadSupabaseRates,
  saveSupabaseRates,
  loadAwsInstances,
  saveAwsInstances,
  loadSavedQuotes,
  saveQuote,
  deleteSavedQuote,
  loadChatLeads,
} from './utils/storage';
import { Layers, Sparkles, CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calculator');

  // Input Parameters State
  const [input, setInput] = useState<QuoteInputState>(DEFAULT_QUOTE_INPUT);

  // Rate Config States (localStorage / Supabase synced)
  const [supabaseRates, setSupabaseRates] = useState<SupabaseRateConfig[]>(loadSupabaseRates);
  const [awsInstances, setAwsInstances] = useState<AwsInstanceConfig[]>(loadAwsInstances);

  // Manual Overrides State: Record<licenses, { pricePerLicense?, totalPrice? }>
  const [overridesMap, setOverridesMap] = useState<
    Record<number, { pricePerLicense?: number; totalPrice?: number }>
  >({});

  // Saved Quotes State
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>(loadSavedQuotes);

  // Captured Chat Leads State
  const [chatLeads, setChatLeads] = useState<ChatLead[]>(loadChatLeads);

  // Persist Supabase rates whenever changed
  useEffect(() => {
    saveSupabaseRates(supabaseRates);
  }, [supabaseRates]);

  // Persist AWS rates whenever changed
  useEffect(() => {
    saveAwsInstances(awsInstances);
  }, [awsInstances]);

  // Calculate tiers dynamically
  const tiers = useMemo(() => {
    return calculateAllTiers(input, supabaseRates, awsInstances, overridesMap);
  }, [input, supabaseRates, awsInstances, overridesMap]);

  // Reset calculator parameters to defaults
  const resetToDefaults = () => {
    setInput(DEFAULT_QUOTE_INPUT);
    setOverridesMap({});
  };

  // Save Quote handler
  const handleSaveQuote = async (title: string, clientName: string, notes: string) => {
    const newQuote: SavedQuote = {
      id: `quote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      clientName,
      createdAt: new Date().toISOString(),
      cmsType: input.cmsType,
      inputState: input,
      tiers: tiers,
      notes,
    };
    const updated = await saveQuote(newQuote);
    setSavedQuotes(updated);
  };

  // Delete Quote handler
  const handleDeleteQuote = (id: string) => {
    const updated = deleteSavedQuote(id);
    setSavedQuotes(updated);
  };

  // Load Saved Quote into Calculator
  const handleLoadQuote = (quote: SavedQuote) => {
    setInput(quote.inputState);

    // Reconstruct overrides if present
    const loadedOverrides: Record<number, { pricePerLicense?: number; totalPrice?: number }> = {};
    quote.tiers.forEach((t) => {
      if (t.manualOverridePricePerLicense || t.manualOverrideTotalPrice) {
        loadedOverrides[t.licenses] = {
          pricePerLicense: t.manualOverridePricePerLicense ?? undefined,
          totalPrice: t.manualOverrideTotalPrice ?? undefined,
        };
      }
    });
    setOverridesMap(loadedOverrides);
    setActiveTab('calculator');
  };

  // Chat lead captured callback
  const handleLeadCaptured = (lead: ChatLead) => {
    setChatLeads((prev) => {
      const idx = prev.findIndex((l) => l.id === lead.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = lead;
        return copy;
      }
      return [lead, ...prev];
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedQuotesCount={savedQuotes.length}
        leadsCount={chatLeads.length}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TAB 1: QUOTATION CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
              <div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Internal Sales Pricing Calculator</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  CMS Quotation Generator
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Compute precise cost + markup (45%–50%) for Normal CMS & Real-time AI/ML CMS license tiers.
                </p>
              </div>

              <div className="flex items-center space-x-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="text-slate-400 block">CRM Import Ready</span>
                  <span className="font-bold text-white">Fixed-Rate Quote Output</span>
                </div>
              </div>
            </div>

            {/* Quote Inputs Form */}
            <CMSQuoteForm
              input={input}
              setInput={setInput}
              supabaseRates={supabaseRates}
              awsInstances={awsInstances}
              resetToDefaults={resetToDefaults}
            />

            {/* Tier Comparison Matrix & Override Table */}
            <TierComparisonTable
              input={input}
              tiers={tiers}
              overridesMap={overridesMap}
              setOverridesMap={setOverridesMap}
              onSaveQuote={handleSaveQuote}
            />
          </div>
        )}

        {/* TAB 2: RATE CONFIG MANAGER */}
        {activeTab === 'rates' && (
          <div className="animate-in fade-in duration-300">
            <RateConfigManager
              supabaseRates={supabaseRates}
              setSupabaseRates={setSupabaseRates}
              awsInstances={awsInstances}
              setAwsInstances={setAwsInstances}
            />
          </div>
        )}

        {/* TAB 3: SAVED QUOTES HISTORY */}
        {activeTab === 'history' && (
          <div className="animate-in fade-in duration-300">
            <SavedQuotesList
              quotes={savedQuotes}
              onDeleteQuote={handleDeleteQuote}
              onLoadQuote={handleLoadQuote}
            />
          </div>
        )}

        {/* TAB 4: CHAT WIDGET DEMO & LEADS */}
        {activeTab === 'chat_demo' && (
          <div className="animate-in fade-in duration-300">
            <ChatWidgetDemo leads={chatLeads} />
          </div>
        )}
      </main>

      {/* Global Client-Facing Chat Widget */}
      <ChatWidget onLeadCaptured={handleLeadCaptured} />

      {/* App Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-slate-400">CMS Quotation Generator & Lead Widget</span>
          </div>
          <p>© 2026 Internal Sales Tool. Built for CRM Quote Import & Lead Generation.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
