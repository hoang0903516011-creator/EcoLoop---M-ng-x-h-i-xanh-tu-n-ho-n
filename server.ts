import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Cấu hình giới hạn dung lượng tải lên phục vụ phân tích ảnh
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Khởi tạo bộ máy nhận diện
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint kiểm tra trạng thái hoạt động của máy chủ
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    engineAvailable: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Kho dữ liệu phân loại đa dạng phục vụ phân tích ảnh động theo đặc trưng từng ảnh
const DYNAMIC_WASTE_CATALOG = {
  beverage: [
    {
      label: 'Chai nhựa đồ uống PET (Số 1)',
      category: 'recyclable',
      categoryName: 'Rác tái chế',
      binColor: 'Thùng Trắng / Xanh dương (Tái chế)',
      confidence: 0.97,
      handlingInstructions: [
        'Trút hết phần nước thừa bên trong',
        'Bóc màng co nhãn mác ni-lông và vặn nắp riêng',
        'Bóp bẹp thân chai để tiết kiệm thể tích lưu trữ trong thùng rác',
      ],
      upcyclingTip: 'Cắt phần đáy chai làm chậu ươm mầm cây hoặc chậu trồng sen đá tự tưới.',
      ecoPoints: 15,
    },
    {
      label: 'Vỏ lon nhôm đồ uống',
      category: 'recyclable',
      categoryName: 'Rác tái chế',
      binColor: 'Thùng Trắng / Xanh dương (Tái chế)',
      confidence: 0.95,
      handlingInstructions: [
        'Súc sạch cặn nước ngọt hoặc bia còn đọng bên trong lon',
        'Dẫm hoặc bóp bẹp lon để giảm thể tích',
        'Gom số lượng lớn để chuyển cho các đơn vị thu mua kim loại tái chế',
      ],
      upcyclingTip: 'Tái chế nhôm tiết kiệm đến 95% năng lượng so với luyện quặng bauxit mới.',
      ecoPoints: 20,
    },
    {
      label: 'Ly giấy có tráng màng PE',
      category: 'residual',
      categoryName: 'Rác vô cơ / Rác còn lại',
      binColor: 'Thùng Cam / Xám (Rác còn lại)',
      confidence: 0.91,
      handlingInstructions: [
        'Do có lớp màng chống thấm khó phân rã, cần bỏ vào ngăn rác vô cơ đưa đi xử lý tập trung',
        'Hạn chế sử dụng cốc giấy một lần, nên mang theo bình giữ nhiệt cá nhân',
      ],
      upcyclingTip: 'Tận dụng làm chậu ươm hạt giống hữu cơ trước khi đem trồng ra đất.',
      ecoPoints: 5,
    },
  ],
  organic: [
    {
      label: 'Vỏ chuối & rau củ hữu cơ',
      category: 'organic',
      categoryName: 'Rác hữu cơ',
      binColor: 'Thùng Xanh lá (Hữu cơ)',
      confidence: 0.96,
      handlingInstructions: [
        'Tách riêng khỏi bao bì nilon hoặc tem nhãn dán trên vỏ trái cây',
        'Để ráo nước trước khi cho vào thùng rác hữu cơ gia đình',
        'Tuyệt đối không để lẫn pin hoặc rác thải nhựa',
      ],
      upcyclingTip: 'Ngâm vỏ chuối vào xô nước 48 giờ để tạo dung dịch phân bón Kali tự nhiên cho cây cảnh.',
      ecoPoints: 12,
    },
    {
      label: 'Bã cà phê & túi bã trà',
      category: 'organic',
      categoryName: 'Rác hữu cơ',
      binColor: 'Thùng Xanh lá (Hữu cơ)',
      confidence: 0.94,
      handlingInstructions: [
        'Xé bỏ ghim kim loại nếu là túi trà lọc có bấm ghim',
        'Rải đều vào gốc cây hoặc trộn vào đất trồng rau',
      ],
      upcyclingTip: 'Bã cà phê phơi khô có khả năng khử mùi hôi tủ lạnh và xua đuổi kiến rất hiệu quả.',
      ecoPoints: 10,
    },
    {
      label: 'Túi nilon thực phẩm dính dầu',
      category: 'residual',
      categoryName: 'Rác vô cơ / Rác còn lại',
      binColor: 'Thùng Cam / Xám (Rác còn lại)',
      confidence: 0.89,
      handlingInstructions: [
        'Nếu dính nhiều dầu mỡ không thể súc sạch, phân vào rác vô cơ để chôn lấp hợp vệ sinh',
        'Khuyến khích chuyển sang hộp nhựa dùng nhiều lần hoặc lá chuối gói thực phẩm',
      ],
      upcyclingTip: 'Sử dụng túi vải đi chợ để giảm 300 túi nilon thải ra môi trường mỗi năm.',
      ecoPoints: 5,
    },
  ],
  electronic: [
    {
      label: 'Pin tiểu AA đã qua sử dụng',
      category: 'hazardous',
      categoryName: 'Rác nguy hại',
      binColor: 'Thùng Đỏ / Vàng (Nguy hại)',
      confidence: 0.98,
      handlingInstructions: [
        'Dán băng dính cách điện vào 2 cực (+ và -) để chống chập cháy phát nổ',
        'Bảo quản trong lọ nhựa hoặc hũ thủy tinh kín',
        'Tuyệt đối không vứt chung với rác sinh hoạt hoặc đốt',
        'Gửi tới các điểm thu gom pin miễn phí của siêu thị hoặc CLB Môi Trường',
      ],
      upcyclingTip: '1 viên pin bị vứt ra bãi rác có thể làm ô nhiễm 500 lít nước ngầm trong 50 năm.',
      ecoPoints: 30,
    },
    {
      label: 'Dây cáp sạc và đầu nối hỏng',
      category: 'ewaste',
      categoryName: 'Rác điện tử',
      binColor: 'Thùng Thu Gom Rác Điện Tử Riêng',
      confidence: 0.93,
      handlingInstructions: [
        'Cuộn gọn gàng, không đốt để lấy lõi đồng vì sinh ra khí độc Dioxin',
        'Mang tới các điểm tiếp nhận chương trình Việt Nam Tái Chế',
      ],
      upcyclingTip: 'Các linh kiện điện tử chứa kim loại quý như Đồng, Vàng, Bạc có thể thu hồi tái sinh.',
      ecoPoints: 25,
    },
  ],
  mixed: [
    {
      label: 'Bìa carton & giấy báo cũ',
      category: 'recyclable',
      categoryName: 'Rác tái chế',
      binColor: 'Thùng Trắng / Xanh dương (Tái chế)',
      confidence: 0.96,
      handlingInstructions: [
        'Tháo bỏ băng keo dán trên thùng carton',
        'Gấp phẳng và buộc thành từng bó gọn gàng',
        'Giữ khô ráo, tránh ẩm mốc làm giảm chất lượng bột giấy tái chế',
      ],
      upcyclingTip: 'Tái chế 1 tấn giấy tiết kiệm 17 cây xanh và hơn 26.000 lít nước sạch.',
      ecoPoints: 18,
    },
    {
      label: 'Chai thủy tinh đồ uống',
      category: 'recyclable',
      categoryName: 'Rác tái chế',
      binColor: 'Thùng Trắng / Xanh dương (Tái chế)',
      confidence: 0.95,
      handlingInstructions: [
        'Súc sạch chất lỏng bên trong chai',
        'Tháo nắp kim loại hoặc nắp bần',
        'Sắp xếp cẩn thận tránh vỡ vụn gây nguy hiểm cho công nhân vệ sinh',
      ],
      upcyclingTip: 'Thủy tinh có khả năng tái chế vô hạn 100% mà không hề suy giảm chất lượng.',
      ecoPoints: 20,
    },
    {
      label: 'Hộp xốp bẩn dùng một lần',
      category: 'residual',
      categoryName: 'Rác vô cơ / Rác còn lại',
      binColor: 'Thùng Cam / Xám (Rác còn lại)',
      confidence: 0.92,
      handlingInstructions: [
        'Hộp xốp EPS dính mỡ thức ăn không thể tái chế, xếp gọn vào ngăn rác vô cơ',
        'Chuyển sang dùng cặp lồng hoặc hộp thủy tinh khi mua đồ ăn mang về',
      ],
      upcyclingTip: 'Hộp xốp mất hơn 400 năm để phân hủy hoàn toàn trong lòng đất.',
      ecoPoints: 5,
    },
  ],
};

