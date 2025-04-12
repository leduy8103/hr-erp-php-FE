import React from 'react';

const ProjectHeader = ({ onBack, onEdit, onDelete, isManager }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <button 
        className="flex items-center text-blue-600 hover:text-blue-800" 
        onClick={onBack}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Projects
      </button>
      
      {isManager && (
        <div className="space-x-3">
          <button 
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={onEdit}
          >
            Edit Project
          </button>
          <button 
            className="px-4 py-2 border border-red-500 rounded text-red-500 hover:bg-red-50 transition-colors"
            onClick={onDelete}
          >
            Delete Project
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectHeader;
