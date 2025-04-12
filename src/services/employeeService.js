import api from './api';
import axios from 'axios';
import authService from './authService';

const addEmployee = async (employeeData) => {
  try {
    const response = await api.post("/api/register", employeeData);
    return response.data;
  } catch (error) {
    console.error('Error adding employee:', error.response?.data || error.message);
    throw error;
  }
};

const getEmployees = async () => {
  try {
    const response = await api.get('/api/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching employees:', error.response?.data || error.message);
    throw error;
  }
};

const getEmployeeById = async (id) => {
  try {
    const response = await api.get(`/api/user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

const getEmployeeNameById = async (id) => {
  try {
    const response = await api.get(`/api/user/${id}`);
    return response.data.full_name;
  } catch (error) {
    console.error(
      `Error fetching employee name ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// Get current user profile
const getCurrentUserProfile = async () => {
  try {
    const userId = authService.getUserIdFromToken();
    if (!userId) {
      throw new Error("User ID not found in token");
    }
    const response = await api.get(`/api/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching current user profile:", error);
    throw error;
  }
};

const updateEmployeeProfile = async (id, employeeData) => {
  try {
    const response = await api.put(`/api/user/${id}`, employeeData);
    return response.data;
  } catch (error) {
    console.error(
      `Error updating employee ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

const deleteEmployee = async (id) => {
  try {
    const response = await api.delete(`/api/user/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting employee ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// Upload file service
const uploadFile = async (id, fileData) => {
  try {
    const formData = new FormData();
    for (const key in fileData) {
      formData.append(key, fileData[key]);
    }
    const response = await api.post(`/api/user/${id}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error uploading file for employee ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// Find employee by email
const findEmployeeByEmail = async (email) => {
  try {
    const allEmployees = await getEmployees();
    // Find the employee with matching email (case insensitive)
    const employee = allEmployees.find(
      (emp) => emp.email && emp.email.toLowerCase() === email.toLowerCase()
    );

    if (!employee) {
      console.warn(`No employee found with email: ${email}`);
      return null;
    }

    return employee;
  } catch (error) {
    console.error(
      "Error finding employee by email:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Get employees by role - updated to match the correct route
const getEmployeesByRole = async (role, token) => {
  try {
    const response = await api.get(`/api/user/role/${role}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching employees with role ${role}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// Get all managers (employees with manager role)
const getManagers = async () => {
  try {
    const token = authService.getToken();
    // Fixed comment and kept "Manager" as the role name
    return await getEmployeesByRole("Manager", token);
  } catch (error) {
    console.error("Error fetching managers:", error);
    throw error;
  }
};

// Block user functionality
const blockUser = async (id) => {
  try {
    const response = await api.put(`/api/user/${id}/block`);
    return response.data;
  } catch (error) {
    console.error(
      `Error blocking user ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// Unblock user functionality
const unblockUser = async (id) => {
  try {
    const response = await api.put(`/api/user/${id}/unblock`);
    return response.data;
  } catch (error) {
    console.error(
      `Error unblocking user ${id}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// Get blocked users functionality
const getBlockedUsers = async () => {
  try {
    const response = await api.get('/api/user/blocked/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching blocked users:', error.response?.data || error.message);
    throw error;
  }
};

const validateResetToken = async (token) => {
  try {
    const response = await api.get(`/api/auth/validate-reset-token/${token}`);
    return response.data;
  } catch (error) {
    console.error('Error validating reset token:', error.response?.data || error.message);
    throw error;
  }
};

const resetPassword = async (data) => {
  try {
    const response = await api.post(`/api/auth/reset-password/${data.token}`, {
      newPassword: data.newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error resetting password:', error.response?.data || error.message);
    throw error;
  }
};

const sendResetPasswordEmail = async (email) => {
  try {
    const response = await api.post('/api/auth/forgot-password', { email });
    // The response contains { message, resetLink }
    return {
      message: response.data.message,
      resetLink: response.data.resetLink
    };
  } catch (error) {
    console.error('Error sending reset password email:', error.response?.data || error.message);
    throw error;
  }
};

const updateProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/api/user/${userId}`, profileData);
    return response.data;
  } catch (error) {
    console.error(`Error updating profile for user ${userId}:`, error);
    throw error;
  }
};

const employeeService = {
  addEmployee,
  getEmployees,
  getEmployeeById,
  getEmployeeNameById,
  getCurrentUserProfile,
  updateEmployeeProfile,
  deleteEmployee,
  uploadFile,
  findEmployeeByEmail,
  getEmployeesByRole,
  getManagers,
  blockUser,
  unblockUser,
  getBlockedUsers,
  validateResetToken,
  resetPassword,
  sendResetPasswordEmail,
  updateProfile
};

export default employeeService;