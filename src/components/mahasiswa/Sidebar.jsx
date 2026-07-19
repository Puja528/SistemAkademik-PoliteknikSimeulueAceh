import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FiGrid, 
  FiCheckSquare, 
  FiFileText, 
  FiAward, 
  FiChevronLeft, 
  FiX 
} from 'react-icons/fi';

const Sidebar = ({ 
  portalName = "POLTEKSIM PORTAL", 
  role = "Mahasiswa", 
  onLogout,
  isOpen,         
  toggleSidebar 
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: "/mahasiswa", name: "Dashboard Utama", icon: <FiGrid size={17} /> },
    { path: "/mahasiswa/presensi", name: "Presensi", icon: <FiCheckSquare size={17} /> },
    { path: "/mahasiswa/khs", name: "Kartu Hasil Studi", icon: <FiFileText size={17} /> },
    { path: "/mahasiswa/transkrip", name: "Transkrip Nilai", icon: <FiAward size={17} /> }
  ];

  const handleNav = (path) => {
    navigate(path);
    if (toggleSidebar && isOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Overlay menggunakan utilitas DaisyUI backdrop blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden transition-opacity duration-200"
          onClick={toggleSidebar} 
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 md:sticky top-0 w-[200px] min-w-[200px] h-screen bg-white border-r border-gray-100 flex flex-col font-sans transition-transform duration-300 ease-in-out shadow-xs
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}>
        <div className="flex flex-col flex-1">
          {/* 1. LOGO & BRAND */}
          <div className="h-16 px-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <img
                src="../src/assets/LogoPolteksim.png"
                alt="Polteksim Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              {/* Logo SVG cadangan ditambahkan flex items-center justify-center agar ikon berada tepat di tengah */}
              <div className="hidden w-8 h-8 items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 40 40" fill="none" className="flex items-center justify-center">
                  <rect width="40" height="40" rx="6" fill="#1A3A6B" />
                  <polygon points="20,7 33,29 7,29" fill="none" stroke="#F0C040" strokeWidth="2.2" />
                  <circle cx="20" cy="20" r="4.5" fill="#F0C040" />
                </svg>
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1A3A6B]">
                  {portalName}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{role}</span>
              </div>
            </div>

            <button 
              onClick={toggleSidebar}
              className="btn btn-ghost btn-xs h-7 w-7 p-0 md:hidden text-slate-400 hover:text-slate-600 rounded-lg"
              aria-label="Close Menu"
            >
              <FiX size={16} />
            </button>
          </div>

          {/* 2. NAVIGASI MENU */}
          <nav className="p-2.5 flex flex-col gap-1">
            {menuItems.map((menu) => {
              const isActive = location.pathname === menu.path;
              return (
                <button
                  key={menu.path}
                  onClick={() => handleNav(menu.path)}
                  className={`btn btn-xs h-9 justify-start gap-2.5 px-3 rounded-lg border-none normal-case text-xs text-left transition-all duration-150 font-sans shadow-none
                    ${isActive
                      ? "bg-[#f0f4f8] text-[#1a3a6b] font-bold hover:bg-[#f0f4f8]"
                      : "bg-transparent text-slate-500 font-medium hover:bg-gray-50 hover:text-slate-800"
                    }`}
                >
                  <span className={isActive ? 'text-[#1a3a6b]' : 'text-slate-400'}>
                    {menu.icon}
                  </span>
                  <span>{menu.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 3. FOOTER LOGOUT */}
        <div className="p-2.5 border-t border-gray-100 mt-auto">
          <button
            type="button"
            onClick={onLogout}
            className="btn btn-xs h-9 w-full justify-start gap-2 px-3 rounded-lg border-none normal-case text-xs text-slate-500 bg-transparent hover:bg-rose-50 hover:text-rose-600 transition-all duration-150 font-sans shadow-none"
          >
            <FiChevronLeft size={15} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;