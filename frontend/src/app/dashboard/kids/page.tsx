"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  Trophy,
  Coins,
  Flame,
  BookOpen,
  Heart,
  Award,
  Baby,
  Play,
  Pause,
  RotateCcw,
  Eraser,
  ChevronRight,
  ArrowRight,
  History,
  Gift,
  Compass,
  Printer,
  X,
  Check,
  ChevronLeft
} from 'lucide-react';

// Chiptune frequencies map for audio generation
const NOTE_FREQS: { [key: string]: number } = {
  "C3": 130.81, "D3": 146.83, "E3": 164.81, "F3": 174.61, "G3": 196.00, "A3": 220.00, "B3": 246.94,
  "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00, "A4": 440.00, "B4": 493.88,
  "C5": 523.25, "D5": 587.33, "E5": 659.25, "F5": 698.46, "G5": 783.99, "A5": 880.00, "B5": 987.77,
  "C6": 1046.50
};

// Procedural sound synth helpers (Web Audio API)
const playPopSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (e) {
    console.error(e);
  }
};

const playChimeSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const playNote = (freq: number, delay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + delay);
      gain.gain.setValueAtTime(0.15, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration - 0.01);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + duration);
    };
    playNote(523.25, 0, 0.12); // C5
    playNote(659.25, 0.1, 0.12); // E5
    playNote(783.99, 0.2, 0.25); // G5
  } catch (e) {
    console.error(e);
  }
};

const playBuzzerSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(130, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.28);
  } catch (e) {
    console.error(e);
  }
};

// Procedural Animal Sound Synths
const playLionSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 1.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(250, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 0.9);

    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(32, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.75, now);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    lfo.start();
    noise.start();
    lfo.stop(now + 1.2);
    noise.stop(now + 1.2);
  } catch (e) {}
};

const playElephantSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.25);
    osc.frequency.linearRampToValueAtTime(350, now + 0.7);

    filter.type = "bandpass";
    filter.Q.setValueAtTime(6, now);
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.25);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.75);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + 0.75);
  } catch (e) {}
};

const playBirdSound = () => {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    
    const playChirp = (delay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(2000, now + delay);
      osc.frequency.exponentialRampToValueAtTime(3500, now + delay + 0.12);
      gain.gain.setValueAtTime(0.08, now + delay);
      gain.gain.linearRampToValueAtTime(0.001, now + delay + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + 0.13);
    };

    playChirp(0);
    playChirp(0.15);
    playChirp(0.3);
  } catch (e) {}
};

const playCatMeow = () => {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + 0.65);
  } catch (e) {}
};

interface LetterItem {
  char: string;
  lowercase?: string;
  phonics: string;
  word: string;
  tamil_word: string;
  emoji: string;
  sentence: string;
  sentence_ta: string;
}

interface TamilItem {
  char: string;
  word: string;
  trans: string;
  emoji: string;
  sentence: string;
  sentence_en: string;
}

interface NumberItem {
  val: number;
  tamil_val: string;
  word: string;
  tamil_word: string;
  emoji: string;
  count: number;
}

interface FlashcardItem {
  category: string;
  name_en: string;
  name_ta: string;
  emoji: string;
  sentence: string;
  sentence_ta: string;
}

