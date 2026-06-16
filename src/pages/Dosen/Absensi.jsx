import React, { useState, useEffect } from "react";
import { FiSearch, FiUser, FiCheckSquare, FiSave, FiAlertCircle } from "react-icons/fi";
import { jadwalAPI } from "../../services/jadwalAPI";
import { dosenAPI } from "../../services/dosenAPI";
import { absensiAPI } from "../../services/absensiAPI";
import axios from "axios";

export default function Absensi() {
  const [daftarJadwal, setDaftarJadwal] = useState([]);
  const [idJadwalTerpilih, setIdJadwalTerpilih] = useState("");
  const [jadwalDetail, setJadwalDetail] = useState(null);
  
  const [daftarMahasiswa, setDaftarMahasiswa] = useState([]);
  const [filterPertemuan, setFilterPertemuan] = useState("Pertemuan 1");
  const [isLoading, setIsLoading] = useState(false);

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
          // PERBAIKAN: Gunakan id_jadwal
          setIdJadwalTerpilih(jadwalSaya[0].id_jadwal);
          setJadwalDetail(jadwalSaya[0]);
        }
      } catch (error) {
        console.error("Gagal muat data absen:", error);
      }
    };
    muatJadwalAbsen();
  }, []);

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
    try {
      const payloadAbsen = daftarMahasiswa.map(m => ({
        id_jadwal: parseInt(idJadwalTerpilih),
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

  const ringkasan = daftarMahasiswa.reduce(
    (acc, mhs) => {
      if (mhs.status === "Hadir") acc.hadir++;
      else if (mhs.status === "Sakit") acc.sakit++;
      else if (mhs.status === "Izin") acc.izin++;
      else acc.alpa++;
      return acc;
    },
    { hadir: 0, sakit: 0, izin: 0, alpa: 0 }
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Hadir": return "bg-green-100 text-green-800 border-green-300";
      case "Sakit": return "bg-blue-100 text-blue-800 border-blue-300";
      case "Izin": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Alpa": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f4f6f9] min-h-screen font-sans">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Pilih Mata Kuliah & Pertemuan</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Mata Kuliah</label>
            <select 
              value={idJadwalTerpilih}
              onChange={(e) => {
                const targetId = parseInt(e.target.value);
                setIdJadwalTerpilih(targetId);
                // PERBAIKAN: Gunakan id_jadwal untuk find
                setJadwalDetail(daftarJadwal.find(j => j.id_jadwal === targetId));
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer"
            >
              {daftarJadwal.map(j => (
                <option key={j.id_jadwal} value={j.id_jadwal}>{j.mata_kuliah} - Kelas {j.kelas}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Pertemuan Ke-</label>
            <select value={filterPertemuan} onChange={(e) => setFilterPertemuan(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer">
              {[...Array(16)].map((_, i) => <option key={i+1} value={`Pertemuan ${i+1}`}>Pertemuan {i+1}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Jam Kerja</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-slate-50" disabled>
              <option>{jadwalDetail ? `${jadwalDetail.jam_mulai?.substring(0,5)} WIB` : "--:--"}</option>
            </select>
          </div>
          <div>
            <button onClick={muatDaftarHadirMahasiswa} className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white rounded-lg px-4 py-2 hover:bg-[#244b86] transition font-medium text-sm shadow-sm cursor-pointer">
              <FiSearch /> Tampilkan
            </button>
          </div>
        </div>
      </div>

      {jadwalDetail && (
        <div className="bg-[#1a3a6b] text-white rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-md">
          <div><p className="text-xs opacity-70 uppercase tracking-wider">Mata Kuliah</p><h4 className="font-semibold text-sm mt-0.5">{jadwalDetail.mata_kuliah}</h4></div>
          <div><p className="text-xs opacity-70 uppercase tracking-wider">Ruangan</p><h4 className="font-semibold text-sm mt-0.5">{jadwalDetail.ruangan}</h4></div>
          <div><p className="text-xs opacity-70 uppercase tracking-wider">Pertemuan</p><h4 className="font-semibold text-sm mt-0.5">{filterPertemuan}</h4></div>
          <div><p className="text-xs opacity-70 uppercase tracking-wider">Tanggal Sesi</p><h4 className="font-semibold text-sm mt-0.5">{new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</h4></div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center"><p className="text-xs text-green-700 font-medium">Hadir</p><p className="text-xl font-bold text-green-900">{ringkasan.hadir}</p></div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center"><p className="text-xs text-blue-700 font-medium">Sakit</p><p className="text-xl font-bold text-blue-900">{ringkasan.sakit}</p></div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center"><p className="text-xs text-yellow-700 font-medium">Izin</p><p className="text-xl font-bold text-yellow-900">{ringkasan.izin}</p></div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center"><p className="text-xs text-red-700 font-medium">Alpa</p><p className="text-xl font-bold text-red-900">{ringkasan.alpa}</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex-1">
        <div className="flex justify-between items-center gap-4 mb-5">
          <span className="font-bold text-gray-900 text-base flex items-center gap-2"><FiUser /> Daftar Mahasiswa</span>
          <div className="flex gap-2">
            <button onClick={handleHadirSemua} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition text-sm font-medium border border-gray-300 cursor-pointer"><FiCheckSquare className="text-green-600" /> Hadir Semua</button>
            <button onClick={handleSimpan} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm cursor-pointer"><FiSave /> Simpan Absensi</button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="text-left px-4 py-3 w-12">No</th>
                <th className="text-left px-4 py-3">ID Mahasiswa</th>
                <th className="text-left px-4 py-3">Nama Mahasiswa</th>
                <th className="text-left px-4 py-3">Kehadiran</th>
                <th className="text-center px-4 py-3 w-40">Status Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {daftarMahasiswa.map((mhs) => (
                <tr key={mhs.id_mahasiswa} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 text-gray-500">{mhs.no}</td>
                  <td className="px-4 py-3.5 font-mono text-gray-600 font-bold">{mhs.id_mahasiswa}</td>
                  <td className="px-4 py-3.5 font-medium text-gray-900 uppercase">{mhs.nama}</td>
                  <td className="px-4 py-3.5"><span className="text-gray-700 font-medium">{mhs.kehadiran}</span></td>
                  <td className="px-4 py-3.5 text-center">
                    <select value={mhs.status} onChange={(e) => handleStatusChange(mhs.id_mahasiswa, e.target.value)} className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer transition ${getStatusBadgeClass(mhs.status)}`}>
                      <option value="Hadir" className="bg-white text-gray-900">Hadir</option>
                      <option value="Sakit" className="bg-white text-gray-900">Sakit</option>
                      <option value="Izin" className="bg-white text-gray-900">Izin</option>
                      <option value="Alpa" className="bg-white text-gray-900">Alpa</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {daftarMahasiswa.length === 0 && (
          <div className="text-center py-8 text-gray-400 flex flex-col items-center gap-2"><FiAlertCircle size={24} /><p>Pilih kelas dan klik tampilkan mahasiswa.</p></div>
        )}
      </div>
    </div>
  );
}