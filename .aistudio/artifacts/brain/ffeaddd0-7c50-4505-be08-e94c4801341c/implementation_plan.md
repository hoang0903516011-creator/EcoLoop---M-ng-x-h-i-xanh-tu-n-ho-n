# Kế hoạch Nâng Cấp Hệ Sinh Thái EcoLoop - Mạng Xã Hội Tuần Hoàn Xanh

Tái cấu trúc và nâng cấp toàn diện giao diện cùng các tính năng của nền tảng **EcoLoop - Mạng xã hội tuần hoàn xanh** theo nguyên mẫu thiết kế người dùng cung cấp (EcoMap, Mạng xã hội chia sẻ & ve chai, Sự kiện môi trường, Minigame & Thử thách 7 ngày, Đổi thưởng EcoRewards, Thư viện kiến thức, Dashboard CLB và Quản trị Admin), đồng thời **giữ nguyên vẹn 100% module EcoBot nhận diện thị giác máy tính với mô hình Roboflow SAM 3 (`vo-duy-hoang / general-segmentation-api-2`) và Bounding Box động** vừa hoàn thiện.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Các quyết định đã được người dùng xác nhận:**
> 1. **Thương hiệu & Tên gọi**: `EcoLoop - Mạng xã hội tuần hoàn xanh` (slogan: *"Đổi xanh - Sống xanh - Tương lai xanh"*).
> 2. **Cơ chế kiểm duyệt bài viết**: Bài viết của người dùng đăng lên sẽ hiển thị ngay lập tức trên bảng tin; Quản trị viên (Admin) có công cụ kiểm duyệt để xóa/gỡ bỏ các bài vi phạm tại trang Admin Dashboard.
> 3. **Tập dữ liệu điểm thu gom EcoMap**: Mặc định định vị và hiển thị các điểm thu gom rác tái chế, trạm thu hồi pin cũ và trạm đổi quà tại TP. Cần Thơ & Đồng bằng sông Cửu Long (Trường THCS Thốt Nốt, Đại học Cần Thơ, Bến Ninh Kiều, Đại học Y Dược Cần Thơ...).
> 4. **Bảo tồn nguyên vẹn module EcoBot**: Giữ nguyên toàn bộ logic quét rác Roboflow Workflow (`vo-duy-hoang / general-segmentation-api-2`), bounding box chuẩn hóa 0-1000, phân loại rác nguy hại/pin tiểu AA, rác tái chế, vô cơ, hữu cơ và trợ lý EcoBot AI trên backend `/api/scan-waste` và `/api/chat-ecobot`.

---

## 1. Tổng Quan & Kiến Trúc Hệ Sinh Thái

EcoLoop là nền tảng mạng xã hội tuần hoàn kết nối học sinh, sinh viên, người dân và các câu lạc bộ môi trường:
- **Người dùng cá nhân & Sinh viên**: Quét phân loại rác bằng EcoBot AI nhận EcoPoints, chia sẻ đồ cũ/ve chai, đăng ký tham gia chiến dịch tình nguyện nhận Giấy chứng nhận xanh, chơi minigame, đổi quà (sen đá, bình giữ nhiệt, voucher).
- **Tổ chức / CLB Môi Trường**: Đăng ký sự kiện dọn rác, điểm danh tình nguyện viên nhận điểm, sử dụng **AI Event Planner** để tự động lên kế hoạch chi tiết (timeline, dụng cụ, an toàn).
- **Ban Quản Trị Hệ Thống (Admin)**: Quản lý và xác thực trạm thu gom EcoMap, kiểm duyệt bài viết cộng đồng, điều phối kho quà thưởng EcoRewards.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             EcoLoop Header Navigation                            │
│  Logo EcoLoop · Top Slogan · Search Bar · Role Switcher (User/Club/Admin) · Wallet│
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │ Active Tab
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    Trang Chủ     │  │   EcoMap (Bản đồ)│  │   Mạng Xã Hội    │  │ Sự Kiện Xanh     │
│ - Hero & 4 Gateway│  │ - Leaflet Map    │  │ - Bảng tin bài   │  │ - Danh sách SK   │
│ - Thống kê KPI   │  │ - Lọc loại rác   │  │ - Cho tặng/ve chai│  │ - Đăng ký / Điểm  │
│ - Sự kiện nổi bật│  │ - GPS vị trí     │  │ - Tim xanh / Cmt  │  │   danh nhận pts   │
│ - Điểm gom gần   │  │ - Thêm điểm mới  │  │ - Chat trao đổi   │  │ - Chứng nhận xanh│
└──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘
        │                                                                 │
        ▼                                                                 ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  EcoBot AI Scan  │  │   Minigame Play  │  │ Thư Viện Cẩm Nang│  │ Đổi Quà Rewards  │
