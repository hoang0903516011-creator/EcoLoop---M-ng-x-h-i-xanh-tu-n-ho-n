import React, { useState, useEffect } from 'react';
import {
  X,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Trophy,
  Gift,
  HelpCircle,
  Users,
  Sparkles,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { UserProfile, PointTransaction } from '../types';
import {
  LEADERBOARD_USERS,
  LEADERBOARD_SCHOOLS,
  LEADERBOARD_CLUBS,
} from '../data/seedData';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRewards: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onNavigateToRewards }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(storage.getCurrentUser());
  const [transactions, setTransactions] = useState<PointTransaction[]>(storage.getTransactions());
  const [leaderboardTab, setLeaderboardTab] = useState<'users' | 'schools' | 'clubs'>('users');

  useEffect(() => {
    const update = () => {
      setCurrentUser(storage.getCurrentUser());
      setTransactions(storage.getTransactions());
    };
    update();
    return storage.subscribe(update);
  }, []);

  if (!isOpen) return null;

  const totalEarned = transactions
    .filter((t) => t.type === 'earn')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSpent = transactions
    .filter((t) => t.type === 'spend')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-lg">
              <Coins className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Ví Eco & Điểm Thưởng EcoPoints</h2>
              <p className="text-emerald-200 text-xs mt-0.5">Tích lũy từ hành động xanh để đổi quà sinh thái</p>
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] text-emerald-200 block">Số dư khả dụng</span>
              <span className="text-2xl font-black text-amber-300 font-mono tabular-nums">
                {currentUser.ecoPoints.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-200 ml-1">pts</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] text-emerald-200 block">Tổng điểm tích lũy</span>
              <span className="text-xl font-bold text-emerald-300 font-mono tabular-nums">
                +{totalEarned.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-200 ml-1">pts</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] text-emerald-200 block">Đã đổi thưởng</span>
              <span className="text-xl font-bold text-teal-200 font-mono tabular-nums">
                -{totalSpent.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-200 ml-1">pts</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-emerald-50 px-6 py-3 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              Cấp độ hiện tại: <strong>{currentUser.level || 'Level 3 – Green Warrior'}</strong>
            </span>
          </div>
          <button
            onClick={() => {
              onClose();
              onNavigateToRewards();
            }}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-xs transition-colors"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Đổi Thưởng</span>
          </button>
        </div>

        {/* Modal Body: Tabs */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section: Lịch sử điểm */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Lịch sử tích lũy & đổi thưởng</span>
            </h3>
            <div className="space-y-2">
              {transactions.slice(0, 6).map((tx) => {
                const isEarn = tx.type === 'earn';
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          isEarn ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {isEarn ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-800">{tx.title}</div>
                        <div className="text-[11px] text-gray-500">
                          {tx.description} · {tx.createdAt}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-black font-mono tabular-nums ${
                        isEarn ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {isEarn ? `+${tx.amount}` : tx.amount} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Bảng Xếp Hạng Xanh */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Bảng Xếp Hạng Xanh Tây Đô</span>
              </h3>
              <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setLeaderboardTab('users')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    leaderboardTab === 'users' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-gray-500'
                  }`}
                >
                  Cá nhân
                </button>
                <button
                  onClick={() => setLeaderboardTab('schools')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    leaderboardTab === 'schools' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-gray-500'
                  }`}
                >
                  Trường học
                </button>
                <button
                  onClick={() => setLeaderboardTab('clubs')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    leaderboardTab === 'clubs' ? 'bg-white shadow-xs text-emerald-800 font-bold' : 'text-gray-500'
                  }`}
                >
                  CLB Xanh
                </button>
              </div>
            </div>

            {leaderboardTab === 'users' && (
              <div className="space-y-2">
                {LEADERBOARD_USERS.map((u) => (
                  <div
                    key={u.rank}
                    className={`flex items-center justify-between p-2.5 rounded-xl border ${
                      u.name === currentUser.name ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 text-center font-black text-xs ${
                          u.rank === 1
                            ? 'text-amber-500 text-sm'
                            : u.rank === 2
                            ? 'text-gray-500'
                            : u.rank === 3
                            ? 'text-amber-700'
                            : 'text-gray-400'
                        }`}
                      >
                        #{u.rank}
                      </span>
                      <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {u.name === currentUser.name && (
                            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 rounded-sm font-semibold">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500">{u.school}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-700 font-mono tabular-nums">
                        {u.points.toLocaleString()} pts
                      </span>
                      <span className="block text-[10px] text-gray-400 font-medium">{u.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {leaderboardTab === 'schools' && (
              <div className="space-y-2">
                {LEADERBOARD_SCHOOLS.map((s) => (
                  <div key={s.rank} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-bold text-xs text-gray-500">#{s.rank}</span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                        {s.logoText}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">{s.name}</div>
                        <div className="text-[10px] text-gray-500">{s.members} thành viên tham gia</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 font-mono tabular-nums">
                      {s.totalPoints.toLocaleString()} pts
                    </span>
                  </div>
                ))}
              </div>
            )}

            {leaderboardTab === 'clubs' && (
              <div className="space-y-2">
                {LEADERBOARD_CLUBS.map((c) => (
                  <div key={c.rank} className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-bold text-xs text-gray-500">#{c.rank}</span>
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">{c.name}</div>
                        <div className="text-[10px] text-gray-500">
                          {c.eventsCount} chiến dịch · {c.members} thành viên
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-700 font-mono tabular-nums">
                      {c.totalPoints.toLocaleString()} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* How to Earn EcoPoints Helper */}
          <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
            <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>Cách nhận thêm điểm thưởng EcoPoints:</span>
            </h4>
            <ul className="text-xs text-emerald-800/90 space-y-1.5 list-disc pl-5">
              <li>
                Quét phân loại rác AI Roboflow EcoBot: <strong>+15 – 35 pts / lần</strong>
              </li>
              <li>
                Tham gia chiến dịch dọn rác, trồng cây: <strong>+80 – 150 pts / sự kiện</strong>
              </li>
              <li>
                Đăng bài chia sẻ kinh nghiệm sống xanh: <strong>+20 pts</strong>
              </li>
              <li>
                Hoàn thành minigame và thử thách 7 ngày: <strong>+30 – 70 pts</strong>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
