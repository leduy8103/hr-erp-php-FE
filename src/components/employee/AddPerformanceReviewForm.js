import React, { useState } from 'react';
import authService from '../../services/authService';

const AddPerformanceReviewForm = ({ userId, formData, onChange }) => {
  const review_period = ['Monthly', 'Quarterly', 'Yearly'];
  const reviewerId = authService.getUserIdFromToken();
  const [validationStatus, setValidationStatus] = useState({
    score: { isValid: true, message: '' },
    review_period: { isValid: true, message: '' }
  });

  formData.reviewer_id = reviewerId;
  formData.user_id = userId;

  const validateScore = (score) => {
    if (!score) {
      return { isValid: false, message: 'Score is required' };
    }
    const numScore = parseInt(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      return { isValid: false, message: 'Score must be between 0 and 100' };
    }
    return { isValid: true, message: 'Score is valid' };
  };

  const validatePeriod = (period) => {
    if (!period) {
      return { isValid: false, message: 'Review period is required' };
    }
    return { isValid: true, message: 'Review period is valid' };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'score') {
      const scoreStatus = validateScore(value);
      setValidationStatus(prev => ({
        ...prev,
        score: scoreStatus
      }));
    }
    
    if (name === 'review_period') {
      const periodStatus = validatePeriod(value);
      setValidationStatus(prev => ({
        ...prev,
        review_period: periodStatus
      }));
    }

    onChange(e);
  };

  // Get input classes based on validation status
  const getInputClasses = (field) => {
    const baseClasses = "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ";
    if (!formData[field]) return baseClasses + "border-gray-300 focus:ring-green-500";
    return validationStatus[field].isValid
      ? baseClasses + "border-green-500 focus:ring-green-500"
      : baseClasses + "border-red-500 focus:ring-red-500";
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="bg-green-50 rounded-md p-4 mb-4">
          <h3 className="text-sm font-medium text-green-800">Performance Review</h3>
          <p className="text-xs text-green-600 mt-1">
            Provide feedback and rate the employee's performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="number"
              name="user_id"
              value={formData.user_id}
              readOnly
              placeholder="Enter user ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Period</label>
            <select
              name="review_period"
              value={formData.review_period || ''}
              onChange={handleInputChange}
              className={getInputClasses('review_period')}
            >
              <option value="">Select Period</option>
              {review_period.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
            {formData.review_period && !validationStatus.review_period.isValid && (
              <p className="mt-1 text-xs text-red-500">
                {validationStatus.review_period.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
            <input
              type="number"
              name="score"
              value={formData.score || ''}
              onChange={handleInputChange}
              placeholder="Enter score (0-100)"
              className={getInputClasses('score')}
              min="0"
              max="100"
            />
            {formData.score && !validationStatus.score.isValid && (
              <p className="mt-1 text-xs text-red-500">
                {validationStatus.score.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer ID</label>
            <input
              type="number"
              name="reviewer_id"
              value={formData.reviewer_id}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={handleInputChange}
              placeholder="Enter comments about the employee's performance"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="4"
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPerformanceReviewForm;