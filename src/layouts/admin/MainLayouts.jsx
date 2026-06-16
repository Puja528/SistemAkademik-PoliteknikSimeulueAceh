import React, { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Loading from '../../components/Loading';

// PERBAIKAN: Tangkap props onLogout di sini
const MainLayouts = ({ onLogout }) => {
  return (
    <div className="flex bg-slate-50 min-h-screen w-full antialiased overflow-x-hidden text-slate-700">
      
      {/* PERBAIKAN: Kirim props onLogout ke Sidebar */}
      <Sidebar onLogout={onLogout} />

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 h-screen overflow-hidden">
        <Navbar />

        <main className="flex-1 w-full overflow-y-auto p-6">
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

    </div>
  );
};

export default MainLayouts;