export default function KidsLearningHub() {
  const [activeZone, setActiveZone] = useState<'english' | 'tamil' | 'numbers' | 'pictures' | 'music' | 'games' | 'parents' | 'ai-story'>('english');
  const [bilingual, setBilingual] = useState(true); // Toggle bilingual learning instructions
  
  // Dashboard & Profile details
  const [stats, setStats] = useState({
    xp: 0,
    level: 1,
    coins: 0,
    streak: 0,
    total_stars: 0,
    lessons_completed: 0,
    recent_activity: [] as any[],
    subject_breakdown: {} as any
  });
  
  // Server Curriculum Data
  const [lessonsData, setLessonsData] = useState<{
    english: LetterItem[];
    tamilUyir: TamilItem[];
    tamilMei: TamilItem[];
    numbers: NumberItem[];
    pictures: FlashcardItem[];
  }>({
    english: [],
    tamilUyir: [],
    tamilMei: [],
    numbers: [],
    pictures: []
  });
  const [loadingCurriculum, setLoadingCurriculum] = useState(true);

  // Rewards overlay popup
  const [rewardClaimed, setRewardClaimed] = useState<any | null>(null);

  // Alphabet / Tracing Canvas State
  const [selectedLetter, setSelectedLetter] = useState<any | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tracingAccuracy, setTracingAccuracy] = useState<number | null>(null);
  const [canvasCleared, setCanvasCleared] = useState(true);

  // Numbers grid & balloons animation states
  const [floatingBalloons, setFloatingBalloons] = useState<any[]>([]);
  const [activeNumber, setActiveNumber] = useState<NumberItem | null>(null);

  // Picture zone / flashcard filter
  const [pictureFilter, setPictureFilter] = useState<'All' | 'Animals' | 'Fruits' | 'Shapes'>('All');
  const [activeFlashcard, setActiveFlashcard] = useState<FlashcardItem | null>(null);

  // Sing Along / Music State
  const [musicTracks, setMusicTracks] = useState<any[]>([]);
  const [playingTrack, setPlayingTrack] = useState<any | null>(null);
  const [trackSeconds, setTrackSeconds] = useState(0);
  const [chiptunePlaying, setChiptunePlaying] = useState(false);
  const [lyricsHighlightIndex, setLyricsHighlightIndex] = useState(-1);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noteTimerRef = useRef<any>(null);
  const secondTimerRef = useRef<any>(null);

  // AI Story Reader states
  const [aiTopic, setAiTopic] = useState('');
  const [aiStory, setAiStory] = useState<any | null>(null);
  const [generatingStory, setGeneratingStory] = useState(false);
  const [storyLanguage, setStoryLanguage] = useState<'en' | 'ta'>('en');
  const [storyTTSPlaying, setStoryTTSPlaying] = useState(false);

  // Game Arena States
  const [gameMode, setGameMode] = useState<'memory' | 'builder' | 'quiz'>('memory');
  
  // Game 1: Memory match emoji pairs
  const [memoryCards, setMemoryCards] = useState<any[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedIndices, setMatchedIndices] = useState<number[]>([]);
  const [memoryScore, setMemoryScore] = useState(0);
  const [memoryFinished, setMemoryFinished] = useState(false);

  // Game 2: Missing Letter spelling builder
  const [wordBuilderIndex, setWordBuilderIndex] = useState(0);
  const [wordBuilderOptions, setWordBuilderOptions] = useState<string[]>([]);
  const [wordBuilderAnswered, setWordBuilderAnswered] = useState<boolean | null>(null);
  const [selectedBuilderLetter, setSelectedBuilderLetter] = useState<string | null>(null);
  const [wordBuilderScore, setWordBuilderScore] = useState(0);

  // Game 3: Letter Recognition MCQ quiz
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<boolean | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  // Fetch parent stats & seed lessons
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await api.get('/kids/dashboard');
      setStats(res.data);
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    }
  }, []);

  const fetchLessons = useCallback(async () => {
    setLoadingCurriculum(true);
    try {
      const res = await api.get('/kids/lessons');
      const lessons = res.data;
      
      const englishObj = lessons.find((l: any) => l.category === 'english');
      const tamilObj = lessons.find((l: any) => l.category === 'tamil');
      const numbersObj = lessons.find((l: any) => l.category === 'numbers');
      const picturesObj = lessons.find((l: any) => l.category === 'pictures');

      setLessonsData({
        english: englishObj ? englishObj.content_data.letters : [],
        tamilUyir: tamilObj ? tamilObj.content_data.uyir : [],
        tamilMei: tamilObj ? tamilObj.content_data.mei : [],
        numbers: numbersObj ? numbersObj.content_data.numbers : [],
        pictures: picturesObj ? picturesObj.content_data.items : []
      });

      if (englishObj && englishObj.content_data.letters.length > 0) {
        setSelectedLetter({ ...englishObj.content_data.letters[0], type: 'english', lesson_id: englishObj.id });
      }
    } catch (e) {
      console.error("Failed to load kids curriculum:", e);
    } finally {
      setLoadingCurriculum(false);
    }
  }, []);

  const fetchMusicTracks = useCallback(async () => {
    try {
      const res = await api.get('/music');
      const rhymes = res.data.tracks ? res.data.tracks.filter((t: any) => t.is_rhyme || t.category.includes("Rhyme") || t.category.includes("Alphabet")) : [];
      setMusicTracks(rhymes);
    } catch (e) {
      console.error("Failed to fetch rhymes:", e);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
    fetchLessons();
    fetchMusicTracks();
    // Dispatch companion welcome event
    window.dispatchEvent(new CustomEvent('kids-welcome'));
  }, [fetchDashboardStats, fetchLessons, fetchMusicTracks]);

  // Update canvas path template when active letter changes
  useEffect(() => {
    if (selectedLetter && canvasRef.current) {
      clearCanvas();
      drawLetterGuide();
    }
  }, [selectedLetter, activeZone]);

  // Render dotted-line guideline inside canvas
  const drawLetterGuide = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedLetter) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw outer dotted circle container
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - 20, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw guide letters
    ctx.setLineDash([]);
    ctx.font = `bold 240px 'Outfit', 'Inter', sans-serif`;
    ctx.fillStyle = '#f1f5f9'; // Grey template path
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(selectedLetter.char, canvas.width / 2, canvas.height / 2);

    // Draw overlay dotted outline on top of template
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    ctx.strokeText(selectedLetter.char, canvas.width / 2, canvas.height / 2);
    ctx.setLineDash([]);
    setCanvasCleared(true);
    setTracingAccuracy(null);
  };

  // Submit lesson progress and reward stars/XP/coins
  const submitLessonCompletion = async (lessonId: number, starsEarned: number) => {
    try {
      const res = await api.post('/kids/submit', {
        lesson_id: lessonId,
        stars_earned: starsEarned
      });
      setRewardClaimed({
        xp: res.data.xp_reward,
        coins: res.data.coin_reward,
        stars: res.data.stars_reward,
        streak: res.data.streak
      });
      playChimeSound();
      fetchDashboardStats();
    } catch (e) {
      console.error(e);
    }
  };

  // Canvas Drawing mouse/touch handlers
  const getCanvasCoords = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setCanvasCleared(false);
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    ctx.lineTo(coords.x, coords.y);
    
    // Draw crayon/child-friendly path styles
    ctx.strokeStyle = '#10b981'; // Neon green drawing color
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
    ctx.shadowBlur = 8;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.shadowBlur = 0; // reset shadow
    }
  };

  const clearCanvas = () => {
    drawLetterGuide();
  };

  // Check how close the user's drawing is to the template path (Pixel Comparison)
  const checkTracingAccuracy = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedLetter) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create a temporary offscreen canvas for matching
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;

    // Draw the clean grey letter template path
    tCtx.font = `bold 240px 'Outfit', 'Inter', sans-serif`;
    tCtx.fillStyle = '#f1f5f9';
    tCtx.textAlign = 'center';
    tCtx.textBaseline = 'middle';
    tCtx.fillText(selectedLetter.char, tempCanvas.width / 2, tempCanvas.height / 2);

    const templateData = tCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
    const drawingData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let totalLetterPixels = 0;
    let correctTracedPixels = 0;

    for (let i = 0; i < templateData.length; i += 4) {
      const isTemplatePixel = templateData[i] < 255 || templateData[i+1] < 255 || templateData[i+2] < 255;
      if (isTemplatePixel) {
        totalLetterPixels++;
        // Check if user drew over this coordinate (look for green brush values)
        const drawnIndex = i;
        const isUserDrawn = drawingData[drawnIndex] === 16 && drawingData[drawnIndex+1] === 185 && drawingData[drawnIndex+2] === 129;
        if (isUserDrawn) {
          correctTracedPixels++;
        }
      }
    }

    const rawPct = totalLetterPixels > 0 ? (correctTracedPixels / totalLetterPixels) * 100 : 0;
    // Map accuracy between 70% and 100% for encouraging kids feel-good stats
    const mappedAccuracy = Math.min(100, Math.round(rawPct * 3.5 + 40)); 
    
    setTracingAccuracy(mappedAccuracy);

    if (mappedAccuracy >= 70) {
      window.dispatchEvent(new CustomEvent('kids-correct-answer'));
      submitLessonCompletion(selectedLetter.lesson_id, 5);
    } else {
      window.dispatchEvent(new CustomEvent('kids-incorrect-answer'));
      playBuzzerSound();
    }
  };

  // Text to Speech Pronunciation Toggles
  const speakWord = (phrase: string, lang: 'en' | 'ta' = 'en') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
    
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.startsWith(lang));
    if (targetVoice) utterance.voice = targetVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Numbers zone balloon click triggers
  const clickNumberCard = (num: NumberItem) => {
    setActiveNumber(num);
    speakWord(`${num.word}. ${num.tamil_word}`, 'en');
    playPopSound();

    // Spawn balloons rising from the bottom
    const newBalloons = Array.from({ length: num.count }).map((_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 80 + 10,
      y: 100,
      size: Math.random() * 25 + 45,
      color: ['bg-pink-400', 'bg-purple-400', 'bg-blue-400', 'bg-amber-400', 'bg-emerald-400', 'bg-rose-400'][Math.floor(Math.random() * 6)],
      popped: false,
      emoji: num.emoji.substring(i * 2, i * 2 + 2) || '🎈'
    }));

    setFloatingBalloons(newBalloons);
  };

  const popBalloon = (id: number) => {
    playPopSound();
    setFloatingBalloons(prev =>
      prev.map(b => (b.id === id ? { ...b, popped: true } : b))
    );
  };

  // Play Rhymes & Chiptune Music Synced Playback
  const stopPlayingChiptune = () => {
    setChiptunePlaying(false);
    setPlayingTrack(null);
    setLyricsHighlightIndex(-1);
    if (noteTimerRef.current) clearInterval(noteTimerRef.current);
    if (secondTimerRef.current) clearInterval(secondTimerRef.current);
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  const playChiptuneRhyme = (track: any) => {
    stopPlayingChiptune();
    setPlayingTrack(track);
    setChiptunePlaying(true);
    setTrackSeconds(0);
    setLyricsHighlightIndex(0);

    if (typeof window === 'undefined') return;
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = audioCtx;

    // Send dance event to companion
    window.dispatchEvent(new CustomEvent('music-play', { detail: { title: track.title_en } }));
    window.dispatchEvent(new CustomEvent('music-dance'));

    const notes = track.melody_notes || [];
    const lyricsSync = track.lyrics_sync || [];

    let noteIdx = 0;
    let scheduledTime = audioCtx.currentTime + 0.1;

    // Play procedural synthesizers notes step
    const playNextNote = () => {
      if (!chiptunePlaying || noteIdx >= notes.length) {
        // Loop back or finish
        if (noteIdx >= notes.length) {
          noteIdx = 0;
        }
      }

      const note = notes[noteIdx];
      const freq = NOTE_FREQS[note.note];
      const duration = note.duration * 0.45; // pace speed

      if (freq) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, scheduledTime);
        
        // Sweet chiptune vibrato / LFO
        const vibrato = audioCtx.createOscillator();
        vibrato.frequency.value = 8;
        const vibratoGain = audioCtx.createGain();
        vibratoGain.gain.value = 5;
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        
        gain.gain.setValueAtTime(0.1, scheduledTime);
        gain.gain.exponentialRampToValueAtTime(0.001, scheduledTime + duration - 0.02);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        vibrato.start(scheduledTime);
        osc.start(scheduledTime);
        
        vibrato.stop(scheduledTime + duration);
        osc.stop(scheduledTime + duration);
      }

      scheduledTime += duration;
      noteIdx++;
      
      const timeoutMs = duration * 1000;
      noteTimerRef.current = setTimeout(playNextNote, timeoutMs);
    };

    // Timer for counting seconds and updating synchronized lyrics highlight
    let elapsed = 0;
    secondTimerRef.current = setInterval(() => {
      elapsed += 1;
      setTrackSeconds(elapsed);
      
      // Update lyrics sync highlight
      const activeLyrIdx = lyricsSync.findIndex((l: any, idx: number) => {
        const nextL = lyricsSync[idx + 1];
        return elapsed >= l.time && (!nextL || elapsed < nextL.time);
      });
      if (activeLyrIdx !== -1) {
        setLyricsHighlightIndex(activeLyrIdx);
      }

      if (elapsed > 16) {
        stopPlayingChiptune();
      }
    }, 1000);

    playNextNote();
  };

  // AI Story writer / builder
  const handleGenerateStory = async () => {
    if (!aiTopic.trim()) return;
    setGeneratingStory(true);
    setAiStory(null);
    setStoryTTSPlaying(false);
    
    // dispatch generate companion alert
    window.dispatchEvent(new CustomEvent('story-generate', { detail: { style: 'kids moral' } }));

    try {
      const res = await api.post('/kids/ai-story', { topic: aiTopic });
      setAiStory(res.data);
      playChimeSound();
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingStory(false);
    }
  };

  const toggleStoryTTS = () => {
    if (!aiStory) return;
    if (storyTTSPlaying) {
      window.speechSynthesis.cancel();
      setStoryTTSPlaying(false);
    } else {
      const txt = storyLanguage === 'en' ? aiStory.content_en : aiStory.content_ta;
      speakWord(txt, storyLanguage);
      setStoryTTSPlaying(true);
      
      const checkSpeechEnd = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setStoryTTSPlaying(false);
          clearInterval(checkSpeechEnd);
        }
      }, 500);
    }
  };

  // ==================== MINI GAMES ENGINE ==================== //

  // Game 1: Memory Match Pairs
  const initMemoryGame = useCallback(() => {
    const emojis = ['🦁', '🍎', '🎈', '🚗', '🐱', '🦄'];
    // Duplicate and shuffle
    const cards = [...emojis, ...emojis]
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false }))
      .sort(() => Math.random() - 0.5);
    setMemoryCards(cards);
    setFlippedIndices([]);
    setMatchedIndices([]);
    setMemoryScore(0);
    setMemoryFinished(false);
  }, []);

  const clickMemoryCard = (index: number) => {
    if (flippedIndices.length >= 2 || matchedIndices.includes(index) || flippedIndices.includes(index)) return;
    
    playPopSound();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIdx, secondIdx] = newFlipped;
      if (memoryCards[firstIdx].emoji === memoryCards[secondIdx].emoji) {
        // Match!
        const matches = [...matchedIndices, firstIdx, secondIdx];
        setMatchedIndices(matches);
        setFlippedIndices([]);
        setMemoryScore(prev => prev + 10);
        window.dispatchEvent(new CustomEvent('kids-correct-answer'));
        playChimeSound();

        if (matches.length === memoryCards.length) {
          setMemoryFinished(true);
          submitLessonCompletion(1, 5); // Submit english matching completed
        }
      } else {
        // Mis-match, reset cards
        window.dispatchEvent(new CustomEvent('kids-incorrect-answer'));
        playBuzzerSound();
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  // Game 2: Missing Letter word builder
  const initWordBuilder = useCallback(() => {
    if (lessonsData.english.length === 0) return;
    setWordBuilderIndex(0);
    setWordBuilderScore(0);
    loadBuilderQuestion(0);
  }, [lessonsData.english]);

  const loadBuilderQuestion = useCallback((idx: number) => {
    const lettersList = lessonsData.english;
    if (lettersList.length === 0) return;
    const current = lettersList[idx % lettersList.length];
    
    // Choose missing character
    const word = current.word;
    const missingChar = word[1] ? word[1].toUpperCase() : 'A';
    
    // Generate MCQ letters options
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const options = [missingChar];
    while (options.length < 3) {
      const randChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      if (!options.includes(randChar)) {
        options.push(randChar);
      }
    }
    setWordBuilderOptions(options.sort(() => Math.random() - 0.5));
    setWordBuilderAnswered(null);
    setSelectedBuilderLetter(null);
  }, [lessonsData.english]);

  const selectBuilderOption = (option: string) => {
    if (wordBuilderAnswered !== null) return;
    const lettersList = lessonsData.english;
    const current = lettersList[wordBuilderIndex % lettersList.length];
    const targetChar = current.word[1].toUpperCase();

    setSelectedBuilderLetter(option);
    if (option === targetChar) {
      setWordBuilderAnswered(true);
      setWordBuilderScore(prev => prev + 10);
      window.dispatchEvent(new CustomEvent('kids-correct-answer'));
      playChimeSound();
    } else {
      setWordBuilderAnswered(false);
      window.dispatchEvent(new CustomEvent('kids-incorrect-answer'));
      playBuzzerSound();
    }
  };

  const nextBuilderWord = () => {
    const nextIdx = wordBuilderIndex + 1;
    setWordBuilderIndex(nextIdx);
    loadBuilderQuestion(nextIdx);
  };

  // Game 3: Recognition MCQ Quiz
  const initQuizGame = useCallback(() => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
    loadQuizQuestion(0);
  }, []);

  const loadQuizQuestion = (idx: number) => {
    setQuizAnswered(null);
    setSelectedQuizOption(null);
  };

  const selectQuizOption = (option: string, answer: string) => {
    if (quizAnswered !== null) return;
    setSelectedQuizOption(option);
    if (option === answer) {
      setQuizAnswered(true);
      setQuizScore(prev => prev + 10);
      window.dispatchEvent(new CustomEvent('kids-correct-answer'));
      playChimeSound();
    } else {
      setQuizAnswered(false);
      window.dispatchEvent(new CustomEvent('kids-incorrect-answer'));
      playBuzzerSound();
    }
  };

  const nextQuizQuestion = () => {
    const nextIdx = quizIndex + 1;
    if (nextIdx >= 3) {
      setQuizFinished(true);
      submitLessonCompletion(1, 5); // Submit general quiz completed
    } else {
      setQuizIndex(nextIdx);
      loadQuizQuestion(nextIdx);
    }
  };

  // Initialize selected game mode states
  useEffect(() => {
    if (activeZone === 'games') {
      if (gameMode === 'memory') {
        initMemoryGame();
      } else if (gameMode === 'builder') {
        initWordBuilder();
      } else if (gameMode === 'quiz') {
        initQuizGame();
      }
    }
  }, [activeZone, gameMode, initMemoryGame, initWordBuilder, initQuizGame]);

  // Handle game type switch
  const changeGameMode = (mode: 'memory' | 'builder' | 'quiz') => {
    setGameMode(mode);
  };

  // Trigger Print Window for Certificate of Excellence
  const printCertificate = () => {
    window.print();
  };

  if (loadingCurriculum) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent"></div>
        <p className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse">Loading Kids Zone...</p>
      </div>
    );
  }

  // Active English letter data mapping helper
  const activeLetterData = selectedLetter && selectedLetter.type === 'english' ? selectedLetter : lessonsData.english[0];
  const activeTamilData = selectedLetter && selectedLetter.type === 'tamil' ? selectedLetter : (lessonsData.tamilUyir[0] || null);

  // General quiz questions (static pool for Kids hub recognition matches)
  const QUIZ_QUESTIONS = [
    {
      q_en: "Which letter matches this sound /æ/ like Apple?",
      q_ta: "ஆப்பிள் போன்ற ஓசையைக் கொண்ட எழுத்து எது?",
      options: ["A", "B", "C", "D"],
      ans: "A",
      emoji: "🍎"
    },
    {
      q_en: "What is the Tamil name of the Fruit: Mango 🥭?",
      q_ta: "மாம்பழம் என்பதன் ஆங்கில வார்த்தை எது?",
      options: ["மாம்பழம்", "அம்மா", "ஆடு", "இலை"],
      ans: "மாம்பழம்",
      emoji: "🥭"
    },
    {
      q_en: "How do we write the number Three (3) in Tamil numerals?",
      q_ta: "எண் மூன்றை (3) தமிழ் எண்ணில் எவ்வாறு எழுதுவோம்?",
      options: ["௧", "௨", "௩", "௪"],
      ans: "௩",
      emoji: "🎈"
    }
  ];

  return (
    <div className="min-h-screen pb-24 space-y-8 select-none print:bg-white print:p-0">
      
      {/* HEADER HUD BAR */}
      <div className="no-print relative overflow-hidden bg-gradient-to-r from-amber-300 via-emerald-400 to-pink-400 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl border border-white/40 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="flex items-center gap-4 z-10 text-left">
          <div className="h-16 w-16 bg-white/90 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-4xl shadow-lg border-2 border-emerald-400">
            👶
          </div>
          <div className="space-y-1">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-white/40 text-emerald-800 uppercase tracking-widest">
              Bilingual Learning Zone
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-white dark:text-slate-100 flex items-center gap-2">
              Kids Learning Hub <Sparkles className="h-6 w-6 text-yellow-200 fill-current animate-bounce" />
            </h1>
          </div>
        </div>

        {/* HUD values with bouncy counts */}
        <div className="flex items-center gap-3 bg-white/85 dark:bg-slate-950/50 p-4 rounded-3xl border border-emerald-300/40 shadow-inner z-10">
          <div className="text-center px-3 border-r border-slate-200 dark:border-slate-800">
            <span className="block text-xl font-black text-emerald-600 flex items-center justify-center gap-1">
              ⭐ {stats.total_stars}
            </span>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">Total Stars</span>
          </div>
          <div className="text-center px-3 border-r border-slate-200 dark:border-slate-800">
            <span className="block text-xl font-black text-yellow-500">
              🪙 {stats.coins}
            </span>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">Coins</span>
          </div>
          <div className="text-center px-3 border-r border-slate-200 dark:border-slate-800">
            <span className="block text-xl font-black text-indigo-500">
              🏆 {stats.xp}
            </span>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">XP</span>
          </div>
          <div className="text-center px-3">
            <span className="block text-xl font-black text-orange-500 flex items-center gap-0.5 justify-center">
              🔥 {stats.streak}
            </span>
            <span className="text-[9px] uppercase font-black tracking-wider text-slate-400">Streak</span>
          </div>
        </div>
      </div>

      {/* ZONE TABS SELECTOR */}
      <div className="no-print flex flex-wrap gap-3 justify-center items-center">
        {[
          { key: 'english', label: '🔤 English Basics', color: 'bg-emerald-400 text-white' },
          { key: 'tamil', label: '🔠 தமிழ் எழுத்துக்கள்', color: 'bg-pink-400 text-white' },
          { key: 'numbers', label: '🔢 Numbers (எண்கள்)', color: 'bg-amber-400 text-white' },
          { key: 'pictures', label: '🎨 Pictures (படங்கள்)', color: 'bg-purple-400 text-white' },
          { key: 'music', label: '🎶 Sing Alongs', color: 'bg-blue-400 text-white' },
          { key: 'games', label: '🎮 Play Arena', color: 'bg-rose-400 text-white' },
          { key: 'ai-story', label: '📖 AI Storybook', color: 'bg-indigo-400 text-white' },
          { key: 'parents', label: '👩‍👦 Parents Dashboard', color: 'bg-teal-400 text-white' }
        ].map(zone => (
          <button
            key={zone.key}
            onClick={() => {
              setActiveZone(zone.key as any);
              stopPlayingChiptune();
            }}
            className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer ${
              activeZone === zone.key
                ? zone.color + ' border-2 border-white dark:border-slate-800 scale-105 shadow-xl'
                : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
            }`}
          >
            {zone.label}
          </button>
        ))}
      </div>

      {/* DYNAMIC SUBSECTION PANEL CONTENT */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* =============== ZONE 1: ENGLISH BASICS =============== */}
        {activeZone === 'english' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Grid selector of Letters */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-600 shadow-md space-y-4">
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Alphabet Grid
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {lessonsData.english.map((letter) => (
                  <button
                    key={letter.char}
                    onClick={() => {
                      setSelectedLetter({ ...letter, type: 'english', lesson_id: 1 });
                      playPopSound();
                    }}
                    className={`h-16 rounded-2xl text-2xl font-black transition-all flex flex-col justify-center items-center cursor-pointer ${
                      activeLetterData?.char === letter.char
                        ? 'bg-emerald-400 text-white shadow-lg scale-105 border-2 border-white'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-150 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{letter.char}</span>
                    <span className="text-[10px] font-semibold opacity-75">{letter.lowercase}</span>
                  </button>
                ))}
              </div>

              {/* Phonics Sound List */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 text-left">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Phonics Sounds</h3>
                <div className="flex flex-wrap gap-2">
                  {['Vowels (A, E, I, O, U)', 'Consonants (B, C, D, ...)', 'Blending sounds'].map((ph) => (
                    <span key={ph} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/50 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      {ph}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tracing Board & Phonics details */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-600 shadow-md flex flex-col md:flex-row items-center gap-6">
              
              {/* Tracing Canvas */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative bg-slate-50 dark:bg-slate-950 border-4 border-emerald-400 rounded-3xl overflow-hidden shadow-inner w-[280px] h-[280px]">
                  <canvas
                    ref={canvasRef}
                    width={280}
                    height={280}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair w-full h-full touch-none"
                  />
                  {tracingAccuracy !== null && (
                    <div className="absolute inset-0 bg-white/85 dark:bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
                      <span className="text-5xl">🏆</span>
                      <p className="text-xl font-black text-slate-800 dark:text-slate-100">
                        Accuracy: {tracingAccuracy}%
                      </p>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white ${tracingAccuracy >= 70 ? 'bg-emerald-500 shadow-md animate-bounce' : 'bg-rose-500'}`}>
                        {tracingAccuracy >= 70 ? 'Awesome Tracing! 🌟' : 'Try Again! 👍'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 w-full">
                  <button
                    onClick={clearCanvas}
                    className="flex-1 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100/60 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200"
                  >
                    <Eraser className="h-4.5 w-4.5" /> Clear
                  </button>
                  <button
                    onClick={checkTracingAccuracy}
                    disabled={canvasCleared}
                    className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer ${
                      canvasCleared 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-400 text-white hover:bg-emerald-500 shadow'
                    }`}
                  >
                    <Check className="h-4.5 w-4.5" /> Check
                  </button>
                </div>
              </div>

              {/* Word Illustration details */}
              <div className="flex-1 space-y-5 text-left w-full">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-500 uppercase tracking-widest">
                    Phonics / Pronunciation: /{activeLetterData?.phonics}/
                  </span>
                  <h3 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                    {activeLetterData?.char} is for {activeLetterData?.word}
                  </h3>
                </div>

                <div className="h-28 w-28 bg-gradient-to-tr from-emerald-100 to-indigo-100 dark:from-emerald-950/40 dark:to-indigo-950/40 rounded-3xl flex items-center justify-center text-7xl shadow-lg">
                  {activeLetterData?.emoji}
                </div>

                <div className="space-y-3 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                  <p className="text-sm font-semibold text-slate-650 dark:text-slate-300 italic">
                    "{activeLetterData?.sentence}"
                  </p>
                  <p className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                    "{activeLetterData?.sentence_ta}"
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => speakWord(`${activeLetterData?.char} for ${activeLetterData?.word}. ${activeLetterData?.sentence}`)}
                    className="flex-1 py-3 rounded-2xl bg-indigo-500 text-white hover:bg-indigo-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow"
                  >
                    <Volume2 className="h-4.5 w-4.5" /> Hear English
                  </button>
                  <button
                    onClick={() => speakWord(`${activeLetterData?.tamil_word}. ${activeLetterData?.sentence_ta}`, 'ta')}
                    className="flex-1 py-3 rounded-2xl bg-pink-500 text-white hover:bg-pink-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow"
                  >
                    <Volume2 className="h-4.5 w-4.5" /> தமிழ் உச்சரிப்பு
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =============== ZONE 2: TAMIL BASICS =============== */}
        {activeZone === 'tamil' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Grid selector of Letters */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-600 shadow-md space-y-5">
              
              {/* Uyir Letters */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest text-left">
                  உயிரெழுத்துக்கள் (Uyir Letters)
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {lessonsData.tamilUyir.map((letter) => (
                    <button
                      key={letter.char}
                      onClick={() => {
                        setSelectedLetter({ ...letter, type: 'tamil', lesson_id: 2 });
                        playPopSound();
                      }}
                      className={`h-14 rounded-xl text-xl font-black transition-all flex items-center justify-center cursor-pointer ${
                        activeTamilData?.char === letter.char
                          ? 'bg-pink-500 text-white shadow-lg scale-105 border-2 border-white'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 border border-slate-150 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {letter.char}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mei Letters */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest text-left">
                  மெய்யெழுத்துக்கள் (Mei Letters)
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {lessonsData.tamilMei.map((letter) => (
                    <button
                      key={letter.char}
                      onClick={() => {
                        setSelectedLetter({ ...letter, type: 'tamil', lesson_id: 2 });
                        playPopSound();
                      }}
                      className={`h-14 rounded-xl text-xl font-black transition-all flex items-center justify-center cursor-pointer ${
                        activeTamilData?.char === letter.char
                          ? 'bg-pink-500 text-white shadow-lg scale-105 border-2 border-white'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-150 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {letter.char}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tracing Board & Tamil Details */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-600 shadow-md flex flex-col md:flex-row items-center gap-6">
              
              {/* Tracing Canvas */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative bg-slate-50 dark:bg-slate-950 border-4 border-pink-400 rounded-3xl overflow-hidden shadow-inner w-[280px] h-[280px]">
                  <canvas
                    ref={canvasRef}
                    width={280}
                    height={280}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair w-full h-full touch-none"
                  />
                  {tracingAccuracy !== null && (
                    <div className="absolute inset-0 bg-white/85 dark:bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
                      <span className="text-5xl">🏆</span>
                      <p className="text-xl font-black text-slate-800 dark:text-slate-100">
                        Accuracy: {tracingAccuracy}%
                      </p>
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white ${tracingAccuracy >= 70 ? 'bg-pink-500 shadow-md animate-bounce' : 'bg-rose-500'}`}>
                        {tracingAccuracy >= 70 ? 'அருமை! சூப்பர்! 🌟' : 'மீண்டும் முயற்சி செய்! 👍'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 w-full">
                  <button
                    onClick={clearCanvas}
                    className="flex-1 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100/60 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200"
                  >
                    <Eraser className="h-4.5 w-4.5" /> Clear
                  </button>
                  <button
                    onClick={checkTracingAccuracy}
                    disabled={canvasCleared}
                    className={`flex-1 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer ${
                      canvasCleared 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-pink-500 text-white hover:bg-pink-600 shadow'
                    }`}
                  >
                    <Check className="h-4.5 w-4.5" /> Check
                  </button>
                </div>
              </div>

              {/* Word Details */}
              <div className="flex-1 space-y-5 text-left w-full">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-pink-500/10 text-pink-500 uppercase tracking-widest">
                    தமிழ் வழி கற்றல்
                  </span>
                  <h3 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                    {activeTamilData?.char} - {activeTamilData?.word}
                  </h3>
                  <p className="text-xs font-bold text-slate-400">
                    Translation: {activeTamilData?.trans}
                  </p>
                </div>

                <div className="h-28 w-28 bg-gradient-to-tr from-pink-100 to-amber-100 dark:from-pink-950/40 dark:to-amber-950/40 rounded-3xl flex items-center justify-center text-7xl shadow-lg">
                  {activeTamilData?.emoji}
                </div>

                <div className="space-y-3 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                  <p className="text-sm font-black text-pink-600">
                    "{activeTamilData?.sentence}"
                  </p>
                  <p className="text-[12px] font-bold text-slate-500 dark:text-slate-400 italic">
                    "{activeTamilData?.sentence_en}"
                  </p>
                </div>

                <button
                  onClick={() => speakWord(`${activeTamilData?.char}. ${activeTamilData?.word}. ${activeTamilData?.sentence}`, 'ta')}
                  className="w-full py-3.5 rounded-2xl bg-pink-500 text-white hover:bg-pink-600 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow"
                >
                  <Volume2 className="h-4.5 w-4.5" /> ஒலி வடிவம்
                </button>
              </div>

            </div>
          </div>
        )}

        {/* =============== ZONE 3: NUMBERS =============== */}
        {activeZone === 'numbers' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Grid numbers */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-600 shadow-md space-y-4 relative overflow-hidden">
              
              {/* Balloon popping animations container */}
              <div className="absolute inset-0 pointer-events-none z-10">
                <AnimatePresence>
                  {floatingBalloons.map((b) => (
                    !b.popped && (
                      <motion.button
                        key={b.id}
                        initial={{ y: 350, x: b.x + '%', opacity: 1 }}
                        animate={{ y: -80, rotate: [0, 10, -10, 0] }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 5, ease: 'easeOut' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          popBalloon(b.id);
                        }}
                        style={{ width: b.size, height: b.size }}
                        className={`absolute rounded-full text-center flex items-center justify-center text-xl shadow-lg border-2 border-white pointer-events-auto cursor-pointer ${b.color}`}
                      >
                        {b.emoji}
                      </motion.button>
                    )
                  ))}
                </AnimatePresence>
              </div>

              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider text-left">
                Count Grid (1 - 100)
              </h2>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3.5">
                {lessonsData.numbers.map((num) => (
                  <button
                    key={num.val}
                    onClick={() => clickNumberCard(num)}
                    className={`h-20 rounded-2xl transition-all flex flex-col justify-center items-center cursor-pointer shadow-md ${
                      activeNumber?.val === num.val
                        ? 'bg-amber-400 text-white shadow-xl scale-105 border-2 border-white'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 border border-slate-150 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-2xl font-black">{num.val}</span>
                    <span className="text-[12px] font-black text-amber-500 dark:text-amber-400">{num.tamil_val}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Display / Animation details */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-600 shadow-md flex flex-col justify-between items-center text-center space-y-6">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 uppercase tracking-widest">
                  Active Count
                </span>
                <h3 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                  {activeNumber ? activeNumber.word : 'Select Number'}
                </h3>
                <p className="text-lg font-bold text-slate-500">
                  Tamil: {activeNumber ? activeNumber.tamil_word : ''}
                </p>
              </div>

              <div className="h-44 w-full bg-slate-50 dark:bg-slate-950 rounded-3xl border border-dashed border-amber-300 flex flex-wrap items-center justify-center p-4 text-4xl gap-2 overflow-y-auto">
                {activeNumber ? (
                  Array.from({ length: activeNumber.count }).map((_, i) => (
                    <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                      {activeNumber.emoji.substring(i * 2, i * 2 + 2) || '🎈'}
                    </span>
                  ))
                ) : (
                  <span className="text-sm font-bold text-slate-400">Click a number on the grid to watch floating balloons float up! 🎈</span>
                )}
              </div>

              {activeNumber && (
                <button
                  onClick={() => submitLessonCompletion(3, 5)}
                  className="w-full py-4 bg-amber-400 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-amber-500 shadow"
                >
                  Confirm Counting! ⭐
                </button>
              )}
            </div>
          </div>
        )}

        {/* =============== ZONE 4: PICTURE ZONE =============== */}
        {activeZone === 'pictures' && (
          <div className="space-y-6">
            {/* Filter tags */}
            <div className="flex gap-2 justify-start items-center no-print">
              {['All', 'Animals', 'Fruits', 'Shapes'].map((category) => (
                <button
                  key={category}
                  onClick={() => setPictureFilter(category as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    pictureFilter === category
                      ? 'bg-purple-400 text-white border-b-4 border-purple-600 shadow-md'
                      : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Flashcards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {lessonsData.pictures
                .filter(item => pictureFilter === 'All' || item.category === pictureFilter)
                .map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveFlashcard(item);
                      playPopSound();
                    }}
                    className="relative overflow-hidden bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-3xl p-5 shadow-lg flex flex-col items-center justify-between text-center space-y-4 hover:scale-[1.03] transition-all cursor-pointer group hover:shadow-xl"
                  >
                    <div className="h-10 w-full flex justify-between items-center text-left">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-400/10 text-purple-600 uppercase tracking-widest">
                        {item.category}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.name_en === 'Lion') playLionSound();
                          else if (item.name_en === 'Elephant') playElephantSound();
                          else if (item.name_en === 'Bird') playBirdSound();
                          else playCatMeow();
                        }}
                        className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-sm shadow hover:bg-slate-200"
                        title="Play sound effect"
                      >
                        🔊
                      </button>
                    </div>

                    <div className="text-7xl group-hover:animate-bounce">{item.emoji}</div>

                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                        {item.name_en}
                      </h3>
                      <p className="text-sm font-bold text-purple-500">
                        Tamil: {item.name_ta}
                      </p>
                    </div>

                    <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(`${item.name_en}. ${item.sentence}`);
                        }}
                        className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-330 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1"
                      >
                        English
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(`${item.name_ta}. ${item.sentence_ta}`, 'ta');
                        }}
                        className="flex-1 py-2 rounded-xl bg-purple-400 text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow"
                      >
                        தமிழ்
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Flashcard detailed drawer modal */}
            <AnimatePresence>
              {activeFlashcard && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white dark:bg-slate-800 border-2 border-purple-400 rounded-3xl max-w-md w-full p-6 text-center space-y-6 relative shadow-2xl"
                  >
                    <button
                      onClick={() => setActiveFlashcard(null)}
                      className="absolute top-4 right-4 h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    <span className="text-8xl block animate-pulse">{activeFlashcard.emoji}</span>
                    
                    <div className="space-y-1">
                      <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100">
                        {activeFlashcard.name_en}
                      </h2>
                      <p className="text-xl font-bold text-purple-500">
                        {activeFlashcard.name_ta}
                      </p>
                    </div>

                    <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-left border border-slate-100">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-350 italic">
                        "{activeFlashcard.sentence}"
                      </p>
                      <p className="text-[12px] font-black text-purple-600">
                        "{activeFlashcard.sentence_ta}"
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => speakWord(`${activeFlashcard.name_en}. ${activeFlashcard.sentence}`)}
                        className="flex-1 py-3 bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-600 shadow"
                      >
                        Hear English
                      </button>
                      <button
                        onClick={() => speakWord(`${activeFlashcard.name_ta}. ${activeFlashcard.sentence_ta}`, 'ta')}
                        className="flex-1 py-3 bg-pink-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-pink-600 shadow"
                      >
                        ஒலி வடிவம்
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* =============== ZONE 5: SING ALONG MUSIC =============== */}
        {activeZone === 'music' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Tracks listing */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-600 shadow-md space-y-4">
              <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider text-left">
                Sing-Alongs Rhymes
              </h2>
              <div className="space-y-3">
                {musicTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex justify-between items-center p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-3xl">{track.illustration_emoji || '🎵'}</span>
                      <div>
                        <h4 className="text-sm font-black text-slate-700 dark:text-slate-250 truncate w-36">
                          {track.title_en}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400">
                          {track.category}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => playChiptuneRhyme(track)}
                      className="h-10 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow cursor-pointer"
                    >
                      Sing 🎤
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Syced lyrics player view */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-600 shadow-md flex flex-col justify-between items-center space-y-6 relative overflow-hidden">
              {playingTrack ? (
                <>
                  <div className="text-center space-y-2">
                    <span className="h-16 w-16 bg-blue-50 dark:bg-blue-950 text-blue-500 rounded-full flex items-center justify-center text-4xl shadow mx-auto">
                      {playingTrack.illustration_emoji || '🎵'}
                    </span>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">
                      {playingTrack.title_en}
                    </h3>
                    <p className="text-xs font-bold text-slate-400">
                      Artist: {playingTrack.artist}
                    </p>
                  </div>

                  {/* Synced Lyrics view */}
                  <div className="h-56 w-full bg-slate-50 dark:bg-slate-950 border border-blue-200 rounded-3xl p-5 overflow-y-auto space-y-4 text-center flex flex-col justify-center">
                    {playingTrack.lyrics_sync && playingTrack.lyrics_sync.map((lyr: any, idx: number) => (
                      <div
                        key={idx}
                        className={`transition-all duration-350 ${
                          lyricsHighlightIndex === idx
                            ? 'scale-110 font-black text-blue-500 text-lg'
                            : 'opacity-40 text-sm font-semibold'
                        }`}
                      >
                        <p>{lyr.text_en}</p>
                        <p className="text-sm text-pink-500">{lyr.text_ta}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 w-full">
                    <button
                      onClick={stopPlayingChiptune}
                      className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow flex items-center justify-center gap-1.5"
                    >
                      <VolumeX className="h-4.5 w-4.5" /> Stop Chiptune
                    </button>
                    <button
                      onClick={() => speakWord(playingTrack.lyrics_en)}
                      className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow flex items-center justify-center gap-1.5"
                    >
                      <Volume2 className="h-4.5 w-4.5" /> Hear Lyrics
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 m-auto">
                  <span className="text-7xl block animate-bounce">🎶</span>
                  <h3 className="text-lg font-black text-slate-400">No Song Selected</h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Choose a sing-along song from the list to trigger play and sync bilingual lyrics.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============== ZONE 6: PLAY GAME ARENA =============== */}
        {activeZone === 'games' && (
          <div className="space-y-6">
            {/* Game Selector Tab */}
            <div className="flex gap-3 justify-center items-center">
              {[
                { key: 'memory', label: '🎴 Memory Emoji' },
                { key: 'builder', label: '✏️ Word Builder' },
                { key: 'quiz', label: '❓ Recognition Quiz' }
              ].map((game) => (
                <button
                  key={game.key}
                  onClick={() => changeGameMode(game.key as any)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow cursor-pointer transition-all ${
                    gameMode === game.key
                      ? 'bg-rose-400 text-white border-2 border-white'
                      : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-500'
                  }`}
                >
                  {game.label}
                </button>
              ))}
            </div>

            {/* Game 1: Memory Match */}
            {gameMode === 'memory' && (
              <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-6 border-2 border-slate-200 dark:border-slate-600 rounded-3xl shadow-md text-center space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Memory Match Pairs</h3>
                  <span className="text-sm font-black text-emerald-500">Score: {memoryScore}</span>
                </div>

                {!memoryFinished ? (
                  <div className="grid grid-cols-4 gap-3">
                    {memoryCards.map((card, index) => {
                      const isOpen = flippedIndices.includes(index) || matchedIndices.includes(index);
                      return (
                        <button
                          key={card.id}
                          onClick={() => clickMemoryCard(index)}
                          className={`h-20 rounded-2xl text-3xl flex items-center justify-center transition-all transform cursor-pointer border-2 ${
                            isOpen
                              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 rotate-0'
                              : 'bg-gradient-to-tr from-rose-400 to-pink-500 border-white text-white hover:scale-105 active:scale-95'
                          }`}
                        >
                          {isOpen ? card.emoji : '❓'}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-4 py-6">
                    <span className="text-6xl block">🎉</span>
                    <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">Spectacular Match Completed!</h4>
                    <p className="text-xs text-slate-500">You paired all card items successfully! +5 Stars awarded.</p>
                    <button
                      onClick={initMemoryGame}
                      className="px-6 py-3 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-600 shadow"
                    >
                      Play Again
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Game 2: Word Builder */}
            {gameMode === 'builder' && lessonsData.english.length > 0 && (
              <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-6 border-2 border-slate-200 dark:border-slate-600 rounded-3xl shadow-md text-center space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Missing Spelling</h3>
                  <span className="text-sm font-black text-emerald-500">Score: {wordBuilderScore}</span>
                </div>

                {/* Card item */}
                {(() => {
                  const current = lessonsData.english[wordBuilderIndex % lessonsData.english.length];
                  const word = current.word;
                  const firstL = word[0];
                  const remaining = word.substring(2);
                  return (
                    <div className="space-y-6">
                      <div className="text-8xl block animate-bounce">{current.emoji}</div>
                      
                      {/* Blank text block */}
                      <div className="flex justify-center items-center gap-2 text-4xl font-extrabold tracking-widest uppercase">
                        <span>{firstL}</span>
                        <span className="border-b-4 border-rose-500 w-10 text-rose-500 h-10 block text-center">
                          {wordBuilderAnswered ? word[1].toUpperCase() : (selectedBuilderLetter || '_')}
                        </span>
                        <span>{remaining}</span>
                      </div>

                      {/* Options grid */}
                      <div className="grid grid-cols-3 gap-3 pt-4">
                        {wordBuilderOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => selectBuilderOption(opt)}
                            className={`py-4 rounded-2xl text-2xl font-black transition-all border cursor-pointer ${
                              selectedBuilderLetter === opt
                                ? (wordBuilderAnswered ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-rose-500 text-white border-rose-600')
                                : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>

                      {wordBuilderAnswered !== null && (
                        <div className="space-y-3 pt-4">
                          <p className={`text-sm font-bold ${wordBuilderAnswered ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {wordBuilderAnswered ? 'Brilliant Job! Correct! 🌟' : 'Oh close! Try another one!'}
                          </p>
                          <button
                            onClick={nextBuilderWord}
                            className="px-6 py-2.5 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-600 shadow"
                          >
                            Next Word
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Game 3: Recognition MCQ Quiz */}
            {gameMode === 'quiz' && (
              <div className="max-w-md mx-auto bg-white dark:bg-slate-800 p-6 border-2 border-slate-200 dark:border-slate-600 rounded-3xl shadow-md text-center space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Recognition Quiz</h3>
                  <span className="text-sm font-bold text-slate-400">Question {quizIndex + 1}/3</span>
                </div>

                {!quizFinished ? (
                  <div className="space-y-6">
                    <span className="text-7xl block animate-pulse">{QUIZ_QUESTIONS[quizIndex].emoji}</span>
                    <p className="text-base font-black text-slate-850 dark:text-slate-105">
                      {QUIZ_QUESTIONS[quizIndex].q_en}
                    </p>
                    <p className="text-sm font-bold text-rose-500">
                      {QUIZ_QUESTIONS[quizIndex].q_ta}
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-3">
                      {QUIZ_QUESTIONS[quizIndex].options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => selectQuizOption(opt, QUIZ_QUESTIONS[quizIndex].ans)}
                          className={`py-3 rounded-2xl font-black text-sm border cursor-pointer ${
                            selectedQuizOption === opt
                              ? (quizAnswered ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-rose-500 text-white border-rose-600')
                              : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {quizAnswered !== null && (
                      <div className="space-y-3 pt-4 animate-bounce">
                        <button
                          onClick={nextQuizQuestion}
                          className="px-6 py-2.5 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-600 shadow"
                        >
                          Next Question
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 py-6">
                    <span className="text-6xl block">🏆</span>
                    <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">Quiz Completed!</h4>
                    <p className="text-sm font-bold text-emerald-500">Your Score: {quizScore}/30</p>
                    <button
                      onClick={initQuizGame}
                      className="px-6 py-3 bg-rose-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-600 shadow"
                    >
                      Play Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =============== ZONE 7: AI STORYBOOK =============== */}
        {activeZone === 'ai-story' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Prompt builder */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-600 shadow-md space-y-5 text-left">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-500 uppercase tracking-widest">
                  AI Fairy Tales
                </span>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
                  Fairy Tale Creator
                </h3>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  Input a topic word (e.g. "space cat", "singing dolphin") to generate a cute moral story in English and Tamil side-by-side!
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Story Theme / Hero
                </label>
                <input
                  type="text"
                  placeholder="friendly dragon..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-250 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>

              <button
                onClick={handleGenerateStory}
                disabled={generatingStory || !aiTopic.trim()}
                className={`w-full py-4.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow transition-all cursor-pointer ${
                  generatingStory || !aiTopic.trim()
                    ? 'bg-slate-150 text-slate-400 cursor-not-allowed dark:bg-slate-850'
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
              >
                {generatingStory ? (
                  <>
                    <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-slate-300 border-t-transparent"></div>
                    Writing Story...
                  </>
                ) : (
                  <>Create Moral Story 🌟</>
                )}
              </button>
            </div>

            {/* Side by side Story Display */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-600 shadow-md flex flex-col justify-between space-y-6 text-left relative min-h-[400px]">
              {aiStory ? (
                <>
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black rounded-full uppercase tracking-widest">
                        Story Generated
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setStoryLanguage(prev => prev === 'en' ? 'ta' : 'en')}
                          className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-350 cursor-pointer"
                        >
                          Language: {storyLanguage.toUpperCase()}
                        </button>
                        <button
                          onClick={toggleStoryTTS}
                          className={`h-9 w-9 rounded-full flex items-center justify-center shadow cursor-pointer ${
                            storyTTSPlaying ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          {storyTTSPlaying ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-slate-850 dark:text-slate-100">
                        {aiStory.title_en}
                      </h3>
                      <p className="text-xs font-bold text-indigo-500">
                        {aiStory.title_ta}
                      </p>

                      <div className="h-px bg-slate-100 dark:bg-slate-800" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div>
                          <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">English Read</h4>
                          <p className="text-sm font-semibold text-slate-650 dark:text-slate-300 leading-relaxed">
                            {aiStory.content_en}
                          </p>
                        </div>
                        <div className="border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                          <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">தமிழ் வடிவம்</h4>
                          <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 leading-relaxed">
                            {aiStory.content_ta}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => submitLessonCompletion(4, 5)}
                    className="w-full py-4.5 bg-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-indigo-600 shadow pt-3"
                  >
                    Finish Story reading! +5 Stars ⭐
                  </button>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 m-auto">
                  <span className="text-8xl block animate-bounce">📖</span>
                  <h3 className="text-lg font-black text-slate-400">Moral Storyboard</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-normal">
                    AI generated stories appear here. Generate a story on the left to start reading!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =============== ZONE 8: PARENTS LOGS =============== */}
        {activeZone === 'parents' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:w-full print:border-none print:shadow-none">
            
            {/* Subject breakdown & charts */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-600 shadow-md space-y-6 print:border-none print:shadow-none">
              <div className="flex justify-between items-center no-print">
                <h2 className="text-lg font-black text-slate-855 dark:text-slate-100 uppercase tracking-wider">
                  Junior Analytics Dashboard
                </h2>
                <button
                  onClick={printCertificate}
                  className="px-4.5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="h-4.5 w-4.5" /> Print Certificate
                </button>
              </div>

              {/* Progress percentages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'english', label: 'English Basics', color: 'from-emerald-400 to-emerald-500' },
                  { key: 'tamil', label: 'Tamil basics', color: 'from-pink-400 to-pink-500' },
                  { key: 'numbers', label: 'Numbers / Count', color: 'from-amber-400 to-amber-500' },
                  { key: 'pictures', label: 'Picture Vocabs', color: 'from-purple-400 to-purple-500' }
                ].map((item) => {
                  const subject = stats.subject_breakdown[item.key] || { completed: 0, total: 1, percentage: 0 };
                  return (
                    <div
                      key={item.key}
                      className="p-4.5 rounded-3xl border border-slate-100 bg-slate-50/50 dark:bg-slate-950/40 dark:border-slate-850 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                        <span className="text-xs font-black text-slate-850 dark:text-slate-200">{subject.percentage}%</span>
                      </div>
                      
                      <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${subject.percentage}%` }}
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        />
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 text-left">
                        {subject.completed} of {subject.total} items completed
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Custom SVG star logs line chart */}
              <div className="p-4.5 rounded-3xl border border-slate-100 bg-slate-50/50 dark:bg-slate-950/40 dark:border-slate-850 space-y-3 text-left">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Activity Stars Progress</h3>
                
                <div className="h-44 w-full flex items-end gap-2.5 pt-6 justify-between border-b border-slate-200 dark:border-slate-800 px-3">
                  {[12, 24, 18, 30, 45, 60, 85].map((stars, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-[10px] font-black text-emerald-500">{stars}⭐</span>
                      <div
                        style={{ height: `${(stars / 100) * 85}%` }}
                        className="w-full bg-gradient-to-t from-emerald-400 to-teal-400 rounded-t-lg transition-all"
                      />
                      <span className="text-[9px] font-bold text-slate-400">Day {idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent activity & Printable Certificate */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 border-slate-200 dark:border-slate-600 shadow-md space-y-6 print:border-none print:shadow-none">
              <h3 className="text-lg font-black text-slate-855 dark:text-slate-100 uppercase tracking-wider text-left no-print">
                Recent Activity
              </h3>

              <div className="space-y-3 max-h-52 overflow-y-auto no-print">
                {stats.recent_activity.length > 0 ? (
                  stats.recent_activity.map((act, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 rounded-2xl border border-slate-100 bg-slate-50/30 dark:bg-slate-950/30 text-left"
                    >
                      <div>
                        <h5 className="text-xs font-black text-slate-700 dark:text-slate-350">{act.title_en}</h5>
                        <p className="text-[9px] font-semibold text-slate-400">
                          {act.category} • {new Date(act.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs font-black text-emerald-500">+{act.stars}⭐</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-bold text-slate-400 text-center py-6">No recent completed activities found.</p>
                )}
              </div>

              {/* Printable Junior Scholar Certificate layout */}
              <div className="border-4 border-double border-yellow-500 p-5 rounded-3xl bg-amber-50/10 dark:bg-slate-950 text-center space-y-5 shadow-inner relative overflow-hidden print:border-8 print:border-yellow-600 print:w-[6.5in] print:h-[9in] print:mx-auto print:bg-white print:my-0">
                <div className="absolute top-0 right-0 h-24 w-24 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />
                
                <h4 className="text-[10px] font-black uppercase tracking-widest text-yellow-600">
                  BuddyLearn AI Junior Academy
                </h4>
                
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-255 uppercase tracking-tight print:text-3xl">
                    Certificate of Excellence
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 italic">
                    This is proudly presented to
                  </p>
                </div>

                <div className="py-2 border-b-2 border-slate-300 w-44 mx-auto">
                  <h2 className="text-lg font-black text-indigo-600 print:text-2xl">
                    Junior Scholar
                  </h2>
                </div>

                <p className="text-[9px] font-semibold text-slate-500 leading-normal max-w-xs mx-auto">
                  For completing early child-development lessons in English Alphabets, Tamil Uyir/Mei Letters, and Numbers grids, earning a total of
                </p>
                
                <div className="text-2xl font-black text-emerald-600 animate-pulse">
                  {stats.total_stars} Stars 🌟
                </div>

                <div className="flex justify-between items-center pt-2 text-[8px] font-black text-slate-400 uppercase tracking-wider px-6">
                  <div>
                    <p className="border-t border-slate-300 pt-1">Date</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="border-t border-slate-300 pt-1">Authorized by</p>
                    <p className="font-bold text-indigo-500">BuddyLearn AI</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ==================== REWARDS OVERLAY CLAIMS POPUP ==================== */}
      <AnimatePresence>
        {rewardClaimed && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 no-print">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-white dark:bg-slate-800 border-4 border-yellow-400 rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-2xl relative"
            >
              <span className="text-7xl block animate-bounce">🎉</span>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                  Awesome Job!
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  You Completed the Lesson!
                </p>
              </div>

              {/* Awarded Badges counts */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950 p-4.5 rounded-3xl border border-slate-100 dark:border-slate-800/40">
                <div className="text-center">
                  <span className="block text-2xl">🏆</span>
                  <p className="text-xs font-black text-indigo-500">+{rewardClaimed.xp} XP</p>
                </div>
                <div className="text-center">
                  <span className="block text-2xl">🪙</span>
                  <p className="text-xs font-black text-yellow-500">+{rewardClaimed.coins} Coins</p>
                </div>
                <div className="text-center">
                  <span className="block text-2xl">⭐</span>
                  <p className="text-xs font-black text-emerald-500">+{rewardClaimed.stars} Stars</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-black text-orange-500 flex items-center justify-center gap-1">
                  🔥 Streak Count: {rewardClaimed.streak} Days!
                </p>
                <p className="text-[10px] font-bold text-slate-400">
                  Your streak increases when you complete activities daily!
                </p>
              </div>

              <button
                onClick={() => setRewardClaimed(null)}
                className="w-full py-4.5 bg-emerald-400 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-500 shadow transition-all cursor-pointer"
              >
                Claim Rewards! 🏆
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
