import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { jadwalAPI } from "../../../services/jadwalAPI";
import { dosenAPI } from "../../../services/dosenAPI";
import axios from "axios";
import Loading from "../../../components/admin/Loading";
import Swal from 'sweetalert2';

const TambahJadwal = ({ isModalTerbuka, setIsModalTerbuka, onSuksesSimpan }) => {
  const [form, setForm] = useState({
    kode_mk: "", 
    nama_mk: "", 
    dosen: "", 
    hari: "", 
    jamMulai: "08:00", 
    jamSelesai: "", 
    ruangan: "Lab Pengolahan Modern", 
    kelas: "", 
    id_kelas: "", 
    sks: 2, 
    semester: 1
  });
  
  const [daftarDosen, setDaftarDosen] = useState([]);
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isModalTerbuka) {
      const ambilDataMaster = async () => {
        try {
          const [dsn, kls] = await Promise.all([
            dosenAPI.fetchDosen(),
            axios.get("https://mwkewvjpgcvlwgycdpvo.supabase.co/rest/v1/kelas", {
              headers: { apikey: "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK", Authorization: "Bearer sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK" }
            })
          ]);
          setDaftarDosen(dsn || []);
          setDaftarKelas(kls.data || []);
        } catch (err) { 
          console.error(err); 
        }
      };
      ambilDataMaster();
    }
  }, [isModalTerbuka]);

  const tanganiSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        mata_kuliah: form.nama_mk,
        nidn_dosen: form.dosen,
        hari: form.hari,
        jam_mulai: form.jamMulai,
        jam_selesai: form.jamSelesai,
        ruangan: form.ruangan,
        kode_mk: `${form.kode_mk}-${form.semester}${form.kelas}`,
        kelas: form.kelas,
        id_kelas: parseInt(form.id_kelas),
        sks: parseInt(form.sks),
        semester: parseInt(form.semester)
      };
      const res = await jadwalAPI.createJadwal(payload);
      onSuksesSimpan(Array.isArray(res) ? res[0] : res);
      setIsModalTerbuka(false);
      
      setForm({
        kode_mk: "", nama_mk: "", dosen: "", hari: "", 
        jamMulai: "08:00", jamSelesai: "", ruangan: "Lab Pengolahan Modern", 
        kelas: "", id_kelas: "", sks: 2, semester: 1
      });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Jadwal perkuliahan baru berhasil ditambahkan!',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });
    } catch (err) { 
      Swal.fire({
        icon: 'error',
        title: 'Gagal Simpan',
        text: 'Gagal menyimpan jadwal',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#d33',
      });
    } finally { 
      setIsSubmitting(false); 
    }
  };
  
  if (!isModalTerbuka) return null;

  return (
    <div className="fixed inset-0 bg-white z-[9999] p-6 md:p-12 text-slate-700 overflow-y-auto min-h-screen font-sans">
      <form onSubmit={tanganiSubmit} className="max-w-4xl mx-auto w-full text-xs">
        
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-5 mb-8">
          <div>
            <h3 className="text-base font-bold text-slate-900">Formulir Tambah Jadwal</h3>
            <p className="text-xs text-gray-400 mt-0.5">Buat entri pelaksanaan kelas dan waktu perkuliahan baru</p>
          </div>
          <button 
            type="button" 
            disabled={isSubmitting}
            onClick={() => setIsModalTerbuka(false)} 
            className="text-gray-400 hover:text-slate-600 p-2 rounded-lg hover:bg-gray-50 border border-gray-200 flex items-center gap-2 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <FiX size={15} /> <span>Tutup</span>
          </button>
        </div>

        <div className="space-y-8">
          {/* Kelompok Form: Informasi Mata Kuliah & Pengampu */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-gray-100 pb-2">Informasi Mata Kuliah & Pengampu</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Nama Mata Kuliah</label>
                <input 
                  type="text" 
                  required
                  disabled={isSubmitting}
                  placeholder="Contoh: Pengolahan Hasil Perikanan Modern"
                  value={form.nama_mk}
                  onChange={(e) => setForm({...form, nama_mk: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-gray-50/50 focus:outline-none focus:border-slate-400 focus:bg-white transition" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kode Prodi (Prefix)</label>
                <select 
                  required
                  disabled={isSubmitting}
                  value={form.kode_mk} 
                  onChange={(e) => setForm({...form, kode_mk: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  <option value="">Pilih Prodi</option>
                  {["PPHP", "PTK", "BDI"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Dosen Pengampu</label>
                <select 
                  required
                  disabled={isSubmitting}
                  value={form.dosen} 
                  onChange={(e) => setForm({...form, dosen: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  <option value="">Pilih Dosen Resmi</option>
                  {daftarDosen.map(d => <option key={d.nidn} value={d.nidn}>{d.nama} ({d.nidn})</option>)}
                </select>
              </div>

            </div>
          </div>

          {/* Kelompok Form: Alokasi Waktu & Ruangan */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-gray-100 pb-2">Alokasi Waktu & Ruangan</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hari Pelaksanaan</label>
                <select 
                  required
                  disabled={isSubmitting}
                  value={form.hari} 
                  onChange={(e) => setForm({...form, hari: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  <option value="">Pilih Hari</option>
                  {["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jam Mulai</label>
                <input 
                  type="time" 
                  required
                  disabled={isSubmitting}
                  value={form.jamMulai}
                  onChange={(e) => setForm({...form, jamMulai: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-slate-400 transition" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jam Selesai</label>
                <input 
                  type="time" 
                  required
                  disabled={isSubmitting}
                  value={form.jamSelesai}
                  onChange={(e) => setForm({...form, jamSelesai: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-slate-400 transition" 
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ruangan Laboratorium / Kelas</label>
                <select 
                  required
                  disabled={isSubmitting}
                  value={form.ruangan} 
                  onChange={(e) => setForm({...form, ruangan: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  {["Lab Pengolahan Modern", "Lab Hatchery & Pembenihan", "Lab Uji Mutu & Mikrobiologi", "Ruang Teori Bahari 105"].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Kelas Mahasiswa</label>
                <select 
                  required
                  disabled={isSubmitting}
                  value={form.id_kelas} 
                  onChange={(e) => {
                    const kls = daftarKelas.find(k => k.id == e.target.value);
                    setForm({...form, id_kelas: e.target.value, kelas: kls?.nama_kelas || ""});
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  <option value="">Pilih Kelas</option>
                  {daftarKelas.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                </select>
              </div>

            </div>
          </div>

          {/* Kelompok Form: Parameter Akademik */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-gray-100 pb-2">Parameter Akademik</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bobot SKS</label>
                <select 
                  disabled={isSubmitting}
                  value={form.sks} 
                  onChange={(e) => setForm({...form, sks: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  {[1, 2, 3, 4, 6].map(n => <option key={n} value={n}>{n} SKS</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tingkat Semester</label>
                <select 
                  disabled={isSubmitting}
                  value={form.semester} 
                  onChange={(e) => setForm({...form, semester: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>Semester {n}</option>)}
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
            onClick={() => setIsModalTerbuka(false)} 
            className="bg-slate-50 hover:bg-gray-100 text-slate-600 text-xs font-semibold px-5 py-2 rounded-lg transition border border-gray-200 cursor-pointer disabled:opacity-50"
          >
            Batalkan
          </button>
          
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="text-white text-xs font-semibold px-6 py-2 rounded-lg transition shadow-sm cursor-pointer min-w-[140px] bg-[#1a3a6b] hover:bg-[#244b86] disabled:bg-gray-400"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Jadwal"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahJadwal;