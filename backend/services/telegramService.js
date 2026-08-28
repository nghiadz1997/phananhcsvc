const axios = require('axios');

class TelegramService {
  constructor() {
    this.token = process.env.TELEGRAM_BOT_TOKEN;
    this.managerChatId = process.env.TELEGRAM_MANAGER_CHAT_ID;
    this.baseUrl = this.token ? `https://api.telegram.org/bot${this.token}` : null;
  }

  isEnabled() {
    return Boolean(this.token && this.managerChatId);
  }

  /**
   * Gửi tin nhắn raw qua Telegram Bot API
   */
  async sendTelegramMessage(text, chatId = null, parseMode = 'HTML') {
    const targetChatId = chatId || this.managerChatId;
    if (!this.isEnabled() || !targetChatId) {
      console.log('[TelegramService] Telegram not configured or disabled. Skipped sending message.');
      return { success: false, reason: 'NOT_CONFIGURED' };
    }

    try {
      const response = await axios.post(`${this.baseUrl}/sendMessage`, {
        chat_id: targetChatId,
        text: text,
        parse_mode: parseMode,
        disable_web_page_preview: true
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('[TelegramService] Error sending telegram message:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Thông báo khi có phản ánh mới từ người dùng
   */
  async notifyNewReport(report) {
    const priorityIcon = {
      'KHẨN CẤP': '🔴',
      'CAO': '🟠',
      'TRUNG BÌNH': '🟡',
      'BÌNH THƯỜNG': '🟢'
    }[report.priority] || '🔵';

    const createdAt = report.createdAtFormatted || new Date().toLocaleString('vi-VN');

    const message = `
${priorityIcon} <b>PHẢN ÁNH MỚI</b>

<b>Mã yêu cầu:</b> <code>${report.code || 'PYC-XXXXXX'}</code>
<b>Tiêu đề:</b> ${report.title || 'Không có tiêu đề'}
<b>Danh mục:</b> ${report.categoryName || 'Kỹ thuật'}

📍 <b>Địa điểm:</b> ${report.location || 'Chưa xác định'} ${report.room ? `- Phòng: ${report.room}` : ''}
👤 <b>Người gửi:</b> ${report.senderName || 'Ẩn danh'} (${report.senderPhone || 'N/A'})
🏢 <b>Khoa/Phòng:</b> ${report.senderDept || 'Khác'}
⚠️ <b>Mức độ:</b> <b>${report.priority || 'BÌNH THƯỜNG'}</b>

📝 <b>Nội dung:</b>
<i>${(report.description || '').substring(0, 300)}</i>

⏰ ${createdAt}

👉 <i>Vui lòng truy cập hệ thống NSG SUPPORT để phân công xử lý kịp thời.</i>
    `.trim();

    return this.sendTelegramMessage(message);
  }

  /**
   * Thông báo khi Trưởng phòng phân công công việc cho Kỹ thuật viên
   */
  async notifyTaskAssigned(task, staffChatId = null) {
    const deadline = task.deadlineFormatted || (task.deadline ? new Date(task.deadline).toLocaleString('vi-VN') : 'Không có');
    
    const message = `
📋 <b>CÔNG VIỆC MỚI ĐƯỢC PHÂN CÔNG</b>

<b>Mã:</b> <code>${task.code || 'TASK-XXXXXX'}</code>
<b>Bạn được phân công xử lý:</b>
<b>${task.title || 'Nhiệm vụ'}</b>

📍 <b>Địa điểm:</b> ${task.location || 'Trường'} ${task.room ? `- Phòng: ${task.room}` : ''}
⚠️ <b>Mức độ:</b> ${task.priority || 'BÌNH THƯỜNG'}
⏰ <b>Deadline:</b> <b>${deadline}</b>
👤 <b>Người giao:</b> ${task.assignedByName || 'Trưởng phòng Kỹ thuật'}
📝 <b>Ghi chú:</b> <i>${task.assignmentNote || 'Tiến hành kiểm tra và khắc phục.'}</i>

👉 <i>Vui lòng truy cập trang Kỹ thuật viên để nhận việc và cập nhật tiến độ.</i>
    `.trim();

    // Gửi cho nhóm quản lý và gửi riêng cho kỹ thuật viên nếu có Chat ID cá nhân
    await this.sendTelegramMessage(message);
    if (staffChatId && staffChatId !== this.managerChatId) {
      await this.sendTelegramMessage(message, staffChatId);
    }
    return { success: true };
  }

  /**
   * Thông báo khi công việc bị quá hạn (Overdue)
   */
  async notifyTaskOverdue(task) {
    const deadline = task.deadlineFormatted || (task.deadline ? new Date(task.deadline).toLocaleString('vi-VN') : 'N/A');

    const message = `
🚨 <b>CẢNH BÁO: CÔNG VIỆC QUÁ HẠN!</b>

<b>Mã:</b> <code>${task.code}</code>
<b>Tiêu đề:</b> ${task.title}
<b>Người phụ trách:</b> ${task.assignedToName || 'Chưa nhận'}
⏰ <b>Hạn chót:</b> ${deadline}
⚠️ <b>Trạng thái:</b> <b>${task.status} (QUÁ HẠN)</b>

👉 <i>Đề nghị kiểm tra tiến độ ngay lập tức!</i>
    `.trim();

    return this.sendTelegramMessage(message);
  }

  /**
   * Thông báo khi Kỹ thuật viên hoàn thành và gửi yêu cầu nghiệm thu
   */
  async notifyTaskCompleted(task, staffName) {
    const message = `
✅ <b>YÊU CẦU NGHIỆM THU CÔNG VIỆC</b>

<b>Mã:</b> <code>${task.code}</code>
<b>Tiêu đề:</b> ${task.title}
👨‍🔧 <b>Kỹ thuật viên:</b> ${staffName || task.assignedToName || 'Nhân viên'}
⏰ <b>Thời gian hoàn thành:</b> ${new Date().toLocaleString('vi-VN')}
📝 <b>Ghi chú xử lý:</b> <i>${task.completionNote || 'Đã kiểm tra và xử lý xong.'}</i>

👉 <i>Kính mời Trưởng phòng truy cập hệ thống để duyệt nghiệm thu hoặc yêu cầu làm lại.</i>
    `.trim();

    return this.sendTelegramMessage(message);
  }

  /**
   * Thông báo khi Trưởng phòng yêu cầu xử lý lại (Reject nghiệm thu)
   */
  async notifyTaskReopened(task, managerName, reason) {
    const message = `
🔄 <b>YÊU CẦU XỬ LÝ LẠI CÔNG VIỆC</b>

<b>Mã:</b> <code>${task.code}</code>
<b>Tiêu đề:</b> ${task.title}
👤 <b>Người duyệt:</b> ${managerName || 'Trưởng phòng'}
❌ <b>Lý do chưa đạt:</b>
<b><i>${reason || 'Cần kiểm tra kỹ lại theo yêu cầu.'}</i></b>

👉 <i>Kỹ thuật viên phụ trách vui lòng tiếp tục xử lý và cập nhật kết quả.</i>
    `.trim();

    return this.sendTelegramMessage(message);
  }
}

module.exports = new TelegramService();
