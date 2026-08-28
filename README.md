# NSG SUPPORT - CỔNG PHẢN ÁNH & HỖ TRỢ KỸ THUẬT – QUẢN LÝ CÔNG VIỆC NỘI BỘ

> **Hệ thống Web Application & PWA hoàn chỉnh, Production-Ready** dành cho các trường Đại học, Cao đẳng, Trung cấp và Cơ sở giáo dục đào tạo.
> Tích hợp trọn vẹn: **Frontend PWA + Backend Node.js/Express + Firebase Firestore Realtime + Telegram Bot API + Kiến trúc mở Zalo OA + Quản lý Deadline/SLA + Xuất Báo Cáo Excel**.

---

## MỤC LỤC
1. [Giới thiệu tổng quan](#1-giới-thiệu-tổng-quan)
2. [Tính năng nổi bật](#2-tính-năng-nổi-bật)
3. [Kiến trúc hệ thống](#3-kiến-trúc-hệ-thống)
4. [Cấu trúc thư mục Source Code](#4-cấu-trúc-thư-mục-source-code)
5. [Yêu cầu môi trường & Cài đặt Node.js](#5-yêu-cầu-môi-trường--cài-đặt-nodejs)
6. [Cài đặt Package dependencies](#6-cài-đặt-package-dependencies)
7. [Khởi tạo Firebase Project & Cấu hình dịch vụ](#7-khởi-tạo-firebase-project--cấu-hình-dịch-vụ)
   - [7.1 Cấu hình Firestore Database](#71-cấu-hình-firestore-database)
   - [7.2 Cấu hình Firebase Authentication](#72-cấu-hình-firebase-authentication)
   - [7.3 Cấu hình Firebase Storage](#73-cấu-hình-firebase-storage)
   - [7.4 Tải Service Account Key cho Backend](#74-tải-service-account-key-cho-backend)
8. [Cấu hình biến môi trường (.env)](#8-cấu-hình-biến-môi-trường-env)
9. [Cấu hình Telegram Bot nhận thông báo tức thì](#9-cấu-hình-telegram-bot-nhận-thông-báo-tức-thì)
10. [Kiến trúc mở rộng Zalo Official Account (OA)](#10-kiến-trúc-mở-rộng-zalo-official-account-oa)
11. [Khởi chạy Local Development (Chạy thử ngay)](#11-khởi-chạy-local-development-chạy-thử-ngay)
12. [Kịch bản Seed Data mẫu (Demo Accounts & Tickets)](#12-kịch-bản-seed-data-mẫu-demo-accounts--tickets)
13. [Quy trình Triển khai Production (Deploy)](#13-quy-trình-triển-khai-production-deploy)
    - [13.1 Deploy Frontend lên Firebase Hosting / Vercel](#131-deploy-frontend-lên-firebase-hosting--vercel)
    - [13.2 Deploy Backend lên Cloud Run / Render / VPS](#132-deploy-backend-lên-cloud-run--render--vps)
14. [Tạo tài khoản Quản trị viên đầu tiên](#14-tạo-tài-khoản-quản-trị-viên-đầu-tiên)
15. [Firebase Security Rules & Indexes](#15-firebase-security-rules--indexes)
16. [Troubleshooting & Câu hỏi thường gặp](#16-troubleshooting--câu-hỏi-thường-gặp)

---

## 1. GIỚI THIỆU TỔNG QUAN

**NSG SUPPORT** là giải pháp số hóa toàn diện quy trình tiếp nhận sự cố kỹ thuật (máy chiếu giảng đường, hệ thống mạng internet, máy tính phòng lab, âm thanh hội trường, điện, nước, phần mềm giảng dạy...) và điều phối công việc kỹ thuật nội bộ trong nhà trường.

Hệ thống giải quyết triệt để các tồn tại của quy trình thủ công:
- **Người gửi (Cán bộ, Giảng viên, Sinh viên):** Gửi phản ánh nhanh chóng trên điện thoại hoặc máy tính, có mã phiếu tự tăng (`PYC-2026-xxxxxx`), tra cứu tiến độ 5 bước minh bạch, đánh giá 5 sao sau khi hoàn thành.
- **Trưởng phòng Kỹ thuật / Quản trị:** Dashboard realtime hiển thị trực quan các thẻ số liệu, 8 biểu đồ phân tích, cảnh báo popup ngay khi đăng nhập nếu có việc khẩn cấp, phân công 1-click cho kỹ thuật viên và chủ động giao việc nội bộ mới (`TASK-2026-xxxxxx`).
- **Kỹ thuật viên hiện trường:** Giao diện tối ưu di động, nhận việc, cập nhật tiến độ, chụp ảnh hiện trường TRƯỚC và SAU khi xử lý trực tiếp từ camera điện thoại, gửi yêu cầu nghiệm thu.
- **Thông báo đa kênh tự động:** Realtime In-app (Web Audio âm thanh chuông) + Telegram Bot Server-side + Sẵn sàng tích hợp Zalo OA ZNS.

---

## 2. TÍNH NĂNG NỔI BẬT

1. **Sinh mã tự động phân biệt rõ ràng:**
   - Phiếu phản ánh từ người dùng: `PYC-YYYY-000001` (ví dụ: `PYC-2026-000001`).
   - Nhiệm vụ nội bộ do lãnh đạo giao: `TASK-YYYY-000001` (ví dụ: `TASK-2026-000001`).
2. **Quy trình Workflow 5 bước chuẩn hóa:**
   `MỚI` $\rightarrow$ `CHỜ PHÂN CÔNG` $\rightarrow$ `ĐÃ PHÂN CÔNG` $\rightarrow$ `ĐANG XỬ LÝ` $\rightarrow$ `CHỜ NGHIỆM THU` $\rightarrow$ `HOÀN THÀNH` (kèm trạng thái bổ sung `QUÁ HẠN`, `TẠM DỪNG`, `HỦY`).
3. **Cơ chế Realtime Tuyệt đối:**
   - Sử dụng **Firebase Firestore `onSnapshot` Listener** (Tuyệt đối không dùng `setInterval` polling).
   - Khi có phản ánh mới, danh sách tự cập nhật và phát chuông cảnh báo ngay lập tức mà **không cần bấm F5**.
4. **Quản lý Deadline & SLA tự động:**
   - Khẩn cấp (SLA 2h) - Cao (SLA 8h) - Trung bình (SLA 24h) - Bình thường (SLA 48h).
   - Background cron quét mỗi 5 phút tự động gắn cờ `isOverdue: true` và bắn cảnh báo Telegram khi quá hạn mà không làm mất trạng thái đang xử lý (`ĐANG XỬ LÝ + QUÁ HẠN`).
5. **Nghiệm thu chuyên nghiệp:**
   - Trưởng phòng có thể **Duyệt hoàn thành** hoặc **Yêu cầu xử lý lại** (bắt buộc nhập rõ lý do để KTV khắc phục).
6. **Đánh giá chất lượng dịch vụ (CSAT):**
   - Người gửi đánh giá 1 - 5 sao và gửi góp ý sau khi phiếu hoàn thành.
7. **Trao đổi trực tiếp (Realtime Comments):**
   - Hộp thảo luận kỹ thuật trực tiếp trên từng phiếu giữa Trưởng phòng và KTV.
8. **Nhật ký thao tác (Audit Trail bất biến):**
   - Tự động ghi lại Ai tạo, Ai phân công, Ai nhận việc, Ai cập nhật ảnh, Ai duyệt hoàn thành (không ai có quyền sửa/xóa log).
9. **Chống Spam & Bảo mật dữ liệu:**
   - Rate limiting (tối đa 15 request/15 phút trên mỗi IP).
   - Honeypot bot trap ẩn.
   - Nén ảnh bằng Canvas HTML5 trực tiếp trên trình duyệt trước khi upload (giúp ảnh chụp camera 10MB giảm xuống <1MB tải siêu nhanh).
   - Chặn tuyệt đối các file thực thi nguy hiểm (`.exe`, `.bat`, `.sh`, `.php`, `.js`...).
10. **Hỗ trợ PWA Cài đặt Offline:**
    - Cài đặt như ứng dụng native trên Android, iPhone, iPad, Windows Desktop qua nút **Cài App**.

---

## 3. KIẾN TRÚC HỆ THỐNG

```text
┌──────────────────────────────────────────────────────────────────┐
│                   CLIENT (Web Browser / PWA)                     │
│  - Single Page Application (Modern ES6+ Modular Components)      │
│  - Tailwind CSS + Custom Education Tech Design System            │
│  - Firebase Client SDK (Firestore onSnapshot Realtime Listeners) │
│  - Chart.js 8 Biểu đồ + SheetJS (XLSX) Export + Web Audio Sound  │
└───────────────▲──────────────────────────────────▲───────────────┘
                │ REST API                         │ Realtime Sync
                ▼                                  ▼
┌───────────────────────────────┐  ┌───────────────────────────────┐
│     BACKEND EXPRESS API       │  │      FIREBASE FIRESTORE       │
│  - Token Verification (JWT)   │  │  - Collection: reports        │
│  - Rate Limiter & Honeypot    │  │  - Collection: tasks          │
│  - Multer Safe File Upload    │  │  - Collection: users          │
│  - Atomic Code Auto-increment │  │  - Collection: comments       │
│  - Cron Deadline Scheduler    │  │  - Collection: activity_logs  │
└───────────────┬───────────────┘  │  - Collection: notifications  │
                │                  │  - Security Rules (RBAC)      │
                ▼                  └───────────────────────────────┘
┌───────────────────────────────┐
│     NOTIFICATION SERVICES     │
│  - TelegramBotProvider        │ ===> Telegram Group / Chat
│  - ZaloOAProvider (Ready)     │ ===> Zalo ZNS / OA Message
└───────────────────────────────┘
```

---

## 4. CẤU TRÚC THƯ MỤC SOURCE CODE

```text
nsg-support/
├── backend/
│   ├── config/
│   │   └── firebaseAdmin.js          # Kết nối Firebase Admin SDK an toàn
│   ├── controllers/
│   │   ├── reportController.js       # Xử lý báo cáo phản ánh & đánh giá 5 sao
│   │   ├── taskController.js         # Phân công, tiến độ, nghiệm thu, comment
│   │   └── statsController.js        # Thống kê 8 biểu đồ & xuất Excel/CSV
│   ├── middleware/
│   │   ├── authMiddleware.js         # Xác thực JWT & phân quyền RBAC
│   │   ├── rateLimiter.js            # Chống gửi form spam & honeypot bot trap
│   │   └── uploadMiddleware.js       # Multer lọc file MIME an toàn
│   ├── services/
│   │   ├── notificationService.js    # Điều phối thông báo đa kênh thống nhất
│   │   ├── telegramService.js        # Telegram Bot API tích hợp HTML template
│   │   ├── zaloProvider.js           # Kiến trúc mở kết nối Zalo OA
│   │   └── deadlineScheduler.js      # Cron job quét hạn chót mỗi 5 phút
│   ├── routes/
│   │   └── api.js                    # Khai báo toàn bộ API endpoints
│   └── server.js                     # Express server, CORS, Static uploads
│
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css             # Theme màu Giáo dục - Công nghệ hiện đại
│   │   ├── js/
│   │   │   ├── config.js             # Cấu hình Client, danh mục và Firebase
│   │   │   ├── sound.js              # Web Audio phát âm thanh thông báo
│   │   │   ├── utils.js              # Định dạng ngày, nén ảnh, toast, modal
│   │   │   ├── auth.js               # Quản lý phiên và phân quyền RBAC
│   │   │   ├── api.js                # Wrapper gọi Backend Express API
│   │   │   └── realtime.js           # Firestore Realtime onSnapshot Engine
│   │   └── icons/
│   │       ├── icon-192.png          # App Icon PWA 192x192
│   │       └── icon-512.png          # App Icon PWA 512x512
│   ├── components/
│   │   ├── navbar.js                 # Header trên cùng kèm chuông thông báo
│   │   ├── sidebar.js                # Sidebar quản trị đầy đủ phân mục (mục 39)
│   │   ├── taskCard.js               # Card hiển thị công việc & phản ánh
│   │   ├── taskModal.js              # Modal chi tiết, timeline 5 bước, nghiệm thu
│   │   └── notificationDrawer.js     # Drawer thông báo realtime trượt từ phải
│   ├── pages/
│   │   ├── home.js                   # Trang chủ: 4 nút lớn, hotline khẩn cấp
│   │   ├── reportForm.js             # Form gửi phản ánh có upload và mã PYC-
│   │   ├── tracking.js               # Tra cứu tiến độ theo mã & đánh giá 5 sao
│   │   ├── login.js                  # Đăng nhập kèm 1-click Demo Switcher
│   │   ├── dashboard.js              # Bảng điều hành: card số liệu, 8 biểu đồ
│   │   ├── pendingTasks.js           # Chuyên trang "Công việc chờ phân công"
│   │   ├── tasks.js                  # Danh sách công việc realtime & bộ lọc
│   │   ├── createTask.js             # Trưởng phòng chủ động giao việc mới
│   │   ├── staffDashboard.js         # Bảng việc hiện trường dành cho KTV
│   │   ├── reportsExport.js          # Xuất báo cáo Excel, CSV và In ấn
│   │   ├── userManagement.js         # Quản lý nhân sự & phân quyền vai trò
│   │   └── settings.js               # Cài đặt SLA, Telegram Bot, Zalo OA
│   ├── index.html                    # Single Page Application container
│   ├── manifest.json                 # Cấu hình PWA Web App Manifest
│   └── service-worker.js             # Service Worker cache offline
│
├── firebase/
│   ├── firestore.rules               # Security Rules bảo vệ collection & role
│   ├── firestore.indexes.json        # Compound indexes tối ưu truy vấn Firestore
│   └── firebase.json                 # Cấu hình Firebase Hosting & Emulators
│
├── scripts/
│   └── seedData.js                   # Script khởi tạo tài khoản & phiếu mẫu
│
├── .env.example                      # File mẫu biến môi trường
├── package.json                      # Quản lý dependencies và scripts chạy
├── .gitignore                        # Danh sách file loại trừ khỏi Git
└── README.md                         # Tài liệu hướng dẫn sử dụng & triển khai
```

---

## 5. YÊU CẦU MÔI TRƯỜNG & CÀI ĐẶT NODE.JS

Hệ thống yêu cầu:
- **Node.js**: Phiên bản `>= 18.x` hoặc `>= 20.x LTS`
- **npm**: Phiên bản `>= 9.x`
- Trình duyệt hiện đại: Chrome, Edge, Safari, Firefox, Opera (hỗ trợ ES6 và Service Worker).

*Nếu máy tính của bạn chưa có Node.js, bạn có thể tải bản cài đặt trực tiếp tại trang chủ chính thức: [https://nodejs.org](https://nodejs.org).*

---

## 6. CÀI ĐẶT PACKAGE DEPENDENCIES

Tại thư mục gốc của dự án, mở Terminal (hoặc PowerShell / Command Prompt) và chạy lệnh:

```bash
npm install
```

Lệnh này sẽ tự động cài đặt tất cả các thư viện cần thiết:
- `express`: Framework backend API server
- `firebase-admin`: SDK kết nối dịch vụ Firebase với quyền Admin
- `multer`: Xử lý upload tệp và hình ảnh an toàn
- `node-cron`: Chạy ngầm kịch bản kiểm tra hạn chót (Deadline Scanner)
- `xlsx`: Đọc/Ghi dữ liệu ra file Microsoft Excel (.xlsx)
- `axios`: Thực hiện HTTP request gửi tin nhắn Telegram Bot
- `cors`: Cấu hình Cross-Origin Resource Sharing
- `express-rate-limit`: Giới hạn tần suất request chống spam form
- `dotenv`: Đọc cấu hình biến môi trường từ file `.env`

---

## 7. KHỞI TẠO FIREBASE PROJECT & CẤU HÌNH DỊCH VỤ

### 7.1 Cấu hình Firestore Database
1. Truy cập [Firebase Console](https://console.firebase.google.com/) và tạo một Project mới (ví dụ: `nsg-support-production`).
2. Vào menu **Build** $\rightarrow$ **Firestore Database** $\rightarrow$ Nhấn **Create database**.
3. Chọn vị trí lưu trữ gần bạn nhất (ví dụ: `asia-southeast1` - Singapore) và chọn chế độ **Start in production mode**.
4. Vào tab **Rules** của Firestore, sao chép toàn bộ nội dung trong file `firebase/firestore.rules` và dán vào, sau đó nhấn **Publish**.

### 7.2 Cấu hình Firebase Authentication
1. Tại Firebase Console, vào **Build** $\rightarrow$ **Authentication** $\rightarrow$ Nhấn **Get started**.
2. Tại tab **Sign-in method**, kích hoạt nhà cung cấp: **Email/Password**.

### 7.3 Cấu hình Firebase Storage
1. Vào **Build** $\rightarrow$ **Storage** $\rightarrow$ Nhấn **Get started**.
2. Chọn lưu trữ theo cấu hình mặc định và nhấn **Done**.

### 7.4 Tải Service Account Key cho Backend
1. Tại Firebase Console, nhấn vào biểu tượng bánh răng **Project settings** (Cài đặt dự án).
2. Chuyển sang tab **Service accounts**.
3. Nhấn vào nút **Generate new private key** $\rightarrow$ Chọn **Generate key**.
4. Trình duyệt sẽ tải về một file `.json`. Đổi tên file này thành `serviceAccountKey.json` và lưu vào thư mục gốc của dự án `nsg-support/serviceAccountKey.json`.

---

## 8. CẤU HÌNH BIẾN MÔI TRƯỜNG (.env)

Tạo một file `.env` tại thư mục gốc của dự án bằng cách sao chép từ file mẫu:

```bash
cp .env.example .env
```

Nội dung file `.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Firebase Admin SDK Configuration
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Telegram Bot Integration (Server-side Only)
TELEGRAM_BOT_TOKEN=789101112:AAFqxxxxxxxxx_your_bot_token
TELEGRAM_MANAGER_CHAT_ID=-1001234567890

# Zalo Official Account Integration (Placeholder Architecture)
ZALO_OA_ENABLED=false
ZALO_OA_APP_ID=your_zalo_app_id
ZALO_OA_SECRET_KEY=your_zalo_secret_key
ZALO_OA_ACCESS_TOKEN=your_zalo_access_token

# Upload & Rate Limit
UPLOAD_MAX_FILE_SIZE_MB=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 9. CẤU HÌNH TELEGRAM BOT NHẬN THÔNG BÁO TỨC THÌ

1. Mở ứng dụng Telegram, tìm kiếm bot **@BotFather**.
2. Gửi lệnh `/newbot` và đặt tên cho Bot (ví dụ: `NSG Support Alert Bot`) cùng username (ví dụ: `nsg_support_alert_bot`).
3. **BotFather** sẽ trả về cho bạn một đoạn mã Token:
   `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`
   $\rightarrow$ Dán mã này vào biến `TELEGRAM_BOT_TOKEN` trong file `.env`.
4. Tạo một Nhóm Telegram (ví dụ: `[NSG] Tiếp Nhận Kỹ Thuật`) và thêm Bot vừa tạo vào nhóm.
5. Lấy **Chat ID** của nhóm:
   - Thêm bot **@RawDataBot** vào nhóm để xem ID (thường có dạng số âm: `-1001234567890`).
   - Hoặc truy cập đường dẫn: `https://api.telegram.org/bot<TOKEN_CUA_BAN>/getUpdates` để lấy `chat.id`.
   $\rightarrow$ Dán Chat ID này vào biến `TELEGRAM_MANAGER_CHAT_ID` trong file `.env`.
6. Khởi động server và vào trang **Cài đặt** (`#/admin/settings`) nhấn nút **Bắn tin nhắn thử nghiệm** để kiểm tra!

---

## 10. KIẾN TRÚC MỞ RỘNG ZALO OFFICIAL ACCOUNT (OA)

Hệ thống tuân thủ nghiêm ngặt mô hình thiết kế Provider Pattern tại file `backend/services/notificationService.js`:
- `telegramService.js`: Xử lý bắn Telegram Bot.
- `zaloProvider.js`: Đã cài đặt sẵn interface để kết nối Zalo Notification Service (ZNS) qua Open API của Zalo.
- Khi nhà trường được cấp quyền Zalo OA Doanh nghiệp, chỉ cần chuyển `ZALO_OA_ENABLED=true` và điền `ZALO_OA_ACCESS_TOKEN`, hệ thống sẽ tự động kích hoạt gửi thông báo qua Zalo cho Giảng viên/Sinh viên theo số điện thoại đã điền trên phiếu.

---

## 11. KHỞI CHẠY LOCAL DEVELOPMENT (CHẠY THỬ NGAY)

Hệ thống hỗ trợ chạy song song cả Backend Express và Frontend:

### Bước 1: Khởi động Backend API Server
```bash
npm start
```
Server sẽ chạy tại địa chỉ: `http://localhost:5000`

### Bước 2: Khởi chạy Frontend Web App
Mở một cửa sổ Terminal mới:
```bash
npm run serve
```
Hoặc mở file `frontend/index.html` bằng Live Server trên VS Code, hoặc dùng bất kỳ web server tĩnh nào (Python: `python -m http.server 3000 --directory frontend`).

Truy cập: `http://localhost:3000` để trải nghiệm đầy đủ giao diện.

---

## 12. KỊCH BẢN SEED DATA MẪU (DEMO ACCOUNTS & TICKETS)

Để hệ thống có sẵn dữ liệu trực quan ngay lần đầu khởi chạy, chạy lệnh:

```bash
npm run seed
```

### Danh sách tài khoản thử nghiệm nhanh (1-Click Demo):
Hệ thống đã tích hợp menu chọn nhanh vai trò (Role Switcher) ngay tại trang đăng nhập:

| Vai trò | Họ và tên | Email đăng nhập | Mật khẩu mặc định | Nhiệm vụ chính |
|---|---|---|---|---|
| **SUPER_ADMIN** | Vũ Hoàng Nam | `superadmin@nsg.edu.vn` | `123456` | Toàn quyền cấu hình, phân quyền, xem log |
| **MANAGER** | Nguyễn Văn Bình | `truongphong.kt@nsg.edu.vn` | `123456` | Tiếp nhận, phân công KTV, giao việc, nghiệm thu |
| **STAFF** (KTV 1) | Trần Văn Cường | `ktv1.tranvanc@nsg.edu.vn` | `123456` | Xử lý mạng, máy tính phòng lab, thiết bị điện |
| **STAFF** (KTV 2) | Lê Thị Diễm | `ktv2.lethid@nsg.edu.vn` | `123456` | Xử lý máy chiếu giảng đường, máy in, âm thanh |
| **USER** | ThS. Nguyễn Thị Hoa | `gv.nguyenhoa@nsg.edu.vn` | `123456` | Giảng viên gửi phản ánh, theo dõi và đánh giá 5 sao |

---

## 13. QUY TRÌNH TRIỂN KHAI PRODUCTION (DEPLOY)

### 13.1 Deploy Frontend lên Firebase Hosting
1. Cài đặt Firebase CLI: `npm install -g firebase-tools`
2. Đăng nhập Firebase: `firebase login`
3. Liên kết dự án: `firebase use your-project-id`
4. Triển khai Hosting và Rules:
   ```bash
   firebase deploy --only hosting,firestore
   ```
Trang web của bạn sẽ hoạt động trực tiếp tại: `https://your-project-id.web.app`

### 13.2 Deploy Backend lên Cloud Run / Render / VPS
1. Thư mục `backend/` chứa toàn bộ mã nguồn Express API độc lập.
2. Đặt lệnh khởi động `npm start`.
3. Cung cấp các biến môi trường trong phần cài đặt Environment Variables của nền tảng Hosting (Render / Railway / DigitalOcean / Cloud Run).
4. Thiết lập thư mục lưu trữ file tĩnh `uploads/` hoặc chuyển sang Firebase Storage.

---

## 14. TẠO TÀI KHOẢN QUẢN TRỊ VIÊN ĐẦU TIÊN

Khi triển khai thực tế trên Firebase Authentication:
1. Vào Firebase Console $\rightarrow$ **Authentication** $\rightarrow$ **Add user**.
2. Nhập Email và Mật khẩu của Admin (ví dụ: `admin@nsg.edu.vn`).
3. Vào Firestore Database $\rightarrow$ Collection `users` $\rightarrow$ Thêm Document có ID trùng với `UID` vừa tạo:
   ```json
   {
     "email": "admin@nsg.edu.vn",
     "displayName": "Quản Trị Viên Hệ Thống",
     "role": "SUPER_ADMIN",
     "departmentName": "Phòng Kỹ thuật & Hạ tầng",
     "isActive": true,
     "createdAt": "2026-08-28T00:00:00Z"
   }
   ```

---

## 15. FIREBASE SECURITY RULES & INDEXES

- Quy tắc bảo mật được định nghĩa chi tiết tại `firebase/firestore.rules`:
  - Cho phép người dùng công khai gửi phản ánh mới và tra cứu theo mã phiếu `PYC-`.
  - Khóa quyền cập nhật chỉ dành cho Trưởng phòng (`MANAGER`) và Kỹ thuật viên phụ trách (`STAFF`).
  - Cho phép người gửi cập nhật trường `rating` và `feedback` sau khi phiếu hoàn thành.
  - Tuyệt đối cấm sửa hoặc xóa bảng `activity_logs` để đảm bảo tính toàn vẹn của lịch sử kiểm toán.
- Các chỉ mục phức hợp tối ưu hiệu năng truy vấn được khai báo đầy đủ tại `firebase/firestore.indexes.json`.

---

## 16. TROUBLESHOOTING & CÂU HỎI THƯỜNG GẶP

1. **Gửi form báo lỗi "Bạn đã gửi quá nhiều yêu cầu"?**
   - Đây là cơ chế Rate Limiter chống spam. Hãy đợi 15 phút hoặc chỉnh sửa giá trị `RATE_LIMIT_MAX_REQUESTS` trong `.env`.
2. **Không nghe thấy tiếng chuông thông báo?**
   - Trình duyệt hiện đại yêu cầu người dùng phải tương tác với trang ít nhất 1 lần (click chuột hoặc chạm màn hình) trước khi cho phép Web Audio API phát âm thanh.
3. **Cài đặt PWA trên iPhone như thế nào?**
   - Mở Safari trên iPhone $\rightarrow$ Truy cập đường link hệ thống $\rightarrow$ Nhấn vào biểu tượng **Chia sẻ (Share)** $\rightarrow$ Chọn **Thêm vào màn hình chính (Add to Home Screen)**.
4. **Ảnh chụp hiện trường quá nặng khi tải lên?**
   - Hệ thống đã tích hợp sẵn module `Utils.compressImage` tự động nén trực tiếp trên Canvas của trình duyệt trước khi gửi về máy chủ, giảm 90% dung lượng mà vẫn giữ nguyên độ sắc nét của hiện trường sự cố.

---
**NSG SUPPORT - ĐỒNG HÀNH CÙNG CHẤT LƯỢNG GIẢNG DẠY VÀ QUẢN TRỊ ĐẠI HỌC HIỆN ĐẠI!**
