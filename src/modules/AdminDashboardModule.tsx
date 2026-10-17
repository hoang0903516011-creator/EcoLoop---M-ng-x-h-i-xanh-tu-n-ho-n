import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Gift,
  Users,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Server,
  Plus,
  Search,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { Post, RecyclingPoint, EcoReward, UserProfile } from '../types';

export const AdminDashboardModule: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(storage.getCurrentUser());
  const [posts, setPosts] = useState<Post[]>(storage.getPosts());
  const [points, setPoints] = useState<RecyclingPoint[]>(storage.getRecyclingPoints());
  const [rewards, setRewards] = useState<EcoReward[]>(storage.getRewards());
  const [activeTab, setActiveTab] = useState<'moderation' | 'ecomap' | 'rewards' | 'system'>('moderation');
  const [searchPostQuery, setSearchPostQuery] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setCurrentUser(storage.getCurrentUser());
      setPosts(storage.getPosts());
      setPoints(storage.getRecyclingPoints());
      setRewards(storage.getRewards());
    };
    update();
    return storage.subscribe(update);
  }, []);

  const showNotice = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Critical Admin Action: Delete violating post
  const handleDeletePost = (postId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết vi phạm này khỏi mạng xã hội?')) {
      const success = storage.deletePost(postId);
      if (success) {
        setPosts(storage.getPosts());
        showNotice('Đã gỡ bỏ bài viết vi phạm thành công!');
      }
    }
  };

  // Admin Action: Pin / Unpin post
  const handleTogglePin = (postId: string) => {
    storage.togglePinPost(postId);
    setPosts(storage.getPosts());
    showNotice('Đã cập nhật ghim bài viết nổi bật!');
  };

  // Admin Action: Verify recycling point
  const handleVerifyPoint = (pointId: string) => {
    storage.verifyRecyclingPoint(pointId);
    setPoints(storage.getRecyclingPoints());
    showNotice('Đã xác thực trạm thu gom rác trên EcoMap!');
  };

  // Admin Action: Update reward quantity
  const handleUpdateRewardStock = (rewardId: string, addAmount: number) => {
    storage.updateRewardQuantity(rewardId, addAmount);
    setRewards(storage.getRewards());
    showNotice('Đã cập nhật số lượng quà tặng trong kho!');
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.content.toLowerCase().includes(searchPostQuery.toLowerCase()) ||
      (p.authorName || '').toLowerCase().includes(searchPostQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 pb-20">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-gray-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold tracking-wide border border-amber-400/20">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Trung Tâm Quản Trị Hệ Thống Toàn Quyền</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Bảng Kiểm Duyệt & Vận Hành EcoLoop
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Quản lý an toàn nội dung cộng đồng, kiểm duyệt gỡ bỏ bài đăng vi phạm tức thì, xác thực trạm thu gom rác EcoMap và điều phối kho quà thưởng EcoRewards.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 min-w-[220px]">
            <div className="text-xs uppercase text-slate-400 font-semibold mb-2">Trạng thái hệ sinh thái</div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Máy chủ hoạt động bình thường</span>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Mô hình Roboflow SAM 3 & Gemini Vision sẵn sàng
            </div>
          </div>
        </div>
      </div>

      {/* System Toast Notice */}
      {notificationMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Admin KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Tổng bài viết mạng xã hội</div>
          <div className="text-2xl font-mono font-bold text-slate-900 mt-1">{posts.length}</div>
          <div className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đăng công khai tức thì</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Trạm thu gom EcoMap</div>
          <div className="text-2xl font-mono font-bold text-slate-900 mt-1">{points.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            Đã xác thực: {points.filter((p) => p.verified).length} trạm
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Danh mục quà thưởng</div>
          <div className="text-2xl font-mono font-bold text-slate-900 mt-1">{rewards.length} món</div>
          <div className="text-xs text-slate-500 mt-1">Kho EcoRewards Cần Thơ</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Cơ chế kiểm duyệt</div>
          <div className="text-sm font-bold text-slate-900 mt-2">Hậu kiểm (Post-moderation)</div>
          <div className="text-xs text-slate-500 mt-0.5">Admin gỡ bài khi phát hiện vi phạm</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        {[
          { id: 'moderation', label: `Kiểm duyệt bài viết (${posts.length})`, icon: FileText },
          { id: 'ecomap', label: `Quản lý trạm EcoMap (${points.length})`, icon: MapPin },
          { id: 'rewards', label: `Kho quà tặng (${rewards.length})`, icon: Gift },
          { id: 'system', label: 'Cấu hình & Giám sát AI', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors relative ${
                activeTab === tab.id
                  ? 'text-emerald-700'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Moderation / Post Deletion */}
      {activeTab === 'moderation' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchPostQuery}
                onChange={(e) => setSearchPostQuery(e.target.value)}
                placeholder="Tìm bài viết theo nội dung hoặc tên tác giả..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="text-xs text-slate-500">
              Đang hiển thị {filteredPosts.length} bài viết cộng đồng
            </div>
          </div>

          <div className="border border-slate-200 bg-white rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {filteredPosts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Không tìm thấy bài viết nào phù hợp.
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="p-5 flex flex-col md:flex-row items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{post.authorName}</span>
                          <span className="text-[11px] font-normal text-slate-400">({post.authorRole})</span>
                          {post.isPinned && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                              Đang ghim
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">Đăng lúc: {post.createdAt}</div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                      {post.content}
                    </p>

                    {post.images && post.images.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {post.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="Media"
                            className="w-20 h-20 rounded-xl object-cover border border-slate-200"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {post.postType}
                      </span>
                      <span>Lượt thích: {post.likes?.length || 0}</span>
                      <span>Bình luận: {post.comments?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => handleTogglePin(post.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                        post.isPinned
                          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {post.isPinned ? 'Bỏ ghim' : 'Ghim bài'}
                    </button>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center gap-1.5 transition-colors"
                      title="Gỡ bỏ bài viết vi phạm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa bài vi phạm</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: EcoMap Station Management */}
      {activeTab === 'ecomap' && (
        <div className="space-y-4">
          <div className="border border-slate-200 bg-white rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {points.map((pt) => (
              <div key={pt.id} className="p-5 flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base">{pt.name}</h4>
                    {pt.verified ? (
                      <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Đã xác thực
                      </span>
                    ) : (
                      <span className="text-[11px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Chờ Admin xác thực
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pt.address}, {pt.city}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {pt.acceptedWastes.map((w, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="self-end md:self-center shrink-0">
                  {!pt.verified && (
                    <button
                      onClick={() => handleVerifyPoint(pt.id)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-2xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Xác thực điểm thu gom</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Rewards Inventory Management */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((rw) => (
              <div
                key={rw.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex gap-3 items-center">
                    <img
                      src={rw.image}
                      alt={rw.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{rw.name}</h4>
                      <div className="text-xs text-slate-500">Tài trợ: {rw.sponsor}</div>
                      <div className="text-xs font-mono font-bold text-amber-600">
                        {rw.ecoPointsCost} EcoPoints
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span>Số lượng tồn kho:</span>
                    <strong className="text-sm font-mono text-slate-900">
                      {rw.remainingQuantity} phần
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleUpdateRewardStock(rw.id, 5)}
                    className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    +5 phần
                  </button>
                  <button
                    onClick={() => handleUpdateRewardStock(rw.id, 20)}
                    className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    +20 phần
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: System & AI Diagnostics */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <h3 className="text-lg font-bold text-slate-900">Thông Số Kỹ Thuật & Cấu Hình AI</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="font-bold text-emerald-800 text-sm">Mô hình thị giác máy tính chính</div>
              <div>• Tên dịch vụ: Roboflow Inference API (Serverless)</div>
              <div>• Workspace: vo-duy-hoang</div>
              <div>• Workflow ID: general-segmentation-api-2</div>
              <div>• Kiểu mô hình: SAM 3 Instance Segmentation</div>
              <div>• Chuẩn hóa tọa độ: [ymin, xmin, ymax, xmax] theo tỷ lệ 0-1000</div>
            </div>

            <div className="border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="font-bold text-emerald-800 text-sm">Mô hình AI dự phòng & tư vấn</div>
              <div>• Tên dịch vụ: Google Gemini API (Interactions & Vision)</div>
              <div>• Model: gemini-3.5-flash-lite / gemini-3.5-flash</div>
              <div>• Tác vụ: EcoBot Trợ lý xanh & AI Event Planner cho CLB</div>
              <div>• Quy chuẩn dữ liệu rác: Phân loại rác tại nguồn Luật BVMT 2020</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
