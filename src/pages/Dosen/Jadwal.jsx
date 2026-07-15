import React, { useState, useEffect } from "react";
import { FiUsers, FiClock, FiMapPin, FiCalendar, FiGrid, FiList, FiEyeOff } from "react-icons/fi";
import { jadwalAPI } from "../../services/jadwalAPI";
import { dosenAPI } from "../../services/dosenAPI";
import Loading from "../../components/admin/Loading";

const LIST_JAM = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

export default function Jadwal() {
  const [selectedMataKuliah, setSelectedMataKuliah] = useState(null);
  const [viewMode, setViewMode] = useState("all"); 
  // ... sisa kode ke bawah tetap sama

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
        const jadwalSaya = semuaJadwal.filter(
          (j) => j.nidn_dosen === dosenReal.nidn,
        );
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

    dataJadwalReal.forEach((j) => {
      if (hariList.includes(j.hari)) {
        penampung[j.hari].push({
          id: j.id,
          nama: j.mata_kuliah,
          kelas: j.kelas,
          ruang: j.ruangan,
          waktu: `${j.jam_mulai?.substring(0, 5)} - ${j.jam_selesai?.substring(0, 5)}`,
          color: "bg-blue-50 border-blue-200 text-blue-900",
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
    return (
      <div className="text-xs font-bold uppercase text-slate-400 p-6">
        Sinkronisasi Jadwal Mengajar...
      </div>
    );
  }

  // Ambil list unik mata kuliah untuk filter legend
  const mataKuliahUnik = [...new Set(dataJadwalReal.map((j) => j.mata_kuliah))];

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f4f6f9] min-h-screen font-sans text-xs text-slate-700 w-full">
      {/* 1. SEKSI RINGKASAN HEADER (STYLE GRADIENT BIRU) */}
      <div
        className="text-white rounded-xl p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)",
        }}
      >
        <div>
          <p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">
            Dosen Pengampu
          </p>
          <h4 className="font-bold text-xs truncate">
            {profilDosen?.nama || "Memuat..."}
          </h4>
        </div>
        <div>
          <p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">
            Total Kelas Diampu
          </p>
          <h4 className="font-bold text-sm">{dataJadwalReal.length} Kelas</h4>
        </div>
        <div>
          <p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">
            Hari Operasional
          </p>
          <h4 className="font-bold text-sm">
            {infoHariIni.namaHari}, {infoHariIni.tanggal}
          </h4>
        </div>
        <div className="flex sm:justify-end gap-2">
          <button
            onClick={() => setViewMode(viewMode === "all" ? "today" : "all")}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold border border-white/20 transition cursor-pointer"
          >
            {viewMode === "all" ? (
              <FiList className="text-xs" />
            ) : (
              <FiGrid className="text-xs" />
            )}
            {viewMode === "all" ? "Fokus Hari Ini" : "Lihat Semua"}
          </button>
        </div>
      </div>

      {/* 2. IKHTISAR DATA KELAS (CARD VIEW) */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xs font-bold text-slate-950 uppercase tracking-wide">
            {viewMode === "today"
              ? "Jadwal Mengajar Hari Ini"
              : "Ikhtisar Kelas Diampu"}
          </h2>
          {selectedMataKuliah && (
            <button
              onClick={() => setSelectedMataKuliah(null)}
              className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FiEyeOff size={11} /> Bersihkan Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {dataJadwalReal
            .filter(
              (mk) => viewMode === "all" || mk.hari === infoHariIni.namaHari,
            )
            .map((mk, index) => {
              const visible = isCardVisible(mk.mata_kuliah);
              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl border p-5 shadow-sm transition-all duration-300 ${
                    visible
                      ? "opacity-100 scale-100 border-gray-200"
                      : "opacity-30 scale-95 border-gray-100"
                  } ${mk.hari === infoHariIni.namaHari ? "ring-2 ring-[#1a3a6b]/30 border-[#1a3a6b]" : ""}`}
                >
                  <div className="flex justify-between items-start mb-3 gap-2">
                    <h3 className="font-bold text-slate-900 text-xs leading-tight uppercase">
                      {mk.mata_kuliah}
                    </h3>
                    {mk.hari === infoHariIni.namaHari && (
                      <span className="bg-blue-50 border border-blue-200 text-blue-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0">
                        Hari Ini
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <FiUsers className="text-slate-400 text-sm shrink-0" />
                      <span className="font-medium">
                        Kelas {mk.kelas} •{" "}
                        <strong className="text-slate-800">{mk.sks} SKS</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="text-slate-400 text-sm shrink-0" />
                      <span className="font-bold text-slate-800">
                        {mk.hari}, {mk.jam_mulai?.substring(0, 5)} -{" "}
                        {mk.jam_selesai?.substring(0, 5)} WIB
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-slate-400 text-sm shrink-0" />
                      <span className="font-medium text-slate-700">
                        {mk.ruangan}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 3. KALENDER TIMETABLE MINGGUAN */}
      {viewMode === "all" && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <h2 className="text-sm font-bold text-slate-950">Jadwal Kalender Mingguan</h2>
            <div className="flex items-center gap-1.5 text-[#1a3a6b] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
              <FiCalendar className="text-sm" />
              <span>Semester Genap</span>
            </div>
          </div>
          
          <div className="overflow-x-auto rounded-lg border border-gray-100 p-1">
            <div className="min-w-[900px]">
              
              {/* Header Nama Hari */}
              <div className="grid grid-cols-6 gap-3 mb-4 text-center border-b border-gray-100 pb-2">
                <div className="text-left font-bold text-[10px] uppercase tracking-wider text-slate-400 self-end px-2">Waktu</div>
                {Object.keys(jadwalSeminggu).map((hari) => (
                  <div key={hari} className={`py-1.5 rounded-lg text-xs font-bold tracking-wide border uppercase ${hari === infoHariIni.namaHari ? "bg-[#1a3a6b] text-white border-[#1a3a6b] shadow-sm" : "bg-gray-50 text-slate-700 border-gray-200"}`}>{hari}</div>
                ))}
              </div>
              
              {/* Grid Utama (Relasi Jam & Hari) */}
              <div className="grid grid-cols-6 gap-3 relative" style={{ height: "480px" }}>
                
                {/* Kolom Indikator Waktu Samping */}
                <div className="relative h-full text-[10px] font-bold text-slate-400 font-mono pr-2 border-r border-gray-100">
                  {LIST_JAM.map((jam, i) => {
                    const topPos = (i / (LIST_JAM.length - 1)) * 100;
                    return (
                      <div 
                        key={jam} 
                        className="absolute w-full text-left" 
                        style={{ top: `${topPos}%`, transform: "translateY(-50%)" }}
                      >
                        {jam} WIB
                      </div>
                    );
                  })}
                </div>

                {/* Kolom Hari-Hari */}
                {Object.entries(jadwalSeminggu).map(([hari, listKelas]) => (
                  <div 
                    key={hari} 
                    style={{ position: "relative", height: "100%" }} // Mengunci posisi relative & tinggi 100%
                    className="bg-gray-50/30 rounded-xl border border-dashed border-gray-200 overflow-hidden" // Ditambahkan overflow-hidden agar tidak bocor keluar
                  >
                    {/* Background grid lines penunjuk jam */}
                    {LIST_JAM.map((_, i) => {
                      const topPos = (i / (LIST_JAM.length - 1)) * 100;
                      return (
                        <div 
                          key={i} 
                          className="absolute left-0 right-0 border-t border-gray-200/50 pointer-events-none" 
                          style={{ top: `${topPos}%` }} 
                        />
                      );
                    })}

                    {/* Menampilkan list kelas secara absolut berdasarkan persentase waktu */}
                    {listKelas.map((kelas, idx) => {
                      const visible = isCardVisible(kelas.nama);
                      
                      // Dapatkan jam mulai dan selesai
                      const [hMulai, mMulai] = kelas.waktu.split(" - ")[0].split(":").map(Number);
                      const [hSelesai, mSelesai] = kelas.waktu.split(" - ")[1].split(":").map(Number);
                      
                      const desimalMulai = hMulai + (mMulai / 60);
                      const desimalSelesai = hSelesai + (mSelesai / 60);

                      // Kalkulasi posisi top & tinggi (08:00 - 17:00 = 9 jam total operasional)
                      const totalJamOperasional = 9; 
                      const topPercent = ((desimalMulai - 8) / totalJamOperasional) * 100;
                      const heightPercent = ((desimalSelesai - desimalMulai) / totalJamOperasional) * 100;

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedMataKuliah(kelas.nama)}
                          style={{
                            position: "absolute",
                            top: `${topPercent}%`,
                            height: `calc(${heightPercent}% - 4px)`, // Dikurangi sedikit sela agar tidak terlalu rapat menempel garis bawah
                            left: "6px",
                            right: "6px",
                            marginTop: "2px"
                          }}
                          className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all shadow-sm flex flex-col justify-between overflow-hidden ${kelas.color} ${visible ? "opacity-100 scale-100 z-10" : "opacity-20 scale-95 z-0"}`}
                        >
                          <div className="overflow-hidden">
                            <p className="font-bold text-[10px] uppercase border-b border-blue-200/60 pb-0.5 mb-1 leading-tight truncate">{kelas.nama}</p>
                            <div className="text-[9px] space-y-0.5 text-blue-950 font-medium">
                              <p className="truncate">Kel. {kelas.kelas}</p>
                              <p className="truncate font-bold text-blue-800">{kelas.ruang}</p>
                            </div>
                          </div>
                          <p className="text-[9px] font-mono font-bold tracking-wide text-blue-700 mt-0.5 shrink-0 whitespace-nowrap">{kelas.waktu}</p>
                        </div>
                      );
                    })}

                    {listKelas.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-300 font-medium tracking-wide pointer-events-none">
                        Tidak Ada Jadwal
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>
          
          {/* FILTER LEGENDA QUICK CLICK */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2.5">Filter Cepat:</p>
            <div className="flex flex-wrap gap-2">
              {mataKuliahUnik.map((namaMk) => (
                <button
                  key={namaMk}
                  onClick={() => setSelectedMataKuliah(selectedMataKuliah === namaMk ? null : namaMk)}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer shadow-sm uppercase ${selectedMataKuliah === namaMk ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-gray-200 hover:bg-gray-50"}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
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
