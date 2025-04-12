import React from 'react';
import { getStatusClass } from '../utils/styleUtils';

const ProjectSummary = ({ project, managerName, progress }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{project.name}</h1>
          <div className="flex items-center text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Manager: {managerName || 'Unassigned'}</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${Math.round(progress?.percentage || 0) === 100 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {Math.round(progress?.percentage || 0) === 100 ? 'Complete' : 'In Progress'}
        </span>
      </div>
      
      <div className="mt-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm font-bold">{Math.round(progress?.percentage || 0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${Math.round(progress?.percentage || 0)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSummary;
