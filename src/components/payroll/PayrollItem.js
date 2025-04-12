import React from 'react';

const getInitials = (name) => {
  if (!name) return 'U'; // Default to 'U' for Unknown
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2); // Only get max 2 characters
};

const getAvatarColor = (name) => {
  const colors = [
    'bg-blue-500',
    'bg-red-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];

  const index = name?.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0) % colors.length;

  return colors[index] || colors[0];
};

const PayrollItem = ({ payroll, onViewDetails, onDelete, onUpdate, isAdmin = false }) => {
  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4">
        <div className="flex items-center">
          {payroll.employee?.avatar ? (
            <img
              src={payroll.employee.avatar}
              alt={payroll.employee?.full_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(
                payroll.employee?.full_name
              )}`}>
              {getInitials(payroll.employee?.full_name || "Unknown User")}
            </div>
          )}
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {payroll.employee?.full_name || `ID: ${payroll.employee_id}`}
            </p>
            <p className="text-xs text-gray-500">
              {payroll.employee?.email || "N/A"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {formatCurrency(payroll.base_salary)}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {formatCurrency(payroll.net_salary)}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">
          {payroll.deductions ? formatCurrency(payroll.deductions) : "-"}
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(
            payroll.status || "Pending"
          )}`}>
          {payroll.status || "Pending"}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onViewDetails(payroll)}
            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
            Details
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => onUpdate(payroll)}
                className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors">
                Edit
              </button>

              <button
                onClick={() => onDelete(payroll.id)}
                className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors">
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PayrollItem;