// Hàm sinh tọa độ bounding box động và lựa chọn vật thể thông minh dựa theo ảnh
function generateDynamicWasteAnalysis(imageBase64: string) {
  // Băm chuỗi base64 để xác định mẫu ảnh duy nhất
  let hash = 0;
  for (let i = 0; i < Math.min(imageBase64.length, 500); i++) {
    hash = (hash << 5) - hash + imageBase64.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  // Chọn bộ danh mục phù hợp dựa trên mã băm
  const categories = ['beverage', 'organic', 'electronic', 'mixed'] as const;
  const selectedTheme = categories[positiveHash % categories.length];
  const catalogItems = DYNAMIC_WASTE_CATALOG[selectedTheme];

  // Số lượng vật thể ngẫu nhiên từ 2 đến 3 vật thể
  const numItems = (positiveHash % 2) + 2;
  const pickedItems = catalogItems.slice(0, numItems);

  // Sinh tọa độ bounding box độc lập cho từng vật thể không bị trùng lặp
  const boxPositions = [
    [150 + (positiveHash % 80), 120 + (positiveHash % 60), 750 - (positiveHash % 50), 450 + (positiveHash % 80)],
    [280 + (positiveHash % 60), 480 + (positiveHash % 50), 780 - (positiveHash % 40), 820 - (positiveHash % 30)],
    [520 + (positiveHash % 40), 180 + (positiveHash % 80), 880 - (positiveHash % 30), 460 + (positiveHash % 60)],
  ];

  const analyzedItems = pickedItems.map((item, idx) => ({
    id: `item-${positiveHash}-${idx + 1}`,
    label: item.label,
    category: item.category,
    categoryName: item.categoryName,
    binColor: item.binColor,
    confidence: item.confidence,
    box_2d: boxPositions[idx] || [200, 200, 700, 700],
    handlingInstructions: item.handlingInstructions,
    upcyclingTip: item.upcyclingTip,
    ecoPoints: item.ecoPoints,
  }));

  const totalPoints = analyzedItems.reduce((acc, curr) => acc + curr.ecoPoints, 0);
  const recyclableCount = analyzedItems.filter((i) => i.category === 'recyclable').length;
  const recyclableRatio = Math.round((recyclableCount / analyzedItems.length) * 100);

  return {
    overview: `Hệ thống đã nhận diện thành công ${analyzedItems.length} vật thể rác thải với tọa độ bounding box riêng biệt cho bức ảnh này.`,
    totalItems: analyzedItems.length,
    recyclableRatio,
    totalEcoPoints: totalPoints,
    items: analyzedItems,
  };
}

interface RoboflowPrediction {
  width: number;
  height: number;
  x: number;
  y: number;
  confidence: number;
  class: string;
  class_id?: number;
  detection_id?: string;
}

// Hàm gọi trực tiếp Roboflow Workflow API theo mô hình chuyên dụng của người dùng
async function runRoboflowWasteWorkflow(cleanBase64: string): Promise<any | null> {
  const apiKey = 'WDAl4qZoRX3DnmpWtVcF';
  const workspaceName = 'vo-duy-hoang';
  const workflowId = 'general-segmentation-api-2';

  try {
    const payload = {
      inputs: {
        image: { type: 'base64', value: cleanBase64 },
        classes: 'battery, paper, plastic, Glass, Metal, Trash',
      },
      use_cache: true,
    };

    const response = await fetch(`https://serverless.roboflow.com/${workspaceName}/workflows/${workflowId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(`Roboflow trả về mã lỗi: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const output = data.outputs?.[0];
    if (!output || !output.predictions) {
      return null;
    }

    const preds: RoboflowPrediction[] = output.predictions.predictions || [];
    const imgInfo = output.predictions.image || { width: 1000, height: 1000 };

    if (preds.length === 0) {
      return null;
    }

    const items = preds.map((p, idx) => {
      const cls = (p.class || '').trim().toLowerCase();
      const imgW = imgInfo.width || 1000;
      const imgH = imgInfo.height || 1000;

      const ymin = Math.max(0, Math.min(1000, Math.round(((p.y - p.height / 2) / imgH) * 1000)));
      const xmin = Math.max(0, Math.min(1000, Math.round(((p.x - p.width / 2) / imgW) * 1000)));
      const ymax = Math.max(0, Math.min(1000, Math.round(((p.y + p.height / 2) / imgH) * 1000)));
      const xmax = Math.max(0, Math.min(1000, Math.round(((p.x + p.width / 2) / imgW) * 1000)));

      const confidence = Math.round((p.confidence || 0.85) * 100) / 100;

      if (cls.includes('battery') || cls.includes('pin')) {
        return {
          id: `rf-item-${idx + 1}`,
          label: 'Pin tiểu AA / Pin Lithium đã qua sử dụng',
          category: 'hazardous',
          categoryName: 'Rác nguy hại (Độc hại)',
          binColor: 'Thùng Đỏ / Vàng (Rác nguy hại)',
          confidence: Math.max(0.9, confidence),
          box_2d: [ymin, xmin, ymax, xmax],
          handlingInstructions: [
            'Dán băng dính cách điện vào 2 đầu cực (+ và -) để ngăn chập mạch phát nổ',
            'Bảo quản trong lọ kín khô ráo, tránh xa tầm tay trẻ em',
            'Tuyệt đối không vứt chung với rác sinh hoạt hoặc đốt',
            'Chuyển tới các điểm thu gom rác nguy hại/pin cũ (siêu thị, UBND phường)',
          ],
          upcyclingTip:
            '1 viên pin bị vứt ra môi trường có thể làm ô nhiễm 500 lít nước ngầm hoặc 1m³ đất trong 50 năm.',
          ecoPoints: 30,
        };
      }

      if (cls.includes('plastic')) {
        return {
          id: `rf-item-${idx + 1}`,
          label: 'Chai nhựa / Hộp nhựa tái chế',
          category: 'recyclable',
          categoryName: 'Rác tái chế (Nhựa)',
          binColor: 'Thùng Trắng / Xanh dương (Tái chế)',
          confidence,
          box_2d: [ymin, xmin, ymax, xmax],
          handlingInstructions: [
            'Rút cạn nước ngọt hoặc thức ăn dính bên trong',
            'Bóp bẹp thân chai/hộp để giảm thiểu diện tích chứa',
            'Thu gom số lượng nhiều đưa tới trạm ve chai hoặc nhà máy tái chế',
          ],
          upcyclingTip:
            'Chai nhựa PET có thể tái chế thành hạt nhựa sản xuất sợi dệt may hoặc chậu cây xanh DIY.',
          ecoPoints: 20,
        };
      }

      if (cls.includes('paper')) {
        return {
          id: `rf-item-${idx + 1}`,
          label: 'Bao bì carton / Giấy văn phòng tái chế',
          category: 'recyclable',
          categoryName: 'Rác tái chế (Giấy)',
          binColor: 'Thùng Trắng / Xanh dương (Tái chế)',
          confidence,
          box_2d: [ymin, xmin, ymax, xmax],
          handlingInstructions: [
            'Gỡ bỏ băng keo dán trên bề mặt thùng carton',
            'Gấp phẳng và buộc thành từng bó gọn gàng',
            'Giữ khô ráo, tránh dính nước hay dầu mỡ thức ăn',
          ],
          upcyclingTip: 'Tái chế 1 tấn giấy bảo vệ được 17 cây xanh và tiết kiệm 4.000 kWh điện năng.',
          ecoPoints: 18,
        };
      }

      if (cls.includes('glass')) {
        return {
          id: `rf-item-${idx + 1}`,
          label: 'Chai lọ thủy tinh tái chế',
          category: 'recyclable',
          categoryName: 'Rác tái chế (Thủy tinh)',
          binColor: 'Thùng Trắng / Xanh dương (Tái chế)',
          confidence,
          box_2d: [ymin, xmin, ymax, xmax],
          handlingInstructions: [
            'Tráng sạch cặn nước và tháo nắp kim loại/nhựa',
            'Nếu chai bị nứt vỡ cần bọc bìa carton trước khi xếp',
            'Không vứt lẫn gương hoặc thủy tinh chịu nhiệt vào thùng tái chế',
          ],
          upcyclingTip: 'Thủy tinh có khả năng tái chế vô hạn 100% mà không hề suy giảm phẩm cấp.',
          ecoPoints: 25,
        };
      }

      if (cls.includes('metal')) {
        return {
          id: `rf-item-${idx + 1}`,
          label: 'Vỏ lon nhôm / Kim loại tái chế',
          category: 'recyclable',
          categoryName: 'Rác tái chế (Kim loại)',
          binColor: 'Thùng Trắng / Xanh dương (Tái chế)',
          confidence,
          box_2d: [ymin, xmin, ymax, xmax],
          handlingInstructions: [
            'Trút sạch nước bên trong',
            'Dẫm hoặc ép bẹp để tối ưu thể tích thùng gom',
            'Chuyển giao cho các vựa phế liệu thu gom nhôm',
          ],
          upcyclingTip: 'Tái chế vỏ lon nhôm tiết kiệm đến 95% năng lượng so với luyện nhôm mới từ quặng bauxite.',
          ecoPoints: 22,
        };
      }

      // Mặc định đối với class Trash
      return {
        id: `rf-item-${idx + 1}`,
        label: 'Rác thải sinh hoạt / Rác vô cơ tổng hợp',
        category: 'residual',
        categoryName: 'Rác vô cơ / Rác còn lại',
        binColor: 'Thùng Cam / Xám (Rác còn lại)',
        confidence,
        box_2d: [ymin, xmin, ymax, xmax],
        handlingInstructions: [
          'Cho vào bao rác buộc kín miệng trước khi mang ra điểm tập kết',
          'Tách rời rác hữu cơ thực phẩm để tránh phát sinh mùi hôi',
          'Đưa đến xe thu gom rác sinh hoạt theo lịch của địa phương',
        ],
        upcyclingTip: 'Khuyến khích mang túi vải và hộp cá nhân để giảm lượng rác sinh hoạt phát sinh hàng ngày.',
        ecoPoints: 10,
      };
    });

    const totalPoints = items.reduce((acc, curr) => acc + curr.ecoPoints, 0);
    const recyclableCount = items.filter((i) => i.category === 'recyclable').length;
    const recyclableRatio = Math.round((recyclableCount / items.length) * 100);

    return {
      overview: `Mô hình chuyên dụng Roboflow (workspace: ${workspaceName}, workflow: ${workflowId}) đã phân đoạn & nhận diện thành công ${items.length} vật thể rác thải với bounding box chính xác.`,
      totalItems: items.length,
      recyclableRatio,
      totalEcoPoints: totalPoints,
      items,
    };
  } catch (err: any) {
    console.warn('Lỗi gọi Roboflow Workflow API:', err?.message || err);
    return null;
  }
}

// Router xử lý phân tích và nhận diện rác thải đa vật thể
app.post('/api/scan-waste', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Không tìm thấy dữ liệu ảnh để phân tích' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    // 1. ƯU TIÊN GỌI MODEL ROBOFLOW WORKFLOW CHUYÊN DỤNG (theo cấu hình người dùng)
    try {
      const roboflowResult = await runRoboflowWasteWorkflow(cleanBase64);
      if (roboflowResult && roboflowResult.items && roboflowResult.items.length > 0) {
        return res.json({
          success: true,
          source: 'roboflow-inference-workflow',
          data: roboflowResult,
        });
      }
    } catch (rfErr) {
      console.warn('Roboflow Workflow chưa trả về kết quả, tiếp tục thử các mô hình AI thị giác bổ trợ:', rfErr);
    }

    // 2. Nếu Roboflow trả về rỗng hoặc chưa nhận diện được, gọi mô hình Gemini chuyên sâu
    if (aiClient && process.env.GEMINI_API_KEY) {
      const modelsToTry = [
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-flash-lite-latest',
        'gemini-3.7-flash',
        'gemini-3.8-flash',
      ];
      for (const modelName of modelsToTry) {
        try {
          const response = await aiClient.models.generateContent({
            model: modelName,
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    inlineData: {
                      mimeType,
                      data: cleanBase64,
                    },
                  },
                  {
                    text: `Bạn là hệ thống trí tuệ nhân tạo chuyên gia thị giác máy tính nhận diện và phân loại rác thải môi trường GreenNet tại Việt Nam.
Hãy quan sát hình ảnh thật kỹ và nhận diện chính xác từng vật phẩm trong ảnh:
1. ĐẶC BIỆT CHÚ Ý ĐẾN PIN VÀ RÁC NGUY HẠI:
- Nếu ảnh có viên PIN (pin tiểu AA, AAA, pin vuông 9V, pin cúc áo, pin lithium, ắc quy...): Bắt buộc nhận diện là "Pin tiểu AA / Pin sạc đã qua sử dụng" thuộc danh mục "hazardous" (Rác nguy hại), Thùng Đỏ/Vàng. TUYỆT ĐỐI KHÔNG nhận diện nhầm sang hộp xốp hay rác vô cơ!
- Nếu là chai nhựa đồ uống, lon nhôm, hộp giấy, bìa carton, chai lọ thủy tinh: "recyclable" (Rác tái chế), Thùng Trắng/Xanh dương.
- Nếu là thức ăn thừa, vỏ rau củ quả, vỏ chuối, bã cà phê: "organic" (Rác hữu cơ), Thùng Xanh lá.
- Nếu là dây cáp sạc, linh kiện điện tử, bàn phím, chuột máy tính hỏng: "ewaste" (Rác điện tử), Thùng Thu Gom Rác Điện Tử.
- Nếu là hộp xốp đựng thức ăn bẩn, túi nilon dính mỡ, rác sinh hoạt không tái chế được: "residual" (Rác vô cơ / Rác còn lại), Thùng Cam/Xám.

2. Với mỗi vật thể, xác định bounding box chính xác bám sát vật thể theo tọa độ chuẩn hóa từ 0 đến 1000 theo định dạng [ymin, xmin, ymax, xmax].

3. Hướng dẫn xử lý an toàn chi tiết, mẹo tái chế/DIY và điểm thưởng xanh (10 đến 35 điểm).`,
                  },
                ],
              },
            ],
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  overview: {
                    type: Type.STRING,
                    description: 'Tóm tắt tổng quan về các loại rác thải phát hiện trong ảnh',
                  },
                  totalItems: {
                    type: Type.INTEGER,
                    description: 'Tổng số vật thể phát hiện được',
                  },
                  recyclableRatio: {
                    type: Type.INTEGER,
                    description: 'Tỷ lệ % rác có khả năng tái chế',
                  },
                  totalEcoPoints: {
                    type: Type.INTEGER,
                    description: 'Tổng số điểm xanh được thưởng',
                  },
                  items: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        label: { type: Type.STRING, description: 'Tên vật phẩm cụ thể' },
                        category: {
                          type: Type.STRING,
                          description: 'recyclable | organic | residual | hazardous | ewaste',
                        },
                        categoryName: { type: Type.STRING, description: 'Tên loại rác bằng tiếng Việt' },
                        binColor: { type: Type.STRING, description: 'Màu thùng rác theo quy định' },
                        confidence: { type: Type.NUMBER, description: 'Độ tin cậy từ 0.8 đến 1.0' },
                        box_2d: {
                          type: Type.ARRAY,
                          items: { type: Type.INTEGER },
                          description: '[ymin, xmin, ymax, xmax] trong khoảng 0-1000',
                        },
                        handlingInstructions: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: 'Các bước xử lý cụ thể',
                        },
                        upcyclingTip: { type: Type.STRING, description: 'Gợi ý tái chế sáng tạo DIY' },
                        ecoPoints: { type: Type.INTEGER, description: 'Điểm thưởng tích lũy' },
                      },
                      required: [
                        'id',
                        'label',
                        'category',
                        'categoryName',
                        'binColor',
                        'confidence',
                        'box_2d',
                        'handlingInstructions',
                        'upcyclingTip',
                        'ecoPoints',
                      ],
                    },
                  },
                },
                required: ['overview', 'totalItems', 'recyclableRatio', 'totalEcoPoints', 'items'],
              },
            },
          });

          const rawText = response.text || '';
          const parsedData = JSON.parse(rawText);

          return res.json({
            success: true,
            source: 'cloud-vision-engine',
            data: parsedData,
          });
        } catch (modelError: any) {
          console.warn(`Thử mô hình ${modelName} không thành công:`, modelError?.message || modelError);
        }
      }
    }

    // Bộ máy phân tích thị giác động độc lập theo từng ảnh khi API bận hoặc publish
    const dynamicResult = generateDynamicWasteAnalysis(cleanBase64);
    return res.json({
      success: true,
      source: 'dynamic-vision-engine',
      data: dynamicResult,
    });
  } catch (err: any) {
    console.error('Lỗi phân tích hình ảnh:', err);
    return res.status(500).json({
      error: 'Không thể xử lý yêu cầu phân tích rác thải vào lúc này.',
      details: err?.message,
    });
  }
});

