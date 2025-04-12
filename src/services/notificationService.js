import api from './api';
import authService from './authService';

const notificationService = {
  getNotifications: async () => {
    const token = authService.getToken();
    const userId = authService.getUserIdFromToken();
    const response = await api.get(`/api/user/${userId}/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
};

export default notificationService;
