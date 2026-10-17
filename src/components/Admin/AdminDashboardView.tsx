import React, { useState } from 'react';
import {
  Shield,
  Users,
  CheckCircle,
  AlertTriangle,
  Pin,
  Trash2,
  Activity,
  Layers,
  Recycle,
  Sparkles,
  BarChart3,
  Server,
  Clock,
  Check,
  X,
  FileText,
  Eye,
  MapPin,
} from 'lucide-react';
import { Post, UserProfile } from '../../types';

interface AdminDashboardViewProps {
  posts: Post[];
  onPinPost: (postId: string) => void;
  onDeletePost: (postId: string) => void;
  onApprovePost: (postId: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  posts,
  onPinPost,
  onDeletePost,
  onApprovePost,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'published' | 'clubs' | 'stats'>('pending');

  const pendingPosts = posts.filter((p) => p.status === 'pending');
  const publishedPosts = posts.filter((p) => p.status === 'approved');

  // Danh sách các CLB đang chờ duyệt cấp huy hiệu
  const [pendingClubs, setPendingClubs] = useState([
    {
      id: 'p-1',
      name: 'CLB Tái Chế Đại Học Bách Khoa',
      representative: 'Đoàn Quang Khải',
      members: 85,
      date: '14/10/2026',
      status: 'pending',
    },
    {
      id: 'p-2',
      name: 'Nhóm Tình Nguyện Rừng Xanh Tây Nguyên',
      representative: 'H’Linh Niê',
      members: 120,
      date: '12/10/2026',
      status: 'pending',
    },
  ]);

  const handleVerifyClub = (id: string) => {
    setPendingClubs((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-gray-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Khu Vực Quản Trị Hệ Thống GreenNet</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bảng Điều Khiển & Phê Duyệt Nội Dung
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Kiểm duyệt bài viết của người dùng trước khi hiển thị công khai, quản lý thành viên, xét
            duyệt cấp phép CLB và theo dõi chỉ số nhận diện rác thải.
          </p>
        </div>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('pending')}
          className={`p-5 rounded-3xl border cursor-pointer transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Bài Chờ Kiểm Duyệt</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{pendingPosts.length}</div>
          <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
            {pendingPosts.length > 0 ? 'Cần xử lý ngay' : 'Đã duyệt hết'}
          </div>
        </div>

        <div
          onClick={() => setActiveTab('published')}
          className={`p-5 rounded-3xl border cursor-pointer transition-all ${
            activeTab === 'published'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20'
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Bài Đã Xuất Bản</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{publishedPosts.length}</div>
          <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">Đang hiển thị công khai</div>
        </div>

        <div
          onClick={() => setActiveTab('clubs')}
          className={`p-5 rounded-3xl border cursor-pointer transition-all ${
            activeTab === 'clubs'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400/20'
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Tổ Chức / CLB Chờ Duyệt</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">{pendingClubs.length}</div>
          <div className="text-[11px] text-blue-800 font-semibold mt-0.5">Đơn đăng ký mới</div>
        </div>

        <div
          onClick={() => setActiveTab('stats')}
          className={`p-5 rounded-3xl border cursor-pointer transition-all ${
            activeTab === 'stats'
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400/20'
              : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-gray-500">
            <span>Lượt Quét EcoBot</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 mt-1">9,650</div>
          <div className="text-[11px] text-purple-800 font-semibold mt-0.5">AI Bounding Box động</div>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`relative px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>Hàng Đợi Duyệt Bài</span>
          {pendingPosts.length > 0 && (
            <span className="ml-1.5 px-2 py-0.2 rounded-full bg-white text-amber-800 text-xs font-black">
              {pendingPosts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('published')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'published'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Bài Viết Đã Công Khai ({publishedPosts.length})
        </button>

        <button
          onClick={() => setActiveTab('clubs')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'clubs'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Xét Duyệt CLB ({pendingClubs.length})
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'stats'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Thống Kê Rác Thải AI
        </button>
      </div>

      {/* TAB 1: PENDING POSTS QUEUE */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Danh Sách Bài Viết Đang Chờ Phê Duyệt ({pendingPosts.length})</span>
            </h3>
            <span className="text-xs text-gray-500">
              Bài được duyệt sẽ lập tức xuất hiện công khai trên Bảng Tin
            </span>
          </div>

          {pendingPosts.length > 0 ? (
            <div className="space-y-4">
              {pendingPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-3xl p-6 border-2 border-amber-300/80 shadow-md space-y-4"
                >
                  {/* Author Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/10"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                            {post.author.name}
                          </h4>
                          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                            {post.author.roleBadge}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                          <span>Gửi lúc: {post.createdAt}</span>
                          {post.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-gray-500">
                                <MapPin className="w-3 h-3 text-emerald-600" />
                                {post.location}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                      {post.topicTag}
                    </span>
                  </div>

                  {/* Post Content */}
                  <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {post.content}
                  </p>

                  {/* Attached EcoBot Scan if present */}
                  {post.attachedScanResult && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <Recycle className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-emerald-900">
                            Đính kèm quét EcoBot: {post.attachedScanResult.totalItems} vật thể
                          </div>
                          <div className="text-emerald-700">
                            {post.attachedScanResult.itemLabels.join(', ')} • Tái chế:{' '}
                            {post.attachedScanResult.recyclableRatio}%
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-700 text-white font-bold">
                        +{post.attachedScanResult.totalPoints} đ
                      </span>
                    </div>
                  )}

                  {/* Post Images if present */}
                  {post.images && post.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {post.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                        >
                          <img src={img} alt="Hình ảnh bài đăng" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons: Approve or Reject */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button
                      onClick={() => onDeletePost(post.id)}
                      className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                      <span>Từ Chối & Xóa Bài</span>
                    </button>

                    <button
                      onClick={() => onApprovePost(post.id)}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Phê Duyệt & Xuất Bản Lên Bảng Tin</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="font-bold text-gray-900 text-base">
                Tất cả bài viết đều đã được duyệt!
              </h4>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Hiện không có bài viết nào trong hàng đợi. Khi các thành viên khác đăng bài, nội dung
                sẽ lập tức xuất hiện tại đây để bạn kiểm duyệt.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PUBLISHED POSTS */}
      {activeTab === 'published' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-gray-900">
              Quản Lý Bài Viết Đang Công Khai ({publishedPosts.length})
            </h3>
            <span className="text-xs text-gray-400">Bạn có thể ghim hoặc xóa bài bất cứ lúc nào</span>
          </div>

          <div className="space-y-3">
            {publishedPosts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-gray-900">{post.author.name}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                        {post.topicTag}
                      </span>
                      {post.isPinned && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500 text-white flex items-center gap-0.5">
                          <Pin className="w-3 h-3" /> Đang ghim
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-1 mt-1">{post.content}</p>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {post.createdAt} • {post.likesCount} Cổ vũ • {post.commentsCount} Bình luận
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onPinPost(post.id)}
                    className={`p-2 rounded-xl text-xs font-semibold border ${
                      post.isPinned
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                    title="Ghim bài viết lên đầu trang"
                  >
                    <Pin className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeletePost(post.id)}
                    className="p-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-gray-200 transition-colors"
                    title="Xóa bài viết vi phạm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CLUBS VERIFICATION */}
      {activeTab === 'clubs' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Xét Duyệt Cấp Phép CLB / Tổ Chức Môi Trường ({pendingClubs.length})</span>
            </h3>
          </div>

          {pendingClubs.length > 0 ? (
            <div className="space-y-3">
              {pendingClubs.map((club) => (
                <div
                  key={club.id}
                  className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{club.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Người đại diện: <strong>{club.representative}</strong> • Quy mô: {club.members}{' '}
                      thành viên • Nộp đơn: {club.date}
                    </p>
                  </div>
                  <button
                    onClick={() => handleVerifyClub(club.id)}
                    className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Cấp Huy Hiệu Xác Thực</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-500">
              Đã xét duyệt xong toàn bộ tổ chức môi trường.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: WASTE STATS */}
      {activeTab === 'stats' && (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>Phân Bổ Các Loại Rác Thải Nhận Diện Qua EcoBot</span>
            </h3>
            <span className="text-xs text-gray-400">Thu thập từ cảm biến AI Vision</span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-blue-800">Rác tái chế (Chai nhựa PET, Lon nhôm, Giấy, Carton)</span>
                <span className="text-blue-800">45% (4,342 mẫu)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-emerald-800">Rác hữu cơ (Vỏ trái cây, Thức ăn thừa, Bã cà phê)</span>
                <span className="text-emerald-800">32% (3,088 mẫu)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-amber-800">Rác vô cơ / Rác còn lại (Hộp xốp, Túi nilon bẩn)</span>
                <span className="text-amber-800">14% (1,351 mẫu)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '14%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-red-800">Rác nguy hại & Điện tử (Pin cũ, Ắc quy, Dây cáp, Bo mạch)</span>
                <span className="text-red-800">9% (869 mẫu)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '9%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
