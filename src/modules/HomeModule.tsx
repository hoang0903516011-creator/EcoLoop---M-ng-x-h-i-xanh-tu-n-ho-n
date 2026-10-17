import React from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Coins,
  Recycle,
  Clock,
  Phone,
  Heart,
  MessageCircle,
  ChevronRight,
  TreePine,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { RecyclingPoint } from '../types';

interface HomeModuleProps {
  onNavigate: (tab: string) => void;
  onOpenEcoBot: () => void;
  onSelectRecyclingPoint?: (point: RecyclingPoint) => void;
}

export const HomeModule: React.FC<HomeModuleProps> = ({ onNavigate, onOpenEcoBot, onSelectRecyclingPoint }) => {
  const points = storage.getRecyclingPoints().slice(0, 3);
  const events = storage.getEvents().slice(0, 3);
  const posts = storage.getPosts().slice(0, 2);
  const articles = storage.getArticles().slice(0, 3);

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 px-6 py-12 md:py-16 md:px-12 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-5 border border-emerald-500/30">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>EcoLoop · Hệ Sinh Thái Kinh Tế Tuần Hoàn Cần Thơ</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
            EcoLoop – Đổi Xanh <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
              Vì Tương Lai Xanh
            </span>
          </h1>

          <p className="text-emerald-100/90 text-sm md:text-base max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Tra cứu điểm thu gom rác EcoMap, quét phân loại rác thông minh bằng mô hình AI Roboflow SAM 3, trao đổi đồ cũ tuần hoàn và tham gia các chiến dịch vì dòng sông Hậu xanh mát.
          </p>

          {/* 4 Action Gateways */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <button
              onClick={() => onNavigate('ecomap')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-all group hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white">Khám phá EcoMap</span>
              <span className="text-[10px] text-emerald-200">Điểm gom Cần Thơ</span>
            </button>

            <button
              onClick={onOpenEcoBot}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-400/30 backdrop-blur-md transition-all group hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-amber-200">Quét rác AI</span>
              <span className="text-[10px] text-amber-300/80">Roboflow SAM 3</span>
            </button>

            <button
              onClick={() => onNavigate('events')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-all group hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white">Sự kiện dọn rác</span>
              <span className="text-[10px] text-emerald-200">Nhận giấy chứng nhận</span>
            </button>

            <button
              onClick={() => onNavigate('social')}
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-all group hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-md group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white">Cộng đồng xanh</span>
              <span className="text-[10px] text-emerald-200">Trao đổi & Ve chai</span>
            </button>
          </div>
        </div>
      </section>

      {/* Highlights Statistics Bar */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-emerald-100">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-50">
          <div className="pt-4 md:pt-0">
            <div className="text-2xl md:text-3xl font-black text-emerald-950 font-mono tabular-nums">240+</div>
            <p className="text-xs text-gray-500 font-medium mt-1 flex items-center justify-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" /> Tình nguyện viên
            </p>
          </div>
          <div className="pt-4 md:pt-0">
            <div className="text-2xl md:text-3xl font-black text-emerald-950 font-mono tabular-nums">12+</div>
            <p className="text-xs text-gray-500 font-medium mt-1 flex items-center justify-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600" /> Trạm EcoMap Cần Thơ
            </p>
          </div>
          <div className="pt-4 md:pt-0">
            <div className="text-2xl md:text-3xl font-black text-emerald-950 font-mono tabular-nums">8+</div>
            <p className="text-xs text-gray-500 font-medium mt-1 flex items-center justify-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Chiến dịch xanh
            </p>
          </div>
          <div className="pt-4 md:pt-0">
            <div className="text-2xl md:text-3xl font-black text-emerald-950 font-mono tabular-nums">580+</div>
            <p className="text-xs text-gray-500 font-medium mt-1 flex items-center justify-center gap-1">
              <Recycle className="w-3.5 h-3.5 text-emerald-600" /> kg Rác tuần hoàn
            </p>
          </div>
          <div className="pt-4 md:pt-0 col-span-2 md:col-span-1">
            <div className="text-2xl md:text-3xl font-black text-amber-600 font-mono tabular-nums">26,500+</div>
            <p className="text-xs text-gray-500 font-medium mt-1 flex items-center justify-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" /> EcoPoints trao thưởng
            </p>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Sự kiện môi trường nổi bật</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Tham gia dọn rác, bảo vệ sông ngòi và nhận Giấy chứng nhận xanh</p>
          </div>
          <button
            onClick={() => onNavigate('events')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:gap-1.5 transition-all"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col group"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={ev.image}
                  alt={ev.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-emerald-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {ev.category}
                </span>
                <span className="absolute top-3 right-3 bg-amber-400 text-amber-950 text-xs font-black px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 font-mono">
                  <Coins className="w-3 h-3" /> +{ev.ecoPointsReward} pts
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-medium text-emerald-700 mb-1">{ev.organizationName}</div>
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                    {ev.title}
                  </h3>
                  <div className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{ev.dateTime}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Đã đăng ký: <strong>{ev.registeredCount}/{ev.maxParticipants}</strong>
                  </span>
                  <button
                    onClick={() => onNavigate('events')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nearby Collection Points Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              <span>Trạm thu gom rác EcoMap gần bạn</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Tiếp nhận pin cũ nguy hại, vỏ lon, chai nhựa và giấy tái chế</p>
          </div>
          <button
            onClick={() => onNavigate('ecomap')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:gap-1.5 transition-all"
          >
            <span>Mở EcoMap</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {points.map((pt) => (
            <div
              key={pt.id}
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:border-emerald-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-1">{pt.name}</h3>
                  {pt.distanceKm && (
                    <span className="text-[10px] font-extrabold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full shrink-0 font-mono">
                      {pt.distanceKm} km
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{pt.address}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px]">{pt.operatingHours}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {pt.acceptedWastes.map((w) => (
                    <span
                      key={w}
                      className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <a
                  href={`tel:${pt.phone}`}
                  className="text-xs text-gray-600 hover:text-emerald-700 flex items-center gap-1 font-medium"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{pt.phone}</span>
                </a>
                <button
                  onClick={() => {
                    if (onSelectRecyclingPoint) onSelectRecyclingPoint(pt);
                    onNavigate('ecomap');
                  }}
                  className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                >
                  Chỉ đường
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Community Feed Preview & Green Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Community Posts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Hoạt động cộng đồng tuần hoàn</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Chia sẻ đồ cũ, trao đổi ve chai và lan tỏa lối sống xanh</p>
            </div>
            <button
              onClick={() => onNavigate('social')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Xem bảng tin</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 space-y-3">
                <div className="flex items-center gap-3">
                  <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{post.authorName}</span>
                      <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 rounded">
                        {post.postType}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {post.authorSchool || 'Thành viên EcoLoop'} · {post.createdAt}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed">{post.content}</p>

                {post.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden max-h-56">
                    {post.images.map((img, idx) => (
                      <img key={idx} src={img} alt="Hình ảnh bài đăng" className="w-full h-full object-cover" />
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-50 text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <Heart className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                      {post.emotions?.greenHeart || 0} Yêu thương
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {post.comments.length} Bình luận
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate('social')}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Bình luận & Chia sẻ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Knowledge Base & News Highlights */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <TreePine className="w-5 h-5 text-emerald-600" />
              <span>Cẩm nang sống xanh</span>
            </h2>
            <button
              onClick={() => onNavigate('library')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Thư viện
            </button>
          </div>

          <div className="space-y-3">
            {articles.map((art) => (
              <div
                key={art.id}
                onClick={() => onNavigate('library')}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-emerald-300 transition-all cursor-pointer flex gap-3 group"
              >
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {art.category}
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 line-clamp-2 mt-1 group-hover:text-emerald-700 transition-colors">
                    {art.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 mt-1 block">{art.readTime}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Minigame Banner */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-5 text-amber-950 shadow-md">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900 mb-1">
              <Sparkles className="w-4 h-4" /> Minigame 3D & Eco Quiz
            </div>
            <h4 className="font-extrabold text-base leading-tight mb-2">
              Khám phá 4 trò chơi 3D Delightex & Đấu trường nhặt rác 3D
            </h4>
            <p className="text-xs text-amber-950/80 mb-4">
              Thử thách 3D bảo vệ đất, nước, không khí và rèn luyện phân loại rác nhận tới +40 EcoPoints!
            </p>
            <button
              onClick={() => onNavigate('minigames')}
              className="w-full py-2 bg-white text-amber-950 hover:bg-amber-50 font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Chơi ngay 3D
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
