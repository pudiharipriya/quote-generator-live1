import React, { useState } from 'react';
import {
  TierBreakdown,
  QuoteInputState,
  SavedQuote,
} from '../../types/pricing';
import { formatForCrm } from '../../utils/pricingEngine';
import {
  Copy,
  Download,
  Save,
  Check,
  Edit3,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Server,
  Database,
} from 'lucide-react';

interface TierComparisonTableProps {
  input: QuoteInputState;
  tiers: TierBreakdown[];
  overridesMap: Record<number, { pricePerLicense?: number; totalPrice?: number }>;
  setOverridesMap: React.Dispatch<
    React.SetStateAction<Record<number, { pricePerLicense?: number; totalPrice?: number }>>
  >;
  onSaveQuote: (title: string, clientName: string, notes: string) => void;
}

export const TierComparisonTable: React.FC<TierComparisonTableProps> = ({
  input,
  tiers,
  overridesMap,
  setOverridesMap,
  onSaveQuote,
}) => {
  const [copiedCrm, setCopiedCrm] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [quoteTitle, setQuoteTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [editingTier, setEditingTier] = useState<number | null>(null);

  // Copy CRM formatted breakdown to clipboard
  const handleCopyCrm = () => {
    const text = formatForCrm(input, tiers);
    navigator.clipboard.writeText(text);
    setCopiedCrm(true);
    setTimeout(() => setCopiedCrm(false), 2500);
  };

  // Download CSV export
  const handleDownloadCsv = () => {
    let csv = `Tier Licenses,Is Custom,Total Storage GB,Supabase Cost,AWS Cost,Base Subtotal Cost,Markup %,Markup Amount,Monthly Total Price,Monthly Per User Price,One-Time White Label Fee\n`;
    tiers.forEach((t) => {
      csv += `${t.licenses},${t.isCustom ? 'Yes' : 'No'},${t.totalStorageGB},${t.totalSupabaseCost.toFixed(2)},${t.awsCost.toFixed(2)},${t.subtotalCost.toFixed(2)},${t.markupPercent}%,${t.markupAmount.toFixed(2)},${t.calculatedTotalPrice.toFixed(2)},${t.calculatedPricePerLicense.toFixed(2)},${t.whiteLabelingCost.toFixed(2)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cms_quote_breakdown_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download JSON export
  const handleDownloadJson = () => {
    const data = {
      timestamp: new Date().toISOString(),
      productType: input.cmsType,
      inputParameters: input,
      tiers: tiers,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cms_quote_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Manual override handlers
  const handlePerLicenseOverride = (licenses: number, value: string) => {
    const num = value === '' ? undefined : Number(value);
    setOverridesMap((prev) => ({
      ...prev,
      [licenses]: {
        ...prev[licenses],
        pricePerLicense: num,
        totalPrice: undefined, // Clear total price override if per-license is edited
      },
    }));
  };

  const handleTotalPriceOverride = (licenses: number, value: string) => {
    const num = value === '' ? undefined : Number(value);
    setOverridesMap((prev) => ({
      ...prev,
      [licenses]: {
        ...prev[licenses],
        totalPrice: num,
        pricePerLicense: undefined, // Clear per-license override if total is edited
      },
    }));
  };

  const resetOverride = (licenses: number) => {
    setOverridesMap((prev) => {
      const copy = { ...prev };
      delete copy[licenses];
      return copy;
    });
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveQuote(
      quoteTitle || `${input.cmsType === 'ai_ml' ? 'AI/ML' : 'Normal'} CMS Quote`,
      clientName || 'General Client',
      quoteNotes
    );
    setSaveModalOpen(false);
    setQuoteTitle('');
    setClientName('');
    setQuoteNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Action Header bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Tier Comparison Matrix</span>
            <span className="text-xs font-normal text-slate-400">
              {input.showStandardTiers === false ? `(${input.customLicenseCount} users)` : '(25, 50, 100 + Your Users)'}
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Internal pricing calculation for manual copy-paste into CRM / Proposal creator
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyCrm}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              copiedCrm
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
            }`}
          >
            {copiedCrm ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCrm ? 'Copied to Clipboard!' : 'Copy Quote Breakdown'}</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => setSaveModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Quote</span>
          </button>
        </div>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((tier) => {
          const isOverridden =
            overridesMap[tier.licenses]?.pricePerLicense !== undefined ||
            overridesMap[tier.licenses]?.totalPrice !== undefined;

          return (
            <div
              key={tier.licenses}
              className={`glass-panel p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                tier.isCustom
                  ? 'border-cyan-500/40 bg-slate-900/90 ring-1 ring-cyan-500/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {tier.isCustom && (
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-slate-950 uppercase tracking-wider shadow">
                  Custom Tier
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-baseline justify-between border-b border-slate-800 pb-3 mb-3">
                  <div>
                    <span className="text-2xl font-black text-white">{tier.licenses}</span>
                    <span className="text-xs text-slate-400 ml-1">Users / Licenses</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Storage</span>
                    <span className="text-xs font-semibold text-blue-400">
                      {tier.totalStorageGB} GB
                    </span>
                  </div>
                </div>

                {/* Cost Component Stack */}
                <div className="space-y-2 text-xs mb-4">
                  <div className="flex justify-between text-slate-400">
                    <span>Database & Cloud Storage:</span>
                    <span className="font-mono text-slate-200">
                      {tier.currencySymbol}{tier.totalSupabaseCost.toFixed(2)}/mo
                    </span>
                  </div>

                  {input.cmsType === 'ai_ml' && (
                    <div className="flex justify-between text-purple-300">
                      <span className="flex items-center space-x-1">
                        <span>
                          AWS ({tier.awsCostModel === 'pro_rated' ? tier.awsNumInstances.toFixed(2) : tier.awsNumInstances}x {tier.awsInstanceType}):
                        </span>
                      </span>
                      <span className="font-mono text-purple-200 font-semibold">
                        {tier.currencySymbol}{tier.awsCost.toFixed(2)}/mo
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-300 pt-1.5 border-t border-slate-800/80 font-medium">
                    <span>Infra Base Subtotal:</span>
                    <span className="font-mono text-slate-200">
                      {tier.currencySymbol}{tier.subtotalCost.toFixed(2)}/mo
                    </span>
                  </div>

                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Markup ({tier.markupPercent}%):</span>
                    <span className="font-mono">+{tier.currencySymbol}{tier.markupAmount.toFixed(2)}/mo</span>
                  </div>
                </div>
              </div>

              {/* Calculated Price & Override Section */}
              <div className="pt-3 border-t border-slate-800 bg-slate-950/40 p-3 rounded-xl">
                <div className="text-xs text-slate-400 mb-1 flex items-center justify-between">
                  <span>Monthly Recurring Quote</span>
                  {isOverridden && (
                    <button
                      onClick={() => resetOverride(tier.licenses)}
                      className="text-[11px] text-amber-400 hover:underline flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-extrabold text-emerald-400">
                    {tier.currencySymbol}{tier.finalTotalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">/ mo</span>
                </div>

                <div className="text-xs text-slate-300 font-semibold mt-0.5">
                  {tier.currencySymbol}{tier.finalPricePerLicense.toFixed(2)}{' '}
                  <span className="font-normal text-slate-400">/ user / mo</span>
                </div>

                {/* Manual Override Form Toggle */}
                <div className="mt-3">
                  {editingTier === tier.licenses ? (
                    <div className="space-y-2 bg-slate-900 p-2.5 rounded-lg border border-amber-500/30">
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        Manual Rate Override ({tier.currencySymbol})
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">
                          Override Monthly Price / User ({tier.currencySymbol})
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          placeholder={`Calc: ${tier.currencySymbol}${tier.calculatedPricePerLicense.toFixed(2)}`}
                          value={overridesMap[tier.licenses]?.pricePerLicense ?? ''}
                          onChange={(e) => handlePerLicenseOverride(tier.licenses, e.target.value)}
                          className="w-full glass-input text-amber-300 rounded px-2 py-1 text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">
                          OR Override Monthly Total Price ({tier.currencySymbol})
                        </label>
                        <input
                          type="number"
                          step="1"
                          placeholder={`Calc: ${tier.currencySymbol}${tier.calculatedTotalPrice.toFixed(2)}`}
                          value={overridesMap[tier.licenses]?.totalPrice ?? ''}
                          onChange={(e) => handleTotalPriceOverride(tier.licenses, e.target.value)}
                          className="w-full glass-input text-amber-300 rounded px-2 py-1 text-xs focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={() => setEditingTier(null)}
                        className="w-full py-1 text-xs font-semibold bg-amber-500/20 text-amber-300 rounded border border-amber-500/30"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingTier(tier.licenses)}
                      className={`w-full py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
                        isOverridden
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isOverridden ? 'Edit Override' : 'Manual Override'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Separate One-Time White Labeling Activity Section */}
      {input.whiteLabelingFee > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-amber-900/10 to-slate-900/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Separate One-Time White-Labeling & Branding Activity</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 uppercase tracking-wider">
                  Added Only At End
                </span>
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Fixed setup cost for custom white-label branding, custom domain, and portal setup. Controlled independently and added at the end of the proposal based on client scope. Excluded from monthly recurring tier subtotals and per-user monthly rates.
              </p>
            </div>
          </div>
          <div className="text-right whitespace-nowrap self-end md:self-center bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-2xl font-black text-amber-400 font-mono">
              {(tiers[0]?.currencySymbol || '$')}{((input.whiteLabelingFee || 0) * (input.currency === 'INR' ? (input.inrExchangeRate || 85) : 1)).toFixed(2)}
            </div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
              {input.whiteLabelingFeeType === 'flat' ? 'Flat Setup Fee' : 'Per User Setup Fee'}
            </span>
          </div>
        </div>
      )}

      {/* Detailed Breakdown Comparison Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Full Financial Breakdown Table</span>
          </h4>
          <span className="text-xs text-slate-400">All figures in {input.currency || 'USD'} ({tiers[0]?.currencySymbol || '$'})</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">License Tier</th>
                <th className="py-3 px-4">Storage (GB)</th>
                <th className="py-3 px-4">Database Infra</th>
                {input.cmsType === 'ai_ml' && <th className="py-3 px-4">AWS EC2 (AI)</th>}
                <th className="py-3 px-4">Infra Subtotal</th>
                <th className="py-3 px-4">Markup ({input.markupPercent}%)</th>
                <th className="py-3 px-4">Monthly Total</th>
                <th className="py-3 px-4">Per User / Mo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {tiers.map((t) => (
                <tr
                  key={t.licenses}
                  className={`hover:bg-slate-900/50 transition-colors ${
                    t.isCustom ? 'bg-cyan-950/10' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-sans font-bold text-white">
                    {t.licenses} Users {t.isCustom ? '(Custom)' : ''}
                  </td>
                  <td className="py-3 px-4 text-blue-300">{t.totalStorageGB} GB</td>
                  <td className="py-3 px-4">{t.currencySymbol}{t.totalSupabaseCost.toFixed(2)}/mo</td>
                  {input.cmsType === 'ai_ml' && (
                    <td className="py-3 px-4 text-purple-300">
                      {t.currencySymbol}{t.awsCost.toFixed(2)} ({t.awsCostModel === 'pro_rated' ? t.awsNumInstances.toFixed(2) : t.awsNumInstances} inst)
                    </td>
                  )}
                  <td className="py-3 px-4 text-slate-200 font-semibold">
                    {t.currencySymbol}{t.subtotalCost.toFixed(2)}/mo
                  </td>
                  <td className="py-3 px-4 text-emerald-400">+{t.currencySymbol}{t.markupAmount.toFixed(2)}/mo</td>
                  <td className="py-3 px-4 font-bold text-emerald-400 text-sm">
                    {t.currencySymbol}{t.finalTotalPrice.toFixed(2)}/mo
                  </td>
                  <td className="py-3 px-4 font-bold text-white text-sm">
                    {t.currencySymbol}{t.finalPricePerLicense.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Quote Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Save className="w-5 h-5 text-emerald-400" />
              <span>Save Quotation to History</span>
            </h3>

            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Quote Title / Reference
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Enterprise Retail CMS Quote Q4"
                  value={quoteTitle}
                  onChange={(e) => setQuoteTitle(e.target.value)}
                  className="w-full glass-input text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Client / Organization Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp India"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full glass-input text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Internal Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Additional context or client discount requests..."
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full glass-input text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
                >
                  Save Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
