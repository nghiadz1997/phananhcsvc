const telegramService = require('./telegramService');
const zaloProvider = require('./zaloProvider');
const { db, admin } = require('../config/firebaseAdmin');

/**
 * Unified Notification Service
 * Quản lý đa kênh thông báo: In-app Realtime Firestore, Telegram Bot, Zalo OA
 */
class NotificationService {
  constructor() {
    this.telegram = telegramService;
    this.zalo = zaloProvider;
  }

  /**
   * Lưu thông báo In-app vào collection 'notifications' của Firestore
   */
  async createInAppNotification({ recipientUid = null, recipientRole = null, title, body, type, targetId, targetCode }) {
    if (!db) return null;
    try {
      const docRef = await db.collection('notifications').add({
        recipientUid,
        recipientRole,
        title,
        body,
        type, // NEW_REPORT, TASK_ASSIGNED, TASK_OVERDUE, TASK_COMPLETED, TASK_REOPENED, SYSTEM
        targetId,
        targetCode,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('[NotificationService] Error creating in-app notification:', error.message);
      return null;
    }
  }

  /**
   * Ghi log thao tác vào collection 'activity_logs' (Audit Trail bất biến)
   */
  async logActivity({ targetId, targetCode, action, actorUid = 'SYSTEM', actorName = 'Hệ thống', actorRole = 'SYSTEM', details = '' }) {
    if (!db) return null;
    try {
      const docRef = await db.collection('activity_logs').add({
        targetId,
        targetCode,
        action,
        actorUid,
        actorName,
        actorRole,
        details,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        isoTime: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('[NotificationService] Error logging activity:', error.message);
      return null;
    }
  }

  /**
   * Điều phối thông báo khi có phản ánh mới
   */
  async dispatchNewReport(report) {
    // 1. Gửi Telegram Bot
    const teleResult = await this.telegram.notifyNewReport(report);

    // 2. Gửi Zalo OA nếu có số điện thoại
    if (report.senderPhone) {
      await this.zalo.notifyNewReport(report);
    }

    // 3. Tạo thông báo in-app cho Trưởng phòng & Quản trị
    await this.createInAppNotification({
      recipientRole: 'MANAGER',
      title: `🔔 Có phản ánh mới: ${report.code}`,
      body: `${report.title} (${report.location}) - Mức độ: ${report.priority}`,
      type: 'NEW_REPORT',
      targetId: report.id,
      targetCode: report.code
    });

    // 4. Ghi activity log
    await this.logActivity({
      targetId: report.id,
      targetCode: report.code,
      action: 'TẠO PHẢN ÁNH',
      actorName: report.senderName || 'Người dùng',
      actorRole: 'USER',
      details: `Gửi phản ánh với mức độ ${report.priority} tại ${report.location || 'N/A'}`
    });

    return { telegram: teleResult };
  }

  /**
   * Điều phối thông báo khi phân công công việc
   */
  async dispatchTaskAssigned(task, staff, manager) {
    // 1. Gửi Telegram Bot
    await this.telegram.notifyTaskAssigned(task, staff?.telegramChatId);

    // 2. Gửi Zalo OA cho nhân viên
    if (staff?.phone) {
      await this.zalo.notifyTaskAssigned(task, staff.phone);
    }

    // 3. Tạo in-app notification cho Staff
    if (staff?.uid || task.assignedTo) {
      await this.createInAppNotification({
        recipientUid: staff?.uid || task.assignedTo,
        title: `📋 Bạn được phân công việc mới: ${task.code}`,
        body: `${task.title} - Hạn chót: ${task.deadline ? new Date(task.deadline).toLocaleString('vi-VN') : 'Không'}.`,
        type: 'TASK_ASSIGNED',
        targetId: task.id,
        targetCode: task.code
      });
    }

    // 4. Ghi activity log
    await this.logActivity({
      targetId: task.id,
      targetCode: task.code,
      action: 'PHÂN CÔNG CÔNG VIỆC',
      actorUid: manager?.uid || 'MANAGER',
      actorName: manager?.displayName || task.assignedByName || 'Trưởng phòng',
      actorRole: manager?.role || 'MANAGER',
      details: `Phân công cho ${staff?.displayName || task.assignedToName} xử lý.`
    });
  }

  /**
   * Điều phối thông báo khi công việc bị quá hạn
   */
  async dispatchTaskOverdue(task) {
    await this.telegram.notifyTaskOverdue(task);

    // Bắn in-app cho cả Manager và Staff phụ trách
    if (task.assignedTo) {
      await this.createInAppNotification({
        recipientUid: task.assignedTo,
        title: `🚨 Công việc quá hạn: ${task.code}`,
        body: `Công việc "${task.title}" đã quá deadline!`,
        type: 'TASK_OVERDUE',
        targetId: task.id,
        targetCode: task.code
      });
    }

    await this.createInAppNotification({
      recipientRole: 'MANAGER',
      title: `🚨 Cảnh báo quá hạn: ${task.code}`,
      body: `Công việc của ${task.assignedToName || 'KTV'} đã quá hạn xử lý.`,
      type: 'TASK_OVERDUE',
      targetId: task.id,
      targetCode: task.code
    });

    await this.logActivity({
      targetId: task.id,
      targetCode: task.code,
      action: 'CẢNH BÁO QUÁ HẠN',
      actorName: 'Hệ thống tự động',
      actorRole: 'SYSTEM',
      details: `Đã vượt quá hạn chót ${task.deadline}. Đánh dấu isOverdue = true.`
    });
  }

  /**
   * Điều phối thông báo khi nhân viên hoàn thành chờ nghiệm thu
   */
  async dispatchTaskCompleted(task, staff) {
    await this.telegram.notifyTaskCompleted(task, staff?.displayName);

    await this.createInAppNotification({
      recipientRole: 'MANAGER',
      title: `✅ Chờ nghiệm thu: ${task.code}`,
      body: `${staff?.displayName || 'Kỹ thuật viên'} đã hoàn thành xử lý. Mời kiểm tra và nghiệm thu.`,
      type: 'TASK_COMPLETED',
      targetId: task.id,
      targetCode: task.code
    });

    await this.logActivity({
      targetId: task.id,
      targetCode: task.code,
      action: 'GỬI YÊU CẦU NGHIỆM THU',
      actorUid: staff?.uid,
      actorName: staff?.displayName || task.assignedToName,
      actorRole: 'STAFF',
      details: task.completionNote || 'Đã hoàn thành công việc, chuyển trạng thái Chờ nghiệm thu.'
    });
  }

  /**
   * Điều phối thông báo khi Trưởng phòng yêu cầu làm lại
   */
  async dispatchTaskReopened(task, manager, reason) {
    await this.telegram.notifyTaskReopened(task, manager?.displayName, reason);

    if (task.assignedTo) {
      await this.createInAppNotification({
        recipientUid: task.assignedTo,
        title: `🔄 Yêu cầu xử lý lại: ${task.code}`,
        body: `Lý do: ${reason}`,
        type: 'TASK_REOPENED',
        targetId: task.id,
        targetCode: task.code
      });
    }

    await this.logActivity({
      targetId: task.id,
      targetCode: task.code,
      action: 'YÊU CẦU XỬ LÝ LẠI',
      actorUid: manager?.uid,
      actorName: manager?.displayName || 'Trưởng phòng',
      actorRole: 'MANAGER',
      details: `Từ chối nghiệm thu. Lý do: ${reason}`
    });
  }
}

module.exports = new NotificationService();
