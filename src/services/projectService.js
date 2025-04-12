import api from './api';

const API_URL = '/api/project';

const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

const createProject = async (projectData, token) => {
  try {
    console.log("Creating project with data:", projectData);
    
    const response = await api.post(API_URL, projectData, getAuthHeaders(token));
    
    // Add validation to check if manager_id was respected
    if (projectData.manager_id && response.data.manager_id !== projectData.manager_id) {
      console.log("Backend override detected. Manager ID in response doesn't match request.");
      
      // If we have permissions, try to update the project to fix the manager
      if (projectData.manager_id) {
        console.log("Attempting to update project manager...");
        const updateResponse = await api.put(
          `${API_URL}/${response.data.id}`, 
          { manager_id: projectData.manager_id },
          getAuthHeaders(token)
        );
        console.log("Update project manager response:", updateResponse.data);
        return updateResponse.data;
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error.response?.data || error.message);
    throw error;
  }
};

const updateProject = async (id, projectData, token) => {
  const response = await api.put(`${API_URL}/${id}`, projectData, getAuthHeaders(token));
  return response.data;
};

const deleteProject = async (id, token) => {
  const response = await api.put(`${API_URL}/${id}/delete`, {}, getAuthHeaders(token));
  return response.data;
};

const getProjects = async (token) => {
  const response = await api.get(API_URL, getAuthHeaders(token));
  return response.data;
};

const getProjectById = async (id, token) => {
  const response = await api.get(`${API_URL}/${id}`, getAuthHeaders(token));
  return response.data;
};

const getProjectByName = async (name, token) => {
  const response = await api.get(`${API_URL}/name?name=${encodeURIComponent(name)}`, getAuthHeaders(token));
  return response.data;
};

const getProjectByManager = async (managerId, token) => {
  const response = await api.get(`${API_URL}/manager/${managerId}`, getAuthHeaders(token));
  return response.data;
};

const getProjectProgress = async (id, token) => {
  const response = await api.get(`${API_URL}/${id}/progress`, getAuthHeaders(token));
  return response.data;
};

const addProjectMember = async (memberData, token) => {
  const response = await api.post('/api/project-member', memberData, getAuthHeaders(token));
  return response.data;
};

const removeProjectMember = async (memberData, token) => {
  const response = await api.delete('/api/project-member', {
    headers: {
      Authorization: `Bearer ${token}`
    },
    data: memberData
  });
  return response.data;
};

const getProjectMembers = async (projectId, token) => {
  const response = await api.get(`/api/project-member/${projectId}`, getAuthHeaders(token));
  return response.data;
};

const getAllMembers = async (token) => {
  const response = await api.get('/api/project-member', getAuthHeaders(token));
  return response.data;
};

const getProjectsByMember = async (userId, token) => {
  const response = await api.get(`/api/project-member/user/${userId}`, getAuthHeaders(token));
  return response.data;
};

const calculateProjectProgress = async (projectId, token) => {
  const tasksResponse = await api.get(`/api/task/project/${projectId}`, getAuthHeaders(token));
  const tasks = tasksResponse.data;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const progress = (completedTasks / tasks.length) * 100;
  return progress;
};

const getProjectNameById = async (id, token) => {
  try {
    const project = await getProjectById(id, token);
    return project.name;
  } catch (error) {
    console.error('Error getting project name:', error);
    throw error;
  }
};

// Add other project-related API calls as needed

export default {
  createProject,
  updateProject,
  deleteProject,
  getProjects,
  getProjectById,
  getProjectByName,
  getProjectByManager,
  getProjectProgress,
  addProjectMember,
  removeProjectMember,
  getProjectMembers,
  getAllMembers,
  getProjectsByMember,
  calculateProjectProgress,
  getProjectNameById
};
