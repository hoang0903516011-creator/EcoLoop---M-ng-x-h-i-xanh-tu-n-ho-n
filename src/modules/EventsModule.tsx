import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Coins,
  Award,
  Plus,
  QrCode,
  Search,
  X,
  FileCheck,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { GreenEvent, UserProfile } from '../types';

export const EventsModule: React.FC = () => {
  const [events, setEvents] = useState<GreenEvent[]>(storage.getEvents());
  const [currentUser, setCurrentUser] = useState<UserProfile>(storage.getCurrentUser());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEventModal, setActiveEventModal] = useState<GreenEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState<GreenEvent | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'Dọn rác' as GreenEvent['category'],
    organizationName: currentUser.organizationName || currentUser.name,
    dateTime: 'Chủ Nhật tuần tới, 07:30 - 11:30',
    location: '',
    maxParticipants: 50,
    ecoPointsReward: 100,
    certificateProvided: true,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
    status: 'upcoming' as const,
  });

  useEffect(() => {
    const update = () => {
      setEvents(storage.getEvents());
      setCurrentUser(storage.getCurrentUser());
    };
    return storage.subscribe(update);
  }, []);

  const handleRegister = (eventId: string) => {
    storage.registerEvent(eventId);
  };

  const handleUnregister = (eventId: string) => {
    storage.unregisterEvent(eventId);
  };

  const handleCheckIn = (event: GreenEvent) => {
    storage.checkInEventUser(event.id, currentUser.id, event.ecoPointsReward);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.location) return;
    storage.createEvent({
      ...newEvent,
      organizationId: currentUser.id,
    });
    setShowCreateModal(false);
  };

  const categories = ['all', 'Dọn rác', 'Trồng cây', 'Workshop môi trường', 'Đổi quà'];

  const filteredEvents = events.filter((ev) => {
    const matchesCat = selectedCategory === 'all' || ev.category === selectedCategory;
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.organizationName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-emerald-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-emerald-600" />
              <span>Sự Kiện Xanh & Tình Nguyện Môi Trường</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Đăng ký tham gia chiến dịch làm sạch sông Hậu, trồng cây nhận EcoPoints cùng Giấy chứng nhận
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo chiến dịch mới</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên chiến dịch, địa điểm hoặc tổ chức..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === c
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c === 'all' ? 'Tất cả' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((ev) => {
          const isRegistered = ev.registeredUserIds.includes(currentUser.id);
          const isAttended = ev.attendedUserIds.includes(currentUser.id);
          return (
            <div
              key={ev.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={ev.image}
                  alt={ev.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="bg-emerald-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {ev.category}
                  </span>
                  {ev.certificateProvided && (
                    <span className="bg-purple-900/80 backdrop-blur-md text-purple-200 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Award className="w-3 h-3" /> Chứng nhận
                    </span>
                  )}
                </div>
                <span className="absolute top-3 right-3 bg-amber-400 text-amber-950 text-xs font-black px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 font-mono">
                  <Coins className="w-3 h-3" /> +{ev.ecoPointsReward} pts
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-700 block">{ev.organizationName}</span>
                  <h3 className="font-bold text-base text-gray-900 leading-snug group-hover:text-emerald-700 transition-colors">
                    {ev.title}
                  </h3>
                  <div className="space-y-1 text-xs text-gray-500 pt-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="font-medium text-gray-700">{ev.dateTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>
                        Số lượng: <strong>{ev.registeredCount}/{ev.maxParticipants}</strong> tình nguyện viên
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveEventModal(ev)}
                    className="text-xs font-bold text-gray-600 hover:text-emerald-700 underline"
                  >
                    Xem chi tiết
                  </button>

                  <div className="flex items-center gap-1.5">
                    {isAttended ? (
                      <button
                        onClick={() => setShowCertificateModal(ev)}
                        className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Giấy chứng nhận</span>
                      </button>
                    ) : isRegistered ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCheckIn(ev)}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1 transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Điểm danh</span>
                        </button>
                        <button
                          onClick={() => handleUnregister(ev.id)}
                          className="px-2 py-1.5 text-gray-400 hover:text-red-600 text-xs"
                          title="Hủy đăng ký"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRegister(ev.id)}
                        disabled={ev.registeredCount >= ev.maxParticipants}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-gray-200 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                      >
                        {ev.registeredCount >= ev.maxParticipants ? 'Hết chỗ' : 'Đăng ký ngay'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {activeEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="relative h-48">
              <img
                src={activeEventModal.image}
                alt={activeEventModal.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveEventModal(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <span className="text-[11px] font-bold text-emerald-700 block mb-1">
                  {activeEventModal.organizationName}
                </span>
                <h2 className="text-xl font-bold text-gray-900">{activeEventModal.title}</h2>
              </div>

              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-950 font-semibold">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>{activeEventModal.dateTime}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-950 font-semibold">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{activeEventModal.location}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-950 font-semibold">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>Nhận ngay +{activeEventModal.ecoPointsReward} EcoPoints khi hoàn thành</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-900 mb-1">Mục tiêu & Nội dung:</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{activeEventModal.description}</p>
              </div>

              {activeEventModal.schedule && (
                <div>
                  <h4 className="text-xs font-bold text-gray-900 mb-2">Lịch trình chi tiết:</h4>
                  <div className="space-y-1.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs">
                    {activeEventModal.schedule.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-bold text-emerald-800 w-28 shrink-0">{s.time}</span>
                        <span className="text-gray-700">{s.activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveEventModal(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 rounded-xl"
              >
                Đóng
              </button>
              {activeEventModal.registeredUserIds.includes(currentUser.id) ? (
                <button
                  onClick={() => {
                    handleCheckIn(activeEventModal);
                    setActiveEventModal(null);
                  }}
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 shadow-xs"
                >
                  Điểm danh nhận điểm
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleRegister(activeEventModal.id);
                    setActiveEventModal(null);
                  }}
                  className="px-5 py-2 text-xs font-bold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 shadow-xs"
                >
                  Đăng ký tham gia
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden p-8 border-4 border-emerald-600 relative">
            <button
              onClick={() => setShowCertificateModal(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <Award className="w-10 h-10" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800">
                EcoLoop Mạng Xã Hội Tuần Hoàn Xanh
              </span>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                Giấy Chứng Nhận Tình Nguyện Viên
              </h2>
              <p className="text-xs text-gray-500">Trân trọng trao tặng cho:</p>
              <div className="text-xl font-bold text-emerald-900 border-b-2 border-dashed border-emerald-300 pb-2 max-w-xs mx-auto">
                {currentUser.name}
              </div>
              <p className="text-xs text-gray-600 max-w-md mx-auto leading-relaxed">
                Đã tích cực tham gia và hoàn thành xuất sắc các hoạt động vì môi trường trong chiến dịch:
                <br />
                <strong className="text-gray-900 text-sm">{showCertificateModal.title}</strong>
                <br />
                Đóng góp vào hành trình xây dựng lối sống xanh và kinh tế tuần hoàn tại Cần Thơ.
              </p>
              <div className="pt-6 flex justify-between items-center text-xs text-gray-400 border-t border-gray-100">
                <div>Mã số: ECO-{showCertificateModal.id}</div>
                <div>Xác thực bởi: {showCertificateModal.organizationName}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Tạo Chiến Dịch Môi Trường Mới</h3>
                <p className="text-emerald-200 text-xs">Phát động chiến dịch tới cộng đồng học sinh & tình nguyện viên</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-emerald-200 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Tên sự kiện / chiến dịch</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="VD: Dọn rác bờ kè sông Hậu, làm sạch bến Ninh Kiều..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Thể loại</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Dọn rác">Dọn rác</option>
                    <option value="Trồng cây">Trồng cây</option>
                    <option value="Workshop môi trường">Workshop môi trường</option>
                    <option value="Đổi quà">Đổi quà</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Điểm thưởng EcoPoints</label>
                  <input
                    type="number"
                    value={newEvent.ecoPointsReward}
                    onChange={(e) => setNewEvent({ ...newEvent, ecoPointsReward: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Thời gian diễn ra</label>
                <input
                  type="text"
                  value={newEvent.dateTime}
                  onChange={(e) => setNewEvent({ ...newEvent, dateTime: e.target.value })}
                  placeholder="Chủ Nhật, 08:00 - 11:30"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Địa điểm tập kết</label>
                <input
                  type="text"
                  required
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Địa chỉ nơi diễn ra sự kiện tại Cần Thơ..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Mô tả và dụng cụ chuẩn bị</label>
                <textarea
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Dụng cụ được cấp phát (găng tay, bao tải, kẹp rác) và lưu ý an toàn..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 shadow-xs"
                >
                  Phát động sự kiện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
