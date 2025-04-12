import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Badge, Button, Form, Alert, Spinner, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaClock, FaFlag } from 'react-icons/fa';
import taskService from '../../services/taskService';
import authService from '../../services/authService';
import employeeService from '../../services/employeeService';
import projectService from '../../services/projectService';

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assigneeName, setAssigneeName] = useState('');
  const [userRole, setUserRole] = useState(authService.getUserRole());
  const [members, setMembers] = useState([]);
  const [memberNames, setMemberNames] = useState({});
  const [priorityOptions] = useState(['High', 'Medium', 'Low']);
  const [statusOptions] = useState(['In Progress', 'Completed']);
  const isManagerOrAdmin = ['Admin', 'Manager'].includes(userRole);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // First fetch task data
        const taskData = await taskService.getTaskById(taskId, authService.getToken());
        setTask(taskData);

        // Then fetch project members if we have project_id
        if (taskData.project_id) {
          const projectMembers = await projectService.getProjectMembers(taskData.project_id, authService.getToken());
          setMembers(projectMembers || []);

          // Fetch names for assignee and members
          const memberIds = [...new Set([
            ...projectMembers.map(m => m.user_id),
            taskData.user_id
          ].filter(Boolean))];
          
          const names = await Promise.all(
            memberIds.map(id => employeeService.getEmployeeNameById(id))
          );
          
          const namesMap = memberIds.reduce((acc, id, index) => {
            acc[id] = names[index];
            return acc;
          }, {});
          
          setMemberNames(namesMap);
          setAssigneeName(namesMap[taskData.user_id] || 'Unassigned');
        }
      } catch (err) {
        setError('Failed to load task details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (taskId) {
      fetchData();
    }
  }, [taskId]);

  const handleStatusChange = async (e) => {
    try {
      const newStatus = e.target.value;
      await taskService.updateTaskStatus(taskId, { status: newStatus }, authService.getToken());
      setTask(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      setError('Failed to update status');
      console.error(err);
    }
  };

  const handlePriorityChange = async (e) => {
    try {
      const newPriority = e.target.value;
      await taskService.updateTaskPriority(taskId, { priority: newPriority }, authService.getToken());
      setTask(prev => ({ ...prev, priority: newPriority }));
    } catch (err) {
      setError('Failed to update priority');
      console.error(err);
    }
  };

  const handleAssigneeChange = async (e) => {
    try {
      const newAssigneeId = e.target.value;
      await taskService.assignTask(taskId, { user_id: newAssigneeId }, authService.getToken());
      setTask(prev => ({ ...prev, user_id: newAssigneeId }));
      setAssigneeName(memberNames[newAssigneeId] || 'Unassigned');
    } catch (err) {
      setError('Failed to update assignee');
      console.error(err);
    }
  };

  const getBadgeVariant = (status) => {
    return {
      'In Progress': 'primary',
      'Completed': 'success'
    }[status] || 'secondary';
  };

  const getPriorityColor = (priority) => {
    return {
      'High': 'text-red-600 bg-red-50 border-red-200',
      'Medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'Low': 'text-green-600 bg-green-50 border-green-200'
    }[priority] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger" className="mx-auto max-w-3xl mt-4">{error}</Alert>;
  if (!task) return <Alert variant="warning" className="mx-auto max-w-3xl mt-4">Task not found</Alert>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="link" 
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tasks
          </Button>
          <div className="h-6 w-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">Task #{taskId}</span>
        </div>
        <div className="flex space-x-3">
          {!isManagerOrAdmin && task.status !== 'Completed' && (
            <Button
              variant="success"
              className="px-4 py-2 rounded-md"
              onClick={() => handleStatusChange({ target: { value: 'Completed' } })}
            >
              Complete Task
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{task.project?.name || 'No Project'}</span>
                    <span>•</span>
                    <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {isManagerOrAdmin && (
                  <div className={`px-4 py-2 rounded-full border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </div>
                )}
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {task.description || 'No description provided'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              {isManagerOrAdmin ? (
                <Form.Select 
                  value={task.status}
                  onChange={handleStatusChange}
                  className="w-full rounded-lg border-gray-300"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Select>
              ) : (
                <Badge bg={getBadgeVariant(task.status)} className="px-3 py-2">
                  {task.status}
                </Badge>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start space-x-3">
                <FaUser className="w-5 h-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Assigned to</p>
                  {isManagerOrAdmin ? (
                    <Form.Select
                      value={task.user_id || ''}
                      onChange={handleAssigneeChange}
                      className="mt-1 w-full rounded-lg border-gray-300"
                    >
                      <option value="">Unassigned</option>
                      {members.map(member => (
                        <option key={member.user_id} value={member.user_id}>
                          {memberNames[member.user_id] || `Member ${member.user_id}`}
                        </option>
                      ))}
                    </Form.Select>
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{assigneeName}</p>
                  )}
                </div>
              </div>

              {isManagerOrAdmin && (
                <div className="flex items-start space-x-3">
                  <FaFlag className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Priority</p>
                    <Form.Select
                      value={task.priority}
                      onChange={handlePriorityChange}
                      className="mt-1 w-full rounded-lg border-gray-300"
                    >
                      {priorityOptions.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </Form.Select>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <FaCalendarAlt className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Due Date</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <FaClock className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Created by</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {task.creator?.name || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;