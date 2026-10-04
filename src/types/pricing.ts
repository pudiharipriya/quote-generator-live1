export type CmsType = 'normal' | 'ai_ml';

export type SupabasePlanTier = 'free' | 'pro' | 'team' | 'enterprise';

export type SupabaseCostModel = 'pro_rated' | 'full';
export type AwsCostModel = 'pro_rated' | 'discrete';

export type Currency = 'USD' | 'INR';

export interface SupabaseRateConfig {
  plan: SupabasePlanTier;
  name: string;
  computeMonthlyCost: number; // Base compute tier cost per month ($)
  includedStorageGB: number;
  additionalStoragePerGB: number; // Rate per GB storage ($)
  includedBandwidthGB: number;
  additionalBandwidthPerGB: number; // Rate per GB bandwidth ($)
}

export interface AwsInstanceConfig {
  id: string;
  instanceType: string;
  vcpu: number;
  ramGB: number;
  hourlyRate: number;
  monthlyRate: number; // 730 hours
  cameraStreamsSupported: number;
  description: string;
}

export interface QuoteInputState {
  cmsType: CmsType;
  currency: Currency; // 'USD' | 'INR'
  inrExchangeRate: number; // USD to INR conversion rate (default 85)
  storagePerLicenseGB: number; // Storage per user (GB)
  supabasePlanTier: SupabasePlanTier;
  whiteLabelingFee: number; // White labeling cost ($ or ₹)
  whiteLabelingFeeType: 'flat' | 'per_license';
  markupPercent: number; // Markup percentage (45% - 50%)
  awsInstanceId: string; // Selected AWS EC2 instance type
  licensesPerAwsInstance: number; // Camera ratio: 1 instance per N licenses (default 20)
  awsCostModel: AwsCostModel; // 'pro_rated' (shared per user) vs 'discrete' (full instance chunks)
  estimatedBandwidthPerLicenseGB: number; // Bandwidth per user/license (GB)
  customLicenseCount: number; // Number of users to quote (1-25)
  supabaseCostModel?: SupabaseCostModel; // 'pro_rated' = users pay only for the share of the plan's included data they use (default), 'full' = whole plan charged
  showStandardTiers?: boolean; // true = also show 25/50/100 comparison cards (default), false = only the chosen user count
}

export interface TierBreakdown {
  licenses: number;
  isCustom?: boolean;
  currency: Currency;
  currencySymbol: string;
  totalStorageGB: number;
  supabaseComputeCost: number;
  supabaseStorageCost: number;
  supabaseBandwidthCost: number;
  totalSupabaseCost: number;
  awsNumInstances: number;
  awsCostModel: AwsCostModel;
  awsInstanceType: string;
  awsCost: number;
  whiteLabelingCost: number;
  subtotalCost: number;
  markupPercent: number;
  markupAmount: number;
  calculatedTotalPrice: number;
  calculatedPricePerLicense: number;
  manualOverridePricePerLicense: number | null;
  manualOverrideTotalPrice: number | null;
  finalTotalPrice: number;
  finalPricePerLicense: number;
}

export interface SavedQuote {
  id: string;
  title: string;
  clientName: string;
  createdAt: string;
  cmsType: CmsType;
  inputState: QuoteInputState;
  tiers: TierBreakdown[];
  notes?: string;
}

export interface ChatLead {
  id: string;
  email: string;
  name?: string;
  capturedAt: string;
  status: 'new' | 'contacted' | 'converted';
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  leadId: string;
  sender: 'visitor' | 'bot' | 'agent';
  text: string;
  timestamp: string;
}
