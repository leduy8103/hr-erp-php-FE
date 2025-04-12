import React, { useState } from 'react';
import BaseModal from './BaseModal';
import TabNavigation from './TabNavigation';
import PerformanceReviewForm from './PerformanceReviewForm';
import AddPerformanceReviewForm from './AddPerformanceReviewForm';
import prService from '../../services/prService';

// Update the initialFormState to include all user attributes
const initialFormState = {
  user_id: '',
  review_period: '',
  score: '',
  reviewer_id: '',
  comments: ''
};

const tabs = [
  { id: 'performance', label: 'Employee Performance Review' },
  { id: 'add', label: 'Add New Performance Review' }
];

const AddPerformanceReviewModal = ({ isOpen, onRequestClose, userId }) => { // Nhận userId từ props
  const [activeTab, setActiveTab] = useState('performance');
  const [formData, setFormData] = useState(initialFormState);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Inside your component
  const handleNext = (e) => {
    // Add this to prevent any default behavior or propagation
    e.preventDefault();
    e.stopPropagation();
    
    if (activeTab === 'performance') {
      setActiveTab('add');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
       console.log('Form Data before submission:', formData);
      // Xử lý giá trị rỗng trước khi gửi\
      const dataToSubmit = {
        ...formData,
        score: formData.score ? parseInt(formData.score, 10) : null, // Chuyển đổi score thành số hoặc null
        user_id: formData.user_id || null, // Đảm bảo user_id không rỗng
        created_at: new Date().toISOString() // Đảm bảo created_at là ngày hiện tại
      };
  
      const response = await prService.addPr(dataToSubmit);
      console.log('Performance Review added:', response);
      setFormData(initialFormState); // Reset form
      onRequestClose(); // Close modal after submission
    } catch (error) {
      console.error('Error adding Performance Review:', error);
      // Hiển thị thông báo lỗi nếu cần
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title="Performance Review"
    >
      <TabNavigation 
        activeTab={activeTab} 
        tabs={tabs} 
        onTabChange={setActiveTab} 
      />

<form className="pb-4" onSubmit={handleSubmit}>
        {activeTab === 'performance' && (
          <PerformanceReviewForm 
            userId={userId} // Truyền userId vào PerformanceReviewForm
          />
        )}
        
        {activeTab === 'add' && (
          <AddPerformanceReviewForm 
            userId={userId}
            formData={formData} 
            onChange={handleInputChange} 
          />
        )}
        
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button 
            type="button" 
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" 
            onClick={onRequestClose}
          >
            Cancel
          </button>
          {activeTab !== 'add' ? (
            <button 
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next
            </button>
          ) : (
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </BaseModal>
  );
};

export default AddPerformanceReviewModal;