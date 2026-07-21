import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { jadwalAPI } from "../../../services/jadwalAPI";
import Loading from "../../../components/admin/Loading";
import Swal from 'sweetalert2';

const EditJadwal = ({ isEditTerbuka, setIsEditTerbuka, dataEdit, onSuksesEdit }) => {
  const [form, setForm] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (dataEdit) {
      setForm({ ...dataEdit });
    }
  }, [dataEdit]);

  const tanganiSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await jadwalAPI.updateJadwal(form.id_jadwal, form);
      setIsEditTerbuka(false);
      
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Perubahan jadwal kuliah berhasil disimpan!',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });

      if (onSuksesEdit) onSuksesEdit();

    } catch (err) { 
      Swal.fire({
        icon: 'error',
        title: 'Gagal Simpan',
        text: 'Gagal memperbarui jadwal',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#d33',
      });
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (!isEditTerbuka) return null;

  return (
    <div className="fixed inset-0 bg-white z-[9999] p-6 md:p-12 text-slate-700 overflow-y-auto min-h-screen font-sans">
      <form onSubmit={tanganiSubmit} className="max-w-4xl mx-auto w-full text-xs">
        
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-5 mb-8">
          <div>
            <h3 className="text-base font-bold text-slate-900">Perbarui Jadwal Kuliah</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Ubah rincian pelaksanaan kelas untuk mata kuliah: <span className="text-slate-800 font-bold uppercase">{form.mata_kuliah}</span>
            </p>
          </div>
          <button 
            type="button" 
            disabled={isSubmitting}
            onClick={() => setIsEditTerbuka(false)} 
            className="text-gray-400 hover:text-slate-600 p-2 rounded-lg hover:bg-gray-50 border border-gray-200 flex items-center gap-2 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <FiX size={15} /> <span>Tutup</span>
          </button>
        </div>

        <div className="space-y-8">
          {/* Kelompok Form: Informasi Mata Kuliah */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-gray-100 pb-2">Informasi Mata Kuliah</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Mata Kuliah", key: "mata_kuliah" },
                { label: "Kode MK", key: "kode_mk" },
              ].map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{field.label}</label>
                  <input 
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={form[field.key] || ""}
                    onChange={(e) => setForm({...form, [field.key]: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-gray-50/50 focus:outline-none focus:border-slate-400 focus:bg-white transition"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Kelompok Form: Waktu & Lokasi Pelaksanaan */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-gray-100 pb-2">Waktu & Lokasi Pelaksanaan</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { label: "Hari", key: "hari" },
                { label: "Jam Mulai", key: "jam_mulai", type: "time" },
                { label: "Jam Selesai", key: "jam_selesai", type: "time" },
                { label: "Ruangan", key: "ruangan" },
                { label: "Kelas", key: "kelas" },
                { label: "NIDN Dosen Pengampu", key: "nidn_dosen" },
              ].map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{field.label}</label>
                  <input 
                    type={field.type || "text"}
                    required
                    disabled={isSubmitting}
                    value={form[field.key] || ""}
                    onChange={(e) => setForm({...form, [field.key]: e.target.value})}
                    className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:border-slate-400 transition ${field.type === 'time' ? 'cursor-pointer' : ''}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Kelompok Form: Bobot & Tingkat Semester */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-gray-100 pb-2">Bobot & Tingkat Semester</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SKS</label>
                <select 
                  disabled={isSubmitting}
                  value={form.sks || ""} 
                  onChange={(e) => setForm({...form, sks: parseInt(e.target.value)})} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  {[1, 2, 3, 4, 6].map(num => <option key={num} value={num}>{num} SKS</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Semester</label>
                <select 
                  disabled={isSubmitting}
                  value={form.semester || ""} 
                  onChange={(e) => setForm({...form, semester: parseInt(e.target.value)})} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => <option key={num} value={num}>Semester {num}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <div className="border-t border-gray-200 pt-6 mt-12 flex justify-end gap-2.5">
          <button 
            type="button" 
            disabled={isSubmitting}
            onClick={() => setIsEditTerbuka(false)} 
            className="bg-slate-50 hover:bg-gray-100 text-slate-600 text-xs font-semibold px-5 py-2 rounded-lg transition border border-gray-200 cursor-pointer disabled:opacity-50"
          >
            Batalkan
          </button>
          
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="text-white text-xs font-semibold px-6 py-2 rounded-lg transition shadow-sm cursor-pointer min-w-[140px] bg-[#1a3a6b] hover:bg-[#244b86] disabled:bg-gray-400"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJadwal;