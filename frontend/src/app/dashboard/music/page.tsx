"use client";

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Filter, 
  RotateCw, 
  ChevronRight, 
  ChevronLeft, 
  Bookmark, 
  Heart, 
  Play, 
  Pause, 
  Award, 
  Flame, 
  Coins, 
  Trophy, 
  HelpCircle, 
  Star, 
  History, 
  Compass, 
  Volume2, 
  VolumeX, 
  Music,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Clock,
  ChevronUp,
  Maximize2,
  ListMusic,
  Plus,
  PlayCircle
} from 'lucide-react';

interface Track {
  id: number;
  title_en: string;
  title_ta: string;
  artist: string;
  category: string;
  audio_url: string;
  is_rhyme: boolean;
  illustration_emoji: string;
  lyrics_en: string;
  lyrics_ta: string;
  lyrics_sync: { time: number; text_en: string; text_ta: string }[];
  melody_notes: { note: string; duration: number }[];
  play_count: number;
}

interface Playlist {
  id: number;
  name: string;
  created_at: string;
  tracks: any[];
}

interface Interaction {
  track_id: number;
  title_en: string;
  title_ta: string;
  artist: string;
  category: string;
  illustration_emoji: string;
  is_favorite: boolean;
  is_liked: boolean;
  play_progress: number;
  last_played: string;
}

const NOTE_FREQ: { [key: string]: number } = {
  "C3": 130.81, "D3": 146.83, "E3": 164.81, "F3": 174.61, "G3": 196.00, "A3": 220.00, "B3": 246.94,
  "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00, "A4": 440.00, "B4": 493.88,
  "C5": 523.25, "D5": 587.33, "E5": 659.25, "F5": 698.46, "G5": 783.99, "A5": 880.00, "B5": 987.77
};

const CATEGORIES = [
  "Tamil Songs", "English Songs", "Melody Songs", "Motivational Songs",
  "Folk Songs", "Classical Songs", "Study Music", "Sleep Music", "Relaxing Music"
];

const KIDS_CATEGORIES = [
  "Tamil Rhymes", "English Rhymes", "Alphabet Songs (A-Z)", "Bedtime Lullabies"
];

