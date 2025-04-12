import React, { useState } from 'react';
import BaseModal from './BaseModal';

const FilterModal = ({ isOpen, onRequestClose, onApply }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const departments = [
    'Design', 'HR', 'Sales', 'Development', 'Marketing', 'Business Analyst', 
    'Project Manager', 'Java', 'Python', 'React JS', 'Account', 'Node JS'
  ];
  
  const statuses = ['Permanent', 'Contract', 'Intern'];

  const handleDepartmentChange = (department) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((d) => d !== department)
        : [...prev, department]
    );
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedDepartments([]);
    setSelectedType('');
    setSelectedStatus('');
  };

  const handleApply = () => {
    onApply({ 
      searchTerm, 
      selectedDepartments, 
      selectedType,
      selectedStatus 
    });
    onRequestClose();
  };

  return (
    <BaseModal isOpen={isOpen} onRequestClose={onRequestClose} title="Filter Employees">
      <div className="space-y-6">
        {/* Search box with icon */}
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, id, department..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* Department selection with badge UI */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <svg className="h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Department
          </h4>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {departments.map((department) => (
              <button
                key={department}
                onClick={() => handleDepartmentChange(department)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                  selectedDepartments.includes(department) 
                    ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {department}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Work Type */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg className="h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1v1a1 1 0 01-2 0v-1H7v1a1 1 0 01-2 0v-1a1 1 0 01-1-1V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
              </svg>
              Work Type
            </h4>
            <div className="flex flex-col space-y-2">
              <label className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200 ${selectedType === 'Office' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="type"
                  value="Office"
                  checked={selectedType === 'Office'}
                  onChange={() => setSelectedType('Office')}
                  className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2 text-sm text-gray-700">Office</span>
              </label>
              <label className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-200 ${selectedType === 'Remote' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}>
                <input
                  type="radio"
                  name="type"
                  value="Remote"
                  checked={selectedType === 'Remote'}
                  onChange={() => setSelectedType('Remote')}
                  className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2 text-sm text-gray-700">Remote</span>
              </label>
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg className="h-5 w-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Status
            </h4>
            <div className="flex space-x-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(selectedStatus === status ? '' : status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-200 ${
                    selectedStatus === status 
                      ? status === 'Permanent' ? 'bg-green-100 text-green-800 ring-1 ring-green-600' 
                      : status === 'Contract' ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-600'
                      : 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center focus:outline-none"
            onClick={handleClearFilters}
          >
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Filters
          </button>
          <div className="space-x-3">
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={onRequestClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleApply}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default FilterModal;