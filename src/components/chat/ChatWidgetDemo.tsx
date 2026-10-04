import React, { useState } from 'react';
import { ChatLead } from '../../types/pricing';
import {
  MessageSquare,
  Users,
  Code,
  Copy,
  Check,
  Mail,
  Calendar,
  ExternalLink,
  Bot,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface ChatWidgetDemoProps {
  leads: ChatLead[];
}

export const ChatWidgetDemo: React.FC<ChatWidgetDemoProps> = ({ leads }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'leads' | 'embed'>('preview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedLead, setSelectedLead] = useState<ChatLead | null>(null);

  const embedScript = `<!-- CMS Lead Capture Chat Widget Embed -->
<script 
  src="https://cdn.yourcompany.com/cms-chat-widget.v1.js"
  data-company-id="cms_prod_992"
  data-theme="blue-white"
  data-supabase-url="https://your-project.supabase.co"
  async>
</script>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedScript);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <span>Client-Facing Chat Widget Studio</span>
          </h2>
          <p className="text-xs text-slate-400">
            Email-gated chat widget for lead capture + live preview & Supabase database log
          </p>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Website Preview
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'leads'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Captured Leads</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-cyan-400/20 text-cyan-300 font-bold">
              {leads.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'embed'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Embed Code
          </button>
        </div>
      </div>

      {/* 1. Live Website Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>
                Interactive Website Simulation: Use the floating widget at bottom-right to test lead submission!
              </span>
            </div>
            <span className="text-slate-500 font-mono">digiferate.in / demo-store</span>
          </div>

          {/* Simulated Browser Frame */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
            {/* Browser top bar */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              </div>

              <div className="bg-slate-950 px-6 py-1 rounded-lg text-xs font-mono text-slate-400 border border-slate-800 flex items-center space-x-2">
                <span className="text-emerald-400">https://</span>
                <span>digiferate.in/products/ai-cms</span>
              </div>

              <div className="text-xs text-slate-500">Demo Page</div>
            </div>

            {/* Simulated Web Content */}
            <div className="p-8 sm:p-12 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 min-h-[380px] flex flex-col items-center justify-center relative">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-medium mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Enterprise Content & Camera AI</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white max-w-2xl leading-tight">
                Empower Your Business With Real-Time AI/ML CMS
              </h1>
              <p className="text-slate-400 text-sm max-w-xl mt-3">
                Seamless cloud management, multi-camera computer vision feeds on AWS, and Supabase security built for enterprise speed.
              </p>

              <div className="flex items-center space-x-4 mt-6">
                <button className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                  Explore Products
                </button>
                <button className="px-6 py-2.5 rounded-xl text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700">
                  Documentation
                </button>
              </div>

              <div className="absolute bottom-4 left-6 text-xs text-slate-500">
                👇 Look at the bottom-right corner for the live chat widget!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Captured Leads Tab */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Captured Visitor Emails & Leads</span>
              </h3>
              <span className="text-xs text-slate-400">Stored in Supabase `chat_leads`</span>
            </div>

            {leads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No visitor leads captured yet. Click the chat widget at the bottom right to test lead submission!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Visitor Email</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Captured At</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Messages</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-sans font-bold text-white">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3.5 h-3.5 text-blue-400" />
                            <span>{lead.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-300">
                          {lead.name || 'Visitor'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {new Date(lead.capturedAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-bold">
                          {lead.messages.length} msgs
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                          >
                            View Log
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Embed Code Snippet Tab */}
      {activeTab === 'embed' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Code className="w-5 h-5 text-blue-400" />
                <span>Embed Snippet For digiferate.in Website</span>
              </h3>
              <p className="text-xs text-slate-400">
                Copy and paste this lightweight script tag into your website's HTML before the closing &lt;/body&gt; tag.
              </p>
            </div>
            <button
              onClick={handleCopyCode}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                copiedCode
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
              }`}
            >
              {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Embed Code'}</span>
            </button>
          </div>

          <div className="relative rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
            <pre>{embedScript}</pre>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs text-slate-300">
            <h4 className="font-semibold text-white">Integration Features:</h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Automatic floating blue/white circular icon fixed at bottom-right corner.</li>
              <li>Email-gate form prevents spam and captures valid visitor email leads before chat initiates.</li>
              <li>Captured leads & chat transcripts are saved directly into your Supabase database.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Lead Transcript Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Chat Transcript Log</h3>
                <p className="text-xs text-blue-400 font-mono">{selectedLead.email}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-3 p-2 bg-slate-950 rounded-xl text-xs">
              {selectedLead.messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-xl ${
                    m.sender === 'visitor'
                      ? 'bg-blue-600/30 text-blue-200 border border-blue-500/30 ml-4'
                      : 'bg-slate-800 text-slate-300 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-bold uppercase">{m.sender}</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
