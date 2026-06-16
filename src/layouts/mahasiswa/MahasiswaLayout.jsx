import React from 'react';
import Sidebar from '../../components/mahasiswa/Sidebar';
import Header from '../../components/mahasiswa/Header';
// PERBAIKAN: Import Outlet dari react-router-dom
import { Outlet } from 'react-router-dom'; 

// PERBAIKAN: Hapus parameter children, ganti dengan Outlet di dalam return
export default function MahasiswaLayout({ onLogout }) {
  return (
    <div className="min-h-screen bg-latar flex font-poppins text-teks">
      {/* Kiri: Navigasi Sidebar */}
      <Sidebar onLogout={onLogout} />
      
      {/* Kanan: Area Konten */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* PERBAIKAN: Ganti {children} menjadi <Outlet /> agar nested route di App.jsx bekerja */}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}