import React, { useState } from 'react';
import Sidebar from '../../components/mahasiswa/Sidebar';
import Header from '../../components/mahasiswa/Header';
import { Outlet } from 'react-router-dom'; 

export default function MahasiswaLayout({ onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-latar flex flex-col md:flex-row font-poppins text-teks">
      <Sidebar 
        onLogout={onLogout} 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
}