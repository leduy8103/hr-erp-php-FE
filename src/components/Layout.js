// filepath: d:\React\hr-erp-frontend\src\components\Layout.js
import React from 'react';
import Sidebar from './dashboard/Sidebar';
import Header from './dashboard/Header';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;