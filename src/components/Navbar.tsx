import React, { useState } from 'react';
import {
  Leaf,
  ScanLine,
  MessageSquare,
  Gamepad2,
  User,
  Shield,
  Users,
  Award,
  PlusCircle,
  ChevronDown,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserProfile;
  allUsers: Record<string, UserProfile>;
  onSwitchUserRole: (role: UserRole) => void;
  onOpenCreatePost: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  allUsers,
  onSwitchUserRole,
  onOpenCreatePost,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'feed', label: 'Bảng Tin', icon: Leaf },
    { id: 'scanner', label: 'Quét Rác EcoBot', icon: ScanLine, highlight: true },
    { id: 'messages', label: 'Tin Nhắn', icon: MessageSquare, badge: 2 },
    { id: 'games', label: 'Trò Chơi 3D', icon: Gamepad2 },
    { id: 'profile', label: 'Hồ Sơ', icon: User },
  ];

  // Nếu là Admin, bổ sung tab Quản trị
  if (currentUser.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Quản Trị', icon: Shield, badge: undefined, highlight: false });
  }

  const roleLabels: Record<string, { label: string; icon: any; color: string }> = {
    individual: { label: 'Cá Nhân', icon: User, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    USER: { label: 'Cá Nhân', icon: User, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    organization: { label: 'Tổ Chức / CLB', icon: Users, color: 'bg-blue-100 text-blue-800 border-blue-300' },
    ORGANIZATION: { label: 'Tổ Chức / CLB', icon: Users, color: 'bg-blue-100 text-blue-800 border-blue-300' },
    admin: { label: 'Quản Trị Viên', icon: Shield, color: 'bg-amber-100 text-amber-800 border-amber-300' },
    ADMIN: { label: 'Quản Trị Viên', icon: Shield, color: 'bg-amber-100 text-amber-800 border-amber-300' },
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('feed')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-gray-900">GreenNet</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  VN
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium hidden sm:block">
                Mạng Xã Hội Xanh & Phân Loại Rác
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
                      : item.highlight
                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-600' : 'text-gray-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && !isActive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Post Button */}
            <button
              onClick={onOpenCreatePost}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Đăng Bài</span>
            </button>

            {/* Eco Points Indicator */}
            <div
              onClick={() => onSelectTab('profile')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 cursor-pointer hover:bg-emerald-100 transition-colors"
              title="Điểm Xanh tích lũy của bạn"
            >
              <Award className="w-4 h-4 text-emerald-600" />
              <span>{currentUser.ecoPoints.toLocaleString('vi-VN')} điểm</span>
            </div>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/50 transition-all text-left"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-emerald-500/20"
                />
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-gray-900 truncate max-w-[110px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium">
                    {roleLabels[currentUser.role].label}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Chuyển đổi phân cấp người dùng
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Thử nghiệm các quyền hạn riêng biệt trên hệ thống:
                    </p>
                  </div>

                  <div className="p-2 space-y-1">
                    {(['individual', 'organization', 'admin'] as UserRole[]).map((r) => {
                      const userObj = allUsers[r];
                      const isCurrent = currentUser.role === r;
                      const RoleIcon = roleLabels[r].icon;
                      return (
                        <button
                          key={r}
                          onClick={() => {
                            onSwitchUserRole(r);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${
                            isCurrent
                              ? 'bg-emerald-50 border border-emerald-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <img
                            src={userObj.avatar}
                            alt={userObj.name}
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-gray-900 truncate">
                                {userObj.name}
                              </span>
                              {isCurrent && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${roleLabels[r].color}`}>
                                {roleLabels[r].label}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                • {userObj.ecoPoints.toLocaleString('vi-VN')} đ
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Quyền hạn: {currentUser.roleBadge}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-100 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-gray-700 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => {
              onOpenCreatePost();
              setMobileMenuOpen(false);
            }}
            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Tạo Bài Viết Xanh Mới</span>
          </button>
        </div>
      )}
    </header>
  );
};
