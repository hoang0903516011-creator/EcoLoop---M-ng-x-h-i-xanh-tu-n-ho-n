import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeModule } from './modules/HomeModule';
import { EcoMapModule } from './modules/EcoMapModule';
import { SocialFeedModule } from './modules/SocialFeedModule';
import { EventsModule } from './modules/EventsModule';
import { EcoBotModule } from './modules/EcoBotModule';
import { LibraryModule } from './modules/LibraryModule';
import { MinigamesModule } from './modules/MinigamesModule';
import { RewardsModule } from './modules/RewardsModule';
import { ProfileModule } from './modules/ProfileModule';
import { OrgDashboardModule } from './modules/OrgDashboardModule';
import { AdminDashboardModule } from './modules/AdminDashboardModule';
import { WalletModal } from './components/WalletModal';
import { NotificationModal } from './components/NotificationModal';
import { AuthModal } from './components/AuthModal';
import { ChatDrawer } from './components/ChatDrawer';
import { storage } from './services/storageService';
import { RecyclingPoint, UserProfile } from './types';
import {
  Leaf,
  Heart,
  Sparkles,
  MapPin,
  Calendar,
  Gift,
  BookOpen,
  Gamepad2,
  ShieldCheck,
  Building2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<UserProfile>(storage.getCurrentUser());
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Selected EcoMap point and filter state from navigation
  const [selectedMapPoint, setSelectedMapPoint] = useState<RecyclingPoint | null>(null);
  const [mapCategoryFilter, setMapCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setCurrentUser(storage.getCurrentUser());
    };
    update();
    return storage.subscribe(update);
  }, []);

  const handleSelectRecyclingPointFromHome = (point: RecyclingPoint) => {
    setSelectedMapPoint(point);
    setActiveTab('ecomap');
  };

  const handleNavigateToMapWithFilter = (category: string) => {
    setMapCategoryFilter(category);
    setActiveTab('ecomap');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Dynamic View Router */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <HomeModule
            onNavigate={setActiveTab}
            onOpenEcoBot={() => setActiveTab('ecobot')}
            onSelectRecyclingPoint={handleSelectRecyclingPointFromHome}
          />
        )}

        {activeTab === 'ecomap' && (
          <EcoMapModule
            initialPoint={selectedMapPoint}
            preselectedFilter={mapCategoryFilter}
            onClearInitialPoint={() => setSelectedMapPoint(null)}
          />
        )}

        {activeTab === 'social' && (
          <SocialFeedModule
            onOpenChatWithUser={() => setIsChatOpen(true)}
          />
        )}

        {activeTab === 'events' && <EventsModule />}

        {activeTab === 'ecobot' && (
          <EcoBotModule
            onNavigateToMapWithFilter={handleNavigateToMapWithFilter}
            onNavigateToSocial={() => setActiveTab('social')}
          />
        )}

        {activeTab === 'library' && <LibraryModule />}

        {activeTab === 'minigames' && <MinigamesModule />}

        {activeTab === 'rewards' && (
          <RewardsModule
            onOpenWallet={() => setIsWalletOpen(true)}
            onNavigateToScanner={() => setActiveTab('ecobot')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileModule
            onNavigateToScanner={() => setActiveTab('ecobot')}
            onNavigateToEvents={() => setActiveTab('events')}
            onNavigateToRewards={() => setActiveTab('rewards')}
            onOpenWallet={() => setIsWalletOpen(true)}
          />
        )}

        {activeTab === 'org_dashboard' && (
          <OrgDashboardModule onNavigateToEvents={() => setActiveTab('events')} />
        )}

        {activeTab === 'admin_dashboard' && <AdminDashboardModule />}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Global Modals & Drawers */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onNavigateToRewards={() => {
          setIsWalletOpen(false);
          setActiveTab('rewards');
        }}
      />

      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Modern Platform Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center font-black shadow-xs">
                  <Leaf className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">EcoLoop</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mạng xã hội tuần hoàn xanh kết nối học sinh, sinh viên và cộng đồng: EcoMap trạm thu gom rác Cần Thơ, phân loại rác thông minh bằng mô hình Roboflow SAM 3, trao đổi ve chai và đổi thưởng EcoRewards.
              </p>
              <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 inline-block">
                Slogan: Đổi xanh – Sống xanh – Tương lai xanh
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Trụ Cột Hệ Thống</h4>
              <ul className="space-y-2 text-slate-600 font-medium">
                <li>
                  <button onClick={() => setActiveTab('ecomap')} className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Bản đồ trạm thu gom EcoMap</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('ecobot')} className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>EcoBot Quét Rác Roboflow SAM 3</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('social')} className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                    <span>Mạng xã hội chia sẻ & ve chai</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('events')} className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>Sự kiện tình nguyện & chứng nhận</span>
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Tiện Ích & Đổi Thưởng</h4>
              <ul className="space-y-2 text-slate-600 font-medium">
                <li>
                  <button onClick={() => setActiveTab('rewards')} className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                    <Gift className="w-3.5 h-3.5 text-amber-500" />
                    <span>Đổi quà tặng EcoRewards</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('minigames')} className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                    <Gamepad2 className="w-3.5 h-3.5 text-purple-500" />
                    <span>Minigame phân loại & Quiz xanh</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('library')} className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                    <span>Thư viện cẩm nang Luật BVMT 2020</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsWalletOpen(true)} className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                    <span>Ví EcoPoints & Bảng xếp hạng</span>
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Tổ Chức & Quản Trị</h4>
              <ul className="space-y-2 text-slate-600 font-medium">
                <li>
                  <button onClick={() => setActiveTab('org_dashboard')} className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                    <Building2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Dashboard CLB & AI Event Planner</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveTab('admin_dashboard')} className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Dashboard Quản Trị & Kiểm Duyệt</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setIsAuthOpen(true)} className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors">
                    <span>Chuyển đổi vai trò người dùng</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © 2026 EcoLoop Việt Nam. Đồng hành cùng trường học & cộng đồng vì một Đồng bằng sông Cửu Long không rác thải.
            </div>
            <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
              <span>Đổi xanh · Sống xanh · Tương lai xanh</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
