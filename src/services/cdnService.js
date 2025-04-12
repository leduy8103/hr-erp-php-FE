const CDN_URL = 'http://localhost:4000';

const cdnService = {
  uploadFile: async (formData, type) => {
    try {
      const userId = formData.get('userId');
      console.log('FormData values:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      // Add userId to URL query params since multer has issues with body parsing
      const response = await fetch(`${CDN_URL}/upload?userId=${userId}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload response:', data);
      return data.message;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  uploadAvatar: async (file, userId) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', userId);

      const response = await fetch(`${CDN_URL}/upload?userId=${userId}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Avatar upload failed');
      }

      const data = await response.json();
      return data.message; // Returns the URL of the uploaded avatar
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  },

  getUserFiles: async (userId) => {
    try {
      const response = await fetch(`${CDN_URL}/documents/${userId}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Failed to fetch user files: ${response.statusText}`);
      }

      return data.files;
    } catch (error) {
      console.error('Error fetching files:', error);
      throw error;
    }
  }
};

export default cdnService;