│ [GIỮ NGUYÊN VẸN] │  │ - Phân loại rác  │  │ - Cẩm nang phân  │  │ - Danh mục quà   │
│ - Roboflow SAM 3 │  │   4 thùng        │  │   loại tại nguồn │  │ - Đổi bằng pts   │
│ - Bounding Box   │  │ - Eco Quiz       │  │ - Luật BVMT      │  │ - Mã QR nhận quà │
│ - Gemini Vision  │  │ - Thử thách 7 ngày│  │ - Đọc nhận +5 pts│  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘
        │                                                                 │
        ▼                                                                 ▼
┌────────────────────────────────────────┐ ┌───────────────────────────────────────┐
│     Dashboard CLB (Tổ chức)            │ │      Dashboard Admin (Quản trị)       │
│ - Quản lý tình nguyện viên             │ │ - Kiểm duyệt & xóa bài viết vi phạm   │
│ - AI Event Planner (Lên lịch sự kiện)  │ │ - Xác thực trạm thu gom rác           │
│ - Điểm danh cấp tốc                    │ │ - Quản lý kho quà tặng EcoRewards     │
└────────────────────────────────────────┘ └───────────────────────────────────────┘
```

---

## 2. Trải Nghiệm Người Dùng & Thiết Kế Giao Diện

- **Chủ đề thị giác**: Xanh ngọc lục bảo (`emerald-700`, `teal-800`), màu nền xám sáng thanh lịch (`#F8FAF9`), điểm nhấn vàng ấm (`amber-500`) cho EcoPoints.
- **Tuân thủ quy chuẩn Typography & Layout**:
  - Font chữ: `Plus Jakarta Sans` hình khối hiện đại, nét chữ sắc nét.
  - Số liệu hiển thị dạng Tabular Numerals (`font-mono tabular-nums`).
  - Hộp điều khiển đơn dòng, nhãn phân loại tinh gọn, không nhồi nhét pill tags trang trí thừa thãi.
  - Tối ưu phản hồi tương tác $\le 200\text{ms}$ với các hiệu ứng chuyển tab mượt mà.
