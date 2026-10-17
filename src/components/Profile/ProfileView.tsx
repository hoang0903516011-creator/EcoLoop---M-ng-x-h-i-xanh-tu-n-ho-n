import React, { useState } from 'react';
import {
  Edit3,
  MapPin,
  Calendar,
  Award,
  Recycle,
  Sparkles,
  TreePine,
  Users,
  Shield,
  User,
  CheckCircle2,
  Phone,
  Building,
  ExternalLink,
} from 'lucide-react';
import { UserProfile, Post, UserRole } from '../../types';
import { PostCard } from '../Feed/PostCard';
import { EditProfileModal } from './EditProfileModal';

interface ProfileViewProps {
  currentUser: UserProfile;
  userPosts: Post[];
  onSaveProfile: (updated: Partial<UserProfile>) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, content: string, parentCommentId?: string) => void;
  onSharePost: (postId: string) => void;
  onSwitchRole: (role: UserRole) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  userPosts,
  onSaveProfile,
  onLikePost,
  onAddComment,
  onSharePost,
  onSwitchRole,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'badges' | 'org'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 sm:h-64 w-full bg-emerald-900 relative">
          <img
            src={currentUser.coverPhoto}
            alt="Ảnh bìa"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        {/* Profile Info Row */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 mb-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white shrink-0 -mt-12 sm:-mt-16"
              />
              <div className="pt-2 sm:pb-2">
                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                    {currentUser.name}
                  </h1>
                  {currentUser.role === 'organization' && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                      CLB Xác Thực
                    </span>
                  )}
                  {currentUser.role === 'admin' && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      Quản Trị Viên
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{currentUser.handle}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-2 justify-center sm:justify-start">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    {currentUser.location}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">{currentUser.greenRank}</span>
                </div>
              </div>
            </div>

            {/* Action Edit Profile */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 border border-gray-200 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Chỉnh Sửa Hồ Sơ</span>
            </button>
          </div>

          {/* Bio */}
          <div className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-2xl text-center sm:text-left">
            {currentUser.bio}
          </div>

          {/* Eco Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100">
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
              <div className="text-lg font-black text-emerald-800">
                {currentUser.ecoPoints.toLocaleString('vi-VN')}
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 mt-0.5">Điểm Xanh tích lũy</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-100 text-center">
              <div className="text-lg font-black text-teal-800">
                {currentUser.stats?.scansCount || 0}
              </div>
              <div className="text-[11px] font-semibold text-teal-700 mt-0.5">Lượt quét EcoBot</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-center">
              <div className="text-lg font-black text-blue-800">
                {currentUser.stats?.recycledKg || 0} kg
              </div>
              <div className="text-[11px] font-semibold text-blue-700 mt-0.5">Rác đã phân loại</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-center">
              <div className="text-lg font-black text-amber-800">
                {currentUser.stats?.campaignsJoined || 0}
              </div>
              <div className="text-[11px] font-semibold text-amber-700 mt-0.5">Chiến dịch tham gia</div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Switcher Quick Card */}
      <div className="bg-emerald-50/70 rounded-3xl p-4 sm:p-5 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-xs sm:text-sm text-emerald-950 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Chuyển đổi vai trò người dùng (Thử nghiệm 3 cấp bậc)</span>
          </h3>
          <p className="text-[11px] text-emerald-800 mt-0.5">
            Đang đăng nhập với vai trò: <strong>{currentUser.roleBadge}</strong>. Bấm nút dưới để thử
            nghiệm quyền của Cá nhân, Tổ chức CLB hoặc Admin:
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSwitchRole('individual')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentUser.role === 'individual'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Cá Nhân
          </button>
          <button
            onClick={() => onSwitchRole('organization')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentUser.role === 'organization'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Tổ Chức / CLB
          </button>
          <button
            onClick={() => onSwitchRole('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentUser.role === 'admin'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'posts'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Bài Viết Đã Đăng ({userPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'badges'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Huy Hiệu & Thành Tích ({currentUser.badges.length})
        </button>

        {currentUser.role === 'organization' && (
          <button
            onClick={() => setActiveTab('org')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'org'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Hồ Sơ Tổ Chức CLB
          </button>
        )}
      </div>

      {/* Tab 1: User's Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {userPosts.length > 0 ? (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onLikePost={onLikePost}
                onAddComment={onAddComment}
                onSharePost={onSharePost}
              />
            ))
          ) : (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
              <Recycle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">Chưa có bài viết nào được đăng</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Hãy chia sẻ hành động xanh hoặc kết quả quét rác đầu tiên của bạn!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Badges Collection */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {currentUser.badges.map((badge) => (
            <div
              key={badge.id}
              className="bg-white rounded-3xl p-5 border border-emerald-100 shadow-xs flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-2xl flex items-center justify-center shrink-0 border border-emerald-200">
                {badge.icon}
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">{badge.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                {badge.unlockedAt && (
                  <span className="text-[10px] text-emerald-700 font-semibold mt-2 block">
                    Mở khóa: {badge.unlockedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Organization Details */}
      {activeTab === 'org' && currentUser.organizationInfo && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <Building className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-bold text-base text-gray-900">
                {currentUser.organizationInfo.orgName}
              </h3>
              <p className="text-xs text-gray-500">
                {currentUser.organizationInfo.category} • Thành lập năm{' '}
                {currentUser.organizationInfo.foundedYear}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <span className="font-bold text-gray-500 block mb-1">Số lượng thành viên hoạt động:</span>
              <span className="font-black text-gray-900 text-sm">
                {currentUser.organizationInfo.membersCount} tình nguyện viên
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <span className="font-bold text-gray-500 block mb-1">Trạng thái cấp phép:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Đã xác thực tổ chức xanh
              </span>
            </div>
            {currentUser.organizationInfo.phone && (
              <div className="p-3 bg-gray-50 rounded-2xl">
                <span className="font-bold text-gray-500 block mb-1">Đường dây nóng (Hotline):</span>
                <span className="font-bold text-gray-900">{currentUser.organizationInfo.phone}</span>
              </div>
            )}
            {currentUser.organizationInfo.address && (
              <div className="p-3 bg-gray-50 rounded-2xl">
                <span className="font-bold text-gray-500 block mb-1">Trụ sở điều hành:</span>
                <span className="font-bold text-gray-900">{currentUser.organizationInfo.address}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={currentUser}
        onSaveProfile={onSaveProfile}
      />
    </div>
  );
};
