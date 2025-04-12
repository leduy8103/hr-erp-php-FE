import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { FaSearch, FaCalendarAlt, FaCheck, FaTimes, FaBuilding } from 'react-icons/fa';
import taskService from '../../services/taskService';
import authService from '../../services/authService';
import employeeService from '../../services/employeeService';
import projectService from '../../services/projectService';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [projectNames, setProjectNames] = useState({});
  
  const userId = authService.getUserIdFromToken();
  const token = authService.getToken();
  
  const [editingId, setEditingId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [tempEditValue, setTempEditValue] = useState('');
  const [updatingTask, setUpdatingTask] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        setLoading(true);
        
        // Use the correct method from taskService
        const allTasks = await taskService.getTasksByUser(userId, token);
        setTasks(allTasks);
        
        // Fetch project names for all the tasks
        const projectIds = [...new Set(allTasks.map(task => task.project_id))];
        const projectNamesMap = {};
        
        for (const projectId of projectIds) {
          try {
            const projectData = await projectService.getProjectById(projectId, token);
            projectNamesMap[projectId] = projectData.name;
          } catch (err) {
            console.error(`Failed to fetch project name for project ${projectId}:`, err);
            projectNamesMap[projectId] = 'Unknown Project';
          }
        }
        
        setProjectNames(projectNamesMap);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError('Failed to load your tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchMyTasks();
    }
  }, [userId, token]);

  // Filter tasks based on search and status
  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === '' || task.status === filterStatus;
    const matchesSearch = !searchTerm || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projectNames[task.project_id]?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Start editing a field
  const startEditing = (taskId, field, value) => {
    // Only allow editing status field
    if (field !== 'status') return;
    
    setEditingId(taskId);
    setEditingField(field);
    setTempEditValue(value);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditingField(null);
    setTempEditValue('');
  };

  // Handle field changes
  const handleFieldChange = (e) => {
    setTempEditValue(e.target.value);
  };

  // Save the edited field
  const saveField = async (taskId) => {
    if (updatingTask) return;
    
    try {
      setUpdatingTask(true);
      const token = authService.getToken();
      
      let updatedTask;
      
      if (editingField === 'status') {
        updatedTask = await taskService.updateTaskStatus(taskId, { status: tempEditValue }, token);
      }
      
      if (updatedTask) {
        setTasks(prevTasks => 
          prevTasks.map(t => t.id === taskId ? updatedTask : t)
        );
      }
      
      setEditingId(null);
      setEditingField(null);
      setTempEditValue('');
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert('Failed to update task status. Please try again.');
    } finally {
      setUpdatingTask(false);
    }
  };

  // Priority style helper
  const getPriorityClass = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRowClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Spinner animation="border" variant="primary" />
        <p className="ml-3 mt-2">Loading your tasks...</p>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-red-600 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Tasks</h1>
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks or projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 mb-4">No tasks have been assigned to you yet.</p>
          <p className="text-gray-400">Tasks assigned to you from any project will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr 
                    key={task.id} 
                    className="hover:bg-gray-50 cursor-pointer transition duration-150"
                    onClick={() => handleRowClick(task.id)}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 hover:text-blue-600">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaBuilding className="text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">
                          {projectNames[task.project_id] || 'Unknown Project'}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingId === task.id && editingField === 'status' ? (
                        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={tempEditValue}
                            onChange={handleFieldChange}
                            className="w-full py-1 px-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                          <div className="flex ml-2">
                            <button 
                              className="p-1 text-green-600 hover:text-green-800"
                              onClick={() => saveField(task.id)}
                              disabled={updatingTask}
                            >
                              <FaCheck size={16} />
                            </button>
                            <button 
                              className="p-1 text-red-600 hover:text-red-800"
                              onClick={cancelEditing}
                            >
                              <FaTimes size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="text-sm cursor-pointer hover:bg-gray-100 p-1 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(task.id, 'status', task.status);
                          }}
                        >
                          {task.status.replace('_', ' ')}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${getPriorityClass(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-700">
                        <FaCalendarAlt className="mr-2 text-gray-400" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
