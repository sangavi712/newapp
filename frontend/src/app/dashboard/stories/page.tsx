"use client";

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Search, 
  Filter, 
  RotateCw, 
  ChevronRight, 
  ChevronLeft, 
  Bookmark, 
  Heart, 
  Play, 
  Pause, 
  Square, 
  Award, 
  Flame, 
  Coins, 
  Trophy, 
  HelpCircle, 
  Star, 
  History, 
  ArrowRight, 
  Compass, 
  Settings, 
  AlertCircle,
  BookOpenCheck
} from 'lucide-react';

interface Story {
  id: number;
  title_en: string;
  title_ta: string;
  content_en: string;
  content_ta: string;
  category: string;
  reading_time: number;
  summary_en: string;
  summary_ta: string;
  illustration_emoji: string;
  is_cyoa: boolean;
  cyoa_data: any;
}

interface Interaction {
  story_id: number;
  title_en: string;
  title_ta: string;
  category: string;
  illustration_emoji: string;
  is_favorite: boolean;
  is_liked: boolean;
  read_progress: number;
  last_read: string;
}

const CATEGORIES = [
  { name: "Fun", emoji: "😂", slug: "Fun" },
  { name: "Moral & Truth", emoji: "💡", slug: "Moral & Truth" },
  { name: "Mystery", emoji: "🔍", slug: "Mystery" },
  { name: "Horror", emoji: "👻", slug: "Horror" },
  { name: "Emotional", emoji: "❤️", slug: "Emotional" },
  { name: "Adventure", emoji: "🏹", slug: "Adventure" },
  { name: "Sci-Fi", emoji: "🤖", slug: "Sci-Fi" },
  { name: "Fantasy", emoji: "🧚", slug: "Fantasy" },
  { name: "Family", emoji: "👨‍👩‍👧", slug: "Family" },
  { name: "Kids", emoji: "😄", slug: "Kids" },
  { name: "Motivation", emoji: "💼", slug: "Motivation" },
  { name: "Historical", emoji: "📜", slug: "Historical" },
  { name: "Psychological", emoji: "🧠", slug: "Psychological" },
  { name: "Comedy", emoji: "🎭", slug: "Comedy" },
  { name: "Love", emoji: "💕", slug: "Love" }
];

const WRITING_STYLES = [
  "Fantasy Fairy Tale",
  "Cyberpunk Sci-Fi",
  "Mystery Thriller",
  "Comedy & Humor",
  "Poetic & Emotional",
  "Moral & Mythological"
];

