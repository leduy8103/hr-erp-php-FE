import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import authService from '../../services/authService';
import employeeService from "../../services/employeeService";
import CreateProjectModal from "./CreateProjectModal";
// Add these icons (install if needed: npm install react-icons)
import {
  FaListUl,
  FaThLarge,
  FaSearch,
  FaFilter,
  FaClock,
  FaCheck,
  FaPause,
  FaBan,
} from "react-icons/fa";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [managerNames, setManagerNames] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [statusFilter, setStatusFilter] = useState("all");
  const [projectStats, setProjectStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    onHold: 0,
    cancelled: 0,
  });
  const navigate = useNavigate();
  const token = authService.getToken();
  const userRole = authService.getUserRole();
  const isAdmin = userRole === "Admin" || userRole === "admin";

  // Set current user once
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const userId = authService.getUserIdFromToken();
          if (userId) {
            const userData = await employeeService.getEmployeeById(userId);
            const user = { ...userData, token };
            setCurrentUser(user);
          }
        } catch (error) {
          console.error("Error fetching current user:", error);
          setCurrentUser(authService.getCurrentUser());
        }
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        let data;

        if (currentUser?.role === "Admin") {
          data = await projectService.getProjects(token);
        } else if (currentUser?.role === "Manager") {
          data = await projectService.getProjectByManager(
            currentUser.id,
            token
          );
        } else if (currentUser?.id) {
          data = await projectService.getProjectsByMember(
            currentUser.id,
            token
          );
        } else {
          data = await projectService.getProjects(token);
        }

        setProjects(data);
        setFilteredProjects(data);

        const managerIds = data
          .map((project) => project.manager_id)
          .filter((id) => id);
        const managerNames = await Promise.all(
          managerIds.map((id) => employeeService.getEmployeeNameById(id))
        );
        const managerNamesMap = managerIds.reduce((acc, id, index) => {
          acc[id] = managerNames[index];
          return acc;
        }, {});
        setManagerNames(managerNamesMap);

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects. Please try again later.");
        setLoading(false);
      }
    };

    if (token && currentUser) {
      fetchProjects();
    } else if (token && !currentUser) {
    } else {
      navigate("/login", { state: { from: "/projects" } });
    }
  }, [token, navigate, currentUser]);

  // Calculate project statistics
  useEffect(() => {
    if (projects.length > 0) {
      const stats = {
        total: projects.length,
        inProgress: projects.filter(
          (p) => p.status?.toLowerCase() === "in progress"
        ).length,
        completed: projects.filter(
          (p) => p.status?.toLowerCase() === "completed"
        ).length,
        onHold: projects.filter((p) => p.status?.toLowerCase() === "on hold")
          .length,
        cancelled: projects.filter(
          (p) => p.status?.toLowerCase() === "cancelled"
        ).length,
      };
      setProjectStats(stats);
    }
  }, [projects]);

  // Handle search with debounce
  const handleSearch = useCallback(
    (e) => {
      const term = e.target.value;
      setSearchTerm(term);

      if (!term.trim()) {
        setFilteredProjects(
          statusFilter === "all"
            ? projects
            : projects.filter((p) => p.status?.toLowerCase() === statusFilter)
        );
        return;
      }

      const filtered = projects.filter(
        (project) =>
          (project.name.toLowerCase().includes(term.toLowerCase()) ||
            project.description?.toLowerCase().includes(term.toLowerCase()) ||
            managerNames[project.manager_id]
              ?.toLowerCase()
              .includes(term.toLowerCase())) &&
          (statusFilter === "all" ||
            project.status?.toLowerCase() === statusFilter)
      );

      setFilteredProjects(filtered);
    },
    [projects, statusFilter, managerNames]
  );

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);

    if (status === "all") {
      if (searchTerm) {
        handleSearch({ target: { value: searchTerm } });
      } else {
        setFilteredProjects(projects);
      }
      return;
    }

    const filtered = projects.filter(
      (project) =>
        project.status?.toLowerCase() === status &&
        (searchTerm
          ? project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            managerNames[project.manager_id]
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
          : true)
    );

    setFilteredProjects(filtered);
  };

  // Navigate to project details
  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  // Create new project
  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  // Handle project created - update to handle manager names properly
  const handleProjectCreated = (newProject) => {
    if (newProject.managerName) {
      setManagerNames((prev) => ({
        ...prev,
        [newProject.manager_id]: newProject.managerName,
      }));

      const { managerName, ...projectWithoutManagerName } = newProject;
      setProjects((prev) => [projectWithoutManagerName, ...prev]);
      setFilteredProjects((prev) => [projectWithoutManagerName, ...prev]);
    } else {
      const fetchManagerName = async () => {
        try {
          if (newProject.manager_id) {
            const managerName = await employeeService.getEmployeeNameById(
              newProject.manager_id
            );
            setManagerNames((prev) => ({
              ...prev,
              [newProject.manager_id]: managerName,
            }));
          }
        } catch (error) {
          console.error("Error fetching manager name for new project:", error);
        }
      };

      fetchManagerName();

      setProjects((prev) => [newProject, ...prev]);
      setFilteredProjects((prev) => [newProject, ...prev]);
    }
  };

  // Get status class for styling (enhanced)
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "on hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <FaCheck className="mr-1" />;
      case "in progress":
        return <FaClock className="mr-1" />;
      case "on hold":
        return <FaPause className="mr-1" />;
      case "cancelled":
        return <FaBan className="mr-1" />;
      default:
        return null;
    }
  };

  // Render skeleton loader
  const renderSkeletonLoader = () => {
    return Array(6)
      .fill(0)
      .map((_, i) => (
        <div
          key={i}
          className="border border-gray-200 rounded-lg shadow-md p-5 animate-pulse">
          <div className="flex justify-between items-start mb-3">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-5 bg-gray-200 rounded w-1/5"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="border-t border-gray-200 my-3"></div>
          <div className="h-12 bg-gray-200 rounded mb-4"></div>
          <div className="flex justify-between items-center mt-4">
            <div className="h-3 bg-gray-200 rounded w-2/5"></div>
            <div className="h-8 bg-gray-200 rounded w-1/5"></div>
          </div>
        </div>
      ));
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-1/6 animate-pulse"></div>
        </div>
        <div className="mb-6">
          <div className="h-12 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSkeletonLoader()}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 rounded-lg shadow-sm my-8 max-w-2xl mx-auto">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <p className="text-red-600 text-lg mb-4 font-medium">{error}</p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
          Projects Dashboard
        </h1>
        {isAdmin && (
          <button
            id="create-project-button"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
            onClick={handleCreateProject}>
            + New Project
          </button>
        )}
      </div>

      {/* Project Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-gray-500 mb-1">All Projects</p>
          <p className="text-2xl font-bold text-gray-800">
            {projectStats.total}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-blue-600 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-blue-800">
            {projectStats.inProgress}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-green-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-800">
            {projectStats.completed}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-yellow-600 mb-1">On Hold</p>
          <p className="text-2xl font-bold text-yellow-800">
            {projectStats.onHold}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow-sm border border-red-100 hover:shadow-md transition-shadow">
          <p className="text-sm text-red-600 mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-red-800">
            {projectStats.cancelled}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between mb-4">
          <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
            <div className="relative flex-grow md:flex-grow-0 md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center mr-4">
              <FaFilter className="text-gray-500 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Status</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`p-2 rounded-lg ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-200"
                }`}
                onClick={() => setViewMode("grid")}
                title="Grid View">
                <FaThLarge />
              </button>
              <button
                className={`p-2 rounded-lg ${
                  viewMode === "list"
                    ? "bg-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-200"
                }`}
                onClick={() => setViewMode("list")}
                title="List View">
                <FaListUl />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects list */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <div className="text-gray-400 text-5xl mb-4">📋</div>
          <p className="text-gray-500 text-lg mb-2 font-medium">
            {searchTerm
              ? `No projects found matching "${searchTerm}"`
              : statusFilter !== "all"
              ? `No ${statusFilter} projects found`
              : currentUser?.role === "Admin"
              ? "No projects available in the system"
              : currentUser?.role === "Manager"
              ? "You are not managing any projects"
              : "You are not assigned to any projects"}
          </p>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer hover:-translate-y-1"
              onClick={() => handleViewProject(project.id)}>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-bold text-gray-800 truncate">
                    {project.name}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center ${getStatusClass(
                      project.status
                    )}`}>
                    {getStatusIcon(project.status)}
                    {project.status || "Not Set"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 flex items-center">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      managerNames[project.manager_id] || "UN"
                    )}&background=random&size=24`}
                    alt="Manager"
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  {managerNames[project.manager_id] || "Unassigned"}
                </p>

                <div className="border-t border-gray-200 my-3"></div>

                <p className="text-gray-700 line-clamp-2 mb-4 h-12 text-sm">
                  {project.description || "No description available"}
                </p>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {project.start_date &&
                      new Date(project.start_date).toLocaleDateString()}
                    {project.end_date &&
                      ` - ${new Date(project.end_date).toLocaleDateString()}`}
                  </span>
                  <button className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <ul className="divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <li
                key={project.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleViewProject(project.id)}>
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-2 md:mb-0">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-gray-800 mr-3">
                        {project.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center ${getStatusClass(
                          project.status
                        )}`}>
                        {getStatusIcon(project.status)}
                        {project.status || "Not Set"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.description || "No description available"}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center mb-1">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                            managerNames[project.manager_id] || "UN"
                          )}&background=random&size=20`}
                          alt="Manager"
                          className="w-5 h-5 rounded-full mr-2"
                        />
                        {managerNames[project.manager_id] || "Unassigned"}
                      </div>
                      <div className="text-xs">
                        {project.start_date &&
                          new Date(project.start_date).toLocaleDateString()}
                        {project.end_date &&
                          ` - ${new Date(
                            project.end_date
                          ).toLocaleDateString()}`}
                      </div>
                    </div>

                    <button className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm whitespace-nowrap">
                      View Details
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default ProjectList;
