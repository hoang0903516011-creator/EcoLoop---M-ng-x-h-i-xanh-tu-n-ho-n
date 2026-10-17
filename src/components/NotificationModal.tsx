import React, { useState, useEffect } from 'react';
import { X, Bell, Calendar, Coins, Award, MessageSquare } from 'lucide-react';
import { storage } from '../services/storageService';
import { AppNotification } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(storage.getNotifications());

  useEffect(() => {
    const update = () => setNotifications(storage.getNotifications());
    update();
    return storage.subscribe(update);
  }, []);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    storage.markAllNotificationsRead();
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'points':
        return <Coins className="w-4 h-4 text-amber-500" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case 'badge':
        return <Award className="w-4 h-4 text-purple-600" />;
      default:
        return <MessageSquare className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Thông báo</h3>
              <p className="text-[11px] text-gray-400">Cập nhật điểm, sự kiện và tin tức</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 p-1 rounded-md"
            >
              Đọc tất cả
            </button>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-3 overflow-y-auto divide-y divide-gray-100 flex-1">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              Bạn chưa có thông báo mới nào
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => storage.markNotificationRead(notif.id)}
                className={`p-3 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                  notif.read ? 'opacity-75 hover:bg-gray-50' : 'bg-emerald-50/50 hover:bg-emerald-50'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-white shadow-xs flex items-center justify-center shrink-0 border border-gray-100">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      className={`text-xs ${
                        notif.read ? 'font-semibold text-gray-800' : 'font-bold text-emerald-950'
                      }`}
                    >
                      {notif.title}
                    </h4>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>}
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">{notif.createdAt}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
