import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Users,
  Sparkles,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  Send,
  Loader2,
  FileText,
  Award,
  ListTodo,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { planEventWithAI } from '../services/aiService';
import { GreenEvent, AIEventPlan, UserProfile } from '../types';
import confetti from 'canvas-confetti';

interface OrgDashboardModuleProps {
  onNavigateToEvents?: () => void;
}

export const OrgDashboardModule: React.FC<OrgDashboardModuleProps> = ({
  onNavigateToEvents,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(storage.getCurrentUser());
  const [events, setEvents] = useState<GreenEvent[]>(storage.getEvents());
  const [activeTab, setActiveTab] = useState<'events' | 'planner' | 'volunteers'>('events');

  // AI Planner state
  const [plannerPrompt, setPlannerPrompt] = useState(
    'Lập kế hoạch dọn rác và thu gom pin cũ tại bãi bồi cồn Cái Khế Cần Thơ cho 40 sinh viên trong 3 tiếng sáng Chủ Nhật'
  );
  const [planningLoading, setPlanningLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState<AIEventPlan | null>(null);
  const [createSuccessNotice, setCreateSuccessNotice] = useState<string | null>(null);

  // Quick event creation modal state
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDateTime, setNewDateTime] = useState('Chủ Nhật, 07:30 - 11:30');
  const [newLocation, setNewLocation] = useState('Bến Ninh Kiều, TP. Cần Thơ');
  const [newMaxParticipants, setNewMaxParticipants] = useState(50);
  const [newPoints, setNewPoints] = useState(100);
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    const update = () => {
      setCurrentUser(storage.getCurrentUser());
      setEvents(storage.getEvents());
    };
    update();
    return storage.subscribe(update);
  }, []);

  const handleGenerateAIPlan = async () => {
    if (!plannerPrompt.trim() || planningLoading) return;
    setPlanningLoading(true);
    setCreateSuccessNotice(null);

    try {
      const plan = await planEventWithAI(plannerPrompt.trim());
      setAiPlan(plan);
    } catch {
      // Fallback already built-in via service
    } finally {
      setPlanningLoading(false);
    }
  };

  const handleCreateEventFromPlan = () => {
    if (!aiPlan) return;

    storage.createEvent({
      organizationId: currentUser.id,
      title: aiPlan.title,
      organizationName: currentUser.name,
      category: 'Dọn rác',
      dateTime: 'Chủ Nhật tuần này, 07:30 - 11:00',
      location: 'Cồn Cái Khế, Ninh Kiều, TP. Cần Thơ',
      city: 'Cần Thơ',
      maxParticipants: 50,
      ecoPointsReward: 120,
      image:
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
      description: `${aiPlan.summary}\n\nThông điệp: ${aiPlan.communicationMessage}`,
    });

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setCreateSuccessNotice('Đã xuất bản thành công sự kiện lên trang Sự Kiện Xanh!');
    setEvents(storage.getEvents());
  };

  const handleQuickCheckin = (eventId: string) => {
    // Check-in volunteer and award points
    storage.addEcoPoints(
      100,
      'Điểm danh hoàn thành sự kiện xanh',
      'Được xác nhận bởi Ban tổ chức CLB'
    );
    confetti({ particleCount: 50, spread: 50 });
    alert('Đã duyệt điểm danh thành công và cộng 100 EcoPoints cho tình nguyện viên!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide border border-teal-400/20">
              <Building2 className="w-3.5 h-3.5" />
              <span>Bảng Điều Khiển Ban Chủ Nhiệm / CLB Môi Trường</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Quản Lý Hoạt Động & Kế Hoạch Xanh
            </h1>
            <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed">
              Tổ chức các chiến dịch dọn rác, thu hồi pin cũ, quản lý tình nguyện viên và sử dụng <strong>EcoLoop AI Event Planner</strong> để tự động lên lịch trình sự kiện chi tiết.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('planner')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>AI Event Planner</span>
            </button>
            <button
              onClick={() => setIsCreatingEvent(true)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-4 py-3 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Sự Kiện Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        {[
          { id: 'events', label: `Chiến dịch của bạn (${events.length})`, icon: Calendar },
          { id: 'planner', label: 'AI Event Planner (Tạo lịch trình)', icon: Sparkles },
          { id: 'volunteers', label: 'Tình nguyện viên & Điểm danh', icon: Users },
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

      {/* Tab 1: Events Management */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 overflow-hidden relative">
                    <img
                      src={ev.image}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-emerald-900/80 text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                        {ev.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 space-y-2.5">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-2">
                      {ev.title}
                    </h3>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ev.dateTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
                  <div className="text-xs">
                    <span className="text-slate-500">Đã đăng ký: </span>
                    <strong className="text-emerald-700 font-mono">
                      {ev.registeredCount} / {ev.maxParticipants}
                    </strong>
                  </div>

                  <button
                    onClick={() => handleQuickCheckin(ev.id)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    Duyệt điểm danh
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: AI Event Planner */}
      {activeTab === 'planner' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Trợ Lý Trí Tuệ Nhân Tạo Google Gemini</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                EcoLoop AI Event Planner
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                Nhập ý tưởng hoặc yêu cầu chiến dịch môi trường của CLB (địa điểm, quy mô số người, thời gian). Trí tuệ nhân tạo sẽ lập tức tạo ra kế hoạch tác chiến chi tiết, timeline, danh sách bảo hộ và quy tắc an toàn.
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={plannerPrompt}
                onChange={(e) => setPlannerPrompt(e.target.value)}
                placeholder="Nhập mô tả sự kiện: Ví dụ dọn rác, thu gom pin, trồng cây..."
                className="w-full border border-slate-200 rounded-2xl p-4 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold">Mẫu nhanh:</span>
                  <button
                    onClick={() =>
                      setPlannerPrompt('Thu gom và đổi sen đá lấy pin cũ tại cổng trường THCS Thốt Nốt cho 300 học sinh')
                    }
                    className="underline hover:text-emerald-700"
                  >
                    Đổi pin lấy sen đá
                  </button>
                  <span>•</span>
                  <button
                    onClick={() =>
                      setPlannerPrompt('Chiến dịch làm sạch rác nổi và lục bình trên rạch Cái Răng')
                    }
                    className="underline hover:text-emerald-700"
                  >
                    Làm sạch rạch Cái Răng
                  </button>
                </div>

                <button
                  onClick={handleGenerateAIPlan}
                  disabled={planningLoading || !plannerPrompt.trim()}
                  className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2 transition-all shadow-xs"
                >
                  {planningLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lập kế hoạch...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Lập kế hoạch bằng AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Notice after event created */}
          {createSuccessNotice && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-emerald-900 text-sm animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-medium">{createSuccessNotice}</span>
            </div>
          )}

          {/* AI Plan Output Display */}
          {aiPlan && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    Kế hoạch đề xuất bởi AI
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {aiPlan.title}
                  </h3>
                </div>

                <button
                  onClick={handleCreateEventFromPlan}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo sự kiện ngay từ bản này</span>
                </button>
              </div>

              {/* Summary */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 space-y-1">
                <div className="font-bold text-emerald-900">Mục tiêu chiến dịch:</div>
                <p>{aiPlan.description || aiPlan.summary}</p>
                {aiPlan.communicationMessage && (
                  <div className="pt-2 text-emerald-800 font-semibold italic">
                    Khẩu hiệu truyền thông: &ldquo;{aiPlan.communicationMessage}&rdquo;
                  </div>
                )}
              </div>

              {/* Timeline Grid */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Khung Thời Gian & Hoạt Động Chi Tiết</span>
                </h4>
                <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                  {(aiPlan.timeline || []).map((t, idx) => (
                    <div key={idx} className="p-3.5 flex items-start gap-4 text-xs sm:text-sm">
                      <div className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md shrink-0">
                        {t.time}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">{t.activity}</div>
                        {t.personInCharge && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Phụ trách: {t.personInCharge}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equipment & Safety 2-col */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-teal-600" />
                    <span>Dụng Cụ Bảo Hộ & Thu Gom</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {(aiPlan.equipmentNeeded || []).map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Quy Tắc An Toàn & Sơ Cứu</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-amber-950">
                    {(aiPlan.safetyNotes || []).map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Volunteers & Rapid Check-in */}
      {activeTab === 'volunteers' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Danh Sách Tình Nguyện Viên Điểm Danh</h3>
              <p className="text-xs text-slate-500">
                Xác thực sự có mặt của tình nguyện viên để cấp 100 EcoPoints và Giấy chứng nhận xanh điện tử.
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden text-xs sm:text-sm">
            {[
              { name: 'Nguyễn Văn An', school: 'Đại học Cần Thơ', campaign: 'Làm sạch bờ sông Hậu', status: 'checked' },
              { name: 'Lê Thị Mai', school: 'THCS Thốt Nốt', campaign: 'Đổi rác lấy sen đá', status: 'checked' },
              { name: 'Trần Hoàng Nam', school: 'Đại học Y Dược Cần Thơ', campaign: 'Thu hồi pin cũ Cần Thơ', status: 'pending' },
              { name: 'Phạm Minh Tuấn', school: 'Đoàn phường Ninh Kiều', campaign: 'Làm sạch bờ sông Hậu', status: 'pending' },
            ].map((v, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">{v.name}</div>
                  <div className="text-xs text-slate-500">
                    {v.school} • Chiến dịch: <strong className="text-slate-700">{v.campaign}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {v.status === 'checked' ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Đã điểm danh (+100 pts)
                    </span>
                  ) : (
                    <button
                      onClick={() => alert(`Đã duyệt điểm danh cho tình nguyện viên ${v.name}!`)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-2xs"
                    >
                      Duyệt (+100 pts)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Quick Create Event */}
      {isCreatingEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              storage.createEvent({
                organizationId: currentUser.id,
                title: newTitle,
                organizationName: currentUser.name,
                category: 'Chiến dịch xanh',
                dateTime: newDateTime,
                location: newLocation,
                city: 'Cần Thơ',
                maxParticipants: Number(newMaxParticipants),
                ecoPointsReward: Number(newPoints),
                image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80',
                description: newDescription,
              });
              setIsCreatingEvent(false);
              confetti({ particleCount: 50, spread: 50 });
              setEvents(storage.getEvents());
            }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Tạo Chiến Dịch Mới</h3>
              <button
                type="button"
                onClick={() => setIsCreatingEvent(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên chiến dịch</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Ngày Hội Thu Gom Pin & Đổi Quà Xanh..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thời gian</label>
                  <input
                    type="text"
                    value={newDateTime}
                    onChange={(e) => setNewDateTime(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Địa điểm</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số lượng TNV tối đa</label>
                  <input
                    type="number"
                    value={newMaxParticipants}
                    onChange={(e) => setNewMaxParticipants(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Điểm thưởng (PTS)</label>
                  <input
                    type="number"
                    value={newPoints}
                    onChange={(e) => setNewPoints(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mô tả chiến dịch</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Mô tả mục đích, vật dụng cần mang theo..."
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreatingEvent(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
              >
                Đăng sự kiện
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
