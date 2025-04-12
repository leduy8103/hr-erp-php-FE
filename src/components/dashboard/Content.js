import React from 'react';
import AdminDashboard from "./role-dashboards/AdminDashboard";
import ManagerDashboard from "./role-dashboards/ManagerDashboard";
import AccountDashboard from "./role-dashboards/AccountDashboard";
import EmployeeDashboard from "./role-dashboards/EmployeeDashboard";

const Content = ({ userRole }) => {
  const renderDashboard = () => {
    switch (userRole) {
      case "Admin":
        return <AdminDashboard />;
      case "Manager":
        return <ManagerDashboard />;
      case "Account":
        return <AccountDashboard />;
      case "Employee":
        return <EmployeeDashboard />;
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {renderDashboard()}
    </main>
  );
};

export default Content;