export default function AIStoryHub() {
  const [activeTab, setActiveTab] = useState<'browse' | 'generate' | 'library'>('browse');
  
  // Stories & Filters States
  const [stories, setStories] = useState<Story[]>([]);
  const [trending, setTrending] = useState<Story[]>([]);
  const [latest, setLatest] = useState<Story[]>([]);
  const [featuredStory, setFeaturedStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [durationFilter, setDurationFilter] = useState('All'); // All, Short, Medium, Long
  
  // Library & History States
  const [history, setHistory] = useState<Interaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [favorites, setFavorites] = useState<Interaction[]>([]);

  // User Stats State
  const [stats, setStats] = useState<any>({
    level: 1,
    xp: 0,
    coins: 0,
    streak: 0
  });

  // Spin the Wheel states
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<any>(null);

  // AI Story Generator States
  const [promptWord, setPromptWord] = useState('');
  const [promptEmoji, setPromptEmoji] = useState('👽');
  const [genCategory, setGenCategory] = useState('Sci-Fi');
  const [genStyle, setGenStyle] = useState('Fantasy Fairy Tale');
  const [generating, setGenerating] = useState(false);

  // Reader Viewport Drawer States
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isTamil, setIsTamil] = useState(false); // Language Switcher
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<1 | 2 | 3>(1); // 1: slow, 2: med, 3: fast
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  
  // CYOA Story State
  const [currentCyoaNode, setCurrentCyoaNode] = useState('start');

  // Ambient Sounds Toggles
  const [ambientSounds, setAmbientSounds] = useState<{ [key: string]: boolean }>({
    rain: false,
    forest: false,
    night: false,
    library: false
  });

  // Quiz Overlay States
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState<any>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizRewards, setQuizRewards] = useState<any>(null);

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<{ [key: string]: { source: AudioNode; gain: GainNode } }>({});
  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Fetch initial data
  useEffect(() => {
    fetchStories();
    fetchStats();
    fetchHistory();
  }, [categoryFilter, durationFilter]);

  // Re-fetch library & history when tab switches to library
  useEffect(() => {
    if (activeTab === 'library') {
      fetchHistory();
    }
  }, [activeTab]);

  // Handle Autoscroll interval
  useEffect(() => {
    let intervalId: any;
    if (isAutoScrolling && readerContainerRef.current) {
      intervalId = setInterval(() => {
        if (readerContainerRef.current) {
          readerContainerRef.current.scrollTop += autoScrollSpeed;
        }
      }, 50);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAutoScrolling, autoScrollSpeed]);

  // Cleanup all sounds and TTS speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      // Stop all ambient sound nodes
      Object.keys(activeNodesRef.current).forEach((key) => {
        stopAmbientSound(key);
      });
    };
  }, []);

  // API Methods
  const fetchStories = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/stories?category=${encodeURIComponent(categoryFilter)}&duration=${encodeURIComponent(durationFilter)}&search=${encodeURIComponent(searchTerm)}`);
      setStories(response.data.stories || []);
      setTrending(response.data.trending || []);
      setLatest(response.data.latest || []);
      if (response.data.story_of_the_day) {
        setFeaturedStory(response.data.story_of_the_day);
      } else if (response.data.stories && response.data.stories.length > 0) {
        setFeaturedStory(response.data.stories[0]);
      }
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Re-use vocabulary stats or general gamification stats
      const response = await api.get('/vocabulary/stats');
      if (response.data) {
        setStats({
          level: response.data.level || 1,
          xp: response.data.xp || 0,
          coins: response.data.coins || 0,
          streak: response.data.streak || 0
        });
      }
    } catch (error) {
      console.error("Failed to fetch gamification stats:", error);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await api.get('/stories/history');
      if (response.data) {
        setHistory(response.data);
        // Extract bookmarked favorites
        setFavorites(response.data.filter((item: Interaction) => item.is_favorite));
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleToggleFavorite = async (storyId: number, currentFav: boolean) => {
    try {
      await api.post('/stories/interaction', {
        story_id: storyId,
        is_favorite: !currentFav
      });
      fetchHistory();
    } catch (error) {
      console.error("Failed to update favorite status:", error);
    }
  };

  const handleToggleLike = async (storyId: number, currentLike: boolean) => {
    try {
      await api.post('/stories/interaction', {
        story_id: storyId,
        is_liked: !currentLike
      });
      fetchHistory();
    } catch (error) {
      console.error("Failed to update like status:", error);
    }
  };

  const updateReadingProgress = async (storyId: number, progress: number) => {
    try {
      await api.post('/stories/interaction', {
        story_id: storyId,
        read_progress: progress
      });
    } catch (error) {
      console.error("Failed to save reading progress:", error);
    }
  };

  const handleGenerateAIStory = async () => {
    if (!promptWord && !promptEmoji) return;
    setGenerating(true);
    // Dispatch companion prompt event
    window.dispatchEvent(new CustomEvent('story-generate', {
      detail: { style: genStyle }
    }));
    try {
      const response = await api.post('/stories/generate', {
        word: promptWord,
        emoji: promptEmoji,
        category: genCategory,
        style: genStyle
      });
      if (response.data) {
        // Clear generator prompt inputs
        setPromptWord('');
        // Refresh catalog list
        fetchStories();
        // Open the newly generated story immediately in reader drawer
        openStoryReader(response.data);
        setActiveTab('browse');
      }
    } catch (error) {
      console.error("Failed to generate AI story:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleLoadQuiz = async (storyId: number) => {
    setQuizLoading(true);
    setQuizOpen(true);
    setSelectedQuizOption(null);
    setQuizCompleted(false);
    setQuizScore(0);
    setQuizRewards(null);
    try {
      const response = await api.get(`/stories/quiz?story_id=${storyId}`);
      setQuizQuestion(response.data);
    } catch (error) {
      console.error("Failed to load story quiz:", error);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizAnswer = (option: string) => {
    if (selectedQuizOption !== null || !quizQuestion) return;
    setSelectedQuizOption(option);
    const correctAns = isTamil ? quizQuestion.answer_ta : quizQuestion.answer_en;
    if (option === correctAns) {
      setQuizScore(1);
      window.dispatchEvent(new CustomEvent('vocab-correct'));
    } else {
      setQuizScore(0);
      window.dispatchEvent(new CustomEvent('vocab-wrong'));
    }
  };

  const handleSubmitQuiz = async () => {
    try {
      const response = await api.post('/stories/submit-challenge');
      setQuizRewards(response.data);
      setQuizCompleted(true);
      fetchStats();
      fetchHistory();
      
      // Dispatch companion reaction to completion
      window.dispatchEvent(new CustomEvent('task-completed', {
        detail: { type: 'story', topic: activeStory?.title_en || 'reading' }
      }));
    } catch (error) {
      console.error("Failed to submit story quiz challenge:", error);
    }
  };

  // Soundscape Generation Logic (Web Audio API)
  const toggleAmbientSound = (type: 'rain' | 'forest' | 'night' | 'library') => {
    const nextVal = !ambientSounds[type];
    setAmbientSounds(prev => ({ ...prev, [type]: nextVal }));

    if (nextVal) {
      startAmbientSound(type);
    } else {
      stopAmbientSound(type);
    }
  };

  const startAmbientSound = (type: 'rain' | 'forest' | 'night' | 'library') => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Stop any existing node
      stopAmbientSound(type);

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.08, ctx.currentTime); // Soft volume limit
      mainGain.connect(ctx.destination);

      const nodes: AudioNode[] = [];

      if (type === 'rain') {
        // Lowpass filtered pink noise for rain soundscape
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          data[i] *= 0.11;
          b6 = white * 0.115926;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, ctx.currentTime);

        noise.connect(filter);
        filter.connect(mainGain);
        noise.start();

        nodes.push(noise, filter);
      } 
      else if (type === 'forest') {
        // Pink noise modulated by a very low frequency LFO to simulate wind gusts
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          data[i] *= 0.11;
          b6 = white * 0.115926;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(1.2, ctx.currentTime);
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.07, ctx.currentTime); // 0.07 Hz (very slow)
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(130, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(mainGain);

        lfo.start();
        noise.start();

        nodes.push(noise, filter, lfo, lfoGain);
      } 
      else if (type === 'night') {
        // High pitch oscillator modulated by a volume LFO (cricket chirping pulses)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3500, ctx.currentTime);

        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime(0.0, ctx.currentTime);

        const mod = ctx.createOscillator();
        mod.type = 'square';
        mod.frequency.setValueAtTime(10, ctx.currentTime); // 10Hz chirps

        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(0.4, ctx.currentTime);

        mod.connect(modGain);
        modGain.connect(chirpGain.gain);

        const slowMod = ctx.createOscillator();
        slowMod.type = 'sine';
        slowMod.frequency.setValueAtTime(0.35, ctx.currentTime); // chirping burst intervals

        const slowModGain = ctx.createGain();
        slowModGain.gain.setValueAtTime(0.5, ctx.currentTime);

        const slowCarrierGain = ctx.createGain();
        slowCarrierGain.gain.setValueAtTime(0.5, ctx.currentTime);

        slowMod.connect(slowModGain);
        slowModGain.connect(slowCarrierGain.gain);

        osc.connect(chirpGain);
        chirpGain.connect(slowCarrierGain);
        slowCarrierGain.connect(mainGain);

        osc.start();
        mod.start();
        slowMod.start();

        nodes.push(osc, chirpGain, mod, modGain, slowMod, slowModGain, slowCarrierGain);
      } 
      else if (type === 'library') {
        // Low frequency hum (room tone) + very low lowpass pink noise
        const hum = ctx.createOscillator();
        hum.type = 'sine';
        hum.frequency.setValueAtTime(55, ctx.currentTime);

        const humGain = ctx.createGain();
        humGain.gain.setValueAtTime(0.05, ctx.currentTime);

        // Low rumble noise
        const bufferSize = 2 * ctx.sampleRate;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, ctx.currentTime);

        const rumbleGain = ctx.createGain();
        rumbleGain.gain.setValueAtTime(0.1, ctx.currentTime);

        hum.connect(humGain);
        noise.connect(filter);
        filter.connect(rumbleGain);

        humGain.connect(mainGain);
        rumbleGain.connect(mainGain);

        hum.start();
        noise.start();

        nodes.push(hum, humGain, noise, filter, rumbleGain);
      }

      activeNodesRef.current[type] = { source: mainGain, gain: mainGain };
    } catch (err) {
      console.error("Web Audio Soundscape failed to compile node:", err);
    }
  };

  const stopAmbientSound = (type: string) => {
    const activeNode = activeNodesRef.current[type];
    if (activeNode) {
      try {
        activeNode.gain.disconnect();
      } catch (_) {}
      delete activeNodesRef.current[type];
    }
  };

  // Reader Functions
  const openStoryReader = (story: Story) => {
    setActiveStory(story);
    setIsTamil(false);
    setCurrentCyoaNode('start');
    setIsAutoScrolling(false);
    setIsPlayingTTS(false);

    // Save interaction start in DB
    api.post('/stories/interaction', { story_id: story.id, read_progress: 0.1 });

    // Trigger companion start event
    window.dispatchEvent(new CustomEvent('story-start', {
      detail: { title: story.title_en }
    }));
  };

  const closeStoryReader = () => {
    setActiveStory(null);
    setIsAutoScrolling(false);
    setIsPlayingTTS(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    // Turn off all sounds
    setAmbientSounds({ rain: false, forest: false, night: false, library: false });
    Object.keys(activeNodesRef.current).forEach((key) => {
      stopAmbientSound(key);
    });
  };

  // Text to Speech
  const toggleTTS = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
    } else {
      const textToRead = activeStory?.is_cyoa
        ? (isTamil 
            ? activeStory.cyoa_data[currentCyoaNode]?.text_ta 
            : activeStory.cyoa_data[currentCyoaNode]?.text_en)
        : (isTamil ? activeStory?.content_ta : activeStory?.content_en);

      if (!textToRead) return;

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = isTamil ? 'ta-IN' : 'en-US';

      // Find compatible localized voice
      const voices = window.speechSynthesis.getVoices();
      const targetVoice = voices.find(v => v.lang.startsWith(isTamil ? 'ta' : 'en'));
      if (targetVoice) utterance.voice = targetVoice;

      utterance.onend = () => setIsPlayingTTS(false);
      utterance.onerror = () => setIsPlayingTTS(false);

      setIsPlayingTTS(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Spin Wheel Category Pick
  const handleSpinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinResult(null);

    // Spin multiple times + random degree offset
    const randomRotations = 1800 + Math.floor(Math.random() * 360);
    const newRot = rotation + randomRotations;
    setRotation(newRot);

    setTimeout(() => {
      setIsSpinning(false);
      // Calculate selected category based on pointing direction
      const finalDeg = newRot % 360;
      const rawIndex = Math.round((360 - finalDeg) / (360 / CATEGORIES.length));
      const index = (rawIndex + CATEGORIES.length) % CATEGORIES.length;
      const chosen = CATEGORIES[index];
      setSpinResult(chosen);
      setCategoryFilter(chosen.slug);
    }, 4000);
  };

  return (
    <div className="min-h-screen pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 select-none">
      
      {/* Premium Glass Header */}
      <div className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">BuddyLearn AI</span>
            
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2" />
            <button
              onClick={() => setIsTamil(!isTamil)}
              className="px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-[10px] font-black uppercase transition-all cursor-pointer text-indigo-600 dark:text-indigo-400"
            >
              {isTamil ? 'Switch to English' : 'தமிழ் வடிவம்'}
            </button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            {isTamil ? 'AI கதைகள் மையம்' : 'AI Story Hub'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xl">
            {isTamil 
              ? 'AI மூலம் உருவாக்கப்பட்ட தமிழ் மற்றும் ஆங்கிலக் கதைகளில் மூழ்கி, உங்கள் வாசிப்புத் திறனை மேம்படுத்துங்கள்.' 
              : 'Immerse yourself in dual-language English & Tamil stories, play branched CYOA tales, and learn dynamically with AI.'}
          </p>
        </div>

        {/* mini user gamification stats */}
        <div className="flex gap-4 items-center bg-slate-50/70 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600 px-4 py-3 rounded-2xl">
          <div className="flex items-center gap-1.5" title="XP Balance">
            <span className="text-base text-yellow-500">🏆</span>
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Level {stats.level}</p>
              <p className="text-xs font-black text-slate-700 dark:text-slate-200 leading-normal">{stats.xp} XP</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-1.5" title="Coins Balance">
            <Coins className="h-4.5 w-4.5 text-amber-500" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Coins</p>
              <p className="text-xs font-black text-slate-700 dark:text-slate-200 leading-normal">{stats.coins}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-1.5" title="Streak Days">
            <Flame className="h-4.5 w-4.5 text-orange-500 fill-current animate-pulse" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Streak</p>
              <p className="text-xs font-black text-slate-700 dark:text-slate-200 leading-normal">{stats.streak} Days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center p-1.5 bg-slate-100/50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600/30 rounded-2xl max-w-md mx-auto">
        {(['browse', 'generate', 'library'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-800 text-indigo-500 dark:text-white shadow-lg border-2 border-slate-200 dark:border-slate-600'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab === 'browse' && 'Browse Stories'}
            {tab === 'generate' && 'Create with AI'}
            {tab === 'library' && 'My Reading Log'}
          </button>
        ))}
      </div>

      {/* Tabs Panel views */}
      <AnimatePresence mode="wait">
        
        {/* BROWSE STORIES TAB */}
        {activeTab === 'browse' && (
          <motion.div
            key="browse-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-10"
          >
            {/* HERO FEATURED STORY BANNER */}
            {featuredStory && (
              <div className="relative group overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-3xl p-6 sm:p-10 shadow-2xl text-white flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
                <div className="space-y-4 max-w-xl text-left z-10">
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-black bg-white/20 uppercase tracking-widest border border-white/10">
                    Story of the Day
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                    {isTamil ? (featuredStory.title_ta || featuredStory.title_en) : featuredStory.title_en}
                  </h2>
                  <p className="text-sm font-semibold opacity-90 leading-relaxed max-w-lg">
                    {isTamil ? (featuredStory.summary_ta || featuredStory.summary_en) : featuredStory.summary_en}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-bold pt-2">
                    <span className="flex items-center gap-1">📖 {featuredStory.reading_time} min read</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">{featuredStory.category}</span>
                  </div>
                  <div className="pt-2 flex gap-4">
                    <button
                      onClick={() => openStoryReader(featuredStory)}
                      className="px-6 py-3 rounded-2xl bg-white text-indigo-600 hover:bg-slate-50 font-black text-xs uppercase tracking-widest shadow transition-all cursor-pointer"
                    >
                      Read Now
                    </button>
                    <button
                      onClick={() => handleToggleFavorite(featuredStory.id, false)}
                      className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer"
                      title="Add to Library"
                    >
                      <Bookmark className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="relative text-7xl select-none animate-bounce h-24 w-24 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-inner z-10">
                  {featuredStory.illustration_emoji || '📖'}
                </div>
              </div>
            )}

            {/* SPIN THE WHEEL CARD & SEARCH BAR GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Spin the Wheel Widget */}
              <div className="md:col-span-5 bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-between text-center space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-1.5 justify-center">
                    <Compass className="h-5 w-5 text-indigo-500" /> Story Oracle Wheel
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Spin the cat compass to discover a random category!
                  </p>
                </div>

                {/* Circular Wheel container */}
                <div className="relative w-56 h-56 flex items-center justify-center">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2.5 z-20">
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-rose-500 filter drop-shadow-md" />
                  </div>

                  <motion.div
                    animate={{ rotate: rotation }}
                    transition={isSpinning ? { duration: 4, ease: [0.15, 0.95, 0.2, 1.0] } : { duration: 0 }}
                    className="relative w-full h-full rounded-full border-4 border-indigo-500/20 bg-slate-900/90 dark:bg-slate-950/95 overflow-hidden shadow-2xl"
                  >
                    {CATEGORIES.map((cat, idx) => {
                      const angle = 360 / CATEGORIES.length;
                      return (
                        <div
                          key={cat.slug}
                          className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-28 origin-bottom flex flex-col items-center pt-2"
                          style={{
                            transform: `rotate(${idx * angle}deg)`,
                          }}
                        >
                          <span className="text-base">{cat.emoji}</span>
                          <span className="text-[7px] font-black text-slate-400/90 tracking-tighter uppercase mt-0.5 truncate max-w-full">
                            {cat.name.split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>

                  {/* Center Spin trigger button */}
                  <button
                    onClick={handleSpinWheel}
                    disabled={isSpinning}
                    className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-2 border-white text-white font-black text-xs shadow-xl flex items-center justify-center cursor-pointer transition-all z-10 disabled:opacity-80 disabled:cursor-not-allowed uppercase tracking-wider"
                  >
                    {isSpinning ? '...' : 'SPIN'}
                  </button>
                </div>

                {spinResult && (
                  <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl w-full">
                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      Landed on {spinResult.emoji} {spinResult.name}!
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Stories of this category loaded below.</p>
                  </div>
                )}
              </div>

              {/* SEARCH & BROWSE CATEGORIES CONTROL BAR */}
              <div className="md:col-span-7 bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between gap-6 text-left">
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Filter className="h-5 w-5 text-indigo-500" /> Story Filter Dashboard
                  </h3>

                  {/* Search bar input */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search story titles, keywords, summaries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchStories()}
                      className="w-full bg-slate-50/50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600/80 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
                    />
                  </div>

                  {/* Duration Filter Toggles */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Story Length</label>
                    <div className="flex gap-2">
                      {['All', 'Short', 'Medium', 'Long'].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDurationFilter(d)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            durationFilter === d
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                          }`}
                        >
                          {d === 'All' ? 'Any Length' : d === 'Short' ? '<3 min' : d === 'Medium' ? '3-8 min' : '>8 min'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Reset filters helper */}
                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('All');
                      setDurationFilter('All');
                      setSpinResult(null);
                    }}
                    className="text-[10px] font-black text-indigo-500 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCw className="h-3.5 w-3.5" /> Clear All Filters
                  </button>
                  <button
                    onClick={fetchStories}
                    className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow cursor-pointer transition-all"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            </div>

            {/* NETFLIX-STYLE HORIZONTAL CAROUSELS */}
            <div className="space-y-10">
              
              {/* Category selector row */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left">Quick Categories</h4>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  <button
                    onClick={() => setCategoryFilter('All')}
                    className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
                      categoryFilter === 'All'
                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/15'
                        : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    🌍 All Stories
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setCategoryFilter(cat.slug)}
                      className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
                        categoryFilter === cat.slug
                          ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/15'
                          : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat.emoji} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex h-60 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : stories.length === 0 ? (
                <div className="text-center py-16 w-full bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-black">No stories match your criteria. Try another filter or create one with AI!</p>
                </div>
              ) : (
                <>
                  {/* CAROUSEL 1: Trending Reads */}
                  {trending.length > 0 && (
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Trending Reads</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Swipe for more</span>
                      </div>
                      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
                        {trending.map((story) => (
                          <div
                            key={`trending-${story.id}`}
                            onClick={() => openStoryReader(story)}
                            className="w-64 shrink-0 bg-white/60 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-5 shadow-lg backdrop-blur-md hover:scale-[1.02] cursor-pointer transition-all flex flex-col justify-between gap-4 h-52 group"
                          >
                            <div className="space-y-2.5">
                              <div className="flex justify-between items-start">
                                <span className="text-3xl p-2 rounded-xl bg-indigo-500/10 shadow-inner group-hover:animate-bounce">
                                  {story.illustration_emoji || '📖'}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                                  {story.category}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white truncate">
                                {isTamil ? (story.title_ta || story.title_en) : story.title_en}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-semibold line-clamp-3 leading-relaxed">
                                {isTamil ? (story.summary_ta || story.summary_en) : story.summary_en}
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                              <span>⏱️ {story.reading_time} min read</span>
                              <span className="text-indigo-500 flex items-center gap-0.5 group-hover:translate-x-1 transition-all">Read <ChevronRight className="h-3.5 w-3.5" /></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CAROUSEL 2: CYOA branched story routes */}
                  {stories.some(s => s.is_cyoa) && (
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
                          🎭 Interactive Adventures (CYOA)
                        </h3>
                        <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest animate-pulse">Choose Your Adventure</span>
                      </div>
                      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
                        {stories.filter(s => s.is_cyoa).map((story) => (
                          <div
                            key={`cyoa-${story.id}`}
                            onClick={() => openStoryReader(story)}
                            className="w-64 shrink-0 bg-gradient-to-br from-purple-900/10 to-indigo-950/20 border border-purple-500/20 rounded-2xl p-5 shadow-lg backdrop-blur-md hover:scale-[1.02] cursor-pointer transition-all flex flex-col justify-between gap-4 h-52 group"
                          >
                            <div className="space-y-2.5">
                              <div className="flex justify-between items-start">
                                <span className="text-3xl p-2 rounded-xl bg-purple-500/15 shadow-inner">
                                  {story.illustration_emoji || '📖'}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black bg-purple-500/20 text-purple-600 dark:text-purple-400 uppercase tracking-widest border border-purple-500/10">
                                  Branching
                                </span>
                              </div>
                              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white truncate">
                                {isTamil ? (story.title_ta || story.title_en) : story.title_en}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-semibold line-clamp-3 leading-relaxed">
                                {isTamil ? (story.summary_ta || story.summary_en) : story.summary_en}
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 border-t border-purple-500/15 pt-2.5">
                              <span>🚪 Start Branching</span>
                              <span className="text-purple-500 flex items-center gap-0.5 group-hover:translate-x-1 transition-all">Begin <ChevronRight className="h-3.5 w-3.5" /></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CAROUSEL 3: Latest stories */}
                  {latest.length > 0 && (
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Latest Stories</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Swipe for more</span>
                      </div>
                      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
                        {latest.map((story) => (
                          <div
                            key={`latest-${story.id}`}
                            onClick={() => openStoryReader(story)}
                            className="w-64 shrink-0 bg-white/60 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-5 shadow-lg backdrop-blur-md hover:scale-[1.02] cursor-pointer transition-all flex flex-col justify-between gap-4 h-52 group"
                          >
                            <div className="space-y-2.5">
                              <div className="flex justify-between items-start">
                                <span className="text-3xl p-2 rounded-xl bg-indigo-500/10 shadow-inner">
                                  {story.illustration_emoji || '📖'}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                                  {story.category}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-sm text-slate-800 dark:text-white truncate">
                                {isTamil ? (story.title_ta || story.title_en) : story.title_en}
                              </h4>
                              <p className="text-[11px] text-slate-400 font-semibold line-clamp-3 leading-relaxed">
                                {isTamil ? (story.summary_ta || story.summary_en) : story.summary_en}
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
                              <span>⏱️ {story.reading_time} min read</span>
                              <span className="text-indigo-500 flex items-center gap-0.5 group-hover:translate-x-1 transition-all">Read <ChevronRight className="h-3.5 w-3.5" /></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* AI STORY GENERATOR TAB */}
        {activeTab === 'generate' && (
          <motion.div
            key="generate-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-left space-y-6">
              
              <div className="flex items-center gap-2">
                <span className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
                  <Sparkles className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">AI Story Engine</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Input your key concepts, and watch AI build a unique Tamil & English narrative.</p>
                </div>
              </div>

              {/* Generate Inputs */}
              <div className="space-y-4 pt-2">
                
                {/* Word Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Story Subject / Core Word</label>
                  <input
                    type="text"
                    placeholder="e.g. Magic Compass, Lost Alien, Flying Ship..."
                    value={promptWord}
                    onChange={(e) => setPromptWord(e.target.value)}
                    className="w-full bg-slate-50/50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600/80 rounded-2xl py-3.5 px-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
                  />
                </div>

                {/* Emoji Select List */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Choose an Illustration Emoji</label>
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                    {['👽', '👻', '🧙‍♂️', '🤖', '🚀', '🐉', '🌲', '👑', '🦁', '🌟', '🦄', '🕰️', '🌋', '🛶', '🗝️'].map((em) => (
                      <button
                        key={em}
                        onClick={() => setPromptEmoji(em)}
                        className={`text-2xl p-2.5 rounded-xl transition-all cursor-pointer border ${
                          promptEmoji === em
                            ? 'bg-indigo-500/10 border-indigo-500 scale-110 shadow-md shadow-indigo-500/10'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:scale-105'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category & Style dropdown grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adventure Category</label>
                    <select
                      value={genCategory}
                      onChange={(e) => setGenCategory(e.target.value)}
                      className="w-full bg-slate-50/50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600/80 rounded-2xl py-3.5 px-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white cursor-pointer"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.slug} value={cat.slug} className="dark:bg-slate-900">{cat.emoji} {cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storytelling Style</label>
                    <select
                      value={genStyle}
                      onChange={(e) => setGenStyle(e.target.value)}
                      className="w-full bg-slate-50/50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600/80 rounded-2xl py-3.5 px-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white cursor-pointer"
                    >
                      {WRITING_STYLES.map((st) => (
                        <option key={st} value={st} className="dark:bg-slate-900">{st}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  onClick={handleGenerateAIStory}
                  disabled={generating || (!promptWord.trim() && !promptEmoji)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/15 cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <RotateCw className="h-4 w-4 animate-spin" /> Weaving Your Tale...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate AI Story (+40 XP, +15 Coins)
                    </>
                  )}
                </button>
              </div>

              {/* API Fallback note */}
              <div className="p-3.5 bg-slate-50/70 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600 rounded-2xl flex items-start gap-2.5 text-slate-400 font-semibold">
                <AlertCircle className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed">
                  If the system key is offline, the story engine falls back to smart local dual-language templates matching your input prompt keywords.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* READING LOG & LIBRARY TAB */}
        {activeTab === 'library' && (
          <motion.div
            key="library-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-10"
          >
            {/* Bookmarked Grid */}
            <div className="space-y-4 text-left">
              <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                <Bookmark className="h-5.5 w-5.5 text-indigo-500 fill-indigo-500/10" /> Saved Bookmarks
              </h3>
              {favorites.length === 0 ? (
                <div className="p-10 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-slate-200 dark:border-slate-600 text-slate-400 font-semibold text-xs leading-relaxed">
                  No bookmarked stories found. Click the bookmark icon inside reader view to save your favorite stories here.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {favorites.map((fav) => {
                    const original = stories.find(s => s.id === fav.story_id);
                    return (
                      <div
                        key={`fav-${fav.story_id}`}
                        onClick={() => original && openStoryReader(original)}
                        className="bg-white/60 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-4.5 shadow-md backdrop-blur-md hover:scale-[1.01] cursor-pointer transition-all flex flex-col justify-between gap-4 h-48 group"
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-2xl p-1.5 rounded-lg bg-indigo-500/10">
                              {fav.illustration_emoji || '📖'}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(fav.story_id, true);
                              }}
                              className="p-1.5 rounded-lg text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                              <Bookmark className="h-4 w-4 fill-current" />
                            </button>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-white truncate">
                            {fav.title_en}
                          </h4>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[8px] font-black bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                            {fav.category}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2 flex-wrap">
                          <span>Progress: {Math.round((fav.read_progress || 0) * 100)}%</span>
                          <span className="text-indigo-500 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-all">Resume <ChevronRight className="h-3.5 w-3.5" /></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reading History Log */}
            <div className="space-y-4 text-left">
              <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                <History className="h-5.5 w-5.5 text-indigo-500" /> Reading History
              </h3>
              {historyLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="p-10 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-slate-200 dark:border-slate-600 text-slate-400 font-semibold text-xs leading-relaxed">
                  No reading interactions logged yet.
                </div>
              ) : (
                <div className="bg-white/40 dark:bg-slate-900/40 border-2 border-slate-200 dark:border-slate-600 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
                  <table className="w-full text-xs font-semibold border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-widest text-[9px] bg-slate-50/50 dark:bg-slate-950/20">
                        <th className="py-3 px-4 text-left font-black">Story Title</th>
                        <th className="py-3 px-4 text-center font-black">Category</th>
                        <th className="py-3 px-4 text-center font-black">Read Progress</th>
                        <th className="py-3 px-4 text-right font-black">Last Read</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => {
                        const original = stories.find(s => s.id === item.story_id);
                        return (
                          <tr
                            key={`hist-${item.story_id}`}
                            onClick={() => original && openStoryReader(original)}
                            className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer transition-all text-slate-700 dark:text-slate-300"
                          >
                            <td className="py-3.5 px-4 font-extrabold flex items-center gap-2">
                              <span className="text-lg">{item.illustration_emoji || '📖'}</span>
                              <span className="truncate max-w-[200px]">{item.title_en}</span>
                            </td>
                            <td className="py-3.5 px-4 text-center uppercase text-[9px] font-black text-indigo-500">
                              {item.category}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="flex items-center gap-2 justify-center max-w-[120px] mx-auto">
                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500" style={{ width: `${(item.read_progress || 0) * 100}%` }} />
                                </div>
                                <span className="font-bold shrink-0">{Math.round((item.read_progress || 0) * 100)}%</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-right text-slate-400 font-bold">
                              {new Date(item.last_read).toLocaleDateString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STORY READER VIEWPORT DRAWER */}
      <AnimatePresence>
        {activeStory && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            className="fixed inset-0 bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md z-45 flex flex-col justify-end pointer-events-auto"
          >
            {/* Main scroll container */}
            <div className="w-full max-w-4xl mx-auto h-[90vh] bg-white dark:bg-slate-800 rounded-t-[32px] border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
              
              {/* Top sticky controls bar */}
              <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 backdrop-blur gap-4 shrink-0">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-3xl p-1 bg-indigo-500/10 rounded-xl">{activeStory.illustration_emoji || '📖'}</span>
                  <div className="text-left overflow-hidden">
                    <h3 className="font-black text-sm sm:text-base truncate max-w-[280px]">
                      {isTamil ? activeStory.title_ta || activeStory.title_en : activeStory.title_en}
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{activeStory.category}</p>
                  </div>
                </div>

                {/* Navigation and Toolbar */}
                <div className="flex items-center gap-3 flex-wrap justify-center w-full sm:w-auto">
                  {/* Language switch */}
                  <button
                    onClick={() => setIsTamil(!isTamil)}
                    className="px-3 py-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black uppercase transition-all cursor-pointer text-indigo-500"
                  >
                    {isTamil ? 'English Mode' : 'தமிழ் வடிவம்'}
                  </button>

                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                  {/* Font scale buttons */}
                  <div className="flex items-center gap-1.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-0.5 bg-slate-100/50 dark:bg-slate-950/20">
                    <button
                      onClick={() => {
                        if (fontSize === 'xl') setFontSize('lg');
                        else if (fontSize === 'lg') setFontSize('md');
                        else if (fontSize === 'md') setFontSize('sm');
                      }}
                      className="p-1.5 text-xs font-black hover:bg-white dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      title="Decrease Font"
                    >
                      A-
                    </button>
                    <span className="text-[10px] font-black text-slate-400 px-1 uppercase">{fontSize}</span>
                    <button
                      onClick={() => {
                        if (fontSize === 'sm') setFontSize('md');
                        else if (fontSize === 'md') setFontSize('lg');
                        else if (fontSize === 'lg') setFontSize('xl');
                      }}
                      className="p-1.5 text-xs font-black hover:bg-white dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                      title="Increase Font"
                    >
                      A+
                    </button>
                  </div>

                  {/* Auto scroll selector */}
                  <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-950/20 border-2 border-slate-200 dark:border-slate-600 rounded-xl p-0.5">
                    <button
                      onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                      className={`px-2 py-1 text-[10px] font-black rounded-lg cursor-pointer uppercase transition-all ${
                        isAutoScrolling
                          ? 'bg-indigo-500 text-white'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {isAutoScrolling ? 'Scroll On' : 'Autoscroll'}
                    </button>
                    {isAutoScrolling && (
                      <select
                        value={autoScrollSpeed}
                        onChange={(e) => setAutoScrollSpeed(Number(e.target.value) as 1|2|3)}
                        className="bg-transparent text-[10px] font-black text-slate-600 focus:outline-none pr-1.5 cursor-pointer dark:text-slate-300"
                      >
                        <option value={1} className="dark:bg-slate-900">1x</option>
                        <option value={2} className="dark:bg-slate-900">2x</option>
                        <option value={3} className="dark:bg-slate-900">3x</option>
                      </select>
                    )}
                  </div>

                  {/* TTS Narrator */}
                  <button
                    onClick={toggleTTS}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      isPlayingTTS
                        ? 'bg-red-500 border-red-500 text-white animate-pulse'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                    }`}
                    title="Audio Narrator"
                  >
                    {isPlayingTTS ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>

                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                  {/* Close drawer */}
                  <button
                    onClick={closeStoryReader}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-all cursor-pointer text-slate-500"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Sub-toolbar for Ambient Sounds */}
              <div className="px-6 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/10 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-4 shrink-0 flex-wrap">
                <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                  🌿 Ambient Soundscapes (synthesized offline)
                </span>
                <div className="flex gap-2">
                  {[
                    { id: 'rain', name: 'Rain 🌧️' },
                    { id: 'forest', name: 'Wind 🌲' },
                    { id: 'night', name: 'Crickets 🌙' },
                    { id: 'library', name: 'Library 📚' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => toggleAmbientSound(s.id as any)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black border transition-all cursor-pointer ${
                        ambientSounds[s.id]
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Story Viewport text area */}
              <div
                ref={readerContainerRef}
                className="flex-1 overflow-y-auto p-6 sm:p-12 space-y-8 text-left max-w-3xl mx-auto w-full leading-relaxed"
              >
                
                {/* Story Title Header */}
                <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-6 text-center">
                  <h2 className={`font-black tracking-tight text-slate-800 dark:text-white ${
                    fontSize === 'sm' ? 'text-xl' : fontSize === 'md' ? 'text-2xl' : fontSize === 'lg' ? 'text-3xl' : 'text-4xl'
                  }`}>
                    {isTamil ? activeStory.title_ta || activeStory.title_en : activeStory.title_en}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold">⏱️ Estimated duration: {activeStory.reading_time} min read</p>
                </div>

                {/* Render branching CYOA content vs static content */}
                {activeStory.is_cyoa ? (
                  // CYOA branch renderer
                  <div className="space-y-8">
                    <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl">
                      <p className={`font-extrabold leading-relaxed text-slate-800 dark:text-slate-200 transition-all ${
                        fontSize === 'sm' ? 'text-xs' : fontSize === 'md' ? 'text-sm' : fontSize === 'lg' ? 'text-base' : 'text-lg'
                      }`}>
                        {isTamil 
                          ? activeStory.cyoa_data[currentCyoaNode]?.text_ta || activeStory.cyoa_data[currentCyoaNode]?.text_en
                          : activeStory.cyoa_data[currentCyoaNode]?.text_en
                        }
                      </p>
                    </div>

                    {/* Choice Buttons */}
                    {activeStory.cyoa_data[currentCyoaNode]?.choices && activeStory.cyoa_data[currentCyoaNode].choices.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeStory.cyoa_data[currentCyoaNode].choices.map((choice: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setCurrentCyoaNode(choice.next);
                              // Sync progress in DB
                              updateReadingProgress(activeStory.id, 0.5);
                            }}
                            className="p-4 rounded-2xl bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-left font-black text-xs hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm flex items-center justify-between cursor-pointer group"
                          >
                            <span className="text-slate-700 dark:text-slate-300">
                              👉 {isTamil ? choice.text_ta || choice.text_en : choice.text_en}
                            </span>
                            <ChevronRight className="h-4.5 w-4.5 text-indigo-500 group-hover:translate-x-1 transition-all" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      // CYOA branch leaf (adventure ended)
                      <div className="bg-emerald-500/5 border border-emerald-500/15 p-6 rounded-3xl text-center space-y-4">
                        <span className="text-3xl inline-block animate-bounce">🏆</span>
                        <h4 className="font-black text-sm text-slate-800 dark:text-white">Adventure Completed!</h4>
                        <p className="text-xs text-slate-400 font-bold">You traveled a branch pathway to a unique ending.</p>
                        
                        <div className="pt-2 flex justify-center gap-4">
                          <button
                            onClick={() => setCurrentCyoaNode('start')}
                            className="px-5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                          >
                            Explore Again
                          </button>
                          <button
                            onClick={() => {
                              updateReadingProgress(activeStory.id, 1.0);
                              handleLoadQuiz(activeStory.id);
                            }}
                            className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow cursor-pointer transition-all"
                          >
                            Comprehension Quiz
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Static Story content
                  <div className="space-y-6">
                    <p className={`font-extrabold leading-relaxed text-slate-800 dark:text-slate-200 text-justify ${
                      fontSize === 'sm' ? 'text-xs' : fontSize === 'md' ? 'text-sm' : fontSize === 'lg' ? 'text-base' : 'text-lg'
                    }`}>
                      {isTamil ? activeStory.content_ta || activeStory.content_en : activeStory.content_en}
                    </p>

                    <div className="h-10" />

                    {/* Submit reading completed */}
                    <div className="bg-slate-50/70 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600 p-6 rounded-3xl text-center space-y-4">
                      <span className="text-2xl inline-block">📖</span>
                      <h4 className="font-black text-sm text-slate-800 dark:text-white">Finished Reading?</h4>
                      <p className="text-xs text-slate-400 font-bold">Pass the comprehension quiz to claim daily XP & Coin rewards!</p>
                      
                      <div>
                        <button
                          onClick={() => {
                            updateReadingProgress(activeStory.id, 1.0);
                            handleLoadQuiz(activeStory.id);
                          }}
                          className="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/15 cursor-pointer transition-all"
                        >
                          Comprehension Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPREHENSION QUIZ & CHALLENGE OVERLAY MODAL */}
      <AnimatePresence>
        {quizOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 dark:bg-slate-950/90 backdrop-blur z-50 flex items-center justify-center p-4 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-md space-y-6"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1">
                  <BookOpenCheck className="h-4.5 w-4.5" /> Comprehension Challenge
                </span>
                <button
                  onClick={() => setQuizOpen(false)}
                  className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {quizLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : quizCompleted ? (
                // Quiz completed successfully
                <div className="text-center space-y-6">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-3xl shadow-inner text-amber-500 animate-bounce">
                    🏆
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-black text-slate-800 dark:text-white">Challenge Completed!</h4>
                    <p className="text-xs text-slate-400 font-bold">
                      You passed the comprehension test with flying colors.
                    </p>
                  </div>

                  {quizRewards && (
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600/80 rounded-2xl text-left">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Coins Reward</span>
                        <p className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1">
                          <Coins className="h-4 w-4 text-amber-500" /> +{quizRewards.coin_reward} Coins
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase">XP Reward</span>
                        <p className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-yellow-500" /> +{quizRewards.xp_reward} XP
                        </p>
                      </div>
                      <div className="col-span-2 border-t border-slate-200 dark:border-slate-800 pt-2 mt-1 space-y-0.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Study Streak</span>
                        <p className="text-xs font-black text-orange-500 flex items-center gap-1">
                          <Flame className="h-4.5 w-4.5 fill-current animate-pulse" /> {quizRewards.streak} Day Streak!
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setQuizOpen(false);
                        closeStoryReader();
                      }}
                      className="w-full py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow cursor-pointer transition-all"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              ) : quizQuestion ? (
                // Question presentation
                <div className="space-y-5 text-left">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[8px] font-black bg-indigo-500/10 text-indigo-500 uppercase tracking-widest block w-max">
                      Question
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-white leading-relaxed">
                      {isTamil ? quizQuestion.question_ta : quizQuestion.question_en}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {(isTamil ? quizQuestion.options_ta : quizQuestion.options_en).map((opt: string, idx: number) => {
                      const isSelected = selectedQuizOption === opt;
                      const correctAns = isTamil ? quizQuestion.answer_ta : quizQuestion.answer_en;
                      const isCorrect = opt === correctAns;

                      let btnStyle = "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850";
                      
                      if (selectedQuizOption !== null) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-400";
                        } else {
                          btnStyle = "bg-slate-100/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-850 text-slate-400 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={selectedQuizOption !== null}
                          onClick={() => handleQuizAnswer(opt)}
                          className={`w-full p-4.5 rounded-2xl text-left text-xs font-black transition-all cursor-pointer flex items-center justify-between border ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {selectedQuizOption !== null && isCorrect && <span className="text-emerald-500">✓</span>}
                          {selectedQuizOption !== null && isSelected && !isCorrect && <span className="text-rose-500">✗</span>}
                        </button>
                      );
                    })}
                  </div>

                  {selectedQuizOption !== null && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        onClick={handleSubmitQuiz}
                        className="w-full py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        Submit Results <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 font-semibold text-xs">
                  Could not load quiz details. Please try again.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
