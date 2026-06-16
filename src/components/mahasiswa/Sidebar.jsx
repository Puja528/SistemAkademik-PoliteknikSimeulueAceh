import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// PERBAIKAN: Menambahkan parameter { onLogout } agar fungsi dari App.jsx bisa terbaca di sini
export default function Sidebar({ onLogout }) {
  const location = useLocation();

  // Struktur menu terpetakan lengkap dengan jalur (path) routingnya masing-masing
  const menu = [
    { name: "Dashboard Utama", path: "/mahasiswa" },
    { name: "Kartu Hasil Studi (KHS)", path: "/mahasiswa/khs" },
    { name: "Presensi", path: "/mahasiswa/presensi" }
  ];

  return (
    <aside className="w-64 bg-white border-r border-garis text-teks h-screen sticky top-0 flex flex-col hidden md:flex">
      {/* Bagian Logo Kampus */}
      <div className="p-6 border-b border-garis flex items-center gap-3">
        <div className="w-9 h-9 bg-soft-button rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-xs">
          P
        </div>
        <span className="font-bold tracking-wider text-xs text-soft-dark">POLTEKSIM</span>
      </div>

      {/* Navigasi Menu Menu Utama */}
      <nav className="flex-1 p-4 space-y-1">
        {menu.map((m, i) => {
          // Memeriksa apakah URL browser saat ini cocok dengan jalur menu
          const isActive = location.pathname === m.path;

          return (
            <Link
              key={i}
              to={m.path}
              className={`w-full block px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${isActive
                  ? 'bg-soft-light text-soft-dark'
                  : 'text-teks-samping hover:bg-latar/50 hover:text-teks'
                }`}
            >
              {m.name}
            </Link>
          );
        })}
      </nav>

      {/* Bagian Tombol Keluar */}
      <div className="p-4 border-t border-garis">
        <button
          type="button"
          onClick={onLogout} // <--- Berjalan lancar tanpa eror karena parameter di atas sudah aktif
          className="w-full text-left px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          🚪 Keluar Akun
        </button>
      </div>
    </aside>
  );
}