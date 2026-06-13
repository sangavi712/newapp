"use client";

/* eslint-disable */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// --- Sound Synthesizer Helper ---
const playSound = (type: 'success' | 'fail' | 'click' | 'tada') => {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'click') {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'fail') {
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.frequency.setValueAtTime(165, ctx.currentTime + 0.12); // E3
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'tada') {
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (_) {}
};

interface GameProps {
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  onWin: (score: number) => void;
  onLose: () => void;
}

// ==========================================
// 1. JIGSAW PUZZLE
// ==========================================
export function JigsawPuzzle({ difficulty, onWin }: GameProps) {
  const size = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
  const totalTiles = size * size;
  const [board, setBoard] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    // Generate tiles [0..total-1]
    const list = Array.from({ length: totalTiles }, (_, i) => i);
    // Shuffle
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    setBoard(list);
    window.dispatchEvent(new CustomEvent('game-start', { detail: { gameName: 'Jigsaw Puzzle' } }));
  }, [difficulty]);

  const handleTileClick = (idx: number) => {
    playSound('click');
    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else {
      // Swap tiles
      const nextBoard = [...board];
      [nextBoard[selectedIdx], nextBoard[idx]] = [nextBoard[idx], nextBoard[selectedIdx]];
      setBoard(nextBoard);
      setSelectedIdx(null);

      // Check win
      const won = nextBoard.every((val, i) => val === i);
      if (won) {
        playSound('tada');
        onWin(difficulty === 'easy' ? 100 : difficulty === 'medium' ? 200 : 300);
      }
    }
  };

  return (
    <div className="space-y-4 text-center">
      <p className="text-xs text-slate-400 font-bold uppercase">Swap blocks to complete the image!</p>
      <div 
        className="grid gap-1.5 max-w-sm mx-auto bg-slate-100 dark:bg-slate-900/50 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {board.map((tileVal, idx) => {
          const isSelected = selectedIdx === idx;
          // Render SVG preview inside tiles to represent puzzle slices
          return (
            <div
              key={idx}
              onClick={() => handleTileClick(idx)}
              className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all border ${
                isSelected 
                  ? 'border-indigo-500 bg-indigo-500/10 scale-95 shadow-md shadow-indigo-500/10' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:scale-98'
              }`}
            >
              <div className="text-center">
                <span className="text-xl">🧩</span>
                <p className="text-[10px] font-black text-indigo-500">#{tileVal + 1}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 2. MEMORY MATCH
// ==========================================
export function MemoryMatch({ difficulty, onWin }: GameProps) {
  const emojis = ['🪐', '🚀', '🛸', '👾', '🌌', '🛰️', '☄️', '🔮', '🤖', '🔋', '📡', '🔭'];
  const pairCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : difficulty === 'hard' ? 8 : 12;
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  
  useEffect(() => {
    const selectedEmojis = emojis.slice(0, pairCount);
    const deck = [...selectedEmojis, ...selectedEmojis]
      .map((emoji, index) => ({ id: index, emoji, flipped: false }))
      .sort(() => Math.random() - 0.5);
    setCards(deck);
    setMatchedCards([]);
    setSelectedCards([]);
  }, [difficulty]);

  const handleCardClick = (index: number) => {
    if (selectedCards.length === 2 || matchedCards.includes(index) || selectedCards.includes(index)) return;
    playSound('click');
    const newSelected = [...selectedCards, index];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (cards[first].emoji === cards[second].emoji) {
        playSound('success');
        setMatchedCards(prev => [...prev, first, second]);
        setSelectedCards([]);
        
        if (matchedCards.length + 2 === cards.length) {
          playSound('tada');
          onWin(pairCount * 25);
        }
      } else {
        setTimeout(() => {
          playSound('fail');
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2.5 max-w-md mx-auto">
        {cards.map((card, idx) => {
          const isFlipped = selectedCards.includes(idx) || matchedCards.includes(idx);
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(idx)}
              className={`aspect-square rounded-2xl flex items-center justify-center cursor-pointer transition-all border text-2xl font-black ${
                isFlipped 
                  ? 'bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border-indigo-500' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              {isFlipped ? card.emoji : '❓'}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 3. WORD SEARCH
// ==========================================
export function WordSearch({ difficulty, onWin }: GameProps) {
  const wordList = ['TECH', 'CODE', 'PYTHON', 'REACT', 'FLASK', 'DEV', 'AI', 'DATA'];
  const size = 8;
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);

  useEffect(() => {
    const newGrid = Array.from({ length: size }, () => Array(size).fill(''));
    // Simple word injection
    wordList.forEach((word) => {
      const row = Math.floor(Math.random() * size);
      const startCol = Math.floor(Math.random() * (size - word.length));
      for (let i = 0; i < word.length; i++) {
        newGrid[row][startCol + i] = word[i];
      }
    });
    // Fill remaining with random letters
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!newGrid[r][c]) {
          newGrid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
    setGrid(newGrid);
    setFoundWords([]);
  }, [difficulty]);

  const handleCellClick = (r: number, c: number) => {
    playSound('click');
    const clicked = { r, c };
    const idx = selectedCells.findIndex((cell) => cell.r === r && cell.c === c);
    
    const nextSelected = [...selectedCells];
    if (idx >= 0) {
      nextSelected.splice(idx, 1);
    } else {
      nextSelected.push(clicked);
    }
    setSelectedCells(nextSelected);

    // Form word from selected cells
    const letters = nextSelected.map((cell) => grid[cell.r][cell.c]).join('');
    const matchedWord = wordList.find((w) => w === letters || w === letters.split('').reverse().join(''));
    
    if (matchedWord && !foundWords.includes(matchedWord)) {
      playSound('success');
      setFoundWords(prev => [...prev, matchedWord]);
      setSelectedCells([]);
      
      if (foundWords.length + 1 === wordList.length) {
        playSound('tada');
        onWin(200);
      }
    }
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      <div className="flex flex-wrap gap-2 justify-center">
        {wordList.map((word) => (
          <span 
            key={word} 
            className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
              foundWords.includes(word) 
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 line-through' 
                : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:border-slate-700'
            }`}
          >
            {word}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-1 p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl">
        {grid.map((row, r) => 
          row.map((char, c) => {
            const isSelected = selectedCells.some((cell) => cell.r === r && cell.c === c);
            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`aspect-square rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                  isSelected 
                    ? 'bg-indigo-500 text-white shadow shadow-indigo-500/30 scale-95' 
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850'
                }`}
              >
                {char}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ==========================================
// 4. SUDOKU
// ==========================================
export function Sudoku({ difficulty, onWin }: GameProps) {
  // A simplified 4x4 mini-sudoku boards for rapid mobile friendly gameplay
  const emptyGrid = [
    [1, 0, 3, 0],
    [0, 0, 0, 2],
    [3, 0, 0, 0],
    [0, 2, 0, 4]
  ];
  const solution = [
    [1, 2, 3, 4],
    [4, 3, 1, 2],
    [3, 4, 2, 1],
    [2, 1, 4, 3]
  ];

  const [grid, setGrid] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);

  useEffect(() => {
    setGrid(emptyGrid.map(row => [...row]));
  }, [difficulty]);

  const handleCellClick = (r: number, c: number) => {
    if (emptyGrid[r][c] !== 0) return; // Locked
    playSound('click');
    setSelectedCell({ r, c });
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    playSound('click');
    const { r, c } = selectedCell;
    const nextGrid = grid.map(row => [...row]);
    nextGrid[r][c] = num;
    setGrid(nextGrid);

    // Validate solution
    const isComplete = nextGrid.every((row, i) => row.every((val, j) => val === solution[i][j]));
    if (isComplete) {
      playSound('tada');
      onWin(250);
    }
  };

  return (
    <div className="space-y-6 max-w-xs mx-auto">
      <div className="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
        {grid.map((row, r) => 
          row.map((val, c) => {
            const isOriginal = emptyGrid[r][c] !== 0;
            const isSelected = selectedCell?.r === r && selectedCell?.c === c;
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`aspect-square rounded-xl flex items-center justify-center text-lg font-black cursor-pointer border ${
                  isOriginal 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-transparent' 
                    : isSelected 
                      ? 'bg-indigo-500 text-white border-indigo-500 scale-95 shadow shadow-indigo-500/20' 
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800'
                }`}
              >
                {val !== 0 ? val : ''}
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-2.5 justify-center">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberInput(num)}
            className="w-12 h-12 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-black text-base shadow shadow-indigo-500/20 transition-all cursor-pointer"
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 5. HANGMAN
// ==========================================
export function Hangman({ difficulty, onWin, onLose }: GameProps) {
  const vocab = ['PYTHON', 'REACT', 'DATABASE', 'CSS', 'HTML', 'COMPILER', 'ALGORITHM'];
  const [word, setWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const maxMistakes = 6;

  useEffect(() => {
    setWord(vocab[Math.floor(Math.random() * vocab.length)]);
    setGuesses([]);
  }, [difficulty]);

  const mistakes = guesses.filter((char) => !word.includes(char)).length;

  const handleGuess = (char: string) => {
    if (guesses.includes(char) || mistakes >= maxMistakes) return;
    playSound('click');
    const nextGuesses = [...guesses, char];
    setGuesses(nextGuesses);

    const isMatch = word.includes(char);
    if (isMatch) {
      playSound('success');
      const won = word.split('').every((letter) => nextGuesses.includes(letter));
      if (won) {
        playSound('tada');
        onWin(150);
      }
    } else {
      playSound('fail');
      if (mistakes + 1 >= maxMistakes) {
        onLose();
      }
    }
  };

  return (
    <div className="space-y-6 text-center max-w-sm mx-auto">
      {/* Stick figure drawing or visual count */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800">
        <span className="text-3xl">🐱</span>
        <p className="text-xs font-bold text-slate-400 mt-2">MISTAKES: {mistakes} / {maxMistakes}</p>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
          <div 
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${(mistakes / maxMistakes) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-center text-3xl font-black">
        {word.split('').map((letter, idx) => (
          <span key={idx} className="border-b-4 border-slate-350 w-8 text-center pb-1 text-slate-800 dark:text-white">
            {guesses.includes(letter) ? letter : '_'}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 justify-center max-w-sm mx-auto">
        {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((char) => {
          const guessed = guesses.includes(char);
          return (
            <button
              key={char}
              onClick={() => handleGuess(char)}
              disabled={guessed}
              className={`w-7 h-7 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                guessed 
                  ? 'bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600' 
                  : 'bg-indigo-500 text-white hover:bg-indigo-600'
              }`}
            >
              {char}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 6. TIC-TAC-TOE
// ==========================================
export function TicTacToe({ difficulty, onWin, onLose }: GameProps) {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  const checkWinner = (grid: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const line of lines) {
      const [a, b, c] = line;
      if (grid[a] && grid[a] === grid[b] && grid[a] === grid[c]) {
        return grid[a];
      }
    }
    return null;
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || !isPlayerTurn) return;
    playSound('click');
    const nextBoard = [...board];
    nextBoard[idx] = 'X';
    setBoard(nextBoard);
    setIsPlayerTurn(false);

    const winner = checkWinner(nextBoard);
    if (winner === 'X') {
      playSound('tada');
      onWin(100);
      return;
    }

    if (nextBoard.every(cell => cell !== null)) {
      // Draw
      playSound('success');
      onWin(50);
      return;
    }

    // AI Turn (Minimax or random based on difficulty)
    setTimeout(() => {
      const aiBoard = [...nextBoard];
      const emptyIndices = aiBoard.map((val, i) => val === null ? i : null).filter(val => val !== null) as number[];
      
      let aiChoice = emptyIndices[0];
      if (difficulty === 'hard' || difficulty === 'expert') {
        // Simple defensive block logic or random
        const winningLines = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8],
          [0, 3, 6], [1, 4, 7], [2, 5, 8],
          [0, 4, 8], [2, 4, 6]
        ];
        // Check if user is about to win and block them
        let blockIndex = -1;
        for (const line of winningLines) {
          const values = line.map(i => aiBoard[i]);
          const xCount = values.filter(v => v === 'X').length;
          const nullCount = values.filter(v => v === null).length;
          if (xCount === 2 && nullCount === 1) {
            blockIndex = line[values.indexOf(null)];
            break;
          }
        }
        if (blockIndex !== -1) {
          aiChoice = blockIndex;
        } else {
          aiChoice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        }
      } else {
        aiChoice = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }

      if (aiChoice !== undefined) {
        aiBoard[aiChoice] = 'O';
        setBoard(aiBoard);
        setIsPlayerTurn(true);
        const aiWinner = checkWinner(aiBoard);
        if (aiWinner === 'O') {
          playSound('fail');
          onLose();
        }
      }
    }, 600);
  };

  return (
    <div className="space-y-4 max-w-xs mx-auto">
      <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-900 p-2.5 rounded-2xl">
        {board.map((cell, idx) => (
          <div
            key={idx}
            onClick={() => handleCellClick(idx)}
            className={`aspect-square rounded-xl flex items-center justify-center text-3xl font-black cursor-pointer border ${
              cell === 'X' 
                ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500' 
                : cell === 'O' 
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500' 
                  : 'bg-white dark:bg-slate-950 text-slate-700 border-slate-200 dark:border-slate-800 hover:scale-98 transition-all'
            }`}
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 7. CHESS VS AI
// ==========================================
export function ChessAI({ difficulty, onWin, onLose }: GameProps) {
  // Simplified Chess (4x4 board representation with custom rules to ensure quick mobile friendly checkers/chess)
  const initialBoard = [
    ['R', 'N', 'B', 'K'],
    ['P', 'P', 'P', 'P'],
    ['.', '.', '.', '.'],
    ['p', 'p', 'p', 'p'],
    ['b', 'n', 'r', 'k']
  ];
  const [board, setBoard] = useState<string[][]>(initialBoard);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);

  const handleCellClick = (r: number, c: number) => {
    playSound('click');
    const piece = board[r][c];
    
    if (selectedCell === null) {
      // Select white pieces (lowercase symbols represent white)
      if (piece !== '.' && piece === piece.toLowerCase()) {
        setSelectedCell({ r, c });
      }
    } else {
      const nextBoard = board.map(row => [...row]);
      // Move piece
      nextBoard[r][c] = board[selectedCell.r][selectedCell.c];
      nextBoard[selectedCell.r][selectedCell.c] = '.';
      setBoard(nextBoard);
      setSelectedCell(null);

      // AI response (simple random capture/move)
      setTimeout(() => {
        const aiBoard = nextBoard.map(row => [...row]);
        // Find all black pieces
        const blackPieces: { r: number; c: number }[] = [];
        for (let i = 0; i < aiBoard.length; i++) {
          for (let j = 0; j < aiBoard[i].length; j++) {
            const cell = aiBoard[i][j];
            if (cell !== '.' && cell === cell.toUpperCase()) {
              blackPieces.push({ r: i, c: j });
            }
          }
        }
        // Make random move
        if (blackPieces.length > 0) {
          const pieceObj = blackPieces[Math.floor(Math.random() * blackPieces.length)];
          // Find empty cells or opponent cells below
          const targetRow = Math.min(aiBoard.length - 1, pieceObj.r + 1);
          const targetCol = Math.floor(Math.random() * 4);
          aiBoard[targetRow][targetCol] = aiBoard[pieceObj.r][pieceObj.c];
          aiBoard[pieceObj.r][pieceObj.c] = '.';
          setBoard(aiBoard);
          playSound('fail');
        }
      }, 700);

      // Random win state simulator for quick gameplay
      if (Math.random() > 0.85) {
        playSound('tada');
        onWin(300);
      }
    }
  };

  return (
    <div className="space-y-4 max-w-xs mx-auto">
      <div className="grid grid-cols-4 gap-1 p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        {board.map((row, r) => 
          row.map((piece, c) => {
            const isSelected = selectedCell?.r === r && selectedCell?.c === c;
            const isDarkCell = (r + c) % 2 === 1;
            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`aspect-square rounded-xl flex items-center justify-center text-xl font-bold cursor-pointer border ${
                  isSelected 
                    ? 'bg-indigo-500 text-white border-indigo-500 scale-95' 
                    : isDarkCell 
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent' 
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-400 border-transparent'
                }`}
              >
                {piece !== '.' ? piece : ''}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ==========================================
// 8. MATH CHALLENGE
// ==========================================
export function MathChallenge({ difficulty, onWin, onLose }: GameProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(15);

  const generateQuestion = () => {
    const range = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 50 : 100;
    const a = Math.floor(Math.random() * range) + 1;
    const b = Math.floor(Math.random() * range) + 1;
    const isMult = Math.random() > 0.6 && difficulty !== 'easy';
    
    const correctAns = isMult ? a * b : a + b;
    setQuestion(`${a} ${isMult ? '×' : '+'} ${b} = ?`);
    setAnswer(correctAns);

    const opts = [correctAns];
    while (opts.length < 4) {
      const wrong = correctAns + (Math.floor(Math.random() * 10) - 5);
      if (!opts.includes(wrong) && wrong > 0) {
        opts.push(wrong);
      }
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
    setTimer(15);
  };

  useEffect(() => {
    generateQuestion();
    setScore(0);
  }, [difficulty]);

  useEffect(() => {
    if (timer <= 0) {
      playSound('fail');
      onLose();
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSelectOption = (num: number) => {
    if (num === answer) {
      playSound('success');
      setScore(prev => prev + 1);
      if (score + 1 >= 5) {
        playSound('tada');
        onWin((score + 1) * 30);
      } else {
        generateQuestion();
      }
    } else {
      playSound('fail');
      onLose();
    }
  };

  return (
    <div className="space-y-6 text-center max-w-sm mx-auto">
      <div className="flex justify-between items-center px-2">
        <span className="text-xs font-black text-slate-400">SCORE: {score} / 5</span>
        <span className="text-xs font-black text-rose-500">⏱ {timer}s</span>
      </div>
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl">
        <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-normal">{question}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectOption(opt)}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-500 font-extrabold text-sm transition-all cursor-pointer shadow-md"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 9. QUIZ CHALLENGE
// ==========================================
export function QuizChallenge({ difficulty, onWin, onLose }: GameProps) {
  const quizData = [
    {
      q: 'Which data structure follows Last-In-First-Out (LIFO)?',
      opts: ['Queue', 'Stack', 'Tree', 'List'],
      ans: 'Stack'
    },
    {
      q: 'What does HTML stand for?',
      opts: ['Hyper Text Markup Language', 'High Tech Machine Language', 'Hyperlink Text Management List', 'Home Tool Markup Link'],
      ans: 'Hyper Text Markup Language'
    },
    {
      q: 'Which database type uses key-value or document structures?',
      opts: ['SQL', 'NoSQL', 'Relational', 'SQLite'],
      ans: 'NoSQL'
    }
  ];

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (opt: string) => {
    setSelected(opt);
    if (opt === quizData[qIndex].ans) {
      playSound('success');
      setTimeout(() => {
        setSelected(null);
        if (qIndex < quizData.length - 1) {
          setQIndex(prev => prev + 1);
        } else {
          playSound('tada');
          onWin(150);
        }
      }, 1000);
    } else {
      playSound('fail');
      setTimeout(() => {
        setSelected(null);
        onLose();
      }, 1000);
    }
  };

  const current = quizData[qIndex];

  return (
    <div className="space-y-6 text-center max-w-sm mx-auto">
      <div className="p-6 bg-white/60 dark:bg-slate-900/60 border border-slate-250 dark:border-slate-800 rounded-3xl shadow-xl">
        <h3 className="text-lg font-black text-slate-800 dark:text-white leading-relaxed">{current.q}</h3>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {current.opts.map((opt) => {
          let style = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200";
          if (selected) {
            if (opt === current.ans) {
              style = "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-400";
            } else if (selected === opt) {
              style = "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-400";
            }
          }
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={selected !== null}
              className={`w-full p-4 rounded-2xl border text-left text-xs font-black transition-all cursor-pointer ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 10. MAZE ESCAPE
// ==========================================
export function MazeEscape({ difficulty, onWin }: GameProps) {
  const maze = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1]
  ];
  
  const [posX, setPosX] = useState(1);
  const [posY, setPosY] = useState(1);

  const move = (dx: number, dy: number) => {
    playSound('click');
    const nx = posX + dx;
    const ny = posY + dy;
    if (maze[ny][nx] === 0) {
      setPosX(nx);
      setPosY(ny);
      
      // Goal condition at row 5, col 5
      if (nx === 5 && ny === 5) {
        playSound('tada');
        onWin(200);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto text-center">
      <div className="inline-grid grid-cols-7 gap-1 bg-slate-100 dark:bg-slate-900 p-2.5 rounded-2xl">
        {maze.map((row, y) => 
          row.map((cell, x) => {
            const isPlayer = posX === x && posY === y;
            const isGoal = x === 5 && y === 5;
            return (
              <div
                key={`${x}-${y}`}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${
                  isPlayer 
                    ? 'bg-indigo-500 border-indigo-500 text-white' 
                    : isGoal 
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 animate-pulse'
                      : cell === 1 
                        ? 'bg-slate-300 dark:bg-slate-800 border-transparent' 
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850'
                }`}
              >
                {isPlayer ? '🐱' : isGoal ? '🏁' : ''}
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-col items-center gap-2">
        <button onClick={() => move(0, -1)} className="w-12 h-12 bg-indigo-500 text-white font-bold rounded-xl cursor-pointer">▲</button>
        <div className="flex gap-2">
          <button onClick={() => move(-1, 0)} className="w-12 h-12 bg-indigo-500 text-white font-bold rounded-xl cursor-pointer">◀</button>
          <button onClick={() => move(0, 1)} className="w-12 h-12 bg-indigo-500 text-white font-bold rounded-xl cursor-pointer">▼</button>
          <button onClick={() => move(1, 0)} className="w-12 h-12 bg-indigo-500 text-white font-bold rounded-xl cursor-pointer">▶</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 11. BALLOON POP
// ==========================================
export function BalloonPop({ difficulty, onWin }: GameProps) {
  const [poppedCount, setPoppedCount] = useState(0);
  const [balloons, setBalloons] = useState<any[]>([]);

  useEffect(() => {
    // Generate 8 balloons at random floating offsets
    const list = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 40 + 20,
      color: ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'][i % 5]
    }));
    setBalloons(list);
  }, [difficulty]);

  const handlePop = (id: number) => {
    playSound('success');
    setBalloons(prev => prev.filter(b => b.id !== id));
    setPoppedCount(prev => prev + 1);
    
    if (poppedCount + 1 >= 8) {
      playSound('tada');
      onWin(100);
    }
  };

  return (
    <div className="space-y-4 text-center max-w-sm mx-auto">
      <p className="text-xs font-bold text-slate-400 uppercase leading-none">Tap floating balloons to pop them!</p>
      <div className="h-64 relative bg-slate-50 dark:bg-slate-950/40 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {balloons.map((b) => (
          <motion.div
            key={b.id}
            onClick={() => handlePop(b.id)}
            animate={{ y: [-20, 240, -20] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className={`w-12 h-16 rounded-full cursor-pointer absolute shadow-md ${b.color} flex items-center justify-center`}
            style={{ left: `${b.x}%`, top: `${b.y}px` }}
          >
            <span className="text-white text-xs font-black">🎈</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 12. FRUIT SLICE
// ==========================================
export function FruitSlice({ difficulty, onWin, onLose }: GameProps) {
  const [items, setItems] = useState<any[]>([]);
  const [sliced, setSliced] = useState<number[]>([]);

  useEffect(() => {
    const fruitIcons = ['🍎', '🍌', '🍉', '🍊', '🍇', '💣'];
    const list = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      icon: fruitIcons[i % fruitIcons.length],
      x: Math.random() * 80 + 10,
      y: Math.random() * 50 + 20
    }));
     
    setItems(list);
    setSliced([]);
  }, [difficulty]);

  const handleSlice = (id: number, icon: string) => {
    if (sliced.includes(id)) return;
    if (icon === '💣') {
      playSound('fail');
      onLose();
      return;
    }
    playSound('success');
    const nextSliced = [...sliced, id];
    setSliced(nextSliced);

    // Filter out sliced ones from display or match total fruits
    const totalFruits = items.filter(i => i.icon !== '💣').length;
    if (nextSliced.length === totalFruits) {
      playSound('tada');
      onWin(150);
    }
  };

  return (
    <div className="space-y-4 text-center max-w-sm mx-auto">
      <p className="text-xs font-bold text-slate-400 uppercase leading-none">Hover or tap on fruits to slice them, avoid bombs!</p>
      <div className="h-64 relative bg-slate-50 dark:bg-slate-950/40 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
        {items.map((item) => {
          const isSliced = sliced.includes(item.id);
          return (
            <motion.div
              key={item.id}
              onMouseEnter={() => handleSlice(item.id, item.icon)}
              onClick={() => handleSlice(item.id, item.icon)}
              animate={{ y: [0, 80, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className={`text-3xl cursor-pointer absolute select-none ${isSliced ? 'opacity-30 scale-75 rotate-45 transition-all' : ''}`}
              style={{ left: `${item.x}%`, top: `${item.y}px` }}
            >
              {item.icon}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 13. ENDLESS RUNNER
// ==========================================
export function EndlessRunner({ difficulty, onWin, onLose }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scoreRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let playerY = 110;
    let playerVelocity = 0;
    let isJumping = false;
    let obstacleX = 300;
    scoreRef.current = 0;

    const loop = () => {
      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Physics
      if (isJumping) {
        playerVelocity += 0.8; // gravity
        playerY += playerVelocity;
        if (playerY >= 110) {
          playerY = 110;
          playerVelocity = 0;
          isJumping = false;
        }
      }

      // Move Obstacle
      obstacleX -= difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
      if (obstacleX < -15) {
        obstacleX = 300;
        scoreRef.current += 1;
        playSound('success');
        
        if (scoreRef.current >= 5) {
          playSound('tada');
          onWin(150);
          cancelAnimationFrame(animId);
          return;
        }
      }

      // Collisions
      if (obstacleX > 30 && obstacleX < 55 && playerY > 95) {
        playSound('fail');
        onLose();
        cancelAnimationFrame(animId);
        return;
      }

      // Draw ground
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 130, canvas.width, 20);

      // Draw player (🐱)
      ctx.font = '22px Arial';
      ctx.fillText('🐱', 30, playerY + 15);

      // Draw Obstacle (🌵)
      ctx.font = '20px Arial';
      ctx.fillText('🌵', obstacleX, 128);

      // Score
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 10px Arial';
      ctx.fillText(`OBSTACLES PASSED: ${scoreRef.current} / 5`, 10, 20);

      animId = requestAnimationFrame(loop);
    };

    loop();

    const handleKeyDown = () => {
      if (!isJumping) {
        playerVelocity = -9.5; // jump strength
        isJumping = true;
        playSound('click');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('click', handleKeyDown);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [difficulty, onLose, onWin]);

  return (
    <div className="space-y-4 text-center max-w-sm mx-auto">
      <p className="text-xs font-bold text-slate-400 uppercase leading-none">Press SPACE or TAP screen to jump obstacles!</p>
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={150} 
        className="block bg-slate-50 dark:bg-slate-950/40 rounded-3xl border border-slate-200 dark:border-slate-800 mx-auto cursor-pointer"
      />
    </div>
  );
}

// ==========================================
// 14. TREASURE HUNT
// ==========================================
export function TreasureHunt({ difficulty, onWin }: GameProps) {
  const [treasureRow, setTreasureRow] = useState(0);
  const [treasureCol, setTreasureCol] = useState(0);
  const [statusText, setStatusText] = useState('Select cells to search for the hidden chest!');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
     
    setTreasureRow(Math.floor(Math.random() * 5));
    setTreasureCol(Math.floor(Math.random() * 5));
    setStatusText('Select cells to search for the hidden chest!');
    setAttempts(0);
  }, [difficulty]);

  const handleCellClick = (r: number, c: number) => {
    playSound('click');
    setAttempts(prev => prev + 1);

    if (r === treasureRow && c === treasureCol) {
      playSound('tada');
      setStatusText(`Found it! You took ${attempts + 1} guesses.`);
      onWin(200);
    } else {
      const dist = Math.abs(r - treasureRow) + Math.abs(c - treasureCol);
      if (dist === 1) {
        setStatusText("Extremely Hot! (Right Next To It)");
      } else if (dist === 2) {
        setStatusText("Warm! (Close by)");
      } else {
        setStatusText("Cold! (Quite far)");
      }
    }
  };

  return (
    <div className="space-y-6 text-center max-w-xs mx-auto">
      <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{statusText}</p>
      <div className="grid grid-cols-5 gap-1.5 bg-slate-100 dark:bg-slate-900 p-2.5 rounded-2xl">
        {Array.from({ length: 5 }).map((_, r) => 
          Array.from({ length: 5 }).map((_, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              className="aspect-square rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center flex items-center justify-center text-sm font-black hover:scale-95 transition-all cursor-pointer"
            >
              ❓
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ==========================================
// 15. DAILY BRAIN TEASERS
// ==========================================
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function BrainTeasers({ difficulty, onWin, onLose }: GameProps) {
  const teasers = [
    {
      q: 'What has keys but no locks, space but no room, and you can enter but not go in?',
      opts: ['A Piano', 'A Keyboard', 'A Map', 'A Safe'],
      ans: 'A Keyboard'
    },
    {
      q: 'I am light as a feather, yet the strongest man cannot hold me for much more than a minute. What am I?',
      opts: ['Breath', 'Water', 'Air', 'Feather'],
      ans: 'Breath'
    }
  ];

  const [index, setIndex] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (opt: string) => {
    setSelected(opt);
    if (opt === teasers[index].ans) {
      playSound('success');
      setTimeout(() => {
        setSelected(null);
        if (index < teasers.length - 1) {
          setIndex(prev => prev + 1);
        } else {
          playSound('tada');
          onWin(100);
        }
      }, 1000);
    } else {
      playSound('fail');
      setTimeout(() => {
        setSelected(null);
        onLose();
      }, 1000);
    }
  };

  const current = teasers[index];

  return (
    <div className="space-y-6 text-center max-w-sm mx-auto">
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl">
        <h3 className="text-sm font-black text-slate-800 dark:text-white leading-relaxed">{current.q}</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {current.opts.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-all cursor-pointer hover:border-indigo-500"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
