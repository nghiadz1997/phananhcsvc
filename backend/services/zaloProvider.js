const axios = require('axios');

/**
 * Zalo Official Account (OA) Provider Interface
 * Kiến trúc sẵn sàng tích hợp API Zalo OA (Zalo Notification Service - ZNS hoặc Tin nhắn tư vấn)
 */
class ZaloProvider {
  constructor() {
    this.enabled = process.env.ZALO_OA_ENABLED === 'true';
    this.appId = process.env.ZALO_OA_APP_ID || '';
    this.secretKey = process.env.ZALO_OA_SECRET_KEY || '';
    this.accessToken = process.env.ZALO_OA_ACCESS_TOKEN || '';
    this.apiUrl = 'https://openapi.zalo.me/v3.0/oa/message/transaction';
  }

  isEnabled() {
    return this.enabled && Boolean(this.accessToken);
  }

  /**
   * Gửi tin nhắn thông báo Zalo OA qua template ZNS hoặc message API
   */
  async sendMessage(recipientPhone, templateData) {
    if (!this.isEnabled()) {
      console.log('[ZaloProvider] Zalo OA is disabled or not configured. Skipped.');
      return { success: false, reason: 'ZALO_NOT_CONFIGURED' };
    }

    try {
      // Chuẩn hóa số điện thoại dạng 84xxxxxxxxx
      let phone = recipientPhone.replace(/\D/g, '');
      if (phone.startsWith('0')) {
        phone = '84' + phone.substring(1);
      }

      console.log(`[ZaloProvider] Sending ZNS to ${phone} with template data:`, templateData);

      const response = await axios.post(
        this.apiUrl,
        {
          phone: phone,
          template_id: templateData.templateId || 'SAMPLE_TEMPLATE_ID',
          template_data: templateData.data || {}
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'access_token': this.accessToken
          }
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      console.error('[ZaloProvider] Error sending Zalo message:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  async notifyNewReport(report) {
    if (!this.isEnabled()) return { success: false };
    return this.sendMessage(report.senderPhone, {
      templateId: 'NEW_REPORT_CONFIRMATION',
      data: {
        code: report.code,
        title: report.title,
        status: report.status,
        time: new Date().toLocaleTimeString('vi-VN')
      }
    });
  }

  async notifyTaskAssigned(task, phone) {
    if (!this.isEnabled() || !phone) return { success: false };
    return this.sendMessage(phone, {
      templateId: 'TASK_ASSIGNED',
      data: {
        code: task.code,
        title: task.title,
        deadline: task.deadline,
        priority: task.priority
      }
    });
  }
}

module.exports = new ZaloProvider();