- **Các Module chính**:
  1. **Trang Chủ (`HomeModule`)**:
     - Hero banner với 4 nút tắt dẫn lối nhanh tới 4 trụ cột chính.
     - Thanh số liệu tác động xanh (Người dùng, Điểm gom rác, Sự kiện, Kg rác tái chế, EcoPoints).
     - Khối sự kiện sắp diễn ra, khối điểm thu gom lân cận Cần Thơ, tin nổi bật cộng đồng và thẻ minigame ngày.
  2. **EcoMap (`EcoMapModule`)**:
     - Bản đồ tương tác Leaflet với các Marker biểu tượng rác thải tương ứng (Pin đỏ, Tái chế xanh lá, Trạm đổi quà vàng).
     - Định vị GPS người dùng, tìm kiếm theo tên/địa chỉ, thanh lọc theo loại rác (`Pin`, `Nhựa`, `Giấy`, `Kim loại`, `Quần áo`, `Đồ gia dụng cũ`, `Rác hữu cơ`).
     - Bảng chi tiết trạm thu gom và chức năng thêm trạm thu gom mới (+50 pts).
  3. **Mạng Xã Hội (`SocialFeedModule`)**:
     - Đăng bài tức thì với các chủ đề: *Chia sẻ lối sống xanh, Cho tặng đồ cũ, Trao đổi ve chai, Tìm người tham gia sự kiện*.
     - Tương tác cảm xúc: *Tim xanh, Cảm ơn, Truyền cảm hứng*.
     - Bình luận, lưu bài viết, liên hệ nhắn tin trực tiếp với tác giả bài đăng.
  4. **Sự Kiện Môi Trường (`EventsModule`)**:
     - Danh sách chiến dịch: Làm sạch bờ sông Hậu, Đổi rác lấy sen đá THCS Thốt Nốt, Workshop Eco-brick, Trồng cây sinh thái.
     - Đăng ký tham gia, quét mã điểm danh nhận điểm thưởng, cấp Giấy chứng nhận tình nguyện viên điện tử có mã số xác thực.
  5. **EcoBot Scanner (`EcoBotModule`) - GIỮ NGUYÊN**:
     - Tích hợp nguyên vẹn `EcoScannerView`, BoundingBoxCanvas, hệ thống nhận diện chuyên sâu Roboflow SAM 3 Workflow `vo-duy-hoang / general-segmentation-api-2` và Gemini Vision.
     - Nhận diện pin tiểu AA/Lithium là Rác nguy hại độc hại (Thùng Đỏ/Vàng), lon nhôm, chai nhựa, giấy tái chế và tính toán Bounding Box chuẩn xác theo từng ảnh thật.
  6. **Minigame & Thử Thách (`MinigamesModule`)**:
     - Game kéo thả/phân loại rác vào đúng 4 thùng (Hữu cơ, Tái chế, Nguy hại, Vô cơ) tính điểm streak.
     - Eco Quiz trắc nghiệm kiến thức môi trường (Luật BVMT 2020, hạt vi nhựa, pin cũ).
     - Thử thách xanh 7 ngày (Mang bình giữ nhiệt, phân loại rác tại phòng trọ, không dùng túi nilon).
  7. **Đổi Quà (`RewardsModule`)**:
     - Đổi EcoPoints lấy sen đá mini lọc không khí, bình giữ nhiệt inox 304 EcoLoop, túi canvas, voucher cà phê xanh, vé xe buýt điện VinBus.
     - Modal hiển thị mã vạch / QR Code đổi quà xác thực.
  8. **Trang Cá Nhân (`ProfileModule`)**:
     - Cấp độ sống xanh: *Level 1 (Green Starter) $\rightarrow$ Level 5 (Planet Guardian)* với thanh tiến trình.
     - Bộ sưu tập Huy hiệu xanh (Bậc thầy phân loại, Chiến binh xanh, Tình nguyện viên tiêu biểu).
     - Cập nhật thông tin cá nhân và trường học/tổ chức.
  9. **Dashboard Tổ Chức / CLB (`OrgDashboardModule`)**:
     - Quản lý các chiến dịch do CLB phát động, duyệt điểm danh nhanh cho tình nguyện viên.
     - **AI Event Planner**: Gọi Google Gemini để tự động lập kế hoạch sự kiện môi trường (khung timeline, danh mục dụng cụ bảo hộ, quy tắc an toàn, thông điệp truyền thông).
  10. **Dashboard Quản Trị Viên (`AdminDashboardModule`)**:
      - Bảng điều khiển kiểm duyệt: Xem toàn bộ bài viết trên mạng xã hội và có nút **Xóa bài viết vi phạm**.
      - Quản lý, xác thực các trạm thu gom rác trên EcoMap.
      - Quản lý số lượng quà tặng trong kho EcoRewards.
  11. **Modals & Drawers Toàn Ứng Dụng**:
      - `WalletModal`: Xem số dư EcoPoints, lịch sử thu chi điểm xanh, Bảng xếp hạng Cá nhân / Trường học / CLB.
      - `NotificationModal`: Xem thông báo điểm thưởng, sự kiện sắp diễn ra.
      - `AuthModal`: Chuyển đổi nhanh vai trò tài khoản (Cá nhân, CLB, Admin) hoặc đăng ký tài khoản mới.
      - `ChatDrawer`: Nhắn tin riêng giữa các thành viên để hẹn gặp trao đổi đồ cũ và ve chai tái chế.

