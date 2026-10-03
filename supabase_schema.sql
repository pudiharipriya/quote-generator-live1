-- ========================================================
-- SUPABASE POSTGRES DATABASE SCHEMA FOR CMS QUOTATION ENGINE
-- ========================================================

-- 1. Saved Quotations Table
CREATE TABLE IF NOT EXISTS public.saved_quotations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  client_name TEXT,
  cms_type TEXT NOT NULL,
  input_state JSONB NOT NULL,
  tiers JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Supabase Rate Config Table
CREATE TABLE IF NOT EXISTS public.pricing_config_supabase (
  plan TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  compute_monthly_cost NUMERIC NOT NULL,
  included_storage_gb NUMERIC NOT NULL,
  additional_storage_per_gb NUMERIC NOT NULL,
  included_bandwidth_gb NUMERIC NOT NULL,
  additional_bandwidth_per_gb NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AWS EC2 Pricing Config Table
CREATE TABLE IF NOT EXISTS public.pricing_config_aws (
  id TEXT PRIMARY KEY,
  instance_type TEXT NOT NULL,
  vcpu INT NOT NULL,
  ram_gb NUMERIC NOT NULL,
  hourly_rate NUMERIC NOT NULL,
  monthly_rate NUMERIC NOT NULL,
  camera_streams_supported INT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Chat Leads Table (Captured via website widget)
CREATE TABLE IF NOT EXISTS public.chat_leads (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  lead_id TEXT REFERENCES public.chat_leads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) policies
ALTER TABLE public.saved_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_config_supabase ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_config_aws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow public read/insert for application access (or configure auth policies as needed)
CREATE POLICY "Allow public read saved_quotations" ON public.saved_quotations FOR SELECT USING (true);
CREATE POLICY "Allow public insert saved_quotations" ON public.saved_quotations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read chat_leads" ON public.chat_leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert chat_leads" ON public.chat_leads FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
