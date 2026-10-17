import React, { useState } from 'react';
import { X, User, Building2, ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';
import { storage } from '../services/storageService';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('USER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');

  if (!isOpen) return null;

  const handleQuickLogin = (selectedRole: UserRole) => {
    storage.switchUserByRole(selectedRole);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (mode === 'register') {
      storage.updateProfile({
        name: name || (role === 'ORGANIZATION' ? orgName : 'Thành viên xanh mới'),
        email,
        role,
        organizationName: role === 'ORGANIZATION' ? orgName : undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-800 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">
            {mode === 'login' ? 'Đăng nhập EcoLoop' : 'Tạo tài khoản EcoLoop'}
          </h2>
          <p className="text-emerald-200 text-xs mt-1">
            Kết nối cộng đồng học đường & người dân Tây Đô sống xanh
          </p>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="p-4 bg-emerald-50 border-b border-emerald-100">
          <span className="text-[11px] font-bold text-emerald-900 block mb-2">
            Trải nghiệm nhanh (1 chạm không cần nhập mật khẩu)
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('USER')}
              className="p-2 bg-white border border-emerald-200 hover:border-emerald-500 rounded-xl text-left transition-all group"
            >
              <User className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
              <div className="text-[11px] font-bold text-gray-800">Cá nhân</div>
              <div className="text-[9px] text-gray-500">Giáo viên / SV</div>
            </button>
            <button
              onClick={() => handleQuickLogin('ORGANIZATION')}
              className="p-2 bg-white border border-emerald-200 hover:border-teal-500 rounded-xl text-left transition-all group"
            >
              <Building2 className="w-4 h-4 text-teal-600 mb-1 group-hover:scale-110 transition-transform" />
              <div className="text-[11px] font-bold text-gray-800">Tổ chức</div>
              <div className="text-[9px] text-gray-500">CLB Môi Trường</div>
            </button>
            <button
              onClick={() => handleQuickLogin('ADMIN')}
              className="p-2 bg-white border border-emerald-200 hover:border-purple-500 rounded-xl text-left transition-all group"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
              <div className="text-[11px] font-bold text-gray-800">Quản trị</div>
              <div className="text-[9px] text-gray-500">Admin hệ thống</div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Mode Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'login' ? 'bg-white shadow-xs text-emerald-800' : 'text-gray-500'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'register' ? 'bg-white shadow-xs text-emerald-800' : 'text-gray-500'
              }`}
            >
              Đăng ký
            </button>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Loại tài khoản</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 ${
                    role === 'USER' ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Cá nhân / Học sinh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ORGANIZATION')}
                  className={`p-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 ${
                    role === 'ORGANIZATION'
                      ? 'border-teal-600 bg-teal-50 text-teal-800'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>CLB / Đội nhóm</span>
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && role === 'ORGANIZATION' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tên CLB / Tổ chức</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="VD: CLB Môi Trường Xanh Cần Thơ..."
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nguyễn Văn Xanh"
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Địa chỉ Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@email.com"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>{mode === 'login' ? 'Đăng nhập vào EcoLoop' : 'Đăng ký tài khoản'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
