import React, { useState, useEffect } from 'react';
import {
  X,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Recycle,
  Tag,
  AlertCircle,
  Upload,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, AttachedScanResult } from '../../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  initialScanAttachment?: {
    scanResult: any;
    imageSrc: string;
  } | null;
  onSubmitPost: (newPostData: {
    content: string;
    topicTag: string;
    images: string[];
    location?: string;
    attachedScanResult?: AttachedScanResult;
  }) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  initialScanAttachment,
  onSubmitPost,
}) => {
  const [content, setContent] = useState('');
  const [topicTag, setTopicTag] = useState('#TáiChế');
  const [location, setLocation] = useState(currentUser.location || 'Hà Nội');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [attachedScan, setAttachedScan] = useState<AttachedScanResult | null>(null);

  const availableTags = [
    '#TáiChế',
    '#DọnRác',
    '#ChiếnDịchCLB',
    '#SốngXanh',
    '#ZeroWaste',
    '#TrồngCây',
    '#ĐổiRácLấyCây',
  ];

  // Khi có kết quả quét rác truyền sang
  useEffect(() => {
    if (initialScanAttachment && initialScanAttachment.scanResult) {
      const res = initialScanAttachment.scanResult;
      setAttachedScan({
        totalItems: res.totalItems || res.items?.length || 1,
        recyclableRatio: res.recyclableRatio || 70,
        itemLabels: res.items ? res.items.map((i: any) => i.label) : ['Rác tái chế'],
        totalPoints: res.totalEcoPoints || 25,
        scanImageUrl: initialScanAttachment.imageSrc,
      });

      if (initialScanAttachment.imageSrc) {
        setImages([initialScanAttachment.imageSrc]);
      }

      setContent(
        `🌿 Vừa sử dụng EcoBot nhận diện và phân loại rác thải thành công! Đã phát hiện ${
          res.totalItems || 2
        } vật thể gồm: ${
          res.items ? res.items.map((i: any) => i.label).join(', ') : 'vật phẩm tái chế'
        }. Mọi người cùng chung tay phân loại rác tại nguồn nhé!`
      );
    }
  }, [initialScanAttachment]);

  if (!isOpen) return null;

  const handleAddImage = () => {
    if (imageUrlInput.trim()) {
      setImages([...images, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) {
        setImages([...images, res]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmitPost({
      content: content.trim(),
      topicTag,
      images,
      location: location.trim() || undefined,
      attachedScanResult: attachedScan || undefined,
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-base">Tạo Bài Viết Xanh Mới</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1">
          {/* Author Badge */}
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/10"
            />
            <div>
              <div className="font-bold text-sm text-gray-900">{currentUser.name}</div>
              <div className="text-[11px] text-emerald-700 font-semibold">{currentUser.roleBadge}</div>
            </div>
          </div>

          {/* Topic Tags Selector */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
              Chọn chủ đề bài viết:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setTopicTag(tag)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    topicTag === tag
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Post Content Textarea */}
          <div>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ hoạt động bảo vệ môi trường, kết quả phân loại rác hoặc kêu gọi tham gia chiến dịch..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Attached EcoBot Scan result preview */}
          {attachedScan && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Recycle className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-900">
                    Đã đính kèm kết quả quét EcoBot ({attachedScan.totalItems} vật thể)
                  </div>
                  <div className="text-emerald-700">{attachedScan.itemLabels.join(', ')}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAttachedScan(null)}
                className="text-xs text-red-600 hover:underline"
              >
                Gỡ bỏ
              </button>
            </div>
          )}

          {/* Attached Images Preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
                  <img src={img} alt="Tải lên" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Image URL or File */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Dán link ảnh (Unsplash / web image)..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddImage}
                disabled={!imageUrlInput.trim()}
                className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold disabled:opacity-40"
              >
                Thêm ảnh
              </button>

              <label className="cursor-pointer px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1 shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh lên</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Location field */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 text-xs text-gray-700">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Vị trí hoạt động (TP, Quận/Huyện)..."
              className="bg-transparent flex-1 focus:outline-none text-xs"
            />
          </div>

          {/* Moderation Notice if non-admin */}
          {currentUser.role !== 'admin' && (
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Quy trình kiểm duyệt văn minh: </span>
                <span>
                  Bài viết của bạn sẽ được gửi tới Ban Quản Trị phê duyệt trước khi hiển thị công khai trên Bảng Tin. Bạn vẫn xem được bài trong mục Hồ Sơ cá nhân.
                </span>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-between">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <span>Đăng bài được cộng</span>
              <span className="font-bold text-emerald-700">+20 Điểm Xanh</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!content.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md disabled:opacity-40 transition-all"
              >
                {currentUser.role === 'admin' ? 'Đăng Bài Ngay' : 'Gửi Bài Để Duyệt'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
