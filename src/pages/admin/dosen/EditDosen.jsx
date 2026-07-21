import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { dosenAPI } from "../../../services/dosenAPI";
import { dashboardAPI } from "../../../services/dashboardAdminAPI";
import Swal from 'sweetalert2';

const EditDosen = ({ isEditTerbuka, setIsEditTerbuka, dataTerpilih, onSuksesEdit }) => {
  const [inputEdit, setInputEdit] = useState({
    nidn: "",
    nama: "",
    program_studi: "",
    email: "",
    status: "Aktif",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dataTerpilih && isEditTerbuka) {
      setInputEdit({
        nidn: dataTerpilih.nidn || "",
        nama: dataTerpilih.nama || "",
        program_studi: dataTerpilih.program_studi || "D4 Pengolahan dan Penyimpanan Hasil Perikanan",
        email: dataTerpilih.email || "",
        status: dataTerpilih.status || "Aktif",
      });
    }
  }, [dataTerpilih, isEditTerbuka]);

  if (!isEditTerbuka) return null;

  const tanganiUbahDosen = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const dataSiapUpdate = {
      nama: inputEdit.nama.trim(),
      program_studi: inputEdit.program_studi,
      email: inputEdit.email.trim(),
      status: inputEdit.status
    };

    try {
      await dosenAPI.updateDosen(inputEdit.nidn, dataSiapUpdate);
      
      try {
        const adminSession = JSON.parse(localStorage.getItem("siakad_session"));
        await dashboardAPI.logAktivitas(
          "Master Dosen",
          `Mengubah informasi data dosen: ${inputEdit.nama.trim()} (NIDN: ${inputEdit.nidn})`,
          "UPDATE",
          adminSession?.nama || "Staff Administrasi"
        );
      } catch (logErr) {
        console.error(logErr);
      }

      onSuksesEdit({ nidn: inputEdit.nidn, ...dataSiapUpdate });
      setIsEditTerbuka(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Perubahan data dosen berhasil disimpan.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });

    } catch (error) {
      console.error(error);
      
      Swal.fire({
        icon: 'error',
        title: 'Gagal Simpan',
        text: error.response?.data?.message || error.message,
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#d33',
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  const tutupModal = () => {
    setIsSubmitting(false);
    setIsEditTerbuka(false);
  };

  return (
    <div className="fixed inset-0 bg-white z-[9999] p-6 md:p-12 text-gray-600 overflow-y-auto min-h-screen font-sans">
      <form onSubmit={tanganiUbahDosen} className="max-w-4xl mx-auto w-full text-xs">
        
        {/* Header Bagian Atas */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-5 mb-8">
          <div>
            <h3 className="text-base font-bold text-gray-800">Perbarui Data Dosen</h3>
            <p className="text-[11.5px] text-gray-400 mt-0.5 font-medium">
              Ubah berkas data diri & homebase akademik resmi untuk NIDN: <span className="font-mono font-bold text-gray-500">{inputEdit.nidn}</span>
            </p>
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
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">NIDN / NUP (Kunci Utama)</label>
                <input 
                  type="text" 
                  disabled
                  value={inputEdit.nidn}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-gray-50 text-gray-400 font-mono cursor-not-allowed select-none" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap & Gelar</label>
                <input 
                  type="text" 
                  required 
                  disabled={isSubmitting}
                  placeholder="Contoh: Ahmad Fauzi, S.Pi., M.Si."
                  value={inputEdit.nama} 
                  onChange={(e) => setInputEdit({ ...inputEdit, nama: e.target.value })} 
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
                  value={inputEdit.program_studi} 
                  onChange={(e) => setInputEdit({ ...inputEdit, program_studi: e.target.value })} 
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
                  value={inputEdit.status} 
                  onChange={(e) => setInputEdit({ ...inputEdit, status: e.target.value })} 
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
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Resmi Akademik</label>
                <input 
                  type="email" 
                  required 
                  disabled={isSubmitting}
                  placeholder="Contoh: nama.dosen@polteksim.ac.id"
                  value={inputEdit.email} 
                  onChange={(e) => setInputEdit({ ...inputEdit, email: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white text-gray-700 font-medium focus:outline-none focus:border-slate-400 transition" 
                />
              </div>
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
            disabled={isSubmitting} 
            style={{ backgroundColor: isSubmitting ? "#9ca3af" : "#1a3a6b" }}
            onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#244b86")}
            onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#1a3a6b")}
            className="text-white text-xs font-bold px-6 py-2 rounded-lg transition shadow-sm cursor-pointer min-w-[150px]"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditDosen;