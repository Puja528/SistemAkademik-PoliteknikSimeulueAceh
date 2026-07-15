import React, { useState, useEffect } from "react"; // 1. Tambahkan useState & useEffect
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineBell } from "react-icons/ai";
import { FiMenu } from "react-icons/fi";
import axios from "axios"; // 2. Tambahkan import axios

const Header = ({ toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fotoProfil, setFotoProfil] = useState(""); // State untuk menyimpan URL foto dosen

  // Menyelaraskan teks judul halaman dengan rute menu dosen Anda
  const dapatkanJudulHalaman = () => {
    switch (location.pathname) {
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

  // ── DATA BACKEND: Mengambil session dosen murni jika ada (Opsional) ──
  const localSession = localStorage.getItem("siakad_session");
  const userLogin = localSession ? JSON.parse(localSession) : null;
  const namaDosenReal = userLogin?.nama || "Dosen";

  // Mengambil 3 inisial huruf dari nama dosen, default 'DJS' jika data kosong
  const inisialAvatar = userLogin?.nama
    ? userLogin.nama.substring(0, 3).toUpperCase()
    : "DJS";

  // ── AMBIL FOTO REAL-TIME DARI SUPABASE DOSEN ──
  useEffect(() => {
    const ambilFotoDosen = async () => {
      if (!userLogin?.id) return;
      try {
        const PROJECT_ID = "mwkewvjpgcvlwgycdpvo";
        const API_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";
        // Sesuaikan dengan nama tabel dosen di Supabase Anda (contoh menggunakan tabel 'dosen')
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
    <header
      className="
    sticky top-0
    z-50
    isolate
    bg-white
    border-b border-gray-200
    px-4 md:px-6
    py-3
    flex justify-between items-center
    w-full h-16 shrink-0
    font-sans
    shadow-sm
  "
    >
      {/* SISI KIRI: Tombol Hamburger & Judul Halaman */}
      <div className="flex items-center gap-3">
        {/* Tombol Hamburger: Muncul otomatis jika di HP */}
        <button
          onClick={toggleSidebar}
          type="button"
          className="p-1.5 text-slate-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer md:hidden flex-shrink-0"
          aria-label="Open Menu"
        >
          <FiMenu size={18} />
        </button>

        {/* JUDUL HALAMAN: Menggunakan font-medium 15px tipis agar rapi */}
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

        {/* Profil Dosen */}
        <div
          onClick={() => navigate("/dosen/profil")}
          className="flex items-center gap-2 md:gap-3 border-l border-gray-200 pl-3 md:pl-4 cursor-pointer hover:opacity-85 transition-opacity"
        >
          {/* Avatar Bulat Inisial (Ditambahkan overflow-hidden dan kondisi penampil <img>) */}
          <div className="w-8 h-8 rounded-full bg-[#f0f4f8] text-[#1a3a6b] flex items-center justify-center font-bold text-xs tracking-wider flex-shrink-0 shadow-sm overflow-hidden">
            {fotoProfil ? (
              <img
                src={fotoProfil}
                alt="Profil Dosen"
                className="w-full h-full object-cover"
              />
            ) : (
              inisialAvatar
            )}
          </div>

          {/* Informasi Identitas Dosen */}
          <div className="hidden md:block text-left leading-tight">
            <p className="text-xs font-bold text-gray-800 m-0 mt-0.5">
              {namaDosenReal}
            </p>
            <p className="text-[9px] text-slate-400 uppercase font-medium tracking-wider m-0">
              Senior Lecture
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
