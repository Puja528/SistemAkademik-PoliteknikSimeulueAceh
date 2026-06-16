import React, { useState } from "react";
import {
  FiUsers,
  FiClock,
  FiMapPin,
  FiCalendar,
  FiGrid,
  FiList,
  FiEyeOff,
} from "react-icons/fi";
import jadwalData from "../../data/Dosen/Jadwal.json";

export default function Jadwal() {
  // State untuk melacak mata kuliah apa yang sedang di-filter via Legend Klik
  const [selectedMataKuliah, setSelectedMataKuliah] = useState(null);
  
  // State untuk mengubah mode view (All / Mingguan vs Fokus Hari Ini)
  const [viewMode, setViewMode] = useState("all"); // 'all' atau 'today'

  const mataKuliahList = jadwalData.mataKuliah;

  // Data Jadwal Mingguan yang dipetakan secara terstruktur
  const jadwalSeminggu = {
    Senin: [
      { nama: "Struktur Data", kelas: "TI-D", ruang: "R.201", waktu: "08:00 - 09:40", color: "bg-green-50 border-green-200 text-green-900" }
    ],
    Selasa: [
      { nama: "Basis Data", kelas: "TI-A", ruang: "Lab 317", waktu: "08:00 - 09:40", color: "bg-blue-50 border-blue-200 text-blue-900" },
      { nama: "PBO", kelas: "TI-B", ruang: "Lab 256", waktu: "11:00 - 13:40", color: "bg-yellow-50 border-yellow-200 text-yellow-900" },
      { nama: "Kecerdasan Buatan", kelas: "TI-C", ruang: "R.204", waktu: "13:00 - 14:40", color: "bg-purple-50 border-purple-200 text-purple-900" }
    ],
    Rabu: [
      { nama: "Basis Data", kelas: "TI-A", ruang: "Lab 317", waktu: "08:00 - 09:40", color: "bg-blue-50 border-blue-200 text-blue-900" },
      { nama: "Kecerdasan Buatan", kelas: "TI-C", ruang: "R.204", waktu: "13:00 - 14:40", color: "bg-purple-50 border-purple-200 text-purple-900" },
      { nama: "Struktur Data", kelas: "TI-D", ruang: "R.201", waktu: "15:00 - 16:40", color: "bg-green-50 border-green-200 text-green-900" }
    ],
    Kamis: [
      { nama: "Struktur Data", kelas: "TI-D", ruang: "R.201", waktu: "10:00 - 11:40", color: "bg-green-50 border-green-200 text-green-900" }
    ],
    Jumat: [
      { nama: "PBO", kelas: "TI-B", ruang: "Lab 256", waktu: "08:00 - 09:40", color: "bg-yellow-50 border-yellow-200 text-yellow-900" }
    ]
  };

  const infoHariIni = { namaHari: "Senin", tanggal: "14 Juni 2026" };

  // Fungsi pembantu untuk memfilter element berdasarkan legend yang di klik
  const isCardVisible = (namaMk) => {
    if (!selectedMataKuliah) return true;
    return namaMk.toLowerCase() === selectedMataKuliah.toLowerCase();
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f4f6f9] min-h-screen font-sans">

      {/* Ringkasan Header */}
      <div className="bg-[#1a3a6b] text-white rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center shadow-md">
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">Hari Ini</p>
          <h4 className="font-bold text-base md:text-lg">{infoHariIni.namaHari}, {infoHariIni.tanggal}</h4>
        </div>

        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">Total Mengajar</p>
          <h4 className="font-bold text-base md:text-lg">{mataKuliahList.length} Mata Kuliah</h4>
        </div>

        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">Total Sesi / Minggu</p>
          <h4 className="font-bold text-base md:text-lg">9 Sesi Perkuliahan</h4>
        </div>

        <div className="flex sm:justify-end gap-2">
          <button 
            onClick={() => setViewMode(viewMode === "all" ? "today" : "all")}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-semibold border border-white/20 transition"
          >
            {viewMode === "all" ? <FiList /> : <FiGrid />}
            {viewMode === "all" ? "Fokus Hari Ini" : "Lihat Semua"}
          </button>
          <span className="bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center">
            Minggu Aktif
          </span>
        </div>
      </div>

      {/* Kartu Informasi Utama Mata Kuliah Aktif */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide">
            {viewMode === "today" ? "Jadwal Mengajar Hari Ini" : "Ikhtisar Kelas Diampu"}
          </h2>
          {selectedMataKuliah && (
            <button 
              onClick={() => setSelectedMataKuliah(null)}
              className="text-xs font-medium text-red-600 hover:underline flex items-center gap-1"
            >
              <FiEyeOff size={12}/> Bersihkan Filter Saringan
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mataKuliahList
            .filter((mk) => viewMode === "all" || mk.hari === infoHariIni.namaHari)
            .map((mk, index) => {
              const visible = isCardVisible(mk.nama);
              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl border p-5 shadow-sm transition-all duration-300 ${
                    visible ? "opacity-100 scale-100 border-gray-200" : "opacity-30 scale-95 border-gray-100"
                  } ${mk.hari === infoHariIni.namaHari ? "ring-2 ring-blue-500/50 border-blue-300" : ""}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 text-base">{mk.nama}</h3>
                    {mk.hari === infoHariIni.namaHari && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Hari Ini
                      </span>
                    )}
                  </div>

                  <div className="space-y-2.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2.5">
                      <FiUsers className="text-gray-400" />
                      <span>{mk.kelas}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <FiClock className="text-gray-400" />
                      <span className="font-medium text-gray-700">{mk.hari}, {mk.waktu}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <FiMapPin className="text-gray-400" />
                      <span>{mk.ruang}</span>
                    </div>
                  </div>

                  <button className="mt-4 w-full bg-gray-50 hover:bg-gray-100 text-[#1a3a6b] text-xs font-semibold py-2 rounded-lg border border-gray-200 transition">
                    {mk.pertemuan}
                  </button>
                </div>
              );
            })}
        </div>
      </div>

      {/* Jadwal Timetable Mingguan */}
      {viewMode === "all" && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Jadwal Kalender Mingguan</h2>
              <span className="text-xs text-gray-500 font-medium">(Periode Aktif Perkuliahan Semester)</span>
            </div>
            <div className="flex items-center gap-2 text-[#1a3a6b] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-semibold">
              <FiCalendar />
              <span>Minggu Ke-10</span>
            </div>
          </div>

          {/* Grid Konten Timetable */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              
              {/* Header Nama Hari */}
              <div className="grid grid-cols-6 gap-3 mb-4 text-center border-b border-gray-100 pb-2">
                <div className="text-left font-semibold text-xs uppercase tracking-wider text-gray-400 self-end px-2">Jam Kerja</div>
                {Object.keys(jadwalSeminggu).map((hari) => (
                  <div 
                    key={hari} 
                    className={`py-2 rounded-xl text-sm font-bold transition ${
                      hari === infoHariIni.namaHari 
                        ? "bg-[#1a3a6b] text-white shadow-sm" 
                        : "bg-gray-50 text-gray-700 border border-gray-100"
                    }`}
                  >
                    {hari}
                  </div>
                ))}
              </div>

              {/* Baris Jam & Blok Sesi Matakuliah */}
              <div className="grid grid-cols-6 gap-3">
                
                {/* Kolom Petunjuk Waktu Grid Kiri */}
                <div className="space-y-12 text-xs font-bold text-gray-400 pt-2 px-2">
                  <div>08:00 WIB</div>
                  <div>10:00 WIB</div>
                  <div>13:00 WIB</div>
                  <div>15:00 WIB</div>
                </div>

                {/* Looping pengisian blok data per hari */}
                {Object.entries(jadwalSeminggu).map(([hari, listKelas]) => (
                  <div key={hari} className="space-y-3 min-h-[300px] bg-gray-50/50 p-2 rounded-xl border border-dashed border-gray-200">
                    {listKelas.map((kelas, idx) => {
                      const visible = isCardVisible(kelas.nama);
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedMataKuliah(kelas.nama)}
                          className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 hover:shadow-md ${kelas.color} ${
                            visible ? "opacity-100 scale-100" : "opacity-20 scale-95"
                          }`}
                        >
                          <p className="font-bold text-xs leading-tight mb-1">{kelas.nama}</p>
                          <div className="text-[11px] opacity-90 space-y-0.5">
                            <p className="font-semibold">{kelas.kelas} · {kelas.ruang}</p>
                            <p className="text-[10px] font-mono opacity-75">{kelas.waktu}</p>
                          </div>
                        </div>
                      );
                    })}
                    {listKelas.length === 0 && (
                      <div className="text-center py-12 text-xs text-gray-300 font-medium">Tidak Ada Jadwal</div>
                    )}
                  </div>
                ))}

              </div>
            </div>
          </div>

          {/* Interactive Legend Row */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Saring Cepat Berdasarkan Mata Kuliah:</p>
            <div className="flex flex-wrap gap-3">
              {[
                { nama: "Basis Data", color: "bg-blue-400" },
                { nama: "Struktur Data", color: "bg-green-400" },
                { nama: "PBO", color: "bg-yellow-400" },
                { nama: "Kecerdasan Buatan", color: "bg-purple-400" },
              ].map((lg) => (
                <button
                  key={lg.nama}
                  onClick={() => setSelectedMataKuliah(selectedMataKuliah === lg.nama ? null : lg.nama)}
                  className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    selectedMataKuliah === lg.nama
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm scale-105"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${lg.color}`}></span>
                  {lg.nama}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}