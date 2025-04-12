import React from 'react';

const ProjectTeamTab = ({ members, memberNames, isManager, onAddMember, onRemoveMember }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Team Members</h2>
        {isManager && (
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={onAddMember}
          >
            Add Member
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No members in this project yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {members.map((member) => (
            <div key={member.userId} className="py-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                  {memberNames[member.user_id]?.charAt(0) || 'U'}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-800">{memberNames[member.user_id] || 'Loading...'}</p>
                  <p className="text-sm text-gray-500">{member.role || 'Team Member'}</p>
                </div>
              </div>
              {isManager && (
                <button 
                  className="text-red-500 hover:text-red-700"
                  onClick={() => onRemoveMember(member.userId)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectTeamTab;
