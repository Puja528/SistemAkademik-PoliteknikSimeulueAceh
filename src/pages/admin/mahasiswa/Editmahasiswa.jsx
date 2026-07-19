import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { mahasiswaAPI } from "../../../services/mahasiswaAPI.js"; 
import { supabase } from "../../../supabaseClient";

const EditMahasiswa = ({ isEditTerbuka, setIsEditTerbuka, dataTerpilih, onSuksesEdit }) => {
  const [inputEdit, setInputEdit] = useState({
    id_mahasiswa: "",
    nama: "",
    program_studi: "",
    emailPrefix: "",
    id: "",
    angkatan: "",
    status: "Aktif",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [daftarKelas, setDaftarKelas] = useState([]);
  
  const tahunSekarang = new Date().getFullYear();
  
  // Membuat daftar angkatan dinamis (5 tahun ke belakang hingga tahun sekarang)
  const daftarAngkatan = Array.from({ length: 6 }, (_, i) => (tahunSekarang - i).toString());

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const { data, error } = await supabase.from("kelas").select("id, nama_kelas");
        if (error) throw error;
        setDaftarKelas(data || []);
      } catch (error) {
        console.error("Error fetching kelas:", error);
      }
    };
    
    if (isEditTerbuka) {
      fetchKelas();
    }

    if (dataTerpilih && isEditTerbuka) {
      const emailPrefix = dataTerpilih.email ? dataTerpilih.email.split('@')[0] : "";
      
      setInputEdit({
        id_mahasiswa: dataTerpilih.id_mahasiswa || "",
        nama: dataTerpilih.nama || "",
        program_studi: dataTerpilih.program_studi || "D4 Pengolahan dan Penyimpanan Hasil Perikanan",
        emailPrefix: emailPrefix,
        id: dataTerpilih.id_kelas?.toString() || dataTerpilih.id?.toString() || "",
        angkatan: dataTerpilih.angkatan?.toString() || tahunSekarang.toString(),
        status: dataTerpilih.status || "Aktif",
      });
    }
  }, [dataTerpilih, isEditTerbuka]);

  if (!isEditTerbuka) return null;

  const tanganiUbahMahasiswa = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const emailLengkap = `${inputEdit.emailPrefix.trim()}@polteksim.ac.id`;

    const dataSiapUpdate = {
      nama: inputEdit.nama.trim(),
      program_studi: inputEdit.program_studi,
      email: emailLengkap,
      id_kelas: inputEdit.id ? parseInt(inputEdit.id) : null,
      angkatan: parseInt(inputEdit.angkatan),
      status: inputEdit.status
    };

    try {
      await mahasiswaAPI.updateMahasiswa(inputEdit.id_mahasiswa, dataSiapUpdate);
      
      onSuksesEdit({ id_mahasiswa: inputEdit.id_mahasiswa, ...dataSiapUpdate }); 
      setIsEditTerbuka(false); 
      alert("Perubahan data mahasiswa berhasil disimpan!");
    } catch (error) {
      console.error("Error updating data:", error);
      alert("Gagal: " + (error.response?.data?.message || error.message));
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
      <form onSubmit={tanganiUbahMahasiswa} className="max-w-4xl mx-auto w-full text-xs">
        
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-5 mb-8">
          <div>
            <h3 className="text-base font-bold text-gray-800">Perbarui Data Mahasiswa</h3>
            <p className="text-[11.5px] text-gray-400 mt-0.5 font-medium">
              Ubah berkas data diri & akademik resmi untuk NIM: <span className="font-mono font-bold text-gray-500">{inputEdit.id_mahasiswa}</span>
            </p>
          </div>
          <button 
            type="button" 
            disabled={isSubmitting}
            onClick={tutupModal} 
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 border border-gray-200 flex items-center gap-2 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <FiX size={15} /> Tutup
          </button>
        </div>

        <div className="space-y-8">
          {/* Kelompok Form: Data Diri */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-[#1a3a6b] uppercase tracking-wider border-b border-gray-100 pb-2">Data Diri</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">NIM (Kunci Utama)</label>
                <input 
                  type="text" 
                  disabled 
                  value={inputEdit.id_mahasiswa} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-gray-50 text-gray-400 font-mono cursor-not-allowed select-none" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</label>
                <input 
                  type="text" 
                  required 
                  disabled={isSubmitting}
                  placeholder="Nama Lengkap"
                  value={inputEdit.nama} 
                  onChange={(e) => setInputEdit({ ...inputEdit, nama: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white text-gray-700 font-medium focus:outline-none focus:border-slate-400 transition" 
                />
              </div>
            </div>
          </div>

          {/* Kelompok Form: Data Akademik */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-[#1a3a6b] uppercase tracking-wider border-b border-gray-100 pb-2">Data Akademik</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Program Studi</label>
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
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Kelas</label>
                <select 
                  required 
                  disabled={isSubmitting}
                  value={inputEdit.id} 
                  onChange={(e) => setInputEdit({ ...inputEdit, id: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white text-gray-700 font-medium cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  <option value="">Pilih Kelas</option>
                  {daftarKelas.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Angkatan</label>
                <select 
                  required 
                  disabled={isSubmitting}
                  value={inputEdit.angkatan} 
                  onChange={(e) => setInputEdit({ ...inputEdit, angkatan: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white text-gray-700 font-medium cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  {daftarAngkatan.map((thn) => <option key={thn} value={thn}>{thn}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Kelompok Form: Akses & Status Sistem */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-[#1a3a6b] uppercase tracking-wider border-b border-gray-100 pb-2">Akses & Status Sistem</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Institusi</label>
                <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden focus-within:border-slate-400 transition">
                  <input 
                    type="text" 
                    required 
                    disabled={isSubmitting}
                    placeholder="username"
                    value={inputEdit.emailPrefix} 
                    onChange={(e) => setInputEdit({ ...inputEdit, emailPrefix: e.target.value })} 
                    className="w-full bg-transparent px-3 py-2 text-xs text-gray-700 font-medium focus:outline-none" 
                  />
                  <span className="text-[11px] font-semibold text-gray-400 px-3 bg-gray-50 py-2 border-l border-gray-100 select-none">
                    @polteksim.ac.id
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status Keaktifan</label>
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
        </div>

        {/* Footer Tombol Aksi */}
        <div className="border-t border-gray-200 pt-8 mt-12 flex justify-end gap-2.5">
          <button 
            type="button" 
            disabled={isSubmitting}
            onClick={tutupModal} 
            className="bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold px-5 py-2 rounded-lg transition border border-gray-200 cursor-pointer"
          >
            Batalkan
          </button>
          
          <button 
            type="submit" 
            disabled={isSubmitting} 
            style={{ backgroundColor: isSubmitting ? "#9ca3af" : "#1a3a6b" }}
            onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#244b86")}
            onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = "#1a3a6b")}
            className="text-white text-xs font-semibold px-6 py-2 rounded-lg transition shadow-sm cursor-pointer min-w-[150px]"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMahasiswa;