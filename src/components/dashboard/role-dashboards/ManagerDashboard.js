import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../StatCard';
import employeeService from '../../../services/employeeService';
import projectService from '../../../services/projectService';
import attendanceService from '../../../services/attendanceService';
import authService from '../../../services/authService';

const ManagerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const userId = authService.getUserIdFromToken();
        const token = authService.getToken();

        // Get projects and attendance data in parallel
        const [projectsResponse, attendanceResponse] = await Promise.all([
          projectService.getProjectByManager(userId, token),
          attendanceService.getAllUsersAttendance()
        ]);

        const projects = Array.isArray(projectsResponse) ? projectsResponse : 
                        (projectsResponse?.data || []);

        // Get team members for each project
        const membersPromises = projects.map(project => 
          projectService.getProjectMembers(project.id, token)
        );
        const projectsMembers = await Promise.all(membersPromises);
        
        // Calculate unique team members
        const uniqueMembers = new Set();
        projectsMembers.forEach(members => {
          members.forEach(member => uniqueMembers.add(member.user_id));
        });

        // Convert Set to Array for easier use
        const teamMemberIds = Array.from(uniqueMembers);

        // Filter attendance for team members only
        const attendance = Array.isArray(attendanceResponse) ? attendanceResponse : 
                         (attendanceResponse?.data || []);
        const teamAttendanceToday = attendance.filter(record => 
          teamMemberIds.includes(record.user_id) && 
          record.check_in_time && 
          !record.check_out_time
        );

        setStats([
          { 
            title: 'Team Members', 
            value: uniqueMembers.size.toString(), 
            icon: 'groups', 
            color: 'bg-blue-500' 
          },
          { 
            title: 'My Projects', 
            value: projects.length.toString(), 
            icon: 'work', 
            color: 'bg-purple-500' 
          },
          { 
            title: 'Present Today', 
            value: teamAttendanceToday.length.toString(), 
            icon: 'check_circle', 
            color: 'bg-green-500' 
          }
        ]);

        // Update team attendance display with only team members
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayRecords = attendance
          .filter(record => {
            const recordDate = new Date(record.check_in_time);
            recordDate.setHours(0, 0, 0, 0);
            return recordDate.getTime() === today.getTime() && 
                   teamMemberIds.includes(record.user_id);
          });

        const attendancePromises = todayRecords
          .slice(0, 5)
          .map(async record => ({
            id: record.id,
            employee: await employeeService.getEmployeeNameById(record.user_id),
            time: attendanceService.formatTime(record.check_in_time),
            date: attendanceService.formatDate(record.check_in_time)
          }));

        const resolvedAttendance = await Promise.all(attendancePromises);
        setTeamAttendance(resolvedAttendance);
        
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
      case 'Team Members':
        navigate('/team');
        break;
      case 'My Projects':
        navigate('/projects');
        break;
      case 'Present Today':
        navigate('/team-attendance');
        break;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Manager Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.length > 0 ? (
          stats.map((stat, index) => (
            <StatCard 
              key={index} 
              {...stat} 
              onClick={() => handleStatClick(stat.title)}
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No statistics available</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Team Attendance Today</h3>
          <div className="overflow-x-auto">
            {teamAttendance.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamAttendance.map((activity) => (
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
                <p className="text-gray-500">No attendance records for today</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerDashboard;
