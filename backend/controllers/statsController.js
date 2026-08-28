const { db } = require('../config/firebaseAdmin');
const xlsx = require('xlsx');

/**
 * 1. Lấy số liệu thống kê Dashboard và biểu đồ
 */
const getDashboardStats = async (req, res) => {
  try {
    const { range = '30days', startDate, endDate } = req.query;

    if (!db) {
      // Mock metrics cho demo nếu DB chưa khởi tạo
      return res.status(200).json({
        success: true,
        data: {
          summary: {
            total: 158,
            pending: 12,
            assigned: 18,
            inProgress: 25,
            reviewing: 7,
            completed: 110,
            overdue: 4,
            emergency: 6
          },
          completionRate: 69.6,
          avgHandlingHours: 3.5
        }
      });
    }

    // Lấy tất cả reports và tasks
    const [reportsSnap, tasksSnap] = await Promise.all([
      db.collection('reports').get(),
      db.collection('tasks').get()
    ]);

    const allItems = [];
    reportsSnap.forEach(d => allItems.push({ id: d.id, ...d.data(), itemType: 'REPORT' }));
    tasksSnap.forEach(d => allItems.push({ id: d.id, ...d.data(), itemType: 'TASK' }));

    // Lọc theo khoảng thời gian
    const now = new Date();
    let filterDate = new Date();

    if (range === 'today') {
      filterDate.setHours(0, 0, 0, 0);
    } else if (range === '7days') {
      filterDate.setDate(now.getDate() - 7);
    } else if (range === '30days') {
      filterDate.setDate(now.getDate() - 30);
    } else if (range === 'month') {
      filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'quarter') {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      filterDate = new Date(now.getFullYear(), quarterMonth, 1);
    } else if (range === 'year') {
      filterDate = new Date(now.getFullYear(), 0, 1);
    } else if (range === 'custom' && startDate) {
      filterDate = new Date(startDate);
    }

    const filteredItems = allItems.filter(item => {
      if (!item.createdAt) return true;
      const itemDate = new Date(item.createdAt);
      if (range === 'custom' && endDate) {
        return itemDate >= filterDate && itemDate <= new Date(endDate);
      }
      return itemDate >= filterDate;
    });

    // Tính toán summary cards
    const summary = {
      total: filteredItems.length,
      pending: 0,
      assigned: 0,
      inProgress: 0,
      reviewing: 0,
      completed: 0,
      overdue: 0,
      emergency: 0
    };

    const statusCounts = {};
    const categoryCounts = {};
    const deptCounts = {};
    const staffCounts = {};
    const dailyCounts = {};
    let totalHandlingTimeHours = 0;
    let completedCountWithTime = 0;

    filteredItems.forEach(item => {
      const s = item.status || 'CHỜ PHÂN CÔNG';
      statusCounts[s] = (statusCounts[s] || 0) + 1;

      if (s === 'CHỜ PHÂN CÔNG' || s === 'MỚI') summary.pending++;
      else if (s === 'ĐÃ PHÂN CÔNG') summary.assigned++;
      else if (s === 'ĐANG XỬ LÝ') summary.inProgress++;
      else if (s === 'CHỜ NGHIỆM THU') summary.reviewing++;
      else if (s === 'HOÀN THÀNH') summary.completed++;

      if (item.isOverdue) summary.overdue++;
      if (item.priority === 'KHẨN CẤP') summary.emergency++;

      // Category breakdown
      const cat = item.categoryName || 'Khác';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

      // Department breakdown
      const dept = item.senderDept || item.departmentName || 'Chung';
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;

      // Staff breakdown
      if (item.assignedToName) {
        staffCounts[item.assignedToName] = (staffCounts[item.assignedToName] || 0) + 1;
      }

      // Daily distribution (format YYYY-MM-DD)
      if (item.createdAt) {
        const dayStr = item.createdAt.substring(0, 10);
        dailyCounts[dayStr] = (dailyCounts[dayStr] || 0) + 1;
      }

      // Handling time calculation
      if (item.completedAt && item.createdAt) {
        const diffHours = (new Date(item.completedAt) - new Date(item.createdAt)) / (1000 * 60 * 60);
        if (diffHours > 0) {
          totalHandlingTimeHours += diffHours;
          completedCountWithTime++;
        }
      }
    });

    const completionRate = summary.total > 0 ? ((summary.completed / summary.total) * 100).toFixed(1) : 0;
    const avgHandlingHours = completedCountWithTime > 0 ? (totalHandlingTimeHours / completedCountWithTime).toFixed(1) : 2.5;

    return res.status(200).json({
      success: true,
      data: {
        summary,
        completionRate: Number(completionRate),
        avgHandlingHours: Number(avgHandlingHours),
        charts: {
          statusCounts,
          categoryCounts,
          deptCounts,
          staffCounts,
          dailyCounts
        }
      }
    });
  } catch (error) {
    console.error('[getDashboardStats] Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi tải dữ liệu thống kê.', error: error.message });
  }
};

/**
 * 2. Xuất dữ liệu báo cáo ra file Excel (.xlsx) hoặc CSV
 */
const exportReportsData = async (req, res) => {
  try {
    const { format = 'xlsx', status, department, priority } = req.query;

    if (!db) {
      return res.status(400).json({ success: false, message: 'Chưa kết nối database.' });
    }

    let query = db.collection('reports');
    if (status && status !== 'ALL') query = query.where('status', '==', status);
    if (priority && priority !== 'ALL') query = query.where('priority', '==', priority);

    const snapshot = await query.get();
    const rows = [];

    snapshot.forEach(doc => {
      const d = doc.data();
      rows.push({
        'Mã yêu cầu': d.code,
        'Tiêu đề': d.title,
        'Danh mục': d.categoryName || 'Khác',
        'Địa điểm': `${d.location || ''} ${d.room ? `(${d.room})` : ''}`.trim(),
        'Mức độ': d.priority,
        'Trạng thái': d.status,
        'Quá hạn': d.isOverdue ? 'Có' : 'Không',
        'Người gửi': d.senderName,
        'Số điện thoại': d.senderPhone,
        'Khoa/Phòng': d.senderDept,
        'Kỹ thuật viên phụ trách': d.assignedToName || 'Chưa phân công',
        'Người giao việc': d.assignedByName || '',
        'Ngày tạo': d.createdAt ? new Date(d.createdAt).toLocaleString('vi-VN') : '',
        'Hạn chót': d.deadline ? new Date(d.deadline).toLocaleString('vi-VN') : '',
        'Hoàn thành lúc': d.completedAt ? new Date(d.completedAt).toLocaleString('vi-VN') : '',
        'Đánh giá': d.rating ? `${d.rating} sao` : 'Chưa đánh giá',
        'Ý kiến người dùng': d.feedback || ''
      });
    });

    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Báo Cáo Phản Ánh NSG');

    if (format === 'csv') {
      const csvData = xlsx.utils.sheet_to_csv(worksheet);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=Bao_Cao_NSG_${Date.now()}.csv`);
      return res.send('\uFEFF' + csvData); // BOM để hiển thị tiếng Việt UTF-8 chuẩn trên Excel
    }

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Bao_Cao_NSG_${Date.now()}.xlsx`);
    return res.send(buffer);
  } catch (error) {
    console.error('[exportReportsData] Error:', error);
    return res.status(500).json({ success: false, message: 'Lỗi xuất báo cáo.', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  exportReportsData
};
