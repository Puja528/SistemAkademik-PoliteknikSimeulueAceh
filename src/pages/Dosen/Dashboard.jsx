import React, { useState, useEffect } from "react";
import {
  FiBook,
  FiUsers,
  FiCheckSquare,
  FiBookOpen,
  FiCalendar,
  FiSearch,
} from "react-icons/fi";
import dashboardData from "../../data/Dosen/Dashboard.json";
// PERBAIKAN backend: Impor service dosenAPI yang sudah kamu buat di folder services
import { dosenAPI } from "../../services/dosenAPI"; // <-- Sesuaikan path ke file dosenAPI.js kamu

// ── Sub-components ─────────────────────────────────────────────────
const ProgressBar = ({ persen }) => {
  const colorClass =
    persen >= 80
      ? "bg-green-500"
      : persen >= 60
        ? "bg-amber-400"
        : "bg-red-500";
  return (
    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`}
        style={{ width: `${persen}%` }}
      />
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const isSelesai = status === "selesai";
  const isSebagian = status === "sebagian";
  
  const label = isSelesai ? "Selesai" : isSebagian ? "Sebagian" : "Belum Diisi";
  const bgClass = isSelesai 
    ? "bg-green-50 text-green-700 border-green-200" 
    : isSebagian 
      ? "bg-amber-50 text-amber-700 border-amber-200" 
      : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-md text-[12px] font-semibold border ${bgClass}`}
    >
      {label}
    </span>
  );
};

// ── Tabel Header & Cell ──────────────────────────────────────────────
const TH = ({ children, className = "" }) => (
  <th
    className={`text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2.5 border-b border-gray-100 text-left ${className}`}
  >
    {children}
  </th>
);

const TD = ({ children, className = "" }) => (
  <td
    className={`px-3 py-3.5 text-[13px] text-gray-600 border-b border-gray-50 transition-colors ${className}`}
  >
    {children}
  </td>
);

