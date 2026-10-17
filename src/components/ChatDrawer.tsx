import React, { useState, useEffect } from 'react';
import { X, Send, Image as ImageIcon, CheckCheck } from 'lucide-react';
import { storage } from '../services/storageService';
import { ChatMessage, UserProfile } from '../types';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(storage.getCurrentUser());
  const [messages, setMessages] = useState<ChatMessage[]>(storage.getMessages());
  const [inputText, setInputText] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<{ id: string; name: string; avatar: string; role: string }>({
    id: 'user-le-thao',
    name: 'Lê Thu Thảo',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Tặng giáo trình cũ & Ve chai',
  });

  useEffect(() => {
    const update = () => {
      setCurrentUser(storage.getCurrentUser());
      setMessages(storage.getMessages());
    };
    update();
    return storage.subscribe(update);
  }, []);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    storage.sendMessage(selectedPartner.id, inputText.trim());
    setInputText('');
  };

  const handleQuickReply = (text: string) => {
    storage.sendMessage(selectedPartner.id, text);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={selectedPartner.avatar}
                alt={selectedPartner.name}
                className="w-10 h-10 rounded-full object-cover border border-emerald-400"
              />
              <span className="w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-900 rounded-full absolute bottom-0 right-0"></span>
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">{selectedPartner.name}</h3>
              <p className="text-[11px] text-emerald-200 truncate">{selectedPartner.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-emerald-200 hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Conversation Partners */}
        <div className="px-3 py-2 bg-emerald-50/70 border-b border-emerald-100 flex gap-2 overflow-x-auto text-xs">
          <button
            onClick={() =>
              setSelectedPartner({
                id: 'user-le-thao',
                name: 'Lê Thu Thảo',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                role: 'Tặng giáo trình cũ & Ve chai',
              })
            }
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              selectedPartner.id === 'user-le-thao' ? 'bg-emerald-700 text-white font-bold' : 'bg-white text-gray-700 border'
            }`}
          >
            Lê Thu Thảo
          </button>
          <button
            onClick={() =>
              setSelectedPartner({
                id: 'org-vnu-green',
                name: 'CLB Môi Trường Xanh Cần Thơ',
                avatar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=150&auto=format&fit=crop&q=80',
                role: 'Ban Tổ Chức Chiến Dịch Xanh',
              })
            }
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
              selectedPartner.id === 'org-vnu-green'
                ? 'bg-emerald-700 text-white font-bold'
                : 'bg-white text-gray-700 border'
            }`}
          >
            CLB Môi Trường Xanh
          </button>
        </div>

        {/* Message stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
          <div className="text-center my-2">
            <span className="text-[10px] bg-gray-200/80 text-gray-600 px-2 py-0.5 rounded-full">
              Hôm nay · Trao đổi ve chai & đồ cũ tuần hoàn
            </span>
          </div>

          {messages.map((m) => {
            const isMe = m.senderId === currentUser.id;
            return (
              <div key={m.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                <img
                  src={isMe ? currentUser.avatar : selectedPartner.avatar}
                  alt={m.senderName}
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    isMe
                      ? 'bg-emerald-700 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 shadow-xs border border-gray-100 rounded-tl-none'
                  }`}
                >
                  <p>{m.text}</p>
                  <div
                    className={`text-[9px] mt-1 flex items-center justify-end gap-1 ${
                      isMe ? 'text-emerald-200' : 'text-gray-400'
                    }`}
                  >
                    <span>{m.timestamp}</span>
                    {isMe && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Suggested Replies */}
        <div className="px-3 py-1.5 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto text-[11px]">
          <button
            onClick={() => handleQuickReply('Mình muốn nhận lại đồ cũ này ạ, bạn cho mình xin địa chỉ nhé!')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full whitespace-nowrap transition-colors"
          >
            Xin địa chỉ nhận
          </button>
          <button
            onClick={() => handleQuickReply('Chiều nay khoảng 15h bạn có ở phòng trọ không?')}
            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-full whitespace-nowrap transition-colors"
          >
            Hẹn giờ qua lấy
          </button>
        </div>

        {/* Chat input form */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
          <button
            type="button"
            title="Đính kèm hình ảnh đồ dùng"
            className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập tin nhắn trao đổi..."
            className="flex-1 px-3 py-2 text-xs bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-full transition-colors shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
