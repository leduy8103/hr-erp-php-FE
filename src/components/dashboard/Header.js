import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
import employeeService from '../../services/employeeService';
import notificationService from "../../services/notificationService";
import { useNavigate, Link } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const [currentUser, setCurrentUser] = useState({
    full_name: "User",
    role: "Employee",
    avatarURL: null,
  });
  const [loading, setLoading] = useState(true);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Fetch current user details from token
    const fetchUserData = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await employeeService.getCurrentUserProfile();
          if (userData && !userData.error) {
            console.log("Current user profile:", userData);
            setCurrentUser(userData);
            setError(null);
          } else {
            console.error("Invalid user data received:", userData);
            setError("Failed to load user profile");
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    // Fetch notifications for the current user
    const fetchNotifications = async () => {
      try {
        const notificationsData = await notificationService.getNotifications();
        if (Array.isArray(notificationsData)) {
          console.log("Notifications:", notificationsData);
          setNotifications(notificationsData);
        } else {
          console.error("Invalid notifications data:", notificationsData);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // Don't show error for notifications as it's not critical
      }
    };

    fetchUserData();
    fetchNotifications();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const getUserInitial = () => {
    console.log("Getting user initial for:", currentUser);
    if (currentUser.avatarURL) {
      return (
        <img
          src={currentUser.avatarURL}
          alt="User Avatar"
          className="w-10 h-10 rounded-full"
        />
      );
    } else {
      return currentUser.full_name
        ? currentUser.full_name.charAt(0).toUpperCase()
        : "U";
    }
  };

  const getFirstName = () => {
    return currentUser.full_name ? currentUser.full_name.split(" ")[0] : "User";
  };

  const handleNotificationClick = (link) => {
    navigate(link);
    setShowNotificationMenu(false);
  };

  if (error) {
    console.log("Rendering error state:", error);
  }

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold">Hello {getFirstName()} 👋</h1>
        <p className="text-sm text-gray-500">{greeting}</p>
      </div>

      <div className="flex items-center space-x-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm w-64"
          />
          <span className="material-icons absolute left-3 top-2 text-gray-400 text-sm">
            search
          </span>
        </div>

        <div className="relative">
          <button
            className="relative p-2 rounded-full hover:bg-gray-100"
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowUserMenu(false);
            }}>
            <span className="material-icons">notifications</span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {notifications.length}
            </span>
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg py-1 z-20">
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <span className="font-medium">Notifications</span>
                <span className="text-xs text-purple-600 cursor-pointer">
                  Mark all as read
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-gray-50 border-l-4 border-purple-500 cursor-pointer"
                    onClick={() => handleNotificationClick(notification.link)}>
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-gray-500">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.time}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-gray-100 text-center">
                <a href="#" className="text-sm text-purple-600">
                  View all notifications
                </a>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotificationMenu(false);
            }}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md">
              {getUserInitial()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">
                {loading ? "Loading..." : currentUser.full_name}
              </p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
            <span className="material-icons text-gray-400">expand_more</span>
          </div>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Profile
              </Link>
              <a
                href="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Settings
              </a>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;