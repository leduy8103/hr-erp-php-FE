export const getStatusClass = (status) => {
  switch(status?.toLowerCase()) {
    case 'completed': return 'bg-green-500 text-white';
    case 'in progress': return 'bg-blue-500 text-white';
    case 'on hold': return 'bg-yellow-500 text-white';
    case 'cancelled': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export const getPriorityClass = (priority) => {
  switch(priority?.toLowerCase()) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
