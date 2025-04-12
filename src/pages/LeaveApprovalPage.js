import React, { useState, useEffect } from 'react';
import { getAllLeaveRequests, processLeaveRequest } from '../services/leaveService';
import Layout from '../components/Layout';

const LEAVE_REASONS = {
  PERSONAL: {
    label: 'Personal Matter',
    description: 'Personal or family related matters'
  },
  MEDICAL: {
    label: 'Medical',
    description: 'Health related appointments or recovery'
  },
  VACATION: {
    label: 'Vacation',
    description: 'Planned vacation or time off'
  },
  EMERGENCY: {
    label: 'Emergency',
    description: 'Urgent unexpected situations'
  },
  OTHER: {
    label: 'Other',
    description: 'Other reasons (requires specification)'
  }
};

const getInitials = (name) => {
  if (!name) return 'U'; // Default to 'U' for Unknown
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2); // Chỉ lấy tối đa 2 chữ cái
};

const getAvatarColor = (name) => {
  const colors = [
    'bg-blue-500',
    'bg-red-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  
  const index = name?.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0) % colors.length;
  
  return colors[index] || colors[0];
};

const LeaveApprovalPage = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    leaveType: '',
    status: '',
    dateRange: {
      startDate: '',
      endDate: ''
    }
  });
  const [showCustomReasonInput, setShowCustomReasonInput] = useState(false);
  const [customRejectReason, setCustomRejectReason] = useState('');

  // Load tất cả yêu cầu nghỉ phép
  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await getAllLeaveRequests();
      
      if (response.success) {
        console.log('Leave requests fetched:', response.data);
        setLeaveRequests(response.data || []);
      } else {
        setError(response.message || 'Không thể tải dữ liệu');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setError(err.response?.data?.message || 'Không thể tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setModalAction('approve');
    setShowModal(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setModalAction('reject');
    setShowModal(true);
  };

  const confirmAction = async () => {
    try {
      const processData = {
        requestId: selectedRequest.id,
        status: modalAction === 'approve' ? 'Approved' : 'Rejected',
        rejectReason: modalAction === 'reject' ? rejectReason : ''
      };

      const response = await processLeaveRequest(processData);
      
      if (response.success) {
        setSuccessMessage(`Đơn nghỉ phép đã được ${modalAction === 'approve' ? 'phê duyệt' : 'từ chối'} thành công`);
        
        // Reset and refresh
        setShowModal(false);
        setSelectedRequest(null);
        setRejectReason('');
        setCustomRejectReason('');
        fetchLeaveRequests();
        
        // Auto clear success message
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(response.message || 'Xử lý yêu cầu không thành công');
        setShowModal(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi xử lý yêu cầu');
      setShowModal(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setRejectReason('');
    setCustomRejectReason('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const openFilterModal = () => {
    setShowFilterModal(true);
  };

  const closeFilterModal = () => {
    setShowFilterModal(false);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFilters({
        ...filters,
        [parent]: {
          ...filters[parent],
          [child]: value
        }
      });
    } else {
      setFilters({
        ...filters,
        [name]: value
      });
    }
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when applying filters
    closeFilterModal();
  };

  const resetFilters = () => {
    setFilters({
      leaveType: '',
      status: '',
      dateRange: {
        startDate: '',
        endDate: ''
      }
    });
    setCurrentPage(1);
  };

  const filteredRequests = leaveRequests.filter(request => {
    // Search term filtering
    const employeeName = request.user?.full_name || `ID: ${request.user_id}`;
    const matchesSearch = 
      employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.leave_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.reason && request.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    // Filter by leave type
    if (filters.leaveType && request.leave_type !== filters.leaveType) {
      return false;
    }
    
    // Filter by status
    if (filters.status && request.status !== filters.status) {
      return false;
    }
    
    // Filter by date range
    if (filters.dateRange.startDate && filters.dateRange.endDate) {
      const requestStart = new Date(request.start_date);
      const filterStart = new Date(filters.dateRange.startDate);
      const filterEnd = new Date(filters.dateRange.endDate);
      
      if (requestStart < filterStart || requestStart > filterEnd) {
        return false;
      }
    }
    
    return true;
  });
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Leave Approval</h1>
            <p className="text-gray-600 mt-1">Manage and process leave requests</p>
          </div>
          
          {/* Stats Cards */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-xl font-semibold text-yellow-500">
                    {leaveRequests.filter(r => r.status === 'Pending').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-center">
                <div className="p-2 bg-green-50 rounded-lg">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-xl font-semibold text-green-500">
                    {leaveRequests.filter(r => r.status === 'Approved').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="search" 
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by name, leave type..." 
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={openFilterModal}
                className="flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {Object.values(filters).some(val => val && (typeof val === 'object' ? Object.values(val).some(v => v) : true)) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-500">Active filters:</span>
                {filters.leaveType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700">
                    Leave Type: {filters.leaveType}
                    <button onClick={() => setFilters({...filters, leaveType: ''})} className="ml-2 hover:text-blue-800">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-gray-500 text-lg mb-2">No leave requests found</p>
                        <p className="text-gray-400">All leave requests will appear here</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {request.user?.avatar ? (
                            <img 
                              src={request.user.avatar}
                              alt={request.user?.full_name} 
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(request.user?.full_name)}`}>
                              {getInitials(request.user?.full_name || 'Unknown User')}
                            </div>
                          )}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {request.user?.full_name || `ID: ${request.user_id}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {request.user?.email || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {request.leave_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(request.start_date).toLocaleDateString('en-GB')}
                        </div>
                        <div className="text-xs text-gray-500">
                          to {new Date(request.end_date).toLocaleDateString('en-GB')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {LEAVE_REASONS[request.reason]?.label || request.reason}
                        </div>
                        {request.reason === 'OTHER' && request.custom_reason && (
                          <div className="text-xs text-gray-500 mt-1">
                            Note: {request.custom_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${request.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                            request.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {request.status}
                        </span>
                        {request.status === 'Rejected' && request.reject_reason && (
                          <div className="text-xs text-red-500 mt-1">
                            Reason: {request.reject_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {request.status === 'Pending' && (
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => handleApprove(request)}
                              className="text-green-500 hover:text-green-700 transition-colors duration-150"
                              title="Approve"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleReject(request)}
                              className="text-red-500 hover:text-red-700 transition-colors duration-150"
                              title="Reject"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, filteredRequests.length)}</span> of <span className="font-medium">{filteredRequests.length}</span> requests
                </p>
                <div className="flex space-x-2">
                  <button 
                    onClick={prevPage} 
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md border ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'} transition-colors duration-150`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="flex space-x-1">
                    {[...Array(totalPages).keys()].map(number => (
                      <button 
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`px-3 py-1 rounded-md transition-colors duration-150 ${
                          currentPage === number + 1 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {number + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={nextPage} 
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md border ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100 text-gray-600'} transition-colors duration-150`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Leave Requests</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                      <select 
                        name="leaveType" 
                        value={filters.leaveType} 
                        onChange={handleFilterChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Types</option>
                        <option value="Annual">Annual</option>
                        <option value="Sick">Sick</option>
                        <option value="Maternity">Maternity</option>
                        <option value="Unpaid">Unpaid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select 
                        name="status" 
                        value={filters.status} 
                        onChange={handleFilterChange}
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">From</label>
                          <input 
                            type="date" 
                            name="dateRange.startDate" 
                            value={filters.dateRange.startDate} 
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">To</label>
                          <input 
                            type="date" 
                            name="dateRange.endDate" 
                            value={filters.dateRange.endDate} 
                            onChange={handleFilterChange}
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button 
                    type="button" 
                    onClick={applyFilters}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Apply Filters
                  </button>
                  <button 
                    type="button" 
                    onClick={closeFilterModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal xử lý */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">
                {modalAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </h3>
              
              {selectedRequest && (
                <div className="mb-4">
                  <p className="mb-2">
                    <span className="font-semibold">Employee:</span> {selectedRequest.user?.full_name || `ID: ${selectedRequest.user_id}`}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Leave Type:</span> {selectedRequest.leave_type}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Period:</span> {new Date(selectedRequest.start_date).toLocaleDateString('en-GB')} - {new Date(selectedRequest.end_date).toLocaleDateString('en-GB')}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Reason:</span> {LEAVE_REASONS[selectedRequest.reason]?.label || selectedRequest.reason}
                    {selectedRequest.reason === 'OTHER' && selectedRequest.custom_reason && (
                      <span className="text-sm text-gray-500 ml-2">({selectedRequest.custom_reason})</span>
                    )}
                  </p>
                </div>
              )}
              
              {modalAction === 'reject' && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Rejection Reason</label>
                  <select
                    value={rejectReason}
                    onChange={(e) => {
                      setRejectReason(e.target.value);
                      if (e.target.value === 'OTHER') {
                        setShowCustomReasonInput(true);
                      }
                    }}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  >
                    <option value="">Select a reason</option>
                    <option value="INSUFFICIENT_DAYS">Insufficient leave days</option>
                    <option value="BUSY_PERIOD">Busy period</option>
                    <option value="INVALID_DATES">Invalid dates</option>
                    <option value="OTHER">Other reason</option>
                  </select>
                  {(rejectReason === 'OTHER' || showCustomReasonInput) && (
                    <textarea
                      value={customRejectReason}
                      onChange={(e) => setCustomRejectReason(e.target.value)}
                      placeholder="Please specify the reason"
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      required
                    />
                  )}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border rounded hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`px-4 py-2 text-white rounded ${
                    modalAction === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                  } transition`}
                  disabled={modalAction === 'reject' && !rejectReason.trim()}
                >
                  {modalAction === 'approve' ? 'Approve' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LeaveApprovalPage; 