import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../StatCard';
import attendanceService from '../../../services/attendanceService';
import { getUserLeaveRequests } from '../../../services/leaveService';
import taskService from '../../../services/taskService';
import authService from '../../../services/authService';
import projectService from '../../../services/projectService';

const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userId = authService.getUserIdFromToken();
        const token = authService.getToken();

        const [attendanceResponse, leaveResponse, tasksResponse] = await Promise.all([
          attendanceService.getCurrentUserAttendance(),
          getUserLeaveRequests(),
          taskService.getTasksByUser(userId, token)
        ]);

        const currentAttendance = Array.isArray(attendanceResponse) ? attendanceResponse[0] : 
                                (attendanceResponse?.data || {});

        setAttendance(currentAttendance);
        
        const leaves = Array.isArray(leaveResponse) ? leaveResponse : 
                      (leaveResponse?.data || []);

        setStats([
          { title: 'Today Status', value: currentAttendance?.status || 'Not Checked In', icon: 'event_available', color: 'bg-blue-500' },
          { title: 'Leave Requests', value: leaves.length.toString(), icon: 'calendar_today', color: 'bg-purple-500' },
          { title: 'Pending Leaves', value: leaves.filter(l => l.status === 'Pending').length.toString(), icon: 'pending_actions', color: 'bg-yellow-500' }
        ]);

        setLeaveHistory(
          leaves.slice(0, 5).map(leave => ({
            id: leave.id,
            type: leave.leave_type,
            from: new Date(leave.start_date).toLocaleDateString(),
            to: new Date(leave.end_date).toLocaleDateString(),
            status: leave.status
          }))
        );

        const userTasks = Array.isArray(tasksResponse) ? tasksResponse :
                         (tasksResponse?.data || []);
        
        // Get project names for each task
        const tasksWithProjects = await Promise.all(
          userTasks
            .filter(task => !task.is_deleted)
            .slice(0, 5)
            .map(async task => ({
              ...task,
              project_name: await projectService.getProjectNameById(task.project_id, token)
            }))
        );
        
        setTasks(tasksWithProjects);

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
      case 'Leave Requests':
        navigate('/my-leaves');
        break;
      case 'Pending Leaves':
        navigate('/leave-requests');
        break;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Dashboard</h2>
        <div className="space-x-2">
          {!attendance?.checkedIn && (
            <button 
              onClick={() => attendanceService.checkIn({})}
              className="bg-green-600 text-white rounded-md px-4 py-2 text-sm hover:bg-green-700"
            >
              <span className="material-icons text-sm align-middle mr-1">login</span>
              <span>Check In</span>
            </button>
          )}
          {attendance?.checkedIn && !attendance?.checkedOut && (
            <button 
              onClick={() => attendanceService.checkOut({})}
              className="bg-red-600 text-white rounded-md px-4 py-2 text-sm hover:bg-red-700"
            >
              <span className="material-icons text-sm align-middle mr-1">logout</span>
              <span>Check Out</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard 
            key={index} 
            {...stat} 
            onClick={() => handleStatClick(stat.title)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Leave History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaveHistory.map((leave) => (
                  <tr key={leave.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{leave.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{leave.from}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{leave.to}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        leave.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                        leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">My Tasks</h3>
          <div className="overflow-x-auto">
            {tasks.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{task.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{task.project_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No tasks assigned</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeDashboard;
