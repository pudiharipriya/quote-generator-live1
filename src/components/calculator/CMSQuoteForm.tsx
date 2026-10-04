import React from 'react';
import {
  QuoteInputState,
  SupabaseRateConfig,
  AwsInstanceConfig,
  CmsType,
  SupabasePlanTier,
} from '../../types/pricing';
import {
  Database,
  Video,
  HardDrive,
  Sliders,
  Server,
  DollarSign,
  Users,
  Shield,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { MIN_USERS, MAX_USERS } from '../../utils/pricingEngine';

/**
 * Number of Users box: lets you clear and retype freely, only accepts whole numbers
 * from MIN_USERS to MAX_USERS, and shows a clear message for anything else.
 */
const UserCountInput: React.FC<{ value: number; onValid: (n: number) => void }> = ({
  value,
  onValid,
}) => {
  const [text, setText] = React.useState(String(value));
  const [error, setError] = React.useState('');

  // Keep the box in sync when the value changes from outside (Reset Defaults, loading a saved quote)
  React.useEffect(() => {
    setText(String(value));
    setError('');
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setText(raw);

    if (raw.trim() === '') {
      setError(`Enter a number of users (${MIN_USERS}-${MAX_USERS})`);
      return;
    }
    if (!/^\d+$/.test(raw.trim())) {
      setError('Whole numbers only (no decimals, letters or symbols)');
      return;
    }
    const n = Number(raw.trim());
    if (n < MIN_USERS || n > MAX_USERS) {
      setError(`Number of users must be between ${MIN_USERS} and ${MAX_USERS}`);
      return;
    }
    setError('');
    onValid(n);
  };

  // If left invalid, snap back to the last valid value so the quote never disagrees with the box
  const handleBlur = () => {
    if (error) {
      setText(String(value));
      setError('');
    }
  };

  return (
    <div>
      <div className="relative">
        <Users className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
        <input
          type="text"
          inputMode="numeric"
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full glass-input text-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none ${
            error ? 'border border-red-500/70' : ''
          }`}
          placeholder={`${MIN_USERS} - ${MAX_USERS}`}
          aria-label="Number of users"
        />
      </div>
      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  );
};

interface CMSQuoteFormProps {
  input: QuoteInputState;
  setInput: React.Dispatch<React.SetStateAction<QuoteInputState>>;
  supabaseRates: SupabaseRateConfig[];
  awsInstances: AwsInstanceConfig[];
  resetToDefaults: () => void;
}

export const CMSQuoteForm: React.FC<CMSQuoteFormProps> = ({
  input,
  setInput,
  supabaseRates,
  awsInstances,
  resetToDefaults,
}) => {
  const [showPartnerDeck, setShowPartnerDeck] = React.useState(false);

  const handleChange = <K extends keyof QuoteInputState>(
    field: K,
    value: QuoteInputState[K]
  ) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  const selectedAws = awsInstances.find((i) => i.id === input.awsInstanceId) || awsInstances[0];

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-xl border border-slate-800">
      <div className="flex flex-wrap items-center justify-between pb-5 mb-6 border-b border-slate-800 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Quotation Parameters</h2>
            <p className="text-xs text-slate-400">Configure cost drivers, scaling factors & markup</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Currency Selector Toggle */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => handleChange('currency', 'USD')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                (input.currency || 'USD') === 'USD'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => handleChange('currency', 'INR')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                input.currency === 'INR'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              INR (₹)
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowPartnerDeck(!showPartnerDeck)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              showPartnerDeck
                ? 'bg-purple-600 text-white border-purple-500 shadow'
                : 'bg-slate-900 text-purple-300 border-purple-900/50 hover:bg-slate-800'
            }`}
          >
            {showPartnerDeck ? 'Hide Vendor Deck' : 'HyperDOOH Partner Rates'}
          </button>

          <button
            type="button"
            onClick={resetToDefaults}
            className="text-xs font-medium text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-4"
          >
            Reset Defaults
          </button>
        </div>
      </div>

      {/* HyperDOOH Partner Deck Quick Reference Panel */}
      {showPartnerDeck && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-blue-950/40 border border-purple-500/30 text-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-purple-800/40 pb-2">
            <h3 className="font-bold text-white text-sm flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              <span>HyperDOOH Partner Program Rate Deck Reference</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Official Vendor Pricing
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Indoor Wall Mount & Standee */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="font-bold text-purple-300 border-b border-slate-800 pb-1">
                Indoor Wall Mount & Standee Tier
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>HyperDOOH Normal CMS:</span>
                <span className="font-mono text-emerald-400">₹1,500/yr <span className="text-[10px] text-slate-500 line-through">₹2,500</span> (Bulk &gt;50)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>CMS with Real-Time Triggers (AI):</span>
                <span className="font-mono text-emerald-400">₹4,500/yr <span className="text-[10px] text-slate-500 line-through">₹6,500</span> (Bulk &gt;50)</span>
              </div>
            </div>

            {/* Active LED Pricing Tier */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="font-bold text-blue-300 border-b border-slate-800 pb-1">
                Active LED Pricing Tier
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>HyperDOOH Normal CMS (5GB Cellular):</span>
                <span className="font-mono text-emerald-400">₹7,000/yr <span className="text-[10px] text-slate-500 line-through">₹10,000</span> (Bulk &gt;50)</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>CMS with Real-Time Triggers (AI):</span>
                <span className="font-mono text-emerald-400">₹12,000/yr <span className="text-[10px] text-slate-500 line-through">₹18,000</span> (Bulk &gt;50)</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 italic">
            * Margin savings: ₹1,000 - ₹2,000 / screen / yr for indoor & up to ₹6,000 / unit on outdoor LED deployments.
          </p>
        </div>
      )}

      {/* 0. Quote Basics: Number of Users + Data Plan */}
      <div className="mb-6 p-4 rounded-xl bg-blue-950/20 border border-blue-500/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Number of Users ({MIN_USERS}-{MAX_USERS})
            </label>
            <UserCountInput
              value={input.customLicenseCount}
              onValid={(n) => handleChange('customLicenseCount', n)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Data Plan (Database Plan Tier)
            </label>
            <select
              value={input.supabasePlanTier}
              onChange={(e) => handleChange('supabasePlanTier', e.target.value as SupabasePlanTier)}
              className="w-full glass-input text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              {supabaseRates.map((r) => (
                <option key={r.plan} value={r.plan} className="bg-slate-900 text-slate-200">
                  {r.name} (${r.computeMonthlyCost}/mo compute)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-400">Quote cards to show:</span>
          <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => handleChange('showStandardTiers', false)}
              className={`px-3 py-1 rounded-md transition-all ${
                input.showStandardTiers === false
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Only {input.customLicenseCount} users
            </button>
            <button
              type="button"
              onClick={() => handleChange('showStandardTiers', true)}
              className={`px-3 py-1 rounded-md transition-all ${
                input.showStandardTiers !== false
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Compare with 25 / 50 / 100
            </button>
          </div>
        </div>
      </div>

      {/* 1. Product Type Selector */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Select CMS Product Variant
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleChange('cmsType', 'normal')}
            className={`flex items-start space-x-3 p-4 rounded-xl text-left border transition-all ${
              input.cmsType === 'normal'
                ? 'bg-blue-600/15 border-blue-500 text-white ring-1 ring-blue-500/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                input.cmsType === 'normal' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-white">Normal CMS</div>
              <div className="text-xs text-slate-400 mt-0.5">
                Standard content management. Cost driven by Database Engine + Storage.
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChange('cmsType', 'ai_ml')}
            className={`flex items-start space-x-3 p-4 rounded-xl text-left border transition-all ${
              input.cmsType === 'ai_ml'
                ? 'bg-purple-600/15 border-purple-500 text-white ring-1 ring-purple-500/50'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                input.cmsType === 'ai_ml' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-sm text-white flex items-center space-x-2">
                <span>Real-Time AI/ML CMS</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Camera AI
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Camera-based service. Cost driven by Database + AI Compute Server scaling.
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Supabase Configuration */}
        <div className="space-y-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center space-x-2 text-blue-400 text-sm font-semibold border-b border-slate-800 pb-2">
            <Database className="w-4 h-4" />
            <span>Database & Storage Config</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                Storage per User (GB)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={input.storagePerLicenseGB}
                  onChange={(e) => handleChange('storagePerLicenseGB', Math.max(1, Number(e.target.value)))}
                  className="w-full glass-input text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500">GB</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                Bandwidth per User (GB)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={input.estimatedBandwidthPerLicenseGB}
                  onChange={(e) =>
                    handleChange('estimatedBandwidthPerLicenseGB', Math.max(0, Number(e.target.value)))
                  }
                  className="w-full glass-input text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500">GB</span>
              </div>
            </div>
          </div>

          {/* Supabase cost sharing */}
          <div className="pt-3 border-t border-slate-800/80">
            <label className="block text-xs text-slate-400 mb-1 font-medium">
              Database Plan Cost Model
            </label>
            <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => handleChange('supabaseCostModel', 'pro_rated')}
                className={`flex-1 px-3 py-1.5 rounded-md transition-all ${
                  input.supabaseCostModel !== 'full'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pro-Rated (share per user)
              </button>
              <button
                type="button"
                onClick={() => handleChange('supabaseCostModel', 'full')}
                className={`flex-1 px-3 py-1.5 rounded-md transition-all ${
                  input.supabaseCostModel === 'full'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Full Plan Cost
              </button>
            </div>

            {input.supabaseCostModel !== 'full' && (() => {
              const plan = supabaseRates.find((r) => r.plan === input.supabasePlanTier);
              const incl = plan?.includedStorageGB ?? 0;
              const used = input.customLicenseCount * input.storagePerLicenseGB;
              const pct = incl > 0 && (plan?.computeMonthlyCost ?? 0) > 0
                ? Math.min(100, (used / incl) * 100)
                : 100;
              return (
                <p className="text-[11px] text-slate-500 mt-2">
                  The plan is shared until its included data is used up.{' '}
                  {input.customLicenseCount} users x {input.storagePerLicenseGB} GB = {used} GB
                  {incl > 0 ? ` of ${incl} GB included` : ''}, so they pay about{' '}
                  {pct.toFixed(0)}% of the database plan cost.
                </p>
              );
            })()}
          </div>
        </div>

        {/* 3. AWS EC2 Configuration (Visible for AI/ML) */}
        {input.cmsType === 'ai_ml' ? (
          <div className="space-y-4 bg-purple-950/20 p-4 rounded-xl border border-purple-900/40">
            <div className="flex items-center space-x-2 text-purple-400 text-sm font-semibold border-b border-purple-900/40 pb-2">
              <Server className="w-4 h-4" />
              <span>AWS EC2 Camera Compute Scaling</span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                AWS Instance Type & Capacity
              </label>
              <select
                value={input.awsInstanceId}
                onChange={(e) => handleChange('awsInstanceId', e.target.value)}
                className="w-full glass-input text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                {awsInstances.map((inst) => (
                  <option key={inst.id} value={inst.id} className="bg-slate-900 text-slate-200">
                    {inst.instanceType} ({inst.vcpu} vCPU / {inst.ramGB}GB RAM) - ${inst.monthlyRate}/mo
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-purple-300/70 mt-1 italic">{selectedAws.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">
                  Scaling Ratio (Users per Instance)
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">1 per</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={input.licensesPerAwsInstance}
                    onChange={(e) =>
                      handleChange('licensesPerAwsInstance', Math.max(1, Number(e.target.value)))
                    }
                    className="w-full glass-input text-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none text-center font-semibold"
                  />
                  <span className="text-xs text-slate-400">users</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">
                  EC2 Cost Calculation Model
                </label>
                <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => handleChange('awsCostModel', 'pro_rated')}
                    className={`flex-1 py-1 px-2 rounded-md transition-all text-center ${
                      (input.awsCostModel || 'pro_rated') === 'pro_rated'
                        ? 'bg-purple-600 text-white font-medium shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Pro-rates instance cost per user (e.g. 12 users on 20 ratio = 0.6x instance)"
                  >
                    Pro-Rated
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('awsCostModel', 'discrete')}
                    className={`flex-1 py-1 px-2 rounded-md transition-all text-center ${
                      input.awsCostModel === 'discrete'
                        ? 'bg-purple-600 text-white font-medium shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Allocates full instance chunks (Math.ceil)"
                  >
                    Discrete Units
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-purple-200/70 mt-1">
              {(input.awsCostModel || 'pro_rated') === 'pro_rated'
                ? `Pro-rated mode active: ${input.customLicenseCount} users = ${(input.customLicenseCount / Math.max(1, input.licensesPerAwsInstance)).toFixed(2)}x ${selectedAws.instanceType} ($${((input.customLicenseCount / Math.max(1, input.licensesPerAwsInstance)) * selectedAws.monthlyRate).toFixed(2)}/mo). Avoids charging full instance cost for small tiers.`
                : `Discrete mode active: ${input.customLicenseCount} users = ${Math.ceil(input.customLicenseCount / Math.max(1, input.licensesPerAwsInstance))}x ${selectedAws.instanceType} ($${(Math.ceil(input.customLicenseCount / Math.max(1, input.licensesPerAwsInstance)) * selectedAws.monthlyRate).toFixed(2)}/mo).`}
            </p>
          </div>
        ) : (
          <div className="space-y-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center space-x-2 text-slate-400 text-sm font-semibold border-b border-slate-800 pb-2">
              <Shield className="w-4 h-4" />
              <span>White-Labeling & Custom Tier</span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">
                End-of-Quote White-Labeling Setup Fee
              </label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-xs text-slate-500">$</span>
                  <input
                    type="number"
                    min="0"
                    value={input.whiteLabelingFee}
                    onChange={(e) => handleChange('whiteLabelingFee', Math.max(0, Number(e.target.value)))}
                    className="w-full glass-input text-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => handleChange('whiteLabelingFeeType', 'flat')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      input.whiteLabelingFeeType === 'flat'
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Flat Setup
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('whiteLabelingFeeType', 'per_license')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      input.whiteLabelingFeeType === 'per_license'
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Per User Setup
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 italic">
                Managed separately at the end of the proposal. Excluded from monthly recurring tier subtotals.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* If AI/ML, show White Labeling and Custom Tier row */}
      {input.cmsType === 'ai_ml' && (
        <div className="grid grid-cols-1 gap-6 mt-6">
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80">
            <label className="block text-xs text-slate-400 mb-1 font-medium">
              End-of-Quote White-Labeling Setup Fee
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-2 text-xs text-slate-500">$</span>
                <input
                  type="number"
                  min="0"
                  value={input.whiteLabelingFee}
                  onChange={(e) => handleChange('whiteLabelingFee', Math.max(0, Number(e.target.value)))}
                  className="w-full glass-input text-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => handleChange('whiteLabelingFeeType', 'flat')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    input.whiteLabelingFeeType === 'flat'
                      ? 'bg-purple-600 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Flat Setup
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('whiteLabelingFeeType', 'per_license')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    input.whiteLabelingFeeType === 'per_license'
                      ? 'bg-purple-600 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Per User Setup
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 italic">
              Managed separately at the end of proposal. Excluded from monthly recurring tier subtotals.
            </p>
          </div>

        </div>
      )}

      {/* 4. Global Markup Slider (Constrained 45% - 50%) */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-slate-900/80 via-blue-950/30 to-slate-900/80 border border-blue-500/30 shadow-inner">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">Global Product Markup Slider</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Constrained 45% – 50%
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-lg font-bold text-emerald-400">{input.markupPercent}%</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-slate-400 font-semibold">45%</span>
          <input
            type="range"
            min="45"
            max="50"
            step="0.5"
            value={input.markupPercent}
            onChange={(e) => handleChange('markupPercent', Number(e.target.value))}
            className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
          <span className="text-xs text-slate-400 font-semibold">50%</span>
          <input
            type="number"
            min="45"
            max="50"
            step="0.5"
            value={input.markupPercent}
            onChange={(e) => {
              const val = Math.min(50, Math.max(45, Number(e.target.value)));
              handleChange('markupPercent', val);
            }}
            className="w-16 glass-input text-emerald-400 font-bold rounded-lg px-2 py-1 text-sm text-center focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
