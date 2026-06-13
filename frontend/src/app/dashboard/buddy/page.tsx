"use client";

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  User, 
  MessageSquare,
  Bot,
  BrainCircuit,
  Smile,
  Compass,
  ArrowRight
} from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'user' | 'buddy';
  message: string;
  timestamp: Date;
}

export default function BuddyPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'buddy', message: "Hey there! I am TomBuddy AI, your personalized learning companion. How can I help you grow your knowledge tree today?", timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [chatMode, setChatMode] = useState<'Motivation Coach' | 'Mentor' | 'Study Planner Coach'>('Motivation Coach');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptChips = [
    { label: "Motivate me!", text: "I'm feeling a bit stuck. Give me some motivation to learn today!" },
    { label: "Explain Object-Oriented Programming", text: "Can you explain Object-Oriented Programming (OOP) in Python using a simple analogy?" },
    { label: "Create a checklist for variables", text: "Give me a 3-step checklist to master Python variables and loops." },
    { label: "Check my level progress", text: "How can I level up my knowledge tree quickly?" },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      message: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.post('/buddy/chat', { message: text, mode: chatMode });
      
      const buddyMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: 'buddy',
        message: response.data.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, buddyMsg]);
    } catch (error) {
      console.error("AI Buddy error:", error);
      const errorMsg: ChatMessage = {
        id: Date.now() + 1,
        sender: 'buddy',
        message: "Oops! I encountered an error connecting to my server brain. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const getModeDescription = () => {
    switch (chatMode) {
      case 'Motivation Coach': return 'Inspiring, positive guidance to keep your learning streaks active.';
      case 'Mentor': return 'Clear conceptual explanations and software design best practices.';
      case 'Study Planner Coach': return 'Actionable lists and strategies to achieve your academic milestones.';
      default: return 'Your personal study assistant.';
    }
  };

  const getModeIcon = () => {
    switch (chatMode) {
      case 'Motivation Coach': return <Smile className="h-5 w-5 text-amber-500" />;
      case 'Mentor': return <BrainCircuit className="h-5 w-5 text-emerald-500" />;
      case 'Study Planner Coach': return <Compass className="h-5 w-5 text-indigo-500" />;
      default: return <img src="/logo.png" alt="Buddy" className="h-5 w-5 object-contain" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[450px] pb-6">
      
      {/* Mode Select Header */}
      <section className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-3xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center">
            {getModeIcon()}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              TomBuddy Mode: {chatMode}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{getModeDescription()}</p>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto py-1">
          {(['Motivation Coach', 'Mentor', 'Study Planner Coach'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setChatMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                chatMode === mode
                  ? 'bg-indigo-500 text-white shadow shadow-indigo-500/20'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-950 dark:hover:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {mode.split(' ')[0]}
            </button>
          ))}
        </div>
      </section>

      {/* Messages Stream Container */}
      <div className="flex-1 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-3xl p-6 overflow-y-auto mb-4 space-y-4 shadow-inner relative">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3.5 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow ${
                msg.sender === 'user' 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-white border border-slate-200/50 dark:bg-slate-800 dark:border-slate-700'
              }`}>
                {msg.sender === 'user' ? <User className="h-4.5 w-4.5" /> : <img src="/logo.png" alt="Buddy" className="h-5 w-5 object-contain" />}
              </div>

              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-indigo-500 text-white rounded-tr-none'
                  : 'bg-slate-50 text-slate-800 dark:bg-slate-950/60 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800/40'
              }`}>
                {msg.message}
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3.5"
            >
              <div className="h-8 w-8 rounded-xl bg-white border border-slate-200/50 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center">
                <img src="/logo.png" alt="Buddy" className="h-5 w-5 object-contain" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/40 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center space-x-1.5 shadow-sm">
                <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"></span>
                <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && !loading && (
        <div className="flex items-center gap-2 overflow-x-auto py-2 shrink-0 mb-3 px-2">
          {promptChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.text)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200/50 hover:bg-indigo-50/50 hover:border-indigo-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap cursor-pointer transition-all shadow-sm"
            >
              <span>{chip.label}</span>
              <ArrowRight className="h-3 w-3 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Chat Input controls */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }}
        className="flex gap-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-2.5 shadow-md shrink-0"
      >
        <input
          type="text"
          className="flex-1 bg-transparent px-4 py-2.5 text-sm outline-none text-slate-800 dark:text-white placeholder-slate-400"
          placeholder={`Chat with TomBuddy in ${chatMode} mode...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold p-3 rounded-xl transition-all shadow shadow-indigo-500/10 cursor-pointer disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
}