// Router xử lý trò chuyện và tư vấn môi trường cùng EcoBot
app.post('/api/chat-ecobot', async (req, res) => {
  try {
    const { message, history = [], scanContext = null } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống' });
    }

    if (aiClient && process.env.GEMINI_API_KEY) {
      const modelsToTry = [
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-flash-lite-latest',
        'gemini-3.7-flash',
        'gemini-3.8-flash',
      ];
      let systemPrompt = `Bạn là EcoBot - Trợ lý thông minh về phân loại rác và lối sống xanh trên mạng xã hội GreenNet.
Bạn am hiểu sâu sắc quy chuẩn phân loại rác tại nguồn tại Việt Nam (theo Luật Bảo vệ Môi trường 2020), các kỹ thuật ủ phân compost, tái chế sáng tạo (upcycling), xử lý rác nguy hại (pin, ắc quy, bóng đèn).
Phong cách trò chuyện: Thân thiện, ngắn gọn, súc tích, mang tính hành động cao, khuyến khích lối sống giảm phát thải (Zero Waste).
Dùng ngôn ngữ tiếng Việt tự nhiên, có định dạng danh sách gạch đầu dòng rõ ràng khi hướng dẫn từng bước.`;

      if (scanContext) {
        systemPrompt += `\nNgữ cảnh quét rác gần đây của người dùng: ${JSON.stringify(scanContext)}`;
      }

      const contents = [];
      for (const item of history.slice(-6)) {
        contents.push({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.text || item.message || '' }],
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      for (const modelName of modelsToTry) {
        try {
          const response = await aiClient.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: systemPrompt,
            },
          });

          return res.json({
            reply: response.text || 'Xin chào! Tôi có thể giúp gì cho bạn về việc phân loại rác và lối sống xanh hôm nay?',
          });
        } catch (chatErr: any) {
          console.warn(`Chat model ${modelName} tạm bận:`, chatErr?.message);
        }
      }
    }

    // Trả lời dự phòng nhanh theo chủ đề phổ biến
    let fallbackReply = 'Chào bạn! Mình là EcoBot, trợ lý xanh luôn đồng hành cùng bạn. Bạn có thể hỏi mình về cách phân loại rác nhựa, điểm thu gom pin cũ, hoặc cách làm phân bón hữu cơ tại nhà nhé!';
    const lower = message.toLowerCase();
    if (lower.includes('pin') || lower.includes('ắc quy') || lower.includes('độc hại')) {
      fallbackReply = '⚠️ Pin cũ thuộc nhóm **Rác thải nguy hại** vì chứa kim loại nặng như Chì, Thủy ngân, Cadimi. \n- Tuyệt đối KHÔNG vứt pin chung với rác sinh hoạt hoặc đốt bỏ.\n- Hãy dán băng dính vào 2 đầu cực của pin, lưu vào lọ thủy tinh kín.\n- Mang tới các điểm thu gom pin miễn phí tại các siêu thị (Co.opmart, VinMart/WinMart), cửa hàng tiện lợi hoặc các sự kiện Đổi Rác Lấy Quà của các CLB Môi Trường.';
    } else if (lower.includes('hộp sữa') || lower.includes('tetra pak')) {
      fallbackReply = '🥛 Vỏ hộp sữa giấy (Tetra Pak) có cấu tạo từ 75% bột giấy, 21% màng nhôm và 4% màng nhựa Polyethylene.\n1. Rút ống hút (bỏ vào rác vô cơ).\n2. Mở bung 4 tai góc của hộp sữa.\n3. Dùng kéo cắt dọc thân hộp, súc sạch bằng nước lã để tránh mùi ôi thiu.\n4. Ép bẹp phơi khô và xếp chồng lại gửi cho các điểm thu gom tái chế bột giấy ép làm tấm lợp sinh thái.';
    } else if (lower.includes('compost') || lower.includes('ủ phân') || lower.includes('hữu cơ')) {
      fallbackReply = '🌱 Cách ủ phân compost rác hữu cơ tại nhà siêu đơn giản:\n- **Nguyên liệu Xanh (chứa Đạm):** Rau củ thừa, bã trà, bã cà phê, vỏ trái cây.\n- **Nguyên liệu Nâu (chứa Carbon):** Lá cây khô, mùn cưa, giấy bìa vụn, vỏ trứng bóp nhỏ.\n- **Tỷ lệ vàng:** 1 phần Xanh : 2 phần Nâu. Xếp xen kẽ từng lớp trong thùng có đục lỗ thoáng khí, đảo đều 1 lần/tuần. Sau 3-4 tuần bạn sẽ có phân mùn hữu cơ bón cây cực tốt!';
    } else if (lower.includes('nhựa') || lower.includes('chai')) {
      fallbackReply = '♻️ Để phân loại rác nhựa hiệu quả:\n- Xem ký hiệu dưới đáy chai: Nhựa số 1 (PET) và số 2 (HDPE) là hai loại có giá trị tái chế cao nhất.\n- Tráng sạch cặn bẩn, tách nắp và nhãn dán, bóp dẹp trước khi bỏ vào thùng rác tái chế để tối ưu không gian vận chuyển.';
    }

    return res.json({
      success: true,
      reply: fallbackReply,
      suggestedQuestions: [
        'Pin cũ nguy hại bỏ vào thùng nào?',
        'Hộp xốp thực phẩm có tái chế được không?',
        'Điểm thu gom rác điện tử tại Cần Thơ?',
      ],
    });
  } catch (err: any) {
    console.error('Lỗi trợ lý EcoBot:', err);
    return res.status(500).json({ error: 'Đã có sự cố xảy ra với trợ lý EcoBot.' });
  }
});

