const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục lưu trữ uploads/ tồn tại
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  }
});

// Danh sách MIME type hợp lệ
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'video/mp4',
  'video/quicktime'
];

// Danh sách đuôi file cấm tuyệt đối
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.sh', '.js', '.vbs', '.msi', '.cmd', '.com', '.php', '.phtml', '.html', '.htm'
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return cb(new Error(`Tệp có định dạng ${ext} bị cấm tải lên vì lý do an toàn bảo mật.`), false);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error(`Định dạng tệp không được hỗ trợ (${file.mimetype}). Vui lòng tải ảnh, tài liệu PDF, Word, Excel hoặc video.`), false);
  }

  cb(null, true);
};

const maxFileSizeMB = parseInt(process.env.UPLOAD_MAX_FILE_SIZE_MB || '10', 10);

const upload = multer({
  storage: storage,
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024 // Bytes
  },
  fileFilter: fileFilter
});

module.exports = upload;
