import {
  QuoteInputState,
  SupabaseRateConfig,
  AwsInstanceConfig,
  TierBreakdown,
  SupabasePlanTier,
} from '../types/pricing';

export const DEFAULT_SUPABASE_RATES: SupabaseRateConfig[] = [
  {
    plan: 'free',
    name: 'Supabase Free Tier',
    computeMonthlyCost: 0,
    includedStorageGB: 0.5,
    additionalStoragePerGB: 0.021,
    includedBandwidthGB: 2.0,
    additionalBandwidthPerGB: 0.09,
  },
  {
    plan: 'pro',
    name: 'Supabase Pro Tier',
    computeMonthlyCost: 25,
    includedStorageGB: 100.0, // 100GB data included within $25 base cost
    additionalStoragePerGB: 0.021, // $0.021 per GB overage rate beyond 100 GB
    includedBandwidthGB: 250.0,
    additionalBandwidthPerGB: 0.09,
  },
  {
    plan: 'team',
    name: 'Supabase Team Tier',
    computeMonthlyCost: 599,
    includedStorageGB: 100.0,
    additionalStoragePerGB: 0.02,
    includedBandwidthGB: 500.0,
    additionalBandwidthPerGB: 0.08,
  },
  {
    plan: 'enterprise',
    name: 'Supabase Enterprise Tier',
    computeMonthlyCost: 1499,
    includedStorageGB: 500.0,
    additionalStoragePerGB: 0.015,
    includedBandwidthGB: 2000.0,
    additionalBandwidthPerGB: 0.06,
  },
];

export const DEFAULT_AWS_INSTANCES: AwsInstanceConfig[] = [
  {
    id: 't3.medium',
    instanceType: 't3.medium',
    vcpu: 2,
    ramGB: 4,
    hourlyRate: 0.0416, // ~$30.37/mo
    monthlyRate: 30.37,
    cameraStreamsSupported: 4,
    description: 'Standard dual-core general purpose instance for small setups.',
  },
  {
    id: 't3.large',
    instanceType: 't3.large',
    vcpu: 2,
    ramGB: 8,
    hourlyRate: 0.0832, // ~$60.74/mo
    monthlyRate: 60.74,
    cameraStreamsSupported: 8,
    description: 'General purpose with double memory for multi-camera feeds.',
  },
  {
    id: 'c5.large',
    instanceType: 'c5.large',
    vcpu: 2,
    ramGB: 4,
    hourlyRate: 0.085, // ~$62.05/mo
    monthlyRate: 62.05,
    cameraStreamsSupported: 12,
    description: 'Compute-optimized for real-time video stream encoding.',
  },
  {
    id: 'c5.xlarge',
    instanceType: 'c5.xlarge',
    vcpu: 4,
    ramGB: 8,
    hourlyRate: 0.17, // ~$124.10/mo
    monthlyRate: 124.10,
    cameraStreamsSupported: 24,
    description: 'High compute capacity for heavy multi-stream AI processing.',
  },
  {
    id: 'g4dn.xlarge',
    instanceType: 'g4dn.xlarge (GPU)',
    vcpu: 4,
    ramGB: 16,
    hourlyRate: 0.526, // ~$383.98/mo
    monthlyRate: 383.98,
    cameraStreamsSupported: 50,
    description: 'NVIDIA T4 GPU accelerated instance for real-time AI computer vision.',
  },
];

export const MIN_USERS = 1;
export const MAX_USERS = 25; // change this one number to allow more users

