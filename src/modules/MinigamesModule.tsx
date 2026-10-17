import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Gamepad2, 
  CheckCircle2, 
  RotateCcw, 
  Coins, 
  Trophy, 
  Sparkles, 
  HelpCircle,
  Check,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ExternalLink,
  Edit3,
  Layers,
  Sprout,
  Waves,
  Recycle,
  Wind,
  Info,
  CheckCircle,
  Play,
  Calendar,
  Flame,
  Globe2
} from 'lucide-react';
import { storage } from '../services/storageService';
import { MINIGAME_ITEMS, ECO_QUIZ_QUESTIONS, SEED_CHALLENGES } from '../data/seedData';
import { MinigameItem, EcoQuizQuestion, GreenChallenge, DelightexGame } from '../types';
import { Eco3DArenaGame } from '../components/Minigames/Eco3DArenaGame';

export const MinigamesModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'delightex' | 'arena3d' | 'sorting2d' | 'quiz' | 'challenge'>('delightex');

  // --- Delightex Games State ---
  const [games, setGames] = useState<DelightexGame[]>(() => {
    try {
      return storage.getDelightexGames();
    } catch {
      return [];
    }
  });
  const [selectedGame, setSelectedGame] = useState<DelightexGame | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [claimedRewardIds, setClaimedRewardIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ecoloop_delightex_claimed');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal editing a game URL / title (useful for teacher)
  const [editingGame, setEditingGame] = useState<DelightexGame | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const iframeContainerRef = useRef<HTMLDivElement>(null);

  // Sync games from storage on change
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setGames(storage.getDelightexGames());
    });
    return unsub;
  }, []);

  // When selected game changes, reset loading
  useEffect(() => {
    if (selectedGame) {
      setIframeLoading(true);
      setIframeKey((prev) => prev + 1);
    }
  }, [selectedGame]);

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      iframeContainerRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleSelectGame = (game: DelightexGame) => {
    setSelectedGame(game);
    // Smooth scroll to top of game area
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleClaimGamePoints = (game: DelightexGame) => {
    if (claimedRewardIds.includes(game.id)) {
      alert('Bạn đã nhận điểm thưởng cho trò chơi này rồi! Hãy thử thêm các trò chơi khác nhé.');
      return;
    }
    const updated = [...claimedRewardIds, game.id];
    setClaimedRewardIds(updated);
    try {
      localStorage.setItem('ecoloop_delightex_claimed', JSON.stringify(updated));
    } catch {}

    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    storage.addEcoPoints(
      game.pointsReward,
      `Hoàn thành ${game.title}`,
      `Trải nghiệm trò chơi 3D: ${game.subtitle}`
    );
  };

  const handleOpenEditModal = (e: React.MouseEvent, game: DelightexGame) => {
    e.stopPropagation();
    setEditingGame(game);
    setEditTitle(game.title);
    setEditUrl(game.iframeUrl);
    setEditDesc(game.description);
  };

  const handleSaveEditGame = () => {
    if (!editingGame) return;
    storage.updateDelightexGame(editingGame.id, {
      title: editTitle.trim(),
      iframeUrl: editUrl.trim(),
      description: editDesc.trim(),
    });
    // If currently playing this game, update selectedGame too
    if (selectedGame?.id === editingGame.id) {
      setSelectedGame({
        ...selectedGame,
        title: editTitle.trim(),
        iframeUrl: editUrl.trim(),
        description: editDesc.trim(),
      });
    }
    setEditingGame(null);
  };

  // Helper for game icon
  const getGameIcon = (id: string) => {
    if (id.includes('soil')) return <Sprout className="w-5 h-5 text-amber-500" />;
    if (id.includes('water')) return <Waves className="w-5 h-5 text-sky-500" />;
    if (id.includes('waste')) return <Recycle className="w-5 h-5 text-emerald-500" />;
    return <Wind className="w-5 h-5 text-teal-400" />;
  };

  // --- Sorting Game State ---
  const [items] = useState<MinigameItem[]>(MINIGAME_ITEMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // --- Quiz State ---
  const [quizQuestions] = useState<EcoQuizQuestion[]>(ECO_QUIZ_QUESTIONS);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  // --- 7-Day Challenge State ---
  const [challenges, setChallenges] = useState<GreenChallenge[]>(() => {
    try {
      const saved = localStorage.getItem('ecoloop_user_challenges');
      return saved ? JSON.parse(saved) : SEED_CHALLENGES;
    } catch {
      return SEED_CHALLENGES;
    }
  });

  const currentItem = items[currentIndex] || items[0];

  const handleClassify = (bin: 'organic' | 'recyclable' | 'hazardous' | 'other') => {
    if (gameFinished || feedback) return;

    const isCorrect = currentItem.correctBin === bin;
    if (isCorrect) {
      const newScore = score + 10 + streak * 2;
      setScore(newScore);
      setStreak(streak + 1);
      setFeedback({
        isCorrect: true,
        message: `Chính xác! ${currentItem.name} thuộc nhóm rác này.`,
      });
    } else {
      setStreak(0);
      setFeedback({
        isCorrect: false,
        message: `Chưa đúng! ${currentItem.name} phải bỏ vào thùng ${
          currentItem.correctBin === 'organic'
            ? 'Rác Hữu Cơ (Xanh)'
            : currentItem.correctBin === 'recyclable'
            ? 'Rác Tái Chế (Vàng)'
            : currentItem.correctBin === 'hazardous'
            ? 'Rác Nguy Hại (Đỏ)'
            : 'Rác Vô Cơ Còn Lại (Xám)'
        }.`,
      });
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex + 1 < items.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setGameFinished(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        storage.addEcoPoints(30, 'Hoàn thành Minigame Phân loại rác 2D', `Đạt ${score} điểm trong trò chơi`);
      }
    }, 1200);
  };

  const handleRestartSorting = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setGameFinished(false);
    setFeedback(null);
  };

  const handleAnswerQuiz = (choiceIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(choiceIdx);

    const isCorrect = choiceIdx === quizQuestions[currentQuizIndex].correctIndex;
    if (isCorrect) {
      setQuizScore(quizScore + 1);
    }

    setTimeout(() => {
      if (currentQuizIndex + 1 < quizQuestions.length) {
        setCurrentQuizIndex(currentQuizIndex + 1);
        setSelectedAnswer(null);
      } else {
        setQuizFinished(true);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        storage.addEcoPoints(25, 'Hoàn thành Eco Quiz Môi Trường', `Trả lời đúng các câu hỏi trắc nghiệm`);
      }
    }, 1500);
  };

  const handleRestartQuiz = () => {
    setCurrentQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setQuizFinished(false);
  };

  const handleToggleDay = (challengeId: string, dayIndex: number) => {
    const updated = challenges.map((ch) => {
      if (ch.id !== challengeId) return ch;
      const newDays = [...ch.completedDays];
      newDays[dayIndex] = !newDays[dayIndex];
      const allDone = newDays.every((d) => d);

      if (allDone && !ch.isCompleted) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        storage.addEcoPoints(ch.points, `Hoàn thành Thử thách xanh 7 ngày: ${ch.title}`, 'Duy trì thói quen sống xanh');
      }

      return {
        ...ch,
        completedDays: newDays,
        isCompleted: allDone,
      };
    });

    setChallenges(updated);
    try {
      localStorage.setItem('ecoloop_user_challenges', JSON.stringify(updated));
    } catch {}
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-emerald-900/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <Gamepad2 className="w-4 h-4 text-amber-300" />
            <span>Delightex Edu 3D & Three.js WebGL • Học tập môi trường tương tác</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Khu Vực Trò Chơi Môi Trường 3D & Eco Quiz
          </h1>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-2 leading-relaxed">
            Hệ sinh thái minigame học đường trực quan (Trường THCS Thốt Nốt, Cần Thơ) thiết kế cùng đấu trường 3D Chơi trực tiếp trên trang, rèn luyện kỹ năng bảo vệ đất, nước, không khí và nhận điểm EcoPoints!
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-emerald-200">
              <Coins className="w-3.5 h-3.5 text-amber-300" />
              <span>Cộng +30 đến +40 EcoPoints / trò chơi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 text-xs font-bold shadow-xs overflow-x-auto gap-1">
        <button
          onClick={() => {
            setActiveTab('delightex');
          }}
          className={`flex-1 min-w-[170px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'delightex'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-emerald-700'
          }`}
        >
          <Gamepad2 className="w-4 h-4 text-amber-300" />
          <span>4 Trò chơi 3D</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('sorting2d');
            setSelectedGame(null);
          }}
          className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'sorting2d'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-emerald-700'
          }`}
        >
          <Recycle className="w-4 h-4" />
          <span>Phân loại rác 4 thùng</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('quiz');
            setSelectedGame(null);
          }}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'quiz'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-gray-600 hover:text-emerald-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Eco Quiz trắc nghiệm</span>
        </button>
      </div>

      {/* TAB 1: DELIGHTEX 3D GAMES */}
      {activeTab === 'delightex' && (
        <div className="space-y-6">
          {/* IFRAME PLAYER VIEW (When a game is selected) */}
          {selectedGame ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Game Control Bar Above Iframe */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-emerald-100 hover:text-emerald-800 text-gray-700 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0"
                    title="Quay lại danh sách 4 thẻ game"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Danh sách trò chơi</span>
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {selectedGame.category}
                      </span>
                      <h2 className="text-base sm:text-lg font-black text-gray-900 truncate">
                        {selectedGame.title}
                      </h2>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-1">
                      {selectedGame.subtitle}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                  {/* Reward Button */}
                  <button
                    onClick={() => handleClaimGamePoints(selectedGame)}
                    disabled={claimedRewardIds.includes(selectedGame.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                      claimedRewardIds.includes(selectedGame.id)
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white active:scale-95'
                    }`}
                  >
                    {claimedRewardIds.includes(selectedGame.id) ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đã nhận +{selectedGame.pointsReward} pts</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-3.5 h-3.5 text-amber-200" />
                        <span>Nhận +{selectedGame.pointsReward} EcoPoints</span>
                      </>
                    )}
                  </button>

                  {/* Reload iframe */}
                  <button
                    onClick={() => {
                      setIframeLoading(true);
                      setIframeKey((prev) => prev + 1);
                    }}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    title="Tải lại trò chơi"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Fullscreen button */}
                  <button
                    onClick={handleToggleFullscreen}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  {/* Open in external tab fallback */}
                  <a
                    href={selectedGame.iframeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    title="Mở trong tab mới (dự phòng)"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Quick Game Switcher Row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-gray-500 font-semibold shrink-0 pl-1">Chuyển nhanh:</span>
                {games.map((g) => {
                  const isActive = g.id === selectedGame.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGame(g)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                        isActive
                          ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-300'
                          : 'bg-white hover:bg-emerald-50 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {getGameIcon(g.id)}
                      <span>{g.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* THE IFRAME EMBED CONTAINER */}
              <div
                ref={iframeContainerRef}
                className="relative w-full h-[600px] sm:h-[680px] md:h-[740px] bg-slate-950 rounded-3xl overflow-hidden shadow-xl border-2 border-emerald-500/30"
              >
                {/* Loading indicator */}
                {iframeLoading && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-xs text-white">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border-2 border-emerald-400 border-t-transparent animate-spin mb-4" />
                    <p className="text-sm font-bold text-emerald-300">Đang tải không gian 3D {selectedGame.title}...</p>
                    <p className="text-xs text-gray-400 mt-1">Nền tảng game 3D • Vui lòng đợi trong giây lát</p>
                  </div>
                )}

                {/* The iframe element */}
                <iframe
                  key={iframeKey}
                  src={selectedGame.iframeUrl}
                  title={selectedGame.title}
                  className="w-full h-full border-0"
                  allow="fullscreen; accelerometer; gyroscope; camera; microphone; autoplay; vr; xr-spatial-tracking"
                  allowFullScreen
                  loading="lazy"
                  onLoad={() => setIframeLoading(false)}
                />
              </div>

              {/* Instructions & Game Guide Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Controls Guide */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <Gamepad2 className="w-4 h-4 text-emerald-600" />
                    <span>Hướng dẫn điều khiển 3D</span>
                  </div>
                  <ul className="text-xs text-gray-600 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-900 shrink-0">🖱️ Chuột:</span>
                      <span>{selectedGame.controlsGuide.mouse}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-900 shrink-0">⌨️ Bàn phím:</span>
                      <span>{selectedGame.controlsGuide.keyboard}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-gray-900 shrink-0">👆 Tương tác:</span>
                      <span>{selectedGame.controlsGuide.interaction}</span>
                    </li>
                  </ul>
                </div>

                {/* Learning Objectives */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Mục tiêu bài học & Kỹ năng môi trường</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                    {selectedGame.learningObjectives.map((obj: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/60">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Back to cards banner button */}
              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setSelectedGame(null);
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại chọn trò chơi khác</span>
                </button>
              </div>
            </div>
          ) : (
            /* 4 CARDS VIEW (When no game is currently open) */
            <div className="space-y-6">
              {/* Introduction bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">
                      Chọn 1 trong 4 trò chơi để khởi động IFRAME trực tiếp
                    </h3>
                    <p className="text-xs text-emerald-800/80">
                      Bấm "Chơi ngay" – Trò chơi sẽ xuất hiện tức thì trên màn hình mà không cần chuyển sang tab mới!
                    </p>
                  </div>
                </div>

                <div className="text-xs font-bold text-emerald-900 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto shrink-0 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-amber-500" />
                  <span>+{30 * games.length} EcoPoints tối đa</span>
                </div>
              </div>

              {/* 4 INTERACTIVE GAME CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {games.map((game, index) => {
                  const isClaimed = claimedRewardIds.includes(game.id);

                  return (
                    <div
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      className="group bg-white rounded-3xl border border-gray-200/90 hover:border-emerald-500 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer relative"
                    >
                      {/* Image cover container */}
                      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                        <img
                          src={game.image}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                        {/* Top badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 border border-white/10 flex items-center gap-1.5">
                            {getGameIcon(game.id)}
                            <span>{game.badge}</span>
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Edit link button for teacher */}
                            <button
                              onClick={(e) => handleOpenEditModal(e, game)}
                              className="p-1.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-md text-gray-200 hover:text-white transition-colors border border-white/10"
                              title="Tùy chỉnh link Delightex hoặc tên trò chơi"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-amber-950 flex items-center gap-1 shadow-sm">
                              <Coins className="w-3.5 h-3.5" />
                              <span>+{game.pointsReward} pts</span>
                            </span>
                          </div>
                        </div>

                        {/* Bottom image overlay: Game Number & Title */}
                        <div className="absolute bottom-3 left-4 right-4">
                          <div className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 mb-0.5">
                            Trò chơi #{index + 1} • {game.category}
                          </div>
                          <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors">
                            {game.title}
                          </h3>
                        </div>
                      </div>

                      {/* Content body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2.5">
                          <p className="text-xs font-semibold text-emerald-800">
                            {game.subtitle}
                          </p>
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {game.description}
                          </p>

                          {/* Learning highlights snippet */}
                          <div className="pt-2 border-t border-gray-100 space-y-1">
                            {game.learningObjectives.slice(0, 2).map((obj: string, i: number) => (
                              <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="truncate">{obj}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card bottom actions */}
                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                          <div className="text-[10px] text-gray-400 truncate">
                            {game.author}
                          </div>

                          <div className="flex items-center gap-2">
                            {isClaimed && (
                              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Đã hoàn thành</span>
                              </span>
                            )}

                            <button
                              onClick={() => handleSelectGame(game)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs group-hover:bg-emerald-700 transition-colors"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Chơi ngay</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Informational Footer Note */}
              <div className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-xs flex items-start gap-3.5 text-xs text-gray-600">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900">
                    Giới thiệu dự án trò chơi giáo dục môi trường THCS Thốt Nốt
                  </h4>
                  <p className="leading-relaxed text-gray-500">
                    Hệ thống 4 trò chơi do cô Nguyễn Duy Duyên xây dựng nhằm hưởng ứng phong trào xây dựng trường học xanh, sạch, đẹp và đưa công nghệ số hóa 3D vào giảng dạy môn Khoa học tự nhiên & Hoạt động trải nghiệm hướng nghiệp. Các trò chơi tích hợp cơ chế nhúng IFRAME giúp học sinh tiếp cận dễ dàng trên cả máy tính và máy tính bảng mà không bị gián đoạn trình duyệt.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* TAB 3: 2D SORTING GAME */}
      {activeTab === 'sorting2d' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 space-y-6">
          {!gameFinished ? (
            <div className="space-y-6">
              {/* Header stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 pb-3 border-b border-gray-100">
                <span className="font-bold text-emerald-800">
                  Vật phẩm {currentIndex + 1} / {items.length}
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{score} điểm</span>
                  </span>
                  {streak > 1 && (
                    <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>Chuỗi x{streak}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Current Item Card */}
              <div className="bg-gray-50 rounded-3xl p-6 text-center space-y-4 border border-gray-100">
                <div className="w-40 h-40 mx-auto rounded-2xl overflow-hidden bg-white shadow-md border border-gray-200">
                  <img
                    src={currentItem.image}
                    alt={currentItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{currentItem.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                    {currentItem.description}
                  </p>
                </div>
              </div>

              {/* Feedback toast */}
              {feedback && (
                <div
                  className={`p-3 rounded-2xl text-xs font-bold text-center transition-all animate-in fade-in ${
                    feedback.isCorrect
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              {/* 4 Classification Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  disabled={feedback !== null}
                  onClick={() => handleClassify('organic')}
                  className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 text-emerald-900 transition-all text-xs font-bold flex flex-col items-center gap-2 group active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center group-hover:bg-white group-hover:text-emerald-600">
                    🌿
                  </div>
                  <span>Rác Hữu Cơ</span>
                  <span className="text-[10px] text-gray-500 group-hover:text-emerald-100">Thùng Xanh Lá</span>
                </button>

                <button
                  disabled={feedback !== null}
                  onClick={() => handleClassify('recyclable')}
                  className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-500 hover:text-white border border-amber-200 text-amber-900 transition-all text-xs font-bold flex flex-col items-center gap-2 group active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center group-hover:bg-white group-hover:text-amber-600">
                    ♻️
                  </div>
                  <span>Rác Tái Chế</span>
                  <span className="text-[10px] text-gray-500 group-hover:text-amber-100">Thùng Vàng</span>
                </button>

                <button
                  disabled={feedback !== null}
                  onClick={() => handleClassify('hazardous')}
                  className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 text-rose-900 transition-all text-xs font-bold flex flex-col items-center gap-2 group active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center group-hover:bg-white group-hover:text-rose-600">
                    ⚠️
                  </div>
                  <span>Rác Nguy Hại</span>
                  <span className="text-[10px] text-gray-500 group-hover:text-rose-100">Thùng Đỏ</span>
                </button>

                <button
                  disabled={feedback !== null}
                  onClick={() => handleClassify('other')}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-700 hover:text-white border border-slate-200 text-slate-800 transition-all text-xs font-bold flex flex-col items-center gap-2 group active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-500 text-white flex items-center justify-center group-hover:bg-white group-hover:text-slate-700">
                    🗑️
                  </div>
                  <span>Rác Vô Cơ Khác</span>
                  <span className="text-[10px] text-gray-500 group-hover:text-slate-100">Thùng Xám</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                <Trophy className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Hoàn thành màn phân loại rác!</h3>
              <p className="text-xs text-gray-500">
                Bạn đã đạt <strong>{score} điểm</strong> và nhận ngay{' '}
                <strong className="text-amber-600">+30 EcoPoints</strong> vào tài khoản.
              </p>

              <button
                onClick={handleRestartSorting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi lại vòng mới</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ECO QUIZ */}
      {activeTab === 'quiz' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 space-y-6">
          {!quizFinished ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-gray-500 pb-3 border-b border-gray-100">
                <span className="font-bold text-emerald-800">
                  Câu hỏi {currentQuizIndex + 1} / {quizQuestions.length}
                </span>
                <span>Điểm hiện tại: {quizScore}</span>
              </div>

              <h3 className="text-base font-bold text-gray-900 leading-snug">
                {quizQuestions[currentQuizIndex].question}
              </h3>

              <div className="space-y-2.5">
                {quizQuestions[currentQuizIndex].options.map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrectAnswer = idx === quizQuestions[currentQuizIndex].correctIndex;

                  let btnStyle = 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300';
                  if (selectedAnswer !== null) {
                    if (isCorrectAnswer) {
                      btnStyle = 'bg-emerald-600 border-emerald-600 text-white font-bold';
                    } else if (isSelected) {
                      btnStyle = 'bg-red-600 border-red-600 text-white font-bold';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleAnswerQuiz(idx)}
                      className={`w-full text-left p-3.5 text-xs rounded-2xl border transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {selectedAnswer !== null && isCorrectAnswer && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 animate-in fade-in">
                  <span className="font-bold block mb-0.5">Giải thích cặn kẽ:</span>
                  <span>{quizQuestions[currentQuizIndex].explanation}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-gray-900">Hoàn thành bài trắc nghiệm xanh!</h3>
              <p className="text-xs text-gray-500">
                Bạn trả lời đúng <strong>{quizScore}/{quizQuestions.length}</strong> câu hỏi. Nhận ngay{' '}
                <strong className="text-amber-600">+25 EcoPoints</strong>.
              </p>

              <button
                onClick={handleRestartQuiz}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Làm lại trắc nghiệm</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* EDIT MODAL FOR DELIGHTEX LINK (FOR TEACHER) */}
      {editingGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-gray-900">
                  Tùy chỉnh Trò chơi Delightex Edu
                </h3>
              </div>
              <button
                onClick={() => setEditingGame(null)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Bạn có thể cập nhật liên kết iframe từ nền tảng Delightex Edu (ví dụ:{' '}
              <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">https://edu.delightex.com/VDH-FUA</code>) hoặc tên của trò chơi.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Tên trò chơi:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Đường dẫn nhúng IFRAME (Delightex Edu URL):
                </label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  placeholder="https://edu.delightex.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Mô tả tóm tắt:</label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingGame(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEditGame}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
