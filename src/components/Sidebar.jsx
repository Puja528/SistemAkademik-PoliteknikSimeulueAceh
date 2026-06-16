import { BiLogOutCircle } from "react-icons/bi";
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AiOutlineDashboard,
  AiOutlineUser,
  AiOutlineTeam,
  AiOutlineRead,
  AiOutlineFileText
} from 'react-icons/ai';

// PERBAIKAN: Terima props onLogout di sini
const Sidebar = ({ onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <AiOutlineDashboard /> },
    { path: '/admin/mahasiswa', name: 'Data Mahasiswa', icon: <AiOutlineUser /> },
    { path: '/admin/dosen', name: 'Data Dosen', icon: <AiOutlineTeam /> },
    { path: '/admin/jadwal', name: 'Operasi Academic', icon: <AiOutlineRead /> },
    { path: '/admin/nilai', name: 'Publikasi Nilai', icon: <AiOutlineFileText /> },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between md:sticky md:top-0 md:left-0 shrink-0 z-20">
      <div>
        {/* Logo Kampus */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-sm">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none">Portal Kampusku</h2>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">Admin</span>
          </div>
        </div>

        {/* Navigasi Menu */}
        <nav className="p-4 space-y-1.5 flex flex-col">
          {menuItems.map((menu) => {
            const isActive = location.pathname === menu.path;
            return (
              <Link
                key={menu.path}
                to={menu.path}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-200 ${isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`}
              >
                <span className={`text-xl ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  {menu.icon}
                </span>
                {menu.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tombol Logout */}
      <div className="p-4 border-t border-slate-100 mt-auto">
        {/* PERBAIKAN: Mengubah Link menjadi Button dan menambahkan onClick={onLogout} */}
        <button 
          onClick={onLogout} 
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 border-none cursor-pointer text-left bg-transparent"
        >
          <BiLogOutCircle className="text-xl" />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;