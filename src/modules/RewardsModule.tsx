import React, { useState, useEffect } from 'react';
import {
  Gift,
  Coins,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ArrowRight,
  Filter,
  PackageCheck,
  Building,
  Clock,
  ChevronRight,
  Ticket,
} from 'lucide-react';
import { storage } from '../services/storageService';
import { EcoReward, UserProfile } from '../types';
import confetti from 'canvas-confetti';

interface RewardsModuleProps {
  onOpenWallet?: () => void;
  onNavigateToScanner?: () => void;
}

export const RewardsModule: React.FC<RewardsModuleProps> = ({
  onOpenWallet,
  onNavigateToScanner,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(storage.getCurrentUser());
  const [rewards, setRewards] = useState<EcoReward[]>(storage.getRewards());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedReward, setSelectedReward] = useState<EcoReward | null>(null);
  const [redeemedVoucher, setRedeemedVoucher] = useState<{
    reward: EcoReward;
    code: string;
    redeemedAt: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setCurrentUser(storage.getCurrentUser());
      setRewards(storage.getRewards());
    };
    update();
    return storage.subscribe(update);
  }, []);

  const categories = [
    { id: 'all', label: 'Tất cả quà tặng' },
    { id: 'Cây xanh', label: 'Cây xanh lọc khí' },
    { id: 'Vật dụng sinh thái', label: 'Vật dụng sinh thái' },
    { id: 'Voucher', label: 'Voucher xanh' },
    { id: 'Quà tái chế', label: 'Sản phẩm tái chế' },
  ];

  const filteredRewards =
    selectedCategory === 'all'
      ? rewards
      : rewards.filter((r) => r.category === selectedCategory);

  const handleRedeem = (reward: EcoReward) => {
    setErrorMsg(null);
    if (currentUser.ecoPoints < reward.ecoPointsCost) {
      setErrorMsg(`Bạn còn thiếu ${reward.ecoPointsCost - currentUser.ecoPoints} EcoPoints để đổi phần quà này. Hãy tích cực quét phân loại rác hoặc tham gia sự kiện nhé!`);
      return;
    }

    if (reward.remainingQuantity <= 0) {
      setErrorMsg('Phần quà này hiện đã tạm hết suất. Vui lòng chọn món quà khác nhé!');
      return;
    }

    // Deduct points and register transaction
    const success = storage.deductEcoPoints(
      reward.ecoPointsCost,
      `Đổi quà: ${reward.name}`,
      `Đã sử dụng ${reward.ecoPointsCost} EcoPoints đổi quà tại kho EcoRewards Cần Thơ.`
    );

    if (success) {
      // Decrement reward quantity
      storage.updateRewardQuantity(reward.id, -1);

      // Trigger confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      const randomCode = `ECO-${Math.floor(100000 + Math.random() * 900000)}`;
      setRedeemedVoucher({
        reward,
        code: randomCode,
        redeemedAt: new Date().toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
      setSelectedReward(null);
    } else {
      setErrorMsg('Giao dịch đổi quà chưa thành công. Vui lòng thử lại sau.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wide border border-emerald-400/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Hệ Thống Đổi Thưởng Tuần Hoàn EcoRewards</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Đổi Rác Lấy Quà Xanh
            </h1>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              Tích lũy EcoPoints từ mỗi lần phân loại rác thông minh bằng EcoBot, gom pin cũ, đổi ve chai và tham gia sự kiện tình nguyện để nhận những món quà thân thiện với Trái Đất.
            </p>
          </div>

          {/* User Points Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 sm:p-6 shrink-0 flex flex-col justify-between min-w-[240px]">
            <div className="text-xs uppercase tracking-wider text-emerald-200 font-semibold mb-1">
              Số dư EcoPoints của bạn
            </div>
            <div className="flex items-center gap-2.5 my-2">
              <Coins className="w-8 h-8 text-amber-400 shrink-0 fill-amber-400/20" />
              <span className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-white">
                {currentUser.ecoPoints.toLocaleString()}
              </span>
              <span className="text-xs text-amber-300 font-bold self-end mb-1">PTS</span>
            </div>
            <div className="flex items-center gap-2 mt-2 pt-3 border-t border-white/10">
              <button
                onClick={onOpenWallet}
                className="text-xs text-emerald-200 hover:text-white underline font-medium transition-colors"
              >
                Xem lịch sử giao dịch
              </button>
              <span className="text-white/40">•</span>
              <button
                onClick={onNavigateToScanner}
                className="text-xs text-amber-300 hover:text-amber-200 font-bold transition-colors"
              >
                + Kiếm thêm điểm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Error / Alert notice */}
      {errorMsg && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-amber-700 hover:text-amber-900 font-bold text-xs"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRewards.map((reward) => {
          const canAfford = currentUser.ecoPoints >= reward.ecoPointsCost;
          const isOutOfStock = reward.remainingQuantity <= 0;

          return (
            <div
              key={reward.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={reward.image}
                  alt={reward.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-emerald-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {reward.category}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className="bg-amber-500 text-slate-950 text-xs font-bold font-mono px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 fill-slate-950" />
                    {reward.ecoPointsCost} pts
                  </span>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tài trợ: <strong>{reward.sponsor}</strong></span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {reward.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {reward.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Số lượng còn lại:</span>
                    <span
                      className={`font-semibold font-mono ${
                        isOutOfStock ? 'text-red-500' : 'text-slate-800'
                      }`}
                    >
                      {isOutOfStock ? 'Đã hết quà' : `${reward.remainingQuantity} phần`}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedReward(reward)}
                    disabled={isOutOfStock}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : canAfford
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {isOutOfStock ? (
                      'Tạm hết hàng'
                    ) : canAfford ? (
                      <>
                        <Gift className="w-4 h-4" />
                        <span>Đổi Ngay ({reward.ecoPointsCost} pts)</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 text-amber-600" />
                        <span>Cần thêm {reward.ecoPointsCost - currentUser.ecoPoints} pts</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Confirm Redeem */}
      {selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                <Gift className="w-5 h-5 text-emerald-600" />
                <span>Xác nhận đổi phần quà</span>
              </div>
              <button
                onClick={() => setSelectedReward(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-4 items-center bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <img
                src={selectedReward.image}
                alt={selectedReward.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-sm line-clamp-2">
                  {selectedReward.name}
                </h4>
                <div className="text-xs text-slate-500">Đơn vị: {selectedReward.sponsor}</div>
                <div className="text-sm font-mono font-bold text-amber-600 flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  {selectedReward.ecoPointsCost} EcoPoints
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100">
              <div className="flex justify-between">
                <span>Số dư hiện tại:</span>
                <span className="font-mono font-bold text-slate-800">
                  {currentUser.ecoPoints} pts
                </span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Điểm trừ đổi quà:</span>
                <span className="font-mono font-bold">-{selectedReward.ecoPointsCost} pts</span>
              </div>
              <div className="border-t border-emerald-200 pt-1.5 flex justify-between font-bold text-emerald-900">
                <span>Số dư còn lại:</span>
                <span className="font-mono">
                  {currentUser.ecoPoints - selectedReward.ecoPointsCost} pts
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedReward(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleRedeem(selectedReward)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
              >
                Xác nhận đổi quà
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Voucher Success */}
      {redeemedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Đổi Quà Thành Công!</h3>
              <p className="text-xs text-slate-600 mt-1">
                Bạn đã đổi thành công phần quà <strong>{redeemedVoucher.reward.name}</strong>.
              </p>
            </div>

            {/* Voucher Box */}
            <div className="bg-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl p-5 space-y-3">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                Mã nhận quà của bạn
              </div>
              <div className="text-2xl font-mono font-black text-emerald-800 tracking-wider bg-white py-2 px-4 rounded-xl border border-emerald-200 inline-block shadow-2xs">
                {redeemedVoucher.code}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Thời gian đổi: {redeemedVoucher.redeemedAt}
              </div>
            </div>

            <div className="text-xs text-slate-600 text-left bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 space-y-1">
              <div className="font-bold text-emerald-900">Địa điểm nhận quà:</div>
              <div>• Xuất trình mã trên tại trạm thu gom EcoLoop Cần Thơ gần nhất (Trường THCS Thốt Nốt hoặc ĐH Cần Thơ).</div>
              <div>• Đối với voucher số, hệ thống sẽ tự động kích hoạt mã ưu đãi của bạn.</div>
            </div>

            <button
              onClick={() => setRedeemedVoucher(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-colors shadow-xs"
            >
              Hoàn tất & Tiếp tục
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
