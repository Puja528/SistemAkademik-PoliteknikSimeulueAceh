import React, { useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { mahasiswaAPI } from "../../../services/mahasiswaAPI.js"; 
// ── MODIFIKASI: Import supabase client untuk membuat user auth mahasiswa ──
import { supabase } from "../../../supabaseClient";

const TambahMahasiswa = ({ isTambahTerbuka, setIsTambahTerbuka, onSuksesSimpan }) => {
  const [inputBaru, setInputBaru] = useState({
    id_mahasiswa: "",
    nama: "",
    program_studi: "D4 Pengolahan dan Penyimpanan Hasil Perikanan", 
    email: "",
    ipk: "",
    status: "Aktif",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isTambahTerbuka) return null;

  const tanganiSimpanMahasiswa = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Daftarkan email ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: inputBaru.email.trim(),
        password: "MahasiswaPolteksim2026!", // Password untuk login Supabase Auth
      });

      if (authError) throw authError;

      const uuidMhsBaru = authData.user?.id;
      if (!uuidMhsBaru) {
        throw new Error("Gagal memproses otentikasi Mahasiswa.");
      }

      // ── SINKRONISASI KE TABEL public.users ──
      const { error: userTableError } = await supabase
        .from("users")
        .insert([
          {
            id: uuidMhsBaru,
            email: inputBaru.email.trim(),
            nama: inputBaru.nama.trim(),     // Mengisi nama sesuai input form
            role: "mahasiswa",                // Set role sebagai mahasiswa
            password: "MahasiswaPoltek2026!" // Menyimpan teks password biasa di tabel users
          }
        ]);

      if (userTableError) {
        throw new Error("Gagal menyinkronkan data ke tabel users: " + userTableError.message);
      }

      // 2. Bentuk payload lengkap berserta user_id untuk tabel mahasiswa
      const dataSiapSimpan = {
        id_mahasiswa: inputBaru.id_mahasiswa.trim(),
        nama: inputBaru.nama.trim(),
        program_studi: inputBaru.program_studi,
        email: inputBaru.email.trim(),
        ipk: parseFloat(inputBaru.ipk) || 0.00,
        status: inputBaru.status,
        user_id: uuidMhsBaru
      };

      await mahasiswaAPI.createMahasiswa(dataSiapSimpan);
      onSuksesSimpan(); 
      setIsTambahTerbuka(false); 
      
      setInputBaru({
        id_mahasiswa: "",
        nama: "",
        program_studi: "D4 Pengolahan dan Penyimpanan Hasil Perikanan",
        email: "",
        ipk: "",
        status: "Aktif",
      });

      alert("Data mahasiswa dan akun akses login berhasil didaftarkan!");
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Gagal menyimpan data: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[9999] p-6 md:p-12 text-slate-700 overflow-y-auto min-h-screen flex flex-col justify-between">
      <form onSubmit={tanganiSimpanMahasiswa} className="max-w-6xl mx-auto w-full flex-1 flex flex-col justify-between">
        
        {/* HEADER FORM */}
        <div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-8 w-full">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">
                Tambah Mahasiswa Baru
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Isi berkas data mahasiswa resmi untuk diintegrasikan ke sistem database akademik.
              </p>
            </div>
            <button 
              type="button"
              onClick={() => setIsTambahTerbuka(false)}
              className="text-slate-400 hover:text-slate-900 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200 flex items-center gap-2 text-xs font-bold"
            >
              <AiOutlineClose className="text-sm" />
              <span>Tutup</span>
            </button>
          </div>

          {/* AREA INPUT GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 w-full">
            
            {/* NIM */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Induk Mahasiswa (NIM)</label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="Contoh: 220101001"
                value={inputBaru.id_mahasiswa}
                onChange={(e) => setInputBaru({ ...inputBaru, id_mahasiswa: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>

            {/* Nama */}
            <div className="space-y-1 lg:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Lengkap </label>
              <input
                type="text"
                required
                disabled={isSubmitting}
                placeholder="Contoh: Muhammad Rafli"
                value={inputBaru.nama}
                onChange={(e) => setInputBaru({ ...inputBaru, nama: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>

            {/* Prodi */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Program Studi </label>
              <select
                required
                disabled={isSubmitting}
                value={inputBaru.program_studi}
                onChange={(e) => setInputBaru({ ...inputBaru, program_studi: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition cursor-pointer"
              >
                <option value="D4 Pengolahan dan Penyimpanan Hasil Perikanan">PPHP (D4 Pengolahan Hasil Perikanan)</option>
                <option value="D3 Perikanan Tangkap">PTK (D3 Perikanan Tangkap)</option>
                <option value="D3 Budi Daya Ikan">BDI (D3 Budi Daya Ikan)</option>
              </select>
            </div>

            {/* Email */}
            <div className="space-y-1 lg:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Institusi Resmi</label>
              <input
                type="email"
                required
                disabled={isSubmitting}
                placeholder="Contoh: mahasiswa@polteksimeulue.ac.id"
                value={inputBaru.email}
                onChange={(e) => setInputBaru({ ...inputBaru, email: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>

            {/* IPK */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">IPK Terakhir</label>
              <input
                type="number"
                required
                disabled={isSubmitting}
                step="0.01"
                min="0.00"
                max="4.00"
                placeholder="Contoh: 3.75"
                value={inputBaru.ipk}
                onChange={(e) => setInputBaru({ ...inputBaru, ipk: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</label>
              <select
                required
                disabled={isSubmitting}
                value={inputBaru.status}
                onChange={(e) => setInputBaru({ ...inputBaru, status: e.target.value })}
                className="w-full bg-slate-50 text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition cursor-pointer"
              >
                <option value="Aktif">Aktif</option>
                <option value="Cuti">Cuti</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>

          </div>
        </div>

        {/* TOMBOL AKSI */}
        <div className="border-t border-slate-100 pt-6 mt-12 flex justify-end gap-4 w-full bg-white">
          <button
            type="button"
            onClick={() => setIsTambahTerbuka(false)}
            className="w-full sm:w-44 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3.5 rounded-xl transition"
          >
            Batalkan
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-64 text-white text-xs font-bold py-3.5 rounded-xl transition shadow-md ${
              isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-black hover:bg-slate-800"
            }`}
          >
            {isSubmitting ? "Menyimpan Data..." : "Tambah Mahasiswa"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default TambahMahasiswa;