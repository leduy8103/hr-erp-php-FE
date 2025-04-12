// filepath: d:\React\hr-erp-frontend\src\pages\AllEmployee.js
import React from 'react';
import Layout from '../components/Layout';
import EmployeeTable from '../components/employee/EmployeeTable';

const AllEmployees = () => {
  return (
    <Layout>
      <EmployeeTable />
    </Layout>
  );
};

export default AllEmployees;