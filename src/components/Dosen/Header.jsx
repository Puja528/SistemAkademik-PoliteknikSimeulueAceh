import { FiChevronDown, FiBell, FiSearch } from "react-icons/fi";
import React, { useState } from "react";

export default function Header() {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 gap-4 font-sans flex-shrink-0">

      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <FiSearch
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Cari mata kuliah, capaian..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-3.5 rounded-lg border border-gray-200 bg-gray-50 text-[13px] text-gray-700 outline-none focus:border-blue-300 transition-colors"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">

        {/* Notification Bell */}
        <button className="relative p-1 text-gray-500 rounded-md hover:bg-gray-100 transition-colors">
          <FiBell size={19} />
          <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-gray-200" />

        {/* Profile */}
        <button className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-gray-100 transition-colors">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-lg bg-[#1a3a6b] flex items-center justify-center text-white text-[11px] font-bold tracking-wide flex-shrink-0">
            DJS
          </div>

          {/* Name & Role */}
          <div className="text-left leading-tight">
            <p className="text-[13px] font-semibold text-gray-900 m-0">Dr. John Smith</p>
            <p className="text-[11px] text-gray-400 m-0">Senior Lecturer</p>
          </div>

          <FiChevronDown size={15} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
}
