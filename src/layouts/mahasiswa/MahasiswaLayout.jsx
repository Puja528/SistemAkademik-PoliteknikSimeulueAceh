import React from 'react';
import Sidebar from '../../components/mahasiswa/Sidebar';
import Header from '../../components/mahasiswa/Header';

export default function MahasiswaLayout({ children }) {
  return (
    <div className="min-h-screen bg-latar flex font-poppins text-teks">
      {/* Kiri: Navigasi Sidebar */}
      <Sidebar />
      
      {/* Kanan: Area Konten */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}