import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { dosenAPI } from "../../../services/dosenAPI"; // IMPOR SERVICE API DOSEN

const EditDosen = ({ isEditTerbuka, setIsEditTerbuka, dataTerpilih, onSuksesEdit }) => {
  const [inputEdit, setInputEdit] = useState({
    nidn: "",
    nama: "",
    program_studi: "",
    email: "",
    status: "Aktif",
  });

  // STATE BARU: Indikator animasi loading saat memproses update ke database
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sinkronisasi data dosen yang dipilih ke dalam state form edit
  useEffect(() => {
    if (dataTerpilih) {
      setInputEdit({
        nidn: dataTerpilih.nidn || "",
        nama: dataTerpilih.nama || "",
        program_studi: dataTerpilih.program_studi || "",
        email: dataTerpilih.email || "",
        status: dataTerpilih.status || "Aktif",
      });
    }
  }, [dataTerpilih, isEditTerbuka]);

  if (!isEditTerbuka) return null;

  // LOGIKA UTAMA: MEMPERBARUI DATA KE SUPABASE
  const tanganiUbahDosen = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Kunci tombol form

    const dataSiapUpdate = {
      nama: inputEdit.nama.trim(),
      program_studi: inputEdit.program_studi,
      email: inputEdit.email.trim(),
      status: inputEdit.status
      // nidn tidak perlu dikirim di dalam body data karena digunakan sebagai parameter filter URL
    };

    try {
      // 1. Tembak perubahan data ke server Supabase menggunakan parameter NIDN
      await dosenAPI.updateDosen(inputEdit.nidn, dataSiapUpdate);

      // 2. Kirim balik data utuh (termasuk NIDN) ke state lokal MasterDosen agar tabel langsung berubah
      onSuksesEdit({ nidn: inputEdit.nidn, ...dataSiapUpdate });
      
      // 3. Tutup modal edit
      setIsEditTerbuka(false);
      
      alert("Perubahan data dosen berhasil disimpan!");
    } catch (error) {
      console.error(error);
      alert(error.message || "Gagal memperbarui data dosen di server database.");
    } finally {
      setIsSubmitting(false); // Buka kembali kunci tombol form
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[9999] p-6 md:p-12 animate-fadeIn text-slate-700 overflow-y-auto">
      <form onSubmit={tanganiUbahDosen} className="max-w-6xl mx-auto w-full pb-24 relative">
        
        {/* HEADER FORM EDIT DOSEN */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6 w-full">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">
              Perbarui Data Dosen
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ubah berkas data tenaga pendidik resmi untuk NIDN: <span className="text-slate-800 font-bold">{inputEdit.nidn}</span>
            </p>
          </div>
          
          <button 
            type="button"
            disabled={isSubmitting}
            onClick={() => setIsEditTerbuka(false)}
            className="text-slate-400 hover:text-slate-900 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200 flex items-center gap-2 text-xs font-bold disabled:opacity-50"
          >
            <AiOutlineClose className="text-sm" />
            <span>Tutup</span>
          </button>
        </div>

        {/* AREA INPUT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 w-full">
          
          {/* NIDN (Disabled / Read-Only karena primary key tidak boleh diubah) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Induk Dosen Nasional (NIDN)</label>
            <input
              type="text"
              disabled
              value={inputEdit.nidn}
              className="w-full bg-slate-100 text-slate-400 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 cursor-not-allowed select-none"
            />
          </div>

          {/* Nama Lengkap Dosen */}
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap </label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder="Contoh: Dr. Nama Dosen, M.T."
              value={inputEdit.nama}
              onChange={(e) => setInputEdit({ ...inputEdit, nama: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition disabled:opacity-60"
            />
          </div>

          {/* Program Studi Homebase */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Program Studi </label>
            <select
              required
              disabled={isSubmitting}
              value={inputEdit.program_studi}
              onChange={(e) => setInputEdit({ ...inputEdit, program_studi: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition cursor-pointer disabled:opacity-60"
            >
              <option value="D4 Pengolahan dan Penyimpanan Hasil Perikanan">PPHP (D4 Pengolahan Hasil Perikanan)</option>
              <option value="D3 Perikanan Tangkap">PTK (D3 Perikanan Tangkap)</option>
              <option value="D3 Budi Daya Ikan">BDI (D3 Budi Daya Ikan)</option>
            </select>
          </div>

          {/* Email Resmi Dosen */}
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Institusi Resmi</label>
            <input
              type="email"
              required
              disabled={isSubmitting}
              placeholder="Contoh: dosen@polteksimeulue.ac.id"
              value={inputEdit.email}
              onChange={(e) => setInputEdit({ ...inputEdit, email: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition disabled:opacity-60"
            />
          </div>

          {/* Status Ikatan Kerja */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
            <select
              required
              disabled={isSubmitting}
              value={inputEdit.status}
              onChange={(e) => setInputEdit({ ...inputEdit, status: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition cursor-pointer disabled:opacity-60"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>

        </div>

        {/* FIXED FOOTER BUTTONS BAR */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-5 z-[10000]">
          <div className="max-w-6xl mx-auto flex justify-end gap-4 w-full">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsEditTerbuka(false)}
              className="w-full sm:w-44 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3.5 rounded-xl transition active:scale-[0.98] disabled:opacity-50"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-64 bg-black hover:bg-slate-800 text-white text-xs font-bold py-3.5 rounded-xl transition active:scale-[0.98] shadow-md disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? "Menyimpan Perubahan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
};

export default EditDosen;