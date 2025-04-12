// filepath: d:\React\hr-erp-frontend\src\App.js
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./pages/Dashboard";
import AllEmployees from "./pages/AllEmployee";
import UserProfilePage from "./pages/UserProfilePage";
import Project from "./pages/Project";
import MyTasksPage from "../src/pages/MyTasksPage";
import Forbiden from "./components/common/Forbiden";
import authService from "./services/authService";
import LeaveRequestPage from "./pages/LeaveRequestPage";
import LeaveApprovalPage from "./pages/LeaveApprovalPage";
import AttendancePage from "./pages/Attendance";
import PayrollPage from "./pages/PayrollPage";
import ChatBox from './components/ChatBox';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/common/ThemeToggle';
import ResetPasswordForm from './components/employee/ResetPasswordForm';
import EmployeeProfile from './components/employee/EmployeeProfile';
import TaskDetailPage from "./pages/TaskDetailPage";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import projectAccessPermission from './utils/projectAccessPermission';
import { hasRole, isAdminOrManager, isAdminOrAccountant } from './utils/permissionCheck';
import ForgotPassword from "./components/ForgotPassword";

const AuthenticatedLayout = ({ children }) => {
  return (
    <>
      {children}
      <ChatBox />
    </>
  );
};

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [projectAccess, setProjectAccess] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log("Current user data:", userData);

        const role = userData.user?.role || userData.role;
        console.log("Detected user role:", role);
        console.log(
          "Is admin or manager check:",
          role === "Admin" || role === "Manager"
        );
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      console.log("No user data in localStorage");
    }

    const checkProjectAccess = async () => {
      if (isAuthenticated()) {
        const hasAccess = await projectAccessPermission();
        setProjectAccess(hasAccess);
      }
    };

    if (isAuthenticated()) {
      checkProjectAccess();
    }
  }, []);

  const isAuthenticated = () => {
    const isAuth = !!localStorage.getItem("user");
    console.log("isAuthenticated check result:", isAuth);
    return isAuth;
  };

  return (
    <ThemeProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={5000} />
        <div className="min-h-screen bg-background text-foreground">
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/dashboard"
              element={
                isAuthenticated() ? (
                  <AuthenticatedLayout>
                    <Dashboard />
                  </AuthenticatedLayout>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/my-tasks"
              element={
                isAuthenticated() ? <MyTasksPage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/employees"
              element={
                isAuthenticated() ? (
                  hasRole("Admin") ? (
                    <AllEmployees />
                  ) : (
                    <Forbiden message="Only administrators can access employee management." />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/leave-request"
              element={
                isAuthenticated() ? (
                  <LeaveRequestPage />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/leave-approval"
              element={
                isAuthenticated() ? (
                  isAdminOrManager() ? (
                    <LeaveApprovalPage />
                  ) : (
                    <Forbiden message="Only managers and administrators can approve leave requests." />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/payroll"
              element={
                isAuthenticated() ? (
                  isAdminOrAccountant() ? (
                    <PayrollPage />
                  ) : (
                    <Forbiden message="Only accountants and administrators can access payroll information." />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/projects/*"
              element={
                isAuthenticated() ? (
                  projectAccess ? (
                    <Project />
                  ) : (
                    <Forbiden message="You don't have access to project management." />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/profile"
              element={
                isAuthenticated() ? (
                  <UserProfilePage />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/profile/:id"
              element={
                isAuthenticated() ? (
                  <UserProfilePage />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/attendance"
              element={
                isAuthenticated() ? (
                  <AttendancePage />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/reset-password" element={<ResetPasswordForm />} />
            <Route path="/employee/:id" element={<EmployeeProfile />} />
            <Route 
              path="/tasks/:taskId" 
              element={
                isAuthenticated() ? (
                  <TaskDetailPage />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;