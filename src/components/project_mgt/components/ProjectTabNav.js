import React from 'react';

const ProjectTabNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'team', label: 'Team Members' },
    { id: 'tasks', label: 'Tasks' }
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            className={`py-3 px-6 border-b-2 font-medium text-sm ${
              activeTab === tab.id 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProjectTabNav;
