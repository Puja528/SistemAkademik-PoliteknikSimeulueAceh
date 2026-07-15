import React from "react";
import { useLocation } from "react-router-dom";
import { AiOutlineBell } from "react-icons/ai";
import { FiMenu } from "react-icons/fi";

const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();

  const dapatkanJudulHalaman = () => {
    switch (location.pathname) {
      case "/admin/dashboard":
        return "Dashboard";
      case "/admin/mahasiswa":
        return "Data Mahasiswa";
      case "/admin/dosen":
        return "Data Dosen";
      case "/admin/jadwal":
        return "Kelola Jadwal";
      case "/admin/nilai":
        return "Publikasi Nilai";
      default:
        return "POLTEKSIM PORTAL";
    }
  };

  // ── DATA BACKEND: Mengambil session admin jika ada (Opsional) ──
  const localSession = localStorage.getItem("siakad_session");
  const userLogin = localSession ? JSON.parse(localSession) : null;

  const namaUserReal = userLogin?.nama || "Admin";
  const inisialAvatar = namaUserReal.substring(0, 2).toUpperCase(); // Mengambil inisial "AU" atau "AD"

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center sticky top-0 z-10 w-full h-16 shrink-0 font-sans">
      {/* SISI KIRI: Tombol Hamburger & Judul Halaman */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          type="button"
          className="p-1.5 text-slate-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer md:hidden flex-shrink-0"
          aria-label="Open Menu"
        >
          <FiMenu size={18} />
        </button>

        {/* JUDUL HALAMAN */}
        <h1 className="text-[14px] md:text-[15px] font-medium text-slate-800 tracking-wide truncate max-w-[150px] sm:max-w-none m-0">
          {dapatkanJudulHalaman()}
        </h1>
      </div>

      {/* SISI KANAN: Panel Notifikasi & Profil */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Notifikasi Bell */}
        <button
          type="button"
          className="relative text-gray-400 hover:text-[#1a3a6b] transition-colors cursor-pointer p-1"
        >
          <AiOutlineBell className="text-lg" />
          <span className="absolute top-1 right-1 bg-red-500 w-1.5 h-1.5 rounded-full"></span>
        </button>

        {/* Profil Akun (Sama persis skalanya dengan layout Mahasiswa) */}
        <div className="flex items-center gap-2 md:gap-3 border-l border-gray-200 pl-3 md:pl-4">
          {/* Avatar Bulat Inisial */}
          <div className="w-8 h-8 rounded-full bg-[#f0f4f8] text-[#1a3a6b] flex items-center justify-center font-bold text-xs tracking-wider flex-shrink-0 shadow-sm">
            {inisialAvatar}
          </div>

          {/* Detail Nama & Role: Disembunyikan di smartphone kecil agar tidak sesak (Bergeser ke kanan setelah Avatar) */}
          <div className="hidden md:block text-left leading-tight">
            <p className="text-xs font-bold text-gray-800 m-0 mt-0.5">
              {namaUserReal}
            </p>
            <p className="text-[9px] text-slate-400 uppercase font-medium tracking-wider m-0">
              System Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
