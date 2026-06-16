import React, { useState } from "react";
import { AiOutlineClose, AiOutlineUser, AiOutlineMail, AiOutlineIdcard } from "react-icons/ai";
import { dosenAPI } from "../../../services/dosenAPI"; 
// ── MODIFIKASI: Import supabase client untuk mendaftarkan akun auth ──
import { supabase } from "../../../supabaseClient"; 

const TambahDosen = ({ isTambahTerbuka, setIsTambahTerbuka, onSuksesSimpan }) => {
  const [inputBaru, setInputBaru] = useState({
    nidn: "",
    nama: "",
    program_studi: "D4 Pengolahan dan Penyimpanan Hasil Perikanan",
    email: "",
    status: "Aktif",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isTambahTerbuka) return null;

  const tanganiSimpanDosen = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); 
    
    try {
      // 1. Daftarkan akun auth ke Supabase Auth Server
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inputBaru.email.trim(),
        password: "DosenPoltek2026!", // Password untuk login Supabase Auth
      });

      if (authError) throw authError;

      const uuidDosenBaru = authData.user?.id;
      if (!uuidDosenBaru) {
        throw new Error("Gagal membuat ID otentikasi user baru.");
      }

      // ── SINKRONISASI KE TABEL public.users ──
      const { error: userTableError } = await supabase
        .from("users")
        .insert([
          {
            id: uuidDosenBaru,
            email: inputBaru.email.trim(),
            nama: inputBaru.nama.trim(), // Mengisi nama sesuai input form
            role: "dosen",               // Set role sebagai dosen
            password: "DosenPoltek2026!" // Menyimpan teks password biasa di tabel users
          }
        ]);

      if (userTableError) {
        throw new Error("Gagal menyinkronkan data ke tabel users: " + userTableError.message);
      }

      // 2. Gabungkan data inputan form admin dengan UUID auth untuk tabel dosen
      const dataSiapKirim = {
        ...inputBaru,
        user_id: uuidDosenBaru
      };

      // Kirim payload lengkap via Axios ke tabel dosen
      await dosenAPI.createDosen(dataSiapKirim);
      
      onSuksesSimpan(dataSiapKirim); 
      setIsTambahTerbuka(false);
      
      setInputBaru({
        nidn: "",
        nama: "",
        program_studi: "D4 Pengolahan dan Penyimpanan Hasil Perikanan",
        email: "",
        status: "Aktif",
      });

      alert("Akun login, data user, dan profil dosen baru berhasil dibuat!");
    } catch (error) {
      console.error(error);
      alert(error.message || "Gagal memproses pendaftaran dosen.");
    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-hidden animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* HEADER MODAL */}
        <div className="flex justify-between items-center border-b border-slate-100 p-6 shrink-0">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Formulir Tambah Dosen</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Politeknik Simeulue • Manajemen Data Master</p>
          </div>
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={() => setIsTambahTerbuka(false)}
            className="text-slate-400 hover:text-black p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200 disabled:opacity-50"
          >
            <AiOutlineClose className="text-sm" />
          </button>
        </div>

        {/* INPUT CONTENT AREA */}
        <form onSubmit={tanganiSimpanDosen} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* NIDN */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AiOutlineIdcard className="text-sm" /> NIDN / NUP
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                maxLength="10"
                placeholder="Contoh: 0112038901"
                value={inputBaru.nidn}
                onChange={(e) => setInputBaru({ ...inputBaru, nidn: e.target.value })}
                className="w-full bg-slate-50 text-xs font-medium px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition disabled:opacity-60"
              />
            </div>

            {/* Nama */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AiOutlineUser className="text-sm" /> Nama Lengkap & Gelar
              </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="Contoh: Ahmad Fauzi, S.Pi., M.Si."
                value={inputBaru.nama}
                onChange={(e) => setInputBaru({ ...inputBaru, nama: e.target.value })}
                className="w-full bg-slate-50 text-xs font-medium px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition disabled:opacity-60"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <AiOutlineMail className="text-sm" /> Email Resmi Akademik
              </label>
              <input
                type="email"
                required
                disabled={isSubmitting}
                placeholder="Contoh: nama.dosen@polteksimeulue.ac.id"
                value={inputBaru.email}
                onChange={(e) => setInputBaru({ ...inputBaru, email: e.target.value })}
                className="w-full bg-slate-50 text-xs font-medium px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition disabled:opacity-60"
              />
            </div>

            {/* Prodi */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Homebase Program Studi</label>
              <select
                disabled={isSubmitting}
                value={inputBaru.program_studi}
                onChange={(e) => setInputBaru({ ...inputBaru, program_studi: e.target.value })}
                className="w-full bg-slate-50 text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition cursor-pointer disabled:opacity-60"
              >
                <option>D4 Pengolahan dan Penyimpanan Hasil Perikanan</option>
                <option>D3 Perikanan Tangkap</option>
                <option>D3 Budi Daya Ikan</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Kepegawaian</label>
              <select
                disabled={isSubmitting}
                value={inputBaru.status}
                onChange={(e) => setInputBaru({ ...inputBaru, status: e.target.value })}
                className="w-full bg-slate-50 text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition cursor-pointer disabled:opacity-60"
              >
                <option>Aktif</option>
                <option>Nonaktif</option>
              </select>
            </div>

          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-3 pt-5 border-t border-slate-100 bg-white sticky bottom-0 z-10">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsTambahTerbuka(false)}
              className="flex-1 bg-slate-100 text-slate-700 text-xs font-bold py-3 rounded-xl hover:bg-slate-200 transition disabled:opacity-50"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-black text-white text-xs font-bold py-3 rounded-xl hover:bg-slate-800 transition shadow-md disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Menyimpan ke Server..." : "Simpan Data Dosen"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default TambahDosen;