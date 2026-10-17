import { ScanResult } from '../types';

export interface ScanApiResponse {
  success: boolean;
  source: string;
  data: ScanResult;
  error?: string;
}

export interface ChatApiResponse {
  reply: string;
  error?: string;
}

export async function scanWasteImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<ScanApiResponse> {
  try {
    const res = await fetch('/api/scan-waste', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64, mimeType }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Lỗi máy chủ (${res.status})`);
    }

    return await res.json();
  } catch (err: any) {
    console.error('Lỗi khi gọi API phân tích rác thải:', err);
    throw err;
  }
}

export async function chatWithEcoBot(
  message: string,
  history: Array<{ role: string; text: string }> = [],
  scanContext: any = null
): Promise<string> {
  try {
    const res = await fetch('/api/chat-ecobot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history, scanContext }),
    });

    if (!res.ok) {
      throw new Error(`Lỗi máy chủ (${res.status})`);
    }

    const data: ChatApiResponse = await res.json();
    return data.reply;
  } catch (err: any) {
    console.error('Lỗi kết nối tới EcoBot:', err);
    return 'Xin lỗi bạn, kết nối hiện đang gián đoạn. Bạn hãy kiểm tra lại kết nối mạng hoặc thử lại sau giây lát nhé!';
  }
}