export default function AIMusicHub() {
  const [activeTab, setActiveTab] = useState<'hub' | 'kids' | 'library'>('hub');
  
  // Catalog & Recommendations
  const [tracks, setTracks] = useState<Track[]>([]);
  const [recommended, setRecommended] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [rhymeFilter, setRhymeFilter] = useState<'All' | 'Songs' | 'Rhymes'>('All');
  const [loading, setLoading] = useState(true);

  // User Stats & Streaks
  const [stats, setStats] = useState({ level: 1, xp: 0, coins: 0, streak: 0 });
  const [history, setHistory] = useState<Interaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Main Audio Player States
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1.0 | 1.5 | 2.0>(1.0);
  const [loop, setLoop] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null); // minutes
  const [sleepTimeLeft, setSleepTimeLeft] = useState<number | null>(null); // seconds
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  
  // Bilingual controls
  const [isTamil, setIsTamil] = useState(false);

  // Active Queue
  const [playQueue, setPlayQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);

  // Kids Zone States
  const [gameLoading, setGameLoading] = useState(false);
  const [gameChallenge, setGameChallenge] = useState<any>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedGameAnswer, setSelectedGameAnswer] = useState<string | null>(null);
  const [gameFeedback, setGameFeedback] = useState('');
  const [gameRewards, setGameRewards] = useState<any>(null);
  const [stars, setStars] = useState(0);

  // Piano Compose game state
  const [composeSequence, setComposeSequence] = useState<string[]>([]);
  const [composeFeedback, setComposeFeedback] = useState('');
  const [targetCompose] = useState(['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4']); // Twinkle sequence
  const [composeStep, setComposeStep] = useState(0);

  // References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<any>(null);
  const synthStartTimeRef = useRef<number>(0);
  const synthNotesRef = useRef<any[]>([]);
  const synthCurrentIndexRef = useRef<number>(0);
  const synthElapsedRef = useRef<number>(0);
  const sleepTimerIdRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // Singing refs
  const currentTrackRef = useRef<Track | null>(null);
  const synthLyricIndexRef = useRef<number>(0);
  const isTamilRef = useRef<boolean>(isTamil);

  useEffect(() => {
    isTamilRef.current = isTamil;
  }, [isTamil]);

  // Fetch lists
  useEffect(() => {
    fetchTracks();
    fetchStats();
    fetchHistory();
    fetchPlaylists();
    fetchRecommendations('happy');
  }, [categoryFilter, rhymeFilter]);

  // Handle sleep timer countdown
  useEffect(() => {
    if (sleepTimeLeft !== null && sleepTimeLeft > 0 && isPlaying) {
      const timer = setTimeout(() => {
        setSleepTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (sleepTimeLeft === 0) {
      pauseMusic();
      setSleepTimer(null);
      setSleepTimeLeft(null);
    }
  }, [sleepTimeLeft, isPlaying]);

  // Equalizer canvas drawing
  useEffect(() => {
    if (isPlayerExpanded && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const resize = () => {
        canvas.width = canvas.parentElement?.clientWidth || 300;
        canvas.height = 80;
      };
      resize();
      
      let animationFrameId: number;
      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const numBars = 24;
        const barWidth = (canvas.width / numBars) - 2;
        
        // Draw equalizer bars
        for (let i = 0; i < numBars; i++) {
          let height = 5;
          if (isPlaying) {
            // Generate rhythmic peaks synced loosely to the speed and time
            const speedFreq = 0.08 + (i * 0.05);
            height = 10 + Math.abs(Math.sin((Date.now() * 0.005) + (i * 0.4))) * 45;
          }
          
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - height);
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(0.5, '#a855f7');
          gradient.addColorStop(1, '#ec4899');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(i * (barWidth + 2), canvas.height - height, barWidth, height);
        }
        
        animationFrameId = requestAnimationFrame(render);
      };
      render();
      
      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [isPlayerExpanded, isPlaying]);

  // Clean up timers & synthesizer
  useEffect(() => {
    return () => {
      stopSynthPlayer();
      if (sleepTimerIdRef.current) clearTimeout(sleepTimerIdRef.current);
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Automatic lyrics scrolling (Spotify style)
  const activeLyricLine = currentTrack && currentTrack.lyrics_sync ? (() => {
    const lines = currentTrack.lyrics_sync;
    let active = lines[0];
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) active = lines[i];
    }
    return active;
  })() : null;

  useEffect(() => {
    if (lyricsContainerRef.current && isPlayerExpanded) {
      const activeEl = lyricsContainerRef.current.querySelector('.active-lyric') as HTMLElement;
      if (activeEl) {
        lyricsContainerRef.current.scrollTo({
          top: activeEl.offsetTop - lyricsContainerRef.current.clientHeight / 2 + activeEl.clientHeight / 2,
          behavior: 'smooth'
        });
      }
    }
  }, [activeLyricLine?.time, isPlayerExpanded]);

  const speakLyric = (phrase: string, lang: 'en' | 'ta' = 'en') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = lang === 'ta' ? 'ta-IN' : 'en-US';
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.2; // Slightly higher pitch for singing effect
    
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.startsWith(lang));
    if (targetVoice) utterance.voice = targetVoice;

    window.speechSynthesis.speak(utterance);
  };

  // API Callers
  const fetchTracks = async () => {
    setLoading(true);
    try {
      const filterRhyme = rhymeFilter === 'Rhymes' ? 'true' : rhymeFilter === 'Songs' ? 'false' : '';
      const response = await api.get(`/music?category=${categoryFilter}&is_rhyme=${filterRhyme}&search=${searchTerm}`);
      setTracks(response.data || []);
    } catch (error) {
      console.error("Failed to load tracks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (mood: string) => {
    try {
      const response = await api.post('/music/recommend', { mood });
      setRecommended(response.data || []);
    } catch (error) {
      console.error("Failed to load mood recommendations:", error);
    }
  };

  const fetchStats = async () => {
    try {
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
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await api.get('/music/history');
      if (response.data) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error("Failed to load music play history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await api.get('/music/playlists');
      setPlaylists(response.data || []);
    } catch (error) {
      console.error("Failed to fetch playlists:", error);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      const response = await api.post('/music/playlists', { name: newPlaylistName });
      setPlaylists(prev => [...prev, response.data]);
      setNewPlaylistName('');
    } catch (error) {
      console.error("Failed to create playlist:", error);
    }
  };

  const addTrackToPlaylist = async (playlistId: number, trackId: number) => {
    try {
      await api.post('/music/playlists', { playlist_id: playlistId, track_id: trackId });
      fetchPlaylists();
    } catch (error) {
      console.error("Failed to append track to playlist:", error);
    }
  };

  const handleToggleFavorite = async (trackId: number, currentFav: boolean) => {
    try {
      await api.post('/music/interaction', { track_id: trackId, is_favorite: !currentFav });
      fetchHistory();
      fetchTracks();
    } catch (error) {
      console.error("Failed to toggle favorite status:", error);
    }
  };

  const handleToggleLike = async (trackId: number, currentLike: boolean) => {
    try {
      await api.post('/music/interaction', { track_id: trackId, is_liked: !currentLike });
      fetchHistory();
      fetchTracks();
    } catch (error) {
      console.error("Failed to toggle like status:", error);
    }
  };

  // Playback Control Actions
  const playTrack = (track: Track, newQueue: Track[] = []) => {
    stopSynthPlayer();
    setCurrentTrack(track);
    currentTrackRef.current = track;
    setIsPlaying(true);
    setCurrentTime(0);
    setIsPlayerExpanded(true); // Auto-expand to show moving lyrics

    // Save interaction start
    api.post('/music/interaction', { track_id: track.id, play_progress: 0.1 }).catch(e => console.error("Interaction save failed", e));

    // Build queue context
    if (newQueue.length > 0) {
      setPlayQueue(newQueue);
      const idx = newQueue.findIndex(t => t.id === track.id);
      setQueueIndex(idx >= 0 ? idx : 0);
    } else {
      setPlayQueue([track]);
      setQueueIndex(0);
    }

    // Trigger companion play event
    window.dispatchEvent(new CustomEvent('music-play', {
      detail: { title: track.title_en }
    }));

    // Start Web Audio procedural chiptune synth player
    if (track.melody_notes) {
      startSynthPlayer(track.melody_notes);
    }
  };

  const pauseMusic = () => {
    setIsPlaying(false);
    pauseSynthPlayer();
  };

  const resumeMusic = () => {
    setIsPlaying(true);
    resumeSynthPlayer();
  };

  const handleNextTrack = () => {
    if (playQueue.length === 0) return;
    let nextIdx = queueIndex + 1;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * playQueue.length);
    }
    if (nextIdx < playQueue.length) {
      setQueueIndex(nextIdx);
      playTrack(playQueue[nextIdx], playQueue);
    } else if (loop) {
      setQueueIndex(0);
      playTrack(playQueue[0], playQueue);
    } else {
      setIsPlaying(false);
      stopSynthPlayer();
    }
  };

  const handlePrevTrack = () => {
    if (playQueue.length === 0) return;
    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0) {
      setQueueIndex(prevIdx);
      playTrack(playQueue[prevIdx], playQueue);
    }
  };

  const handleScrubChange = (value: number) => {
    setCurrentTime(value);
    synthElapsedRef.current = value;
    if (audioCtxRef.current) {
      synthStartTimeRef.current = audioCtxRef.current.currentTime - value;
      // Recalculate notes sequence offset index
      const elapsed = value;
      let cumulative = 0;
      let matchedIdx = 0;
      for (let i = 0; i < synthNotesRef.current.length; i++) {
        if (elapsed >= cumulative) {
          matchedIdx = i;
        }
        cumulative += synthNotesRef.current[i].duration;
      }
      synthCurrentIndexRef.current = matchedIdx;

      // Recalculate lyric index
      if (currentTrackRef.current && currentTrackRef.current.lyrics_sync) {
        let lIdx = 0;
        for (let i = 0; i < currentTrackRef.current.lyrics_sync.length; i++) {
           if (elapsed >= currentTrackRef.current.lyrics_sync[i].time) {
               lIdx = i + 1;
           }
        }
        synthLyricIndexRef.current = lIdx;
        if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
      }
    }
  };

  // Sleep Timer Configuration
  const handleSleepTimerSelect = (mins: number) => {
    setSleepTimer(mins);
    setSleepTimeLeft(mins * 60);
  };

  // Synthesizer loops
  const startSynthPlayer = (notes: { note: string; duration: number }[]) => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      synthNotesRef.current = notes;
      synthCurrentIndexRef.current = 0;
      synthElapsedRef.current = 0;

      let cumulative = 0;
      const processed = notes.map(n => {
        const start = cumulative;
        cumulative += n.duration;
        return { ...n, startTime: start, endTime: cumulative };
      });
      synthNotesRef.current = processed;
      setDuration(cumulative);

      synthStartTimeRef.current = ctx.currentTime;
      window.dispatchEvent(new CustomEvent('music-dance'));
      synthLyricIndexRef.current = 0;
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();

      const tick = 50;
      synthIntervalRef.current = setInterval(() => {
        const elapsed = ctx.currentTime - synthStartTimeRef.current;
        synthElapsedRef.current = elapsed;
        setCurrentTime(elapsed);

        if (elapsed >= cumulative) {
          handleNextTrack();
          return;
        }

        // Handle lyrics speaking (singing)
        if (currentTrackRef.current && currentTrackRef.current.lyrics_sync) {
            const lines = currentTrackRef.current.lyrics_sync;
            if (synthLyricIndexRef.current < lines.length) {
               const nextLyr = lines[synthLyricIndexRef.current];
               if (elapsed >= nextLyr.time) {
                  const txt = isTamilRef.current ? nextLyr.text_ta : nextLyr.text_en;
                  const lang = isTamilRef.current ? 'ta' : 'en';
                  speakLyric(txt, lang);
                  synthLyricIndexRef.current++;
               }
            }
        }

        processed.forEach((n, idx) => {
          if (elapsed >= n.startTime && elapsed < n.endTime && idx >= synthCurrentIndexRef.current) {
            synthCurrentIndexRef.current = idx + 1;
            playSynthNote(n.note, n.duration / playbackSpeed);
          }
        });
      }, tick);
    } catch (_) {}
  };

  const pauseSynthPlayer = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    window.dispatchEvent(new CustomEvent('music-stop'));
  };

  const resumeSynthPlayer = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    synthStartTimeRef.current = ctx.currentTime - synthElapsedRef.current;
    window.dispatchEvent(new CustomEvent('music-dance'));

    const cumulative = duration;
    const processed = synthNotesRef.current;
    const tick = 50;

    synthIntervalRef.current = setInterval(() => {
      const elapsed = ctx.currentTime - synthStartTimeRef.current;
      synthElapsedRef.current = elapsed;
      setCurrentTime(elapsed);

      if (elapsed >= cumulative) {
        handleNextTrack();
        return;
      }

      // Handle lyrics speaking (singing)
      if (currentTrackRef.current && currentTrackRef.current.lyrics_sync) {
          const lines = currentTrackRef.current.lyrics_sync;
          if (synthLyricIndexRef.current < lines.length) {
             const nextLyr = lines[synthLyricIndexRef.current];
             if (elapsed >= nextLyr.time) {
                const txt = isTamilRef.current ? nextLyr.text_ta : nextLyr.text_en;
                const lang = isTamilRef.current ? 'ta' : 'en';
                speakLyric(txt, lang);
                synthLyricIndexRef.current++;
             }
          }
      }

      processed.forEach((n, idx) => {
        if (elapsed >= n.startTime && elapsed < n.endTime && idx >= synthCurrentIndexRef.current) {
          synthCurrentIndexRef.current = idx + 1;
          playSynthNote(n.note, n.duration / playbackSpeed);
        }
      });
    }, tick);
  };

  const playSynthNote = (note: string, durationSec: number) => {
    if (!audioCtxRef.current || isMuted) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      // Warm synth tone
      osc.type = 'triangle';
      const freq = NOTE_FREQ[note] || 261.63;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec - 0.02);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + durationSec);
    } catch (_) {}
  };

  const stopSynthPlayer = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    synthCurrentIndexRef.current = 0;
    synthElapsedRef.current = 0;
    synthLyricIndexRef.current = 0;
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    window.dispatchEvent(new CustomEvent('music-stop'));
  };

  // Kids Zone Interactive Games Methods
  const loadKidsGame = async () => {
    setGameLoading(true);
    setGameCompleted(false);
    setSelectedGameAnswer(null);
    setGameFeedback('');
    setGameRewards(null);
    try {
      const response = await api.get('/music/kids-challenge');
      setGameChallenge(response.data);
    } catch (error) {
      console.error("Failed to load kids musical game:", error);
    } finally {
      setGameLoading(false);
    }
  };

  const handleGameSelect = (opt: string) => {
    if (selectedGameAnswer !== null) return;
    setSelectedGameAnswer(opt);
    const correct = gameChallenge.correct_answer;
    
    if (opt === correct) {
      setGameFeedback("Awesome! That is correct! 🌟");
      setStars(prev => prev + 1);
      window.dispatchEvent(new CustomEvent('vocab-correct'));
    } else {
      setGameFeedback("Oh, not quite! Try again next time. 🌱");
      window.dispatchEvent(new CustomEvent('vocab-wrong'));
    }
  };

  const playAnimalSound = () => {
    if (!gameChallenge || gameChallenge.type !== 'sound') return;
    playAnimalSoundSynth(gameChallenge.sound_type);
  };

  const playAnimalSoundSynth = (soundType: string) => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      
      if (soundType === 'chirp') {
        // Bird chirp frequency sweep
        for (let i = 0; i < 3; i++) {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          osc.type = 'sine';
          const startTime = now + i * 0.25;
          const endTime = startTime + 0.15;
          
          osc.frequency.setValueAtTime(2200, startTime);
          osc.frequency.exponentialRampToValueAtTime(3800, endTime);
          
          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(0.08, startTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, endTime);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(endTime);
        }
      } 
      else if (soundType === 'meow') {
        // Cat meow frequency slide
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'triangle';
        const duration = 0.6;
        
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.25);
        osc.frequency.exponentialRampToValueAtTime(500, now + duration);
        
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.08);
        gainNode.gain.linearRampToValueAtTime(0.06, now + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(now + duration);
      } 
      else if (soundType === 'cricket_pulse') {
        // Cricket high-pitch modulated chirp
        const duration = 0.8;
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(3600, now);

        const chirpGain = ctx.createGain();
        chirpGain.gain.setValueAtTime(0, now);

        const mod = ctx.createOscillator();
        mod.type = 'square';
        mod.frequency.setValueAtTime(12, now);

        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(0.4, now);

        mod.connect(modGain);
        modGain.connect(chirpGain.gain);

        const mainGain = ctx.createGain();
        mainGain.gain.setValueAtTime(0.08, now);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(chirpGain);
        chirpGain.connect(mainGain);
        mainGain.connect(ctx.destination);

        osc.start();
        mod.start();
        osc.stop(now + duration);
        mod.stop(now + duration);
      } 
      else if (soundType === 'trumpet') {
        // Elephant harsh trumpet sweep
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sawtooth';
        
        const duration = 0.7;
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.linearRampToValueAtTime(450, now + 0.2);
        osc.frequency.linearRampToValueAtTime(200, now + duration);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.06, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(now + duration);
      }
    } catch (_) {}
  };

  const submitKidsGame = async () => {
    try {
      const response = await api.post('/music/kids-submit', {
        is_correct: selectedGameAnswer === gameChallenge.correct_answer
      });
      setGameRewards(response.data);
      setGameCompleted(true);
      fetchStats();
      
      // Dispatch celebration confetti
      window.dispatchEvent(new CustomEvent('task-completed', {
        detail: { type: 'music-game', topic: 'Kids Sing-Along Game' }
      }));
    } catch (error) {
      console.error("Failed to submit kids musical challenge:", error);
    }
  };

  // Play piano compose notes
  const playPianoKey = (note: string) => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(NOTE_FREQ[note] || 261.63, ctx.currentTime);

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);

      // Verify sequence target
      const expected = targetCompose[composeStep];
      if (note === expected) {
        const nextStep = composeStep + 1;
        setComposeStep(nextStep);
        setComposeSequence(prev => [...prev, note]);
        
        if (nextStep >= targetCompose.length) {
          // Completed Twinkle melody
          setComposeFeedback("Purrrfect! You composed 'Twinkle Twinkle' melody! 🎉 +20 XP!");
          api.post('/music/kids-submit', { is_correct: true });
          setStars(prev => prev + 2);
          setComposeStep(0);
          setComposeSequence([]);
        } else {
          setComposeFeedback(`Good job! Next key: ${targetCompose[nextStep]}`);
        }
      } else {
        setComposeStep(0);
        setComposeSequence([]);
        setComposeFeedback(`Oops, wrong key! Let's start over from: ${targetCompose[0]}`);
      }
    } catch (_) {}
  };

  // Helper for synchronized lyric highlight
  const getActiveLyricLine = () => {
    if (!currentTrack || !currentTrack.lyrics_sync) return null;
    const lines = currentTrack.lyrics_sync;
    let active = lines[0];
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) {
        active = lines[i];
      }
    }
    return active;
  };

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 select-none">
      
      {/* Premium Glass Header */}
      <div className="relative overflow-hidden bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">BuddyLearn AI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-white">
            AI Music & Rhymes Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Discover mood-based Tamil & English songs, nursery rhymes, sleep lullabies, and educational sing-alongs.
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
          <div className="flex items-center gap-1.5" title="Stars Balance">
            <Star className="h-4.5 w-4.5 text-yellow-500 fill-current animate-pulse" />
            <div className="text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Stars</p>
              <p className="text-xs font-black text-slate-700 dark:text-slate-200 leading-normal">{stars}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center p-1.5 bg-slate-100/50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600/30 rounded-2xl max-w-md mx-auto">
        {(['hub', 'kids', 'library'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'kids' && !gameChallenge) loadKidsGame();
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-800 text-indigo-500 dark:text-white shadow-lg border-2 border-slate-200 dark:border-slate-600'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab === 'hub' && 'Music Hub'}
            {tab === 'kids' && 'Children\'s Zone'}
            {tab === 'library' && 'My Playlists'}
          </button>
        ))}
      </div>

      {/* TABS CONTAINER PANELS */}
      <AnimatePresence mode="wait">
        
        {/* MUSIC HUB TAB */}
        {activeTab === 'hub' && (
          <motion.div
            key="hub-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-8"
          >
            {/* FEATURED ADVERTISING BANNER CAROUSEL */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 rounded-3xl p-6 sm:p-10 shadow-2xl text-white text-left flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-4 max-w-xl">
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white/20 uppercase tracking-widest border border-white/10">
                  Featured Recommendation
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                  Mood-Based Playlists
                </h2>
                <p className="text-xs font-bold opacity-90 leading-relaxed max-w-md">
                  Choose your mood and let BuddyLearn compile study tracks, sleep sleep lullabies, or energetic motivates.
                </p>
                <div className="flex gap-2.5 pt-2 flex-wrap">
                  {['Happy', 'Relaxing', 'Sleep', 'Study', 'Motivational'].map((m) => (
                    <button
                      key={m}
                      onClick={() => fetchRecommendations(m)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-black transition-all cursor-pointer"
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-7xl select-none animate-bounce">🎵</span>
            </div>

            {/* RECOMMENDATIONS CAROUSEL */}
            {recommended.length > 0 && (
              <div className="space-y-4 text-left">
                <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="h-5.5 w-5.5 text-indigo-500" /> AI Suggested Mood Hits
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                  {recommended.map((track) => (
                    <div
                      key={`rec-${track.id}`}
                      onClick={() => playTrack(track, recommended)}
                      className="w-56 shrink-0 bg-white/60 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-4 shadow-md backdrop-blur-md hover:scale-[1.02] cursor-pointer transition-all flex flex-col justify-between gap-4 h-44 group"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-2xl p-1.5 rounded-xl bg-indigo-500/10">
                            {track.illustration_emoji || '🎵'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                            {track.category}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-white truncate">
                          {track.title_en}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold truncate">
                          By {track.artist}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2 shrink-0">
                        <span>Chiptune Synth</span>
                        <PlayCircle className="h-4.5 w-4.5 text-indigo-500 group-hover:scale-110 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FILTERS & SEARCH ROW */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Category buttons list */}
              <div className="md:col-span-8 flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  onClick={() => setCategoryFilter('All')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
                    categoryFilter === 'All'
                      ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/15'
                      : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  🌍 All Music
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/15'
                        : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="md:col-span-4 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search songs, artists, lyrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchTracks()}
                  className="w-full bg-slate-100/50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600/80 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* TRACKS LIST GRID */}
            <div className="space-y-4 text-left">
              <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Music Library</h3>
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : tracks.length === 0 ? (
                <div className="p-10 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-slate-200 dark:border-slate-600 text-slate-400 font-semibold text-xs leading-relaxed">
                  No music matches found. Use reset filters.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, tracks)}
                      className="bg-white/60 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-4 shadow-sm backdrop-blur-md hover:scale-[1.01] hover:border-indigo-500/50 cursor-pointer transition-all flex justify-between items-center gap-4 group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-3xl p-2 rounded-xl bg-indigo-500/10 shrink-0">
                          {track.illustration_emoji || '🎵'}
                        </span>
                        <div className="text-left overflow-hidden">
                          <h4 className="font-extrabold text-xs text-slate-800 dark:text-white truncate">
                            {track.title_en}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold truncate">
                            {track.artist}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">
                            {track.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(track.id, false);
                          }}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                        >
                          <Bookmark className="h-4 w-4" />
                        </button>
                        <PlayCircle className="h-6 w-6 text-indigo-500 shrink-0 group-hover:scale-110 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* CHILDREN'S ZONE TAB */}
        {activeTab === 'kids' && (
          <motion.div
            key="kids-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-8"
          >
            {/* Colorful child banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-10 shadow-2xl text-white text-left flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-4 max-w-xl">
                <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white/20 uppercase tracking-widest border border-white/10">
                  Sing-Along Zone
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                  Rhymes & Play Zone
                </h2>
                <p className="text-xs font-bold opacity-90 leading-relaxed max-w-md">
                  Practice English and Tamil alphabet letters, shapes, numbers, or play the sound guesser games to earn reward stars!
                </p>
              </div>
              <span className="text-7xl select-none animate-bounce">🦄</span>
            </div>

            {/* Sub-grid: Musical Compose Keys & Guess the Sound Quiz */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Compose Keys Game */}
              <div className="md:col-span-7 bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between gap-6 text-left">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <ListMusic className="h-5 w-5 text-amber-500 animate-pulse" /> Compose a Song Keypad
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Follow the notes guide to compose "Twinkle Twinkle Little Star":
                  </p>
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                    <p className="text-xs font-black text-amber-600 dark:text-amber-400">
                      Melody Guide: C4, C4, G4, G4, A4, A4, G4
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                      {composeFeedback || `Press key: ${targetCompose[composeStep]}`}
                    </p>
                  </div>
                </div>

                {/* Synth Keypad row */}
                <div className="flex gap-2 justify-center py-4 select-none">
                  {['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].map((note) => {
                    const isNextExpected = targetCompose[composeStep] === note;
                    return (
                      <button
                        key={note}
                        onClick={() => playPianoKey(note)}
                        className={`w-10 sm:w-12 h-28 sm:h-32 rounded-b-xl border transition-all cursor-pointer flex flex-col justify-end pb-3 text-center shadow-lg ${
                          isNextExpected
                            ? 'bg-amber-400 border-amber-500 text-white animate-pulse scale-[1.03]'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <span className="text-[10px] font-black tracking-tighter block">{note}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guess the Sound Quiz */}
              <div className="md:col-span-5 bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between text-center space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-1.5 justify-center">
                    <HelpCircle className="h-5 w-5 text-indigo-500" /> Animal Sound Quiz
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Listen to the chiptune sound effect and choose!
                  </p>
                </div>

                {gameLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                  </div>
                ) : gameChallenge ? (
                  <div className="space-y-4 w-full">
                    {gameChallenge.type === 'sound' ? (
                      <div>
                        <button
                          onClick={playAnimalSound}
                          className="px-6 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 cursor-pointer transition-all flex items-center gap-2 mx-auto"
                        >
                          🔊 Hear Soundscape
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs font-black text-slate-700 dark:text-slate-300">
                        {gameChallenge.question_en}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2.5">
                      {gameChallenge.options.map((opt: string) => {
                        const isSelected = selectedGameAnswer === opt;
                        const correct = gameChallenge.correct_answer;
                        const isCorrect = opt === correct;

                        let style = "bg-white/60 border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300";
                        if (selectedGameAnswer !== null) {
                          if (isCorrect) {
                            style = "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400";
                          } else if (isSelected) {
                            style = "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-400";
                          } else {
                            style = "opacity-50 border-slate-100 bg-slate-50 text-slate-400 cursor-default";
                          }
                        }

                        return (
                          <button
                            key={opt}
                            disabled={selectedGameAnswer !== null}
                            onClick={() => handleGameSelect(opt)}
                            className={`p-3 rounded-xl border text-xs font-black transition-all cursor-pointer ${style}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {selectedGameAnswer !== null && (
                      <div className="space-y-3 pt-2">
                        <p className="text-xs font-black text-indigo-500">{gameFeedback}</p>
                        <button
                          onClick={submitKidsGame}
                          className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow cursor-pointer transition-all"
                        >
                          Claim Rewards
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={loadKidsGame}
                    className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white text-xs font-black tracking-wider cursor-pointer"
                  >
                    Start Game
                  </button>
                )}

                {gameCompleted && gameRewards && (
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl w-full text-left space-y-1">
                    <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">Challenge Saved!</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      +{gameRewards.xp_reward} XP, +{gameRewards.coin_reward} Coins added to profile.
                    </p>
                    <button
                      onClick={loadKidsGame}
                      className="text-[9px] font-black text-indigo-500 hover:underline mt-1 block cursor-pointer"
                    >
                      Next Challenge →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RHYMES CAROUSEL FILTERS */}
            <div className="space-y-4 text-left">
              <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Kids Learning Rhymes</h3>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  onClick={() => setCategoryFilter('All')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
                    categoryFilter === 'All'
                      ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/15'
                      : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  🌍 All Rhymes
                </button>
                {KIDS_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/15'
                        : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {tracks.filter(t => t.is_rhyme).map((track) => (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track, tracks.filter(t => t.is_rhyme))}
                      className="bg-white/60 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-600 rounded-2xl p-4 shadow-sm backdrop-blur-md hover:scale-[1.01] hover:border-indigo-500/50 cursor-pointer transition-all flex justify-between items-center gap-4 group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span className="text-3xl p-2 rounded-xl bg-amber-500/10 shrink-0">
                          {track.illustration_emoji || '👶'}
                        </span>
                        <div className="text-left overflow-hidden">
                          <h4 className="font-extrabold text-xs text-slate-800 dark:text-white truncate">
                            {track.title_en}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold truncate">
                            {track.artist}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[8px] font-black bg-amber-500/10 text-amber-500 dark:text-amber-400 uppercase tracking-widest">
                            {track.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <PlayCircle className="h-6 w-6 text-amber-500 shrink-0 group-hover:scale-110 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* MY LIBRARY TAB */}
        {activeTab === 'library' && (
          <motion.div
            key="library-tab"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-8"
          >
            {/* Custom Playlists builder */}
            <div className="bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl text-left space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <ListMusic className="h-5.5 w-5.5 text-indigo-500" /> Create Custom Playlist
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Create personal playlists of your study or relaxing tracks.</p>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g. Morning Focus, Baby Lullaby..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="flex-1 bg-slate-100/50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600/80 rounded-2xl py-2.5 px-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-all text-slate-800 dark:text-white"
                />
                <button
                  onClick={createPlaylist}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow cursor-pointer transition-all"
                >
                  Create
                </button>
              </div>

              {/* Playlists grid */}
              {playlists.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold">No custom playlists created yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {playlists.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => setSelectedPlaylist(pl)}
                      className="p-4 bg-white/60 dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-600 rounded-2xl hover:scale-[1.01] transition-all cursor-pointer flex justify-between items-center"
                    >
                      <div className="text-left">
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-white truncate">{pl.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold">{pl.tracks?.length || 0} tracks</p>
                      </div>
                      <ListMusic className="h-5 w-5 text-indigo-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Playlist tracks drawer */}
            {selectedPlaylist && (
              <div className="bg-white/40 dark:bg-slate-900/40 border border-white/50 dark:border-slate-800/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl text-left space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-1">
                    📖 Playlist: <span className="text-indigo-500 font-black">{selectedPlaylist.name}</span>
                  </h4>
                  <button
                    onClick={() => setSelectedPlaylist(null)}
                    className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-pointer text-xs"
                  >
                    Close
                  </button>
                </div>
                {selectedPlaylist.tracks.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-4">This playlist has no tracks. Browse tracks and add them to playlists.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedPlaylist.tracks.map((t: any) => {
                      const original = tracks.find(tr => tr.id === t.id);
                      return (
                        <div
                          key={`pl-track-${t.id}`}
                          onClick={() => original && playTrack(original, selectedPlaylist.tracks.map(tk => tracks.find(x => x.id === tk.id) as Track))}
                          className="bg-white/60 dark:bg-slate-900/60 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 flex justify-between items-center cursor-pointer hover:border-indigo-500"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{t.illustration_emoji || '🎵'}</span>
                            <div className="text-left">
                              <h5 className="font-extrabold text-xs text-slate-800 dark:text-white truncate">{t.title_en}</h5>
                              <p className="text-[10px] text-slate-400 font-bold">{t.artist}</p>
                            </div>
                          </div>
                          <PlayCircle className="h-5 w-5 text-indigo-500" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Listening History log */}
            <div className="space-y-4 text-left">
              <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
                <History className="h-5.5 w-5.5 text-indigo-500" /> Recently Played
              </h3>
              {historyLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="p-10 text-center bg-white/40 dark:bg-slate-900/40 rounded-3xl border-2 border-slate-200 dark:border-slate-600 text-slate-400 font-semibold text-xs leading-relaxed">
                  No listening logs recorded.
                </div>
              ) : (
                <div className="bg-white/40 dark:bg-slate-900/40 border-2 border-slate-200 dark:border-slate-600 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md">
                  <table className="w-full text-xs font-semibold border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-widest text-[9px] bg-slate-50/50 dark:bg-slate-950/20">
                        <th className="py-3 px-4 text-left font-black">Song Title</th>
                        <th className="py-3 px-4 text-center font-black">Artist</th>
                        <th className="py-3 px-4 text-center font-black">Category</th>
                        <th className="py-3 px-4 text-right font-black">Play date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => {
                        const original = tracks.find(t => t.id === item.track_id);
                        return (
                          <tr
                            key={`hist-${item.track_id}`}
                            onClick={() => original && playTrack(original)}
                            className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 cursor-pointer transition-all text-slate-700 dark:text-slate-300"
                          >
                            <td className="py-3.5 px-4 font-extrabold flex items-center gap-2">
                              <span className="text-lg">{item.illustration_emoji || '🎵'}</span>
                              <span className="truncate max-w-[200px]">{item.title_en}</span>
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                              {item.artist}
                            </td>
                            <td className="py-3.5 px-4 text-center uppercase text-[9px] font-black text-indigo-500">
                              {item.category}
                            </td>
                            <td className="py-3.5 px-4 text-right text-slate-400 font-bold">
                              {new Date(item.last_played).toLocaleDateString()}
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

      {/* STICKY BOTTOM PLAYER CONTROLLER */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800/80 backdrop-blur-lg px-6 py-3.5 z-40 flex items-center justify-between gap-4 shadow-xl select-none">
          <div className="flex items-center gap-3 min-w-0 max-w-[220px]">
            <span className="text-3xl p-1 bg-indigo-500/10 rounded-xl shrink-0 animate-spin-slow">
              {currentTrack.illustration_emoji || '🎵'}
            </span>
            <div className="text-left overflow-hidden">
              <h4 className="font-extrabold text-xs truncate text-slate-800 dark:text-white">
                {isTamil ? currentTrack.title_ta || currentTrack.title_en : currentTrack.title_en}
              </h4>
              <p className="text-[10px] text-slate-400 font-bold truncate">By {currentTrack.artist}</p>
            </div>
          </div>

          {/* Central Controls */}
          <div className="flex-1 max-w-md flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-4.5">
              <button onClick={handlePrevTrack} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <SkipBack className="h-4.5 w-4.5" />
              </button>

              <button
                onClick={isPlaying ? pauseMusic : resumeMusic}
                className="w-9 h-9 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center cursor-pointer shadow shadow-indigo-500/15"
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current translate-x-0.5" />}
              </button>

              <button onClick={handleNextTrack} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <SkipForward className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Clickable progress slider */}
            <div className="w-full flex items-center gap-2">
              <span className="text-[9px] font-mono text-slate-400">{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={(e) => handleScrubChange(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[9px] font-mono text-slate-400">{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Actions & expand controls */}
          <div className="flex items-center gap-3">
            {/* Playlist add dropdown */}
            {playlists.length > 0 && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    addTrackToPlaylist(Number(e.target.value), currentTrack.id);
                    e.target.value = '';
                  }
                }}
                className="bg-slate-100 dark:bg-slate-800 py-1 px-2 rounded-lg text-[10px] font-black focus:outline-none border-none text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                <option value="">+ Playlist</option>
                {playlists.map(pl => (
                  <option key={pl.id} value={pl.id}>{pl.name}</option>
                ))}
              </select>
            )}

            <button
              onClick={() => setIsPlayerExpanded(true)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              title="Expand Karaoke Player"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* FULL EXPANDED PLAYER OVERLAY (vinyl & synchronized karaoke lyrics) */}
      <AnimatePresence>
        {isPlayerExpanded && currentTrack && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 150 }}
            className="fixed inset-0 bg-slate-900/95 z-50 flex flex-col justify-end text-white select-none pointer-events-auto"
          >
            {/* Expanded player wrapper */}
            <div className="w-full max-w-4xl mx-auto h-[92vh] bg-slate-900 rounded-t-[32px] border-t border-slate-800 shadow-2xl flex flex-col overflow-hidden">
              
              {/* Toolbar header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-1.5 bg-indigo-500/10 rounded-xl">{currentTrack.illustration_emoji || '🎵'}</span>
                  <div className="text-left">
                    <h3 className="font-extrabold text-sm sm:text-base truncate max-w-[280px]">
                      {isTamil ? currentTrack.title_ta || currentTrack.title_en : currentTrack.title_en}
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{currentTrack.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Language switch */}
                  <button
                    onClick={() => setIsTamil(!isTamil)}
                    className="px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-black uppercase transition-all cursor-pointer text-indigo-400"
                  >
                    {isTamil ? 'English Lyrics' : 'தமிழ் வரிகள்'}
                  </button>

                  {/* Sleep timer select */}
                  <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-0.5">
                    <span className="text-[9px] font-black text-slate-400 px-2 uppercase flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {sleepTimeLeft !== null ? `${Math.floor(sleepTimeLeft / 60)}m` : 'Sleep'}
                    </span>
                    <select
                      value={sleepTimer || ''}
                      onChange={(e) => handleSleepTimerSelect(Number(e.target.value))}
                      className="bg-transparent text-[10px] font-black text-slate-300 focus:outline-none pr-1.5 cursor-pointer"
                    >
                      <option value="" className="bg-slate-900">Off</option>
                      <option value={10} className="bg-slate-900">10m</option>
                      <option value={20} className="bg-slate-900">20m</option>
                      <option value={30} className="bg-slate-900">30m</option>
                      <option value={60} className="bg-slate-900">60m</option>
                    </select>
                  </div>

                  {/* Playback speed selector */}
                  <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-0.5">
                    <span className="text-[9px] font-black text-slate-400 px-2 uppercase">Speed</span>
                    <select
                      value={playbackSpeed}
                      onChange={(e) => {
                        const nextSpeed = Number(e.target.value) as any;
                        setPlaybackSpeed(nextSpeed);
                        if (isPlaying && currentTrack.melody_notes) {
                          // Restart synth with modified speed
                          stopSynthPlayer();
                          startSynthPlayer(currentTrack.melody_notes);
                        }
                      }}
                      className="bg-transparent text-[10px] font-black text-slate-300 focus:outline-none pr-1.5 cursor-pointer"
                    >
                      <option value={0.5} className="bg-slate-900">0.5x</option>
                      <option value={1.0} className="bg-slate-900">1.0x</option>
                      <option value={1.5} className="bg-slate-900">1.5x</option>
                      <option value={2.0} className="bg-slate-900">2.0x</option>
                    </select>
                  </div>

                  {/* Close expanded overlay */}
                  <button
                    onClick={() => setIsPlayerExpanded(false)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Main content grid */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center text-center">
                
                {/* Left side: vinyl rotating disk */}
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="relative w-56 h-56 flex items-center justify-center">
                    {/* Vinyl black disk */}
                    <motion.div
                      animate={isPlaying ? { rotate: 360 } : {}}
                      transition={isPlaying ? { repeat: Infinity, duration: 8, ease: 'linear' } : { duration: 0 }}
                      className="w-full h-full rounded-full bg-black border-8 border-slate-950 shadow-2xl flex items-center justify-center relative overflow-hidden"
                    >
                      {/* Groove lines */}
                      <div className="absolute inset-4 rounded-full border border-slate-900/50" />
                      <div className="absolute inset-8 rounded-full border border-slate-900/50" />
                      <div className="absolute inset-12 rounded-full border border-slate-900/50" />

                      {/* Center label */}
                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-inner border-2 border-slate-950 select-none">
                        {currentTrack.illustration_emoji || '🎵'}
                      </div>
                    </motion.div>
                  </div>

                  {/* Canvas equalizer wave */}
                  <div className="w-full bg-slate-950/20 border border-slate-800 rounded-2xl p-4">
                    <canvas ref={canvasRef} className="w-full h-20 block" />
                  </div>
                </div>

                {/* Right side: Scrolling synchronized lyrics (Karaoke mode) */}
                <div ref={lyricsContainerRef} className="h-64 sm:h-80 overflow-y-auto border border-slate-800 bg-slate-950/40 rounded-3xl p-6 flex flex-col items-center justify-start text-center relative scrollbar-thin scroll-smooth">
                  <div className="space-y-6 max-w-sm w-full py-28 transition-all">
                    {currentTrack.lyrics_sync && currentTrack.lyrics_sync.length > 0 ? (
                      currentTrack.lyrics_sync.map((line, idx) => {
                        const isActive = activeLyricLine && activeLyricLine.time === line.time;
                        return (
                          <motion.p
                            key={idx}
                            animate={isActive ? { scale: 1.15, opacity: 1 } : { scale: 0.95, opacity: 0.3 }}
                            className={`font-black text-lg sm:text-xl leading-relaxed transition-all ${
                              isActive ? 'text-indigo-400 active-lyric' : 'text-slate-500'
                            }`}
                          >
                            {isTamil ? line.text_ta || line.text_en : line.text_en}
                          </motion.p>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 font-bold">Karaoke synchronized lyrics not available for this instrumental track.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom controls panel */}
              <div className="px-6 py-6 border-t border-slate-800 bg-slate-950/40 flex flex-col gap-4 shrink-0">
                {/* Progress bar and time indicators */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-400">{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
                  <input
                    type="range"
                    min={0}
                    max={duration}
                    value={currentTime}
                    onChange={(e) => handleScrubChange(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-[10px] font-mono text-slate-400">{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  {/* Left triggers */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShuffle(!shuffle)}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${
                        shuffle ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Shuffle"
                    >
                      <Shuffle className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => setLoop(!loop)}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${
                        loop ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-white'
                      }`}
                      title="Loop"
                    >
                      <Repeat className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Play controller */}
                  <div className="flex items-center gap-5">
                    <button onClick={handlePrevTrack} className="text-slate-400 hover:text-white transition-all cursor-pointer">
                      <SkipBack className="h-5 w-5" />
                    </button>

                    <button
                      onClick={isPlaying ? pauseMusic : resumeMusic}
                      className="w-12 h-12 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center cursor-pointer shadow-lg shadow-indigo-500/20"
                    >
                      {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current translate-x-0.5" />}
                    </button>

                    <button onClick={handleNextTrack} className="text-slate-400 hover:text-white transition-all cursor-pointer">
                      <SkipForward className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Volume controls */}
                  <div className="flex items-center gap-2 max-w-[120px] w-full">
                    <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-white cursor-pointer">
                      {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        setIsMuted(false);
                      }}
                      className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
