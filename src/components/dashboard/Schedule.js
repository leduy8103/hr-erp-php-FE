import React from 'react';

const Schedule = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">My Schedule</h2>
        <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
          View All
        </button>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Wednesday, 06 July 2023</span>
          <span className="text-xs bg-purple-100 text-purple-800 py-1 px-2 rounded-full">Today</span>
        </div>
        <ul className="mt-4 space-y-4">
          <li className="flex items-start">
            <div className="mr-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="material-icons text-purple-600 text-sm">event</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">UX/UI Designer Practical Task Review</p>
              <p className="text-xs text-gray-500 mt-1">09:30 AM - 10:30 AM</p>
              <div className="flex items-center mt-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium border-2 border-white">JD</div>
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-medium border-2 border-white">AM</div>
                  <div className="w-6 h-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-medium border-2 border-white">RK</div>
                </div>
                <span className="text-xs text-gray-500 ml-2">+2 more</span>
              </div>
            </div>
          </li>
          <li className="flex items-start">
            <div className="mr-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="material-icons text-blue-600 text-sm">event</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Magento Developer Resume Review</p>
              <p className="text-xs text-gray-500 mt-1">12:00 PM - 12:30 PM</p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="mr-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="material-icons text-green-600 text-sm">event</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Sales Manager Final HR Round</p>
              <p className="text-xs text-gray-500 mt-1">01:30 PM - 02:30 PM</p>
            </div>
          </li>
        </ul>
      </div>
      
      <div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Thursday, 07 July 2023</span>
        </div>
        <ul className="mt-4 space-y-4">
          <li className="flex items-start">
            <div className="mr-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="material-icons text-purple-600 text-sm">event</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Frontend Developer Practical Task Review</p>
              <p className="text-xs text-gray-500 mt-1">09:30 AM - 10:30 AM</p>
            </div>
          </li>
          <li className="flex items-start">
            <div className="mr-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="material-icons text-orange-600 text-sm">event</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">React JS Developer TL Meeting</p>
              <p className="text-xs text-gray-500 mt-1">11:00 AM - 12:00 PM</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Schedule;
