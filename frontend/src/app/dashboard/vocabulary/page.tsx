"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Volume2, 
  Check, 
  ChevronRight, 
  RotateCw,
  Search,
  Filter,
  BookOpen,
  Award,
  Flame,
  Coins,
  TrendingUp,
  Info,
  Calendar,
  Trophy,
  BookOpenCheck,
  ChevronLeft
} from 'lucide-react';

export default function VocabularyPage() {
  const [activeTab, setActiveTab] = useState<'daily' | 'quiz' | 'library' | 'stats'>('daily');
  const [words, setWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completingToast, setCompletingToast] = useState('');

  // Quiz States
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizRewards, setQuizRewards] = useState<any>(null);

  // Matching Question States
  const [selectedWord, setSelectedWord] = useState<any | null>(null);
  const [selectedTamil, setSelectedTamil] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]); // Array of words matched
  const [wrongMatchWord, setWrongMatchWord] = useState<string | null>(null);
  const [wrongMatchTamil, setWrongMatchTamil] = useState<string | null>(null);

  // Library States
  const [libraryWords, setLibraryWords] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Tech/IT' | 'Workplace' | 'General'>('All');
  const [libLoading, setLibLoading] = useState(false);

  // Stats States
  const [stats, setStats] = useState<any>({
    total_in_progress: 0,
    total_learned: 0,
    weekly_stats: [],
    coins: 0,
    streak: 0,
    insights: ""
  });

  useEffect(() => {
    initPage();
  }, []);

  const initPage = async () => {
    setLoading(true);
    await fetchWords();
    await fetchStats();
    setLoading(false);
  };

  const fetchWords = async () => {
    try {
      const response = await api.get('/vocabulary/daily');
      setWords(response.data);
      if (response.data && response.data.length > 0) {
        // Dispatch companion introduction
        const wordNames = response.data.map((w: any) => w.word);
        window.dispatchEvent(new CustomEvent('vocab-introduce', {
          detail: { words: wordNames }
        }));
      }
    } catch (error) {
      console.error("Failed to fetch vocabulary words:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/vocabulary/stats');
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  const fetchLibrary = async () => {
    setLibLoading(true);
    try {
      const response = await api.get(`/vocabulary/library?query=${searchTerm}&category=${categoryFilter}`);
      setLibraryWords(response.data);
    } catch (error) {
      console.error("Failed to fetch library:", error);
    } finally {
      setLibLoading(false);
    }
  };

  // Re-fetch library when search or category changes
  useEffect(() => {
    if (activeTab === 'library') {
      fetchLibrary();
    }
  }, [searchTerm, categoryFilter, activeTab]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const response = await api.get('/vocabulary/quiz');
      setQuizQuestions(response.data.questions);
      setQuizIndex(0);
      setQuizCompleted(false);
      setQuizScore(0);
      setSelectedOption(null);
      setShowExplanation(false);
      setMatchedPairs([]);
      setQuizRewards(null);
    } catch (error) {
      console.error("Failed to load quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const speakWord = (word: string, meaning: string) => {
    if (typeof window !== 'undefined') {
      // Native Speech Synthesis
      window.dispatchEvent(new CustomEvent('vocab-pronounce', {
        detail: { word, meaning }
      }));
    }
  };

  const handleMarkAsLearned = async (wordId: number) => {
    setCompleting(true);
    setCompletingToast('');
    try {
      const response = await api.post('/vocabulary/complete', { vocab_id: wordId });
      setCompletingToast(response.data.message);
      setLearnedCount(prev => prev + 1);

      // Notify companion of completed task
      window.dispatchEvent(new CustomEvent('task-completed', {
        detail: { type: 'vocab', word: activeWord.word }
      }));

      // Refresh Stats after completing
      fetchStats();

      setTimeout(() => {
        setCompletingToast('');
        if (currentIndex < words.length - 1) {
          setIsFlipped(false);
          setCurrentIndex(prev => prev + 1);
        } else {
          setSessionCompleted(true);
          // Notify companion of vocab daily session complete
          window.dispatchEvent(new CustomEvent('goal-achieved', {
            detail: { type: 'vocab-session', count: learnedCount + 1 }
          }));
          // Auto switch to quiz tab
          setTimeout(() => {
            setActiveTab('quiz');
            loadQuiz();
          }, 2500);
        }
      }, 1200);
    } catch (error) {
      console.error("Failed to save word completion:", error);
    } finally {
      setCompleting(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    } else {
      setSessionCompleted(true);
      setTimeout(() => {
        setActiveTab('quiz');
        loadQuiz();
      }, 1500);
    }
  };

  // Submit Answer to Quiz Question
  const handleSelectQuizOption = (option: string) => {
    if (selectedOption !== null) return; // Answer locked
    setSelectedOption(option);
    const correctAns = quizQuestions[quizIndex].answer;
    
    if (option === correctAns) {
      setQuizScore(prev => prev + 1);
      // Trigger companion celebration
      window.dispatchEvent(new CustomEvent('vocab-correct'));
    } else {
      // Trigger companion comfort
      window.dispatchEvent(new CustomEvent('vocab-wrong'));
    }
    setShowExplanation(true);
  };

  // Go to next quiz question or complete
  const handleNextQuiz = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      submitQuizResults();
    }
  };

  // Match columns selection
  const handleMatchWordSelect = (wordObj: any) => {
    if (matchedPairs.includes(wordObj.word)) return;
    setSelectedWord(wordObj);
    if (selectedTamil) {
      checkMatch(wordObj, selectedTamil);
    }
  };

  const handleMatchTamilSelect = (tamil: string) => {
    // Check if tamil is already matched
    const isAlreadyMatched = quizQuestions[quizIndex].pairs.some(
      (p: any) => p.tamil === tamil && matchedPairs.includes(p.word)
    );
    if (isAlreadyMatched) return;

    setSelectedTamil(tamil);
    if (selectedWord) {
      checkMatch(selectedWord, tamil);
    }
  };

  const checkMatch = (wordObj: any, tamil: string) => {
    const isCorrect = wordObj.tamil === tamil;
    if (isCorrect) {
      setMatchedPairs(prev => [...prev, wordObj.word]);
      setSelectedWord(null);
      setSelectedTamil(null);
      window.dispatchEvent(new CustomEvent('vocab-correct'));
      
      // Check if all pairs are matched
      const totalPairs = quizQuestions[quizIndex].pairs.length;
      if (matchedPairs.length + 1 === totalPairs) {
        setQuizScore(prev => prev + 1);
        setTimeout(() => {
          submitQuizResults();
        }, 1500);
      }
    } else {
      setWrongMatchWord(wordObj.word);
      setWrongMatchTamil(tamil);
      window.dispatchEvent(new CustomEvent('vocab-wrong'));
      setTimeout(() => {
        setWrongMatchWord(null);
        setWrongMatchTamil(null);
        setSelectedWord(null);
        setSelectedTamil(null);
      }, 1000);
    }
  };

  const submitQuizResults = async () => {
    try {
      const response = await api.post('/vocabulary/submit', {
        score: quizScore,
        total: quizQuestions.length
      });
      setQuizRewards(response.data);
      setQuizCompleted(true);
      fetchStats(); // Update stats dashboard
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    }
  };

  const activeWord = words[currentIndex];
  const activeQuiz = quizQuestions[quizIndex];

  return (
    <div className="min-h-screen pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8 select-none">
      
      {/* Top Glassmorphism Header */}
      <div className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">BuddyLearn AI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            Daily English Vocabulary
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Learn 5 curated English words daily, challenge yourself with quizzes, and build permanent retention.
          </p>
        </div>

        {/* User Mini Stats Panel */}
        <div className="flex gap-4 items-center bg-slate-50/70 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600 px-4 py-3 rounded-2xl">
          <div className="flex items-center gap-1.5" title="XP Balance">
            <span className="text-base text-yellow-500">🏆</span>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Level {stats.level || 1}</p>
              <p className="text-xs font-black text-slate-700 dark:text-slate-200 leading-normal">{stats.xp || 0} XP</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-1.5" title="Coins Balance">
            <Coins className="h-4.5 w-4.5 text-amber-500" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Coins</p>
              <p className="text-xs font-black text-slate-700 dark:text-slate-200 leading-normal">{stats.coins || 0}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-1.5" title="Streak Days">
            <Flame className="h-4.5 w-4.5 text-orange-500 fill-current animate-pulse" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Streak</p>
              <p className="text-xs font-black text-slate-700 dark:text-slate-200 leading-normal">{stats.streak || 0} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex items-center p-1.5 bg-slate-100/50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600/30 rounded-2xl max-w-lg mx-auto">
        {(['daily', 'quiz', 'library', 'stats'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'quiz') loadQuiz();
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-800 text-indigo-500 dark:text-white shadow-lg border-2 border-slate-200 dark:border-slate-600'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab === 'daily' && 'Daily Word'}
            {tab === 'quiz' && 'Daily Quiz'}
            {tab === 'library' && 'Library'}
            {tab === 'stats' && 'Insights'}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          
          {/* DAILY LESSON TAB */}
          {activeTab === 'daily' && (
            <motion.div
              key="daily-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {loading ? (
                <div className="flex h-60 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : sessionCompleted ? (
                // Completed session screen
                <div className="bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-4xl shadow shadow-emerald-500/20 text-emerald-500 mx-auto animate-bounce">
                    🎉
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">Daily Words Completed!</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      Congratulations! You reviewed all 5 cards for today. Your virtual pet is excited for your progress!
                    </p>
                  </div>
                  
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl inline-block">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-center">
                      <Sparkles className="h-4 w-4" /> Ready for Daily Quiz (+50 XP, +20 Coins)
                    </p>
                  </div>

                  <div>
                    <button
                      onClick={() => { setActiveTab('quiz'); loadQuiz(); }}
                      className="px-6 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm shadow-lg shadow-indigo-500/20 cursor-pointer transition-all flex items-center gap-2 mx-auto"
                    >
                      Start Daily Quiz <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : words.length > 0 && activeWord ? (
                <div className="space-y-6">
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black text-slate-400 tracking-wider">
                      <span>WORD {currentIndex + 1} OF {words.length}</span>
                      <span>{Math.round(((currentIndex + 1) / words.length) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                        style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Flipping Container */}
                  <motion.div 
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(event, info) => {
                      if (info.offset.x < -100) {
                        handleSkip();
                      } else if (info.offset.x > 100) {
                        handleMarkAsLearned(activeWord.id);
                      }
                    }}
                    className="w-full cursor-pointer h-96 relative group"
                    style={{ perspective: 1000 }}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <motion.div
                      initial={false}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      className="w-full h-full relative"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Front Side */}
                      <div 
                        className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 border border-white/60 dark:border-slate-800/50 rounded-3xl p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <div className="flex items-start justify-between">
                          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                            {activeWord.category}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); speakWord(activeWord.word, activeWord.meaning); }}
                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer"
                            title="Hear Pronunciation"
                          >
                            <Volume2 className="h-5 w-5" />
                          </button>
                        </div>
                        
                        <div className="text-center py-6 space-y-4">
                          <span className="text-6xl select-none block animate-bounce">{activeWord.emoji}</span>
                          <h3 className="text-4xl sm:text-5xl font-black text-slate-800 dark:text-white tracking-tight">
                            {activeWord.word}
                          </h3>
                          {activeWord.pronunciation && (
                            <p className="text-sm font-mono text-slate-400 font-bold tracking-wider">{activeWord.pronunciation}</p>
                          )}
                        </div>

                        <div className="text-center text-xs font-black text-indigo-500 flex items-center justify-center gap-2">
                          <RotateCw className="h-4 w-4 animate-spin-slow" /> TAP TO FLIP AND REVEAL
                        </div>
                      </div>

                      {/* Back Side */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-slate-900/80 dark:to-indigo-950/40 border border-indigo-200/50 dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        <div className="space-y-5">
                          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/80 pb-3">
                            <span className="text-sm font-black text-indigo-500 uppercase tracking-wider">{activeWord.word}</span>
                            <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 px-3 py-1 rounded-full uppercase tracking-widest">{activeWord.category}</span>
                          </div>
                          
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Definition</span>
                            <p className="text-base sm:text-xl leading-relaxed text-slate-800 dark:text-slate-200 font-extrabold">{activeWord.meaning}</p>
                          </div>

                          <div className="space-y-2 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                            <span className="text-[11px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">தமிழ் விளக்கம் (Tamil Meaning)</span>
                            <p className="text-base sm:text-xl font-black text-slate-700 dark:text-slate-300 leading-normal">{activeWord.meaning_tamil}</p>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1"><Info className="h-3.5 w-3.5" /> Usage Example</span>
                            <p className="text-sm sm:text-base italic leading-relaxed text-slate-500 dark:text-slate-400 font-semibold">"{activeWord.example_sentence}"</p>
                          </div>
                        </div>

                        <div className="text-center text-xs font-black text-indigo-500 dark:text-indigo-400 flex items-center justify-center gap-2">
                          <RotateCw className="h-4 w-4" /> CLICK TO FLIP BACK
                        </div>
                      </div>

                    </motion.div>
                  </motion.div>

                  {/* Swipe instructions helper */}
                  <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    ← Swipe Left to Skip | Swipe Right to Learn →
                  </p>

                  {/* Quick Actions Panel */}
                  <div className="flex gap-4 items-center justify-between">
                    <button
                      onClick={handleSkip}
                      className="flex-1 py-3.5 px-4 rounded-2xl bg-white border border-slate-200/60 text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50 font-black text-xs uppercase tracking-widest shadow-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      Skip <ChevronRight className="h-4.5 w-4.5" />
                    </button>

                    <button
                      onClick={() => handleMarkAsLearned(activeWord.id)}
                      disabled={completing}
                      className="flex-1 py-3.5 px-4 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/15 cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-55"
                    >
                      <Check className="h-5 w-5" /> I Learned This
                    </button>
                  </div>

                  {/* Toast response feedback */}
                  <AnimatePresence>
                    {completingToast && (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="text-center text-xs font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 py-3 rounded-2xl flex items-center justify-center gap-2"
                      >
                        <Sparkles className="h-4.5 w-4.5" /> {completingToast}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-16 w-full bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-black">No vocabulary seeded in the system.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* DAILY QUIZ TAB */}
          {activeTab === 'quiz' && (
            <motion.div
              key="quiz-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {loading ? (
                <div className="flex h-60 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : quizCompleted ? (
                // Quiz completion success report
                <div className="bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10 text-4xl shadow shadow-amber-500/20 text-amber-500 mx-auto animate-bounce">
                    🏆
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white">Daily Quiz Passed!</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      You scored <span className="font-black text-indigo-500">{quizScore} / {quizQuestions.length}</span>! Your pet is extremely proud of you.
                    </p>
                  </div>

                  {quizRewards && (
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto p-4 bg-slate-50/80 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600 rounded-2xl text-left">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Coins Reward</span>
                        <p className="text-base font-black text-slate-800 dark:text-white flex items-center gap-1">
                          <Coins className="h-4 w-4 text-amber-500" /> +{quizRewards.coin_reward} Coins
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase leading-none">XP Reward</span>
                        <p className="text-base font-black text-slate-800 dark:text-white flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-yellow-500" /> +{quizRewards.xp_reward} XP
                        </p>
                      </div>
                      <div className="col-span-2 border-t border-slate-200 dark:border-slate-800 pt-2 mt-1 space-y-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Current Study Streak</span>
                        <p className="text-sm font-black text-orange-500 flex items-center gap-1">
                          <Flame className="h-4 w-4 fill-current" /> {quizRewards.streak} Day Streak!
                        </p>
                      </div>
                    </div>
                  )}

                  {quizRewards?.badges && quizRewards.badges.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Badges Earned</h4>
                      <div className="flex justify-center gap-4">
                        {quizRewards.badges.map((b: any, idx: number) => (
                          <div key={idx} className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex flex-col items-center gap-1 w-28">
                            <span className="text-2xl">{b.icon}</span>
                            <span className="text-[9px] font-black text-slate-800 dark:text-white text-center leading-tight">{b.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 max-w-sm mx-auto">
                    <button
                      onClick={loadQuiz}
                      className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-all"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setActiveTab('stats')}
                      className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-indigo-500/15 transition-all"
                    >
                      Check Analytics
                    </button>
                  </div>
                </div>
              ) : quizQuestions.length > 0 && activeQuiz ? (
                <div className="space-y-6">
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-black text-slate-400 tracking-wider">
                      <span>QUESTION {quizIndex + 1} OF {quizQuestions.length}</span>
                      <span>Score: {quizScore}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* QUESTION PANEL */}
                  <div className="bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl select-none">{activeQuiz.emoji || '📝'}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                        {activeQuiz.type === 'mcq' ? 'Multiple Choice' : activeQuiz.type === 'blank' ? 'Fill the Blank' : 'Match Pairs'}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white leading-relaxed">
                      {activeQuiz.question}
                    </h3>

                    {/* RENDERING SUBQUESTION TYPES */}
                    {activeQuiz.type === 'mcq' || activeQuiz.type === 'blank' ? (
                      <div className="grid grid-cols-1 gap-3.5">
                        {activeQuiz.options.map((opt: string, idx: number) => {
                          const isSelected = selectedOption === opt;
                          const isCorrectOption = opt === activeQuiz.answer;
                          let btnStyle = "bg-white/60 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850";
                          
                          if (selectedOption !== null) {
                            if (isCorrectOption) {
                              btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400";
                            } else if (isSelected) {
                              btnStyle = "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-400";
                            } else {
                              btnStyle = "bg-slate-100/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800/50 text-slate-400 opacity-55";
                            }
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => handleSelectQuizOption(opt)}
                              disabled={selectedOption !== null}
                              className={`w-full p-4 rounded-2xl text-left text-sm font-extrabold transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {selectedOption !== null && isCorrectOption && <span className="text-emerald-500">✓</span>}
                              {selectedOption !== null && isSelected && !isCorrectOption && <span className="text-rose-500">✗</span>}
                            </button>
                          );
                        })}
                      </div>
                    ) : activeQuiz.type === 'match' ? (
                      // Matching UI
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Column 1: English Words */}
                          <div className="space-y-2.5">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">English</h4>
                            {activeQuiz.pairs.map((p: any) => {
                              const isMatched = matchedPairs.includes(p.word);
                              const isSelected = selectedWord?.word === p.word;
                              const isWrong = wrongMatchWord === p.word;
                              
                              let style = "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300";
                              if (isMatched) {
                                style = "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 opacity-60 cursor-default";
                              } else if (isSelected) {
                                style = "bg-indigo-500/10 border-indigo-500 text-indigo-500";
                              } else if (isWrong) {
                                style = "bg-rose-500/10 border-rose-500 text-rose-500 animate-shake";
                              }

                              return (
                                <button
                                  key={p.id}
                                  onClick={() => handleMatchWordSelect(p)}
                                  disabled={isMatched}
                                  className={`w-full p-3 rounded-xl border text-center text-xs font-black transition-all cursor-pointer ${style}`}
                                >
                                  {p.word}
                                </button>
                              );
                            })}
                          </div>

                          {/* Column 2: Tamil Meanings */}
                          <div className="space-y-2.5">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tamil Translation</h4>
                            {activeQuiz.shuffled_tamils.map((tamil: string, idx: number) => {
                              // Find corresponding word
                              const correspondingPair = activeQuiz.pairs.find((p: any) => p.tamil === tamil);
                              const isMatched = correspondingPair && matchedPairs.includes(correspondingPair.word);
                              const isSelected = selectedTamil === tamil;
                              const isWrong = wrongMatchTamil === tamil;

                              let style = "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300";
                              if (isMatched) {
                                style = "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 opacity-60 cursor-default";
                              } else if (isSelected) {
                                style = "bg-indigo-500/10 border-indigo-500 text-indigo-500";
                              } else if (isWrong) {
                                style = "bg-rose-500/10 border-rose-500 text-rose-500";
                              }

                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleMatchTamilSelect(tamil)}
                                  disabled={isMatched}
                                  className={`w-full p-3 rounded-xl border text-center text-xs font-black transition-all cursor-pointer ${style}`}
                                >
                                  {tamil}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
                          Select an English word first, then match it to its Tamil meaning!
                        </p>
                      </div>
                    ) : null}

                    {/* Explanation and navigation button */}
                    {showExplanation && (
                      <div className="pt-2">
                        <button
                          onClick={handleNextQuiz}
                          className="w-full py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/15 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          Next Question <ChevronRight className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 w-full bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-black">No quiz questions generated. Finish daily words first!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* PERSONAL LIBRARY TAB */}
          {activeTab === 'library' && (
            <motion.div
              key="library-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 p-4 rounded-3xl backdrop-blur-xl shadow-xl">
                <div className="relative w-full flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search library words..."
                    className="pl-11 w-full rounded-2xl border border-slate-200 bg-slate-50/40 dark:bg-slate-950/40 px-3 py-3 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:text-white dark:focus:border-indigo-400 transition-all font-semibold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto py-1">
                  {['All', 'Tech/IT', 'Workplace', 'General'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat as any)}
                      className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                        categoryFilter === cat
                          ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                          : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Library Cards list */}
              {libLoading ? (
                <div className="flex h-60 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : libraryWords.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {libraryWords.map((w) => (
                    <motion.div
                      key={w.id}
                      whileHover={{ y: -3 }}
                      className="bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 p-5 rounded-2xl shadow-md backdrop-blur-xl flex justify-between items-start gap-4"
                    >
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-2xl select-none">{w.emoji}</span>
                          <h4 className="text-lg font-black text-slate-800 dark:text-white leading-none">{w.word}</h4>
                          <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wide">{w.pronunciation}</span>
                          <span className="px-2 py-0.5 rounded-md text-[8px] font-black bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">{w.category}</span>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{w.meaning}</p>
                          <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 font-sans">தமிழ்: {w.meaning_tamil}</p>
                        </div>
                        <p className="text-[11px] italic text-slate-400 font-medium">"{w.example_sentence}"</p>
                      </div>

                      {/* Spaced repetition indicator */}
                      <div className="text-right flex flex-col items-end space-y-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                          w.status === 'learned'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {w.status === 'learned' ? 'Learned' : `Stage ${w.review_stage}`}
                        </span>
                        
                        {w.next_review_date && (
                          <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                            <Calendar className="h-3 w-3" />
                            <span>Review: {new Date(w.next_review_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 w-full bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 backdrop-blur-xl shadow-xl">
                  <BookOpenCheck className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-black">No words found in your library.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* ANALYTICS & INSIGHTS TAB */}
          {activeTab === 'stats' && (
            <motion.div
              key="stats-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Top Overview Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 p-5 rounded-3xl backdrop-blur-xl shadow-xl flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl text-2xl">⏳</div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">In Progress</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">{stats.total_in_progress || 0}</p>
                  </div>
                </div>

                <div className="bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 p-5 rounded-3xl backdrop-blur-xl shadow-xl flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl text-2xl">🎓</div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fully Learned</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white leading-none">{stats.total_learned || 0}</p>
                  </div>
                </div>
              </div>

              {/* Goal Tracker */}
              <div className="bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-4">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="h-4.5 w-4.5 text-yellow-500" /> Daily Goal Tracker
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-950/20 border-2 border-slate-200 dark:border-slate-600 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="h-5 w-5 bg-emerald-500/10 rounded-lg flex items-center justify-center text-xs font-bold text-emerald-500">✓</div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-250">Learn 5 Flashcards today</span>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md uppercase">Completed</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-950/20 border-2 border-slate-200 dark:border-slate-600 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className="h-5 w-5 bg-emerald-500/10 rounded-lg flex items-center justify-center text-xs font-bold text-emerald-500">✓</div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-250">Submit Daily Vocabulary Quiz</span>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md uppercase">Completed</span>
                  </div>
                </div>
              </div>

              {/* Weekly Stats Bar Chart */}
              {stats.weekly_stats && stats.weekly_stats.length > 0 && (
                <div className="bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-4">
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-4.5 w-4.5 text-indigo-500" /> Weekly Learning Activity
                  </h3>

                  <div className="flex justify-between items-end h-28 pt-2 px-4 gap-2">
                    {stats.weekly_stats.map((stat: any, idx: number) => {
                      const maxVal = Math.max(...stats.weekly_stats.map((s: any) => s.count)) || 1;
                      const pct = Math.max(10, (stat.count / maxVal) * 100);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400">{stat.count}</span>
                          <div className="w-full bg-slate-200/40 dark:bg-slate-800/40 rounded-t-lg h-20 flex items-end">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${pct}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg"
                            />
                          </div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Monthly insights bubble */}
              {stats.insights && (
                <div className="bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-5 rounded-3xl backdrop-blur-xl shadow-md space-y-2 relative overflow-hidden">
                  <div className="absolute right-0 top-0 text-7xl select-none opacity-10 pointer-events-none">💡</div>
                  <h4 className="text-sm font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="h-4 w-4 fill-current" /> Monthly Learning Insights
                  </h4>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-350 leading-relaxed font-bold">
                    "{stats.insights}"
                  </p>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
