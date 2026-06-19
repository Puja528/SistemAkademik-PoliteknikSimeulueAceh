import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Dosen/Sidebar";
import Header from "../../components/Dosen/Header";

export default function DosenLayout({ onLogout }) {
  return (
    <div className="flex min-h-screen bg-[#f4f6f9]">
      <Sidebar onLogout={onLogout} role="Dosen" />

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}