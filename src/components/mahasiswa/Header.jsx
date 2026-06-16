import React from 'react';

export default function Header() {
  // ── MODIFIKASI BACKEND: Ambil data akun yang sedang login dari local session ──
  const localSession = localStorage.getItem("siakad_session");
  const userLogin = localSession ? JSON.parse(localSession) : null;
  
  // Ambil nama dan NIM asli dari data tabel users saat login sukses (misal: Kiki)
  const namaUserReal = userLogin?.nama || "Mahasiswa";
  const emailUserReal = userLogin?.email || "mahasiswa@polteksim.ac.id";
  
  // Membuat inisial avatar (contoh: Kiki -> K, Zaki -> Z)
  const inisialAvatar = namaUserReal.substring(0, 2).toUpperCase();

  return (
    <header className="h-20 bg-white border-b border-garis px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <p className="text-[10px] text-teks-samping uppercase font-medium tracking-wider">Selamat Datang Kembali</p>
        {/* DATA DINAMIS DB: Menampilkan nama asli user yang login */}
        <h1 className="font-bold text-teks text-base">{namaUserReal}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          {/* DATA DINAMIS DB: Menampilkan email akses user login */}
          <p className="text-xs font-bold text-teks">{emailUserReal}</p>
          <p className="text-[10px] text-soft-dark font-bold bg-soft-light px-2 py-0.5 rounded-sm mt-0.5 capitalize">
            {userLogin?.role || "Mahasiswa"}
          </p>
        </div>
        {/* AVATAR DINAMIS: Otomatis berubah sesuai huruf depan nama mahasiswa */}
        <div className="w-10 h-10 bg-soft-light rounded-full border border-garis flex items-center justify-center text-sm font-bold text-soft-dark">
          {inisialAvatar}
        </div>
      </div>
    </header>
  );
}