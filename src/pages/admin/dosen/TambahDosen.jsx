import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { dosenAPI } from "../../../services/dosenAPI";
import { supabase } from "../../../supabaseClient";
import { dashboardAPI } from "../../../services/dashboardAdminAPI";
import Swal from 'sweetalert2';

const TambahDosen = ({ isTambahTerbuka, setIsTambahTerbuka, onSuksesSimpan }) => {
  const [inputBaru, setInputBaru] = useState({
    nidn: "",
    nama: "",
    program_studi: "D4 Pengolahan dan Penyimpanan Hasil Perikanan",
    emailPrefix: "",
    status: "Aktif",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  const cekEmailUnik = async (prefix) => {
    if (!prefix) return;
    const emailLengkap = `${prefix.trim()}@polteksim.ac.id`;

    const { data } = await supabase
      .from("users")
      .select("email")
      .eq("email", emailLengkap)
      .maybeSingle();

    if (data) {
      setEmailError("Email ini sudah terdaftar!");
    } else {
      setEmailError("");
    }
  };

  if (!isTambahTerbuka) return null;

  const tanganiSimpanDosen = async (e) => {
    e.preventDefault();
    if (emailError) return;
    
    setIsSubmitting(true);
    const emailLengkap = `${inputBaru.emailPrefix.trim()}@polteksim.ac.id`;

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailLengkap,
        password: "DosenPolteksim2026!",
      });

      if (authError) throw authError;

      const uuidDosenBaru = authData.user?.id;
      if (!uuidDosenBaru) {
        throw new Error("Gagal membuat ID otentikasi user baru.");
      }

      const { error: userTableError } = await supabase
        .from("users")
        .insert([
          {
            id: uuidDosenBaru,
            email: emailLengkap,
            nama: inputBaru.nama.trim(),
            role: "dosen",
            password: "DosenPoltek2026!"
          }
        ]);

      if (userTableError) {
        throw new Error("Gagal menyinkronkan data ke tabel users: " + userTableError.message);
      }

      const dataSiapKirim = {
        nidn: inputBaru.nidn.trim(),
        nama: inputBaru.nama.trim(),
        program_studi: inputBaru.program_studi,
        email: emailLengkap,
        status: inputBaru.status,
        user_id: uuidDosenBaru
      };

      await dosenAPI.createDosen(dataSiapKirim);
      
      try {
        const adminSession = JSON.parse(localStorage.getItem("siakad_session"));
        await dashboardAPI.logAktivitas(
          "Master Dosen",
          `Menambahkan dosen baru: ${inputBaru.nama.trim()} (NIDN: ${inputBaru.nidn.trim()})`,
          "CREATE",
          adminSession?.nama || "Staff Administrasi"
        );
      } catch (logErr) {
        console.error("Gagal mencatat log aktivitas:", logErr);
      }

onSuksesSimpan(dataSiapKirim);
      
      setInputBaru({
        nidn: "",
        nama: "",
        program_studi: "D4 Pengolahan dan Penyimpanan Hasil Perikanan",
        emailPrefix: "",
        status: "Aktif",
      });

      setIsTambahTerbuka(false);
      
      // Notifikasi Sukses dengan SweetAlert2
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Akun login, data user, dan profil dosen baru berhasil dibuat!',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });

    } catch (error) {
      console.error(error);
      
      // Notifikasi Gagal dengan SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Gagal Simpan',
        text: error.message || 'Gagal memproses pendaftaran dosen.',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#d33',
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  const tutupModal = () => {
    setIsSubmitting(false);
    setIsTambahTerbuka(false);
  };

  return (
    <div className="fixed inset-0 bg-white z-[9999] p-6 md:p-12 text-gray-600 overflow-y-auto min-h-screen font-sans">
      <form onSubmit={tanganiSimpanDosen} className="max-w-4xl mx-auto w-full text-xs">
        
        {/* Header Bagian Atas */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-5 mb-8">
          <div>
            <h3 className="text-base font-bold text-gray-800">Formulir Tambah Dosen</h3>
            <p className="text-[11.5px] text-gray-400 mt-0.5 font-medium">Lengkapi berkas data diri & homebase akademik dosen baru</p>
          </div>
          <button 
            type="button" 
            disabled={isSubmitting}
            onClick={tutupModal} 
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 border border-gray-200 flex items-center gap-2 text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            <FiX size={15} /> Tutup
          </button>
        </div>

        {/* Form Fields Area */}
        <div className="space-y-8">
          {/* Bagian Identitas */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-[#1a3a6b] uppercase tracking-wider border-b border-gray-100 pb-2">Identitas Dosen</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">NIDN / NUP</label>
                <input 
                  type="text" 
                  required
                  maxLength="10"
                  disabled={isSubmitting}
                  placeholder="Contoh: 0112038901"
                  value={inputBaru.nidn} 
                  onChange={(e) => setInputBaru({ ...inputBaru, nidn: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-gray-50/50 font-mono text-gray-700 focus:outline-none focus:border-slate-400 transition" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap & Gelar</label>
                <input 
                  type="text" 
                  required 
                  disabled={isSubmitting}
                  placeholder="Contoh: Ahmad Fauzi, S.Pi., M.Si."
                  value={inputBaru.nama} 
                  onChange={(e) => setInputBaru({ ...inputBaru, nama: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white text-gray-700 font-medium focus:outline-none focus:border-slate-400 transition" 
                />
              </div>
            </div>
          </div>

          {/* Bagian Homebase & Status */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-[#1a3a6b] uppercase tracking-wider border-b border-gray-100 pb-2">Homebase & Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Homebase Program Studi</label>
                <select 
                  required 
                  disabled={isSubmitting}
                  value={inputBaru.program_studi} 
                  onChange={(e) => setInputBaru({ ...inputBaru, program_studi: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white text-gray-700 font-medium cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  <option value="D4 Pengolahan dan Penyimpanan Hasil Perikanan">D4 Pengolahan dan Penyimpanan Hasil Perikanan</option>
                  <option value="D3 Perikanan Tangkap">D3 Perikanan Tangkap</option>
                  <option value="D3 Budi Daya Ikan">D3 Budi Daya Ikan</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status Kepegawaian</label>
                <select 
                  required 
                  disabled={isSubmitting}
                  value={inputBaru.status} 
                  onChange={(e) => setInputBaru({ ...inputBaru, status: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white text-gray-700 font-medium cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bagian Akses Sistem */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-[#1a3a6b] uppercase tracking-wider border-b border-gray-100 pb-2">Akses Sistem</h4>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Resmi Akademik</label>
              <div className={`flex items-center bg-white border rounded-lg overflow-hidden transition focus-within:border-slate-400 ${emailError ? 'border-red-400' : 'border-gray-200'}`}>
                <input 
                  type="text" 
                  required 
                  placeholder="username" 
                  disabled={isSubmitting}
                  onBlur={(e) => cekEmailUnik(e.target.value)} 
                  onChange={(e) => { setInputBaru({ ...inputBaru, emailPrefix: e.target.value }); setEmailError(""); }} 
                  className="w-full bg-transparent text-xs px-3 py-2 text-gray-700 font-medium focus:outline-none" 
                />
                <span className="text-[11px] font-semibold text-gray-400 px-3 bg-gray-50 py-2 border-l border-gray-100 select-none">
                  @polteksim.ac.id
                </span>
              </div>
              {emailError && <p className="text-[11px] text-red-500 font-semibold mt-0.5">{emailError}</p>}
            </div>
          </div>
        </div>

        {/* Footer Tombol Aksi Bawah */}
        <div className="border-t border-gray-200 pt-8 mt-12 flex justify-end gap-2.5">
          <button 
            type="button" 
            disabled={isSubmitting}
            onClick={tutupModal} 
            className="bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-bold px-5 py-2 rounded-lg transition border border-gray-200 cursor-pointer"
          >
            Batalkan
          </button>
          
          <button 
            type="submit" 
            disabled={isSubmitting || !!emailError} 
            style={{ backgroundColor: (isSubmitting || emailError) ? "#9ca3af" : "#1a3a6b" }}
            onMouseEnter={(e) => !(isSubmitting || emailError) && (e.currentTarget.style.backgroundColor = "#244b86")}
            onMouseLeave={(e) => !(isSubmitting || emailError) && (e.currentTarget.style.backgroundColor = "#1a3a6b")}
            className="text-white text-xs font-bold px-6 py-2 rounded-lg transition shadow-sm cursor-pointer min-w-[150px]"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Data Dosen"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahDosen;