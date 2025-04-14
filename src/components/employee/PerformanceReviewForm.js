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
                
                // Handle different response formats
                let reviewsData = response;
                
                // If response is an object, check for common wrapper properties
                if (typeof response === 'object' && !Array.isArray(response)) {
                    // Check common API response structures
                    if (response.data) reviewsData = response.data;
                    else if (response.reviews) reviewsData = response.reviews;
                    else if (response.results) reviewsData = response.results;
                }
    
                // Final check if we have an array
                if (!Array.isArray(reviewsData)) {
                    console.error('Could not extract array from response:', response);
                    setError('Invalid response format from server');
                    return;
                }
                
                // Process the reviews
                const reviewsWithReviewerNames = await Promise.all(
                    reviewsData.map(async (review) => {
                        try {
                            const reviewer = await employeeService.getEmployeeById(review.reviewer_id);
                            return { ...review, reviewer_name: reviewer.full_name };
                        } catch (error) {
                            console.error('Error fetching reviewer:', error);
                            return { ...review, reviewer_name: 'Unknown' };
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this performance review?')) {
            try {
                await prService.deletePr(id);
                setReviews(reviews.filter((review) => review.id !== id));
            } catch (error) {
                console.error('Error deleting review:', error);
                alert('Failed to delete the performance review.');
            }
        }
    };

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
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                            Action
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
                            <td className="border border-gray-300 px-4 py-2 text-sm text-gray-700">
                                <button
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition duration-200 flex items-center"
                                    onClick={() => alert('Edit functionality not implemented yet')}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1"
                                        viewBox="0 0 20 20"
                                        fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    Edit
                                </button>
                                <button
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition duration-200 flex items-center"
                                    onClick={() => handleDelete(review.id)}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1"
                                        viewBox="0 0 20 20"
                                        fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M10 2a1 1 0 00-1 1v1H5a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1h-4V3a1 1 0 00-1-1zm-3 5a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H8a1 1 0 01-1-1V7z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PerformanceReviewForm;