import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineBell } from "react-icons/ai";
import { FiMenu } from "react-icons/fi";
import axios from "axios";

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fotoProfil, setFotoProfil] = useState("");

  const dapatkanJudulHalaman = () => {
    switch (location.pathname) {
      case "/dosen":
      case "/dosen/dashboard":
        return "Dashboard";
      case "/dosen/absensi":
      case "/dosen/kelola-absensi":
        return "Kelola Absensi";
      case "/dosen/nilai":
      case "/dosen/kelola-nilai":
        return "Kelola Nilai";
      case "/dosen/jadwal":
        return "Jadwal";
      case "/dosen/profil":
        return "Profil Saya";
      default:
        return "Dashboard";
    }
  };

  const localSession = localStorage.getItem("siakad_session");
  const userLogin = localSession ? JSON.parse(localSession) : null;
  const namaDosenReal = userLogin?.nama || "Dosen";
  const inisialAvatar = namaDosenReal.substring(0, 2).toUpperCase();

  useEffect(() => {
    const ambilFotoDosen = async () => {
      if (!userLogin?.id) return;
      try {
        const PROJECT_ID = "mwkewvjpgcvlwgycdpvo";
        const API_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";
        const urlFilter = `https://${PROJECT_ID}.supabase.co/rest/v1/dosen?user_id=eq.${userLogin.id}`;

        const response = await axios.get(urlFilter, {
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${API_KEY}`,
          },
        });

        if (response.data?.[0]?.foto) {
          setFotoProfil(response.data[0].foto);
        }
      } catch (error) {
        console.error("Gagal memuat foto header dosen:", error);
      }
    };

    ambilFotoDosen();
  }, [location.pathname, userLogin?.id]);

  return (
    <header className="bg-white border-b border-gray-100 px-4 md:px-6 flex justify-between items-center sticky top-0 z-10 w-full h-16 shrink-0 font-sans shadow-sm/5">
      {/* SISI KIRI: Tombol Hamburger & Judul Halaman */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          type="button"
          className="btn btn-ghost btn-xs h-8 w-8 p-0 text-slate-600 md:hidden flex-shrink-0 rounded-lg hover:bg-gray-50"
          aria-label="Open Menu"
        >
          <FiMenu size={18} />
        </button>

        {/* JUDUL HALAMAN */}
        <h1 className="text-xs md:text-[13px] font-bold text-slate-800 uppercase tracking-wider truncate max-w-[150px] sm:max-w-none m-0 flex items-center gap-2">
          <span className="w-1 h-3.5 bg-[#1a3a6b] rounded-full hidden sm:inline-block"></span>
          {dapatkanJudulHalaman()}
        </h1>
      </div>

      {/* SISI KANAN: Panel Notifikasi & Profil */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Notifikasi Bell menggunakan Indicator DaisyUI */}
        <button
          type="button"
          className="btn btn-ghost btn-xs h-8 w-8 p-0 text-gray-400 hover:text-[#1a3a6b] rounded-lg indicator"
        >
          <AiOutlineBell className="text-lg" />
          <span className="indicator-item badge badge-error badge-xs w-2 h-2 p-0 top-2 right-2"></span>
        </button>

        {/* Profil Dosen */}
        <div
          onClick={() => navigate("/dosen/profil")}
          className="flex items-center gap-2 md:gap-3 border-l border-gray-100 pl-3 md:pl-4 cursor-pointer hover:opacity-95 transition-opacity"
        >
          {/* Avatar Bulat DaisyUI */}
          <div className="avatar placeholder flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#f0f4f8] text-[#1a3a6b] font-black text-xs tracking-wider shadow-inner flex items-center justify-center border border-gray-100 overflow-hidden">
              {fotoProfil ? (
                <img
                  src={fotoProfil}
                  alt="Profil Dosen"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{inisialAvatar}</span>
              )}
            </div>
          </div>

          {/* Detail Nama & Role */}
          <div className="hidden md:block text-left leading-tight">
            <p className="text-xs font-bold text-slate-800 m-0 uppercase tracking-wide truncate max-w-[160px]">
              {namaDosenReal}
            </p>
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider m-0 mt-0.5">
              Dosen Pengajar
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;