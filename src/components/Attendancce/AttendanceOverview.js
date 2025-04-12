import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './css/AttendanceDashboard.css';
import attendanceService from '../../services/attendanceService';

const AttendanceOverview = () => {
  const [activeTheme, setActiveTheme] = useState('light');
  const [currentPage, setCurrentPage] = useState(1);
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Today's date in YYYY-MM-DD format

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate]);
  
  const fetchAttendanceData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await attendanceService.getAllUsersAttendance(selectedDate);
      
      if (response && response.success) {
        console.log('Attendance data:', response);
        setAttendanceData(response.data || []);
      } else {
        setError(response?.message || 'Failed to fetch attendance data');
      }
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError(err.response?.data?.message || 'Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format time for display
  const formatTime = (timeString) => {
    return attendanceService.formatTime(timeString);
  };
  
  // Determine attendance status
  const getAttendanceStatus = (checkInTime) => {
    return attendanceService.getAttendanceStatus(checkInTime);
  };
  
  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  
  const toggleTheme = () => {
    setActiveTheme(activeTheme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <div className={`app-container ${activeTheme}`}>
      <div className="main-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <div className="table-container">
          {isLoading ? (
            <div className="loading-indicator">Loading attendance data...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Check-In Time</th>
                  <th>Check-Out Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.length > 0 ? (
                  attendanceData.map((user) => {
                    // Determine status based on check-in time
                    const status = user.attendance?.check_in_time 
                      ? getAttendanceStatus(user.attendance.check_in_time)
                      : 'Absent';
                    
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="employee-info">
                            <span>{`${user.full_name}`}</span>
                          </div>
                        </td>
                        <td>{user.position || 'N/A'}</td>
                        <td>{user.department || 'N/A'}</td>
                        <td>{user.check_in_time ? formatTime(user.check_in_time) : 'Not checked in'}</td>
                        <td>{user.check_out_time ? formatTime(user.check_out_time) : (user.check_in_time ? 'Working...' : 'N/A')}</td>
                        <td>{user.attendance_status || 'N/A'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">No attendance records found for this date</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        <div className="pagination-container">
          <div className="records-per-page">
            <span>Showing</span>
            <select className="records-select">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
          </div>
          
          <div className="pagination">
            <span className="pagination-info">
              Showing {attendanceData.length > 0 ? `1 to ${Math.min(10, attendanceData.length)} out of ${attendanceData.length}` : '0'} records
            </span>
            <div className="pagination-controls">
              <button className="pagination-button" disabled={currentPage === 1}>
                <ChevronLeft size={16} />
              </button>
              <button className={`pagination-button ${currentPage === 1 ? 'active' : ''}`}>
                1
              </button>
              {attendanceData.length > 10 && (
                <>
                  <button className={`pagination-button ${currentPage === 2 ? 'active' : ''}`}>
                    2
                  </button>
                  <button className={`pagination-button ${currentPage === 3 ? 'active' : ''}`}>
                    3
                  </button>
                  <button className={`pagination-button ${currentPage === 4 ? 'active' : ''}`}>
                    4
                  </button>
                </>
              )}
              <button className="pagination-button" disabled={attendanceData.length <= 10}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceOverview;
