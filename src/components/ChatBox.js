
import React, { useState, useEffect, useRef } from 'react';
import { getAllEmployees, getMessages } from '../services/chatService';
import authService from '../services/authService';

const ChatBox = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState({});
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {

    setUnreadCounts(loadUnreadCounts());
    // Đóng/mở chat box
    toggleChat();
    // Kết nối WebSocket
    initializeWebSocket();
    // Lấy thông tin user hiện tại
    const user = authService.getCurrentUser();
    console.log('Current user:', user); // Debug log
    setCurrentUser(user);

    // Lấy danh sách nhân viên
    fetchEmployees();

    return () => {
      // Clean up WebSocket connection
      if (socketRef.current) {
        socketRef.current.close(1000, 'Component unmounting');
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Load chat history khi chọn người nhận
  useEffect(() => {
    if (selectedEmployee) {
      loadChatHistory();
      markAsRead(selectedEmployee.id);
    } else {
      setMessages([]);
    }
  }, [selectedEmployee]);

  // Load danh sách nhân viên khi component mount
  useEffect(() => {
    const initializeChat = async () => {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      await fetchEmployees();
    };

    initializeChat();
  }, []);

  const initializeWebSocket = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const ws = new WebSocket('ws://localhost:8080');

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);

        // Send authentication message
        const userData = JSON.parse(localStorage.getItem('user'));
        const userId = userData?.id || userData?.user?.id;
        if (userId) {
          ws.send(JSON.stringify({
            type: 'join',
            userId: userId.toString() // Ensure userId is string
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received message:', data);
          handleIncomingMessage(data);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);

        // Only attempt to reconnect if not closed intentionally
        if (event.code !== 1000) {
          setTimeout(() => {
            console.log('Attempting to reconnect...');
            initializeWebSocket();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
        setIsConnected(false);
      };

      socketRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setError('Connection failed');
      setIsConnected(false);

      // Attempt to reconnect after error
      setTimeout(initializeWebSocket, 3000);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllEmployees();

      if (response.success) {
        // Get current user ID
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const currentUserId = currentUser?.id || currentUser?.user?.id;

        // Filter out current user and process the employee list
        const filteredEmployees = response.data
          .filter(emp => {
            // Remove current user and ensure employee has valid data
            return emp && emp.id && emp.id !== currentUserId;
          })
          .map(emp => ({
            id: emp.id.toString(),
            full_name: emp.full_name || 'Unknown User',
            position: emp.position || 'No position'
          }));

        console.log('Filtered employees:', filteredEmployees);
        setEmployees(filteredEmployees);
      } else {
        setError('Không thể tải danh sách nhân viên');
      }
    } catch (error) {
      setError('Lỗi khi tải danh sách nhân viên');
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    // Lấy lại thông tin user hiện tại từ localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    const currentUserId = userData?.id || userData?.user?.id;

    if (!newMessage.trim() || !selectedEmployee || !currentUserId) {
      console.warn("Cannot send message - missing data:", {
        message: newMessage,
        selectedEmployee,
        currentUserId,
      });
      return;
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }

    const messageData = {
      type: 'message',
      sender_id: currentUserId, // Sử dụng ID từ localStorage thay vì currentUser.id
      receiver_id: selectedEmployee.id,
      message: newMessage.trim(),
      created_at: new Date().toISOString()
    };

    try {
      console.log('Sending message:', messageData); // Debug log
      socketRef.current.send(JSON.stringify(messageData));
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadChatHistory = async () => {
    if (!selectedEmployee) {
      console.warn('No employee selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userData = JSON.parse(localStorage.getItem('user'));
      const currentUserId = userData?.id || userData?.user?.id;

      const response = await getMessages(currentUserId, selectedEmployee.id);

      console.log('Response data in loadChatHistory:', response.data); // Debug log

      // Adjust based on the actual structure of response.data
      const messagesArray = Array.isArray(response.data)
        ? response.data
        : response.data?.messages || response.data?.data;

      if (messagesArray && Array.isArray(messagesArray)) {
        const processedMessages = messagesArray.map(msg => ({
          type: 'message',
          id: msg.id,
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id,
          message: msg.message,
          created_at: msg.created_at,
          isCurrentUser: msg.sender_id === currentUserId
        }));

        setMessages(processedMessages);
        scrollToBottom();
      } else {
        console.error('Failed to load chat history: Invalid data format');
        setError('Invalid data format');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError('Error loading chat history');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const saveUnreadCounts = (counts) => {
    localStorage.setItem('unreadChatCounts', JSON.stringify(counts));
  };

  const loadUnreadCounts = () => {
    const saved = localStorage.getItem('unreadChatCounts');
    return saved ? JSON.parse(saved) : {};
  };

  const handleIncomingMessage = (data) => {
    if (data.type === 'message') {
      const userData = JSON.parse(localStorage.getItem('user'));
      const currentUserId = (userData?.id || userData?.user?.id)?.toString();
  
      // Only process unread count if current user is the receiver
      if (data.receiver_id === currentUserId) {
        if (selectedEmployee?.id === data.sender_id) {
          // If chatting with sender, add message and mark as read
          setMessages(prev => [...prev, {
            ...data,
            isCurrentUser: false
          }]);
          setUnreadCounts(prev => ({
            ...prev,
            [data.sender_id]: 0
          }));
          scrollToBottom();
        } else {
          // If not chatting with sender, increment unread count
          setUnreadCounts(prev => ({
            ...prev,
            [data.sender_id]: (prev[data.sender_id] || 0) + 1
          }));
        }
        saveUnreadCounts(unreadCounts);
      } else {
        // If current user is sender, just add message to chat if relevant
        if (selectedEmployee?.id === data.receiver_id) {
          setMessages(prev => [...prev, {
            ...data,
            isCurrentUser: true
          }]);
          scrollToBottom();
        }
      }
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }
  };

  const markAsRead = (employeeId) => {
    setUnreadCounts(prev => {
      const newCounts = {
        ...prev,
        [employeeId]: 0
      };
      saveUnreadCounts(newCounts); // Save to localStorage
      return newCounts;
    });
  };

  const getTotalUnreadCount = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    const currentUserId = (userData?.id || userData?.user?.id)?.toString();
    
    return Object.entries(unreadCounts).reduce((sum, [senderId, count]) => {
      // Only count messages where current user is the receiver
      const message = messages.find(m => m.sender_id === senderId);
      if (message && message.receiver_id === currentUserId) {
        return sum + (count || 0);
      }
      return sum;
    }, 0);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fixed bottom-4 right-4 ${isOpen ? 'h-[600px]' : 'h-[48px]'} 
      w-[400px] bg-white rounded-lg shadow-lg flex flex-col transition-all duration-300 ease-in-out
      border-2 border-purple-500`}>

      {/* Header với nút đóng/mở */}
      <div className="p-4 border-b border-purple-200 flex justify-between items-center bg-purple-50 relative">
        <div className="flex items-center">
          <div className="relative">
            <h3 className="text-lg font-semibold text-purple-700">Chat</h3>
            {isOpen && getTotalUnreadCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs 
              rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalUnreadCount()}
              </span>
            )}
          </div>
          <div className="text-sm text-purple-500 ml-2">
            {isConnected ? 'Connected' : 'Connecting...'}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {error && <div className="text-red-500 text-sm mr-2">{error}</div>}
          <button
            onClick={toggleChat}
            className="p-1 hover:bg-purple-100 rounded-full transition-colors duration-150"
          >
            <svg
              className={`w-6 h-6 text-purple-600 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Chat content - chỉ hiển thị khi isOpen = true */}
      {isOpen && (
        <div className="flex flex-1 overflow-hidden">
          {/* Employee List Section */}
          <div className="w-[150px] border-r border-purple-100 flex flex-col">
            {/* Search Bar */}
            <div className="p-2 border-b border-purple-100">
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 text-sm border rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Rest of the employee list code remains the same, just update some colors */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
                </div>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map(emp => (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`p-2 cursor-pointer hover:bg-purple-50 transition-colors duration-150 relative
                      ${selectedEmployee?.id === emp.id ? 'bg-purple-100 border-l-4 border-purple-500' : ''}`}
                  >
                    <div className="font-medium text-sm truncate">
                      {emp.full_name}
                      {unreadCounts[emp.id] > 0 && (
                        <span className="absolute right-2 top-2 bg-red-500 text-white text-xs 
                          rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCounts[emp.id]}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {emp.position}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No employees found
                </div>
              )}
            </div>
          </div>

          {/* Chat Area - update colors */}
          <div className="flex-1 flex flex-col">
            {selectedEmployee ? (
              <>
                <div className="p-3 border-b bg-purple-50">
                  <div className="font-medium">{selectedEmployee.full_name}</div>
                  <div className="text-xs text-gray-500">{selectedEmployee.position}</div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages && messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((message, index) => {
                        const isCurrentUser = message.sender_id === (currentUser?.id || currentUser?.user?.id);
                        return (
                          <div
                            key={`${message.sender_id}-${message.created_at}-${index}`}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm
                              ${isCurrentUser
                                  ? 'bg-blue-500 text-white rounded-br-none'
                                  : 'bg-white text-gray-800 rounded-bl-none'}`}
                            >
                              <p className="break-words text-sm">{message.message}</p>
                              <span className="text-[10px] opacity-70 mt-1 block">
                                {new Date(message.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                      No messages yet
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-3 border-t bg-white">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 p-2 text-sm border rounded-lg focus:outline-none focus:border-purple-500"
                      disabled={!isConnected || !selectedEmployee}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!isConnected || !newMessage.trim() || isSending || !selectedEmployee}
                      className="px-4 py-2 bg-purple-500 text-white text-sm rounded-lg disabled:opacity-50 
                        hover:bg-purple-600 transition-colors duration-150"
                    >
                      {isSending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        'Send'
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto text-purple-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Select an employee to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
