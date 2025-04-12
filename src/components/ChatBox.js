import React, { useState, useEffect } from "react";
import "../assets/styles/ChatBox.css";
// filepath: c:\Users\Crims\Documents\Src code FE\hr_erp_fe\src\components\ChatBox.js
import {
  sendMessage,
  getMessages,
  getAllEmployees,
  socket, // Import the socket directly
} from "../services/chatService";

const ChatBox = () => {
  const [isSending, setIsSending] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isOpen, setIsOpen] = useState(true); // Set default to true to keep chat open

  // Define fetchEmpData function inside the component scope
  const fetchEmpData = async () => {
    try {
      const response = await getAllEmployees();
      console.log("Employees response:", response);

      if (response.success && Array.isArray(response.data)) {
        // Process employees to handle missing data
        const processedEmployees = response.data.map((emp) => ({
          ...emp,
          full_name: emp.full_name || emp.name || emp.email || "Unknown User",
          position: emp.position || "No position",
          id: emp.id || "unknown",
        }));

        setEmployees(processedEmployees);
        console.log("Processed employees:", processedEmployees);
      } else {
        console.error("Employees data is not an array:", response);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    }
  };

  // Fetch lịch sử tin nhắn
  const loadChatHistory = async (user1Id, user2Id) => {
    try {
      console.log(`Loading chat history between ${user1Id} and ${user2Id}`);
      const response = await getMessages(user1Id, user2Id);
      if (response.success && Array.isArray(response.data)) {
        console.log("Chat history loaded:", response.data.length, "messages");
        setMessages(response.data);
      } else {
        console.error("Messages data is not an array:", response);
        setMessages([]); // Đảm bảo messages luôn là array
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessages([]); // Đảm bảo messages luôn là array khi có lỗi
    }
  };

  // Gửi tin nhắn
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedEmployee || !currentUser) {
      console.warn("Cannot send message - missing data:", {
        hasMessage: !!newMessage.trim(),
        hasEmployee: !!selectedEmployee,
        hasCurrentUser: !!currentUser,
      });
      return;
    }

    setIsSending(true);
    console.log("Sending message to:", selectedEmployee.id);

    const messageData = {
      sender_id: currentUser,
      receiver_id: selectedEmployee.id,
      message: newMessage.trim(),
    };

    // Hiển thị tin nhắn ngay lập tức ở phía người gửi
    const tempMessage = {
      ...messageData,
      id: "temp-" + Date.now(),
      timestamp: new Date().toISOString(),
    };

    // Update UI immediately
    setMessages((prev) => {
      const newMessages = Array.isArray(prev)
        ? [...prev, tempMessage]
        : [tempMessage];
      return newMessages;
    });
    setNewMessage("");

    // Send the message via service
    try {
      // Make sure socket is connected before sending
      if (!socket.connected) {
        console.log("Socket not connected, attempting to connect...");
        socket.connect();

        // Wait a bit for connection
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const response = await sendMessage(messageData);
      console.log("Message send response:", response);

      if (!response.success) {
        console.error("Error sending message:", response.message);
        // You might want to show an error to the user here
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Handle errors, maybe show a notification to the user
    } finally {
      setIsSending(false);
    }
  };

  // Get employees on component mount
  useEffect(() => {
    fetchEmpData();
  }, []);

  // useEffect: Load chat history when employee is selected
  useEffect(() => {
    if (selectedEmployee && currentUser) {
      console.log(
        `Selected employee changed, loading chat with: ${selectedEmployee.id}`
      );
      loadChatHistory(currentUser, selectedEmployee.id);
    }
  }, [selectedEmployee, currentUser]);

  // useEffect: Initialize socket and listen for events
  useEffect(() => {
    console.log("ChatBox component mounted - initializing socket");

    // Parse user data from localStorage
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = userData.user?.id || userData.id;
    const userName = userData.user?.full_name || userData.full_name;
    setCurrentUser(userId);

    if (!userId) {
      console.error("No user ID found in localStorage");
      return; // Exit early if no user ID
    }

    // Define event handlers
    const handleConnect = () => {
      console.log("Socket connected in ChatBox component", socket.id);
      setSocketConnected(true);

      // Send join event on connection with user data
      socket.emit("join", { id: userId, name: userName });
      console.log("Join event emitted for user:", userId);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setSocketConnected(false);
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error);
      setSocketConnected(false);
    };

    // Message handlers
    const handleReceiveMessage = (message) => {
      console.log("New message received:", message);
      setMessages((prev) => {
        if (!Array.isArray(prev)) return [message];
        return [...prev, message];
      });
    };

    const handleUserList = (users) => {
      console.log("Online users updated:", users);
      setEmployees((prevEmployees) => {
        if (!Array.isArray(prevEmployees)) return [];
        return prevEmployees.map((employee) => ({
          ...employee,
          isOnline:
            Array.isArray(users) &&
            users.some((user) => user.id === employee.id),
        }));
      });
    };

    // Register all event listeners
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userList", handleUserList);

    // If socket is already connected, manually trigger connect handler
    if (socket.connected) {
      handleConnect();
    } else {
      // Try to connect if not already connected
      console.log("Socket not connected, attempting to connect...");
      socket.connect();
    }

    // Cleanup function
    return () => {
      console.log("ChatBox component unmounting, cleaning up socket listeners");
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userList", handleUserList);

      // Don't disconnect socket here, as it may be used elsewhere
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "700px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        borderRadius: "8px",
        overflow: "hidden",
        zIndex: 1000,
        background: "white",
      }}>
      <div
        style={{
          background: "#007bff",
          color: "white",
          padding: "10px 15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}>
        <span>
          Chat{" "}
          {selectedEmployee
            ? `- ${selectedEmployee.full_name || "Unknown"}`
            : ""}
        </span>
        {!socketConnected && (
          <span style={{ color: "yellow", marginLeft: "10px" }}>
            ⚠️ Disconnected
          </span>
        )}
        <span>{isOpen ? "▼" : "▲"}</span>
      </div>

      {isOpen && (
        <div
          style={{
            display: "flex",
            height: "400px",
            borderTop: "1px solid #eee",
          }}>
          <div
            className="employee-list"
            style={{
              width: "30%",
              borderRight: "1px solid #ccc",
              overflowY: "auto",
            }}>
            <h4>Nhân viên</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {Array.isArray(employees) && employees.length > 0 ? (
                employees.map((employee) => (
                  <li
                    key={employee.id}
                    onClick={() => setSelectedEmployee(employee)}
                    style={{
                      padding: "8px",
                      borderBottom: "1px solid #eee",
                      background:
                        selectedEmployee?.id === employee.id
                          ? "#e6f7ff"
                          : "transparent",
                      cursor: "pointer",
                    }}>
                    {employee.full_name || "Unknown"} -{" "}
                    {employee.position || "No position"}
                    <span
                      style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: employee.isOnline ? "green" : "gray",
                        marginLeft: "5px",
                      }}></span>
                  </li>
                ))
              ) : (
                <li style={{ padding: "8px" }}>Không có nhân viên</li>
              )}
            </ul>
          </div>

          {selectedEmployee && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "70%",
                height: "100%",
              }}>
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                }}>
                {Array.isArray(messages) && messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        alignSelf:
                          msg.sender_id === currentUser
                            ? "flex-end"
                            : "flex-start",
                        background:
                          msg.sender_id === currentUser ? "#dcf8c6" : "#f1f0f0",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        marginBottom: "8px",
                        maxWidth: "70%",
                      }}>
                      {msg.message}
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#999",
                      marginTop: "20px",
                    }}>
                    Chưa có tin nhắn
                  </div>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  padding: "10px",
                  borderTop: "1px solid #eee",
                }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Nhập tin nhắn..."
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSending}
                  style={{
                    marginLeft: "8px",
                    padding: "8px 16px",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isSending ? "not-allowed" : "pointer",
                  }}>
                  {isSending ? "Đang gửi..." : "Gửi"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBox;

//=====================PHP=====================

// import React, { useState, useEffect, useRef } from 'react';
// import { getAllEmployees, getMessages, sendMessage } from '../services/chatService';
// import authService from '../services/authService';

// const ChatBox = () => {
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [messages, setMessages] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [newMessage, setNewMessage] = useState('');
//   const [isConnected, setIsConnected] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const socketRef = useRef(null);
//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     // Kết nối WebSocket
//     initializeWebSocket();
//     // Lấy thông tin user hiện tại
//     const user = authService.getCurrentUser();
//     setCurrentUser(user);
//     // Lấy danh sách nhân viên
//     fetchEmployees();

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.close();
//       }
//     };
//   }, []);

//   // Load chat history khi chọn người nhận
//   useEffect(() => {
//     if (selectedEmployee) {
//       loadChatHistory();
//     }
//   }, [selectedEmployee]);

//   // Load danh sách nhân viên khi component mount
//   useEffect(() => {
//     const initializeChat = async () => {
//       const user = authService.getCurrentUser();
//       setCurrentUser(user);
//       await fetchEmployees();
//     };

//     initializeChat();
//   }, []);

//   const initializeWebSocket = () => {
//     try {
//       socketRef.current = new WebSocket('ws://localhost:8080');

//       socketRef.current.onopen = () => {
//         setIsConnected(true);
//         setError(null); // Clear any previous errors
//         console.log('WebSocket connected');
//       };

//       socketRef.current.onmessage = (event) => {
//         try {
//           const data = JSON.parse(event.data);
//           handleIncomingMessage(data);
//         } catch (error) {
//           console.error('Error parsing message:', error);
//           setError('Error receiving message');
//         }
//       };

//       socketRef.current.onclose = () => {
//         setIsConnected(false);
//         setError('WebSocket disconnected');
//         console.log('WebSocket disconnected');
//         setTimeout(initializeWebSocket, 5000);
//       };

//       socketRef.current.onerror = (error) => {
//         console.error('WebSocket error:', error);
//         setIsConnected(false);
//         setError('WebSocket connection error');
//       };
//     } catch (error) {
//       console.error('Error initializing WebSocket:', error);
//       setIsConnected(false);
//       setError('Failed to initialize WebSocket');
//     }
//   };

//   const fetchEmployees = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await getAllEmployees();

//       if (response.success) {
//         // Get current user ID
//         const currentUser = JSON.parse(localStorage.getItem('user'));
//         const currentUserId = currentUser?.id || currentUser?.user?.id;

//         // Filter out current user and process the employee list
//         const filteredEmployees = response.data
//           .filter(emp => {
//             // Remove current user and ensure employee has valid data
//             return emp && emp.id && emp.id !== currentUserId;
//           })
//           .map(emp => ({
//             id: emp.id.toString(),
//             full_name: emp.full_name || 'Unknown User',
//             position: emp.position || 'No position'
//           }));

//         console.log('Filtered employees:', filteredEmployees);
//         setEmployees(filteredEmployees);
//       } else {
//         setError('Không thể tải danh sách nhân viên');
//       }
//     } catch (error) {
//       setError('Lỗi khi tải danh sách nhân viên');
//       console.error('Error fetching employees:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!newMessage.trim() || !selectedEmployee) return;

//     try {
//       const currentUser = JSON.parse(localStorage.getItem('user'));
//       const currentUserId = currentUser?.id || currentUser?.user?.id;

//       if (!currentUserId) {
//         setError('User not authenticated');
//         return;
//       }

//       const messageData = {
//         sender_id: currentUserId,
//         receiver_id: selectedEmployee.id,
//         message: newMessage.trim()
//       };

//       const response = await sendMessage(messageData);

//       if (response.success) {
//         setMessages(prev => [...prev, response.data.message]);
//         setNewMessage('');
//         scrollToBottom();
//       } else {
//         setError(response.message || 'Failed to send message');
//       }
//     } catch (error) {
//       console.error('Error sending message:', error);
//       setError('Message sending failed');
//     }
//   };

//   const loadChatHistory = async () => {
//     if (!selectedEmployee) return;

//     try {
//       setLoading(true);
//       const currentUser = JSON.parse(localStorage.getItem('user'));
//       const currentUserId = currentUser?.id || currentUser?.user?.id;

//       if (!currentUserId) {
//         setError('User not authenticated');
//         return;
//       }

//       const response = await getMessages(currentUserId, selectedEmployee.id);

//       if (response.success) {
//         setMessages(response.data);
//         scrollToBottom();
//       } else {
//         setError(response.message || 'Could not load chat history');
//       }
//     } catch (error) {
//       console.error('Error loading chat history:', error);
//       setError('Failed to load chat history');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleIncomingMessage = (data) => {
//     if (data.type === 'message' &&
//       (data.sender_id === selectedEmployee?.id ||
//         data.receiver_id === selectedEmployee?.id)) {
//       setMessages(prev => [...prev, data]);
//       scrollToBottom();
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   return (
//     <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col">
//       <div className="p-4 border-b">
//         <h3 className="text-lg font-semibold">Chat</h3>
//         <div className="text-sm text-gray-500">
//           {isConnected ? 'Connected' : 'Connecting...'}
//         </div>
//       </div>

//       <div className="flex flex-1 overflow-hidden">
//         {/* Danh sách nhân viên */}
//         <div className="w-1/3 border-r overflow-y-auto">
//           {loading ? (
//             <div className="p-4 text-center text-gray-500">
//               Loading...
//             </div>
//           ) : employees && employees.length > 0 ? (
//             employees.map(emp => (
//               <div
//                 key={emp.id}
//                 onClick={() => setSelectedEmployee(emp)}
//                 className={`p-3 cursor-pointer hover:bg-gray-100 ${selectedEmployee?.id === emp.id ? 'bg-blue-50' : ''
//                   }`}
//               >
//                 <div className="font-medium truncate">
//                   {emp.full_name}
//                 </div>
//                 <div className="text-sm text-gray-500 truncate">
//                   {emp.position}
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="p-4 text-center text-gray-500">
//               No other employees found
//             </div>
//           )}
//         </div>

//         {/* Chat area */}
//         <div className="flex-1 flex flex-col">
//           {selectedEmployee ? (
//             <>
//               {/* Header */}
//               <div className="p-3 border-b">
//                 <div className="font-medium">{selectedEmployee.full_name}</div>
//                 <div className="text-sm text-gray-500">{selectedEmployee.position}</div>
//               </div>

//               {/* Messages */}
//               <div className="flex-1 overflow-y-auto p-4">
//                 {messages && messages.length > 0 ? (
//                   <div className="space-y-4">
//                     {messages.map((message, index) => {
//                       const currentUser = JSON.parse(localStorage.getItem('user'));
//                       const currentUserId = currentUser?.id || currentUser?.user?.id;
//                       const isCurrentUser = message.sender_id === currentUserId;

//                       return (
//                         <div
//                           key={message.id || index}
//                           className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
//                         >
//                           <div
//                             className={`max-w-[70%] rounded-lg px-4 py-2 ${isCurrentUser
//                               ? 'bg-blue-500 text-white'
//                               : 'bg-gray-100 text-gray-800'
//                               }`}
//                           >
//                             <p className="break-words">{message.message}</p>
//                             <span className="text-xs opacity-70 mt-1 block">
//                               {new Date(message.created_at).toLocaleTimeString()}
//                             </span>
//                           </div>
//                         </div>
//                       );
//                     })}
//                     <div ref={messagesEndRef} /> {/* For auto-scrolling */}
//                   </div>
//                 ) : (
//                   <div className="flex items-center justify-center h-full text-gray-500">
//                     No messages yet
//                   </div>
//                 )}
//               </div>

//               {/* Input */}
//               <div className="p-3 border-t">
//                 <div className="flex space-x-2">
//                   <input
//                     type="text"
//                     value={newMessage}
//                     onChange={(e) => setNewMessage(e.target.value)}
//                     placeholder="Type a message..."
//                     className="flex-1 p-2 border rounded-lg"
//                   />
//                   <button
//                     onClick={handleSendMessage}
//                     disabled={!isConnected || !newMessage.trim()}
//                     className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
//                   >
//                     Send
//                   </button>
//                 </div>
//               </div>
//             </>
//           ) : (
//             <div className="flex-1 flex items-center justify-center text-gray-500">
//               Select an employee to start chatting
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatBox;
