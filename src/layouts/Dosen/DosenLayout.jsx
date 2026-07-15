import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Dosen/Sidebar";
import Header from "../../components/Dosen/Header";

export default function DosenLayout({ onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f4f6f9]">
      <Sidebar 
        onLogout={onLogout} 
        role="Dosen" 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}