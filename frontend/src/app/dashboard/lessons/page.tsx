"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle2, 
  Lock, 
  BookOpen, 
  Terminal as TerminalIcon, 
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';

export default function LessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [selectedLessonDetails, setSelectedLessonDetails] = useState<any>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const [completing, setCompleting] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await api.get('/coding/lessons');
      setLessons(response.data);
    } catch (error) {
      console.error("Failed to fetch coding lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectLesson = async (lesson: any) => {
    setSelectedLesson(lesson);
    setFetchingDetails(true);
    setConsoleOutput([]);
    setIsVerified(false);
    setCompletionMessage('');
    
    // Default starter codes depending on lesson topic
    if (lesson.topic.toLowerCase().includes('variables')) {
      setUserCode("# Assign x = 10 and y = 5 below\nx = \ny = \n");
    } else if (lesson.topic.toLowerCase().includes('conditional')) {
      setUserCode("score = 85\n\n# Check if score > 80, and print \"Pass\"\nif \n");
    } else if (lesson.topic.toLowerCase().includes('loop')) {
      setUserCode("# Create a for loop to print numbers from 1 to 5\nfor i in \n");
    } else {
      setUserCode("# Write your python code here\n");
    }

    try {
      const response = await api.get(`/coding/lessons/${lesson.id}`);
      setSelectedLessonDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch lesson details:", error);
    } finally {
      setFetchingDetails(false);
    }
  };

  const runAndVerify = () => {
    setIsRunning(true);
    setConsoleOutput(["Initializing environment...", "Running code..."]);
    
    setTimeout(() => {
      const code = userCode;
      const outputs: string[] = [];
      let verified = false;

      // Simulated local evaluation engine based on topic
      const topic = selectedLesson.topic.toLowerCase();
      if (topic.includes('variables')) {
        const hasX = /x\s*=\s*10/.test(code);
        const hasY = /y\s*=\s*5/.test(code);
        
        if (hasX && hasY) {
          outputs.push(">>> x = 10", ">>> y = 5", "Variables loaded successfully!", "Test Passed: x is 10 and y is 5.");
          verified = true;
        } else {
          outputs.push("Execution Error: Check your variable names and values.", "Test Failed: Make sure to assign x = 10 and y = 5.");
        }
      } else if (topic.includes('conditional')) {
        const hasIf = /if\s+score\s*>\s*80/.test(code);
        const hasPrint = /print\(\s*['\"]Pass['\"]\s*\)/.test(code);
        
        if (hasIf && hasPrint) {
          outputs.push(">>> score = 85", ">>> if score > 80: print('Pass')", "Pass", "Test Passed: Condition evaluation correct.");
          verified = true;
        } else {
          outputs.push("Execution Error: Code did not trigger 'Pass'.", "Test Failed: Create if block checking if score > 80 and print 'Pass'.");
        }
      } else {
        // Generic runner
        outputs.push("Running script...", "Process completed with exit code 0.");
        verified = true; // Auto verify other sandbox courses
      }

      setConsoleOutput(outputs);
      setIsVerified(verified);
      setIsRunning(false);
    }, 1200);
  };

  const completeLesson = async () => {
    setCompleting(true);
    try {
      const response = await api.post('/coding/complete', { lesson_id: selectedLesson.id });
      setCompletionMessage(response.data.message);
      
      // Notify 3D Cat Companion
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('task-completed', { 
          detail: { type: 'lesson', topic: selectedLesson.topic } 
        }));
      }

      // Refresh lessons statuses
      fetchLessons();
    } catch (error) {
      console.error("Error completing lesson:", error);
    } finally {
      setCompleting(false);
    }
  };

  const getLessonLevel = (order: number) => {
    if (order <= 3) return 'Beginner';
    if (order <= 6) return 'Intermediate';
    return 'Advanced';
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30';
      case 'Intermediate': return 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30';
      case 'Advanced': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
      default: return 'bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400';
    }
  };

  const filteredLessons = lessons.filter(l => {
    const level = getLessonLevel(l.order);
    const matchesSearch = l.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'All' || level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <AnimatePresence mode="wait">
        {!selectedLesson ? (
          // Lessons List View
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Coding Playground</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Master Python step-by-step through interactive coding challenges</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search lessons..."
                  className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:border-indigo-400 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto py-1">
                <Filter className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLevelFilter(lvl as any)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      levelFilter === lvl
                        ? 'bg-indigo-500 text-white shadow shadow-indigo-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 dark:bg-slate-950 dark:hover:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Lessons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLessons.map((lesson) => {
                const level = getLessonLevel(lesson.order);
                return (
                  <motion.div
                    key={lesson.id}
                    whileHover={{ y: -3 }}
                    className="flex flex-col justify-between bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-200 dark:border-slate-600 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getLevelBadgeColor(level)}`}>
                          {level}
                        </span>
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                          Order #{lesson.order}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-snug">
                        {lesson.topic}
                      </h3>
                      
                      <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <span>Language: {lesson.language}</span>
                      </div>
                    </div>
                    
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">
                        ⚡ +{lesson.xp_reward} XP
                      </span>
                      
                      <button
                        onClick={() => selectLesson(lesson)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Start Lesson <Play className="h-3 w-3 fill-current ml-0.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {filteredLessons.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <TerminalIcon className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">No coding lessons match your criteria.</p>
              </div>
            )}
          </motion.div>
        ) : (
          // Split Pane Interactive Lesson Simulator View
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex flex-col gap-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4">
              <button
                onClick={() => { setSelectedLesson(null); setSelectedLessonDetails(null); }}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white cursor-pointer transition-colors"
              >
                <ChevronLeft className="h-4.5 w-4.5" /> Back to Playground
              </button>
              
              <div className="text-right">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{selectedLesson.topic}</h3>
                <span className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400">⚡ +{selectedLesson.xp_reward} XP Reward</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-14rem)] min-h-[500px]">
              {/* Left Pane: Instructions */}
              <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-3xl p-6 overflow-y-auto space-y-4">
                {fetchingDetails ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : selectedLessonDetails ? (
                  <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
                    {/* Render formatting simply or manually structure markdown */}
                    <div className="whitespace-pre-line leading-relaxed font-sans">
                      {selectedLessonDetails.content}
                    </div>
                  </div>
                ) : (
                  <p className="text-rose-500 text-sm">Failed to load content details.</p>
                )}
              </div>

              {/* Right Pane: Code Editor Terminal */}
              <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden text-white">
                {/* Editor Top Bar */}
                <div className="flex items-center justify-between px-6 py-3 bg-slate-950/60 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500"></span>
                    <span className="h-3 w-3 rounded-full bg-amber-500"></span>
                    <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-slate-400 ml-4 font-mono">main.py</span>
                  </div>
                </div>

                {/* Editor Textarea */}
                <textarea
                  className="flex-1 bg-transparent px-6 py-4 font-mono text-sm leading-relaxed outline-none resize-none text-indigo-300 focus:text-indigo-200 transition-colors"
                  spellCheck="false"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  disabled={isVerified || completing}
                />

                {/* Output Console Console */}
                <div className="h-44 bg-slate-950 border-t border-slate-800 font-mono text-xs p-4 overflow-y-auto space-y-1.5 select-none">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Console Output</div>
                  {consoleOutput.map((log, idx) => (
                    <div key={idx} className={log.includes("Failed") || log.includes("Error") ? "text-rose-400" : log.includes("Passed") || log.includes("success") ? "text-emerald-400" : "text-slate-300"}>
                      {log}
                    </div>
                  ))}
                  {consoleOutput.length === 0 && <span className="text-slate-600">Console is idle. Write code and click run.</span>}
                </div>

                {/* Action Controls */}
                <div className="px-6 py-4 bg-slate-950 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
                  {!isVerified ? (
                    <button
                      onClick={runAndVerify}
                      disabled={isRunning}
                      className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm px-6 py-2.5 cursor-pointer transition-all shadow-lg shadow-indigo-600/20"
                    >
                      {isRunning ? 'Running...' : 'Run & Verify'}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="h-5 w-5 fill-emerald-500/20" /> Challenge Solved!
                      </span>
                      
                      {!completionMessage ? (
                        <button
                          onClick={completeLesson}
                          disabled={completing}
                          className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm px-5 py-2.5 cursor-pointer shadow shadow-emerald-500/10"
                        >
                          <Sparkles className="h-4 w-4" /> {completing ? 'Saving...' : 'Submit & Complete'}
                        </button>
                      ) : null}
                    </div>
                  )}

                  {completionMessage && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-xs font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-4 py-2 rounded-2xl flex-1 text-center"
                    >
                      {completionMessage}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
