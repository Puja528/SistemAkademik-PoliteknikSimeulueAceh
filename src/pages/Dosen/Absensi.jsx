import React, { useState } from "react";
import {
  FiSearch,
  FiUser,
  FiCheckSquare,
  FiSave,
  FiAlertCircle,
} from "react-icons/fi";
import absensiData from "../../data/Dosen/Absensi.json";

export default function Absensi() {
  // State untuk menyimpan data mahasiswa agar bisa diubah secara interaktif
  const [daftarMahasiswa, setDaftarMahasiswa] = useState(absensiData.mahasiswa);
  
  // State untuk filter (jika nanti ada banyak pilihan)
  const [filterMk, setFilterMk] = useState(absensiData.filter.mataKuliah);
  const [filterPertemuan, setFilterPertemuan] = useState(absensiData.filter.pertemuan);
  const [filterJam, setFilterJam] = useState(absensiData.filter.jam);

  // Fungsi untuk mengubah status kehadiran per mahasiswa
  const handleStatusChange = (nim, statusBaru) => {
    const updated = daftarMahasiswa.map((mhs) => {
      if (mhs.nim === nim) {
        // Asumsi persentase kehadiran ikut berubah atau disesuaikan kelak
        const kehadiranBaru = statusBaru === "Hadir" ? "100%" : "0%"; 
        return { ...mhs, status: statusBaru, kehadiran: kehadiranBaru };
      }
      return mhs;
    });
    setDaftarMahasiswa(updated);
  };

  // Fungsi tombol "Hadir Semua"
  const handleHadirSemua = () => {
    const updated = daftarMahasiswa.map((mhs) => ({
      ...mhs,
      status: "Hadir",
      kehadiran: "100%",
    }));
    setDaftarMahasiswa(updated);
  };

  // Fungsi tombol "Simpan Absensi"
  const handleSimpan = () => {
    alert("Data absensi berhasil disimpan secara lokal!");
    console.log("Data yang disimpan:", daftarMahasiswa);
    // Di sini Anda bisa menembak API (e.g., axios.post) untuk menyimpan ke database
  };

  // Hitung ringkasan status secara real-time
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

  // Helper styling untuk badge status teks
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
      
      {/* Filter Mata Kuliah */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Pilih Mata Kuliah & Pertemuan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Mata Kuliah
            </label>
            <select 
              value={filterMk}
              onChange={(e) => setFilterMk(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
            >
              <option value={absensiData.filter.mataKuliah}>{absensiData.filter.mataKuliah}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Pertemuan Ke-
            </label>
            <select 
              value={filterPertemuan}
              onChange={(e) => setFilterPertemuan(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
            >
              <option value={absensiData.filter.pertemuan}>{absensiData.filter.pertemuan}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Jam
            </label>
            <select 
              value={filterJam}
              onChange={(e) => setFilterJam(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
            >
              <option value={absensiData.filter.jam}>{absensiData.filter.jam}</option>
            </select>
          </div>

          <div>
            <button className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white rounded-lg px-4 py-2 hover:bg-[#244b86] transition font-medium text-sm shadow-sm">
              <FiSearch />
              Tampilkan
            </button>
          </div>
        </div>
      </div>

      {/* Informasi Perkuliahan */}
      <div className="bg-[#1a3a6b] text-white rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-md">
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">Mata Kuliah</p>
          <h4 className="font-semibold text-sm md:text-base mt-0.5">{absensiData.informasiPerkuliahan.mataKuliah}</h4>
        </div>
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">Ruang</p>
          <h4 className="font-semibold text-sm md:text-base mt-0.5">{absensiData.informasiPerkuliahan.ruang}</h4>
        </div>
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">Pertemuan</p>
          <h4 className="font-semibold text-sm md:text-base mt-0.5">{absensiData.informasiPerkuliahan.pertemuan}</h4>
        </div>
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">Tanggal</p>
          <h4 className="font-semibold text-sm md:text-base mt-0.5">{absensiData.informasiPerkuliahan.tanggal}</h4>
        </div>
      </div>

      {/* Ringkasan Kehadiran (Stat Counter) */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <p className="text-xs text-green-700 font-medium">Hadir</p>
          <p className="text-xl font-bold text-green-900">{ringkasan.hadir}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-xs text-blue-700 font-medium">Sakit</p>
          <p className="text-xl font-bold text-blue-900">{ringkasan.sakit}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
          <p className="text-xs text-yellow-700 font-medium">Izin</p>
          <p className="text-xl font-bold text-yellow-900">{ringkasan.izin}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
          <p className="text-xs text-red-700 font-medium">Alpa</p>
          <p className="text-xl font-bold text-red-900">{ringkasan.alpa}</p>
        </div>
      </div>

      {/* Tabel Mahasiswa */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <FiUser className="text-[#1a3a6b] text-lg" />
            <span className="font-bold text-gray-900 text-base md:text-lg">
              Daftar Mahasiswa - {absensiData.kelas.nama}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button 
              onClick={handleHadirSemua}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition text-sm font-medium border border-gray-300"
            >
              <FiCheckSquare className="text-green-600" />
              Hadir Semua
            </button>
            <button 
              onClick={handleSimpan}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm"
            >
              <FiSave />
              Simpan Absensi
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="text-left px-4 py-3 w-12">No</th>
                <th className="text-left px-4 py-3">NIM</th>
                <th className="text-left px-4 py-3">Nama Mahasiswa</th>
                <th className="text-left px-4 py-3">Kehadiran</th>
                <th className="text-center px-4 py-3 w-40">Status Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {daftarMahasiswa.map((mhs) => (
                <tr
                  key={mhs.nim}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3.5 text-gray-500">{mhs.no}</td>
                  <td className="px-4 py-3.5 font-mono text-gray-600">{mhs.nim}</td>
                  <td className="px-4 py-3.5 font-medium text-gray-900">
                    {mhs.nama}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-gray-700 font-medium">{mhs.kehadiran}</span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {/* Mengubah button statis menjadi select dropdown yang dinamis */}
                    <select
                      value={mhs.status}
                      onChange={(e) => handleStatusChange(mhs.nim, e.target.value)}
                      className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#1a3a6b] cursor-pointer transition ${getStatusBadgeClass(mhs.status)}`}
                    >
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
          <div className="text-center py-8 text-gray-400 flex flex-col items-center gap-2">
            <FiAlertCircle size={24} />
            <p>Tidak ada data mahasiswa tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
}