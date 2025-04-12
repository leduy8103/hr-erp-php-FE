import React, { useRef } from 'react';
import cdnService from "../../services/cdnService";

const UploadFilesForm = ({
  formData,
  onFileChange,
  onMultipleFileChange,
  onRemoveFile,
}) => {
  const profilePictureRef = useRef(null);
  const resumeRef = useRef(null);
  const idProofRef = useRef(null);
  const certificatesRef = useRef(null);

  const handleFileInputChange = async (e, fieldName, multiple = false) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      const userId = formData.id; // Get userId from formData
      
      if (multiple) {
        const uploadPromises = files.map(file => {
          const fileFormData = new FormData();
          fileFormData.append('certificate', file);
          fileFormData.append('userId', userId);
          return cdnService.uploadFile(fileFormData, 'certificate');
        });
        const results = await Promise.all(uploadPromises);
        onMultipleFileChange(fieldName, results);
      } else {
        const fileFormData = new FormData();
        fileFormData.append(fieldName, files[0]);
        fileFormData.append('userId', userId);
        const url = await cdnService.uploadFile(fileFormData, fieldName);
        onFileChange(fieldName, url);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const triggerFileInput = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  const getFileName = (file) => {
    if (!file) return "";
    return typeof file === "string" ? file.split("/").pop() : file.name;
  };

  const getFileSize = (file) => {
    if (!file || typeof file === "string") return "";

    const sizeInKB = file.size / 1024;
    if (sizeInKB < 1024) {
      return `${sizeInKB.toFixed(2)} KB`;
    } else {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-700">Employee Documents</h3>
      <p className="text-sm text-gray-500">
        Upload important documents for the employee record.
      </p>

      {/* Profile Picture Upload */}
      <div className="border border-dashed border-gray-300 rounded-lg p-6">
        <div className="flex flex-col items-center">
          <div className="mb-4">
            {formData.profilePicture ? (
              <div className="relative">
                <img
                  src={
                    typeof formData.profilePicture === "string"
                      ? formData.profilePicture
                      : URL.createObjectURL(formData.profilePicture)
                  }
                  alt="Profile preview"
                  className="h-32 w-32 rounded-full object-cover border-2 border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => onRemoveFile("profilePicture")}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center">
                <svg
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>
          <h4 className="text-sm font-medium text-gray-700">Profile Picture</h4>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Upload a profile photo of the employee
          </p>
          <input
            ref={profilePictureRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileInputChange(e, "profilePicture")}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => triggerFileInput(profilePictureRef)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            {formData.profilePicture ? "Change Photo" : "Upload Photo"}
          </button>
        </div>
      </div>

      {/* Resume Upload */}
      <div className="border border-dashed border-gray-300 rounded-lg p-6">
        <div className="flex flex-col items-center">
          {formData.resume ? (
            <div className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-md mb-4">
              <div className="flex items-center">
                <svg
                  className="h-8 w-8 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {getFileName(formData.resume)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getFileSize(formData.resume)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveFile("resume")}
                className="p-1 text-red-500 hover:text-red-700 focus:outline-none">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="mb-4">
              <svg
                className="h-12 w-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          )}
          <h4 className="text-sm font-medium text-gray-700">Resume / CV</h4>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Upload employee's resume or CV (PDF, DOC, DOCX)
          </p>
          <input
            ref={resumeRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => handleFileInputChange(e, "resume")}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => triggerFileInput(resumeRef)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            {formData.resume ? "Replace Resume" : "Upload Resume"}
          </button>
        </div>
      </div>

      {/* ID Proof Upload */}
      <div className="border border-dashed border-gray-300 rounded-lg p-6">
        <div className="flex flex-col items-center">
          {formData.idProof ? (
            <div className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-md mb-4">
              <div className="flex items-center">
                <svg
                  className="h-8 w-8 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {getFileName(formData.idProof)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getFileSize(formData.idProof)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveFile("idProof")}
                className="p-1 text-red-500 hover:text-red-700 focus:outline-none">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="mb-4">
              <svg
                className="h-12 w-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            </div>
          )}
          <h4 className="text-sm font-medium text-gray-700">ID Proof</h4>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Upload government ID proof (Passport, DL, etc.)
          </p>
          <input
            ref={idProofRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileInputChange(e, "idProof")}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => triggerFileInput(idProofRef)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            {formData.idProof ? "Replace ID" : "Upload ID"}
          </button>
        </div>
      </div>

      {/* Certificates Upload */}
      <div className="border border-dashed border-gray-300 rounded-lg p-6">
        <div className="flex flex-col items-center">
          {formData.certificates && formData.certificates.length > 0 ? (
            <div className="w-full space-y-2 mb-4">
              {formData.certificates.map((cert, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center">
                    <svg
                      className="h-8 w-8 text-blue-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">
                        {getFileName(cert)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getFileSize(cert)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveFile("certificates", index)}
                    className="p-1 text-red-500 hover:text-red-700 focus:outline-none">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-4">
              <svg
                className="h-12 w-12 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </div>
          )}
          <h4 className="text-sm font-medium text-gray-700">
            Certificates & Qualifications
          </h4>
          <p className="text-xs text-gray-500 mt-1 mb-3">
            Upload multiple certificates (PDF, JPG, PNG)
          </p>
          <input
            ref={certificatesRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            onChange={(e) => handleFileInputChange(e, "certificates", true)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => triggerFileInput(certificatesRef)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Add Certificate
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFilesForm;