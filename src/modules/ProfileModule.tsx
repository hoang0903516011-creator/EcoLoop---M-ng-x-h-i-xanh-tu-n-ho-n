import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Calendar,
  Award,
  Recycle,
  Sparkles,
  TreePine,
  ShieldCheck,
  Building2,
  Edit3,
  Coins,
  CheckCircle2,
  FileCheck2,
  Heart,
  MessageSquare,
  Share2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { UserProfile, Post, Badge, PointTransaction } from '../types';

interface ProfileModuleProps {
  onNavigateToScanner?: () => void;
  onNavigateToEvents?: () => void;
  onNavigateToRewards?: () => void;
  onOpenWallet?: () => void;
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({
  onNavigateToScanner,
  onNavigateToEvents,
  onNavigateToRewards,
  onOpenWallet,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(storage.getCurrentUser());
  const [allPosts, setAllPosts] = useState<Post[]>(storage.getPosts());
  const [transactions, setTransactions] = useState<PointTransaction[]>(storage.getTransactions());
  const [activeTab, setActiveTab] = useState<'posts' | 'badges' | 'certificates' | 'history'>('posts');
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editLocation, setEditLocation] = useState(currentUser.location);
  const [editSchool, setEditSchool] = useState(currentUser.schoolOrOrg || '');

  useEffect(() => {
    const update = () => {
      const user = storage.getCurrentUser();
      setCurrentUser(user);
      setAllPosts(storage.getPosts());
      setTransactions(storage.getTransactions());
      setEditName(user.name);
      setEditBio(user.bio);
      setEditLocation(user.location);
      setEditSchool(user.schoolOrOrg || '');
    };
    update();
    return storage.subscribe(update);
  }, []);

  const userPosts = allPosts.filter(
    (p) => p.authorId === currentUser.id || p.authorName === currentUser.name
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateProfile({
      name: editName.trim(),
      bio: editBio.trim(),
      location: editLocation.trim(),
      schoolOrOrg: editSchool.trim(),
    });
    setIsEditing(false);
  };

  // Level progress calculation
  const getLevelInfo = (points: number) => {
    if (points >= 3500) return { current: 'Level 5 – Planet Guardian', next: 'Max Level', percent: 100 };
    if (points >= 1501) return { current: 'Level 4 – Eco Hero', next: 'Level 5 (3,500 pts)', percent: Math.round(((points - 1501) / (3500 - 1501)) * 100) };
    if (points >= 601) return { current: 'Level 3 – Green Warrior', next: 'Level 4 (1,500 pts)', percent: Math.round(((points - 601) / (1500 - 601)) * 100) };
    if (points >= 201) return { current: 'Level 2 – Eco Explorer', next: 'Level 3 (600 pts)', percent: Math.round(((points - 201) / (600 - 201)) * 100) };
    return { current: 'Level 1 – Green Starter', next: 'Level 2 (200 pts)', percent: Math.round((points / 200) * 100) };
  };

  const levelInfo = getLevelInfo(currentUser.ecoPoints);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 pb-20">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Cover Photo */}
        <div className="h-44 sm:h-60 w-full bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 relative">
          {currentUser.coverPhoto && (
            <img
              src={currentUser.coverPhoto}
              alt="Cover"
              className="w-full h-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-4 right-4 hidden sm:block">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white shrink-0"
              />
              <div className="space-y-1.5 sm:pb-2">
                <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
                  <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900">
                    {currentUser.name}
                  </h1>
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {currentUser.roleBadge || 'Thành viên xanh'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 justify-center sm:justify-start flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {currentUser.location}
                  </span>
                  {currentUser.schoolOrOrg && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {currentUser.schoolOrOrg}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Tham gia: {currentUser.joinedDate || 'Tháng 10/2026'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:pb-2">
              <button
                onClick={() => setIsEditing(true)}
                className="sm:hidden bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa</span>
              </button>
              <button
                onClick={onOpenWallet}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Coins className="w-4 h-4 text-amber-300 fill-amber-300/20" />
                <span>Ví EcoPoints: {currentUser.ecoPoints}</span>
              </button>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-slate-700 max-w-3xl leading-relaxed">
            {currentUser.bio || 'Chưa có tiểu sử giới thiệu.'}
          </p>

          {/* Level Progress */}
          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-sm text-slate-900">{levelInfo.current}</span>
              </div>
              <div className="text-xs text-slate-500">
                Mục tiêu tiếp theo: <strong className="text-slate-800">{levelInfo.next}</strong>
              </div>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, levelInfo.percent))}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1.5 font-mono">
              <span>{currentUser.ecoPoints} PTS</span>
              <span>{levelInfo.percent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Recycle className="w-5 h-5" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">
            {currentUser.wasteRecycledKg || 12.8} <span className="text-xs text-slate-400">kg</span>
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Rác gom & tái chế</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">
            {currentUser.eventsJoined || 4}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Sự kiện tham gia</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">
            {currentUser.badges?.length || 3}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Huy hiệu đạt được</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900">
            {userPosts.length || 2}
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">Bài viết chia sẻ</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-6 overflow-x-auto">
          {[
            { id: 'posts', label: `Bài viết (${userPosts.length})` },
            { id: 'badges', label: `Huy hiệu xanh (${currentUser.badges?.length || 0})` },
            { id: 'certificates', label: 'Chứng nhận tình nguyện' },
            { id: 'history', label: 'Lịch sử tích lũy điểm' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors relative ${
                activeTab === tab.id
                  ? 'text-emerald-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
              <Recycle className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-800">Chưa có bài viết nào</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hãy quét rác tái chế bằng EcoBot hoặc đăng bài chia sẻ kinh nghiệm sống xanh lên cộng đồng nhé!
              </p>
              <button
                onClick={onNavigateToScanner}
                className="mt-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Quét rác ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                      {post.postType}
                    </span>
                    <span>{post.createdAt}</span>
                  </div>
                  <p className="text-sm text-slate-800 whitespace-pre-line line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>
                  {post.images && post.images.length > 0 && (
                    <div className="h-44 rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={post.images[0]}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <Heart className="w-3.5 h-3.5 fill-emerald-600" />
                      {(post.likes?.length || 0) + (post.emotions?.greenHeart || 0)} lượt yêu thích
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {post.comments?.length || 0} bình luận
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Badges */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(currentUser.badges || []).map((badge) => (
            <div
              key={badge.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex items-start gap-4 shadow-2xs hover:border-emerald-300 transition-colors"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-200 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                {badge.icon}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">{badge.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{badge.description}</p>
                {badge.unlockedAt && (
                  <div className="text-[11px] text-emerald-600 font-medium pt-1">
                    Đã mở khóa: {badge.unlockedAt}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Certificates */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl border border-emerald-200 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                <FileCheck2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Mã xác thực: ECO-CERT-2026-CT01
                </span>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  Giấy Chứng Nhận: Chiến Binh Làm Sạch Bờ Sông Hậu
                </h3>
                <p className="text-xs text-slate-600">
                  Cấp bởi: Ban Thường Vụ Đoàn Trường THCS Thốt Nốt & CLB Môi Trường Sống Xanh Cần Thơ.
                </p>
              </div>
            </div>

            <button
              onClick={() => alert('Chứng nhận điện tử đã được xác thực an toàn trên hệ sinh thái EcoLoop.')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem chứng nhận điện tử</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Transactions History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">Chưa có giao dịch điểm nào.</div>
          ) : (
            transactions.map((tx) => (
              <div key={tx.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-sm">{tx.title}</div>
                  <div className="text-xs text-slate-500">{tx.description}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{tx.createdAt}</div>
                </div>
                <div
                  className={`font-mono font-bold text-sm shrink-0 ${
                    tx.type === 'earn' ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {tx.type === 'earn' ? `+${tx.amount}` : `-${tx.amount}`} pts
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Edit Profile */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProfile}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Chỉnh Sửa Hồ Sơ</h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tiểu sử sống xanh</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Khu vực sinh sống</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Trường học / Tổ chức</label>
                <input
                  type="text"
                  value={editSchool}
                  onChange={(e) => setEditSchool(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
              >
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
