import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Search,
  MapPin,
  Navigation,
  Phone,
  Clock,
  Plus,
  X,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { RecyclingPoint, WasteCategory } from '../types';

const WASTE_CATEGORIES: WasteCategory[] = [
  'Pin',
  'Nhựa',
  'Giấy',
  'Kim loại',
  'Đồ điện tử',
  'Quần áo',
  'Đồ gia dụng',
  'Rác hữu cơ',
];

interface EcoMapModuleProps {
  initialPoint?: RecyclingPoint | null;
  onClearInitialPoint?: () => void;
  preselectedFilter?: string | null;
}

export const EcoMapModule: React.FC<EcoMapModuleProps> = ({
  initialPoint,
  preselectedFilter,
}) => {
  const [points, setPoints] = useState<RecyclingPoint[]>(storage.getRecyclingPoints());
  const [selectedFilter, setSelectedFilter] = useState<string>(preselectedFilter || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoint, setSelectedPoint] = useState<RecyclingPoint | null>(initialPoint || null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>({
    lat: 10.0338,
    lng: 105.7876,
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPointForm, setNewPointForm] = useState({
    name: '',
    address: '',
    city: 'Cần Thơ',
    lat: 10.0338,
    lng: 105.7876,
    operatingHours: '07:30 - 17:30',
    phone: '',
    acceptedWastes: ['Pin', 'Nhựa'] as (WasteCategory | string)[],
    image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    description: '',
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    const update = () => setPoints(storage.getRecyclingPoints());
    return storage.subscribe(update);
  }, []);

  useEffect(() => {
    if (initialPoint) {
      setSelectedPoint(initialPoint);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([initialPoint.lat, initialPoint.lng], 15);
      }
    }
  }, [initialPoint]);

  useEffect(() => {
    if (preselectedFilter) {
      setSelectedFilter(preselectedFilter);
    }
  }, [preselectedFilter]);

  // Khởi tạo bản đồ Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [10.0338, 105.7876],
      zoom: 13,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  const filteredPoints = points.filter((pt) => {
    const matchesCategory =
      selectedFilter === 'all' ||
      pt.acceptedWastes.some((w) => w.toLowerCase().includes(selectedFilter.toLowerCase()));
    const matchesSearch =
      pt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.acceptedWastes.some((w) => w.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Render Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // User GPS Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `<div style="background-color: #059669; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px rgba(5,150,105,0.8);"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Vị trí của bạn</b> (TP. Cần Thơ)');
      markersRef.current.push(userMarker);
    }

    filteredPoints.forEach((pt) => {
      let bgColor = '#059669';
      let iconEmoji = '♻️';
      if (pt.acceptedWastes.includes('Pin') || pt.acceptedWastes.includes('Đồ điện tử')) {
        bgColor = '#DC2626';
        iconEmoji = '🔋';
      } else if (pt.type === 'reward_exchange') {
        bgColor = '#D97706';
        iconEmoji = '🎁';
      } else if (pt.acceptedWastes.includes('Quần áo')) {
        bgColor = '#0D9488';
        iconEmoji = '👕';
      }

      const customIcon = L.divIcon({
        className: 'custom-eco-marker',
        html: `
          <div style="background-color: ${bgColor}; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2.5px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.3); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
            ${iconEmoji}
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([pt.lat, pt.lng], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        setSelectedPoint(pt);
        map.setView([pt.lat, pt.lng], 15, { animate: true });
      });
      markersRef.current.push(marker);
    });
  }, [filteredPoints, userLocation]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([loc.lat, loc.lng], 15);
          }
        },
        () => {
          setUserLocation({ lat: 10.0338, lng: 105.7876 });
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([10.0338, 105.7876], 15);
          }
        }
      );
    }
  };

  const handleCreatePoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPointForm.name || !newPointForm.address) return;
    storage.addRecyclingPoint({
      name: newPointForm.name,
      address: newPointForm.address,
      city: newPointForm.city,
      lat: newPointForm.lat,
      lng: newPointForm.lng,
      distanceKm: 1.2,
      operatingHours: newPointForm.operatingHours,
      acceptedWastes: newPointForm.acceptedWastes,
      phone: newPointForm.phone || '0292 3832 663',
      image: newPointForm.image,
      verified: true,
      type: 'collection',
      description: newPointForm.description,
    });
    storage.addEcoPoints(50, 'Đóng góp thêm điểm thu gom rác mới', 'Điểm thu gom đã đăng lên EcoMap');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Top Header & Search Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-emerald-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-6 h-6 text-emerald-600" />
              <span>EcoMap – Bản đồ sinh thái Cần Thơ</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Tra cứu điểm thu gom rác tái chế, trạm thu hồi pin cũ và trạm đổi quà Tây Đô
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGetLocation}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors"
            >
              <Navigation className="w-4 h-4 text-emerald-600" />
              <span>Vị trí (GPS)</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm điểm gom (+50 pts)</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên trạm, địa chỉ hoặc loại rác (Pin, chai nhựa, giấy carton, lon nhôm...)"
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
              selectedFilter === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả ({points.length})
          </button>
          {WASTE_CATEGORIES.map((cat) => {
            const isSelected = selectedFilter.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Map View */}
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden shadow-md border border-emerald-100 bg-white min-h-[500px] h-[580px]">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-md border border-gray-100 text-[11px] space-y-1.5 hidden sm:block">
            <div className="font-bold text-gray-900 mb-1">Chú giải bản đồ:</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              <span>Điểm thu gom rác tái chế</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              <span>Trạm thu hồi Pin & Rác nguy hại</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span>Trạm Đổi Rác Lấy Sen Đá</span>
            </div>
          </div>
        </div>

        {/* Right Details / List View */}
        <div className="space-y-4">
          {selectedPoint ? (
            /* Selected Point Detail Card */
            <div className="bg-white rounded-3xl p-5 shadow-md border border-emerald-200 space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {selectedPoint.type === 'reward_exchange' ? 'Trạm Đổi Quà' : 'Điểm Thu Gom'}
                  </span>
                  <h3 className="font-bold text-base text-gray-900 mt-1.5">{selectedPoint.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <img
                src={selectedPoint.image}
                alt={selectedPoint.name}
                className="w-full h-40 object-cover rounded-2xl"
              />

              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{selectedPoint.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{selectedPoint.operatingHours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <a href={`tel:${selectedPoint.phone}`} className="text-emerald-700 font-bold hover:underline">
                    {selectedPoint.phone}
                  </a>
                </div>
              </div>

              {selectedPoint.description && (
                <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-xl">
                  {selectedPoint.description}
                </p>
              )}

              <div>
                <span className="text-xs font-bold text-gray-800 block mb-1.5">Các loại rác tiếp nhận:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPoint.acceptedWastes.map((w) => (
                    <span
                      key={w}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPoint.lat},${selectedPoint.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Chỉ đường trên Google Maps</span>
                </a>
              </div>
            </div>
          ) : (
            /* Points List */
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-emerald-100 flex flex-col h-[580px]">
              <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center justify-between">
                <span>Danh sách điểm thu gom ({filteredPoints.length})</span>
                <span className="text-[11px] text-gray-400 font-normal">Nhấp xem chi tiết</span>
              </h3>
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {filteredPoints.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-xs">
                    Không tìm thấy điểm thu gom phù hợp tiêu chí
                  </div>
                ) : (
                  filteredPoints.map((pt) => (
                    <div
                      key={pt.id}
                      onClick={() => {
                        setSelectedPoint(pt);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.setView([pt.lat, pt.lng], 15, { animate: true });
                        }
                      }}
                      className="p-3.5 rounded-2xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-gray-900 group-hover:text-emerald-700 transition-colors">
                          {pt.name}
                        </h4>
                        {pt.distanceKm && (
                          <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full shrink-0 font-mono">
                            {pt.distanceKm} km
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2">{pt.address}</p>
                      <div className="flex flex-wrap gap-1">
                        {pt.acceptedWastes.map((w) => (
                          <span
                            key={w}
                            className="text-[9px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Point Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Thêm Điểm Thu Gom Mới</h3>
                <p className="text-emerald-200 text-xs">Cùng đóng góp mở rộng mạng lưới tuần hoàn Cần Thơ</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-emerald-200 hover:bg-white/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoint} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Tên địa điểm / trạm thu gom</label>
                <input
                  type="text"
                  required
                  value={newPointForm.name}
                  onChange={(e) => setNewPointForm({ ...newPointForm, name: e.target.value })}
                  placeholder="VD: Trạm thu gom rác THCS Thốt Nốt hoặc KTX ĐH Cần Thơ..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Địa chỉ cụ thể</label>
                <input
                  type="text"
                  required
                  value={newPointForm.address}
                  onChange={(e) => setNewPointForm({ ...newPointForm, address: e.target.value })}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện TP. Cần Thơ..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Thời gian hoạt động</label>
                  <input
                    type="text"
                    value={newPointForm.operatingHours}
                    onChange={(e) => setNewPointForm({ ...newPointForm, operatingHours: e.target.value })}
                    placeholder="08:00 - 17:30"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    value={newPointForm.phone}
                    onChange={(e) => setNewPointForm({ ...newPointForm, phone: e.target.value })}
                    placeholder="09xx xxx xxx"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Loại rác tiếp nhận (chọn các loại)</label>
                <div className="grid grid-cols-2 gap-2">
                  {WASTE_CATEGORIES.map((cat) => {
                    const isChecked = newPointForm.acceptedWastes.includes(cat);
                    return (
                      <label
                        key={cat}
                        className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer ${
                          isChecked
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewPointForm({
                                ...newPointForm,
                                acceptedWastes: [...newPointForm.acceptedWastes, cat],
                              });
                            } else {
                              setNewPointForm({
                                ...newPointForm,
                                acceptedWastes: newPointForm.acceptedWastes.filter((w) => w !== cat),
                              });
                            }
                          }}
                          className="rounded text-emerald-600"
                        />
                        <span>{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Mô tả hoặc ghi chú nhận quà</label>
                <textarea
                  rows={2}
                  value={newPointForm.description}
                  onChange={(e) => setNewPointForm({ ...newPointForm, description: e.target.value })}
                  placeholder="Ghi chú về phân loại rác, cách đổi quà hoặc thời gian tiếp nhận..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 shadow-xs"
                >
                  Lưu & Nhận +50 pts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
