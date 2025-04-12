import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import cdnService from '../../services/cdnService';
import employeeService from '../../services/employeeService';
import authService from '../../services/authService';

const DocumentList = ({ isDarkMode, currentUser }) => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [userId, setUserId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const fileInputRef = useRef(null);
  const { id: urlUserId } = useParams(); // Get ID from URL if present

  const documentTypes = {
    all: 'All Documents',
    resume: 'Resumes',
    idProof: 'ID Proofs',
    certificate: 'Certificates'
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const currentUserId = authService.getUserIdFromToken();
        const targetUserId = urlUserId || currentUserId;

        // Check if viewing own profile
        setIsCurrentUser(currentUserId === targetUserId);

        // Fetch documents for the appropriate user
        const data = await cdnService.getUserFiles(targetUserId);
        setDocuments(data);
        setUserId(targetUserId);
      } catch (err) {
        setError('Failed to fetch documents');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [urlUserId]);

  const handleUploadClick = (type) => {
    // Only allow upload for current user viewing their own profile
    if (!isCurrentUser) {
      return;
    }
    setSelectedType(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(selectedType, file);
    formData.append('userId', currentUser.id);

    try {
      await cdnService.uploadFile(formData, selectedType);
      // Refresh document list
      const updatedFiles = await cdnService.getUserFiles(currentUser.id);
      setDocuments(updatedFiles);
    } catch (error) {
      console.error('Upload error:', error);
    }

    // Reset input
    e.target.value = '';
  };

  const filteredDocuments = documents.filter(doc => 
    activeTab === 'all' ? true : doc.type === activeTab
  );

  if (loading) {
    return <div className="text-center">Loading documents...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Upload Buttons - Only show for current user */}
      {isCurrentUser && (
        <div className="flex space-x-4 mb-6">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={selectedType === 'resume' ? '.pdf,.doc,.docx' :
                   selectedType === 'idProof' ? '.pdf,.jpg,.jpeg,.png' :
                   selectedType === 'certificate' ? '.pdf,.jpg,.jpeg,.png' : ''}
          />
          <button
            onClick={() => handleUploadClick('resume')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Upload Resume
          </button>
          <button
            onClick={() => handleUploadClick('idProof')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Upload ID Proof
          </button>
          <button
            onClick={() => handleUploadClick('certificate')}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Upload Certificate
          </button>
        </div>
      )}

      {/* Document Type Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <div className="flex space-x-8">
          {Object.entries(documentTypes).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              className={`pb-4 px-1 ${
                activeTab === type
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {doc.name}
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {doc.type}
                </p>
              </div>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
