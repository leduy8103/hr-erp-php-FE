import React, { useState, useEffect } from 'react';
import projectService from '../../services/projectService';
import authService from '../../services/authService';
import employeeService from '../../services/employeeService';

const CreateProjectModal = ({ isOpen, onClose, onProjectCreated, isEditing = false, projectData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    manager_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [currentManagerName, setCurrentManagerName] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchManagers();

      // If editing, initialize form with project data
      if (isEditing && projectData) {
        setFormData({
          name: projectData.name || "",
          description: projectData.description || "",
          start_date: projectData.start_date || "",
          end_date: projectData.end_date || "",
          manager_id: projectData.manager_id
            ? projectData.manager_id.toString()
            : "",
        });

        // Set current manager name if it exists
        if (projectData.managerName) {
          setCurrentManagerName(projectData.managerName);
        }
      }
    }
  }, [isOpen, isEditing, projectData]);

  const fetchManagers = async () => {
    try {
      setLoadingManagers(true);
      const token = authService.getToken();
      const managersData = await employeeService.getManagers(token);
      setManagers(managersData);
      console.log(managersData);
      setLoadingManagers(false);
    } catch (err) {
      console.error("Error fetching managers:", err);
      setError("Failed to load managers. Please try again.");
      setLoadingManagers(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Log manager_id when it changes
    if (name === "manager_id") {
      console.log("Selected manager_id:", value);
    }
  };

  const formatDateForDatabase = (dateString) => {
    if (!dateString) return null;
    // Create a date object and ensure it's in the correct timezone format
    const date = new Date(dateString);
    // Format using ISO string - the backend can parse this correctly
    return date.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const token = authService.getToken();

      // Validate manager_id format (adjusted to allow valid IDs)
      if (formData.manager_id && !/^[\w-]+$/.test(formData.manager_id)) {
        throw new Error(
          "Invalid manager ID format. Please select a valid manager."
        );
      }

      // Prepare project data
      const processedProjectData = {
        name: formData.name,
        description: formData.description,
        start_date: formatDateForDatabase(formData.start_date),
        end_date: formatDateForDatabase(formData.end_date),
        manager_id: formData.manager_id,
      };

      let result;
      if (isEditing) {
        console.log("Updating project:", projectData.id, processedProjectData);
        result = await projectService.updateProject(
          projectData.id,
          processedProjectData,
          token
        );
      } else {
        console.log("Creating new project:", processedProjectData);
        result = await projectService.createProject(
          processedProjectData,
          token
        );
      }

      // Fetch the manager's name to include with the project data
      if (result && result.manager_id) {
        try {
          const managerName = await employeeService.getEmployeeNameById(
            result.manager_id
          );
          result.managerName = managerName;
        } catch (nameError) {
          console.error("Error fetching manager name:", nameError);
        }
      }

      setLoading(false);
      onProjectCreated(result);
      onClose();
    } catch (err) {
      console.error(
        isEditing ? "Error updating project:" : "Error creating project:",
        err
      );
      setError(
        err.message ||
          (isEditing
            ? "Failed to update project. Please try again."
            : "Failed to create project. Please try again.")
      );
      setLoading(false);
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Update Project' : 'Create New Project'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="manager_id" className="block text-sm font-medium text-gray-700 mb-1">
                Project Manager
                {isEditing && currentManagerName && (
                  <span className="ml-2 text-sm text-gray-500">
                    (Current: {currentManagerName})
                  </span>
                )}
              </label>
              <select
                id="manager_id"
                name="manager_id"
                value={formData.manager_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a manager</option>
                {loadingManagers ? (
                  <option disabled>Loading managers...</option>
                ) : (
                  managers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.full_name || `${manager.first_name} ${manager.last_name}`}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                  {isEditing && formData.start_date && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({formatDateForDisplay(formData.start_date)})
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                  {isEditing && formData.end_date && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({formatDateForDisplay(formData.end_date)})
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Project' : 'Create Project')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
