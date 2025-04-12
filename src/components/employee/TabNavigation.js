import React from 'react';

const TabNavigation = ({ activeTab, tabs, onTabChange }) => {
  return (
    <div className="flex space-x-4 mb-6 border-b">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`px-4 py-3 ${activeTab === tab.id ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;