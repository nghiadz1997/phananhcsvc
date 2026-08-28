/**
 * NSG SUPPORT - SEED DATA SCRIPT
 * Tạo dữ liệu mẫu đầy đủ theo yêu cầu mục 33
 * Chạy: node scripts/seedData.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { db, admin } = require('../backend/config/firebaseAdmin');

const SEED_USERS = [
  {
    uid: 'user_super_admin_01',
    displayName: 'Vũ Hoàng Nam',
    email: 'superadmin@nsg.edu.vn',
    role: 'SUPER_ADMIN',
    departmentName: 'Ban Giám Hiệu & IT',
    phone: '0909999999',
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    uid: 'user_manager_01',
    displayName: 'Nguyễn Văn Bình',
    email: 'truongphong.kt@nsg.edu.vn',
    role: 'MANAGER',
    departmentName: 'Phòng Kỹ thuật & Hạ tầng',
    phone: '0908888888',
    isActive: true,
    createdAt: '2026-01-15T08:00:00Z'
  },
  {
    uid: 'user_staff_01',
    displayName: 'Trần Văn Cường',
    email: 'ktv1.tranvanc@nsg.edu.vn',
    role: 'STAFF',
    departmentName: 'Bộ phận Kỹ thuật',
    phone: '0901234567',
    isActive: true,
    createdAt: '2026-02-01T08:00:00Z'
  },
  {
    uid: 'user_staff_02',
    displayName: 'Lê Thị Diễm',
    email: 'ktv2.lethid@nsg.edu.vn',
    role: 'STAFF',
    departmentName: 'Bộ phận Kỹ thuật',
    phone: '0912345678',
    isActive: true,
    createdAt: '2026-02-15T08:00:00Z'
  },
  {
    uid: 'user_lecturer_01',
    displayName: 'ThS. Nguyễn Thị Hoa',
    email: 'gv.nguyenhoa@nsg.edu.vn',
    role: 'USER',
    departmentName: 'Khoa Công nghệ Thông tin',
    phone: '0987654321',
    isActive: true,
    createdAt: '2026-03-01T08:00:00Z'
  }
];

const SEED_CATEGORIES = [
  { id: 'FACILITIES', name: 'Cơ sở vật chất', slaHours: 48 },
  { id: 'COMPUTER', name: 'Máy tính', slaHours: 8 },
  { id: 'PRINTER', name: 'Máy in', slaHours: 12 },
  { id: 'PROJECTOR', name: 'Máy chiếu', slaHours: 4 },
  { id: 'NETWORK', name: 'Mạng Internet', slaHours: 4 },
  { id: 'CAMERA', name: 'Camera an ninh', slaHours: 12 },
  { id: 'AUDIO', name: 'Âm thanh', slaHours: 4 },
  { id: 'ELECTRICITY', name: 'Điện', slaHours: 2 },
  { id: 'WATER', name: 'Nước', slaHours: 4 },
  { id: 'SOFTWARE', name: 'Phần mềm', slaHours: 24 },
  { id: 'TEACHING_EQUIPMENT', name: 'Thiết bị dạy học', slaHours: 4 },
  { id: 'OTHER', name: 'Khác', slaHours: 48 }
];

const SEED_REPORTS = [
  {
    id: 'report_sample_01',
    code: 'PYC-2026-000125',
    type: 'REPORT',
    title: 'Máy chiếu phòng A203 không hoạt động',
    description: 'Máy chiếu bật nguồn quạt kêu to rồi chớp đèn đỏ LAMP, không phát tín hiệu HDMI kết nối với máy tính giảng đường.',
    categoryId: 'PROJECTOR',
    categoryName: 'Máy chiếu',
    location: 'Khu Giảng đường A',
    room: 'Phòng A203',
    priority: 'KHẨN CẤP',
    status: 'CHỜ PHÂN CÔNG',
    senderName: 'Nguyễn Văn A',
    senderPhone: '0909123456',
    senderDept: 'Khoa Công nghệ Thông tin',
    assignedTo: null,
    assignedToName: null,
    deadline: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    isOverdue: false,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString()
  },
  {
    id: 'report_sample_02',
    code: 'PYC-2026-000124',
    type: 'REPORT',
    title: 'Mất kết nối mạng Internet tại phòng Lab 3',
    description: 'Toàn bộ 40 máy tính sinh viên tại phòng Lab 3 mất kết nối mạng cục bộ LAN và Internet từ 8h sáng.',
    categoryId: 'NETWORK',
    categoryName: 'Mạng Internet',
    location: 'Khu thực hành B',
    room: 'Lab 3',
    priority: 'CAO',
    status: 'ĐÃ PHÂN CÔNG',
    senderName: 'ThS. Trần Thị Mai',
    senderPhone: '0912345678',
    senderDept: 'Khoa CNTT',
    assignedTo: 'user_staff_01',
    assignedToName: 'Trần Văn Cường (KTV Mạng & Máy tính)',
    assignedByName: 'Nguyễn Văn Bình (Trưởng Phòng KT)',
    deadline: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    isOverdue: false,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString()
  },
  {
    id: 'report_sample_03',
    code: 'PYC-2026-000122',
    type: 'REPORT',
    title: 'Sửa chữa bảng điện và ổ cắm phòng C301',
    description: 'Ổ cắm điện góc trái bục giảng bị chập tia lửa điện khi cắm sạc laptop, cần kiểm tra lại toàn bộ atomat.',
    categoryId: 'ELECTRICITY',
    categoryName: 'Điện',
    location: 'Khu giảng đường C',
    room: 'Phòng C301',
    priority: 'CAO',
    status: 'CHỜ NGHIỆM THU',
    senderName: 'Lê Văn Nam',
    senderPhone: '0988776655',
    senderDept: 'Phòng Đào tạo',
    assignedTo: 'user_staff_01',
    assignedToName: 'Trần Văn Cường (KTV Mạng & Máy tính)',
    completionNote: 'Đã thay mới atomat chống giật và cụm ổ cắm 3 chấu âm tường, đo điện áp 220V ổn định.',
    deadline: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    isOverdue: false,
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'report_sample_04',
    code: 'PYC-2026-000120',
    type: 'REPORT',
    title: 'Cài đặt phần mềm thi trực tuyến phòng máy A1',
    description: 'Yêu cầu hỗ trợ cài đặt trình duyệt Safe Exam Browser và phần mềm thi trắc nghiệm phục vụ thi cuối kỳ.',
    categoryId: 'SOFTWARE',
    categoryName: 'Phần mềm',
    location: 'Tòa nhà A',
    room: 'Phòng A101',
    priority: 'TRUNG BÌNH',
    status: 'HOÀN THÀNH',
    senderName: 'Nguyễn Thị Hoa',
    senderPhone: '0987654321',
    senderDept: 'Khoa Công nghệ Thông tin',
    assignedTo: 'user_staff_02',
    assignedToName: 'Lê Thị Diễm (KTV Thiết bị Dạy học)',
    completedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    rating: 5,
    feedback: 'Kỹ thuật viên hỗ trợ rất nhiệt tình, đúng giờ và phần mềm hoạt động trơn tru.',
    deadline: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    isOverdue: false,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  },
  {
    id: 'report_sample_05',
    code: 'PYC-2026-000115',
    type: 'REPORT',
    title: 'Thay mực máy in Canon 2900 văn phòng Khoa Kinh tế',
    description: 'Máy in in ra bị sọc đen dọc trang giấy, bản in mờ không đọc rõ văn bản trình ký.',
    categoryId: 'PRINTER',
    categoryName: 'Máy in',
    location: 'Khu hiệu bộ',
    room: 'Phòng 204',
    priority: 'TRUNG BÌNH',
    status: 'ĐANG XỬ LÝ',
    senderName: 'Hoàng Văn Phúc',
    senderPhone: '0933221100',
    senderDept: 'Khoa Kinh tế',
    assignedTo: 'user_staff_02',
    assignedToName: 'Lê Thị Diễm (KTV Thiết bị Dạy học)',
    deadline: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    isOverdue: true, // Quá hạn
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
  }
];

const SEED_TASKS = [
  {
    id: 'task_sample_01',
    code: 'TASK-2026-000018',
    type: 'TASK',
    title: 'Kiểm tra bảo dưỡng toàn bộ hệ thống âm thanh Hội trường lớn',
    description: 'Kiểm tra micro không dây, bàn mixer và dàn loa công suất chuẩn bị cho Lễ Khai giảng năm học mới.',
    categoryId: 'AUDIO',
    categoryName: 'Âm thanh',
    location: 'Hội trường Trụ sở chính',
    room: 'Hội trường 1',
    priority: 'CAO',
    status: 'ĐANG XỬ LÝ',
    assignedTo: 'user_staff_01',
    assignedToName: 'Trần Văn Cường (KTV Mạng & Máy tính)',
    assignedByName: 'Nguyễn Văn Bình (Trưởng Phòng KT)',
    deadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    isOverdue: false,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  }
];

async function runSeed() {
  console.log('====================================================');
  console.log('🌱 BẮT ĐẦU KHỞI TẠO SEED DATA CHO NSG SUPPORT');
  console.log('====================================================');

  // Ghi file JSON dự phòng ra frontend và backend để ứng dụng chạy ngay cả khi chưa kết nối Firestore
  const seedBundle = {
    users: SEED_USERS,
    categories: SEED_CATEGORIES,
    reports: SEED_REPORTS,
    tasks: SEED_TASKS,
    seededAt: new Date().toISOString()
  };

  const seedExportPath = path.resolve(__dirname, '../frontend/assets/data/seedData.json');
  const dataDir = path.dirname(seedExportPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(seedExportPath, JSON.stringify(seedBundle, null, 2), 'utf8');
  console.log(`[SeedData] Đã lưu dữ liệu mẫu ra file: ${seedExportPath}`);

  // Nếu có kết nối Firestore thực tế
  if (db) {
    try {
      console.log('[SeedData] Đang ghi dữ liệu vào Firebase Firestore...');

      // Users
      for (const u of SEED_USERS) {
        await db.collection('users').doc(u.uid).set(u, { merge: true });
      }
      console.log(`[SeedData] ✓ Đã thêm ${SEED_USERS.length} tài khoản người dùng`);

      // Categories
      for (const c of SEED_CATEGORIES) {
        await db.collection('categories').doc(c.id).set(c, { merge: true });
      }
      console.log(`[SeedData] ✓ Đã thêm ${SEED_CATEGORIES.length} danh mục sự cố`);

      // Reports
      for (const r of SEED_REPORTS) {
        await db.collection('reports').doc(r.id).set(r, { merge: true });
      }
      console.log(`[SeedData] ✓ Đã thêm ${SEED_REPORTS.length} phiếu phản ánh mẫu`);

      // Tasks
      for (const t of SEED_TASKS) {
        await db.collection('tasks').doc(t.id).set(t, { merge: true });
      }
      console.log(`[SeedData] ✓ Đã thêm ${SEED_TASKS.length} công việc nội bộ mẫu`);

      console.log('====================================================');
      console.log('🎉 KHỞI TẠO DỮ LIỆU THÀNH CÔNG VÀO FIRESTORE!');
      console.log('====================================================');
    } catch (e) {
      console.error('[SeedData] Lỗi ghi vào Firestore:', e.message);
    }
  } else {
    console.log('[SeedData] Firestore chưa cấu hình serviceAccountKey.json.');
    console.log('[SeedData] Ứng dụng đã sẵn sàng chạy với dữ liệu Local/Mock tích hợp!');
  }
}

runSeed().then(() => {
  console.log('Hoàn tất kịch bản Seed Data.');
  process.exit(0);
}).catch(err => {
  console.error('Lỗi:", err);
  process.exit(1);
});
