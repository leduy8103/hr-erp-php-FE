// filepath: d:\React\hr-erp-frontend\src\services\payrollService.js
import api from './api';
import authService from './authService';

// Lấy tất cả bảng lương (chỉ cho admin và kế toán)
export const getAllPayrolls = async () => {
    try {
        const response = await api.get('/api/payroll/all');
        return {
            success: true,
            data: response.data.data
        };
    } catch (error) {
        console.error('Error fetching payrolls:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch payroll data'
        };
    }
};

// Lấy bảng lương của nhân viên đang đăng nhập
export const getEmployeePayrolls = async () => {
    try {
        const userId = authService.getUserIdFromToken();
        if (!userId) {
            throw new Error('User ID not found');
        }
        const response = await api.get(`/api/payroll/employee/${userId}`);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Error fetching employee payrolls:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch your payroll data'
        };
    }
};

// Lấy lịch sử bảng lương cho nhân viên cụ thể (có thể lọc theo tháng)
export const getPayrollHistory = async (employeeId, month = null) => {
    try {
        let url = `/api/payroll/history/${employeeId}`;
        if (month) {
            url += `/${month}`;
        }
        const response = await api.get(url);
        return {
            success: true,
            data: response.data.history
        };
    } catch (error) {
        console.error('Error fetching payroll history:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch payroll history'
        };
    }
};

// Lấy lịch sử bảng lương của người dùng hiện tại
export const getCurrentUserPayrollHistory = async (month = null) => {
    try {
        const userId = authService.getUserIdFromToken();
        if (!userId) {
            throw new Error('User ID not found in token');
        }
        return await getPayrollHistory(userId, month);
    } catch (error) {
        console.error('Error fetching current user payroll history:', error);
        return {
            success: false,
            message: error.message || 'Failed to fetch your payroll history'
        };
    }
};

// Lấy thống kê bảng lương (cho admin và kế toán)
export const getPayrollStatistics = async () => {
    try {
        const response = await api.get('/api/payroll/statistics');
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error('Error fetching payroll statistics:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch payroll statistics'
        };
    }
};

// Xuất bảng lương với kiểm tra quyền
export const exportPayroll = async (employeeId) => {
    try {
        const response = await api.get(`/api/payroll/export/${employeeId}`, { responseType: 'blob' });
        return {
            success: true,
            data: {
                fileContent: response.data,
                fileUrl: response.headers['content-disposition'] ? null : response.data.url
            }
        };
    } catch (error) {
        console.error('Error exporting payroll:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Không thể xuất bảng lương'
        };
    }
};

// Tạo bảng lương mới (kiểm tra quyền admin/kế toán)
export const createPayroll = async (payrollData) => {
    try {
        const response = await api.post('/api/payroll/create', payrollData);
        return {
            success: true,
            data: response.data.payroll || response.data
        };
    } catch (error) {
        console.error('Error creating payroll:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to create payroll'
        };
    }
};

export const deletePayroll = async (payrollId) => {
    try {
        const response = await api.delete(`/api/payroll/delete/${payrollId}`);
        return {
            success: true,
            message: response.data.message
        };
    } catch (error) {
        console.error('Error deleting payroll:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to delete payroll'
        };
    }
};

// Fix: Cập nhật đường dẫn API update từ up-/:id thành update/:id
export const updatePayroll = async (payrollId, payrollData) => {
    try {
        console.log(`Updating payroll #${payrollId} with data:`, payrollData);
        
        // Cải thiện logging cho debugging
        if (!payrollId) {
            console.error('Error: No payroll ID provided');
            return {
                success: false,
                message: 'Không có ID bảng lương để cập nhật'
            };
        }
        
        // Kiểm tra quyền
        const userRole = authService.getUserRole();
        if (userRole !== 'Admin' && userRole !== 'Accountant') {
            console.error('Error: User not authorized', {role: userRole});
            return {
                success: false,
                message: 'Bạn không có quyền cập nhật bảng lương'
            };
        }

        // Đảm bảo API endpoint đúng
        // Lưu ý: Nếu đã có proxy trong package.json, bạn không cần baseURL đầy đủ
        const url = `/api/payroll/update/${payrollId}`;
        console.log('Request URL:', url);
        
        // Gửi request
        const response = await api.put(url, payrollData);
        console.log('API response:', response.data);
        
        return {
            success: true,
            data: response.data.payroll || response.data
        };
    } catch (error) {
        console.error('Error updating payroll:', error);
        
        // Xử lý chi tiết từng loại lỗi
        let errorMessage = 'Failed to update payroll';
        
        if (error.response) {
            console.error('Response error details:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
            
            // Lấy message lỗi từ API nếu có
            errorMessage = error.response.data?.message || 
                          `Server responded with error: ${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
            // Request đã gửi nhưng không nhận được response
            errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
        } else {
            // Lỗi khác
            errorMessage = error.message || 'Đã xảy ra lỗi không xác định';
        }
        
        return {
            success: false,
            message: errorMessage
        };
    }
};