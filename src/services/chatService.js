import api from "./api";
import io from "socket.io-client";

// Debug logging function - helps with troubleshooting
const debug = (message, ...args) => {
  console.log(`[Socket Debug] ${message}`, ...args);
};

// Get user data
const getUserData = () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    return {
      id: userData.user?.id || userData.id,
      name: userData.user?.full_name || userData.full_name,
    };
  } catch (e) {
    console.error("Error parsing user data:", e);
    return { id: null, name: null };
  }
};

// Create socket with most reliable settings for your environment
const socket = io("http://localhost:3000", {
  withCredentials: true,
  transports: ["polling"], // Long-polling only - most reliable
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: false, // We'll connect manually when ready
  forceNew: true,
  // REMOVED query parameters which were causing 400 error
});

// Make socket available globally for debugging
window.socket = socket;

// Connection management
let isConnecting = false;
const ensureConnection = () => {
  if (socket.connected) {
    return Promise.resolve(true);
  }

  if (isConnecting) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (socket.connected) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);
    });
  }

  isConnecting = true;
  return new Promise((resolve) => {
    debug("Ensuring socket connection...");

    const onConnect = () => {
      debug("Socket connected:", socket.id);
      isConnecting = false;

      // Join room with user ID
      const user = getUserData();
      if (user.id) {
        socket.emit("join", user);
        debug("Join event emitted for user:", user.id);
      }

      socket.off("connect", onConnect);
      resolve(true);
    };

    socket.once("connect", onConnect);
    socket.connect();
  });
};

// Initialize socket connection
ensureConnection();

// Connection event handlers
socket.on("connect", () => {
  debug("Socket connected:", socket.id);

  // Send join event with user data
  const user = getUserData();
  if (user.id) {
    socket.emit("join", user);
    debug("Join event emitted for user:", user.id);
  }
});

socket.on("connect_error", (error) => {
  console.error("Socket connection error details:", {
    type: error.type,
    message: error.message,
    description: error.description,
    context: error.context || "No context",
    stack: error.stack,
  });

  // Try to reconnect after a delay with exponential backoff
  setTimeout(() => {
    if (!socket.connected) {
      debug("Attempting to reconnect socket...");
      socket.connect();
    }
  }, 2000);
});

socket.on("disconnect", (reason) => {
  debug("Socket disconnected reason:", reason);
});

// API Functions
// Gửi tin nhắn
export const sendMessage = async (messageData) => {
  try {
    // Chỉ gửi qua API, không gửi qua socket
    const response = await api.post("/api/chat/send", messageData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to send message",
    };
  }
};

// Lấy lịch sử tin nhắn giữa hai người dùng
export const getMessages = async (user1Id, user2Id) => {
  try {
    const response = await api.get(`/api/chat/messages/${user1Id}/${user2Id}`);
    if (response.data && response.data.success) {
      return {
        success: true,
        data: Array.isArray(response.data.data) ? response.data.data : [],
      };
    } else {
      console.error("Invalid response format:", response.data);
      return {
        success: false,
        data: [],
        message: "Invalid response format",
      };
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to fetch messages",
    };
  }
};

// Lấy danh sách nhân viên có thể chat
export const getAllEmployees = async () => {
  try {
    const response = await api.get("/api/chat/employees");
    if (response.data && response.data.success) {
      return {
        success: true,
        data: Array.isArray(response.data.data) ? response.data.data : [],
      };
    } else {
      console.error("Invalid response format:", response.data);
      return {
        success: false,
        data: [],
        message: "Invalid response format",
      };
    }
  } catch (error) {
    console.error("Error fetching employees:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Failed to fetch employees",
    };
  }
};

// Đánh dấu tin nhắn đã đọc
export const markMessagesAsRead = async (messageIds) => {
  try {
    await Promise.all(
      messageIds.map((id) => api.put(`/api/chat/mark-read/${id}`))
    );
    return { success: true };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to mark messages as read",
    };
  }
};

// Helper functions
export const listenToSocketEvents = (event, callback) => {
  socket.on(event, callback);
  return () => socket.off(event, callback); // Return cleanup function
};

export const disconnectSocket = () => {
  debug("Manually disconnecting socket");
  socket.disconnect();
};

export const reconnectSocket = () => {
  if (!socket.connected) {
    debug("Manually reconnecting socket");
    socket.connect();
  }
};

export const isSocketConnected = () => {
  return socket.connected;
};

// Export socket instance
export { socket };

//====================PHP===================

// import api from './api';

// export const sendMessage = async (messageData) => {
//     try {
//         const response = await api.post('/api/chat/send', messageData);
//         return {
//             success: true,
//             data: response.data
//         };
//     } catch (error) {
//         console.error('Error sending message:', error);
//         return {
//             success: false,
//             message: error.response?.data?.message || 'Failed to send message'
//         };
//     }
// };

// export const getMessages = async (user1Id, user2Id) => {
//   try {
//     if (!user1Id || !user2Id) {
//       throw new Error('Both user IDs are required');
//     }

//     const response = await api.get('/api/chat/messages', {
//       params: {
//         user1_id: user1Id,
//         user2_id: user2Id
//       }
//     });

//     if (response.data && response.data.success) {
//       return {
//         success: true,
//         data: response.data.messages || []
//       };
//     } else {
//       throw new Error(response.data?.message || 'Failed to fetch messages');
//     }
//   } catch (error) {
//     console.error('Error fetching messages:', error);
//     return {
//       success: false,
//       message: error.message || 'Failed to fetch messages',
//       data: []
//     };
//   }
// };

// export const getAllEmployees = async () => {
//     try {
//         const response = await api.get('/api/chat/employees');
//         return {
//             success: true,
//             data: response.data.data || []
//         };
//     } catch (error) {
//         console.error('Error fetching employees:', error);
//         return {
//             success: false,
//             message: error.response?.data?.message || 'Failed to fetch employees'
//         };
//     }
// };
