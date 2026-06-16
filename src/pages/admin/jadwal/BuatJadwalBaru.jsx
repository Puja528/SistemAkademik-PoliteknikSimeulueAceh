import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { jadwalAPI } from "../../../services/jadwalAPI";
import { dosenAPI } from "../../../services/dosenAPI";
import axios from "axios"; // Dipakai untuk memuat master tabel kelas

const BuatJadwalBaru = ({ isModalTerbuka, setIsModalTerbuka, onSuksesSimpan }) => {
  const [formInput, setFormInput] = useState({
    kode_mk: "",
    nama_mk: "",
    dosen: "", 
    hari: "",
    jamMulai: "",
    jamSelesai: "",
    ruangan: "",
    kelas: "",      // Menyimpan nama teks string kelas (Contoh: '25PTKA')
    id_kelas: "",   // Menyimpan ID relasi angka kelas (Contoh: 1)
    sks: "",
    semester: ""
  });

  const [daftarDosenDinamis, setDaftarDosenDinamis] = useState([]);
  const [daftarKelasDinamis, setDaftarKelasDinamis] = useState([]); // STATE BARU
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDosen, setIsLoadingDosen] = useState(false);
  const [isLoadingKelas, setIsLoadingKelas] = useState(false); // STATE LOADING BARU

  // Ambil master data dosen dan data kelas dari database saat modal dibuka Admin
  useEffect(() => {
    if (isModalTerbuka) {
      const ambilDataMaster = async () => {
        setIsLoadingDosen(true);
        setIsLoadingKelas(true);
        try {
          // A. Ambil master dosen
          const dataDosen = await dosenAPI.fetchDosen(); 
          setDaftarDosenDinamis(dataDosen || []);

          // B. REVISI UTAMA: Ambil master data dari tabel 'kelas' Supabase
          const resKelas = await axios.get("https://mwkewvjpgcvlwgycdpvo.supabase.co/rest/v1/kelas", {
            headers: {
              apikey: "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK",
              Authorization: "Bearer sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK"
            }
          });
          setDaftarKelasDinamis(resKelas.data || []);
        } catch (error) {
          console.error("Gagal mengambil master data perkuliahan:", error);
        } finally {
          setIsLoadingDosen(false);
          setIsLoadingKelas(false);
        }
      };
      ambilDataMaster();
    }
  }, [isModalTerbuka]);

  if (!isModalTerbuka) return null;

  const tanganiFormSubmit = async (e) => {
    e.preventDefault();
    if (!formInput.kode_mk || !formInput.hari || !formInput.ruangan || !formInput.dosen || !formInput.id_kelas) {
      alert("Mohon lengkapi semua pilihan dropdown kelas dan dosen yang tersedia.");
      return;
    }
    setIsSubmitting(true);
    
    const payloadJadwalDB = {
      mata_kuliah: formInput.nama_mk.trim(),
      nidn_dosen: formInput.dosen, 
      hari: formInput.hari,
      jam_mulai: formInput.jamMulai,
      jam_selesai: formInput.jamSelesai,
      ruangan: formInput.ruangan,
      kode_mk: `${formInput.kode_mk}-${formInput.semester}${formInput.kelas}`,
      kelas: formInput.kelas,
      id_kelas: parseInt(formInput.id_kelas), // Menyimpan relasi ID angka ke tabel jadwal
      sks: parseInt(formInput.sks) || 3,
      semester: parseInt(formInput.semester) || 1
    };

    try {
      const responsServer = await jadwalAPI.createJadwal(payloadJadwalDB);
      const dataTerbitBaru = Array.isArray(responsServer) ? responsServer[0] : responsServer;
      onSuksesSimpan(dataTerbitBaru || payloadJadwalDB);
      setIsModalTerbuka(false);
      setFormInput({
        kode_mk: "", nama_mk: "", dosen: "", hari: "", jamMulai: "", jamSelesai: "", ruangan: "", kelas: "", id_kelas: "", sks: "", semester: ""
      });
      alert("Jadwal perkuliahan baru berhasil diterbitkan ke cloud server database!");
    } catch (error) {
      console.error(error);
      alert(error.message || "Gagal menerbitkan jadwal. Pastikan relasi data valid.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[9999] p-6 md:p-12 animate-fadeIn text-slate-700 overflow-y-auto">
      <form onSubmit={tanganiFormSubmit} className="max-w-6xl mx-auto w-full pb-24 relative">
       
        <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6 w-full">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Penerbitan Jadwal Perkuliahan Baru</h3>
            <p className="text-xs text-slate-400 mt-0.5">Politeknik Kepulauan Simeulue • Sistem Informasi Akademik Terpadu</p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setIsModalTerbuka(false)}
            className="text-slate-400 hover:text-slate-900 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200 flex items-center gap-2 text-xs font-bold disabled:opacity-50"
          >
            <AiOutlineClose className="text-sm" />
            <span>Tutup</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 w-full">
         
          {/* Program Studi */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Program Studi (Kode)</label>
            <select
              required
              disabled={isSubmitting}
              value={formInput.kode_mk}
              onChange={(e) => setFormInput({ ...formInput, kode_mk: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition cursor-pointer"
            >
              <option value="" disabled hidden>-- Pilih Program Studi --</option>
              <option value="PPHP">PPHP (D4 Pengolahan Hasil Perikanan)</option>
              <option value="PTK">PTK (D3 Perikanan Tangkap)</option>
              <option value="BDI">BDI (D3 Budi Daya Ikan)</option>
            </select>
          </div>

          {/* REVISI UTAMA: Mengubah Input Teks Nama Kelas Menjadi Dropdown Master Tabel Kelas */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alokasi Rombel Kelas</label>
            <select
              required
              disabled={isSubmitting || isLoadingKelas}
              value={formInput.id_kelas}
              onChange={(e) => {
                const idTerpilih = e.target.value;
                const objekKelas = daftarKelasDinamis.find(k => k.id === parseInt(idTerpilih));
                setFormInput({
                  ...formInput,
                  id_kelas: idTerpilih,
                  kelas: objekKelas ? objekKelas.nama_kelas : ""
                });
              }}
              className="w-full bg-slate-50 text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" disabled hidden>
                {isLoadingKelas ? "Menghubungkan ke tabel kelas..." : "-- Pilih Kelas Database --"}
              </option>
              {daftarKelasDinamis.map((kls) => (
                <option key={kls.id} value={kls.id}>
                  {kls.nama_kelas} (Angkatan {kls.angkatan})
                </option>
              ))}
            </select>
          </div>

          {/* Hari Pelaksanaan */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hari Kuliah</label>
            <select
              required
              disabled={isSubmitting}
              value={formInput.hari}
              onChange={(e) => setFormInput({ ...formInput, hari: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" disabled hidden>-- Pilih Hari Kuliah --</option>
              <option>Senin</option><option>Selasa</option><option>Rabu</option><option>Kamis</option><option>Jumat</option>
            </select>
          </div>

          {/* Nama Mata Kuliah */}
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap Mata Kuliah</label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              placeholder="Masukkan judul mata kuliah kurikulum..."
              value={formInput.nama_mk}
              onChange={(e) => setFormInput({ ...formInput, nama_mk: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>

          {/* Ruangan */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ruang / Laboratorium</label>
            <select
              required
              disabled={isSubmitting}
              value={formInput.ruangan}
              onChange={(e) => setFormInput({ ...formInput, ruangan: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
            >
              <option value="" disabled hidden>-- Pilih Lokasi Ruangan --</option>
              <option>Lab Pengolahan Modern</option><option>Lab Hatchery & Pembenihan</option><option>Lab Uji Mutu & Mikrobiologi</option><option>Ruang Teori Bahari 105</option>
            </select>
          </div>

          {/* Dropdown Dosen */}
          <div className="space-y-1 lg:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dosen Pengampu Utama</label>
            <select
              required
              disabled={isSubmitting || isLoadingDosen}
              value={formInput.dosen}
              onChange={(e) => setFormInput({ ...formInput, dosen: e.target.value })}
              className="w-full bg-slate-50 text-slate-900 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="" disabled hidden>
                {isLoadingDosen ? "Menghubungkan ke database dosen..." : "-- Pilih Dosen Terdaftar di Server --"}
              </option>
              {daftarDosenDinamis.map((dsn) => (
                <option key={dsn.nidn} value={dsn.nidn}>{dsn.nama} ({dsn.nidn})</option>
              ))}
            </select>
          </div>

          {/* Jam Operasional */}
          <div className="grid grid-cols-2 gap-3 lg:col-span-1">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jam Mulai</label>
              <input type="time" required disabled={isSubmitting} value={formInput.jamMulai} onChange={(e) => setFormInput({ ...formInput, jamMulai: e.target.value })} className="w-full bg-slate-50 text-slate-900 text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jam Selesai</label>
              <input type="time" required disabled={isSubmitting} value={formInput.jamSelesai} onChange={(e) => setFormInput({ ...formInput, jamSelesai: e.target.value })} className="w-full bg-slate-50 text-slate-900 text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
            </div>
          </div>

          {/* Bobot SKS */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bobot SKS Perkuliahan</label>
            <input type="number" min="1" max="6" required disabled={isSubmitting} placeholder="Contoh SKS: 3" value={formInput.sks} onChange={(e) => setFormInput({ ...formInput, sks: e.target.value })} className="w-full bg-slate-50 text-slate-900 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

          {/* Tingkat Semester */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alokasi Semester</label>
            <input type="number" min="1" max="8" required disabled={isSubmitting} placeholder="Contoh Semester: 3" value={formInput.semester} onChange={(e) => setFormInput({ ...formInput, semester: e.target.value })} className="w-full bg-slate-50 text-slate-900 text-xs font-medium px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none" />
          </div>

        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-5 z-[10000]">
          <div className="max-w-6xl mx-auto flex justify-end gap-4 w-full">
            <button type="button" disabled={isSubmitting} onClick={() => setIsModalTerbuka(false)} className="w-full sm:w-44 bg-slate-100 text-slate-700 text-xs font-bold py-3.5 rounded-xl">Batalkan</button>
            <button type="submit" disabled={isSubmitting} className="w-full sm:w-64 bg-black text-white text-xs font-bold py-3.5 rounded-xl shadow-md disabled:bg-slate-600">
              {isSubmitting ? "Menerbitkan Jadwal..." : "Simpan & Terbitkan Jadwal"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default BuatJadwalBaru;