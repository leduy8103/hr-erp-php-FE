import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import authService from "../../services/authService";

const Sidebar = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [userRole, setUserRole] = useState("employee"); // Default role
  const [openSubMenu, setOpenSubMenu] = useState(null);

  useEffect(() => {
    // Get user role from token
    const token = authService.getToken();
    if (token) {
      const decodedToken = authService.decodeToken(token);
      if (decodedToken && decodedToken.role) {
        setUserRole(decodedToken.role.toLowerCase());
      }
    }
  }, []);

  const isAdminOrManager = () => {
    return userRole === "admin" || userRole === "manager";
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: "dashboard",
      path: "/dashboard",
      roles: ["admin", "manager", "employee"],
    },
    {
      title: "All Employees",
      icon: "people",
      path: "/employees",
      roles: ["admin"],
    },
    {
      title: "My Tasks",
      icon: "task_alt",
      path: "/my-tasks",
      roles: ["employee", "manager"],
    },
    {
      title: "Attendance",
      icon: "schedule",
      path: "/attendance",
      roles: ["admin", "manager", "employee"],
    },
    { title: "Payroll", icon: "payments", path: "/payroll", roles: ["admin"] },
    {
      title: "Projects",
      icon: "work",
      path: "/projects",
      roles: ["admin", "manager"],
    },
    {
      title: "Leaves",
      icon: "event",
      path: null,
      roles: ["admin", "manager", "employee"],
      subItems: [
        { title: "Leave Request", path: "/leave-request" },
        ...(isAdminOrManager()
          ? [{ title: "Leave Approval", path: "/leave-approval" }]
          : []),
      ],
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) =>
    item.roles ? item.roles.includes(userRole) : false
  );

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // You would implement actual theme switching logic here
  };

  const toggleSubMenu = (title) => {
    if (openSubMenu === title) {
      setOpenSubMenu(null);
    } else {
      setOpenSubMenu(title);
    }
  };

  return (
    <div className="w-64 bg-white text-gray-700 h-full flex-shrink-0 flex flex-col border-r border-gray-200 shadow-sm">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-center">
          <span className="material-icons text-purple-600 text-3xl mr-2">
            people
          </span>
          <span className="text-xl font-bold tracking-wider text-gray-800">
            HR ERP
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          {filteredMenuItems.map((item, index) => {
            const isActive = item.path
              ? location.pathname === item.path
              : item.subItems &&
                item.subItems.some(
                  (subItem) => location.pathname === subItem.path
                );
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <li key={index}>
                {hasSubItems ? (
                  <div>
                    <button
                      onClick={() => toggleSubMenu(item.title)}
                      className={`w-full px-5 py-3 flex items-center justify-between ${
                        isActive
                          ? "bg-purple-50 text-purple-700"
                          : "hover:bg-gray-50"
                      } transition-colors duration-200`}>
                      <div className="flex items-center">
                        <span
                          className={`material-icons mr-3 ${
                            isActive ? "text-purple-600" : "text-gray-500"
                          }`}>
                          {item.icon}
                        </span>
                        <span
                          className={`${
                            isActive
                              ? "font-medium text-purple-700"
                              : "text-gray-700"
                          }`}>
                          {item.title}
                        </span>
                      </div>
                      <span
                        className={`material-icons text-sm transition-transform duration-200 ${
                          openSubMenu === item.title ? "rotate-180" : ""
                        } ${isActive ? "text-purple-600" : "text-gray-500"}`}>
                        expand_more
                      </span>
                    </button>

                    {openSubMenu === item.title && (
                      <ul className="bg-gray-50 py-2">
                        {item.subItems.map((subItem, subIndex) => {
                          const isSubActive =
                            location.pathname === subItem.path;
                          return (
                            <li key={subIndex}>
                              <Link
                                to={subItem.path}
                                className={`pl-12 pr-5 py-2 flex items-center ${
                                  isSubActive
                                    ? "text-purple-700"
                                    : "text-gray-600 hover:text-purple-700"
                                } transition-colors duration-200`}>
                                <span className="text-sm">{subItem.title}</span>
                                {isSubActive && (
                                  <span className="ml-auto h-2 w-2 rounded-full bg-purple-500"></span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`px-5 py-3 flex items-center ${
                      isActive
                        ? "bg-purple-50 text-purple-700"
                        : "hover:bg-gray-50"
                    } transition-colors duration-200`}>
                    <span
                      className={`material-icons mr-3 ${
                        isActive ? "text-purple-600" : "text-gray-500"
                      }`}>
                      {item.icon}
                    </span>
                    <span
                      className={`${
                        isActive
                          ? "font-medium text-purple-700"
                          : "text-gray-700"
                      }`}>
                      {item.title}
                    </span>
                    {isActive && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-purple-500"></span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-5 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-700">Theme</span>
          <button
            onClick={toggleTheme}
            className="relative inline-flex items-center h-6 rounded-full w-12 bg-gray-200">
            <span className="sr-only">Toggle theme</span>
            <span
              className={`${
                darkMode ? "translate-x-6" : "translate-x-1"
              } inline-block w-4 h-4 transform bg-white shadow rounded-full transition-transform duration-200 ease-in-out`}></span>
          </button>
        </div>
        <div className="text-xs text-gray-500 text-center">
          v1.0.0 | © 2023 HR ERP
        </div>
      </div>
    </div>
  );
};

export default Sidebar;