export const DEFAULT_QUOTE_INPUT: QuoteInputState = {
  cmsType: 'normal',
  currency: 'USD',
  inrExchangeRate: 85,
  storagePerLicenseGB: 2, // 2 GB / user (50 users = 100 GB included)
  supabasePlanTier: 'pro',
  whiteLabelingFee: 150,
  whiteLabelingFeeType: 'flat',
  markupPercent: 48, // 45% - 50%
  awsInstanceId: 't3.medium',
  licensesPerAwsInstance: 20, // 1 AWS EC2 instance per 20 licenses (updated per feedback)
  awsCostModel: 'pro_rated', // 'pro_rated' (shared per user) vs 'discrete' (full instance chunks)
  estimatedBandwidthPerLicenseGB: 5,
  customLicenseCount: 12, // Default number of users
  showStandardTiers: true,
  supabaseCostModel: 'pro_rated',
};

/**
 * Calculates pricing for a specific license count based on input parameters and rate configs.
 * Note: White-Labeling is treated as a separate, one-time setup fee and is NOT included
 * in the monthly per-user license calculation or monthly recurring subtotal.
 */
export function calculateTierBreakdown(
  licenses: number,
  input: QuoteInputState,
  supabaseRates: SupabaseRateConfig[] = DEFAULT_SUPABASE_RATES,
  awsInstances: AwsInstanceConfig[] = DEFAULT_AWS_INSTANCES,
  manualOverrides: { pricePerLicense?: number; totalPrice?: number } = {},
  isCustom = false
): TierBreakdown {
  const currency = input.currency || 'USD';
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const multiplier = currency === 'INR' ? (input.inrExchangeRate || 85) : 1;

  // Find selected Supabase Rate Config
  const sbRate =
    supabaseRates.find((r) => r.plan === input.supabasePlanTier) ||
    DEFAULT_SUPABASE_RATES[1];

  // 1. Supabase Costs
  // Pro-rated: the plan (e.g. $25 for 100 GB) is shared until its included data is used up.
  // Users pay the fraction of the plan their data uses (e.g. 20 GB of 100 GB = 20% of $25).
  // Once the included data is exceeded, the full plan is charged plus per-GB overage.
  // 'full' charges the whole plan regardless of usage (old behaviour).
  const totalStorageGB = licenses * input.storagePerLicenseGB;
  const totalBandwidthGB = licenses * input.estimatedBandwidthPerLicenseGB;
  const sbModel = input.supabaseCostModel || 'pro_rated';

  const storageShare =
    sbRate.includedStorageGB > 0 ? totalStorageGB / sbRate.includedStorageGB : 1;
  const bandwidthShare =
    sbRate.includedBandwidthGB > 0 ? totalBandwidthGB / sbRate.includedBandwidthGB : 1;
  const sbShare =
    sbModel === 'pro_rated' && sbRate.computeMonthlyCost > 0
      ? Math.min(1, Math.max(storageShare, bandwidthShare))
      : 1;

  // Overage only starts after the plan's full included data is used
  const billableStorageGB = Math.max(0, totalStorageGB - sbRate.includedStorageGB);
  const supabaseStorageCost = billableStorageGB * sbRate.additionalStoragePerGB * multiplier;

  const billableBandwidthGB = Math.max(0, totalBandwidthGB - sbRate.includedBandwidthGB);
  const supabaseBandwidthCost = billableBandwidthGB * sbRate.additionalBandwidthPerGB * multiplier;

  const supabaseComputeCost = sbRate.computeMonthlyCost * sbShare * multiplier;
  const totalSupabaseCost = supabaseComputeCost + supabaseStorageCost + supabaseBandwidthCost;

  // 2. AWS Costs (AI/ML CMS only)
  let awsNumInstances = 0;
  let awsCost = 0;
  let awsInstanceType = 'N/A';
  const awsCostModel = input.awsCostModel || 'pro_rated';

  if (input.cmsType === 'ai_ml') {
    const awsRate =
      awsInstances.find((i) => i.id === input.awsInstanceId) ||
      DEFAULT_AWS_INSTANCES[0];
    awsInstanceType = awsRate.instanceType;

    const ratio = Math.max(1, input.licensesPerAwsInstance || 20);

    if (awsCostModel === 'pro_rated') {
      // Pro-rated per user / shared instance model so lower user counts don't get charged full instance fee
      awsNumInstances = licenses / ratio;
      awsCost = (licenses / ratio) * awsRate.monthlyRate * multiplier;
    } else {
      // Discrete whole instance model (Math.ceil)
      awsNumInstances = Math.ceil(licenses / ratio);
      awsCost = awsNumInstances * awsRate.monthlyRate * multiplier;
    }
  }

  // 3. White Labeling Cost (Separate One-Time Setup Fee - Excluded from recurring subtotal & markup)
  const baseWhiteLabeling =
    input.whiteLabelingFeeType === 'flat'
      ? input.whiteLabelingFee
      : input.whiteLabelingFee * licenses;
  const whiteLabelingCost = baseWhiteLabeling * multiplier;

  // 4. Monthly Subtotal Base Cost (Pure Monthly Infrastructure Cost without White-Labeling)
  const subtotalCost = totalSupabaseCost + awsCost;

  // 5. Markup & Monthly Calculated Price (Excludes One-Time White Labeling)
  const markupPercent = Math.min(50, Math.max(45, input.markupPercent));
  const markupAmount = subtotalCost * (markupPercent / 100);
  const calculatedTotalPrice = subtotalCost + markupAmount;
  const calculatedPricePerLicense = licenses > 0 ? calculatedTotalPrice / licenses : 0;

  // 6. Manual Overrides (if any, applied to monthly recurring price)
  let finalTotalPrice = calculatedTotalPrice;
  let finalPricePerLicense = calculatedPricePerLicense;

  let manualOverridePricePerLicense = manualOverrides.pricePerLicense ?? null;
  let manualOverrideTotalPrice = manualOverrides.totalPrice ?? null;

  if (manualOverridePricePerLicense !== null && manualOverridePricePerLicense !== undefined) {
    finalPricePerLicense = manualOverridePricePerLicense;
    finalTotalPrice = manualOverridePricePerLicense * licenses;
  } else if (manualOverrideTotalPrice !== null && manualOverrideTotalPrice !== undefined) {
    finalTotalPrice = manualOverrideTotalPrice;
    finalPricePerLicense = licenses > 0 ? manualOverrideTotalPrice / licenses : 0;
  }

  return {
    licenses,
    isCustom,
    currency,
    currencySymbol,
    totalStorageGB,
    supabaseComputeCost,
    supabaseStorageCost,
    supabaseBandwidthCost,
    totalSupabaseCost,
    awsNumInstances,
    awsCostModel,
    awsInstanceType,
    awsCost,
    whiteLabelingCost,
    subtotalCost,
    markupPercent,
    markupAmount,
    calculatedTotalPrice,
    calculatedPricePerLicense,
    manualOverridePricePerLicense,
    manualOverrideTotalPrice,
    finalTotalPrice,
    finalPricePerLicense,
  };
}

