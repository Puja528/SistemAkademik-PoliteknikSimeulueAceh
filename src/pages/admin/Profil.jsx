import React, { useState, useEffect } from "react";
import { FiUser, FiLock, FiSave } from "react-icons/fi";
import { dashboardAPI } from "../../services/dashboardAdminAPI";

const Profil = () => {
  const [userSession, setUserSession] = useState(null);
  const [profilData, setProfilData] = useState({
    id_admin: "ADM-01",
    nama: "Admin Utama",
    username: "admin@polteksimeulue.ac.id",
    role: "Super Admin"
  });
  
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalNotif, setModalNotif] = useState({
    isOpen: false,
    isSuccess: false,
    title: "",
    message: ""
  });

  useEffect(() => {
    // Memuat session lokal secara aman tanpa hit API profil yang memicu 404
    const localSession = JSON.parse(localStorage.getItem("siakad_session"));
    if (localSession) {
      setUserSession(localSession);
      setProfilData(prev => ({
        ...prev,
        role: localSession.role || prev.role
      }));
    }
    setIsLoading(false);
  }, []);

  const handleUbahPassword = async (e) => {
    e.preventDefault();
    
    if (!passwordBaru && !konfirmasiPassword) {
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Input Kosong",
        message: "Silakan masukkan sandi baru terlebih dahulu jika ingin mengganti password."
      });
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Konfirmasi Gagal",
        message: "Password baru dan konfirmasi password tidak cocok."
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Mengubah password langsung ke tabel users menggunakan ID akun session
      await dashboardAPI.updateAdminPassword(userSession.id, passwordBaru);

      setPasswordBaru("");
      setKonfirmasiPassword("");
      setModalNotif({
        isOpen: true,
        isSuccess: true,
        title: "Password Diubah",
        message: "Kata sandi akun administrator berhasil diperbarui."
      });
    } catch (error) {
      console.error(error);
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Gagal Mengubah Password",
        message: "Terjadi kesalahan sistem saat memperbarui password."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="p-6 text-xs font-bold uppercase tracking-wider text-gray-400">
      Memuat data profil administrator...
    </div>
  );

  return (
    <div className="p-6 flex flex-col gap-6 bg-gray-50/50 min-h-screen font-sans text-xs text-slate-700 w-full">
      
      {/* HEADER BANNER */}
      <div className="rounded-xl p-5 text-white shadow-sm" style={{ background: "linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)" }}>
        <h1 className="text-lg font-black m-0 mb-1 tracking-tight">Pengaturan Profil Admin</h1>
        <p className="text-xs opacity-85 m-0 font-medium">Manajemen identitas internal dan hak akses sistem portal akademik.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* PANEL KIRI: AVATAR DEFAULT (NON-ACTIVE UPLOAD) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center gap-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider self-start">Avatar</span>
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 flex items-center justify-center shadow-inner">
              <span className="text-2xl font-black text-[#1a3a6b] tracking-wider">
                ADM
              </span>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-950 uppercase tracking-tight m-0">{profilData.nama}</h2>
            <p className="text-[11px] font-medium text-slate-400 m-0 mt-0.5">ID Admin: {profilData.id_admin}</p>
          </div>
          <div className="px-3 py-1 bg-blue-50 rounded-full border border-blue-200 text-blue-700 font-bold text-[10px] uppercase tracking-wider">
            {profilData.role}
          </div>
        </div>

        {/* PANEL KANAN: DETAIL AKUN & FORM PASSWORD */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* INFORMASI BIODATA */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <FiUser className="text-[#1a3a6b]" size={14} />
              <span className="text-sm font-bold text-slate-950">Informasi Akun (Read-Only)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Petugas</label>
                <div className="p-2.5 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg font-bold uppercase select-none">
                  {profilData.nama}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Akses</label>
                <div className="p-2.5 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg font-mono font-bold select-none">
                  {profilData.username}
                </div>
              </div>
            </div>
          </div>

          {/* FORM UBAH KATA SANDI */}
          <form onSubmit={handleUbahPassword} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <FiLock className="text-[#1a3a6b]" size={14} />
              <span className="text-sm font-bold text-slate-950">Keamanan Kredensial (Ubah Password)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Password Baru</label>
                <input 
                  type="password" 
                  value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                  placeholder="Masukkan sandi baru..." 
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-400 text-xs font-medium text-slate-700" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Konfirmasi Password</label>
                <input 
                  type="password" 
                  value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  placeholder="Ulangi sandi baru..." 
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-400 text-xs font-medium text-slate-700" 
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] hover:bg-slate-800 text-white font-bold rounded-lg text-xs cursor-pointer">
                <FiSave size={13} />
                {isSubmitting ? "Memproses..." : "Perbarui Password"}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* MODAL NOTIFIKASI */}
      {modalNotif.isOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full text-center flex flex-col items-center gap-3 border border-gray-100">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${modalNotif.isSuccess ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
              {modalNotif.isSuccess ? "✓" : "✕"}
            </div>
            <h3 className="text-sm font-black text-slate-900 m-0 mt-1">{modalNotif.title}</h3>
            <p className="text-xs font-medium text-slate-500 m-0 leading-relaxed">{modalNotif.message}</p>
            <button type="button" onClick={() => setModalNotif(p => ({ ...p, isOpen: false }))} className={`w-full py-2 mt-2 font-bold text-white rounded-xl ${modalNotif.isSuccess ? 'bg-green-600' : 'bg-rose-600'}`}>
              Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profil;