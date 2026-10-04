import {
  SavedQuote,
  SupabaseRateConfig,
  AwsInstanceConfig,
  ChatLead,
  ChatMessage,
} from '../types/pricing';
import {
  DEFAULT_SUPABASE_RATES,
  DEFAULT_AWS_INSTANCES,
} from './pricingEngine';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const KEYS = {
  SUPABASE_RATES: 'cms_quote_supabase_rates_v1',
  AWS_INSTANCES: 'cms_quote_aws_instances_v1',
  SAVED_QUOTES: 'cms_quote_saved_quotes_v1',
  CHAT_LEADS: 'cms_quote_chat_leads_v1',
};

// ----------------------------------------------------
// 1. Supabase & AWS Rate Config Storage
// ----------------------------------------------------

export function loadSupabaseRates(): SupabaseRateConfig[] {
  try {
    const raw = localStorage.getItem(KEYS.SUPABASE_RATES);
    if (raw) {
      const parsed: SupabaseRateConfig[] = JSON.parse(raw);
      return parsed.map((r) => {
        if (r.plan === 'pro') {
          return {
            ...r,
            includedStorageGB: 100.0,
            additionalStoragePerGB: 0.021,
          };
        }
        return r;
      });
    }
  } catch (e) {
    console.error('Failed to load Supabase rates from localStorage:', e);
  }
  return DEFAULT_SUPABASE_RATES;
}

export function saveSupabaseRates(rates: SupabaseRateConfig[]): void {
  try {
    localStorage.setItem(KEYS.SUPABASE_RATES, JSON.stringify(rates));
  } catch (e) {
    console.error('Failed to save Supabase rates to localStorage:', e);
  }
}

export function loadAwsInstances(): AwsInstanceConfig[] {
  try {
    const raw = localStorage.getItem(KEYS.AWS_INSTANCES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load AWS instances from localStorage:', e);
  }
  return DEFAULT_AWS_INSTANCES;
}

export function saveAwsInstances(instances: AwsInstanceConfig[]): void {
  try {
    localStorage.setItem(KEYS.AWS_INSTANCES, JSON.stringify(instances));
  } catch (e) {
    console.error('Failed to save AWS instances to localStorage:', e);
  }
}

// ----------------------------------------------------
// 2. Saved Quotations Storage
// ----------------------------------------------------

export function loadSavedQuotes(): SavedQuote[] {
  try {
    const raw = localStorage.getItem(KEYS.SAVED_QUOTES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load saved quotes from localStorage:', e);
  }
  return [];
}

export async function saveQuote(quote: SavedQuote): Promise<SavedQuote[]> {
  const existing = loadSavedQuotes();
  const updated = [quote, ...existing.filter((q) => q.id !== quote.id)];
  try {
    localStorage.setItem(KEYS.SAVED_QUOTES, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save quote locally:', e);
  }

  // Attempt sync with Supabase if configured
  if (isSupabaseConfigured) {
    try {
      await supabase.from('saved_quotations').insert({
        id: quote.id,
        title: quote.title,
        client_name: quote.clientName,
        cms_type: quote.cmsType,
        input_state: quote.inputState,
        tiers: quote.tiers,
        notes: quote.notes,
        created_at: quote.createdAt,
      });
    } catch (err) {
      console.warn('Supabase sync warning for saved quotation:', err);
    }
  }

  return updated;
}

export function deleteSavedQuote(id: string): SavedQuote[] {
  const existing = loadSavedQuotes();
  const updated = existing.filter((q) => q.id !== id);
  try {
    localStorage.setItem(KEYS.SAVED_QUOTES, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete quote:', e);
  }
  return updated;
}

// ----------------------------------------------------
// 3. Client-facing Chat Leads Storage
// ----------------------------------------------------

export function loadChatLeads(): ChatLead[] {
  try {
    const raw = localStorage.getItem(KEYS.CHAT_LEADS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load chat leads from localStorage:', e);
  }
  return [];
}

export async function saveChatLead(
  email: string,
  name?: string
): Promise<ChatLead> {
  const leads = loadChatLeads();
  const existingLead = leads.find((l) => l.email.toLowerCase() === email.toLowerCase());

  if (existingLead) {
    return existingLead;
  }

  const newLead: ChatLead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email,
    name: name || 'Website Visitor',
    capturedAt: new Date().toISOString(),
    status: 'new',
    messages: [
      {
        id: `msg_${Date.now()}_bot`,
        leadId: '',
        sender: 'bot',
        text: `Hello ${name || 'there'}! Welcome to our CMS portal. How can we assist you with our Normal or Real-Time AI/ML CMS solutions today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  };

  newLead.messages[0].leadId = newLead.id;
  const updated = [newLead, ...leads];

  try {
    localStorage.setItem(KEYS.CHAT_LEADS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save chat lead:', e);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('chat_leads').insert({
        id: newLead.id,
        email: newLead.email,
        name: newLead.name,
        status: newLead.status,
        created_at: newLead.capturedAt,
      });
    } catch (err) {
      console.warn('Supabase lead capture sync warning:', err);
    }
  }

  return newLead;
}

export async function appendChatMessage(
  leadId: string,
  message: Omit<ChatMessage, 'id' | 'leadId'>
): Promise<ChatLead | null> {
  const leads = loadChatLeads();
  const leadIndex = leads.findIndex((l) => l.id === leadId);

  if (leadIndex === -1) return null;

  const fullMessage: ChatMessage = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    leadId,
  };

  leads[leadIndex].messages.push(fullMessage);

  try {
    localStorage.setItem(KEYS.CHAT_LEADS, JSON.stringify(leads));
  } catch (e) {
    console.error('Failed to append chat message:', e);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('chat_messages').insert({
        id: fullMessage.id,
        lead_id: leadId,
        sender: fullMessage.sender,
        text: fullMessage.text,
        created_at: fullMessage.timestamp,
      });
    } catch (err) {
      console.warn('Supabase message sync warning:', err);
    }
  }

  return leads[leadIndex];
}
