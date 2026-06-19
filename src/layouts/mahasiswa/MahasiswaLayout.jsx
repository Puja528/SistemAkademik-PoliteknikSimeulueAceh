import React from 'react';
import Sidebar from '../../components/mahasiswa/Sidebar';
import Header from '../../components/mahasiswa/Header';
import { Outlet } from 'react-router-dom'; 

export default function MahasiswaLayout({ onLogout }) {
  return (
    <div className="min-h-screen bg-latar flex font-poppins text-teks">
      <Sidebar onLogout={onLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}