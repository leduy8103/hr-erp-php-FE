import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import EmployeeProfile from '../components/employee/EmployeeProfile';

const UserProfilePage = () => {
  const { id } = useParams();
  
  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            {id ? 'Employee Profile' : 'My Profile'}
          </h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <EmployeeProfile />
        </div>
      </div>
    </Layout>
  );
};

export default UserProfilePage;