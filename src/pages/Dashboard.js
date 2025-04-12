// filepath: d:\React\hr-erp-frontend\src\pages\Dashboard.js
import React from 'react';
import Layout from '../components/Layout';
import Content from '../components/dashboard/Content';

const Dashboard = () => {
  const mapRole = (rawRole) => {
    if (!rawRole) return "Employee";

    const roleMap = {
      ADMIN: "Admin",
      MANAGER: "Manager",
      ACCOUNT: "Account",
      ACCOUNTANT: "Account",
      EMPLOYEE: "Employee",
    };

    const upperRole = rawRole.toUpperCase();
    return roleMap[upperRole] || "Employee";
  };

  const getUserRole = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const rawRole = userData.user?.role || userData.role;
      const mappedRole = mapRole(rawRole);
      console.log("Detected role:", rawRole, "Mapped to:", mappedRole);
      return mappedRole;
    } catch (error) {
      console.error("Error getting user role:", error);
      return "Employee";
    }
  };

  return (
    <Layout>
      <Content userRole={getUserRole()} />
    </Layout>
  );
};

export default Dashboard;