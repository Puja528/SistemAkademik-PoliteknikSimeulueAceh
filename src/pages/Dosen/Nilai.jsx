import React, { useState } from "react";
import {
  FiSearch,
  FiUser,
  FiDownload,
  FiSave,
  FiLock,
  FiUnlock,
} from "react-icons/fi";
import nilaiData from "../../data/Dosen/Nilai.json";

export default function Nilai() {
  // State utama untuk menampung data mahasiswa agar interaktif
  const [daftarMahasiswa, setDaftarMahasiswa] = useState(nilaiData.mahasiswa);
  const [isLocked, setIsLocked] = useState(false);

  // Ambil konfigurasi bobot penilaian dari JSON
  const { tugas: wTugas, uts: wUts, uas: wUas } = nilaiData.bobotPenilaian;

  // Fungsi pembantu untuk menentukan Huruf Mutu berdasarkan Nilai Akhir
  const hitungHurufMutu = (nilai) => {
    if (nilai >= 85) return "A";
    if (nilai >= 75) return "B";
    if (nilai >= 60) return "C";
    if (nilai >= 45) return "D";
    return "E";
  };

  // Fungsi untuk menangani perubahan input nilai per kolom mahasiswa
  const handleNilaiChange = (nim, field, value) => {
    // Validasi input: pastikan hanya angka antara 0-100 atau string kosong saat mengetik
    let numValue = value === "" ? 0 : parseFloat(value);
    if (numValue < 0) numValue = 0;
    if (numValue > 100) numValue = 100;

    const updated = daftarMahasiswa.map((mhs) => {
      if (mhs.nim === nim) {
        const updatedMhs = { ...mhs, [field]: numValue };

        // Kalkulasi Nilai Akhir secara real-time berdasarkan bobot penilaian
        const nilaiAkhir = 
          (updatedMhs.tugas * (wTugas / 100)) +
          (updatedMhs.uts * (wUts / 100)) +
          (updatedMhs.uas * (wUas / 100));

        updatedMhs.akhir = parseFloat(nilaiAkhir.toFixed(2));
        updatedMhs.huruf = hitungHurufMutu(updatedMhs.akhir);
        updatedMhs.status = updatedMhs.akhir >= 60 ? "Lulus" : "Tidak Lulus";

        return updatedMhs;
      }
      return mhs;
    });

    setDaftarMahasiswa(updated);
  };

  // Fungsi hitung statistik dinamis (Real-time)
  const totalMahasiswa = daftarMahasiswa.length;
  const sudahTerisi = daftarMahasiswa.filter(
    (mhs) => mhs.tugas > 0 || mhs.uts > 0 || mhs.uas > 0
  ).length;
  const belumDiisi = totalMahasiswa - sudahTerisi;
  
  const totalAkhir = daftarMahasiswa.reduce((sum, mhs) => sum + mhs.akhir, 0);
  const rataRataKelas = totalMahasiswa > 0 ? (totalAkhir / totalMahasiswa).toFixed(2) : 0;

  // Handler tombol aksi
  const handleSimpan = () => {
    if (isLocked) return alert("Nilai terkunci. Buka kunci terlebih dahulu untuk menyimpan perubahan.");
    alert("Perubahan nilai berhasil disimpan sementara!");
    console.log("Data siap dikirim ke API:", daftarMahasiswa);
  };

  const handleEkspor = () => {
    alert("Mengekspor data ke format Excel/CSV...");
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f4f6f9] min-h-screen font-sans">
      
      {/* Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Pilih Mata Kuliah
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Mata Kuliah
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#1a3a6b]">
              <option>RPL - 2 TI B</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">
              Semester
            </label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#1a3a6b]">
              <option>Genap 2025/2026</option>
            </select>
          </div>

          <div>
            <button className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white rounded-lg px-4 py-2 hover:bg-[#244b86] transition text-sm font-medium shadow-sm">
              <FiSearch />
              Tampilkan
            </button>
          </div>
        </div>
      </div>

      {/* Informasi Mata Kuliah */}
      <div className="bg-[#1a3a6b] text-white rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-md">
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">Mata Kuliah</p>
          <h4 className="font-semibold text-sm md:text-base mt-0.5">{nilaiData.mataKuliah.nama}</h4>
        </div>
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">SKS</p>
          <h4 className="font-semibold text-sm md:text-base mt-0.5">{nilaiData.mataKuliah.sks} SKS</h4>
        </div>
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">Kelas</p>
          <h4 className="font-semibold text-sm md:text-base mt-0.5">{nilaiData.mataKuliah.kelas}</h4>
        </div>
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">Status Dokumen</p>
          <h4 className={`font-semibold text-sm md:text-base mt-0.5 ${isLocked ? "text-red-400" : "text-yellow-300"}`}>
            {isLocked ? "Terkunci (Final)" : "Draft (Bisa Diubah)"}
          </h4>
        </div>
      </div>

      {/* Bobot Penilaian */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-3 shadow-sm">
        <span className="font-semibold text-xs uppercase tracking-wider text-gray-500 mr-2">
          Bobot Acuan Pokok:
        </span>
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
          Tugas {wTugas}%
        </span>
        <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-semibold">
          UTS {wUts}%
        </span>
        <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-semibold">
          UAS {wUas}%
        </span>
      </div>

      {/* Tabel Nilai */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <FiUser className="text-[#1a3a6b] text-lg" />
            <span className="font-bold text-gray-900 text-base md:text-lg">
              Daftar Nilai Mahasiswa
            </span>
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button 
              onClick={handleEkspor}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition text-sm font-medium border border-gray-300"
            >
              <FiDownload />
              Ekspor
            </button>
            <button 
              onClick={handleSimpan}
              disabled={isLocked}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg transition text-sm font-medium shadow-sm ${
                isLocked ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <FiSave />
              Simpan
            </button>
            <button 
              onClick={() => setIsLocked(!isLocked)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-white px-4 py-2 rounded-lg transition text-sm font-medium shadow-sm ${
                isLocked ? "bg-orange-500 hover:bg-orange-600" : "bg-[#1a3a6b] hover:bg-[#244b86]"
              }`}
            >
              {isLocked ? (
                <>
                  <FiUnlock /> Buka Kunci
                </>
              ) : (
                <>
                  <FiLock /> Kunci Nilai
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <th className="text-left px-4 py-3 w-12">No</th>
                <th className="text-left px-4 py-3 w-32">NIM</th>
                <th className="text-left px-4 py-3">Nama Mahasiswa</th>
                <th className="text-center px-2 py-3 w-24">Tugas</th>
                <th className="text-center px-2 py-3 w-24">UTS</th>
                <th className="text-center px-2 py-3 w-24">UAS</th>
                <th className="text-center px-4 py-3 w-28">Nilai Akhir</th>
                <th className="text-center px-4 py-3 w-20">Huruf</th>
                <th className="text-center px-4 py-3 w-32">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {daftarMahasiswa.map((mhs) => (
                <tr key={mhs.nim} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{mhs.no}</td>
                  <td className="px-4 py-3 font-mono text-gray-600">{mhs.nim}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{mhs.nama}</td>
                  
                  {/* Kolom Input Tugas */}
                  <td className="px-2 py-2 text-center">
                    <input
                      type="number"
                      value={mhs.tugas}
                      disabled={isLocked}
                      onChange={(e) => handleNilaiChange(mhs.nim, "tugas", e.target.value)}
                      className="w-full text-center border border-gray-200 rounded px-1.5 py-1 focus:ring-1 focus:ring-[#1a3a6b] focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </td>

                  {/* Kolom Input UTS */}
                  <td className="px-2 py-2 text-center">
                    <input
                      type="number"
                      value={mhs.uts}
                      disabled={isLocked}
                      onChange={(e) => handleNilaiChange(mhs.nim, "uts", e.target.value)}
                      className="w-full text-center border border-gray-200 rounded px-1.5 py-1 focus:ring-1 focus:ring-[#1a3a6b] focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </td>

                  {/* Kolom Input UAS */}
                  <td className="px-2 py-2 text-center">
                    <input
                      type="number"
                      value={mhs.uas}
                      disabled={isLocked}
                      onChange={(e) => handleNilaiChange(mhs.nim, "uas", e.target.value)}
                      className="w-full text-center border border-gray-200 rounded px-1.5 py-1 focus:ring-1 focus:ring-[#1a3a6b] focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </td>

                  {/* Nilai Akhir Otomatis */}
                  <td className="px-4 py-3 text-center font-bold text-blue-600">
                    {mhs.akhir}
                  </td>

                  {/* Badge Huruf Mutu Dinamis */}
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      mhs.huruf === "A" || mhs.huruf === "B" 
                        ? "bg-green-100 text-green-800" 
                        : mhs.huruf === "C" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                    }`}>
                      {mhs.huruf}
                    </span>
                  </td>

                  {/* Badge Kelulusan Dinamis */}
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                      mhs.status === "Lulus" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                    }`}>
                      {mhs.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Statistik Interaktif */}
        <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs md:text-sm text-gray-600 bg-gray-50 p-4 rounded-xl">
          <div>
            Total Mahasiswa: <span className="font-bold text-gray-900 block md:inline">{totalMahasiswa}</span>
          </div>
          <div>
            Sudah Terisi: <span className="font-bold text-green-600 block md:inline">{sudahTerisi}</span>
          </div>
          <div>
            Belum Diisi: <span className="font-bold text-red-600 block md:inline">{belumDiisi}</span>
          </div>
          <div>
            Rata-rata Kelas: <span className="font-bold text-blue-600 block md:inline">{rataRataKelas}</span>
          </div>
        </div>

      </div>
    </div>
  );
}