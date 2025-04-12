import api from './api';
import authService from './authService';

const attendanceService = {
  /**
   * Get current user's attendance status
   * @returns {Promise} Promise with attendance data
   */
  getCurrentUserAttendance: async () => {
    try {
      const response = await api.get('/api/attendance/currentuser');
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      throw error;
    }
  },

  /**
   * Get user's attendance history
   * @returns {Promise} Promise with attendance history
   */
  getAttendanceHistory: async () => {
    try {
      const response = await api.get('/api/attendance/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      throw error;
    }
  },

  /**
   * Get attendance data for all users (for admin/manager overview)
   * @param {string} date - Optional date to filter records
   * @returns {Promise} Promise with all users' attendance data
   */
  getAllUsersAttendance: async (date) => {
    try {
      const endpoint = date 
        ? `/api/attendance/user?date=${date}`
        : '/api/attendance/user';
        
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching all users attendance data:', error);
      throw error;
    }
  },

  /**
   * Check in user
   * @param {Object} gpsLocation - GPS location data
   * @returns {Promise} Promise with check-in response
   */
  checkIn: async (gpsLocation) => {
    try {
      const now = new Date();
      const checkInData = {
        userId: authService.getUserIdFromToken(),
        check_in_time: now.toISOString(),
        gps_location: gpsLocation
      };
      
      const response = await api.post('/api/attendance/check-in', checkInData);
      return response.data;
    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
    }
  },

  /**
   * Check out user
   * @param {Object} gpsLocation - GPS location data
   * @returns {Promise} Promise with check-out response
   */
  checkOut: async (gpsLocation) => {
    try {
      const now = new Date();
      const checkOutData = {
        userId: authService.getUserIdFromToken(),
        check_out_time: now.toISOString(),
        gps_location: gpsLocation
      };
      
      const response = await api.post('/api/attendance/check-out', checkOutData);
      return response.data;
    } catch (error) {
      console.error('Check-out error:', error);
      throw error;
    }
  },

  /**
   * Format time for display
   * @param {string} timeString - Time string
   * @returns {string} Formatted time string
   */
  formatTime: (timeString) => {
    if (!timeString) return '';
    
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      return `${hours}:${minutes} ${ampm}`;
    }
    
    // If it's already in HH:MM format, just return it
    return timeString;
  },

  /**
   * Format date for display
   * @param {string} dateString - date string
   * @returns {string} Formatted date string
   */
  formatDate: (dateString) => {
    if (!dateString) return '';
    
    if (typeof dateString === 'string' && 
        (dateString === 'No Previous Records' || 
         dateString.includes('Previous Record'))) {
      return dateString;
    }
    
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const inputDate = new Date(dateString);
      
      if (isNaN(inputDate.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid Date';
      }
      
      if (inputDate.toDateString() === today.toDateString()) {
        return 'Today';
      } else {
        return inputDate.toLocaleDateString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  },

  /**
   * Determine attendance status based on check-in time
   * @param {string} checkInTime - The check-in time
   * @returns {string} Attendance status (On Time, Late, Absent, Present)
   */
  getAttendanceStatus: (checkInTime) => {
    if (!checkInTime) return 'Absent';
    
    // If it's an ISO string, convert to Date object
    if (typeof checkInTime === 'string' && checkInTime.includes('T')) {
      const date = new Date(checkInTime);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      
      // Consider 9:00 AM as the cutoff time for being late
      if (hours > 9 || (hours === 9 && minutes > 0)) {
        return 'Late';
      }
      return 'On Time';
    }
    
    return 'Present';
  },

  /**
   * Check if current attendance record is from today
   * @param {Object} attendanceData - The attendance data object
   * @returns {boolean} True if attendance is from today
   */
  isCurrentAttendanceFromToday: (attendanceData) => {
    if (
      !attendanceData ||
      !attendanceData.attendance_data ||
      !attendanceData.attendance_data.check_in_time
    ) {
      return false;
    }

    const todayDate = new Date().toISOString().split("T")[0];
    const checkInDate = new Date(attendanceData.attendance_data.check_in_time)
      .toISOString()
      .split("T")[0];
    return checkInDate === todayDate;
  }
};

export default attendanceService;