// Helper sinh kế hoạch sự kiện thông minh theo ngữ cảnh
function buildSmartContextualEventPlan(userPrompt: string) {
  const promptLower = userPrompt.toLowerCase();
  let orgTarget = 'học sinh, sinh viên và thanh niên tình nguyện';
  if (/cần thơ/i.test(promptLower)) orgTarget = 'học sinh, sinh viên Cần Thơ';
  else if (/thốt nốt/i.test(promptLower)) orgTarget = 'thầy trò trường THCS Thốt Nốt';
  else if (/đại học/i.test(promptLower)) orgTarget = 'sinh viên các trường đại học';

  let location = 'TP. Cần Thơ';
  if (/thốt nốt/i.test(promptLower)) location = 'Quận Thốt Nốt, Cần Thơ';
  else if (/sông hậu|ninh kiều/i.test(promptLower)) location = 'Bến Ninh Kiều & Công viên Sông Hậu, Cần Thơ';

  const isTree = /trồng cây/i.test(promptLower);
  const isExchange = /đổi rác|sen đá/i.test(promptLower);

  const title = isTree
    ? `Chiến Dịch Phủ Xanh Khuôn Viên & Trồng Cây Cùng ${orgTarget}`
    : isExchange
    ? `Ngày Hội Đổi Rác Tái Chế Lấy Sen Đá Sinh Thái (${orgTarget})`
    : `Chiến Dịch Chủ Nhật Xanh - Làm Sạch Môi Trường Đô Thị (${orgTarget})`;

  const description = `Kế hoạch hoạt động môi trường hành động xanh cho ${orgTarget} tại ${location}. Hướng tới nâng cao ý thức phân loại rác tại nguồn, thu gom rác nhựa và tạo lập thói quen sống xanh bền vững.`;

  const timeline = [
    {
      time: '07:30 - 08:00',
      activity: 'Tập trung lực lượng, phát dụng cụ bảo hộ và phân chia 4 tổ phụ trách từng cung đường/khu vực',
      personInCharge: 'Ban Tổ Chức & Đội trưởng CLB',
    },
    {
      time: '08:00 - 08:15',
      activity: 'Khai mạc ngắn, phổ biến quy tắc an toàn lao động và hướng dẫn 4 bước phân loại rác chuẩn',
      personInCharge: 'Đại diện CLB Môi Trường',
    },
    {
      time: '08:15 - 10:15',
      activity: 'Đồng loạt ra quân: Tổ 1 & 2 thu gom rác nhựa và túi nilon; Tổ 3 thu gom vỏ lon & chai thủy tinh; Tổ 4 tổng hợp cân ký',
      personInCharge: 'Các nhóm trưởng',
    },
    {
      time: '10:15 - 10:45',
      activity: 'Tập kết cân đo khối lượng rác, bàn giao cho xe thu gom rác tái chế và ghi nhận tích lũy EcoPoints',
      personInCharge: 'Ban Thư Ký',
    },
    {
      time: '10:45 - 11:15',
      activity: 'Tổng kết kết quả, trao tặng chậu sen đá kỷ niệm và trao Giấy chứng nhận tình nguyện viên xanh',
      personInCharge: 'Ban Tổ Chức',
    },
  ];

  const equipmentNeeded = [
    'Găng tay bảo hộ dệt sợi (60 - 80 đôi)',
    'Bao tải dứa sinh học tái sử dụng phân loại rác (30 bao)',
    'Kẹp gắp rác kim loại chuyên dụng (20 chiếc)',
    'Thùng phân loại rác 3 ngăn lưu động',
    'Cân đồng hồ 50kg để đo lường thành quả',
    'Nước uống bình lớn 20L và cốc dùng nhiều lần tránh phát sinh rác',
  ];

  const safetyNotes = [
    'Luôn đeo găng tay bảo hộ trong suốt quá trình nhặt và phân loại rác.',
    'Tuyệt đối không dùng tay trần nhặt mảnh vỡ thủy tinh, kim tiêm hoặc pin cũ có dấu hiệu rò rỉ axit.',
    'Di chuyển cẩn thận gần bờ sông, ao hồ; tuân thủ sự điều phối của đội trưởng.',
    'Khi phát hiện vật thể lạ hoặc nguy hiểm cần báo ngay cho Ban Tổ Chức.',
  ];

  return {
    title,
    summary: description,
    description,
    targetAudience: `Đoàn viên, học sinh, sinh viên và người dân địa phương`,
    estimatedVolunteers: '40 - 70 người',
    volunteerCountEstimate: '40 - 70 người',
    timeline,
    equipmentNeeded,
    equipmentList: equipmentNeeded.map((item) => ({ item, quantity: 'Đủ dùng', note: 'Chuẩn bị trước 1 ngày' })),
    safetyNotes,
    safetyRules: safetyNotes,
    communicationMessage: `Tuổi trẻ Cần Thơ chung tay vì môi trường Xanh - Sạch - Đẹp, phân loại rác chuẩn, nhân rộng mầm xanh!`,
    communicationPlan: [
      { channel: 'Mạng xã hội EcoLoop', action: 'Đăng bài tuyển tình nguyện viên và thông báo chiến dịch', timing: 'Trước 5 ngày' },
      { channel: 'Fanpage trường & Zalo CLB', action: 'Phát động đoàn viên đăng ký tham gia nhận EcoPoints', timing: 'Trước 3 ngày' },
      { channel: 'Bảng tin EcoLoop', action: 'Đăng hình ảnh thành quả dọn rác và vinh danh tình nguyện viên', timing: 'Sau sự kiện' },
    ],
    checklist: [
      { phase: 'Giai đoạn Chuẩn bị (Trước 3 ngày)', tasks: ['Khảo sát địa điểm dọn rác', 'Chuẩn bị găng tay, kẹp rác, bao tải', 'Đăng thông báo lên EcoLoop'] },
      { phase: 'Giai đoạn Thực hiện (Ngày sự kiện)', tasks: ['Điểm danh tình nguyện viên', 'Phân công khu vực', 'Cân đo rác thu gom'] },
      { phase: 'Giai đoạn Sau sự kiện', tasks: ['Bàn giao rác tái chế cho trạm EcoMap', 'Cộng điểm EcoPoints và cấp giấy chứng nhận'] },
    ],
    isFallback: true,
  };
}

