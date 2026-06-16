import React, { useState } from "react";
import {
  FiGrid,
  FiCalendar,
  FiCheckSquare,
  FiBookOpen,
  FiChevronLeft,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: FiGrid,
    path: "/dosen",
  },
  {
    id: "absensi",
    label: "Kelola Absensi",
    icon: FiCheckSquare,
    path: "/dosen/absensi",
  },
  {
    id: "nilai",
    label: "Kelola Nilai",
    icon: FiBookOpen,
    path: "/dosen/nilai",
  },
  {
    id: "jadwal",
    label: "Jadwal",
    icon: FiCalendar,
    path: "/dosen/jadwal",
  },
];

export default function Sidebar({
  portalName = "POLTEKSIM PORTAL",
  role = "Dosen",
  activeItem = "dashboard",
  onNavChange,
  onLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
  };

  return (
    <aside className="sticky top-0 w-[200px] min-w-[200px] h-screen bg-white border-r border-gray-200 flex flex-col font-sans">
      {/* Logo & Brand */}
      <div className="h-16 px-5 border-b border-gray-200 flex items-center gap-2.5 flex-shrink-0">
        <img
          src="../src/assets/LogoPolteksim.png"
          alt="Polteksim Logo"
          className="w-9 h-9 object-contain"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        {/* Fallback SVG logo */}
        <div className="hidden w-9 h-9 items-center justify-center">
          <svg
            width="36"
            height="36"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="40" rx="6" fill="#1A3A6B" />
            <polygon
              points="20,7 33,29 7,29"
              fill="none"
              stroke="#F0C040"
              strokeWidth="2.2"
            />
            <circle cx="20" cy="20" r="4.5" fill="#F0C040" />
            <rect x="16.5" y="29" width="7" height="5" rx="1" fill="#F0C040" />
          </svg>
        </div>

        <div className="flex flex-col leading-tight">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A3A6B]">
            {portalName}
          </span>
          <span className="text-[11px] text-gray-400">{role}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2.5 overflow-y-auto">
        <ul className="list-none m-0 p-0 flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <li key={id}>
                <button
                  onClick={() => handleNav(path)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border-none cursor-pointer text-[13px] text-left transition-all duration-150 font-sans
                    ${
                      isActive
                        ? "bg-[#EEF4FF] text-blue-600 font-semibold"
                        : "bg-transparent text-gray-500 font-normal hover:bg-gray-100 hover:text-gray-700"
                    }`}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer -  logout*/}
      <div className="p-2.5 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg border-none cursor-pointer text-[13px] text-gray-500 bg-transparent hover:bg-gray-100 hover:text-gray-700 transition-all duration-150 font-sans"
        >
          <FiChevronLeft size={15} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
