import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProjectList from '../components/project_mgt/ProjectList';
import ProjectDetails from '../components/project_mgt/ProjectDetails';
import Layout from '../components/Layout';

const Project = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/:projectId" element={<ProjectDetails />} />
        {/* Add more project-related routes as needed */}
      </Routes>
    </Layout>
  );
};

export default Project;
