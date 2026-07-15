import React, { useState, useEffect } from "react";
import { FiUser, FiLock, FiCamera, FiSave } from "react-icons/fi";
import axios from "axios";

const PROJECT_ID = "mwkewvjpgcvlwgycdpvo";
const API_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";
const BASE_URL = `https://${PROJECT_ID}.supabase.co/rest/v1/mahasiswa`;
const STORAGE_URL = `https://${PROJECT_ID}.supabase.co/storage/v1/object`;
const USERS_URL = `https://${PROJECT_ID}.supabase.co/rest/v1/users`;

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

const ProfilMahasiswa = () => {
  const [userSession, setUserSession] = useState(null);
  const [profilData, setProfilData] = useState({
    id_mahasiswa: "",
    nama: "",
    program_studi: "",
    angkatan: "",
    email: "",
    foto: ""
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
    const muatProfil = async () => {
      try {
        setIsLoading(true);
        const localSession = JSON.parse(localStorage.getItem("siakad_session"));
        if (!localSession) return;
        
        setUserSession(localSession);
        
        const urlFilter = `${BASE_URL}?user_id=eq.${localSession.id}`;
        const response = await axios.get(urlFilter, { headers });
        const data = response.data[0];

        if (data) {
          setProfilData({
            id_mahasiswa: data.id_mahasiswa || "",
            nama: data.nama || "",
            program_studi: data.program_studi || "",
            angkatan: data.angkatan || "",
            email: data.email || "",
            foto: data.foto || ""
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    muatProfil();
  }, []);

  const handleGantiFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "File Terlalu Besar",
        message: "Ukuran pasfoto maksimal adalah 2 Megabytes (2MB)."
      });
      return;
    }

    const currentNim = profilData.id_mahasiswa;
    if (!currentNim) {
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Gagal Mengidentifikasi",
        message: "NIM Mahasiswa tidak ditemukan di sistem."
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `${currentNim}-${Date.now()}.${fileExt}`;

      const uploadUrl = `${STORAGE_URL}/akademik-avatar/${fileName}`;
      const fileBuffer = await file.arrayBuffer();
      
      await axios.post(uploadUrl, fileBuffer, {
        headers: {
          ...headers,
          "Content-Type": file.type,
          "x-upsert": "true"
        }
      });

      const publicUrl = `https://${PROJECT_ID}.supabase.co/storage/v1/object/public/akademik-avatar/${fileName}`;

      const urlUpdate = `${BASE_URL}?id_mahasiswa=eq.${currentNim}`;
      await axios.patch(urlUpdate, { foto: publicUrl }, { headers });

      setProfilData((prev) => ({ ...prev, foto: publicUrl }));
      setModalNotif({
        isOpen: true,
        isSuccess: true,
        title: "Foto Diperbarui",
        message: "Foto profil Anda berhasil diunggah."
      });
    } catch (error) {
      console.error(error);
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Gagal Unggah Foto",
        message: error.response?.data?.message || "Terjadi kesalahan sistem."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUbahPassword = async (e) => {
    e.preventDefault();
    if (!passwordBaru || !konfirmasiPassword) {
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Input Kosong",
        message: "Silakan isi password baru dan konfirmasi password Anda."
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
      const urlUpdatePassword = `${USERS_URL}?id=eq.${userSession.id}`;
      await axios.patch(urlUpdatePassword, { password: passwordBaru }, { headers });

      setPasswordBaru("");
      setKonfirmasiPassword("");
      setModalNotif({
        isOpen: true,
        isSuccess: true,
        title: "Password Diubah",
        message: "Kata sandi akun Anda berhasil diperbarui."
      });
    } catch (error) {
      console.error(error);
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Gagal Mengubah Password",
        message: error.message || "Terjadi kesalahan sistem."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="p-6 text-xs font-bold uppercase tracking-wider text-gray-400">
      Memuat data profil mahasiswa...
    </div>
  );

  return (
    <div className="p-6 flex flex-col gap-6 bg-[#f4f6f9] min-h-screen font-sans text-xs text-slate-700 w-full">
      
      <div className="rounded-xl p-5 text-white shadow-sm" style={{ background: "linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)" }}>
        <h1 className="text-lg font-black m-0 mb-1 tracking-tight">Pengaturan Profil Mahasiswa</h1>
        <p className="text-xs opacity-85 m-0 font-medium">Perbarui pasfoto resmi informasi akademik pribadi Anda di sini.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* FOTO PROFIL */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center gap-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider self-start">Foto Utama</span>
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 flex items-center justify-center shadow-inner">
              {profilData.foto ? (
                <img src={profilData.foto} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-[#1a3a6b] tracking-wider">
                  {profilData.nama ? profilData.nama.substring(0, 3).toUpperCase() : "MHS"}
                </span>
              )}
            </div>
            <label className="absolute bottom-1 right-1 bg-[#1a3a6b] text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-slate-800 transition-colors">
              <FiCamera size={14} />
              <input type="file" accept="image/*" onChange={handleGantiFoto} disabled={isSubmitting} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-950 uppercase tracking-tight m-0">{profilData.nama || "Nama Mahasiswa"}</h2>
            <p className="text-[11px] font-medium text-slate-400 m-0 mt-0.5">NIM. {profilData.id_mahasiswa || "-"}</p>
          </div>
          <div className="px-3 py-1 bg-green-50 rounded-full border border-green-200 text-green-700 font-bold text-[10px] uppercase tracking-wider">
            MAHASISWA AKTIF
          </div>
        </div>

        {/* DETAILS & SECURITY */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* BIODATA */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <FiUser className="text-[#1a3a6b]" size={14} />
              <span className="text-sm font-bold text-slate-950">Biodata Akademik</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Lengkap</label>
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-bold text-slate-800 uppercase">{profilData.nama || "-"}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">NIM (Nomor Induk Mahasiswa)</label>
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-mono font-bold text-slate-800">{profilData.id_mahasiswa || "-"}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Program Studi</label>
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-semibold text-slate-700">{profilData.program_studi || "-"}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Angkatan Masuk</label>
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-semibold text-slate-700">{profilData.angkatan || "-"}</div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Korespodensi</label>
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-medium text-slate-600">{profilData.email || "-"}</div>
              </div>
            </div>
          </div>

          {/* SECURITY */}
          <form onSubmit={handleUbahPassword} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <FiLock className="text-[#1a3a6b]" size={14} />
              <span className="text-sm font-bold text-slate-950">Keamanan Sandi</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Password Baru</label>
                <input 
                  type="password" 
                  value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                  placeholder="Sandi baru..." 
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-400 text-xs font-medium text-slate-700" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Konfirmasi Password</label>
                <input 
                  type="password" 
                  value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  placeholder="Ulangi sandi..." 
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

      {/* NOTIF MODAL */}
      {modalNotif.isOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full text-center flex flex-col items-center gap-3 border border-gray-100">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${modalNotif.isSuccess ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
              {modalNotif.isSuccess ? "✓" : "✕"}
            </div>
            <h3 className="text-sm font-black text-slate-900 m-0 mt-1">{modalNotif.title}</h3>
            <p className="text-xs font-medium text-slate-500 m-0 leading-relaxed">{modalNotif.message}</p>
            <button onClick={() => setModalNotif(p => ({ ...p, isOpen: false }))} className={`w-full py-2 mt-2 font-bold text-white rounded-xl ${modalNotif.isSuccess ? 'bg-green-600' : 'bg-rose-600'}`}>
              Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilMahasiswa;