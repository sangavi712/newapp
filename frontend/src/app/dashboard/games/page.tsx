"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Trophy, 
  Sparkles, 
  Coins, 
  Flame, 
  HelpCircle,
  X,
  Play,
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';

// Import mini-game components
import {
  JigsawPuzzle,
  MemoryMatch,
  WordSearch,
  Sudoku,
  Hangman,
  TicTacToe,
  ChessAI,
  MathChallenge,
  QuizChallenge,
  MazeEscape,
  BalloonPop,
  FruitSlice,
  EndlessRunner,
  TreasureHunt,
  BrainTeasers
} from '@/components/games/all_games';

const gamesList = [
  { key: 'jigsaw', name: 'Jigsaw Puzzle', category: 'Puzzle', emoji: '🧩', desc: 'Swap tiles to reconstruct the complete image.', color: 'from-amber-400 to-orange-500' },
  { key: 'memory', name: 'Memory Match', category: 'Puzzle', emoji: '🎴', desc: 'Flip and match pairs of cosmic space emojis.', color: 'from-pink-500 to-rose-600' },
  { key: 'word_search', name: 'Word Search', category: 'Language', emoji: '🔍', desc: 'Search and trace hidden tech vocabulary terms.', color: 'from-blue-500 to-indigo-600' },
  { key: 'sudoku', name: 'Sudoku', category: 'Logic', emoji: '🔢', desc: 'Solve classic 4x4 numerical grid cells.', color: 'from-purple-500 to-violet-600' },
  { key: 'hangman', name: 'Hangman', category: 'Language', emoji: '🔠', desc: 'Guess characters before running out of attempts.', color: 'from-red-500 to-orange-600' },
  { key: 'tictactoe', name: 'Tic-Tac-Toe', category: 'Logic', emoji: '❌', desc: 'Beat the computer AI or block its sequences.', color: 'from-emerald-400 to-teal-600' },
  { key: 'chess', name: 'Chess vs AI', category: 'Logic', emoji: '♟', desc: 'Test chess strategies against an adaptive bot.', color: 'from-yellow-400 to-amber-600' },
  { key: 'math', name: 'Math Challenge', category: 'Math', emoji: '➕', desc: 'Beat the clock solving rapid arithmetic equations.', color: 'from-cyan-400 to-blue-600' },
  { key: 'quiz', name: 'Quiz Challenge', category: 'Language', emoji: '❓', desc: 'Answer general knowledge tech trivia quizzes.', color: 'from-pink-400 to-fuchsia-600' },
  { key: 'maze', name: 'Maze Escape', category: 'Logic', emoji: '🏁', desc: 'Navigate the companion through escape paths.', color: 'from-green-400 to-emerald-600' },
  { key: 'balloons', name: 'Balloon Pop', category: 'Action', emoji: '🎈', desc: 'Pop falling balloons before they fly off-screen.', color: 'from-rose-400 to-pink-500' },
  { key: 'slice', name: 'Fruit Slice', category: 'Action', emoji: '🍉', desc: 'Slice flying fruits using your blade, avoid bombs.', color: 'from-orange-400 to-red-500' },
  { key: 'runner', name: 'Endless Runner', category: 'Action', emoji: '🏃', desc: 'Jump over rocks and logs to keep running.', color: 'from-sky-400 to-blue-500' },
  { key: 'treasure', name: 'Treasure Hunt', category: 'Puzzle', emoji: '🪙', desc: 'Find hidden treasure chests using heat cues.', color: 'from-amber-500 to-yellow-600' },
  { key: 'brain', name: 'Brain Teasers', category: 'Logic', emoji: '💡', desc: 'Solve logic puzzles and daily brain games.', color: 'from-purple-400 to-indigo-500' }
];

const hintMap: Record<string, string> = {
  jigsaw: 'Compare the number value, target tile #1 should go in the top-left.',
  memory: 'Flip cards slowly and try focusing on one side first.',
  word_search: 'Look for letters starting horizontally from left to right.',
  sudoku: 'Make sure each number from 1 to 4 appears exactly once in each row and column.',
  hangman: 'Vowels like E, A, I, O are usually present in the secret word.',
  tictactoe: 'Occupy the center cell on your first move if it is free!',
  chess: 'Control the center cells of the board and defend your king.',
  math: 'Focus on unit digits to find correct answers faster.',
  quiz: 'Eliminate two wrong answers before making a final choice.',
  maze: 'Look for open passages leading to the bottom right exit.',
  balloons: 'Tap rapidly and focus on balloons rising near the center.',
  slice: 'Wait for fruits to bunch up before dragging to slice.',
  runner: 'Jump slightly before the obstacle reaches your avatar.',
  treasure: 'Move one cell at a time and follow the Hot proximity alert.',
  brain: 'Think literally! Keyboard keys and natural breath are answers.'
};