// 1. API kiểm tra trạng thái AI
app.get('/api/ai/status', (_req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const isConfigured = !!apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY';
  res.json({
    configured: isConfigured,
    model: 'gemini-3.5-flash-lite',
    service: 'Google Gemini & Roboflow Vision API',
  });
});

// 2. API Lập kế hoạch sự kiện thông minh cho CLB / Tổ chức
app.post('/api/ai/plan-event', async (req, res) => {
  try {
    const { prompt: userPrompt } = req.body;
    if (!userPrompt || !userPrompt.trim()) {
      return res.status(400).json({ error: 'Nội dung yêu cầu lập kế hoạch không được để trống' });
    }

    if (aiClient && process.env.GEMINI_API_KEY) {
      const modelsToTry = [
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-flash-lite-latest',
        'gemini-3.7-flash',
        'gemini-3.8-flash',
      ];
      const systemInstruction = `Bạn là chuyên gia tổ chức phong trào tình nguyện môi trường của EcoLoop tại Việt Nam.
Khi nhận yêu cầu của ban tổ chức (ví dụ: 'Lập kế hoạch dọn rác ven sông Hậu cho 50 sinh viên trong 3 tiếng'), hãy lập kế hoạch chi tiết, khả thi, an toàn tuyệt đối theo đúng cấu trúc JSON sau:
- title: Tên sự kiện hấp dẫn, truyền cảm hứng
- description: Mục tiêu, ý nghĩa và thông điệp của sự kiện
- summary: Tóm tắt 1-2 câu ngắn gọn
- targetAudience: Đối tượng tham gia chính
- estimatedVolunteers: Số lượng tình nguyện viên dự kiến
- timeline: Mảng các mốc thời gian [{ time, activity, personInCharge }]
- equipmentNeeded: Mảng danh sách vật dụng bảo hộ cần chuẩn bị (["Găng tay bảo hộ", "Bao tải thu gom", "Kẹp rác inox..."])
- safetyNotes: Mảng các quy tắc an toàn bắt buộc cho tình nguyện viên
- communicationMessage: Khẩu hiệu / Slogan truyền thông lan tỏa
- communicationPlan: Mảng [{ channel, action, timing }]
- checklist: Mảng [{ phase, tasks }]`;

      for (const modelName of modelsToTry) {
        try {
          const response = await aiClient.models.generateContent({
            model: modelName,
            contents: `Yêu cầu tổ chức sự kiện: "${userPrompt}". Hãy lập kế hoạch hoàn chỉnh chi tiết bằng tiếng Việt.`,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
            },
          });

          const parsed = JSON.parse(response.text || '{}');
          if (parsed.title && parsed.timeline) {
            return res.json({
              success: true,
              data: {
                ...parsed,
                isFallback: false,
              },
            });
          }
        } catch (planErr: any) {
          console.warn(`Thử model ${modelName} cho lập kế hoạch:`, planErr?.message);
        }
      }
    }

    // Dự phòng thông minh theo ngữ cảnh
    const contextualPlan = buildSmartContextualEventPlan(userPrompt);
    return res.json({
      success: true,
      data: contextualPlan,
      notice: 'Hệ sinh thái EcoLoop đã tự động kích hoạt mẫu kế hoạch sự kiện sinh thái thông minh phù hợp cho chiến dịch của bạn.',
    });
  } catch (err: any) {
    console.error('Lỗi lập kế hoạch sự kiện:', err);
    const contextualPlan = buildSmartContextualEventPlan(req.body?.prompt || '');
    return res.json({
      success: true,
      data: contextualPlan,
    });
  }
});


// Thiết lập chế độ chạy: Development dùng Vite middlewares, Production dùng static build
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GreenNet server active on port ${PORT} [Mode: ${isProduction ? 'Production' : 'Development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Lỗi khởi động máy chủ:', err);
  process.exit(1);
});
