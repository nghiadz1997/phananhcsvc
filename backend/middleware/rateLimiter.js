const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter chống gửi form spam
 * Tối đa 15 yêu cầu trong 15 phút từ 1 IP cho form công khai
 */
const reportSubmitLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 phút
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '20', 10),
  message: {
    success: false,
    message: 'Bạn đã gửi quá nhiều yêu cầu trong thời gian ngắn. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Honeypot Anti-spam Middleware
 * Kiểm tra xem trường ẩn `_hp_website` có bị bot điền vào không
 */
const checkHoneypot = (req, res, next) => {
  if (req.body && req.body._hp_website) {
    console.warn('[AntiSpam] Bot detected via honeypot field from IP:', req.ip);
    // Trả về thành công giả lập để bot không nhận biết bị chặn
    return res.status(200).json({
      success: true,
      message: 'Gửi phản ánh thành công!',
      code: 'PYC-SPAM-DETECTED'
    });
  }
  next();
};

module.exports = {
  reportSubmitLimiter,
  checkHoneypot
};