export default function GamesHubPage() {
  const [scores, setScores] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Puzzle' | 'Logic' | 'Language' | 'Math' | 'Action'>('All');
  
  // Game state
  const [activeGameKey, setActiveGameKey] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [gameState, setGameState] = useState<'dashboard' | 'playing' | 'victory' | 'defeat'>('dashboard');
  const [activeScore, setActiveScore] = useState(0);
  const [rewards, setRewards] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initDashboard();
  }, []);

  const initDashboard = async () => {
    setLoading(true);
    await Promise.all([fetchScores(), fetchLeaderboard(), fetchChallenges()]);
    setLoading(false);
  };

  const fetchScores = async () => {
    try {
      const response = await api.get('/games/scores');
      setScores(response.data);
    } catch (_) {}
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/games/leaderboard?game_key=total');
      setLeaderboard(response.data);
    } catch (_) {}
  };

  const fetchChallenges = async () => {
    try {
      const response = await api.get('/games/challenges');
      setChallenges(response.data);
    } catch (_) {}
  };

  const handleLaunchGame = (gameKey: string) => {
    const game = gamesList.find(g => g.key === gameKey);
    if (!game) return;
    setActiveGameKey(gameKey);
    setGameState('playing');
    
    // Dispatch companion start
    window.dispatchEvent(new CustomEvent('game-start', {
      detail: { gameName: game.name }
    }));
  };

  const handleGetHint = () => {
    if (!activeGameKey) return;
    const hint = hintMap[activeGameKey] || 'Keep trying your best!';
    window.dispatchEvent(new CustomEvent('game-hint', {
      detail: { hint }
    }));
  };

  const handleGameWin = async (score: number) => {
    setActiveScore(score);
    setGameState('victory');
    window.dispatchEvent(new CustomEvent('game-win', {
      detail: { score }
    }));

    try {
      const response = await api.post('/games/submit', {
        game_key: activeGameKey,
        score
      });
      setRewards(response.data);
      // Refresh statistics
      fetchScores();
      fetchLeaderboard();
    } catch (error) {
      console.error("Failed to submit game score:", error);
    }
  };

  const handleGameLose = () => {
    setGameState('defeat');
    window.dispatchEvent(new CustomEvent('game-wrong'));
  };

  const handleCloseGame = () => {
    setGameState('dashboard');
    setActiveGameKey(null);
    setRewards(null);
  };

  const filteredGames = gamesList.filter(g => categoryFilter === 'All' || g.category === categoryFilter);

  // Helper to render the active game component
  const renderGame = () => {
    const props = {
      difficulty,
      onWin: handleGameWin,
      onLose: handleGameLose
    };
    switch (activeGameKey) {
      case 'jigsaw': return <JigsawPuzzle {...props} />;
      case 'memory': return <MemoryMatch {...props} />;
      case 'word_search': return <WordSearch {...props} />;
      case 'sudoku': return <Sudoku {...props} />;
      case 'hangman': return <Hangman {...props} />;
      case 'tictactoe': return <TicTacToe {...props} />;
      case 'chess': return <ChessAI {...props} />;
      case 'math': return <MathChallenge {...props} />;
      case 'quiz': return <QuizChallenge {...props} />;
      case 'maze': return <MazeEscape {...props} />;
      case 'balloons': return <BalloonPop {...props} />;
      case 'slice': return <FruitSlice {...props} />;
      case 'runner': return <EndlessRunner {...props} />;
      case 'treasure': return <TreasureHunt {...props} />;
      case 'brain': return <BrainTeasers {...props} />;
      default: return null;
    }
  };

  const activeGame = gamesList.find(g => g.key === activeGameKey);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Dynamic Game Overlay viewport */}
      <AnimatePresence>
        {gameState !== 'dashboard' && activeGame && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white/95 dark:bg-slate-900/95 border-2 border-slate-200 dark:border-slate-600 rounded-3xl p-6 shadow-2xl max-w-lg w-full space-y-6 relative overflow-hidden backdrop-blur-xl"
            >
              {/* Game header bar */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{activeGame.emoji}</span>
                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white leading-none">{activeGame.name}</h3>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none mt-1.5 block">
                      Difficulty: {difficulty}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Hint button */}
                  {gameState === 'playing' && (
                    <button
                      onClick={handleGetHint}
                      className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-all cursor-pointer flex items-center justify-center"
                      title="Request Hint from Pet"
                    >
                      <HelpCircle className="h-4.5 w-4.5" />
                    </button>
                  )}
                  
                  {/* Close button */}
                  <button
                    onClick={handleCloseGame}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Game Viewport panel */}
              <div className="py-2">
                {gameState === 'playing' ? (
                  renderGame()
                ) : gameState === 'victory' ? (
                  // Victory summary view
                  <div className="text-center space-y-5">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-4xl shadow shadow-emerald-500/20 text-emerald-500 animate-bounce">
                      🎉
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black text-slate-800 dark:text-white">Game Cleared!</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Awesome job! You solved the level with a score of <span className="font-black text-indigo-500">{activeScore}</span>.
                      </p>
                    </div>

                    {rewards && (
                      <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto p-4 bg-slate-50 dark:bg-slate-950/40 border-2 border-slate-200 dark:border-slate-600 rounded-2xl text-left">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Coins Reward</span>
                          <p className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1">
                            <Coins className="h-4 w-4 text-amber-500" /> +{rewards.coin_reward} Coins
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase leading-none">XP Reward</span>
                          <p className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-yellow-500" /> +{rewards.xp_reward} XP
                          </p>
                        </div>
                        <div className="col-span-2 border-t border-slate-100 dark:border-slate-850 pt-2 mt-1 space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Study Streak</span>
                          <p className="text-xs font-black text-orange-500 flex items-center gap-1">
                            <Flame className="h-4.5 w-4.5 fill-current" /> {rewards.streak} Day Streak!
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 max-w-xs mx-auto">
                      <button
                        onClick={() => activeGameKey && handleLaunchGame(activeGameKey)}
                        className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                      >
                        Play Again
                      </button>
                      <button
                        onClick={handleCloseGame}
                        className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-indigo-500/15"
                      >
                        Close View
                      </button>
                    </div>
                  </div>
                ) : (
                  // Defeat summary view
                  <div className="text-center space-y-5">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-4xl shadow shadow-rose-500/20 text-rose-500">
                      💔
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black text-slate-800 dark:text-white">Game Over</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Don't lose heart! Every mistake is a learning step. Let's try again!
                      </p>
                    </div>

                    <div className="flex gap-3 max-w-xs mx-auto">
                      <button
                        onClick={handleCloseGame}
                        className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => activeGameKey && handleLaunchGame(activeGameKey)}
                        className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories filter layout */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 p-4 rounded-3xl shadow-md">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full py-1">
          {(['All', 'Puzzle', 'Logic', 'Language', 'Math', 'Action'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                categoryFilter === cat
                  ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                  : 'bg-white border-slate-250 text-slate-650 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-850 dark:text-slate-450 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Global Difficulty Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border-2 border-slate-200 dark:border-slate-600">
          {(['easy', 'medium', 'hard', 'expert'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficulty(diff)}
              className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                difficulty === diff
                  ? 'bg-white dark:bg-slate-800 text-indigo-500 dark:text-white shadow-sm font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Games Grid list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredGames.map((game) => {
              // Find matching score details
              const scoreObj = scores.find(s => s.game_key === game.key);
              return (
                <motion.div
                  key={game.key}
                  whileHover={{ y: -3 }}
                  className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 rounded-3xl p-5 shadow-md flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className={`h-11 w-11 rounded-2xl bg-gradient-to-tr ${game.color} flex items-center justify-center text-xl text-white shadow shadow-indigo-500/10`}>
                        {game.emoji}
                      </div>
                      <span className="text-[9px] font-black bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-md uppercase tracking-widest">{game.category}</span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-slate-800 dark:text-white leading-normal">{game.name}</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-450 leading-relaxed font-semibold mt-1">{game.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-850">
                    <div className="text-left">
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">High Score</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200 mt-1">{scoreObj?.high_score || 0}</p>
                    </div>

                    <button
                      onClick={() => handleLaunchGame(game.key)}
                      className={`px-4 py-2 rounded-xl bg-gradient-to-tr ${game.color} hover:opacity-90 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shadow-md`}
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> Play
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right column: Leaderboards and Challenges list */}
        <div className="space-y-6">
          
          {/* Daily Challenges */}
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 p-6 rounded-3xl shadow-md space-y-4">
            <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-150 dark:border-slate-850 pb-3">
              <Award className="h-4.5 w-4.5 text-yellow-500" /> Daily Game Tasks
            </h3>

            <div className="space-y-3">
              {challenges.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50/70 dark:bg-slate-950/20 border-2 border-slate-200 dark:border-slate-600 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-normal">{c.description}</p>
                  <div className="flex items-center gap-3.5 text-[9px] text-slate-400 font-bold">
                    <span className="flex items-center gap-0.5"><Trophy className="h-3.5 w-3.5 text-yellow-500" /> +{c.xp_reward} XP</span>
                    <span className="flex items-center gap-0.5"><Coins className="h-3.5 w-3.5 text-amber-500" /> +{c.coin_reward} Coins</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Leaderboard sum scores */}
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 p-6 rounded-3xl shadow-md space-y-4">
            <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-150 dark:border-slate-850 pb-3">
              <Trophy className="h-4.5 w-4.5 text-yellow-500" /> Global Top Players
            </h3>

            <div className="space-y-2.5">
              {leaderboard.map((player, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50/40 dark:bg-slate-950/10 border border-slate-150 dark:border-slate-850/30 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-5 w-5 rounded-md text-[10px] font-black flex items-center justify-center ${
                      idx === 0 
                        ? 'bg-yellow-500/10 text-yellow-600' 
                        : idx === 1 
                          ? 'bg-slate-300/20 text-slate-500' 
                          : idx === 2 
                            ? 'bg-amber-600/10 text-amber-600' 
                            : 'bg-slate-100 text-slate-450 dark:bg-slate-800'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{player.username}</span>
                  </div>
                  <span className="text-xs font-black text-indigo-500">{player.score} pts</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
