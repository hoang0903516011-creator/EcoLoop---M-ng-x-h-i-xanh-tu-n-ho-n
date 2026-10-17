import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  RotateCcw,
  Lightbulb,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Recycle,
} from 'lucide-react';
import { chatWithEcoBot } from '../../services/api';
import { storage } from '../../services/storageService';

interface EcoBotChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  scanContext?: any;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

export const EcoBotChatModal: React.FC<EcoBotChatModalProps> = ({
  isOpen,
  onClose,
  initialMessage,
  scanContext,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Chào bạn! Mình là EcoBot – trợ lý phân loại và kinh tế tuần hoàn của EcoLoop. Bạn cần mình tư vấn xử lý loại rác nào, hay hỏi về các trạm thu hồi pin cũ, ve chai tái chế tại Cần Thơ?',
      timestamp: 'Vừa xong',
      suggestions: [
        'Pin cũ nguy hại bỏ vào thùng nào?',
        'Hộp xốp thực phẩm có tái chế được không?',
        'Cách làm sạch chai nhựa trước khi gom?',
        'Điểm thu gom rác điện tử tại Cần Thơ?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialMessage) {
      sendMessage(initialMessage);
    }
  }, [isOpen, initialMessage]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const replyText = await chatWithEcoBot(text.trim(), [], scanContext);
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestions: [
          'Pin cũ nguy hại bỏ vào thùng nào?',
          'Hộp xốp thực phẩm có tái chế được không?',
          'Cách làm sạch chai nhựa trước khi gom?',
          'Điểm thu gom rác điện tử tại Cần Thơ?',
        ],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: `b-err-${Date.now()}`,
        sender: 'bot',
        text: 'Xin lỗi bạn, kết nối trợ lý tạm thời gián đoạn. Bạn nhớ phân loại rác theo 4 nhóm: Hữu cơ (Xanh lá), Tái chế (Trắng/Xanh dương), Vô cơ còn lại (Xám/Cam) và Rác nguy hại/Pin cũ (Đỏ/Vàng) nhé!',
        timestamp: 'Vừa xong',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl h-[88vh] max-h-[700px] flex flex-col shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 text-emerald-300">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">EcoBot AI Trợ Lý Xanh</h3>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30 font-medium">
                  Roboflow & Gemini
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">Tư vấn phân loại rác, tái chế & trạm thu gom</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scan Context Badge if active */}
        {scanContext && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center gap-2 text-xs text-emerald-800">
            <Recycle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">
              Đang tham chiếu kết quả quét: <strong>{scanContext.item?.label || scanContext.overview}</strong>
            </span>
          </div>
        )}

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-emerald-700 text-white rounded-br-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {/* Suggestions from bot */}
              {m.suggestions && m.suggestions.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[90%]">
                  {m.suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(sug)}
                      className="text-xs bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 hover:border-emerald-400 rounded-lg px-2.5 py-1 text-left transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-slate-500 text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl w-fit">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>EcoBot đang phân tích câu hỏi của bạn...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi về phân loại, pin cũ, tái chế rác..."
              className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/70"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Gửi</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