/**
 * Calculates complete breakdown matrix for 25, 50, 100 tiers + optional custom tier.
 */
export function calculateAllTiers(
  input: QuoteInputState,
  supabaseRates: SupabaseRateConfig[] = DEFAULT_SUPABASE_RATES,
  awsInstances: AwsInstanceConfig[] = DEFAULT_AWS_INSTANCES,
  overridesMap: Record<number, { pricePerLicense?: number; totalPrice?: number }> = {}
): TierBreakdown[] {
  const standardTiers = [25, 50, 100];
  const showStandard = input.showStandardTiers !== false;

  // Whole number between MIN_USERS and MAX_USERS (protects against old saved quotes / bad values)
  const rawCount = Math.floor(Number(input.customLicenseCount));
  const userCount = Number.isFinite(rawCount)
    ? Math.min(MAX_USERS, Math.max(MIN_USERS, rawCount))
    : MIN_USERS;

  const tiersToCompute: number[] = showStandard ? [...standardTiers] : [];
  if (!tiersToCompute.includes(userCount)) {
    tiersToCompute.push(userCount);
  }

  return tiersToCompute.map((licenses) =>
    calculateTierBreakdown(
      licenses,
      input,
      supabaseRates,
      awsInstances,
      overridesMap[licenses] || {},
      licenses === userCount && !standardTiers.includes(licenses)
    )
  );
}

