import React, { useState, useEffect } from 'react';
import {
  Leaf,
  MapPin,
  MessageSquare,
  Calendar,
  Sparkles,
  BookOpen,
  Gamepad2,
  Gift,
  Bell,
  User,
  ShieldCheck,
  Building2,
  ChevronDown,
  Menu,
  X,
  Coins,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { UserProfile, UserRole } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenWallet: () => void;
  onOpenNotifications: () => void;
  onOpenAuth: () => void;
  onOpenChat: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenWallet,
  onOpenNotifications,
  onOpenAuth,
  onOpenChat,
  searchQuery,
  setSearchQuery,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(storage.getCurrentUser());
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const user = storage.getCurrentUser();
      setCurrentUser(user);
      const notifs = storage.getNotifications();
      setUnreadCount(notifs.filter((n) => !n.read).length);
    };
    update();
    return storage.subscribe(update);
  }, []);

  const handleSwitchRole = (role: UserRole) => {
    storage.switchUserByRole(role);
    setRoleMenuOpen(false);
    setUserMenuOpen(false);
    if (role === 'ORGANIZATION' || role === 'organization') {
      setActiveTab('org_dashboard');
    } else if (role === 'ADMIN' || role === 'admin') {
      setActiveTab('admin_dashboard');
    }
  };

  const navItems = [
    { id: 'home', label: 'Trang chủ', icon: Leaf },
    { id: 'ecomap', label: 'EcoMap', icon: MapPin },
    { id: 'social', label: 'Mạng xã hội', icon: MessageSquare },
    { id: 'events', label: 'Sự kiện', icon: Calendar },
    { id: 'ecobot', label: 'EcoBot AI', icon: Sparkles, badge: 'Roboflow' },
    { id: 'library', label: 'Thư viện', icon: BookOpen },
    { id: 'minigames', label: 'Minigame', icon: Gamepad2 },
    { id: 'rewards', label: 'Đổi thưởng', icon: Gift },
  ];

  const normalizedRole = currentUser.role.toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      {/* Top Banner / Announcement */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> Slogan
            </span>
            <span className="truncate">Đổi xanh – Sống xanh – Tương lai xanh</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {/* Quick Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors px-2.5 py-0.5 rounded-full text-emerald-100 font-medium"
              >
                <span>Vai trò:</span>
                <span className="text-white font-bold underline decoration-emerald-400">
                  {normalizedRole === 'USER' && 'Cá nhân / Sinh viên'}
                  {normalizedRole === 'ORGANIZATION' && 'Tổ chức / CLB'}
                  {normalizedRole === 'ADMIN' && 'Quản trị viên (Admin)'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-1 w-60 bg-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3.5 py-1.5 font-bold text-gray-500 border-b border-gray-100 text-[11px]">
                    Chuyển nhanh vai trò Demo:
                  </div>
                  <button
                    onClick={() => handleSwitchRole('USER')}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-emerald-50 ${
                      normalizedRole === 'USER' ? 'text-emerald-700 font-bold bg-emerald-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div>Cá nhân / Sinh viên</div>
                        <div className="text-[10px] text-gray-400">Nguyễn Duy Duyên (THCS Thốt Nốt)</div>
                      </div>
                    </div>
                    {normalizedRole === 'USER' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleSwitchRole('ORGANIZATION')}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-emerald-50 ${
                      normalizedRole === 'ORGANIZATION' ? 'text-teal-700 font-bold bg-emerald-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-teal-600" />
                      <div>
                        <div>Tổ chức / CLB Xanh</div>
                        <div className="text-[10px] text-gray-400">CLB Môi Trường Xanh Cần Thơ</div>
                      </div>
                    </div>
                    {normalizedRole === 'ORGANIZATION' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleSwitchRole('ADMIN')}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-emerald-50 ${
                      normalizedRole === 'ADMIN' ? 'text-purple-700 font-bold bg-emerald-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <div>
                        <div>Quản trị viên (Admin)</div>
                        <div className="text-[10px] text-gray-400">Ban Quản Trị EcoLoop</div>
                      </div>
                    </div>
                    {normalizedRole === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                storage.resetToSeed();
                window.location.reload();
              }}
              title="Đặt lại dữ liệu mẫu"
              className="hidden md:flex items-center gap-1 hover:text-emerald-200 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Dữ liệu gốc</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-emerald-950">EcoLoop</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm">
                  Cần Thơ
                </span>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium hidden sm:block">Mạng xã hội tuần hoàn</p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs relative mx-2">
            <Search className="w-4 h-4 text-emerald-600/60 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm điểm thu gom, bài viết, sự kiện..."
              className="w-full pl-9 pr-3 py-1.5 bg-emerald-50/70 border border-emerald-200/80 rounded-full text-xs text-emerald-950 placeholder-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-emerald-900/80 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] bg-amber-400 text-amber-950 font-extrabold px-1 rounded-sm leading-tight">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Role specific links */}
            {normalizedRole === 'ORGANIZATION' && (
              <button
                onClick={() => setActiveTab('org_dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'org_dashboard' ? 'bg-teal-700 text-white' : 'text-teal-800 hover:bg-teal-50'
                }`}
              >
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>Dashboard CLB</span>
              </button>
            )}
            {normalizedRole === 'ADMIN' && (
              <button
                onClick={() => setActiveTab('admin_dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === 'admin_dashboard' ? 'bg-purple-700 text-white' : 'text-purple-800 hover:bg-purple-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-2">
            {/* EcoPoints Wallet Button */}
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-full transition-all group"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                <Coins className="w-3 h-3" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-extrabold leading-tight text-amber-950">
                  {currentUser.ecoPoints.toLocaleString()} <span className="font-semibold text-amber-700">pts</span>
                </div>
              </div>
            </button>

            {/* Direct Chat */}
            <button
              onClick={onOpenChat}
              title="Tin nhắn trao đổi ve chai"
              className="relative p-2 text-emerald-800 hover:bg-emerald-50 rounded-full transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              title="Thông báo"
              className="relative p-2 text-emerald-800 hover:bg-emerald-50 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-emerald-400 transition-all"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-emerald-200"
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-emerald-100 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-bold text-sm text-gray-900 truncate">{currentUser.name}</div>
                    <div className="text-xs text-gray-500 truncate">{currentUser.schoolOrOrg || currentUser.location}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      <Leaf className="w-3 h-3" />
                      <span>{currentUser.level || 'Level 3 – Green Warrior'}</span>
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>Hồ sơ & Huy hiệu xanh</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenWallet();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                    >
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span>Ví Eco & Lịch sử điểm</span>
                    </button>

                    {normalizedRole === 'ORGANIZATION' && (
                      <button
                        onClick={() => {
                          setActiveTab('org_dashboard');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                      >
                        <Building2 className="w-4 h-4 text-teal-600" />
                        <span>Bảng điều khiển CLB</span>
                      </button>
                    )}

                    {normalizedRole === 'ADMIN' && (
                      <button
                        onClick={() => {
                          setActiveTab('admin_dashboard');
                          setUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Trang Quản Trị Hệ Thống</span>
                      </button>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        onOpenAuth();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Đổi tài khoản khác</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-emerald-800 hover:bg-emerald-50 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-emerald-100 px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-amber-400 text-amber-950 font-bold px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">Chuyển vai trò:</span>
            <div className="flex gap-1">
              <button
                onClick={() => handleSwitchRole('USER')}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  normalizedRole === 'USER' ? 'bg-emerald-600 text-white' : 'bg-gray-100'
                }`}
              >
                Cá nhân
              </button>
              <button
                onClick={() => handleSwitchRole('ORGANIZATION')}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  normalizedRole === 'ORGANIZATION' ? 'bg-teal-700 text-white' : 'bg-gray-100'
                }`}
              >
                CLB
              </button>
              <button
                onClick={() => handleSwitchRole('ADMIN')}
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  normalizedRole === 'ADMIN' ? 'bg-purple-700 text-white' : 'bg-gray-100'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
