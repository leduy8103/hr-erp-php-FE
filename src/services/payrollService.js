// filepath: d:\React\hr-erp-frontend\src\services\payrollService.js
import api from './api';
import authService from './authService';

// Lấy tất cả bảng lương (chỉ cho admin và kế toán)
export const getAllPayrolls = async () => {
    try {
        const response = await api.get('/api/payroll/all');
        console.log('Raw API Response:', response.data); // Debug log

        if (response.data && response.data.success) {
            const payrolls = response.data.data.map(payroll => ({
                ...payroll,
                employee_email: payroll.employee_email, // Ensure email is preserved
                employee_name: payroll.employee_name
            }));

            return {
                success: true,
                data: payrolls
            };
        }
        return {
            success: false,
            data: [],
            message: 'Invalid response format'
        };
    } catch (error) {
        console.error('Error fetching payrolls:', error);
        return {
            success: false,
            data: [],
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
        // Get current user data
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userRole = userData.user?.role || userData.role;
        
        // Add user role to payload
        const payload = {
            ...payrollData,
            user: {
                role: userRole
            }
        };

        const response = await api.post('/api/payroll/create', payload);
        
        if (response.data && response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        } else {
            throw new Error(response.data?.message || 'Failed to create payroll');
        }
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
        console.log('Updating payroll with data:', payrollData);
        
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const userRole = userData.user?.role || userData.role;
        
        const payload = {
            ...payrollData,
            user: {
                role: userRole
            }
        };

        const response = await api.put(`/api/payroll/update/${payrollId}`, payload);
        
        if (response.data && response.data.success) {
            return {
                success: true,
                data: response.data.data,
                message: response.data.message
            };
        } else {
            throw new Error(response.data?.message || 'Failed to update payroll');
        }
    } catch (error) {
        console.error('Error updating payroll:', error);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update payroll'
        };
    }
};