/**
 * Formats data cleanly for CRM quotation generator or markdown copy.
 * (Hides internal vendor names like Supabase for client-facing presentation).
 */
export function formatForCrm(
  input: QuoteInputState,
  tiers: TierBreakdown[]
): string {
  const cmsLabel = input.cmsType === 'ai_ml' ? 'Real-Time AI/ML CMS' : 'Normal CMS';
  const sym = tiers[0]?.currencySymbol || '$';
  let output = `====================================================\n`;
  output += `CMS PRODUCT QUOTATION BREAKDOWN (Client-Facing CRM Proposal)\n`;
  output += `Product Variant: ${cmsLabel}\n`;
  output += `Currency: ${input.currency || 'USD'} | Infrastructure Tier: ${input.supabasePlanTier.toUpperCase()} | Cloud Storage: ${input.storagePerLicenseGB} GB/user\n`;
  if (input.cmsType === 'ai_ml') {
    const costModelText = input.awsCostModel === 'pro_rated' ? 'Pro-Rated Shared Capacity' : 'Dedicated Full Instance';
    output += `AI Compute Server: ${input.awsInstanceId} (1 per ${input.licensesPerAwsInstance} users | ${costModelText})\n`;
  }
  output += `White-Labeling Service (Optional End-of-Quote One-Time Fee): ${sym}${input.whiteLabelingFee} (${input.whiteLabelingFeeType})\n`;
  output += `Configured Markup: ${input.markupPercent}%\n`;
  output += `====================================================\n\n`;

  tiers.forEach((t) => {
    output += `--- TIER: ${t.licenses} USER LICENSES ${t.isCustom ? '(CUSTOM)' : ''} ---\n`;
    output += `Storage Allocated: ${t.totalStorageGB} GB\n`;
    output += `Database & Storage Base Cost: ${t.currencySymbol}${t.totalSupabaseCost.toFixed(2)}/mo\n`;
    if (input.cmsType === 'ai_ml') {
      const instStr = t.awsCostModel === 'pro_rated' ? `${t.awsNumInstances.toFixed(2)}x` : `${t.awsNumInstances}x`;
      output += `AI Processing Compute Cost (${instStr} ${t.awsInstanceType}): ${t.currencySymbol}${t.awsCost.toFixed(2)}/mo\n`;
    }
    output += `Monthly Infrastructure Base Subtotal: ${t.currencySymbol}${t.subtotalCost.toFixed(2)}/mo\n`;
    output += `Markup Applied (${t.markupPercent}%): +${t.currencySymbol}${t.markupAmount.toFixed(2)}/mo\n`;
    if (t.manualOverrideTotalPrice || t.manualOverridePricePerLicense) {
      output += `* MANUAL OVERRIDE APPLIED *\n`;
    }
    output += `FINAL RECURRING QUOTE PRICE: ${t.currencySymbol}${t.finalTotalPrice.toFixed(2)} / month\n`;
    output += `EFFECTIVE PRICE PER USER: ${t.currencySymbol}${t.finalPricePerLicense.toFixed(2)} / user / month\n\n`;
  });

  output += `====================================================\n`;
  output += `OPTIONAL ONE-TIME ACTIVITY:\n`;
  output += `White-Labeling & Custom Branding Setup Fee: ${sym}${input.whiteLabelingFee.toFixed(2)} (${input.whiteLabelingFeeType})\n`;
  output += `(Managed separately at end based on client scope)\n`;
  output += `====================================================\n`;
  output += `Generated on: ${new Date().toLocaleString()}\n`;
  return output;
}

