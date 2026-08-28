const { auth, db } = require('../config/firebaseAdmin');

/**
 * Middleware xác thực Firebase JWT Token
 */
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Yêu cầu đăng nhập để truy cập tài nguyên này.'
    });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  try {
    if (!auth) {
      // Trong môi trường dev chưa cấu hình serviceAccountKey, cho phép mock token nếu có header
      if (req.headers['x-mock-user']) {
        try {
          req.user = JSON.parse(req.headers['x-mock-user']);
          return next();
        } catch(e) {}
      }
      return res.status(401).json({ success: false, message: 'Firebase Admin chưa được khởi tạo.' });
    }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;

    // Lấy thêm role và department từ Firestore nếu có
    if (db) {
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        req.user.role = userData.role || 'USER';
        req.user.departmentId = userData.departmentId || null;
        req.user.departmentName = userData.departmentName || null;
        req.user.displayName = userData.displayName || decodedToken.name || 'Người dùng';
      } else {
        req.user.role = 'USER';
      }
    }

    next();
  } catch (error) {
    console.error('[AuthMiddleware] Token verification failed:', error.message);
    return res.status(403).json({
      success: false,
      message: 'Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.',
      error: error.message
    });
  }
};

/**
 * Middleware kiểm tra Role-Based Access Control (RBAC)
 */
const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực người dùng.' });
    }

    const role = req.user.role || 'USER';

    // SUPER_ADMIN luôn có toàn quyền
    if (role === 'SUPER_ADMIN') {
      return next();
    }

    if (allowedRoles.includes(role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thực hiện hành động này.'
    });
  };
};

module.exports = {
  requireAuth,
  requireRole
};
