import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { AiOutlineBell } from "react-icons/ai";
import { FiMenu } from "react-icons/fi";
import axios from "axios"; // Tambahkan axios untuk mengambil foto real-time

export default function Header({ toggleSidebar }) {
  const location = useLocation();
  const [fotoProfil, setFotoProfil] = useState(""); // State untuk menyimpan URL foto terbaru

  // Menyelaraskan teks judul halaman termasuk halaman profil baru
  const dapatkanJudulHalaman = () => {
    switch (location.pathname) {
      case "/mahasiswa":
      case "/mahasiswa/dashboard":
        return "Dashboard Utama";
      case "/mahasiswa/presensi":
        return "Presensi";
      case "/mahasiswa/khs":
        return "Kartu Hasil Studi (KHS)";
      case "/mahasiswa/transkrip":
        return "Transkrip Nilai";
      case "/mahasiswa/profil":
        return "Profil Mahasiswa";
      default:
        return "POLTEKSIM PORTAL";
    }
  };

  // ── DATA BACKEND: Mengambil data akun yang sedang login dari local session ──
  const localSession = localStorage.getItem("siakad_session");
  const userLogin = localSession ? JSON.parse(localSession) : null;
  const namaUserReal = userLogin?.nama || "Mahasiswa";
  const inisialAvatar = namaUserReal.substring(0, 3).toUpperCase();

  // ── AMBIL FOTO REAL-TIME DARI SUPABASE ──
  useEffect(() => {
    const ambilFotoTerbaru = async () => {
      if (!userLogin?.id) return;
      try {
        const PROJECT_ID = "mwkewvjpgcvlwgycdpvo";
        const API_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";
        const urlFilter = `https://${PROJECT_ID}.supabase.co/rest/v1/mahasiswa?user_id=eq.${userLogin.id}`;
        
        const response = await axios.get(urlFilter, {
          headers: {
            apikey: API_KEY,
            Authorization: `Bearer ${API_KEY}`,
          }
        });
        
        if (response.data?.[0]?.foto) {
          setFotoProfil(response.data[0].foto);
        }
      } catch (error) {
        console.error("Gagal memuat foto header:", error);
      }
    };

    ambilFotoTerbaru();
    
    // Opsional: Cek perubahan foto setiap kali lokasi halaman berubah
  }, [location.pathname, userLogin?.id]);

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex justify-between items-center sticky top-0 z-10 w-full h-16 shrink-0 font-sans">
      {/* SISI KIRI: Tombol Hamburger & Judul Halaman Dinamis */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          type="button"
          className="p-1.5 text-slate-600 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer md:hidden flex-shrink-0"
          aria-label="Open Menu"
        >
          <FiMenu size={18} />
        </button>

        <h1 className="text-[14px] md:text-[15px] font-medium text-slate-800 tracking-wide truncate max-w-[150px] sm:max-w-none m-0">
          {dapatkanJudulHalaman()}
        </h1>
      </div>

      {/* SISI KANAN: Panel Notifikasi & Profil Mahasiswa */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Notifikasi Bell */}
        <button
          type="button"
          className="relative text-gray-400 hover:text-[#1a3a6b] transition-colors cursor-pointer p-1"
        >
          <AiOutlineBell className="text-lg" />
          <span className="absolute top-1 right-1 bg-red-500 w-1.5 h-1.5 rounded-full"></span>
        </button>

        {/* Profil Akun */}
        <Link 
          to="/mahasiswa/profil" 
          className="flex items-center gap-2 md:gap-3 border-l border-gray-200 pl-3 md:pl-4 hover:opacity-85 transition-opacity cursor-pointer text-decoration-none"
        >
          {/* STRUKTUR ASLI TETAP SAMA: Ditambahkan pengkondisian tag <img> jika fotoProfil tersedia */}
          <div className="w-8 h-8 rounded-full bg-[#f0f4f8] text-[#1a3a6b] flex items-center justify-center font-bold text-xs tracking-wider flex-shrink-0 shadow-sm overflow-hidden">
            {fotoProfil ? (
              <img src={fotoProfil} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              inisialAvatar
            )}
          </div>

          {/* Detail Nama */}
          <div className="hidden md:block text-left leading-tight">
            <p className="text-xs font-bold text-gray-800 m-0 mt-0.5">
              {namaUserReal}
            </p>
            <p className="text-[9px] text-slate-400 uppercase font-medium tracking-wider m-0">
             
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}