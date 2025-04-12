import React from 'react';

const EmployeeInfoForm = ({ formData, onChange }) => {
  const departments = [
    'HR', 'Finance', 'Marketing', 'Sales', 'Design', 
    'Development', 'Customer Support', 'Legal', 'Operations',
    'Product Management', 'Research'
  ];

  const positions = [
    'Manager', 'Team Lead', 'Senior Developer', 'Junior Developer',
    'UI/UX Designer', 'Marketing Specialist', 'Sales Representative',
    'HR Specialist', 'Accountant', 'Project Manager', 'Business Analyst',
    'Customer Support Specialist', 'QA Engineer'
  ];

  return (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <div>
        <div className="bg-blue-50 rounded-md p-4 mb-4">
          <h3 className="text-sm font-medium text-blue-800">Personal Information</h3>
          <p className="text-xs text-blue-600 mt-1">
            Basic employee personal details
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              name="full_name"
              value={formData.full_name}
              onChange={onChange}
              placeholder="Enter full name" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input 
              type="text" 
              name="mobile"
              value={formData.mobile}
              onChange={onChange}
              placeholder="Enter mobile number" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input 
              type="text" 
              name="address"
              value={formData.address}
              onChange={onChange}
              placeholder="Enter address" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
        </div>
      </div>

      {/* Professional Information Section */}
      <div>
        <div className="bg-blue-50 rounded-md p-4 mb-4">
          <h3 className="text-sm font-medium text-blue-800">Professional Information</h3>
          <p className="text-xs text-blue-600 mt-1">
            These details will be used for employee identification and department assignment
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
            <select 
              name="position"
              value={formData.position}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Position</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select 
              name="department"
              value={formData.department}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Hire Date</label>
            <input 
              type="date" 
              name="hire_date"
              value={formData.hire_date || ''}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeInfoForm;
