

import api from './api';

export const sendMessage = async (messageData) => {
  try {
    const response = await api.post('/api/chat/send', messageData);

    if (response.data) {
      return {
        success: true,
        data: response.data
      };
    }

    return {
      success: false,
      message: 'Failed to send message'
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = async (user1Id, user2Id) => {
  try {
    console.log('Fetching messages for users:', { user1Id, user2Id });

    const response = await api.get('/api/chat/messages', {
      params: {
        user1_id: `"${user1Id}"`,
        user2_id: `"${user2Id}"`
      }
    });

    console.log('Raw API response:', response.data);

    return {
      success: true,
      data: response.data.data
    };

  } catch (error) {
    console.error('Error fetching messages:', error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Error loading messages'
    };
  }
};

export const getAllEmployees = async () => {
  try {
    const response = await api.get('/api/chat/employees');
    return {
      success: true,
      data: response.data.data || []
    };
  } catch (error) {
    console.error('Error fetching employees:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch employees'
    };
  }
};
