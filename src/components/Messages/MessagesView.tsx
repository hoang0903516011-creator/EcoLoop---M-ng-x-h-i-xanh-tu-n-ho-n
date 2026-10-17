import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  Users,
  User,
  Search,
  CheckCheck,
  HelpCircle,
  Lightbulb,
  CornerDownRight,
  ShieldCheck,
  Recycle,
} from 'lucide-react';
import { UserProfile, ChatConversation, ChatMessage } from '../../types';
import { INITIAL_CONVERSATIONS, INITIAL_BOT_MESSAGES } from '../../data/mockData';
import { chatWithEcoBot } from '../../services/api';

interface MessagesViewProps {
  currentUser: UserProfile;
  initialMessage?: string;
  initialScanContext?: any;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  initialMessage,
  initialScanContext,
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>(INITIAL_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState<string>('conv-ecobot');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Lưu trữ tin nhắn theo từng cuộc hội thoại
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({
    'conv-ecobot': INITIAL_BOT_MESSAGES,
    'conv-club': [
      {
        id: 'cm-1',
        senderId: 'user-org-1',
        senderName: 'CLB Môi Trường Sống Xanh',
        senderAvatar:
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&auto=format&fit=crop&q=80',
        text: 'Chào bạn! Chúng mình đã ghi nhận thông tin đăng ký tham gia chiến dịch Chủ Nhật Xanh nhé. Bạn nhớ mang theo bình nước cá nhân để hạn chế rác thải nhựa dùng một lần nha.',
        timestamp: '09:30',
      },
    ],
    'conv-volunteer': [
      {
        id: 'vm-1',
        senderId: 'user-volunteer-1',
        senderName: 'Trần Hoàng Nam',
        senderAvatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        text: 'Chào bạn Xanh, cuối tuần này mình gom được hơn 10kg bìa carton với chai thủy tinh rồi. Bạn có đi chung đến điểm đổi quà của CLB không?',
        timestamp: 'Hôm qua',
      },
    ],
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesMap, isTyping, activeConvId]);

  // Nếu người dùng điều hướng từ trang Scanner sang Chat với câu hỏi mẫu
  useEffect(() => {
    if (initialMessage) {
      setActiveConvId('conv-ecobot');
      handleSendMessage(initialMessage, initialScanContext);
    }
  }, [initialMessage]);

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const currentMessages = messagesMap[activeConvId] || [];

  const handleSendMessage = async (textToSend: string, scanCtx: any = null) => {
    if (!textToSend.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg],
    }));
    setInputText('');

    // Cập nhật dòng tin nhắn cuối trong danh sách hội thoại
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, lastMessage: textToSend.trim(), lastMessageTime: 'Vừa xong' }
          : c
      )
    );

    // Nếu đang chat với EcoBot -> gọi backend AI /api/chat-ecobot
    if (activeConvId === 'conv-ecobot') {
      setIsTyping(true);
      try {
        const history = (messagesMap['conv-ecobot'] || []).map((m) => ({
          role: m.isBot ? 'model' : 'user',
          text: m.text,
        }));

        const reply = await chatWithEcoBot(textToSend, history, scanCtx || initialScanContext);

        const botReplyMsg: ChatMessage = {
          id: `bot-msg-${Date.now()}`,
          senderId: 'ecobot',
          senderName: 'EcoBot',
          senderAvatar:
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
          text: reply,
          timestamp: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isBot: true,
        };

        setMessagesMap((prev) => ({
          ...prev,
          'conv-ecobot': [...(prev['conv-ecobot'] || []), botReplyMsg],
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === 'conv-ecobot'
              ? {
                  ...c,
                  lastMessage: reply.slice(0, 50) + '...',
                  lastMessageTime: 'Vừa xong',
                }
              : c
          )
        );
      } catch (err) {
        console.error('Lỗi phản hồi bot:', err);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Tin nhắn mô phỏng từ CLB hoặc Tình nguyện viên
      setTimeout(() => {
        const autoReply: ChatMessage = {
          id: `reply-${Date.now()}`,
          senderId: activeConv.id,
          senderName: activeConv.title || activeConv.name || 'Người dùng',
          senderAvatar: activeConv.avatar,
          text:
            activeConv.type === 'club'
              ? 'Cảm ơn bạn đã nhắn tin cho CLB! Đội ngũ tình nguyện viên sẽ phản hồi bạn trong thời gian sớm nhất nhé. Chúc bạn một ngày tràn đầy năng lượng xanh!'
              : 'Tuyệt vời luôn bạn ơi! Cuối tuần này mình hẹn gặp nhau lúc 7h sáng cùng dọn rác nhé!',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessagesMap((prev) => ({
          ...prev,
          [activeConvId]: [...(prev[activeConvId] || []), autoReply],
        }));
      }, 1000);
    }
  };

  const quickQuestions = [
    'Pin cũ và ắc quy xử lý thế nào cho an toàn?',
    'Vỏ hộp sữa giấy có tái chế được không?',
    'Cách tự làm phân compost rác hữu cơ tại nhà',
    'Nhựa số 1 (PET) và nhựa số 2 (HDPE) khác gì nhau?',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px] max-h-[780px]">
        {/* Left Col: Conversation List (4 cols) */}
        <div className="md:col-span-4 border-r border-gray-100 flex flex-col h-full bg-gray-50/50">
          {/* Header & Search */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-base text-gray-900">Trò Chuyện & Hỗ Trợ</h2>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                GreenNet Chat
              </span>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bạn bè, CLB hoặc EcoBot..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Conversations Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations
              .filter((c) => (c.title || c.name || '').toLowerCase().includes(searchQuery.toLowerCase()))
              .map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all duration-150 ${
                      isActive
                        ? 'bg-white shadow-xs border border-emerald-200 ring-1 ring-emerald-500/10'
                        : 'hover:bg-white/80'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.avatar}
                        alt={conv.title || conv.name || 'Conversation'}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/10"
                      />
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                      )}
                      {conv.type === 'bot' && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[9px] shadow-xs">
                          <Bot className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                          {conv.title || conv.name}
                        </span>
                        <span className="text-[10px] text-gray-400">{conv.lastMessageTime}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-gray-500 truncate max-w-[160px]">
                          {conv.lastMessage}
                        </p>
                        {(conv.unreadCount || 0) > 0 && (
                          <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>

          {/* Bottom EcoBot Tip */}
          <div className="p-3 m-3 bg-emerald-100/60 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-tight">
              EcoBot sẵn sàng giải đáp 24/7 mọi thắc mắc về phân loại rác tại nguồn và lối sống Zero Waste.
            </p>
          </div>
        </div>

        {/* Right Col: Active Chat Window (8 cols) */}
        <div className="md:col-span-8 flex flex-col h-full bg-white">
          {/* Chat Window Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={activeConv.avatar}
                  alt={activeConv.title}
                  className="w-10 h-10 rounded-2xl object-cover ring-2 ring-emerald-500/10"
                />
                {activeConv.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <span>{activeConv.title}</span>
                  {activeConv.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {activeConv.badge}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {activeConv.isOnline ? 'Đang trực tuyến' : 'Ngoại tuyến'}
                </p>
              </div>
            </div>

            {activeConv.type === 'bot' && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl flex items-center gap-1 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Trợ lý môi trường EcoBot</span>
              </span>
            )}
          </div>

          {/* Messages Thread Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/40">
            {currentMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  <img
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-xl object-cover shrink-0 mt-0.5"
                  />
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-2xs whitespace-pre-line leading-relaxed ${
                      isMe
                        ? 'bg-emerald-700 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}
                  >
                    {!isMe && (
                      <div className="text-[11px] font-bold text-emerald-800 mb-1">
                        {msg.senderName}
                      </div>
                    )}
                    <div>{msg.text}</div>
                    <div
                      className={`text-[10px] mt-1 text-right ${
                        isMe ? 'text-emerald-200' : 'text-gray-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-gray-400 pl-10">
                <div className="flex gap-1 items-center bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-200"></span>
                  <span className="text-[11px] font-medium text-emerald-700 ml-1">
                    EcoBot đang phân tích...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Questions for EcoBot */}
          {activeConv.type === 'bot' && (
            <div className="px-4 py-2 border-t border-gray-100 bg-white flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 shrink-0">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Gợi ý:
              </span>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="text-[11px] px-3 py-1 rounded-full bg-gray-100 hover:bg-emerald-50 hover:text-emerald-800 text-gray-700 whitespace-nowrap transition-colors border border-gray-200/60"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Message Input Box */}
          <div className="p-3 sm:p-4 border-t border-gray-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  activeConv.type === 'bot'
                    ? 'Hỏi EcoBot về cách xử lý bất kỳ loại rác nào...'
                    : 'Nhập tin nhắn...'
                }
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="p-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-40 transition-all shrink-0 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
