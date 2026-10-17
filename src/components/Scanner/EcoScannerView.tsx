import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Sparkles,
  RefreshCw,
  Share2,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Zap,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DetectedWasteItem, ScanResult } from '../../types';
import { SAMPLE_WASTE_IMAGES } from '../../data/mockData';
import { scanWasteImage } from '../../services/api';
import { scanWasteRealImage } from '../../services/wasteVisionEngine';
import { BoundingBoxCanvas } from './BoundingBoxCanvas';
import { WasteDetailCard } from './WasteDetailCard';

interface EcoScannerViewProps {
  onShareToFeed: (result: ScanResult, imageSrc: string) => void;
  onNavigateToChat: (initialMessage?: string, scanContext?: any) => void;
  onAddEcoPoints: (points: number) => void;
}

export const EcoScannerView: React.FC<EcoScannerViewProps> = ({
  onShareToFeed,
  onNavigateToChat,
  onAddEcoPoints,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState('Đang khởi tạo bộ quét...');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dọn dẹp luồng camera khi unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Không thể kích hoạt Camera:', err);
      setErrorMessage(
        'Không thể truy cập camera trên thiết bị của bạn. Vui lòng cấp quyền hoặc tải ảnh lên từ máy tính.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    processImageForScan(dataUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        processImageForScan(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (sample: typeof SAMPLE_WASTE_IMAGES[0]) => {
    setSelectedImage(sample.url);
    setIsScanning(true);
    setErrorMessage(null);

    const steps = [
      `Đang tải dữ liệu quang học ảnh: ${sample.name}...`,
      `Khởi chạy mạng nơ-ron nhận diện thị giác máy tính...`,
      'Đối chiếu chuẩn phân loại rác thải tại nguồn Việt Nam...',
      'Tạo bounding box chính xác và phân tích vật liệu...',
    ];
    let stepIdx = 0;
    setScanStepText(steps[0]);

    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setScanStepText(steps[stepIdx]);
      }
    }, 350);

    try {
      // Ảnh mẫu đã có cấu trúc định vị và phân loại chuẩn mực theo từng loại rác thực tế
      clearInterval(stepInterval);
      const result: ScanResult = {
        overview: `Đã phân tích thành công ${sample.items.length} vật thể rác thải trong ảnh "${sample.name}".`,
        totalItems: sample.items.length,
        recyclableRatio: Math.round(
          (sample.items.filter((i) => i.category === 'recyclable').length / sample.items.length) * 100
        ),
        totalEcoPoints: sample.items.reduce((acc, curr) => acc + curr.ecoPoints, 0),
        items: sample.items,
      };
      setScanResult(result);
      setSelectedItemId(sample.items[0]?.id || null);
      onAddEcoPoints(result.totalEcoPoints);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e: any) {
      clearInterval(stepInterval);
      console.warn('Lỗi phân tích mẫu:', e);
    } finally {
      setIsScanning(false);
    }
  };

  const processImageForScan = async (imageDataUrl: string) => {
    setSelectedImage(imageDataUrl);
    setIsScanning(true);
    setErrorMessage(null);
    setScanStepText('Đang kết nối mô hình thị giác Roboflow Inference và nhận diện rác thải...');

    const steps = [
      'Đang nạp mô hình thị giác Roboflow chuyên dụng (vo-duy-hoang / general-segmentation-api-2)...',
      'Đang phân đoạn SAM 3 và định vị hộp Bounding Box cho từng vật thể rác...',
      'Đối chiếu chuẩn phân loại rác thải môi trường (Pin nguy hại / Tái chế / Hữu cơ)...',
      'Tạo Bounding Box chuẩn hóa và tính điểm thưởng EcoPoints...',
    ];
    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setScanStepText(steps[stepIdx]);
      }
    }, 450);

    try {
      // 1. ƯU TIÊN GỌI BACKEND API (Chạy mô hình Roboflow Workflow SAM 3 & Gemini Vision)
      const response = await scanWasteImage(imageDataUrl);
      clearInterval(interval);

      if (response && response.success && response.data && response.data.items?.length > 0) {
        setScanResult(response.data);
        setSelectedItemId(response.data.items[0]?.id || null);
        onAddEcoPoints(response.data.totalEcoPoints || 25);

        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
        return;
      }

      // 2. Nếu backend không có vật thể, thử qua bộ máy thị giác ngoại tuyến dự phòng
      const fallbackResult = await scanWasteRealImage(imageDataUrl);
      if (fallbackResult && fallbackResult.items.length > 0) {
        setScanResult(fallbackResult);
        setSelectedItemId(fallbackResult.items[0]?.id || null);
        onAddEcoPoints(fallbackResult.totalEcoPoints || 20);

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
        return;
      }

      throw new Error('Không thể định vị được vật thể rõ nét trong ảnh');
    } catch (err: any) {
      clearInterval(interval);
      console.warn('Backend scan failed, trying offline vision fallback:', err);
      try {
        const fallbackResult = await scanWasteRealImage(imageDataUrl);
        if (fallbackResult && fallbackResult.items.length > 0) {
          setScanResult(fallbackResult);
          setSelectedItemId(fallbackResult.items[0]?.id || null);
          onAddEcoPoints(fallbackResult.totalEcoPoints || 20);
          return;
        }
      } catch (fallbackErr) {
        console.error('Offline fallback also failed:', fallbackErr);
      }

      setErrorMessage(
        'Không thể nhận diện rõ vật thể trong ảnh này. Bạn vui lòng chụp lại với ánh sáng tốt hơn hoặc góc nhìn gần vật thể hơn nhé.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setScanResult(null);
    setSelectedItemId(null);
    setHoveredItemId(null);
    setErrorMessage(null);
    stopCamera();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Page Title & Intro */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>EcoBot AI Vision • Nhận diện rác thải đa vật thể với Bounding Box</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Chụp Ảnh & Phân Loại Rác Tự Động
          </h1>
          <p className="mt-2 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Chụp ảnh hoặc tải lên hình ảnh rác thải xung quanh bạn. EcoBot sẽ tự động đóng khung từng
            vật thể, phân loại chuẩn xác theo quy định Việt Nam và hướng dẫn cách tái chế chi tiết.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-semibold underline text-red-700 hover:text-red-900"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Main Scanner Section */}
      {!selectedImage && !isCameraActive && (
        <div className="space-y-8">
          {/* Action Boxes: Upload / Camera */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] group shadow-xs"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform mb-4">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Tải ảnh rác thải từ máy</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Hỗ trợ tệp JPG, PNG, WEBP. Hệ thống sẽ phân tích tất cả các vật phẩm có trong bức ảnh.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-700 text-white shadow-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Chọn tập tin</span>
              </span>
            </div>

            {/* Camera Capture Box */}
            <div
              onClick={startCamera}
              className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/50 hover:bg-teal-50 rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] group shadow-xs"
            >
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform mb-4">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Mở Camera chụp trực tiếp</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs">
                Sử dụng camera điện thoại hoặc webcam để quét nhanh rác thải xung quanh bạn theo thời gian thực.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-700 text-white shadow-xs">
                <Camera className="w-3.5 h-3.5" />
                <span>Bật Camera</span>
              </span>
            </div>
          </div>

          {/* Sample Images Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-600" />
                  <span>Hoặc thử ngay với các ảnh mẫu thực tế:</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Bấm để trải nghiệm ngay thuật toán nhận diện đa vật thể kèm Bounding Box
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SAMPLE_WASTE_IMAGES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="group relative rounded-2xl overflow-hidden border border-gray-200 hover:border-emerald-500 cursor-pointer shadow-xs hover:shadow-md transition-all duration-200 bg-gray-50"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3.5">
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {sample.name}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{sample.description}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-700 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        {sample.items.length} vật thể rác
                      </span>
                      <span className="text-gray-400 font-medium group-hover:text-emerald-600 flex items-center gap-0.5">
                        Quét thử <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Live Camera View */}
      {isCameraActive && (
        <div className="bg-gray-950 rounded-3xl p-6 shadow-2xl border border-gray-800 text-center space-y-4">
          <div className="relative max-w-xl mx-auto rounded-2xl overflow-hidden border-2 border-emerald-500/50">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto max-h-[480px] object-cover"
            />
            {/* Viewfinder Overlay */}
            <div className="absolute inset-8 border border-white/40 rounded-xl pointer-events-none flex items-center justify-center">
              <span className="text-xs text-white/70 bg-black/50 px-3 py-1 rounded-full">
                Đặt rác thải vào giữa khung hình
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={captureCameraFrame}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span>Chụp & Phân Tích Ngay</span>
            </button>
            <button
              onClick={stopCamera}
              className="px-5 py-3 rounded-2xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold text-sm"
            >
              Hủy bỏ
            </button>
          </div>
        </div>
      )}

      {/* Scanning In Progress Screen */}
      {isScanning && selectedImage && (
        <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl text-center space-y-6">
          <div className="relative max-w-md mx-auto rounded-2xl overflow-hidden border border-emerald-200">
            <img src={selectedImage} alt="Đang quét" className="w-full h-64 object-cover" />
            {/* Laser Scanning Line Animation */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent pointer-events-none animate-pulse"></div>
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-lg shadow-emerald-400 animate-[bounce_2s_infinite]"></div>
          </div>

          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold text-base">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Hệ thống thị giác EcoBot đang phân tích...</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium bg-emerald-50 py-2 px-4 rounded-xl border border-emerald-200">
              {scanStepText}
            </p>
          </div>
        </div>
      )}

      {/* Completed Scan Results Screen */}
      {!isScanning && scanResult && selectedImage && (
        <div className="space-y-6">
          {/* Top Summary Banner */}
          <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Nhận diện thành công hoàn tất</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/70 text-emerald-800 border border-emerald-300">
                  Model: vo-duy-hoang / general-segmentation-api-2
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                Phát hiện {scanResult.totalItems} vật thể rác thải
              </h2>
              <p className="text-xs text-gray-600 mt-1">{scanResult.overview}</p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center px-4 py-2.5 bg-blue-50 rounded-2xl border border-blue-200">
                <div className="text-lg font-black text-blue-700">
                  {scanResult.recyclableRatio}%
                </div>
                <div className="text-[11px] font-semibold text-blue-800">Tái chế được</div>
              </div>
              <div className="text-center px-4 py-2.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="text-lg font-black text-emerald-700 flex items-center justify-center gap-0.5">
                  <Award className="w-4 h-4" />+{scanResult.totalEcoPoints}
                </div>
                <div className="text-[11px] font-semibold text-emerald-800">Điểm Xanh tích lũy</div>
              </div>
            </div>
          </div>

          {/* Interactive Bounding Box Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Col: Bounding Box Canvas (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
                  <span>Trực quan hóa hộp Bounding Box AI</span>
                  <span className="text-emerald-700 font-semibold">Tỉ lệ chuẩn hóa 0-1000</span>
                </div>

                <BoundingBoxCanvas
                  imageSrc={selectedImage}
                  items={scanResult.items}
                  selectedItemId={selectedItemId}
                  onSelectItem={(id) => setSelectedItemId(id)}
                  hoveredItemId={hoveredItemId}
                  onHoverItem={(id) => setHoveredItemId(id)}
                />

                {/* Color Legend */}
                <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="font-semibold text-gray-500">Chú giải:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span> Rác tái chế
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Rác hữu cơ
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span> Rác vô cơ
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-800 font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span> Rác nguy hại
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-medium">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span> Rác điện tử
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onShareToFeed(scanResult, selectedImage)}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Chia Sẻ Lên Mạng Xã Hội Xanh</span>
                </button>

                <button
                  onClick={() =>
                    onNavigateToChat(
                      `Tôi vừa quét được các loại rác gồm: ${scanResult.items
                        .map((i) => i.label)
                        .join(', ')}. Nhờ EcoBot tư vấn thêm về điểm thu gom rác tái chế và rác nguy hại uy tín gần tôi!`,
                      scanResult
                    )
                  }
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold text-sm transition-all"
                >
                  <HelpCircle className="w-4 h-4 text-teal-600" />
                  <span>Hỏi EcoBot</span>
                </button>

                <button
                  onClick={resetScanner}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Quét Ảnh Mới</span>
                </button>
              </div>
            </div>

            {/* Right Col: Detailed Breakdown Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-sm text-gray-900">
                  Chi tiết từng vật thể ({scanResult.items.length})
                </h3>
                <span className="text-xs text-gray-400">Chọn để xem quy trình</span>
              </div>

              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {scanResult.items.map((item) => (
                  <WasteDetailCard
                    key={item.id}
                    item={item}
                    isSelected={selectedItemId === item.id}
                    onSelect={() => setSelectedItemId(item.id)}
                    onAskEcoBot={(it) =>
                      onNavigateToChat(
                        `EcoBot ơi, hãy hướng dẫn kỹ hơn cho mình cách xử lý hoặc tái chế món này: ${it.label} (${it.categoryName})`,
                        it
                      )
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
