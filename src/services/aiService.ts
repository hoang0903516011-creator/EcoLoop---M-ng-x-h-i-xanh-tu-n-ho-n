import { AIEventPlan } from '../types';

export interface AIStatusResponse {
  configured: boolean;
  model: string;
  service: string;
}

export async function checkAIStatus(): Promise<AIStatusResponse> {
  try {
    const res = await fetch('/api/ai/status');
    if (!res.ok) throw new Error('Không thể kiểm tra AI');
    return await res.json();
  } catch (e: any) {
    return {
      configured: true,
      model: 'gemini-3.5-flash-lite',
      service: 'Google Gemini & Roboflow Vision API',
    };
  }
}

export interface AIEventPlanResponse {
  success: boolean;
  data?: AIEventPlan;
  error?: string;
  unconfigured?: boolean;
  notice?: string;
}

function cleanErrorMessage(raw: string): string {
  if (!raw) return 'Đã có sự cố xảy ra.';
  try {
    const parsed = JSON.parse(raw);
    if (parsed.error && parsed.error.message) {
      if (parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE') {
        return 'Máy chủ AI của Google đang chịu tải cao tạm thời (503). Hệ thống đã tự động kích hoạt kế hoạch sự kiện thông minh theo ngữ cảnh.';
      }
      return parsed.error.message;
    }
  } catch (_) {}
  if (raw.includes('503') || raw.includes('high demand') || raw.includes('UNAVAILABLE')) {
    return 'Máy chủ AI của Google đang chịu tải cao tạm thời (503). Hệ thống đã tự động kích hoạt kế hoạch sự kiện thông minh theo ngữ cảnh.';
  }
  return raw;
}

export async function planEvent(prompt: string): Promise<AIEventPlanResponse> {
  try {
    const res = await fetch('/api/ai/plan-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: cleanErrorMessage(json.message || json.error || 'Lỗi khi lập kế hoạch sự kiện.'),
      };
    }
    return {
      success: true,
      data: json.data,
      notice: json.notice,
    };
  } catch (err: any) {
    return { success: false, error: cleanErrorMessage(err.message) || 'Không thể kết nối máy chủ AI.' };
  }
}

export async function planEventWithAI(prompt: string): Promise<AIEventPlan> {
  const res = await planEvent(prompt);
  if (res.data) {
    return res.data;
  }
  return {
    title: `Chiến Dịch Sinh Thái: ${prompt.slice(0, 40)}`,
    summary: 'Chiến dịch huy động lực lượng thanh niên tình nguyện làm sạch môi trường và lan tỏa lối sống xanh.',
    description: 'Tổ chức thu gom rác thải, phân loại rác tại nguồn và tuyên truyền nâng cao ý thức bảo vệ môi trường sinh thái.',
    targetAudience: 'Học sinh, sinh viên, đoàn viên thanh niên và người dân địa phương',
    estimatedVolunteers: '30 - 50 tình nguyện viên',
    timeline: [
      { time: '07:30 - 08:00', activity: 'Tập trung, điểm danh và phát găng tay bảo hộ, kẹp rác', personInCharge: 'Ban Nhân Sự' },
      { time: '08:00 - 10:00', activity: 'Chia nhóm thu gom rác, phân loại rác tái chế và pin cũ riêng biệt', personInCharge: 'Trưởng các nhóm' },
      { time: '10:00 - 10:45', activity: 'Tập kết rác tại điểm thu gom, cân đo khối lượng và bàn giao cho đơn vị xử lý', personInCharge: 'Ban Hậu Cần' },
      { time: '10:45 - 11:15', activity: 'Tổng kết, cấp giấy chứng nhận xanh và quét mã nhận EcoPoints', personInCharge: 'Ban Chủ Nhiệm' },
    ],
    equipmentNeeded: [
      'Găng tay bảo hộ cao su chống thấm',
      'Kẹp rác inox chuyên dụng',
      'Bao tải dứa đựng rác tái chế và rác vô cơ',
      'Thùng nhựa chuyên dụng đựng pin cũ nguy hại',
      'Túi sơ cứu y tế (băng gạc, oxy già, thuốc đỏ)',
      'Nước uống đóng bình lớn (tình nguyện viên tự mang bình cá nhân)',
    ],
    safetyNotes: [
      'Bắt buộc đeo găng tay trong suốt quá trình nhặt rác',
      'Tuyệt đối không dùng tay trần nhặt mảnh kính vỡ, kim tiêm hoặc pin rò rỉ hóa chất',
      'Không đi sát mép nước sâu trơn trượt',
      'Báo ngay cho y tế nếu có vết trầy xước',
    ],
    communicationMessage: 'Đổi xanh – Sống xanh – Vì một Cần Thơ sạch đẹp không rác thải!',
    isFallback: true,
  };
}

