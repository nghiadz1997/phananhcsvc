const cron = require('node-cron');
const { db } = require('../config/firebaseAdmin');
const notificationService = require('./notificationService');

/**
 * Deadline Scheduler
 * Tự động quét các công việc sắp hết hạn hoặc đã quá hạn định kỳ mỗi 5 phút
 */
class DeadlineScheduler {
  constructor() {
    this.cronJob = null;
  }

  start() {
    // Chạy mỗi 5 phút một lần: '*/5 * * * *'
    this.cronJob = cron.schedule('*/5 * * * *', async () => {
      console.log('[DeadlineScheduler] Running deadline scan at:', new Date().toISOString());
      await this.checkDeadlines();
    });
    console.log('[DeadlineScheduler] Deadline scheduler service started (Every 5 minutes).');

    // Chạy ngay 1 lần sau khi khởi động 10 giây
    setTimeout(() => {
      this.checkDeadlines();
    }, 10000);
  }

  async checkDeadlines() {
    if (!db) return;

    try {
      const now = new Date();
      const nowIso = now.toISOString();

      // 1. Quét collection reports
      const reportsSnap = await db.collection('reports')
        .where('status', 'in', ['MỚI', 'CHỜ PHÂN CÔNG', 'ĐÃ PHÂN CÔNG', 'ĐANG XỬ LÝ', 'CHỜ NGHIỆM THU'])
        .get();

      for (const doc of reportsSnap.docs) {
        const report = { id: doc.id, ...doc.data() };
        if (report.deadline && report.deadline < nowIso && !report.isOverdue) {
          console.log(`[DeadlineScheduler] Report ${report.code} is overdue! Marking isOverdue = true`);
          await db.collection('reports').doc(doc.id).update({
            isOverdue: true,
            updatedAt: nowIso
          });
          await notificationService.dispatchTaskOverdue(report);
        }
      }

      // 2. Quét collection tasks
      const tasksSnap = await db.collection('tasks')
        .where('status', 'in', ['GIAO VIỆC', 'CHỜ NHÂN VIÊN NHẬN', 'ĐÃ PHÂN CÔNG', 'ĐANG XỬ LÝ', 'CHỜ NGHIỆM THU'])
        .get();

      for (const doc of tasksSnap.docs) {
        const task = { id: doc.id, ...doc.data() };
        if (task.deadline && task.deadline < nowIso && !task.isOverdue) {
          console.log(`[DeadlineScheduler] Task ${task.code} is overdue! Marking isOverdue = true`);
          await db.collection('tasks').doc(doc.id).update({
            isOverdue: true,
            updatedAt: nowIso
          });
          await notificationService.dispatchTaskOverdue(task);
        }
      }
    } catch (error) {
      console.error('[DeadlineScheduler] Error in checkDeadlines:', error.message);
    }
  }

  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('[DeadlineScheduler] Stopped deadline scheduler.');
    }
  }
}

module.exports = new DeadlineScheduler();
