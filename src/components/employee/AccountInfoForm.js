import React, { useState, useEffect } from 'react';
import employeeService from '../../services/employeeService';

const AccountInfoForm = ({ formData, onChange }) => {
  const [emailStatus, setEmailStatus] = useState({ isValid: true, isAvailable: true, message: '' });
  const [emailCheckTimeout, setEmailCheckTimeout] = useState(null);
  const [existingEmails, setExistingEmails] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employees = await employeeService.getEmployees();
        const emails = employees.map(emp => emp.email.toLowerCase());
        setExistingEmails(emails);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailAvailability = async (email) => {
    if (!email || !validateEmail(email)) {
      setEmailStatus({
        isValid: false,
        isAvailable: false,
        message: 'Please enter a valid email address'
      });
      return;
    }

    // Check against existing emails
    const isAvailable = !existingEmails.includes(email.toLowerCase());
    setEmailStatus({
      isValid: true,
      isAvailable: isAvailable,
      message: isAvailable ? 'Email is available' : 'Email already exists'
    });
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    onChange(e);

    // Clear previous timeout
    if (emailCheckTimeout) {
      clearTimeout(emailCheckTimeout);
    }

    // Set new timeout for email check (debounce)
    setEmailCheckTimeout(
      setTimeout(() => {
        checkEmailAvailability(email);
      }, 500)
    );
  };

  // Function to get input status classes
  const getEmailInputClasses = () => {
    const baseClasses = "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ";
    
    if (!formData.email) return baseClasses + "border-gray-300 focus:ring-blue-500";
    if (!emailStatus.isValid) return baseClasses + "border-red-500 focus:ring-red-500";
    if (!emailStatus.isAvailable) return baseClasses + "border-red-500 focus:ring-red-500";
    return baseClasses + "border-green-500 focus:ring-green-500";
  };

  // Function to generate a strong 8-character password
  const generateRandomPassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    // Ensure at least one from each category
    let password = [
      lowercase[Math.floor(Math.random() * lowercase.length)],
      uppercase[Math.floor(Math.random() * uppercase.length)],
      numbers[Math.floor(Math.random() * numbers.length)],
      special[Math.floor(Math.random() * special.length)]
    ];
    
    // Complete the rest of the password (4 more characters)
    const allChars = lowercase + uppercase + numbers + special;
    for (let i = password.length; i < 8; i++) {
      password.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }
    
    // Shuffle the password array
    password = password.sort(() => Math.random() - 0.5).join('');
    
    // Update the password in the form data
    onChange({
      target: {
        name: 'password',
        value: password
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-md p-4 mb-4">
        <h3 className="text-sm font-medium text-blue-800">Account Information</h3>
        <p className="text-xs text-blue-600 mt-1">
          These details will be used for system access and authentication
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Employee ID removed from UI but still in formData */}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            name="email"
            value={formData.email || ''}
            onChange={handleEmailChange}
            placeholder="Enter email address" 
            className={getEmailInputClasses()}
          />
          {formData.email && (
            <p className={`mt-1 text-xs ${
              !emailStatus.isValid || !emailStatus.isAvailable 
                ? 'text-red-500' 
                : 'text-green-500'
            }`}>
              {emailStatus.message}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select 
            name="role"
            value={formData.role}
            onChange={onChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select role</option>
            <option value="Admin">Admin</option>
            <option value="Employee">Employee</option>
            <option value="Manager">Manager</option>
            <option value="Account">Account</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="flex space-x-2">
            <input 
              type="text" 
              name="password"
              value={formData.password || ''}
              onChange={onChange}
              placeholder="Enter password" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
            <button
              type="button"
              onClick={generateRandomPassword}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
            >
              Generate Password
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">Password will be generated with 8 random characters.</p>
        </div>
      </div>
      
      {/* <div className="mt-4 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Account Settings</h4>
        <div className="flex items-center">
          <input
            id="active-account"
            type="checkbox"
            name="isActive"
            checked={formData.isActive !== false}
            onChange={(e) => onChange({
              target: {
                name: 'isActive',
                value: e.target.checked
              }
            })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="active-account" className="ml-2 block text-sm text-gray-700">
            Activate account immediately
          </label>
        </div>
      </div> */}
    </div>
  );
};

export default AccountInfoForm;