// ── Dashboard ──────────────────────────────────────────────────────
const Dashboard = () => {
  // State untuk Jam Real-time
  const [waktu, setWaktu] = useState(new Date());
  
  // State untuk Interaktivitas Pencarian Absensi
  const [searchAbsen, setSearchAbsen] = useState("");
  
  // State untuk Filter Status Nilai
  const [filterNilai, setFilterNilai] = useState("semua");

  // ── STATE BACKEND BARU: Menampung data profile dosen asli dari database ──
  const [profilDosen, setProfilDosen] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect untuk memperbarui jam setiap detik
  useEffect(() => {
    const timer = setInterval(() => setWaktu(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ── EFFECT BACKEND BARU: Ambil data user_id dari session login ──
  useEffect(() => {
    const muatProfilDosenDinamis = async () => {
      try {
        setIsLoading(true);
        // A. Ambil siakad_session yang disimpan saat login sukses di App.jsx
        const localSession = localStorage.getItem("siakad_session");
        if (!localSession) return;

        const dataUserLogin = JSON.parse(localSession);
        const loggedInUserId = dataUserLogin.id; // Ini mengambil user_id (UUID) milik user yang login

        // B. Panggil fungsi Axios baru dari dosenAPI untuk mengambil 1 baris data dosen
        const dataDosenReal = await dosenAPI.fetchDosenByUserId(loggedInUserId);
        
        if (dataDosenReal) {
          setProfilDosen(dataDosenReal);
        }
      } catch (error) {
        console.error("Gagal sinkronisasi data dosen ke database:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    muatProfilDosenDinamis();
  }, []);

  const hari = waktu.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const jam = waktu.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Data Fallback (Tetap di-import dari JSON agar tabel data bawahnya tidak error)
  const JADWAL_HARI_INI = dashboardData.jadwalHariIni;
  const STATUS_NILAI = dashboardData.statusNilai;
  const REKAP_ABSENSI = dashboardData.rekapAbsensi;

  // Filter Logika untuk Absensi Mahasiswa
  const filteredAbsensi = REKAP_ABSENSI.filter((item) =>
    item.nama.toLowerCase().includes(searchAbsen.toLowerCase()) ||
    item.nim.includes(searchAbsen)
  );

  // Filter Logika untuk Status Nilai
  const filteredNilai = STATUS_NILAI.filter((item) => {
    if (filterNilai === "semua") return true;
    return item.status === filterNilai;
  });

  // Tampilan jeda memuat data dari REST API Supabase
  if (isLoading) {
    return (
      <div className="p-6 text-xs font-bold uppercase tracking-wider text-gray-400">
        Menghubungkan ke database server...
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-5 bg-gray-50/50 min-h-screen">
      
      {/* Welcome Banner */}
      <div
        className="rounded-xl p-6 text-white flex items-center justify-between gap-4 shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, #1a3a6b 0%, #2e5fa3 60%, #3b7dd8 100%)",
        }}
      >
        <div>
          <h1 className="text-xl font-bold m-0 mb-1.5 tracking-tight">
            {/* PERBAIKAN backend: Sekarang menampilkan nama Rara real dari database */}
            Selamat Datang, {profilDosen ? profilDosen.nama : "Dosen Akademik"}
          </h1>
          <p className="text-[13px] opacity-80 m-0">
            {/* PERBAIKAN backend: Menampilkan NIDN & Prodi real dari database */}
            {profilDosen 
              ? `NIDN: ${profilDosen.nidn} · Program Studi ${profilDosen.program_studi}` 
              : dashboardData.semester.nama
            }
          </p>
        </div>
        <div className="text-right flex-shrink-0 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-white/10">
          <div className="text-[11px] opacity-75 mb-0.5 font-medium uppercase tracking-wider">{hari}</div>
          <div className="text-xl font-mono font-bold tracking-wider">{jam} WIB</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: FiBook,
            label: "Mata Kuliah Diampu",
            value: "4",
            sub: "Semester Genap 2025/2026",
            color: "text-blue-500"
          },
          {
            icon: FiUsers,
            label: "Total Mahasiswa",
            value: "3",
            sub: "Dari 3 kelas aktif",
            color: "text-purple-500"
          },
          {
            icon: FiBookOpen,
            label: "Status Nilai",
            value: "1/3",
            sub: "Selesai diinput",
            color: "text-emerald-500"
          },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200/80 p-5 flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Icon size={16} className={color} />
              <span className="text-[13px] text-gray-500 font-medium">
                {label}
              </span>
            </div>
            <span className="text-[32px] font-extrabold text-gray-900 leading-none">
              {value}
            </span>
            <span className="text-[11.5px] text-gray-400 mt-1">{sub}</span>
          </div>
        ))}
      </div>

      {/* Jadwal + Status Nilai */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Jadwal Mengajar Hari Ini */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FiCalendar size={16} className="text-gray-500" />
            <span className="text-[14px] font-bold text-gray-900">
              Jadwal Mengajar Hari Ini
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Jam", "Mata Kuliah", "Ruang"].map((h) => (
                    <TH key={h}>{h}</TH>
                  ))}
                </tr>
              </thead>
              <tbody>
                {JADWAL_HARI_INI.map((j, i) => (
                  <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                    <TD className="text-gray-900 font-semibold whitespace-nowrap !text-[12.5px]">
                      {j.jam}
                    </TD>
                    <TD>
                      <div className="font-semibold text-gray-900 text-[13px]">
                        {j.matkul}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{j.kelas}</div>
                    </TD>
                    <TD className="text-gray-500 font-medium">{j.ruang}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Pengumpulan Nilai (Interaktif) */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <FiBookOpen size={16} className="text-gray-500" />
              <span className="text-[14px] font-bold text-gray-900">
                Status Pengumpulan Nilai
              </span>
            </div>
            {/* Filter Tab */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg text-[11px] font-medium self-start">
              {["semua", "selesai", "sebagian", "belum"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterNilai(tab)}
                  className={`px-2.5 py-1 rounded-md transition-all uppercase text-[10px] tracking-wider ${
                    filterNilai === tab
                      ? "bg-white text-gray-900 shadow-sm font-bold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab === "belum" ? "Belum" : tab}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <TH>Mata Kuliah</TH>
                  <TH className="text-right">Status</TH>
                </tr>
              </thead>
              <tbody>
                {filteredNilai.length > 0 ? (
                  filteredNilai.map((n, i) => (
                    <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                      <TD className="font-medium text-gray-900">{n.matkul}</TD>
                      <TD className="text-right">
                        <StatusBadge status={n.status} />
                      </TD>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center py-8 text-gray-400 text-xs">
                      Tidak ada data dengan status ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Rekap Absensi (Interaktif dengan Fitur Search) */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FiCheckSquare size={16} className="text-gray-500" />
            <span className="text-[14px] font-bold text-gray-900">
              Rekap Absensi Terakhir - RPL 2
            </span>
          </div>
          
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="text-gray-400" size={14} />
            </span>
            <input
              type="text"
              placeholder="Cari NIM atau Nama..."
              value={searchAbsen}
              onChange={(e) => setSearchAbsen(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["NIM", "Nama Mahasiswa", "Kehadiran", "Persentase"].map((h) => (
                  <TH key={h}>{h}</TH>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAbsensi.length > 0 ? (
                filteredAbsensi.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                    <TD className="text-gray-500 font-mono text-[12px]">{r.nim}</TD>
                    <TD className="font-semibold text-gray-900">{r.nama}</TD>
                    <TD className="text-gray-500">{r.kehadiran}</TD>
                    <TD>
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <ProgressBar persen={r.persen} />
                        <span className="text-[12px] font-mono font-semibold text-gray-600 w-8 text-right flex-shrink-0">
                          {r.persen}%
                        </span>
                      </div>
                    </TD>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400 text-xs">
                    Mahasiswa dengan nama atau NIM "{searchAbsen}" tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;