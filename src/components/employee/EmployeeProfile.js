import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import employeeService from '../../services/employeeService';
import cdnService from "../../services/cdnService";
import authService from "../../services/authService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChangePasswordTab from "./ChangePasswordTab";
import UploadFilesForm from './UploadFilesForm';
import DocumentList from './DocumentList';

const EmployeeProfile = ({ isDarkMode }) => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Personal Information");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);
  const { id } = useParams(); // Get the id from URL params

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let data;
        if (id) {
          // If id exists in URL, fetch that specific user's profile
          data = await employeeService.getEmployeeById(id);
        } else {
          // Otherwise fetch current user's profile
          data = await employeeService.getCurrentUserProfile();
        }
        setProfile(data);
      } catch (error) {
        setError("Error fetching profile: " + error.message);
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [id]); // Add id as dependency to re-fetch when it changes

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await cdnService.uploadAvatar(file, profile.id);
      const updatedProfile = await employeeService.updateProfile(profile.id, {
        avatarURL: url
      });
      setProfile(updatedProfile);
      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update avatar");
    }
  };

  // Update the tabs based on permissions
  const getTabs = () => {
    const isOwnProfile = !id || profile?.id === authService.getCurrentUser()?.id;
    const isAdmin = authService.getUserRole() === 'Admin';
    const baseTabs = ["Personal Information", "Professional Information"];
    
    if (isOwnProfile) {
      // User viewing their own profile
      return [...baseTabs, "Change Password", "Upload Documents"];
    } else if (isAdmin) {
      // Admin viewing someone else's profile
      return [...baseTabs, "Upload Documents"];
    }
    
    return baseTabs;
  };

  const handleFileChange = (fieldName, file) => {
    setProfile(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleMultipleFileChange = (fieldName, files) => {
    setProfile(prev => ({
      ...prev,
      [fieldName]: files
    }));
  };

  const handleRemoveFile = (fieldName, index) => {
    if (Array.isArray(profile[fieldName])) {
      setProfile(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index)
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <ToastContainer />
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-purple-100 dark:border-purple-900 bg-purple-600 flex items-center justify-center overflow-hidden shadow-lg">
              {profile.avatarURL ? (
                <img 
                  src={profile.avatarURL} 
                  alt="Profile" 
                  className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-105"
                />
              ) : (
                <span className="text-5xl font-bold text-white">
                  {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : ""}
                </span>
              )}
            </div>
            {(!id || profile?.id === authService.getCurrentUser()?.id) && (
              <>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-white dark:bg-gray-700 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-purple-50 dark:hover:bg-gray-600">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className={`text-3xl md:text-4xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
              {profile.full_name}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 flex items-center justify-center md:justify-start mb-4">
              <svg
                className="w-6 h-6 mr-3 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              {profile.email}
            </p>
            <div className="flex items-center justify-center md:justify-start">
              <span className={`px-6 py-2 rounded-full text-base font-semibold ${
                profile.status === "Active"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              } shadow-sm transition-all duration-300 hover:shadow-md`}>
                {profile.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        {getTabs().map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-6 text-sm font-medium relative ${
              activeTab === tab
                ? "text-purple-600"
                : "text-gray-500 hover:text-purple-600"
            }`}>
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600"></span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {activeTab === "Personal Information" && (
        <div
          className={`p-6 rounded-lg shadow-sm ${
            isDarkMode ? "bg-gray-750 text-white" : "bg-white text-gray-900"
          } border ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
          <h3 className="text-lg font-semibold mb-6 border-b pb-2 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Full Name
              </strong>
              <p className="text-lg">{profile.full_name}</p>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Mobile Number
              </strong>
              <p className="text-lg flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                {profile.mobile}
              </p>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Email Address
              </strong>
              <p className="text-lg flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {profile.email}
              </p>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Address
              </strong>
              <p className="text-lg flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {profile.address}
              </p>
            </div>
          </div>
        </div>
      )}
      {activeTab === "Professional Information" && (
        <div
          className={`p-6 rounded-lg shadow-sm ${
            isDarkMode ? "bg-gray-750 text-white" : "bg-white text-gray-900"
          } border ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
          <h3 className="text-lg font-semibold mb-6 border-b pb-2 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            Professional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Department
              </strong>
              <p className="text-lg">{profile.department}</p>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Position
              </strong>
              <p className="text-lg">{profile.position}</p>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Hire Date
              </strong>
              <p className="text-lg">{profile.hire_date}</p>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Status
              </strong>
              <p className="text-lg">{profile.status}</p>
            </div>
            <div className="bg-gray-50/70 p-4 rounded-lg border border-gray-100 transition-all hover:shadow-md dark:bg-gray-800/30 dark:border-gray-700">
              <strong
                className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-500"
                }`}>
                Role
              </strong>
              <p className="text-lg">{profile.role}</p>
            </div>
          </div>
        </div>
      )}
      {activeTab === "Change Password" && (
        <ChangePasswordTab isDarkMode={isDarkMode} />
      )}
      {activeTab === "Upload Documents" && (
        <div className={`p-6 rounded-lg shadow-sm ${
          isDarkMode ? "bg-gray-750 text-white" : "bg-white text-gray-900"
        } border ${isDarkMode ? "border-gray-700" : "border-gray-100"}`}>
          <DocumentList 
            documents={[
              ...(profile.resume ? [{ type: 'resume', name: 'Resume', url: profile.resume }] : []),
              ...(profile.idProof ? [{ type: 'idProof', name: 'ID Proof', url: profile.idProof }] : []),
              ...(profile.certificates?.map(cert => ({
                type: 'certificate',
                name: 'Certificate',
                url: cert
              })) || [])
            ]}
            isDarkMode={isDarkMode}
            currentUser={profile}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;