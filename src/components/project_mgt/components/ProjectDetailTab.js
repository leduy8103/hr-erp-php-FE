import React from 'react';
import { getPriorityClass } from '../utils/styleUtils';

const ProjectDetailTab = ({ project, members, memberNames, formatDate }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
        {/* Project Description */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Project Description</h2>
        <p className="text-gray-700 mb-6 whitespace-pre-line">
          {project.description || 'No description provided.'}
        </p>

        <div className="border-t border-gray-200 my-6"></div>

        {/* Key Information */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Key Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ...existing date, category, and priority fields... */}
        </div>
      </div>
      
      {/* Team Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Team Members</h2>
        {/* ...existing team member preview... */}
      </div>
    </div>
  );
};

export default ProjectDetailTab;
