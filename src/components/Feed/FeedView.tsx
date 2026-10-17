import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Filter,
  Flame,
  Award,
  Users,
  TreePine,
  Recycle,
  Gamepad2,
  Calendar,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { Post, UserProfile } from '../../types';
import { PostCard } from './PostCard';

interface FeedViewProps {
  posts: Post[];
  currentUser: UserProfile;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, content: string, parentCommentId?: string) => void;
  onSharePost: (postId: string) => void;
  onOpenCreatePost: () => void;
  onNavigateToTab: (tab: string) => void;
  onApprovePost?: (postId: string) => void;
  onDeletePost?: (postId: string) => void;
  onPinPost?: (postId: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  currentUser,
  onLikePost,
  onAddComment,
  onSharePost,
  onOpenCreatePost,
  onNavigateToTab,
  onApprovePost,
  onDeletePost,
  onPinPost,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const isAdmin = currentUser.role === 'admin';

  const pendingCount = posts.filter((p) => p.status === 'pending').length;

  const filterTags = [
    { id: 'all', label: 'Tất cả bài viết' },
    ...(isAdmin && pendingCount > 0
      ? [{ id: 'pending', label: `Chờ duyệt (${pendingCount})`, highlight: true }]
      : []),
    { id: '#ChiếnDịchCLB', label: 'Chiến Dịch CLB' },
    { id: '#TáiChế', label: 'Mẹo Tái Chế' },
    { id: '#SốngXanh', label: 'Lối Sống Xanh' },
    { id: '#DọnRác', label: 'Dọn Rác Cộng Đồng' },
    { id: '#ZeroWaste', label: 'Zero Waste' },
    { id: 'my_posts', label: 'Bài viết của tôi' },
  ];

  // Lọc bài viết hiển thị
  const filteredPosts = posts.filter((post) => {
    // Nếu là user thường, chỉ xem được bài đã duyệt HOẶC bài do chính mình đăng đang chờ duyệt
    if (!isAdmin) {
      if (post.status === 'pending' && post.author.id !== currentUser.id) {
        return false;
      }
    }

    if (selectedTag === 'all') return true;
    if (selectedTag === 'pending') return post.status === 'pending';
    if (selectedTag === 'my_posts') return post.author.id === currentUser.id;
    return post.topicTag === selectedTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Admin Moderation Alert Banner if there are pending posts */}
          {isAdmin && pendingCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 flex items-center justify-between text-xs text-amber-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  Có <strong>{pendingCount} bài viết mới</strong> đang chờ kiểm duyệt trước khi hiển thị công khai.
                </span>
              </div>
              <button
                onClick={() => onNavigateToTab('admin')}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                Mở hàng đợi duyệt
              </button>
            </div>
          )}

          {/* Quick Create Post Bar */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100 shadow-sm flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/10 shrink-0"
            />
            <button
              onClick={onOpenCreatePost}
              className="flex-1 bg-gray-50 hover:bg-emerald-50/60 border border-gray-200 hover:border-emerald-200 rounded-2xl px-4 py-3 text-left text-xs sm:text-sm text-gray-500 transition-all cursor-pointer"
            >
              Hôm nay bạn có hành động xanh nào? Chia sẻ cùng cộng đồng...
            </button>
            <button
              onClick={() => onNavigateToTab('scanner')}
              className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex items-center gap-1.5 text-xs font-semibold shrink-0"
              title="Quét rác nhanh bằng EcoBot"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Quét rác AI</span>
            </button>
          </div>

          {/* Filter Tags Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {filterTags.map((tag: any) => (
              <button
                key={tag.id}
                onClick={() => setSelectedTag(tag.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedTag === tag.id
                    ? tag.highlight
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-emerald-700 text-white shadow-xs'
                    : tag.highlight
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onLikePost={onLikePost}
                  onAddComment={onAddComment}
                  onSharePost={onSharePost}
                  onApprovePost={onApprovePost}
                  onDeletePost={onDeletePost}
                  onPinPost={onPinPost}
                />
              ))
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                <Recycle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                <h4 className="font-bold text-gray-800 text-base">Chưa có bài viết trong mục này</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Hãy là người đầu tiên đăng bài hoặc thực hiện quét rác để chia sẻ hành động xanh cùng mọi người!
                </p>
                <button
                  onClick={onOpenCreatePost}
                  className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700"
                >
                  Tạo bài viết ngay
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Shortcuts Promo */}
          <div className="bg-gradient-to-br from-teal-800 to-emerald-900 rounded-3xl p-5 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-200 bg-white/10 px-2.5 py-0.5 rounded-full">
                Trải Nghiệm Tương Tác
              </span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Trợ Lý EcoBot & Game 3D</h3>
              <p className="text-xs text-teal-100/90 mt-1">
                Nhận diện rác thực tế bằng ảnh chụp và tham gia 3 trò chơi 3D giáo dục môi trường.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onNavigateToTab('scanner')}
                className="px-3 py-2.5 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>Quét rác AI</span>
              </button>
              <button
                onClick={() => onNavigateToTab('games')}
                className="px-3 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-emerald-500/30"
              >
                <Gamepad2 className="w-3.5 h-3.5 text-teal-300" />
                <span>Khu Game 3D</span>
              </button>
            </div>
          </div>

          {/* Green Leaderboard Widget */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-gray-900">Bảng Vinh Danh Xanh</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                Tháng 10
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/60">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&auto=format&fit=crop&q=80"
                  alt="CLB Sống Xanh"
                  className="w-8 h-8 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate">
                    CLB Môi Trường Sống Xanh
                  </div>
                  <div className="text-[10px] text-gray-500">Tổ chức • 28 chiến dịch</div>
                </div>
                <span className="text-xs font-extrabold text-amber-700 shrink-0">15.8k đ</span>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-colors">
                <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Cá nhân"
                  className="w-8 h-8 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate">Nguyễn Văn Xanh</div>
                  <div className="text-[10px] text-gray-500">Cá nhân • 42 lượt quét</div>
                </div>
                <span className="text-xs font-bold text-emerald-700 shrink-0">1,450 đ</span>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 transition-colors">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-bold text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Trần Hoàng Nam"
                  className="w-8 h-8 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-900 truncate">Trần Hoàng Nam</div>
                  <div className="text-[10px] text-gray-500">Tình nguyện viên</div>
                </div>
                <span className="text-xs font-bold text-emerald-700 shrink-0">1,120 đ</span>
              </div>
            </div>
          </div>

          {/* Community Eco Metrics */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Chỉ Số Tác Động Cộng Đồng</span>
            </h3>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="text-base font-black text-emerald-800">14.2 tấn</div>
                <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                  Rác tái chế đã thu gom
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100">
                <div className="text-base font-black text-teal-800">3,450 cây</div>
                <div className="text-[10px] font-semibold text-teal-700 mt-0.5">
                  Cây xanh đã được trồng
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="text-base font-black text-blue-800">9,650</div>
                <div className="text-[10px] font-semibold text-blue-700 mt-0.5">
                  Lượt quét rác qua EcoBot
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                <div className="text-base font-black text-amber-800">48 CLB</div>
                <div className="text-[10px] font-semibold text-amber-700 mt-0.5">
                  Tổ chức môi trường xác thực
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
