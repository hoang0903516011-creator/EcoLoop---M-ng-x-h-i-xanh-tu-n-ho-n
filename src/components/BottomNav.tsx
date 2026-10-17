import React from 'react';
import { Home, MapPin, Sparkles, Calendar, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'ecomap', label: 'EcoMap', icon: MapPin },
    { id: 'ecobot', label: 'EcoBot AI', icon: Sparkles, highlight: true },
    { id: 'events', label: 'Sự kiện', icon: Calendar },
    { id: 'profile', label: 'Cá nhân', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-emerald-100 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          if (item.highlight) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative -top-3 flex flex-col items-center group"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-active:scale-95 ${
                    isActive
                      ? 'bg-emerald-600 ring-4 ring-emerald-100'
                      : 'bg-gradient-to-tr from-emerald-500 to-teal-600'
                  }`}
                >
                  <Icon className="w-6 h-6 animate-pulse" />
                </div>
                <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-emerald-700' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </button>
            );
          }
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-3 transition-colors ${
                isActive ? 'text-emerald-700 font-bold' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
