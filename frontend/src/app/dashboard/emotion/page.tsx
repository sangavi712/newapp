"use client";

import { useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Sparkles, 
  BookOpen, 
  Terminal,
  Activity,
  History
} from 'lucide-react';

interface EmotionLogItem {
  emotion: string;
  timestamp: Date;
}

export default function EmotionPage() {
  const [loggedEmotion, setLoggedEmotion] = useState<string>('');
  const [recommendation, setRecommendation] = useState<string>('');
  const [logging, setLogging] = useState(false);
  const [logs, setLogs] = useState<EmotionLogItem[]>([]);

  const emojis = [
    { name: 'Happy', char: '🤩', color: 'from-amber-400 to-orange-500' },
    { name: 'Neutral', char: '😐', color: 'from-blue-400 to-indigo-500' },
    { name: 'Sad', char: '😢', color: 'from-teal-400 to-emerald-500' },
    { name: 'Tired', char: '😴', color: 'from-purple-400 to-pink-500' },
    { name: 'Stressed', char: '😰', color: 'from-rose-400 to-red-500' },
  ];

  const handleLogEmotion = async (emo: string) => {
    setLogging(true);
    try {
      const response = await api.post('/emotion/log', { emotion: emo });
      setLoggedEmotion(response.data.detected_emotion);
      setRecommendation(response.data.recommendation);
      
      // Add to local history list
      const newLog: EmotionLogItem = {
        emotion: response.data.detected_emotion,
        timestamp: new Date()
      };
      setLogs(prev => [newLog, ...prev]);
    } catch (error) {
      console.error("Failed to log emotion:", error);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-2xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Wellness Hub</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Log your focus mood and get personalized study recommendations</p>
      </div>

      {/* Emoji Select Grid */}
      <section className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-3xl p-6 shadow-md space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Activity className="h-5 w-5 text-indigo-500" />
          <h3 className="font-bold text-slate-900 dark:text-white">How is your learning focus today?</h3>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {emojis.map((emoji) => (
            <motion.button
              key={emoji.name}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLogEmotion(emoji.name)}
              disabled={logging}
              className={`flex flex-col items-center p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer disabled:opacity-50 transition-all ${
                loggedEmotion === emoji.name ? 'ring-2 ring-indigo-500/50 bg-indigo-50/20 dark:bg-indigo-950/20' : ''
              }`}
            >
              <span className="text-3xl sm:text-4xl filter drop-shadow mb-1.5">{emoji.char}</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{emoji.name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Dynamic Recommendation Panel */}
      <AnimatePresence mode="wait">
        {recommendation && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-3xl border border-indigo-200 bg-indigo-50/20 dark:border-indigo-900/30 dark:bg-indigo-950/10 p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300">
                TomBuddy Recommends
              </h4>
            </div>
            
            <p className="text-sm leading-relaxed text-indigo-950 dark:text-indigo-200 font-medium">
              "{recommendation}"
            </p>

            <div className="flex gap-3 pt-2">
              {recommendation.includes("vocabulary") ? (
                <a
                  href="/dashboard/vocabulary"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Go to Vocabulary <BookOpen className="h-3.5 w-3.5" />
                </a>
              ) : (
                <a
                  href="/dashboard/lessons"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Go to Coding lessons <Terminal className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* History check-ins list */}
      {logs.length > 0 && (
        <section className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <History className="h-4.5 w-4.5 text-slate-400" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Check-in Logs</h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-44 overflow-y-auto">
            {logs.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5 text-xs">
                <span className="flex items-center space-x-2">
                  <span className="text-lg">
                    {emojis.find(e => e.name === item.emotion)?.char || '😐'}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.emotion}</span>
                </span>
                <span className="text-slate-400 font-medium">
                  {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
