import React from 'react';
import { useNavigate } from 'react-router-dom';

const Forbiden = ({ message }) => {
  const navigate = useNavigate();
  
  const defaultMessage = "You don't have permission to access this page";
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <span className="material-icons text-red-500 text-5xl">block</span>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p className="text-gray-600 text-center max-w-md mb-8">
        {message || defaultMessage}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
        >
          <span className="material-icons mr-2 text-sm">dashboard</span>
          Go to Dashboard
        </button>
        
        <button 
          onClick={() => navigate(-1)} 
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
        >
          <span className="material-icons mr-2 text-sm">arrow_back</span>
          Go Back
        </button>
      </div>
      
      <div className="mt-12 text-sm text-gray-500">
        If you believe this is an error, please contact your administrator.
      </div>
    </div>
  );
};

export default Forbiden;
