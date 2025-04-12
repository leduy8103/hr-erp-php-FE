import React, { useEffect, useState } from 'react';
import prService from '../../services/prService';
import employeeService from '../../services/employeeService';

const PerformanceReviewForm = ({ userId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
              const response = await prService.getPrByUserId(userId);
              // Lấy thông tin reviewer name dựa trên reviewer_id
              const reviewsWithReviewerNames = await Promise.all(
                response.map(async (review) => {
                    try {
                        const reviewer = await employeeService.getEmployeeById(review.reviewer_id);
                        return { ...review, reviewer_name: reviewer.full_name };
                    } catch {
                        return { ...review, reviewer_name: 'Unknown' }; // Nếu không tìm thấy reviewer
                    }
                })
            );
              setReviews(reviewsWithReviewerNames);
            } catch (error) {
              console.error('Error fetching reviews:', error);
              setError(`Error fetching reviews: ${error.message}`);
            } finally {
              setLoading(false);
            }
          };
        fetchReviews();
    }, [userId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }
    if (reviews.length === 0) {
        return (
            <div className="bg-yellow-50 rounded-md p-4">
                <h3 className="text-sm font-medium text-yellow-800">No Reviews Found</h3>
                <p className="text-xs text-yellow-600 mt-1">
                    This user does not have any performance reviews yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="bg-green-50 rounded-md p-4 mb-4">
                <h3 className="text-sm font-medium text-green-800">Performance Reviews</h3>
                <p className="text-xs text-green-600 mt-1">
                    Below is a list of all performance reviews.
                </p>
            </div>

            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Reviewer Name
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Review Date
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Review Period
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Comments
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Performance Rating
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map((review) => (
                        <tr key={review.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                                {review.reviewer_name}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                                {new Date(review.created_at).toLocaleDateString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                                {review.review_period}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                                {review.comments}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                                {review.score} / 100
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PerformanceReviewForm;