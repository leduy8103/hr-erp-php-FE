import api from './api';
import cdnService from './cdnService';

const documentService = {
  uploadDocument: async (file, type, userId) => {
    // First upload file to CDN
    const fileUrl = await cdnService.uploadFile(file, type, userId);
    
    // Then save document metadata to backend
    const response = await api.post('/api/documents', {
      userId,
      type,
      name: file.name,
      url: fileUrl,
      uploadDate: new Date().toISOString()
    });

    return response.data;
  },

  getUserDocuments: async (userId) => {
    const response = await api.get(`/api/documents/user/${userId}`);
    return response.data;
  },

  deleteDocument: async (documentId) => {
    const response = await api.delete(`/api/documents/${documentId}`);
    return response.data;
  }
};

export default documentService;
