import React from 'react';
import authService from '../../services/authService';

const AddPerformanceReviewForm = ({ userId,formData, onChange }) => {
  const review_period = ['Monthly', 'Quarterly', 'Yearly'];
  const reviewerId = authService.getUserIdFromToken(); // Automatically set to the logged-in user's ID
  formData.reviewer_id = reviewerId;
  formData.user_id = userId;
  return (
    <div className="space-y-8">
      {/* Performance Review Section */}
      <div>
        <div className="bg-green-50 rounded-md p-4 mb-4">
          <h3 className="text-sm font-medium text-green-800">Performance Review</h3>
          <p className="text-xs text-green-600 mt-1">
            Provide feedback and rate the employee's performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input
              type="number"
              name="user_id"
              value={formData.user_id}
              readOnly
              placeholder="Enter user ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Review Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Period</label>
            <select
              name="review_period"
              value={formData.review_period}
              onChange={onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Period</option>
              {review_period.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>

          {/* Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Score</label>
            <input
              type="number"
              name="score"
              value={formData.score || ''}
              onChange={onChange}
              placeholder="Enter score"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Reviewer ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer ID</label>
            <input
              type="number"
              name="reviewer_id"
              value={formData.reviewer_id} // Automatically set to the logged-in user's ID
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none"
            />
          </div>
          {/* Comments */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
            <textarea
              name="comments"
              value={formData.comments}
              onChange={onChange}
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
