import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../StatCard';
import employeeService from '../../../services/employeeService';
import projectService from '../../../services/projectService';
import { getAllLeaveRequests, processLeaveRequest, getLeaveBalance, requestLeave, getUserLeaveRequests } from '../../../services/leaveService';
import attendanceService from '../../../services/attendanceService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data in parallel
        const [employeesResponse, projectsResponse, leavesResponse, attendanceResponse] = await Promise.all([
          employeeService.getEmployees(),
          projectService.getProjects(),
          getAllLeaveRequests(),
          attendanceService.getAllUsersAttendance()
        ]);

        // Extract data arrays safely
        const employees = Array.isArray(employeesResponse) ? employeesResponse : 
                         (employeesResponse?.data || []);
        const projects = Array.isArray(projectsResponse) ? projectsResponse : 
                        (projectsResponse?.data || []);
        const leaves = Array.isArray(leavesResponse) ? leavesResponse : 
                      (leavesResponse?.data || []);
        const attendance = Array.isArray(attendanceResponse) ? attendanceResponse : 
                         (attendanceResponse?.data || []);

        // Set stats with safe array operations
        setStats([
          { 
            title: 'Total Employees', 
            value: (employees?.length || 0).toString(), 
            icon: 'people', 
            color: 'bg-blue-500' 
          },
          { 
            title: 'Active Projects', 
            value: (projects?.length || 0).toString(), 
            icon: 'work', 
            color: 'bg-purple-500' 
          },
          { 
            title: 'Pending Leaves', 
            value: (leaves?.filter(leave => leave?.status === 'Pending')?.length || 0).toString(), 
            icon: 'pending_actions', 
            color: 'bg-yellow-500' 
          },
          { 
            title: 'Present Today', 
            value: (attendance?.filter(a => a?.check_in_time && !a?.check_out_time)?.length || 0).toString(), 
            icon: 'check_circle', 
            color: 'bg-green-500' 
          }
        ]);

        // Set leave requests with employee names
        const leaveRequestPromises = leaves
          .filter(leave => leave?.status === 'Pending')
          .slice(0, 5)
          .map(async leave => ({
            id: leave.id,
            employee: await employeeService.getEmployeeNameById(leave.user_id),
            type: leave.leave_type,
            from: new Date(leave.start_date).toLocaleDateString(),
            to: new Date(leave.end_date).toLocaleDateString(),
            status: leave.status
          }));

        const resolvedLeaveRequests = await Promise.all(leaveRequestPromises);
        setLeaveRequests(resolvedLeaveRequests);

        // Debug logs for initial attendance data
        console.log('Raw attendance data:', attendance);
        
        // Get today's date at midnight for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter for today's attendance records
        const todayRecords = attendance.filter(record => {
          const recordDate = new Date(record.check_in_time);
          recordDate.setHours(0, 0, 0, 0);
          return recordDate.getTime() === today.getTime();
        });

        console.log('Today\'s attendance records:', todayRecords);

        // Process recent activity from today's records with employee names
        const recentActivityPromises = todayRecords
          .slice(0, 5)
          .map(async record => ({
            id: record.id,
            employee: await employeeService.getEmployeeNameById(record.id),
            time: attendanceService.formatTime(record.check_in_time),
            date: attendanceService.formatDate(record.check_in_time)
          }));

        const resolvedActivity = await Promise.all(recentActivityPromises);
        console.log('Processed activity records:', resolvedActivity);
        setRecentActivity(resolvedActivity);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleStatClick = (statTitle) => {
    switch (statTitle) {
      case 'Total Employees':
        navigate('/employees');
        break;
      case 'Active Projects':
        navigate('/projects');
        break;
      case 'Pending Leaves':
        navigate('/leave-requests');
        break;
      case 'Present Today':
        navigate('/attendance');
        break;
    }
  };

  const handleLeaveAction = async (requestId, action) => {
    try {
      await processLeaveRequest({
        requestId,
        status: action === 'approve' ? 'Approved' : 'Rejected'
      });
      
      // Refresh leave requests with employee names
      const newLeavesResponse = await getAllLeaveRequests();
      const newLeaves = Array.isArray(newLeavesResponse) ? newLeavesResponse : 
                       (newLeavesResponse?.data || []);
      
      const newLeaveRequestPromises = newLeaves
        .filter(leave => leave?.status === 'Pending')
        .slice(0, 5)
        .map(async leave => ({
          id: leave.id,
          employee: await employeeService.getEmployeeNameById(leave.user_id),
          type: leave.leave_type,
          from: new Date(leave.start_date).toLocaleDateString(),
          to: new Date(leave.end_date).toLocaleDateString(),
          status: leave.status
        }));

      const resolvedNewLeaves = await Promise.all(newLeaveRequestPromises);
      setLeaveRequests(resolvedNewLeaves);
    } catch (error) {
      console.error('Error processing leave request:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
        <div className="space-x-2">
          <button className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm hover:bg-blue-700">
            <span className="material-icons text-sm align-middle mr-1">person_add</span>
            <span>Add Employee</span>
          </button>
          <button className="bg-purple-600 text-white rounded-md px-4 py-2 text-sm hover:bg-purple-700">
            <span className="material-icons text-sm align-middle mr-1">assessment</span>
            <span>Generate Reports</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.length > 0 ? (
          stats.map((stat, index) => (
            <StatCard 
              key={index} 
              {...stat} 
              onClick={() => handleStatClick(stat.title)}
            />
          ))
        ) : (
          <div className="col-span-4 text-center py-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No statistics available</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Leave Requests</h3>
          <div className="overflow-x-auto">
            {leaveRequests.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{request.employee}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{request.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{request.from} to {request.to}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => handleLeaveAction(request.id, 'approve')}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleLeaveAction(request.id, 'reject')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No pending leave requests</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Employee Activity</h3>
          <div className="overflow-x-auto">
            {recentActivity.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentActivity.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{activity.employee}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{activity.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{activity.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
