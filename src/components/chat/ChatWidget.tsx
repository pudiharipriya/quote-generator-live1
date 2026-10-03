import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Mail,
  User,
  Sparkles,
  ShieldCheck,
  Bot,
  ChevronDown,
} from 'lucide-react';
import { saveChatLead, appendChatMessage } from '../../utils/storage';
import { ChatLead, ChatMessage } from '../../types/pricing';

interface ChatWidgetProps {
  onLeadCaptured?: (lead: ChatLead) => void;
  isOpenDefault?: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  onLeadCaptured,
  isOpenDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [currentLead, setCurrentLead] = useState<ChatLead | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTypingBot, setIsTypingBot] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTypingBot]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;

    const lead = await saveChatLead(email, name);
    setCurrentLead(lead);
    setMessages(lead.messages);
    if (onLeadCaptured) onLeadCaptured(lead);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !currentLead) return;

    const userText = inputText.trim();
    setInputText('');

    // Append user message
    const updatedLead = await appendChatMessage(currentLead.id, {
      sender: 'visitor',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    if (updatedLead) {
      setCurrentLead(updatedLead);
      setMessages([...updatedLead.messages]);
      if (onLeadCaptured) onLeadCaptured(updatedLead);
    }

    // Trigger simulated intelligent agent reply
    setIsTypingBot(true);
    setTimeout(async () => {
      let botResponse =
        "Thank you for contacting us! A specialist from our team will email you detailed pricing options shortly.";

      const lower = userText.toLowerCase();
      if (lower.includes('camera') || lower.includes('ai') || lower.includes('ml')) {
        botResponse =
          "Our Real-Time AI/ML CMS handles high-throughput camera video analytics with custom AWS EC2 scaling. Would you like a demo quotation for 25, 50, or 100 cameras?";
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('quote')) {
        botResponse =
          "We offer multi-tier licenses starting at 25 users up to enterprise scale. We've logged your request and our sales team will reach out at " +
          email +
          "!";
      } else if (lower.includes('supabase') || lower.includes('database')) {
        botResponse =
          "All our CMS deployments leverage high-performance Supabase database, auth, and cloud storage infrastructure with dedicated bandwidth.";
      }

      const postBotLead = await appendChatMessage(currentLead.id, {
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      setIsTypingBot(false);
      if (postBotLead) {
        setCurrentLead(postBotLead);
        setMessages([...postBotLead.messages]);
        if (onLeadCaptured) onLeadCaptured(postBotLead);
      }
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Circular Chat Icon */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all"
          aria-label="Open Chat"
        >
          <MessageSquare className="w-6 h-6 text-white" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-300"></span>
          </span>
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[380px] h-[520px] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-slate-950 flex flex-col overflow-hidden text-slate-100 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 p-4 flex items-center justify-between text-white shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center space-x-1.5">
                  <span>CMS Portal Support</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                </h3>
                <p className="text-[11px] text-blue-100/80">Online • AI & CMS Advisors</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Section */}
          {!currentLead ? (
            /* STEP 1: EMAIL-GATE FORM */
            <div className="flex-1 p-6 flex flex-col justify-center bg-slate-950/60">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Welcome to CMS Support</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Please enter your email to connect with our CMS quotation specialist.
                </p>
              </div>

              <form onSubmit={handleStartChat} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Name (Optional)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Work Email Address <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-600/30 transition-all mt-2"
                >
                  Start Conversation
                </button>

                <p className="text-[10px] text-slate-500 text-center flex items-center justify-center space-x-1 mt-3">
                  <ShieldCheck className="w-3 h-3 text-slate-500" />
                  <span>Your email is securely stored in Supabase</span>
                </p>
              </form>
            </div>
          ) : (
            /* STEP 2: ACTIVE CHAT INTERFACE */
            <div className="flex-1 flex flex-col bg-slate-950/90 overflow-hidden">
              {/* Visitor Badge */}
              <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Chatting as: <strong className="text-white">{currentLead.email}</strong></span>
                <span className="text-cyan-400 font-semibold">Active Session</span>
              </div>

              {/* Message Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'visitor' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl ${
                        msg.sender === 'visitor'
                          ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-bl-none'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}

                {isTypingBot && (
                  <div className="flex items-center space-x-1.5 p-2 bg-slate-800/50 rounded-xl w-16">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type your query..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-all shadow-md shadow-blue-600/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
