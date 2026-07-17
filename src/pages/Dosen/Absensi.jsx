import React, { useState, useEffect } from "react";
import { FiSearch, FiUser, FiCheckSquare, FiSave, FiAlertCircle } from "react-icons/fi";
import { jadwalAPI } from "../../services/jadwalAPI";
import { dosenAPI } from "../../services/dosenAPI";
import { absensiAPI } from "../../services/absensiAPI";
import axios from "axios";
import Loading from "../../components/admin/Loading";

export default function Absensi() {
  const [daftarJadwal, setDaftarJadwal] = useState([]);
  const [idJadwalTerpilih, setIdJadwalTerpilih] = useState("");
  const [jadwalDetail, setJadwalDetail] = useState(null);
  
  const [daftarMahasiswa, setDaftarMahasiswa] = useState([]);
  const [filterPertemuan, setFilterPertemuan] = useState("Pertemuan 1");
  const [isLoading, setIsLoading] = useState(false);

  // 1. Ambil Data Awal (Sekali Saja saat Mount)
  useEffect(() => {
    const muatJadwalAbsen = async () => {
      try {
        const localSession = localStorage.getItem("siakad_session");
        if (!localSession) return;
        const dataUserLogin = JSON.parse(localSession);

        const dosenReal = await dosenAPI.fetchDosenByUserId(dataUserLogin.id);
        if (!dosenReal) return;

        const semuaJadwal = await jadwalAPI.fetchJadwal();
        const jadwalSaya = semuaJadwal.filter(j => j.nidn_dosen === dosenReal.nidn);
        setDaftarJadwal(jadwalSaya);
        
        if (jadwalSaya.length > 0) {
          // Amankan tipe data id_jadwal agar fleksibel baik string maupun number
          setIdJadwalTerpilih(jadwalSaya[0].id_jadwal);
          setJadwalDetail(jadwalSaya[0]);
        }
      } catch (error) {
        console.error("Gagal muat data absen:", error);
      }
    };
    muatJadwalAbsen();
  }, []);

  // 2. Fungsi Mengambil Daftar Mahasiswa & Status Absensi
  const muatDaftarHadirMahasiswa = async () => {
    if (!idJadwalTerpilih || !jadwalDetail) return;
    setIsLoading(true);
    try {
      const absenTersimpan = await absensiAPI.fetchAbsensiKelas(idJadwalTerpilih, filterPertemuan);
      
      const targetKelasId = parseInt(jadwalDetail.id_kelas);
      
      const resMhs = await axios.get(`https://mwkewvjpgcvlwgycdpvo.supabase.co/rest/v1/mahasiswa`, {
        params: { id_kelas: `eq.${targetKelasId}` },
        headers: {
          apikey: "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK",
          Authorization: "Bearer sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK"
        }
      });
      
      const masterMhs = resMhs.data || [];

      const lembarAbsen = masterMhs.map((mhs, idx) => {
        const match = absenTersimpan.find(a => a.id_mahasiswa === mhs.id_mahasiswa);
        return {
          no: idx + 1,
          id_mahasiswa: mhs.id_mahasiswa,
          nama: mhs.nama,
          status: match ? match.status_kehadiran : "Hadir", 
          kehadiran: match ? (match.status_kehadiran === "Hadir" ? "100%" : "0%") : "100%"
        };
      });

      setDaftarMahasiswa(lembarAbsen);
    } catch (error) {
      console.error("Gagal menyusun absensi kelas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Otomatis bersihkan/reset daftar mahasiswa jika user mengganti pilihan jadwal/pertemuan sebelum mengeklik Tampilkan kembali
  useEffect(() => {
    setDaftarMahasiswa([]);
  }, [idJadwalTerpilih, filterPertemuan]);

  const handleStatusChange = (idMhs, statusBaru) => {
    const updated = daftarMahasiswa.map((mhs) => {
      if (mhs.id_mahasiswa === idMhs) {
        const kehadiranBaru = statusBaru === "Hadir" ? "100%" : "0%"; 
        return { ...mhs, status: statusBaru, kehadiran: kehadiranBaru };
      }
      return mhs;
    });
    setDaftarMahasiswa(updated);
  };

  const handleHadirSemua = () => {
    const updated = daftarMahasiswa.map((mhs) => ({
      ...mhs,
      status: "Hadir",
      kehadiran: "100%",
    }));
    setDaftarMahasiswa(updated);
  };

  const handleSimpan = async () => {
    if (daftarMahasiswa.length === 0) {
      alert("Tidak ada data absensi mahasiswa yang bisa disimpan.");
      return;
    }
    try {
      const payloadAbsen = daftarMahasiswa.map(m => ({
        id_jadwal: idJadwalTerpilih, // Hindari paksaan parseInt jika skema database Anda UUID/String
        id_mahasiswa: m.id_mahasiswa,
        pertemuan: filterPertemuan,
        status_kehadiran: m.status,
        tanggal_absen: new Date().toISOString().split('T')[0]
      }));

      await absensiAPI.simpanAbsensiKelas(payloadAbsen);
      alert("Data lembar absensi berkas mahasiswa berhasil diunggah!");
    } catch (error) {
      alert("Gagal mengunggah absensi: " + error.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Hadir": return "bg-green-50 text-green-700 border-green-200";
      case "Sakit": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Izin": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Alpa": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-gray-50 text-slate-600 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f4f6f9] min-h-screen font-sans text-xs text-slate-700 w-full animate-fadeIn">
      
      {/* 1. SEKSI FORM SELEKSI MATA KULIAH */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-950 mb-4">Pilih Mata Kuliah & Pertemuan</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Mata Kuliah</label>
            <select 
              value={idJadwalTerpilih}
              onChange={(e) => {
                const targetId = e.target.value; // Dinamis tanpa paksaan parseInt
                setIdJadwalTerpilih(targetId);
                // Pastikan pembandingan tipe data menggunakan double equals (==) atau normalisasi string
                setJadwalDetail(daftarJadwal.find(j => String(j.id_jadwal) === String(targetId)));
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-slate-400 transition"
            >
              {daftarJadwal.map(j => (
                <option key={j.id_jadwal} value={j.id_jadwal}>{j.mata_kuliah} - Kelas {j.kelas}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Pertemuan Ke-</label>
            <select value={filterPertemuan} onChange={(e) => setFilterPertemuan(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-slate-400 transition">
              {[...Array(16)].map((_, i) => <option key={i+1} value={`Pertemuan ${i+1}`}>Pertemuan {i+1}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Jam Kerja</label>
            <div className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-gray-50 text-slate-500 font-medium min-h-[30px] flex items-center">
              {jadwalDetail ? `${jadwalDetail.jam_mulai?.substring(0,5)} WIB` : "--:--"}
            </div>
          </div>
          <div>
            <button 
              onClick={muatDaftarHadirMahasiswa} 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white rounded-lg px-4 py-1.5 hover:bg-[#244b86] transition font-bold text-xs shadow-sm cursor-pointer h-[32px] disabled:opacity-50"
            >
              <FiSearch className="text-xs" /> {isLoading ? "Memuat..." : "Tampilkan"}
            </button>
          </div>
        </div>
      </div>

      {/* 2. AREA DETAIL JADWAL YANG TERPILIH */}
      {jadwalDetail && (
        <div className="text-white rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-sm animate-fadeIn" style={{ background: "linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)" }}>
          <div><p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">Mata Kuliah</p><h4 className="font-bold text-xs mt-0.5">{jadwalDetail.mata_kuliah}</h4></div>
          <div><p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">Ruangan</p><h4 className="font-bold text-xs mt-0.5">{jadwalDetail.ruangan}</h4></div>
          <div><p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">Pertemuan</p><h4 className="font-bold text-xs mt-0.5">{filterPertemuan}</h4></div>
          <div><p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">Tanggal Sesi</p><h4 className="font-bold text-xs mt-0.5">{new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</h4></div>
        </div>
      )}

      {/* 3. AREA TABEL LEMBAR ABSENSI */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex-1">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5">
          <span className="font-bold text-slate-950 text-sm flex items-center gap-2"><FiUser className="text-slate-800" /> Daftar Mahasiswa</span>
          {daftarMahasiswa.length > 0 && (
            <div className="flex gap-2">
              <button onClick={handleHadirSemua} className="flex items-center gap-1.5 bg-white text-slate-600 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition text-xs font-bold cursor-pointer shadow-sm">
                <FiCheckSquare className="text-emerald-600 text-sm" /> Hadir Semua
              </button>
              <button onClick={handleSimpan} className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition text-xs font-bold shadow-sm cursor-pointer">
                <FiSave className="text-sm" /> Simpan Absensi
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center items-center"><Loading /></div>
        ) : daftarMahasiswa.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="text-left px-4 py-3 w-12">No</th>
                  <th className="text-left px-4 py-3">ID Mahasiswa</th>
                  <th className="text-left px-4 py-3">Nama Mahasiswa</th>
                  <th className="text-left px-4 py-3">Kehadiran</th>
                  <th className="text-center px-4 py-3 w-40">Status Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-600">
                {daftarMahasiswa.map((mhs) => (
                  <tr key={mhs.id_mahasiswa} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-gray-400 font-medium">{mhs.no}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-900 font-bold tracking-wide">{mhs.id_mahasiswa}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-800 uppercase">{mhs.nama}</td>
                    <td className="px-4 py-3.5"><span className="text-slate-700 font-bold">{mhs.kehadiran}</span></td>
                    <td className="px-4 py-3.5 text-center">
                      <select 
                        value={mhs.status} 
                        onChange={(e) => handleStatusChange(mhs.id_mahasiswa, e.target.value)} 
                        className={`w-full border rounded-lg px-2.5 py-1 text-[11px] font-bold focus:outline-none cursor-pointer transition leading-none text-center ${getStatusBadgeClass(mhs.status)}`}
                      >
                        <option value="Hadir" className="bg-white text-slate-800">Hadir</option>
                        <option value="Sakit" className="bg-white text-slate-800">Sakit</option>
                        <option value="Izin" className="bg-white text-slate-800">Izin</option>
                        <option value="Alpa" className="bg-white text-slate-800">Alpa</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2 border border-dashed border-gray-200 rounded-xl">
            <FiAlertCircle size={24} className="text-gray-300" />
            <p className="font-semibold text-xs text-gray-500">Pilih mata kuliah terlebih dahulu, lalu klik tombol Tampilkan.</p>
          </div>
        )}
      </div>
    </div>
  );
}