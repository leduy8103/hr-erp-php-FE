import api from './api';

const addPr = async (prData) => {
  try {
    const response = await api.post('/api/pr/createPr', prData);
    return response.data;
  } catch (error) {
    console.error('Error adding perfomance review:', error.response?.data || error.message);
    throw error;
  }
};

const getPr = async () => {
  try {
    const response = await api.get('/api/pr/performance-reviews');
    return response.data;
  } catch (error) {
    console.error('Error fetching perfomance review:', error.response?.data || error.message);
    throw error;
  }
};

const getPrById = async (id) => {
  try {
    const response = await api.get(`/api/pr/search/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching perfomance review ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

const getPrByUserId = async (id) => {
  try {
    const response = await api.get(`/api/pr/search/user/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching perfomance review ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

const updatePr = async (id, employeeData) => {
  try {
    const response = await api.put(`/api/updatePr`, employeeData);
    return response.data;
  } catch (error) {
    console.error(`Error updating perfomance review :`, error.response?.data || error.message);
    throw error;
  }
};

const deletePr = async (id) => {
  try {
    const response = await api.delete(`/api/deletePr}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting perfomance review :`, error.response?.data || error.message);
    throw error;
  }
};

const prService = {
  addPr,
  getPr,
  getPrById,
  getPrByUserId,
  updatePr,
  deletePr
};

export default prService;
