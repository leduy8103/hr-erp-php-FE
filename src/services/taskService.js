import api from './api';

const API_URL = '/api/task';

const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
});

const createTask = async (taskData, token) => {
  const response = await api.post(API_URL, taskData, getAuthHeaders(token));
  return response.data;
};

const assignTask = async (id, assignData, token) => {
  const response = await api.put(`${API_URL}/${id}/assign`, assignData, getAuthHeaders(token));
  return response.data;
};

const updateTaskStatus = async (id, statusData, token) => {
  const response = await api.put(`${API_URL}/${id}/status`, statusData, getAuthHeaders(token));
  return response.data;
};

const updateTaskPriority = async (id, priorityData, token) => {
  const response = await api.put(`${API_URL}/${id}/priority`, priorityData, getAuthHeaders(token));
  return response.data;
};

const getTasks = async (token) => {
  const response = await api.get(API_URL, getAuthHeaders(token));
  return response.data;
};

const getTaskById = async (id, token) => {
  const response = await api.get(`${API_URL}/${id}`, getAuthHeaders(token));
  return response.data;
};

const getTasksByProject = async (projectId, token) => {
  const response = await api.get(`${API_URL}/project/${projectId}`, getAuthHeaders(token));
  return response.data;
};

const getTasksByUser = async (userId, token) => {
  const response = await api.get(`${API_URL}/user/${userId}`, getAuthHeaders(token));
  return response.data;
};

const deleteTask = async (id, token) => {
  const response = await api.put(`${API_URL}/${id}/delete`, {}, getAuthHeaders(token));
  return response.data;
};

export default {
  createTask,
  assignTask,
  updateTaskStatus,
  updateTaskPriority,
  getTasks,
  getTaskById,
  getTasksByProject,
  getTasksByUser,
  deleteTask
};