import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../../services/projectService';
import authService from '../../services/authService';
import ProjectTaskList from "../tasks/ProjectTaskList"; // Import the new ProjectTaskList component
import employeeService from "../../services/employeeService";
import ProjectHeader from "./components/ProjectHeader";
import ProjectSummary from "./components/ProjectSummary";
import CreateProjectModal from "./CreateProjectModal"; // Import the CreateProjectModal component
import AddTaskModal from "../tasks/AddTaskModal"; // Fix the import path - make sure it's correct

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const token = authService.getToken();
  const userInfo = authService.getCurrentUser();
  const userId = authService.getUserIdFromToken();
  const userRole = authService.getUserRole(); // Add this line to get user role

  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false);
  const [memberToAdd, setMemberToAdd] = useState("");
  const [memberEmails, setMemberEmails] = useState("");
  const [emailInputMode, setEmailInputMode] = useState(true); // Toggle between select and email input
  const [availableMembers, setAvailableMembers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [managerName, setManagerName] = useState("");
  const [memberNames, setMemberNames] = useState({});
  const [showEditModal, setShowEditModal] = useState(false); // State for showing edit modal
  const [showNewTaskModal, setShowNewTaskModal] = useState(false); // State for showing new task modal
  const [tasksRefreshKey, setTasksRefreshKey] = useState(0); // For refreshing task list

  // Fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const projectData = await projectService.getProjectById(
          projectId,
          token
        );

        if (!projectData) {
          throw new Error("No project data returned");
        }

        setProject(projectData);

        if (projectData.manager_id) {
          const name = await employeeService.getEmployeeNameById(
            projectData.manager_id
          );
          console.log("Manager name:", name);
          console.log("Current user role:", userRole); // Updated to use userRole
          setManagerName(name);
        }

        try {
          const membersData = await projectService.getProjectMembers(
            projectId,
            token
          );
          setMembers(Array.isArray(membersData) ? membersData : []);

          // Fetch names for all members
          const memberNamesPromises = membersData.map((member) =>
            employeeService.getEmployeeNameById(member.user_id)
          );
          const names = await Promise.all(memberNamesPromises);
          const namesMap = membersData.reduce((acc, member, index) => {
            acc[member.user_id] = names[index];
            return acc;
          }, {});
          setMemberNames(namesMap);
        } catch (memberErr) {
          console.error("Failed to fetch project members:", memberErr);
          setMembers([]);
        }

        try {
          const progressPercentage =
            await projectService.calculateProjectProgress(projectId, token);
          setProgress({ percentage: progressPercentage });
        } catch (progressErr) {
          console.error("Failed to fetch project progress:", progressErr);
          setProgress({ percentage: 0 });
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch project details:", err);
        setError("Failed to load project details. Please try again.");
        setLoading(false);
      }
    };

    if (projectId && token) {
      fetchProjectDetails();
    } else if (!token) {
      navigate("/login", { state: { from: `/projects/${projectId}` } });
    }
  }, [projectId, token, navigate]);

  // Get status class for styling
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500 text-white";
      case "in progress":
        return "bg-blue-500 text-white";
      case "on hold":
        return "bg-yellow-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Navigate back to projects list
  const handleBack = () => {
    navigate("/projects");
  };

  // Handle project edit
  const handleEdit = () => {
    if (!isAdmin) {
      alert("Only administrators can edit projects.");
      return;
    }
    setShowEditModal(true);
  };

  // Handle project update
  const handleProjectUpdated = async (updatedProject) => {
    try {
      // Refresh project data after update
      const projectData = await projectService.getProjectById(projectId, token);
      setProject(projectData);

      if (projectData.manager_id) {
        const name = await employeeService.getEmployeeNameById(
          projectData.manager_id
        );
        setManagerName(name);
      }
    } catch (err) {
      console.error("Failed to refresh project data:", err);
    }
  };

  // Format project data for edit modal
  const getProjectEditData = () => {
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      manager_id: project.manager_id ? project.manager_id.toString() : "",
      start_date: project.start_date
        ? new Date(project.start_date).toISOString().split("T")[0]
        : "",
      end_date: project.end_date
        ? new Date(project.end_date).toISOString().split("T")[0]
        : "",
      managerName: managerName,
    };
  };

  // Remove a member from the project
  const handleRemoveMember = async (userId) => {
    try {
      await projectService.removeProjectMember(
        {
          project_id: projectId,
          user_id: userId,
        },
        token
      );

      // Update members list
      const updatedMembers = await projectService.getProjectMembers(
        projectId,
        token
      );
      setMembers(updatedMembers);

      // Update member names (remove deleted members from the map)
      const updatedMemberNames = { ...memberNames };
      // Remove the member from the names map
      if (updatedMemberNames[userId]) {
        delete updatedMemberNames[userId];
      }
      setMemberNames(updatedMemberNames);
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  // Delete project
  const handleDeleteProject = async () => {
    if (!isAdmin) {
      alert("Only administrators can delete projects.");
      return;
    }

    try {
      await projectService.deleteProject(projectId, token);
      navigate("/projects", {
        state: { message: "Project successfully deleted" },
      });
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";

    // Format date as dd/mm/yyyy
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Check if user has manager permissions
  const isManager =
    project &&
    (project.manager_id === userId ||
      userRole === "Admin" ||
      userRole === "admin");

  // Check if user has admin permissions for creating projects
  const isAdmin = userRole === "Admin" || userRole === "admin";

  // Open dialog to add members
  const handleAddMemberClick = async () => {
    if (!isManager) {
      // Allow both admin and manager
      alert("Only administrators or managers can modify project members.");
      return;
    }

    try {
      // Get all available members to add
      const allUsers = await employeeService.getEmployees(token);
      // Filter out users already in the project
      const availableUsers = allUsers.filter(
        (user) => !members.some((member) => member.user_id === user.id)
      );
      setAvailableMembers(availableUsers);
      setMemberEmails(""); // Reset email input
      setShowAddMemberDialog(true);
    } catch (err) {
      console.error("Failed to fetch available members:", err);
    }
  };

  // Add members to the project
  const handleAddMember = async () => {
    if (!isManager) {
      // Allow both admin and manager
      alert("Only administrators or managers can modify project members.");
      return;
    }

    if (emailInputMode) {
      // Email input mode - add multiple members by email
      if (!memberEmails.trim()) return;

      try {
        const emails = memberEmails
          .split(",")
          .map((email) => email.trim())
          .filter((email) => email);

        // Process each email
        const addPromises = emails.map(async (email) => {
          try {
            // Find user by email
            const user = await employeeService.findEmployeeByEmail(
              email,
              token
            );
            if (!user) {
              console.error(`No user found with email: ${email}`);
              return null;
            }

            // Add user to project
            await projectService.addProjectMember(
              {
                project_id: projectId,
                user_id: user.id,
                role: "Member",
              },
              token
            );

            return user.id;
          } catch (err) {
            console.error(`Error adding member with email ${email}:`, err);
            return null;
          }
        });

        await Promise.all(addPromises);
      } catch (err) {
        console.error("Failed to add members by email:", err);
      }
    } else {
      // Select dropdown mode - add single member
      if (!memberToAdd) return;

      try {
        await projectService.addProjectMember(
          {
            project_id: projectId,
            user_id: memberToAdd,
            role: "Member",
          },
          token
        );
      } catch (err) {
        console.error("Failed to add member:", err);
      }
    }

    // Refresh member list regardless of mode
    try {
      const updatedMembers = await projectService.getProjectMembers(
        projectId,
        token
      );
      setMembers(updatedMembers);

      // Fetch names for the updated member list
      const memberNamesPromises = updatedMembers.map((member) =>
        employeeService.getEmployeeNameById(member.user_id)
      );
      const names = await Promise.all(memberNamesPromises);
      const namesMap = updatedMembers.reduce((acc, member, index) => {
        acc[member.user_id] = names[index];
        return acc;
      }, {});
      setMemberNames(namesMap);
    } catch (err) {
      console.error("Failed to refresh member list:", err);
    }

    // Close the dialog and reset inputs
    setShowAddMemberDialog(false);
    setMemberToAdd("");
    setMemberEmails("");
  };

  // Handle new task added
  const handleTaskAdded = () => {
    if (!isManager) {
      // Allow both admin and manager
      alert("Only administrators or managers can add tasks.");
      return;
    }
    // Refresh the task list by updating the refresh key
    setTasksRefreshKey((prevKey) => prevKey + 1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        Loading project details...
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="text-center p-6">
        <p className="text-red-600 text-lg mb-4">
          {error || "Project not found"}
        </p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={handleBack}>
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectHeader
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={() => setShowDeleteConfirm(true)}
        isManager={isManager}
      />

      <ProjectSummary
        project={project}
        managerName={managerName}
        progress={progress}
      />

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex">
          <button
            className={`py-3 px-6 border-b-2 font-medium text-sm ${
              activeTab === "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("details")}>
            Details
          </button>
          <button
            className={`py-3 px-6 border-b-2 font-medium text-sm ${
              activeTab === "team"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("team")}>
            Team Members
          </button>
          <button
            className={`py-3 px-6 border-b-2 font-medium text-sm ${
              activeTab === "tasks"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => setActiveTab("tasks")}>
            Tasks
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Description
            </h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {project.description || "No description provided."}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Project Timeline
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Start Date
                  </h3>
                </div>
                <p className="text-gray-600 ml-7">
                  {formatDate(project.start_date)}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-800">
                    End Date
                  </h3>
                </div>
                <p className="text-gray-600 ml-7">
                  {formatDate(project.end_date)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "team" && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
              {isManager && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={handleAddMemberClick}>
                  Add Member
                </button>
              )}
            </div>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                No members in this project yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {members.map((member) => (
                <div
                  key={member.userId}
                  className="p-6 flex justify-between items-center hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                      {memberNames[member.user_id]?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-lg">
                        {memberNames[member.user_id] || `Loading...`}
                      </p>
                      <p className="text-gray-500">
                        {member.role || "Team Member"}
                      </p>
                    </div>
                  </div>
                  {isManager && (
                    <button
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      onClick={() => handleRemoveMember(member.user_id)}>
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Project Tasks
              </h2>
              {isManager && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowNewTaskModal(true)}>
                  Add New Task
                </button>
              )}
            </div>
          </div>
          <div className="p-6">
            <ProjectTaskList
              projectId={projectId}
              refreshKey={tasksRefreshKey}
            />
          </div>
        </div>
      )}

      {/* Add Member Dialog */}
      {showAddMemberDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowAddMemberDialog(false)}></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div
              className="bg-white rounded-lg shadow-lg max-w-md w-full relative z-10"
              onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Add Project Members
                  </h2>
                  <button
                    onClick={() => setShowAddMemberDialog(false)}
                    className="text-gray-500 hover:text-gray-700">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center mb-3">
                    <button
                      onClick={() => setEmailInputMode(true)}
                      className={`mr-2 px-3 py-1 rounded ${
                        emailInputMode
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}>
                      Add by Email
                    </button>
                    <button
                      onClick={() => setEmailInputMode(false)}
                      className={`px-3 py-1 rounded ${
                        !emailInputMode
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}>
                      Select User
                    </button>
                  </div>

                  {emailInputMode ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enter email addresses (comma separated)
                      </label>
                      <textarea
                        value={memberEmails}
                        onChange={(e) => setMemberEmails(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-1"
                        placeholder="email1@example.com, email2@example.com"
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mb-4">
                        Add multiple members by entering their email addresses
                        separated by commas
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select a user to add
                      </label>
                      <select
                        value={memberToAdd}
                        onChange={(e) => setMemberToAdd(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4">
                        <option value="">Select a member</option>
                        {availableMembers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.full_name || user.email || `User ${user.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowAddMemberDialog(false)}>
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    onClick={handleAddMember}
                    disabled={
                      emailInputMode ? !memberEmails.trim() : !memberToAdd
                    }>
                    {emailInputMode ? "Add Members" : "Add Member"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50"></div>
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Confirm Delete
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete project "{project.name}"? This
                  action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    onClick={handleDeleteProject}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <CreateProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onProjectCreated={handleProjectUpdated}
          isEditing={true}
          projectData={getProjectEditData()}
        />
      )}

      {/* New Task Modal */}
      <AddTaskModal
        isOpen={showNewTaskModal}
        onClose={() => setShowNewTaskModal(false)}
        projectId={projectId}
        onTaskAdded={handleTaskAdded}
      />
    </div>
  );
};

export default ProjectDetails;
