import api from './api';

// Lấy số ngày phép còn lại
export const getLeaveBalance = async () => {
  try {
    const response = await api.get('/api/leave/balance');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Gửi đơn xin nghỉ phép
export const requestLeave = async (leaveData) => {
  try {
    const payload = {
      leaveType: leaveData.leaveType,
      startDate: leaveData.startDate,
      endDate: leaveData.endDate,
      reason: leaveData.reason || 'Office'
    };
    const response = await api.post('/api/leave/request', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Phê duyệt/từ chối đơn nghỉ phép (cho Admin/Manager)
export const processLeaveRequest = async (processData) => {
  try {
    const payload = {
      requestId: processData.requestId,
      status: processData.status,
      rejectReason: processData.rejectReason || ''
    };
    const response = await api.post('/api/leave/process-request', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Khởi tạo số ngày nghỉ phép cho nhân viên (chỉ Admin)
export const initializeLeaveBalance = async (userData) => {
  try {
    const response = await api.post('/api/leave/initialize-balance', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy danh sách đơn nghỉ phép
export const getAllLeaveRequests = async () => {
  try {
    const response = await api.get('/api/leave/all-requests');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Lấy danh sách đơn nghỉ phép của một người dùng
export const getUserLeaveRequests = async () => {
  try {
    const response = await api.get('/api/leave/my-requests');
    return response.data;
  } catch (error) {
    throw error;
  }
}; 

