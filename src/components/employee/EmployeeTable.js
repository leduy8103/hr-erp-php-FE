import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddEmployeeModal from './AddEmployeeModal';
import AddPerformanceReviewModal from './AddPerformanceReviewModal';
import FilterModal from './FilterModal';
import employeeService from '../../services/employeeService';
import authService from "../../services/authService"; // Assuming this service exists

const EmployeeTable = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAddPerformanceReviewModalOpen, setIsAddPerformanceReviewModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'blocked'
  const [selectedUserId, setSelectedUserId] = useState(null); // Thêm state để lưu user_id

  const fetchData = async () => {
    try {
      setLoading(true);
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      const userRole = authService.getUserRole();
      setIsAdmin(userRole === "Admin");

      // Fetch appropriate list based on active tab
      if (activeTab === "blocked") {
        const blockedUsers = await employeeService.getBlockedUsers();
        setEmployees(blockedUsers);
      } else {
        const response = await employeeService.getEmployees();
        const currentUserId = authService.getUserIdFromToken();
        const filteredEmployees = response.filter(
          (emp) => emp.id !== currentUserId
        );
        setEmployees(filteredEmployees);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleEvaluateClick = (userId) => {
    setSelectedUserId(userId); // Lưu user_id của user được chọn
    setIsAddPerformanceReviewModalOpen(true); // Mở modal
  };

  const handleEditEmployee = (employee) => {
    console.log("Edit button clicked for employee:", employee);
    // Make a copy of the employee object to avoid reference issues
    setEditingEmployee({ ...employee });
    // Ensure we're setting the modal to open
    setTimeout(() => {
      setIsAddEmployeeModalOpen(true);
    }, 0);
  };

  const handleModalClose = () => {
    console.log("Closing modal, resetting editing employee");
    setIsAddEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  // Function to handle saving employee (add or update)
  const handleSaveEmployee = async (updatedEmployee) => {
    try {
      if (editingEmployee) {
        // Update existing employee using updateEmployeeProfile
        console.log("Updating employee with ID:", editingEmployee.id);
        await employeeService.updateEmployeeProfile(
          editingEmployee.id,
          updatedEmployee
        );
      } else {
        // Add new employee
        await employeeService.addEmployee(updatedEmployee);
      }

      // Refresh employee list
      await fetchData();
      setEditingEmployee(null);
      setIsAddEmployeeModalOpen(false);
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const handleBlockUser = async (employee) => {
    const action = activeTab === "blocked" ? "unblock" : "block";
    if (window.confirm(`Are you sure you want to ${action} ${employee.full_name}?`)) {
      try {
        if (activeTab === "blocked") {
          await employeeService.unblockUser(employee.id);
          alert(`Successfully unblocked ${employee.full_name}`);
        } else {
          await employeeService.blockUser(employee.id);
          alert(`Successfully blocked ${employee.full_name}`);
        }
        // Refresh the data to show the updated blocked status
        await fetchData();
      } catch (error) {
        console.error(`Error ${action}ing user:`, error);
        alert(`Failed to ${action} ${employee.full_name}. Please try again.`);
      }
    }
  };

  const handleDeleteUser = async (employee) => {
    if (window.confirm(`Are you sure you want to remove ${employee.full_name}?`)) {
      try {
        await employeeService.deleteEmployee(employee.id);
        alert(`Successfully removed ${employee.full_name}`);
        await fetchData(); // Refresh the list
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert(`Failed to remove ${employee.full_name}. Please try again.`);
      }
    }
  };

  const handleViewProfile = (employee) => {
    navigate(`/profile/${employee.id}`);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]); // Re-fetch when tab changes

  // Filter employees based on search term and filters
  const filteredEmployees = employees.filter(
    (employee) =>
      (employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!filters.selectedDepartments ||
        filters.selectedDepartments.length === 0 ||
        filters.selectedDepartments.includes(employee.department)) &&
      (!filters.selectedrole || filters.selectedrole === employee.role)
  );

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-blue-100 text-blue-800";
      case "resigned":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg">
      {/* Add tabs before the existing header */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("all")}
            className={`${
              activeTab === "all"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            All Employees
          </button>
          <button
            onClick={() => setActiveTab("blocked")}
            className={`${
              activeTab === "blocked"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
            Blocked Users
          </button>
        </nav>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          {activeTab === "all" ? "All Employees" : "Blocked Users"}
        </h1>
        <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              role="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <svg
              className="absolute right-3 top-3 h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <button
            className="w-full md:w-auto px-4 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-lg transition duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center shadow-sm"
            onClick={() => setIsFilterModalOpen(true)}>
            <svg
              className="h-5 w-5 mr-2 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                clipRule="evenodd"
              />
            </svg>
            Filter
          </button>
          {activeTab === "all" && (
            <button
              className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center shadow-md"
              onClick={() => setIsAddEmployeeModalOpen(true)}>
              <svg
                className="h-5 w-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add New Employee
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-full bg-white border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Employee Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Employee ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Designation
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Blocked
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  <div className="flex justify-center items-center">
                    <svg
                      className="animate-spin h-8 w-8 text-blue-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-lg font-medium">
                      Loading employees...
                    </span>
                  </div>
                </td>
              </tr>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-150" 
                         onClick={() => handleViewProfile(employee)}>
                      <div className="flex-shrink-0 h-12 w-12">
                        {employee.avatarURL ? (
                          <img
                            src={employee.avatarURL}
                            alt={employee.full_name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${employee.full_name}&background=random`;
                            }}
                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                            {employee.full_name
                              .split(" ")
                              .map((name) => name[0])
                              .join("")
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900 hover:text-blue-600">
                          {employee.full_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {employee.email || "No email provided"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.department}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {employee.position}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1.5 inline-flex items-center justify-center text-xs font-medium rounded-full ${getStatusBadgeClass(
                        employee.status
                      )}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1.5 inline-flex items-center justify-center text-xs font-medium rounded-full ${
                        employee.is_blocked
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                      {employee.is_blocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {activeTab === "all" ? (
                        <>
                          <button
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition duration-200 flex items-center"
                            onClick={() => handleEvaluateClick(employee.id)}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path
                                fillRule="evenodd"
                                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Evaluate
                          </button>
                          {isAdmin && (
                            <>
                              <button
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition duration-200 flex items-center"
                                onClick={() => handleEditEmployee(employee)}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition duration-200 flex items-center"
                                onClick={() => handleBlockUser(employee)}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor">
                                  <path
                                    fillRule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Block
                              </button>
                              <button
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition duration-200 flex items-center"
                                onClick={() => handleDeleteUser(employee)}>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 mr-1"
                                  viewBox="0 0 20 20"
                                  fill="currentColor">
                                  <path
                                    fillRule="evenodd"
                                    d="M10 2a1 1 0 00-1 1v1H5a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1h-4V3a1 1 0 00-1-1zm-3 5a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H8a1 1 0 01-1-1V7z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Remove
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        isAdmin && (
                          <>
                            <button
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition duration-200 flex items-center"
                              onClick={() => handleBlockUser(employee)}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Unblock
                            </button>
                            <button
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition duration-200 flex items-center"
                              onClick={() => handleDeleteUser(employee)}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M10 2a1 1 0 00-1 1v1H5a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1h-4V3a1 1 0 00-1-1zm-3 5a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H8a1 1 0 01-1-1V7z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Remove
                            </button>
                          </>
                        )
                      )}
                      {!isAdmin && (
                        <button className="px-3 py-1.5 bg-gray-200 text-gray-500 text-sm rounded-lg cursor-not-allowed">
                          No Permission
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No employees found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
        <div className="text-sm text-gray-700">
          <span>Showing </span>
          <select
            className="border rounded-md px-2 py-1.5 mx-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={recordsPerPage}
            onChange={(e) => setRecordsPerPage(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
          <span>
            {" "}
            out of <strong>{filteredEmployees.length}</strong> records
          </span>
        </div>

        <div className="inline-flex rounded-md shadow">
          <button
            className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-l-lg text-gray-700 hover:bg-gray-50 transition duration-150 ease-in-out"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button className="px-4 py-2 border-t border-b border-gray-300 bg-blue-50 text-sm font-medium text-blue-600">
            {currentPage}
          </button>
          <button
            className="px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-r-lg text-gray-700 hover:bg-gray-50 transition duration-150 ease-in-out"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage * recordsPerPage >= filteredEmployees.length}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onRequestClose={handleModalClose}
        initialFormData={editingEmployee}
        onSubmit={handleSaveEmployee}
        isEditMode={!!editingEmployee}
      />
      <AddPerformanceReviewModal
        isOpen={isAddPerformanceReviewModalOpen}
        onRequestClose={() => setIsAddPerformanceReviewModalOpen(false)}
        userId={selectedUserId}
      />
      <FilterModal
        isOpen={isFilterModalOpen}
        onRequestClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
      />
    </div>
  );
};

export default EmployeeTable;