import authService from '../services/authService';
import projectService from '../services/projectService';

const projectAccessPermission = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const userRole = userData.user?.role || userData.role;
    const userId = authService.getUserIdFromToken();
    const token = authService.getToken();

    // Admin has full access
    if (userRole === 'Admin') {
      return true;
    }

    // Get projects where user is manager or member
    const userProjects = await projectService.getProjectsByMember(userId, token);
    
    // Check if user is a manager or member of any project
    return Array.isArray(userProjects) && userProjects.length > 0;
  } catch (error) {
    console.error('Error checking project access:', error);
    return false;
  }
};

export default projectAccessPermission;
