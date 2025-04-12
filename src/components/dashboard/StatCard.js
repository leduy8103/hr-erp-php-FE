import React from 'react';

const StatCard = ({ title, value, icon, color, onClick }) => {
  return (
    <div 
      className={`${color} p-6 rounded-lg shadow cursor-pointer transition-transform hover:scale-105`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white text-sm font-medium">{title}</p>
          <p className="text-white text-2xl font-semibold mt-2">{value}</p>
        </div>
        <span className="material-icons text-white text-3xl">{icon}</span>
      </div>
    </div>
  );
};

export default StatCard;
