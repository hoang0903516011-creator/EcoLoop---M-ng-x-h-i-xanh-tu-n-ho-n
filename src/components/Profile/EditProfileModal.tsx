import React, { useState } from 'react';
import { X, User, MapPin, Image as ImageIcon, Phone, Building, Save } from 'lucide-react';
import { UserProfile } from '../../types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSaveProfile: (updated: Partial<UserProfile>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.location);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [coverPhoto, setCoverPhoto] = useState(currentUser.coverPhoto);

  // Dành cho tổ chức
  const [orgPhone, setOrgPhone] = useState(currentUser.organizationInfo?.phone || '');
  const [orgAddress, setOrgAddress] = useState(currentUser.organizationInfo?.address || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Partial<UserProfile> = {
      name: name.trim(),
      bio: bio.trim(),
      location: location.trim(),
      avatar: avatar.trim(),
      coverPhoto: coverPhoto ? coverPhoto.trim() : '',
    };

    if (currentUser.role === 'organization' && currentUser.organizationInfo) {
      updated.organizationInfo = {
        ...currentUser.organizationInfo,
        phone: orgPhone.trim(),
        address: orgAddress.trim(),
      };
    }

    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base">Chỉnh Sửa Hồ Sơ Cá Nhân</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Tên hiển thị / Tên tổ chức:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Tiểu sử / Giới thiệu hoạt động xanh:
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Vị trí / Khu vực:</label>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent flex-1 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Link Ảnh Đại Diện (Avatar):</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Cover Photo URL */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Link Ảnh Bìa (Cover):</label>
            <input
              type="text"
              value={coverPhoto}
              onChange={(e) => setCoverPhoto(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* If organization fields */}
          {currentUser.role === 'organization' && (
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
              <span className="text-xs font-bold text-blue-900 block">Thông tin liên hệ CLB:</span>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">Hotline CLB:</label>
                <input
                  type="text"
                  value={orgPhone}
                  onChange={(e) => setOrgPhone(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-600 block mb-1">Trụ sở hoạt động:</label>
                <input
                  type="text"
                  value={orgAddress}
                  onChange={(e) => setOrgAddress(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
