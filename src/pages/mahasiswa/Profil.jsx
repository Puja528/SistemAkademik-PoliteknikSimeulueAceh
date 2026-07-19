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
        const rawSession = localStorage.getItem("siakad_session");
        if (!rawSession) {
          setIsLoading(false); 
          return;
        }

        const localSession = JSON.parse(rawSession);
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
        console.error("Gagal memuat profil mahasiswa:", error);
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
    
    const trimmedPassword = passwordBaru.trim();
    const trimmedKonfirmasi = konfirmasiPassword.trim();

    if (!trimmedPassword || !trimmedKonfirmasi) {
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Input Tidak Valid",
        message: "Silakan isi password baru dan konfirmasi password Anda tanpa spasi kosong."
      });
      return;
    }

    if (trimmedPassword.length < 6) {
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Sandi Terlalu Lemah",
        message: "Demi keamanan akun, password baru minimal harus terdiri dari 6 karakter."
      });
      return;
    }

    if (trimmedPassword !== trimmedKonfirmasi) {
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Konfirmasi Gagal",
        message: "Password baru dan konfirmasi password tidak cocok. Silakan periksa kembali."
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const urlUpdatePassword = `${USERS_URL}?id=eq.${userSession.id}`;
      await axios.patch(urlUpdatePassword, { password: trimmedPassword }, { headers });

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
    <div className="p-6 text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-center items-center h-40">
      <div className="loading loading-spinner loading-xs text-[#1a3a6b] mr-2"></div>
      Memuat data profil mahasiswa...
    </div>
  );

  return (
    <main className="p-6 bg-gray-50/50 min-h-screen font-sans text-xs text-slate-700 w-full flex flex-col gap-6 animate-fadeIn">
      
      {/* Banner Atas Terbuka */}
      <div className="rounded-xl p-6 text-white shadow-sm flex flex-col justify-center" style={{ background: "linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)" }}>
        <h1 className="text-sm font-black m-0 mb-1 uppercase tracking-wide">Pengaturan Profil Mahasiswa</h1>
        <p className="text-[11px] opacity-80 m-0 font-medium uppercase tracking-wider">Perbarui pasfoto resmi dan kontrol keamanan informasi akademik pribadi Anda di sini.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* FOTO PROFIL */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm flex flex-col items-center text-center gap-4">
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
            <label className="absolute bottom-1 right-1 bg-[#1a3a6b] text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-slate-800 transition-colors btn btn-circle btn-xs h-7 w-7 border-none">
              <FiCamera size={13} />
              <input type="file" accept="image/*" onChange={handleGantiFoto} disabled={isSubmitting} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-950 uppercase tracking-tight m-0">{profilData.nama || "Nama Mahasiswa"}</h2>
            <p className="text-[11px] font-bold text-slate-400 m-0 mt-0.5 font-mono">NIM. {profilData.id_mahasiswa || "-"}</p>
          </div>
          <span className="badge badge-outline border-emerald-200 bg-emerald-50 text-emerald-700 px-2.5 py-2 text-[10px] font-black tracking-wide uppercase">
            Mahasiswa Aktif
          </span>
        </div>

        {/* DETAILS & SECURITY */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* BIODATA */}
          <div className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <FiUser className="text-[#1a3a6b]" size={14} />
              <span className="text-xs font-bold text-slate-950 uppercase tracking-wide">Biodata Akademik</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Lengkap</label>
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-bold text-slate-800 uppercase text-xs">{profilData.nama || "-"}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">NIM (Nomor Induk Mahasiswa)</label>
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-mono font-bold text-slate-800 text-xs">{profilData.id_mahasiswa || "-"}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Program Studi</label>
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-semibold text-slate-700 text-xs">{profilData.program_studi || "-"}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Angkatan Masuk</label>
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-semibold text-slate-700 text-xs font-mono">{profilData.angkatan || "-"}</div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Korespondensi</label>
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-medium text-slate-600 text-xs">{profilData.email || "-"}</div>
              </div>
            </div>
          </div>

          {/* SECURITY */}
          <form onSubmit={handleUbahPassword} className="bg-white rounded-xl border border-gray-200/80 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <FiLock className="text-[#1a3a6b]" size={14} />
              <span className="text-xs font-bold text-slate-950 uppercase tracking-wide">Keamanan Sandi</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Password Baru</label>
                <input 
                  type="password" 
                  value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                  placeholder="Sandi baru (min. 6 karakter)..." 
                  className="w-full input input-bordered input-xs h-[34px] bg-gray-50 text-xs font-medium text-slate-700 rounded-lg focus:outline-none focus:border-slate-400 focus:bg-white transition" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Konfirmasi Password</label>
                <input 
                  type="password" 
                  value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  placeholder="Ulangi sandi baru..." 
                  className="w-full input input-bordered input-xs h-[34px] bg-gray-50 text-xs font-medium text-slate-700 rounded-lg focus:outline-none focus:border-slate-400 focus:bg-white transition" 
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="btn btn-xs h-8 px-4 bg-[#1a3a6b] hover:bg-slate-800 disabled:bg-gray-200 text-white font-bold rounded-lg normal-case border-none gap-2 shadow-sm"
              >
                <FiSave size={13} />
                {isSubmitting ? "Memproses..." : "Perbarui Password"}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* NOTIF MODAL DIALINE KE DAISYUI MODAL UTILITY */}
      {modalNotif.isOpen && (
        <div className="modal modal-open backdrop-blur-sm bg-slate-950/40 z-50 transition-all duration-200">
          <div className="modal-box max-w-sm bg-white rounded-2xl p-6 shadow-xl border border-gray-100 text-center flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black ${
              modalNotif.isSuccess 
                ? 'bg-green-50 border border-green-200 text-green-600' 
                : 'bg-rose-50 border border-rose-200 text-rose-600'
            }`}>
              {modalNotif.isSuccess ? "✓" : "✕"}
            </div>
            <h3 className="text-xs font-black text-slate-900 m-0 mt-1 uppercase tracking-wide">{modalNotif.title}</h3>
            <p className="text-xs font-medium text-slate-500 m-0 leading-relaxed">{modalNotif.message}</p>
            <div className="modal-action w-full mt-2">
              <button 
                type="button"
                onClick={() => setModalNotif(p => ({ ...p, isOpen: false }))} 
                className={`btn btn-xs h-9 w-full font-bold text-white rounded-xl normal-case border-none transition shadow-sm ${
                  modalNotif.isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};

export default ProfilMahasiswa;