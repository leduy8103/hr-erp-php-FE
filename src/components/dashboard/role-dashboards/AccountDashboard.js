import React, { useState, useEffect } from 'react';
import StatCard from '../StatCard';
import * as payrollService from '../../../services/payrollService';

const AccountDashboard = () => {
  const [payrollStats, setPayrollStats] = useState({
    totalPayroll: 0,
    pendingPayroll: 0,
    processedPayroll: 0,
    monthlyBudget: 0
  });
  const [recentPayrolls, setRecentPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayrollData = async () => {
      try {
        const statsResponse = await payrollService.getPayrollStatistics();
        if (statsResponse.success) {
          setPayrollStats(statsResponse.data);
        }

        const payrollsResponse = await payrollService.getAllPayrolls();
        if (payrollsResponse.success) {
          setRecentPayrolls(payrollsResponse.data.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching payroll data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, []);

  const stats = [
    { title: 'Total Payroll', value: `$${payrollStats.totalPayroll.toLocaleString()}`, icon: 'payments', color: 'bg-blue-500' },
    { title: 'Pending Payroll', value: payrollStats.pendingPayroll, icon: 'pending_actions', color: 'bg-yellow-500' },
    { title: 'Processed Payroll', value: payrollStats.processedPayroll, icon: 'check_circle', color: 'bg-green-500' },
    { title: 'Monthly Budget', value: `$${payrollStats.monthlyBudget.toLocaleString()}`, icon: 'account_balance', color: 'bg-purple-500' }
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Payroll Dashboard</h2>
        <div className="space-x-2">
          <button className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm hover:bg-blue-700">
            <span className="material-icons text-sm align-middle mr-1">add</span>
            <span>New Payroll</span>
          </button>
          <button className="bg-green-600 text-white rounded-md px-4 py-2 text-sm hover:bg-green-700">
            <span className="material-icons text-sm align-middle mr-1">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.length > 0 ? (
          stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))
        ) : (
          <div className="col-span-4 text-center py-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No payroll statistics available</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Payrolls</h3>
          <div className="overflow-x-auto">
            {recentPayrolls.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPayrolls.map((payroll) => (
                    <tr key={payroll.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{payroll.employee_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">${payroll.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payroll.status === 'Processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payroll.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(payroll.date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No recent payroll records</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountDashboard;
