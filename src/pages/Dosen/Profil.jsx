import React, { useState, useEffect } from "react";
import { FiUser, FiLock, FiCamera, FiSave, FiAlertCircle } from "react-icons/fi";
import { dosenAPI } from "../../services/dosenAPI";

const Profil = () => {
  const [userSession, setUserSession] = useState(null);
  const [profilData, setProfilData] = useState({
    nidn: "",
    nama: "",
    program_studi: "",
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
        
        // Mengambil data profil berdasarkan id user session
        const data = await dosenAPI.fetchDosenByUserId(localSession.id);
        if (data) {
          setProfilData({
            nidn: data.nidn || "",
            nama: data.nama || "",
            program_studi: data.program_studi || "",
            email: data.email || "",
            foto: data.foto || ""
          });
        }
      } catch (error) {
        console.error("Gagal memuat profil:", error);
      } finally {
        setIsLoading(false);
      }
    };
    muatProfil();
  }, []);

  // ✅ HANDLER UNTUK UNGGAH FOTO PROFIL VIA AXIOS & NIDN
  const handleGantiFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Batasi ukuran file maksimal 2MB
    if (file.size > 2 * 1024 * 1024) {
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "File Terlalu Besar",
        message: "Ukuran pasfoto maksimal adalah 2 Megabytes (2MB)."
      });
      return;
    }

    // Ambil NIDN dari data profil yang sedang aktif di state lokal
    const currentNidn = profilData.nidn;
    
    if (!currentNidn) {
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Gagal Mengidentifikasi",
        message: "NIDN Dosen tidak ditemukan di sistem. Gagal memperbarui foto."
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const fileExt = file.name.split('.').pop().toLowerCase();
      // Gunakan NIDN langsung sebagai nama file agar rapi di storage
      const fileName = `${currentNidn}-${Date.now()}.${fileExt}`;

      // Panggil fungsi upload dari dosenAPI via Axios dengan parameter NIDN
      const urlFotoBaru = await dosenAPI.uploadFotoProfil(file, fileName, currentNidn);

      // Perbarui state lokal jika sukses
      setProfilData((prev) => ({ ...prev, foto: urlFotoBaru }));
      setModalNotif({
        isOpen: true,
        isSuccess: true,
        title: "Foto Diperbarui",
        message: "Foto profil Anda berhasil diunggah dan disimpan ke database dosen."
      });
    } catch (error) {
      console.error(error);
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Gagal Unggah Foto",
        message: error.message || "Terjadi kesalahan pada server penyimpanan."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ HANDLER UNTUK UBAH PASSWORD (DENGAN VALIDASI YANG DIPERKETAT)
  const handleUbahPassword = async (e) => {
    e.preventDefault();
    
    const trimmedPassword = passwordBaru.trim();
    const trimmedKonfirmasi = konfirmasiPassword.trim();

    // 1. Validasi input kosong (mencegah bypass menggunakan spasi)
    if (!trimmedPassword || !trimmedKonfirmasi) {
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Input Tidak Valid",
        message: "Silakan isi password baru dan konfirmasi password Anda tanpa spasi kosong."
      });
      return;
    }

    // 2. Validasi panjang password minimal demi keamanan akun
    if (trimmedPassword.length < 6) {
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Sandi Terlalu Lemah",
        message: "Demi keamanan akun, password baru minimal harus terdiri dari 6 karakter."
      });
      return;
    }

    // 3. Validasi kecocokan password
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
      
      // Panggil fungsi patch password manual berdasarkan ID user via Axios
      await dosenAPI.ubahPasswordUser(userSession.id, trimmedPassword);

      setPasswordBaru("");
      setKonfirmasiPassword("");
      setModalNotif({
        isOpen: true,
        isSuccess: true,
        title: "Password Diubah",
        message: "Kata sandi akun Anda berhasil diperbarui di database."
      });
    } catch (error) {
      console.error(error);
      setModalNotif({
        isOpen: true,
        isSuccess: false,
        title: "Gagal Mengubah Password",
        message: error.message || "Terjadi kesalahan sistem saat memperbarui password."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <div className="p-6 text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
      Memuat data profil...
    </div>
  );

  return (
    <div className="p-6 flex flex-col gap-6 bg-[#f4f6f9] min-h-screen font-sans text-xs text-slate-700 w-full">
      
      {/* HEADER BANNER */}
      <div className="rounded-xl p-5 text-white shadow-sm" style={{ background: "linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)" }}>
        <h1 className="text-lg font-black m-0 mb-1 tracking-tight">Pengaturan Akun & Profil</h1>
        <p className="text-xs opacity-85 m-0 font-medium">Kelola berkas data diri resmi, perbarui foto profil resmi sivitas akademik, dan kelola kerahasiaan akun Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* KARTU KIRI: FOTO PROFIL */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col items-center text-center gap-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider self-start">Foto Profil Utama</span>
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 flex items-center justify-center shadow-inner">
              {profilData.foto ? (
                <img src={profilData.foto} alt="Profil" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-[#1a3a6b] tracking-wider">
                  {profilData.nama ? profilData.nama.substring(0, 3).toUpperCase() : "DSN"}
                </span>
              )}
            </div>
            <label className="absolute bottom-1 right-1 bg-[#1a3a6b] text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-slate-800 transition-colors group-hover:scale-105">
              <FiCamera size={14} />
              <input type="file" accept="image/*" onChange={handleGantiFoto} disabled={isSubmitting} className="hidden" />
            </label>
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-950 uppercase tracking-tight m-0">{profilData.nama || "Nama Dosen"}</h2>
            <p className="text-[11px] font-medium text-slate-400 m-0 mt-0.5">NIDN. {profilData.nidn || "-"}</p>
          </div>
          <div className="px-3 py-1 bg-green-50 rounded-full border border-green-200 text-green-700 font-bold text-[10px] uppercase tracking-wider">
            STATUS AKTIF
          </div>
        </div>

        {/* KARTU KANAN: DETAIL DATA & FORM PASSWORD */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* DATA AKADEMIK */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <FiUser className="text-[#1a3a6b]" size={14} />
              <span className="text-sm font-bold text-slate-950">Informasi Biodata Resmi</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nama Lengkap</label>
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-bold text-slate-800 uppercase">{profilData.nama || "-"}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">NIDN</label>
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-mono font-bold text-slate-800">{profilData.nidn || "-"}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Program Studi</label>
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-semibold text-slate-700">{profilData.program_studi || "-"}</div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Korespondensi</label>
                <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg font-medium text-slate-600">{profilData.email || "-"}</div>
              </div>
            </div>
          </div>

          {/* GANTI PASSWORD */}
          <form onSubmit={handleUbahPassword} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <FiLock className="text-[#1a3a6b]" size={14} />
              <span className="text-sm font-bold text-slate-950">Keamanan & Sandi Akun</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Password Baru</label>
                <input 
                  type="password" 
                  value={passwordBaru}
                  onChange={(e) => setPasswordBaru(e.target.value)}
                  placeholder="Masukkan sandi baru (min. 6 karakter)..." 
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-400 focus:bg-white transition text-xs font-medium text-slate-700" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Konfirmasi Password</label>
                <input 
                  type="password" 
                  value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  placeholder="Ulangi sandi baru..." 
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-slate-400 focus:bg-white transition text-xs font-medium text-slate-700" 
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a3a6b] hover:bg-slate-800 disabled:bg-gray-300 text-white font-bold rounded-lg shadow-sm transition cursor-pointer text-xs"
              >
                <FiSave size={13} />
                {isSubmitting ? "Memproses..." : "Perbarui Password"}
              </button>
            </div>
          </form>

        </div>
      </div>

      {/* NOTIFICATION MODAL */}
      {modalNotif.isOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full text-center flex flex-col items-center gap-3 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${modalNotif.isSuccess ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
              {modalNotif.isSuccess ? "✓" : "✕"}
            </div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight m-0 mt-1">{modalNotif.title}</h3>
            <p className="text-xs font-medium text-slate-500 m-0 leading-relaxed">{modalNotif.message}</p>
            <button 
              onClick={() => setModalNotif((prev) => ({ ...prev, isOpen: false }))}
              className={`w-full py-2 mt-2 font-bold text-white rounded-xl transition shadow-sm cursor-pointer text-xs ${modalNotif.isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-rose-600 hover:bg-rose-700'}`}
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profil;