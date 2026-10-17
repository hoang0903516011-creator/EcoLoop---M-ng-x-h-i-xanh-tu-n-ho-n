import React from 'react';
import { DetectedWasteItem, WasteCategoryKey } from '../../types';
import {
  Recycle,
  Sprout,
  AlertTriangle,
  Trash2,
  Cpu,
  CheckCircle2,
  Lightbulb,
  Award,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface WasteDetailCardProps {
  item: DetectedWasteItem;
  isSelected: boolean;
  onSelect: () => void;
  onAskEcoBot: (item: DetectedWasteItem) => void;
}

export const WasteDetailCard: React.FC<WasteDetailCardProps> = ({
  item,
  isSelected,
  onSelect,
  onAskEcoBot,
}) => {
  const getCategoryMeta = (category: WasteCategoryKey) => {
    switch (category) {
      case 'recyclable':
        return {
          icon: Recycle,
          badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
          binBadge: 'bg-blue-600 text-white',
          accent: 'border-blue-500',
        };
      case 'organic':
        return {
          icon: Sprout,
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          binBadge: 'bg-emerald-600 text-white',
          accent: 'border-emerald-500',
        };
      case 'hazardous':
        return {
          icon: AlertTriangle,
          badgeColor: 'bg-red-100 text-red-800 border-red-200',
          binBadge: 'bg-red-600 text-white',
          accent: 'border-red-500',
        };
      case 'ewaste':
        return {
          icon: Cpu,
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
          binBadge: 'bg-purple-600 text-white',
          accent: 'border-purple-500',
        };
      case 'residual':
      default:
        return {
          icon: Trash2,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
          binBadge: 'bg-amber-600 text-white',
          accent: 'border-amber-500',
        };
    }
  };

  const meta = getCategoryMeta(item.category);
  const CategoryIcon = meta.icon;

  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl p-5 border transition-all duration-200 cursor-pointer ${
        isSelected
          ? `bg-white shadow-lg border-2 ${meta.accent} ring-2 ring-emerald-500/10`
          : 'bg-white/80 hover:bg-white border-gray-200 shadow-xs hover:border-gray-300'
      }`}
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl border ${meta.badgeColor} shrink-0`}>
            <CategoryIcon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <span>{item.label}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-700">
                {Math.round(item.confidence * 100)}% chính xác
              </span>
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${meta.badgeColor}`}>
                {item.categoryName}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold ${meta.binBadge}`}>
                {item.binColor}
              </span>
            </div>
          </div>
        </div>

        {/* Eco points badge */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>+{item.ecoPoints} đ</span>
        </div>
      </div>

      {/* Handling Steps */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Quy trình xử lý & phân loại chuẩn:
        </h5>
        <ul className="space-y-1.5">
          {item.handlingInstructions.map((instruction, idx) => (
            <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{instruction}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upcycling & DIY Tips */}
      {item.upcyclingTip && (
        <div className="mt-3.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-800">Mẹo tái chế sáng tạo (DIY): </span>
            <span>{item.upcyclingTip}</span>
          </div>
        </div>
      )}

      {/* Action footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAskEcoBot(item);
          }}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Hỏi thêm EcoBot về vật thể này</span>
        </button>

        <span className="text-[11px] text-gray-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          Đã đồng bộ chuẩn xử lý rác thải
        </span>
      </div>
    </div>
  );
};
