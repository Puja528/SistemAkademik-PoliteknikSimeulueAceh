import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiGrid, FiCheckSquare, FiFileText, FiAward, FiChevronLeft, FiX } from 'react-icons/fi'; // Menambahkan ikon FiX

export default function Sidebar({ 
  portalName = "POLTEKSIM PORTAL", 
  role = "Mahasiswa", 
  onLogout,
  isOpen,         
  toggleSidebar 
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const daftarMenu = [
    { name: "Dashboard Utama", path: "/mahasiswa", icon: <FiGrid size={17} /> },
    { name: "Presensi", path: "/mahasiswa/presensi", icon: <FiCheckSquare size={17} /> },
    { name: "Kartu Hasil Studi", path: "/mahasiswa/khs", icon: <FiFileText size={17} /> },
    { name: "Transkrip Nilai", path: "/mahasiswa/transkrip", icon: <FiAward size={17} /> }
  ];

  const handleNav = (path) => {
    navigate(path);
    if (toggleSidebar && isOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={toggleSidebar} 
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 md:sticky top-0 w-[200px] min-w-[200px] h-screen bg-white border-r border-gray-200 flex flex-col font-sans transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}>
        <div className="flex flex-col flex-1">
          {/* LOGO & BRAND */}
          <div className="h-16 px-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src="../src/assets/LogoPolteksim.png"
                alt="Polteksim Logo"
                className="w-9 h-9 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="hidden w-9 h-9 items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                  <rect width="40" height="40" rx="6" fill="#1A3A6B" />
                  <polygon points="20,7 33,29 7,29" fill="none" stroke="#F0C040" strokeWidth="2.2" />
                  <circle cx="20" cy="20" r="4.5" fill="#F0C040" />
                </svg>
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A3A6B]">
                  {portalName}
                </span>
                <span className="text-[11px] text-gray-400">{role}</span>
              </div>
            </div>

            <button 
              onClick={toggleSidebar}
              className="md:hidden p-1 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              aria-label="Close Menu"
            >
              <FiX size={18} />
            </button>
          </div>

          <nav className="p-2.5 flex flex-col gap-0.5">
            {daftarMenu.map((m, i) => {
              const isActive = location.pathname === m.path;
              return (
                <button
                  key={i}
                  onClick={() => handleNav(m.path)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border-none cursor-pointer text-[13px] text-left transition-all duration-150 font-sans
                    ${isActive
                      ? "bg-[#f0f4f8] text-[#1a3a6b] font-bold"
                      : "bg-transparent text-gray-500 font-normal hover:bg-gray-50 hover:text-gray-800"
                    }`}
                >
                  <span className={isActive ? 'text-[#1a3a6b]' : 'text-gray-400'}>
                    {m.icon}
                  </span>
                  <span className="truncate">{m.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-2.5 border-t border-gray-200 mt-auto">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg border-none cursor-pointer text-[13px] text-gray-500 bg-transparent hover:bg-red-50 hover:text-red-600 transition-all duration-150 font-sans"
          >
            <FiChevronLeft size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}