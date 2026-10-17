import React from 'react';
import { DetectedWasteItem, WasteCategoryKey } from '../../types';
import { Recycle, Sprout, AlertTriangle, Trash2, Cpu, CheckCircle } from 'lucide-react';

interface BoundingBoxCanvasProps {
  imageSrc: string;
  items: DetectedWasteItem[];
  selectedItemId: string | null;
  onSelectItem: (id: string) => void;
  hoveredItemId: string | null;
  onHoverItem: (id: string | null) => void;
}

export const BoundingBoxCanvas: React.FC<BoundingBoxCanvasProps> = ({
  imageSrc,
  items,
  selectedItemId,
  onSelectItem,
  hoveredItemId,
  onHoverItem,
}) => {
  const getCategoryStyles = (category: WasteCategoryKey) => {
    switch (category) {
      case 'recyclable':
        return {
          border: 'border-blue-500',
          bg: 'bg-blue-500/15',
          text: 'text-blue-700',
          badgeBg: 'bg-blue-600',
          icon: Recycle,
          ring: 'ring-blue-400',
        };
      case 'organic':
        return {
          border: 'border-emerald-500',
          bg: 'bg-emerald-500/15',
          text: 'text-emerald-700',
          badgeBg: 'bg-emerald-600',
          icon: Sprout,
          ring: 'ring-emerald-400',
        };
      case 'hazardous':
        return {
          border: 'border-red-500',
          bg: 'bg-red-500/20',
          text: 'text-red-700',
          badgeBg: 'bg-red-600',
          icon: AlertTriangle,
          ring: 'ring-red-400',
        };
      case 'ewaste':
        return {
          border: 'border-purple-500',
          bg: 'bg-purple-500/15',
          text: 'text-purple-700',
          badgeBg: 'bg-purple-600',
          icon: Cpu,
          ring: 'ring-purple-400',
        };
      case 'residual':
      default:
        return {
          border: 'border-amber-500',
          bg: 'bg-amber-500/15',
          text: 'text-amber-700',
          badgeBg: 'bg-amber-600',
          icon: Trash2,
          ring: 'ring-amber-400',
        };
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 shadow-md select-none group">
      {/* Background Image */}
      <img
        src={imageSrc}
        alt="Ảnh chụp phân tích rác thải"
        className="w-full h-auto max-h-[540px] object-contain mx-auto block"
      />

      {/* Overlaid Bounding Boxes */}
      <div className="absolute inset-0 pointer-events-none">
        {items.map((item, idx) => {
          const [ymin, xmin, ymax, xmax] = item.box_2d;
          const top = Math.max(0, Math.min(100, ymin / 10));
          const left = Math.max(0, Math.min(100, xmin / 10));
          const width = Math.max(5, Math.min(100 - left, (xmax - xmin) / 10));
          const height = Math.max(5, Math.min(100 - top, (ymax - ymin) / 10));

          const isSelected = selectedItemId === item.id;
          const isHovered = hoveredItemId === item.id;
          const styles = getCategoryStyles(item.category);
          const Icon = styles.icon;

          return (
            <div
              key={item.id || idx}
              onClick={(e) => {
                e.stopPropagation();
                onSelectItem(item.id);
              }}
              onMouseEnter={() => onHoverItem(item.id)}
              onMouseLeave={() => onHoverItem(null)}
              style={{
                top: `${top}%`,
                left: `${left}%`,
                width: `${width}%`,
                height: `${height}%`,
              }}
              className={`absolute pointer-events-auto cursor-pointer rounded-lg border-2 transition-all duration-150 ${
                styles.border
              } ${styles.bg} ${
                isSelected
                  ? `ring-4 ${styles.ring} shadow-lg scale-[1.01] z-20`
                  : isHovered
                  ? 'border-white ring-2 ring-white/80 shadow-md z-10'
                  : 'hover:opacity-90'
              }`}
            >
              {/* Box Header Label */}
              <div
                className={`absolute -top-7 left-0 flex items-center gap-1.5 px-2 py-0.5 rounded-md text-white text-[11px] font-semibold tracking-tight shadow-md whitespace-nowrap transition-transform ${
                  styles.badgeBg
                } ${isSelected ? 'scale-105 z-30' : ''}`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[180px]">{item.label}</span>
                <span className="text-[10px] opacity-90 font-mono">
                  {Math.round(item.confidence * 100)}%
                </span>
                {isSelected && <CheckCircle className="w-3 h-3 text-white ml-0.5" />}
              </div>

              {/* Box Corner markers */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white"></div>
            </div>
          );
        })}
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white/90 text-xs px-3 py-1.5 rounded-xl flex items-center justify-between pointer-events-none">
        <span>💡 Bấm vào từng khung hộp (Box) để xem chi tiết cách xử lý & mẹo tái chế</span>
        <span className="font-semibold text-emerald-400 hidden sm:inline">
          {items.length} vật thể được phát hiện
        </span>
      </div>
    </div>
  );
};
