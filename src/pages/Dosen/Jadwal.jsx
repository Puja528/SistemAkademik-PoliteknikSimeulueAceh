import React, { useState, useEffect } from "react";
import { FiUsers, FiClock, FiMapPin, FiCalendar, FiGrid, FiList, FiEyeOff } from "react-icons/fi";
import { jadwalAPI } from "../../services/jadwalAPI";
import { dosenAPI } from "../../services/dosenAPI";

export default function Jadwal() {
  const [selectedMataKuliah, setSelectedMataKuliah] = useState(null);
  const [viewMode, setViewMode] = useState("all"); 
  
  // ── STATE DINAMIS DATABASE ──
  const [dataJadwalReal, setDataJadwalReal] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profilDosen, setProfilDosen] = useState(null);

  const infoHariIni = { namaHari: "Senin", tanggal: "16 Juni 2026" };

  useEffect(() => {
    const muatJadwalDosen = async () => {
      try {
        setIsLoading(true);
        const localSession = localStorage.getItem("siakad_session");
        if (!localSession) return;

        const dataUserLogin = JSON.parse(localSession);
        
        // 1. Ambil NIDN dosen pengampu berdasarkan UUID Auth
        const dosenReal = await dosenAPI.fetchDosenByUserId(dataUserLogin.id);
        if (!dosenReal) return;
        setProfilDosen(dosenReal);

        // 2. Ambil semua jadwal, lalu filter yang nidn_dosen-nya cocok
        const semuaJadwal = await jadwalAPI.fetchJadwal();
        const jadwalSaya = semuaJadwal.filter(j => j.nidn_dosen === dosenReal.nidn);
        setDataJadwalReal(jadwalSaya);
      } catch (error) {
        console.error("Gagal sinkronisasi jadwal dosen:", error);
      } finally {
        setIsLoading(false);
      }
    };
    muatJadwalDosen();
  }, []);

  // Memetakan jadwal ke format kalender mingguan
  const formatJadwalMingguan = () => {
    const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
    const penampung = { Senin: [], Selasa: [], Rabu: [], Kamis: [], Jumat: [] };
    
    dataJadwalReal.forEach(j => {
      if (hariList.includes(j.hari)) {
        penampung[j.hari].push({
          id: j.id,
          nama: j.mata_kuliah,
          kelas: j.kelas,
          ruang: j.ruangan,
          waktu: `${j.jam_mulai?.substring(0, 5)} - ${j.jam_selesai?.substring(0, 5)}`,
          color: "bg-blue-50 border-blue-200 text-blue-900"
        });
      }
    });
    return penampung;
  };

  const jadwalSeminggu = formatJadwalMingguan();

  const isCardVisible = (namaMk) => {
    if (!selectedMataKuliah) return true;
    return namaMk.toLowerCase() === selectedMataKuliah.toLowerCase();
  };

  if (isLoading) {
    return <div className="text-xs font-bold uppercase text-slate-400 p-6">Sinkronisasi Jadwal Mengajar...</div>;
  }

  // Ambil list unik mata kuliah untuk filter legend
  const mataKuliahUnik = [...new Set(dataJadwalReal.map(j => j.mata_kuliah))];

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f4f6f9] min-h-screen font-sans">
      {/* Ringkasan Header */}
      <div className="bg-[#1a3a6b] text-white rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center shadow-md">
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">Dosen Pengampu</p>
          <h4 className="font-bold text-sm truncate">{profilDosen?.nama || "Memuat..."}</h4>
        </div>
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">Total Kelas Diampu</p>
          <h4 className="font-bold text-base md:text-lg">{dataJadwalReal.length} Kelas</h4>
        </div>
        <div>
          <p className="text-xs opacity-70 uppercase tracking-wider">Hari Operasional</p>
          <h4 className="font-bold text-base md:text-lg">{infoHariIni.namaHari}, {infoHariIni.tanggal}</h4>
        </div>
        <div className="flex sm:justify-end gap-2">
          <button
            onClick={() => setViewMode(viewMode === "all" ? "today" : "all")}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-semibold border border-white/20 transition cursor-pointer"
          >
            {viewMode === "all" ? <FiList /> : <FiGrid />}
            {viewMode === "all" ? "Fokus Hari Ini" : "Lihat Semua"}
          </button>
        </div>
      </div>

      {/* Ikhtisar Kelas */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-800 uppercase tracking-wide">
            {viewMode === "today" ? "Jadwal Mengajar Hari Ini" : "Ikhtisar Kelas Diampu"}
          </h2>
          {selectedMataKuliah && (
            <button
              onClick={() => setSelectedMataKuliah(null)}
              className="text-xs font-medium text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FiEyeOff size={12}/> Bersihkan Filter
            </button>
          )}
        </div>
       
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dataJadwalReal
            .filter((mk) => viewMode === "all" || mk.hari === infoHariIni.namaHari)
            .map((mk, index) => {
              const visible = isCardVisible(mk.mata_kuliah);
              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl border p-5 shadow-sm transition-all duration-300 ${
                    visible ? "opacity-100 scale-100 border-gray-200" : "opacity-30 scale-95 border-gray-100"
                  } ${mk.hari === infoHariIni.namaHari ? "ring-2 ring-blue-500/50 border-blue-300" : ""}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">{mk.mata_kuliah}</h3>
                    {mk.hari === infoHariIni.namaHari && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">Hari Ini</span>
                    )}
                  </div>
                  <div className="space-y-2.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2.5">
                      <FiUsers className="text-gray-400" />
                      <span>Kelas {mk.kelas} • {mk.sks} SKS</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <FiClock className="text-gray-400" />
                      <span className="font-medium text-gray-700">{mk.hari}, {mk.jam_mulai?.substring(0, 5)} - {mk.jam_selesai?.substring(0, 5)} WIB</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <FiMapPin className="text-gray-400" />
                      <span>{mk.ruangan}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Timetable Mingguan */}
      {viewMode === "all" && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Jadwal Kalender Mingguan</h2>
            </div>
            <div className="flex items-center gap-2 text-[#1a3a6b] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-semibold">
              <FiCalendar />
              <span>Semester Genap</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-6 gap-3 mb-4 text-center border-b border-gray-100 pb-2">
                <div className="text-left font-semibold text-xs uppercase tracking-wider text-gray-400 self-end px-2">Waktu</div>
                {Object.keys(jadwalSeminggu).map((hari) => (
                  <div key={hari} className={`py-2 rounded-xl text-sm font-bold ${hari === infoHariIni.namaHari ? "bg-[#1a3a6b] text-white shadow-sm" : "bg-gray-50 text-gray-700 border"}`}>{hari}</div>
                ))}
              </div>
              <div className="grid grid-cols-6 gap-3">
                <div className="space-y-12 text-xs font-bold text-gray-400 pt-2 px-2">
                  <div>08:00 WIB</div>
                  <div>10:00 WIB</div>
                  <div>13:00 WIB</div>
                  <div>15:00 WIB</div>
                </div>
                {Object.entries(jadwalSeminggu).map(([hari, listKelas]) => (
                  <div key={hari} className="space-y-3 min-h-[250px] bg-gray-50/50 p-2 rounded-xl border border-dashed border-gray-200">
                    {listKelas.map((kelas, idx) => {
                      const visible = isCardVisible(kelas.nama);
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedMataKuliah(kelas.nama)}
                          className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${kelas.color} ${visible ? "opacity-100 scale-100" : "opacity-20 scale-95"}`}
                        >
                          <p className="font-bold text-xs leading-tight mb-1">{kelas.nama}</p>
                          <div className="text-[11px] opacity-90 space-y-0.5">
                            <p className="font-semibold">Klompok {kelas.kelas} · {kelas.ruang}</p>
                            <p className="text-[10px] font-mono opacity-75">{kelas.waktu}</p>
                          </div>
                        </div>
                      );
                    })}
                    {listKelas.length === 0 && <div className="text-center py-12 text-xs text-gray-300 font-medium">Kosong</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Filter Cepat:</p>
            <div className="flex flex-wrap gap-2">
              {mataKuliahUnik.map((namaMk) => (
                <button
                  key={namaMk}
                  onClick={() => setSelectedMataKuliah(selectedMataKuliah === namaMk ? null : namaMk)}
                  className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${selectedMataKuliah === namaMk ? "bg-gray-900 text-white shadow-sm" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  {namaMk}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}