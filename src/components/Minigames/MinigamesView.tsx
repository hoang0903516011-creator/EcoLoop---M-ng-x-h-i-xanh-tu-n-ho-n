import React, { useState } from 'react';
import {
  Gamepad2,
  Sparkles,
  Maximize2,
  RefreshCw,
  Award,
  ExternalLink,
  CheckCircle,
  HelpCircle,
  Volume2,
  Layers,
  Droplets,
  Recycle,
  Trees,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MinigameItem, UserProfile } from '../../types';
import { MINIGAMES_LIST } from '../../data/mockData';

interface MinigamesViewProps {
  currentUser: UserProfile;
  onAddEcoPoints: (points: number) => void;
}

export const MinigamesView: React.FC<MinigamesViewProps> = ({
  currentUser,
  onAddEcoPoints,
}) => {
  const [games, setGames] = useState<MinigameItem[]>(MINIGAMES_LIST);
  const [activeGameId, setActiveGameId] = useState<string>('game-water');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const activeGame = games.find((g) => g.id === activeGameId) || games[0];

  const handleCompleteGame = (gameId: string) => {
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, completed: true } : g))
    );
    onAddEcoPoints(activeGame.pointsReward || 30);

    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  const reloadGame = () => {
    setIframeKey((prev) => prev + 1);
  };

  const getGameIcon = (id: string) => {
    switch (id) {
      case 'game-water':
        return Droplets;
      case 'game-waste':
        return Recycle;
      case 'game-soil':
      default:
        return Trees;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold">
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>Khu Vực Minigame Giáo Dục 3D Môi Trường</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Khám Phá Thế Giới 3D & Thử Thách Xanh
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Trải nghiệm trực tiếp 3 trò chơi 3D tương tác sống động về bảo vệ nguồn nước, rèn luyện
            phân loại rác tại nguồn và cải tạo đất mẹ. Hoàn thành nhiệm vụ để nhận Điểm Xanh và mở khóa
            huy hiệu danh dự!
          </p>
        </div>
      </div>

      {/* Game Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {games.map((game) => {
          const isSelected = game.id === activeGameId;
          const GameIcon = getGameIcon(game.id);
          return (
            <div
              key={game.id}
              onClick={() => setActiveGameId(game.id)}
              className={`p-4 rounded-3xl border cursor-pointer transition-all duration-200 flex items-start gap-3.5 ${
                isSelected
                  ? 'bg-white border-2 border-emerald-600 shadow-lg ring-2 ring-emerald-500/10'
                  : 'bg-white hover:bg-gray-50 border-gray-200 shadow-xs'
              }`}
            >
              <div
                className={`p-3 rounded-2xl shrink-0 ${
                  isSelected ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                <GameIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900 truncate">{game.title}</h3>
                  {game.completed && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> Đạt
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{game.subtitle}</p>
                <div className="mt-2 flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-700 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />+{game.pointsReward} Điểm Xanh
                  </span>
                  <span className="text-gray-400 text-[11px]">{game.playCount} lượt chơi</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main 3D Game iFrame Viewer */}
      <div
        className={`bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden transition-all duration-200 ${
          isFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : ''
        }`}
      >
        {/* Game Top Controls Bar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/80">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
                <span>{activeGame.title}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                  {activeGame.category}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Reload button */}
            <button
              onClick={reloadGame}
              className="p-2 rounded-xl text-gray-600 hover:text-emerald-700 hover:bg-white border border-gray-200 transition-colors"
              title="Khởi động lại trò chơi"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Open in new tab */}
            <a
              href={activeGame.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-gray-600 hover:text-emerald-700 hover:bg-white border border-gray-200 transition-colors"
              title="Mở trong tab mới"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-gray-200 hover:bg-emerald-50 hover:text-emerald-800 transition-all flex items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
            </button>
          </div>
        </div>

        {/* Embedded Delightex 3D Game iFrame */}
        <div
          className={`relative w-full bg-gray-950 flex-1 ${
            isFullscreen ? 'h-full min-h-[500px]' : 'h-[520px] sm:h-[620px]'
          }`}
        >
          <iframe
            key={iframeKey}
            src={activeGame.url}
            title={activeGame.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking; fullscreen"
            allowFullScreen
          />
        </div>

        {/* Game Footer & Completion Reward */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                Nhiệm vụ: {activeGame.subtitle}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">{activeGame.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeGame.completed ? (
              <span className="px-4 py-2.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Đã nhận +{activeGame.pointsReward} Điểm Xanh</span>
              </span>
            ) : (
              <button
                onClick={() => handleCompleteGame(activeGame.id)}
                className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Hoàn Thành Thử Thách & Nhận Thưởng</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