---

## 3. Kiến Trúc Kỹ Thuật & Quản Lý Dữ Liệu

- **State Management & Persistence**:
  - `storageService.ts`: Lưu trữ reactive trên LocalStorage với pub/sub listener, tự động đồng bộ tức thì giữa các module khi người dùng đăng bài, đổi điểm, check-in sự kiện, hoặc chuyển đổi vai trò.
  - Hạt giống dữ liệu ban đầu (`seedData.ts`): Cung cấp các trạm thu gom thực tế tại TP. Cần Thơ (Thốt Nốt, Ninh Kiều, Bình Thủy, Cái Răng), bài đăng mẫu, sự kiện môi trường, câu hỏi quiz và quà tặng.
- **Server API Handlers (`server.ts`)**:
  - `POST /api/scan-waste`: Chạy mô hình Roboflow Workflow `vo-duy-hoang / general-segmentation-api-2` với fallback Gemini Vision chuyên sâu (giữ nguyên không sửa đổi).
  - `POST /api/chat-ecobot`: Trợ lý EcoBot tư vấn lối sống xanh (giữ nguyên).
  - `POST /api/ai/plan-event`: Lập kế hoạch sự kiện thông minh cho CLB bằng Gemini AI.
  - `GET /api/ai/status`: Kiểm tra trạng thái AI.

---

## 4. Kế Hoạch Triển Khai Chi Tiết

1. **Bước 1**: Cập nhật `package.json` và cài đặt các phụ thuộc cần thiết (đặc biệt là thư viện bản đồ `leaflet` và `@types/leaflet` nếu chưa có).
2. **Bước 2**: Đồng bộ hệ thống kiểu dữ liệu (`src/types/index.ts`) hỗ trợ đầy đủ các thực thể: `UserProfile`, `RecyclingPoint`, `Post`, `GreenEvent`, `EcoReward`, `PointTransaction`, `AppNotification`, `ChatMessage`, `MinigameItem`.
3. **Bước 3**: Cập nhật bộ dữ liệu mẫu (`src/data/seedData.ts`) tập trung tại TP. Cần Thơ và Đồng bằng sông Cửu Long cùng kho tài liệu phân loại rác.
4. **Bước 4**: Cập nhật `storageService.ts` để quản lý bền vững các hành động của người dùng (tạo bài viết, xóa bài của admin, đăng ký sự kiện, đổi quà, tích lũy điểm xanh).
5. **Bước 5**: Hoàn thiện các components dùng chung: `Header.tsx` (có chuyển đổi vai trò, ví điểm, thông báo), `BottomNav.tsx`, `WalletModal.tsx`, `NotificationModal.tsx`, `AuthModal.tsx`, `ChatDrawer.tsx`.
6. **Bước 6**: Xây dựng các module chức năng:
   - `HomeModule.tsx`
   - `EcoMapModule.tsx` (bản đồ Leaflet)
   - `SocialFeedModule.tsx` (bảng tin bài viết đăng ngay)
   - `EventsModule.tsx` (sự kiện & giấy chứng nhận)
   - `EcoBotModule.tsx` (tích hợp trọn vẹn bộ quét Roboflow SAM 3 và BoundingBoxCanvas hiện tại)
   - `LibraryModule.tsx` (thư viện cẩm nang)
   - `MinigamesModule.tsx` (minigame phân loại, quiz, 7-day challenge)
   - `RewardsModule.tsx` (kho quà tặng EcoRewards)
   - `ProfileModule.tsx` (hồ sơ & huy hiệu)
   - `OrgDashboardModule.tsx` (quản trị CLB & AI Event Planner)
   - `AdminDashboardModule.tsx` (quản trị hệ thống & duyệt/xóa bài viết)
7. **Bước 7**: Cập nhật `server.ts` tích hợp endpoint `plan-event` bổ sung trong khi bảo toàn các endpoint `scan-waste` và `chat-ecobot`.
8. **Bước 8**: Kiểm tra biên dịch `compile_applet` và `lint_applet`, chạy thử nghiệm dev server.
