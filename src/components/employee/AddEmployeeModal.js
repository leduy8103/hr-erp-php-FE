import React, { useState, useEffect } from "react";
import BaseModal from "./BaseModal";
import TabNavigation from "./TabNavigation";
import EmployeeInfoForm from "./EmployeeInfoForm";
import AccountInfoForm from "./AccountInfoForm";
import employeeService from "../../services/employeeService";

const tabs = [
  { id: "employee", label: "Employee Information" },
  { id: "account", label: "Account Access" },
];

const AddEmployeeModal = ({
  isOpen,
  onRequestClose,
  initialFormData,
  onSubmit,
  isEditMode = false,
}) => {
  const [activeTab, setActiveTab] = useState("employee");
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("Modal props changed:", {
      isOpen,
      isEditMode,
      initialFormData,
    });
    if (initialFormData) {
      console.log("Setting form data to:", initialFormData);
      setFormData({ ...initialFormData });
    } else if (isOpen && !initialFormData) {
      console.log("Resetting form data (add mode)");
      setFormData({ status: "Active" });  // Set default status
    }
  }, [initialFormData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (activeTab === "employee") {
      setActiveTab("account");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditMode) {
        await onSubmit(formData);
      } else {
        // Ensure status is Active for new employees
        const employeeData = {
          ...formData,
          status: "Active",
        };
        const newEmployee = await employeeService.addEmployee(employeeData);
        // Send reset password email and handle response
        // const resetResponse = await employeeService.sendResetPasswordEmail(employeeData.email);
        // console.log('Password reset link sent:', resetResponse.message);
        await onSubmit(newEmployee);
      }
      setFormData({});
      onRequestClose();
    } catch (error) {
      console.error("Error saving employee:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={isEditMode ? "Edit Employee Profile" : "Add New Employee"}>
      {console.log(
        "Rendering modal, isOpen:",
        isOpen,
        "isEditMode:",
        isEditMode
      )}
      <TabNavigation
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={setActiveTab}
      />

      <form className="pb-4" onSubmit={handleSubmit}>
        {activeTab === "employee" && (
          <EmployeeInfoForm formData={formData} onChange={handleInputChange} />
        )}

        {activeTab === "account" && (
          <AccountInfoForm
            formData={formData}
            onChange={handleInputChange}
            isEditMode={isEditMode}
          />
        )}

        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            onClick={onRequestClose}
            disabled={isSubmitting}>
            Cancel
          </button>
          {activeTab === "employee" ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}>
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 flex items-center"
              disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Processing...
                </>
              ) : isEditMode ? (
                "Update"
              ) : (
                "Submit"
              )}
            </button>
          )}
        </div>
      </form>
    </BaseModal>
  );
};

export default AddEmployeeModal;
