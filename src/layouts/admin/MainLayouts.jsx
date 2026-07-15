import React, { lazy, Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';
import Navbar from '../../components/admin/Navbar';
import Loading from '../../components/admin/Loading';

const MainLayouts = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row bg-slate-50 min-h-screen w-full antialiased overflow-x-hidden text-slate-700">
      <Sidebar 
        onLogout={onLogout} 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen md:h-screen overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />
        <main className="flex-1 w-full overflow-y-auto p-4 md:p-6">
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

    </div>
  );
};

export default MainLayouts;