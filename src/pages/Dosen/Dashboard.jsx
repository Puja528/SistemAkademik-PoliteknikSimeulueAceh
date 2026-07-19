import React, { useState, useEffect, useMemo } from "react";
import {
  FiBook,
  FiUsers,
  FiBookOpen,
  FiCalendar,
  FiSearch,
  FiClock,
  FiCheckCircle,
  FiChevronDown,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { dosenAPI } from "../../services/dosenAPI";
import { jadwalAPI } from "../../services/jadwalAPI";
import Loading from "../../components/admin/Loading.jsx";

const SUPABASE_URL = "https://mwkewvjpgcvlwgycdpvo.supabase.co";
const SUPABASE_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";

const StatusBadge = ({ status }) => {
  const isSelesai = status === "selesai";
  const bgClass = isSelesai
    ? "bg-green-50 text-green-700 border-green-200"
    : "bg-amber-50 text-amber-700 border-amber-200";
  
  return (
    <div className="flex items-center gap-1.5 justify-end">
      {isSelesai ? (
        <FiCheckCircle className="text-emerald-500 text-sm shrink-0" />
      ) : (
        <FiClock className="text-amber-500 text-sm shrink-0" />
      )}
      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border inline-block leading-none ${bgClass}`}>
        {isSelesai ? "Terbit (Akses Mhs Open)" : "Draft (Mhs Hidden)"}
      </span>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [waktu, setWaktu] = useState(new Date());
  const [searchMatkul, setSearchMatkul] = useState("");
  const [filterNilai, setFilterNilai] = useState("semua");
  const [profilDosen, setProfilDosen] = useState(null);
  const [dataDosen, setDataDosen] = useState({
    jadwal: [],
    nilai: [],
    absen: [],
  });
  const [totalMahasiswaAktif, setTotalMahasiswaAktif] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setWaktu(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let didCancel = false;

    const muatData = async () => {
      try {
        setIsLoading(true);
        const localSession = JSON.parse(localStorage.getItem("siakad_session"));
        if (!localSession) return;

        const profil = await dosenAPI.fetchDosenByUserId(localSession.id);
        if (didCancel) return;
        setProfilDosen(profil);

        if (profil) {
          const dataDashboard = await dosenAPI.fetchDashboardData(profil.nidn);
          if (didCancel) return;

          const semuaJadwal = await jadwalAPI.fetchJadwal();
          const jadwalSaya = semuaJadwal.filter((j) => j.nidn_dosen === profil.nidn);
          if (didCancel) return;

          const dataDisesuaikan = {
            nilai: dataDashboard.nilai || [],
            absen: dataDashboard.absen || dataDashboard.disabled || [],
            jadwal: jadwalSaya,
          };

          setDataDosen(dataDisesuaikan);

          const idKelasUnik = [
            ...new Set(
              jadwalSaya
                .map((j) => j.id_kelas)
                .filter((id) => id !== undefined && id !== null)
            ),
          ];

          if (idKelasUnik.length > 0) {
            try {
              const resMhs = await axios.get(
                `${SUPABASE_URL}/rest/v1/mahasiswa`,
                {
                  params: { id_kelas: `in.(${idKelasUnik.join(",")})` },
                  headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                  },
                }
              );
              if (didCancel) return;

              const rosterMhs = resMhs.data || [];
              const idMhsUnik = [
                ...new Set(
                  rosterMhs
                    .map((m) => (m.id_mahasiswa ? String(m.id_mahasiswa) : null))
                    .filter(Boolean)
                ),
              ];
              setTotalMahasiswaAktif(idMhsUnik.length);
            } catch (errMhs) {
              console.error("Gagal memuat roster mahasiswa aktif:", errMhs);
              const fallbackId = (dataDisesuaikan.absen || [])
                .map((a) => (a.id_mahasiswa ? String(a.id_mahasiswa) : null))
                .filter(Boolean);
              setTotalMahasiswaAktif([...new Set(fallbackId)].length);
            }
          } else {
            setTotalMahasiswaAktif(0);
          }
        }
      } catch (error) {
        console.error("Gagal memuat data dashboard:", error);
      } finally {
        if (!didCancel) {
          setIsLoading(false);
        }
      }
    };

    muatData();

    return () => {
      didCancel = true;
    };
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

  const hariIniNormalized = new Date()
    .toLocaleDateString("id-ID", { weekday: "long" })
    .toLowerCase();

  const JADWAL_HARI_INI = useMemo(() => {
    return (dataDosen.jadwal || [])
      .filter((j) => j.hari?.toLowerCase() === hariIniNormalized)
      .map((j) => ({
        jam: `${j.jam_mulai?.substring(0, 5) || "00:00"} - ${j.jam_selesai?.substring(0, 5) || "00:00"}`,
        matkul: j.mata_kuliah,
        kelas: j.kelas,
        ruang: j.ruangan,
      }));
  }, [dataDosen.jadwal, hariIniNormalized]);

  const filteredNilai = useMemo(() => {
    return (dataDosen.nilai || []).filter((item) => {
      const namaMK = item.mata_kuliah ? item.mata_kuliah.toLowerCase() : "";
      const cocokCari = namaMK.includes(searchMatkul.toLowerCase());
      const cocokStatus =
        filterNilai === "semua" ||
        (item.status_nilai === "Terbit" ? "selesai" : "belum") === filterNilai;
      return cocokCari && cocokStatus;
    });
  }, [dataDosen.nilai, searchMatkul, filterNilai]);

  const dapatkanLabelStatus = (val) => {
    if (val === "selesai") return "Terbit";
    if (val === "belum") return "Draft";
    return "Semua Status Nilai";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 p-6 bg-gray-50/50 min-h-screen font-sans justify-center items-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-6 bg-gray-50/50 min-h-screen font-sans relative w-full animate-fadeIn">
      
      {/* 1. KARTU WELCOME GRADIENT */}
      <div
        className="rounded-xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm cursor-pointer hover:opacity-95 transition-opacity duration-150"
        style={{
          background: "linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)",
        }}
        onClick={() => navigate("/dosen/profil")}
      >
        <div>
          <h1 className="text-base font-black m-0 mb-1 tracking-tight uppercase">
            Selamat Datang, {profilDosen?.nama}
          </h1>
          <p className="text-[11px] opacity-85 m-0 font-medium">
            NIDN: {profilDosen?.nidn} · Program Studi {profilDosen?.program_studi}
          </p>
        </div>

        <div className="text-left sm:text-right flex-shrink-0 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 w-full sm:w-auto">
          <div className="text-[9px] opacity-75 mb-0.5 font-bold uppercase tracking-wider">
            {hari}
          </div>
          <div className="text-sm font-mono font-black tracking-wider">
            {jam} WIB
          </div>
        </div>
      </div>

      {/* 2. TIGA KARTU STATISTIK UTAMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: FiBook,
            label: "Mata Kuliah Diampu",
            value: dataDosen.jadwal?.length || 0,
            sub: "Semester Berjalan",
            bgIcon: "bg-blue-50 text-[#1a3a6b]",
          },
          {
            icon: FiUsers,
            label: "Total Mahasiswa",
            value: totalMahasiswaAktif,
            sub: "Kelas Yang Diampu",
            bgIcon: "bg-emerald-50 text-emerald-600",
          },
          {
            icon: FiBookOpen,
            label: "Status Transmisi Nilai",
            value: `${(dataDosen.nilai || []).filter((n) => n.status_nilai === "Terbit").length}/${dataDosen.nilai?.length || 0}`,
            sub: "Terbit / Total MK",
            bgIcon: "bg-purple-50 text-purple-600",
          },
        ].map(({ icon: Icon, label, value, sub, bgIcon }, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex justify-between items-center transition hover:bg-gray-50/30"
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {label}
              </span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {value}
              </h3>
              <span className="text-[10px] text-gray-400 font-medium block">
                {sub}
              </span>
            </div>
            <div className={`p-2.5 rounded-lg ${bgIcon} shrink-0`}>
              <Icon className="text-base" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. FILTER BAR (Menggunakan Dropdown DaisyUI yang disamakan) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Cari mata kuliah nilai..."
            value={searchMatkul}
            onChange={(e) => setSearchMatkul(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs bg-gray-50 focus:outline-none focus:border-slate-400 transition text-slate-700"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          {/* DROPDOWN FILTER STATUS NILAI DAISYUI */}
          <div className="dropdown dropdown-bottom dropdown-end w-full sm:w-auto">
            <div 
              tabIndex={0} 
              role="button" 
              className="w-full sm:w-44 border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 font-medium cursor-pointer flex items-center justify-between gap-2 hover:bg-gray-50/50 transition select-none"
            >
              <span className="truncate">{dapatkanLabelStatus(filterNilai)}</span>
              <FiChevronDown className="text-gray-400 shrink-0 text-[10px]" />
            </div>
            <ul 
              tabIndex={0} 
              className="dropdown-content menu p-1.5 shadow-lg bg-white rounded-lg border border-gray-200/80 w-full sm:w-44 gap-0.5 z-[100] mt-1 text-slate-700 font-sans"
            >
              {[
                { value: "semua", label: "Semua Status Nilai" },
                { value: "selesai", label: "Terbit" },
                { value: "belum", label: "Draft" }
              ].map((status) => (
                <li key={status.value}>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterNilai(status.value);
                      if (document.activeElement) document.activeElement.blur();
                    }}
                    className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md block text-left w-full transition ${
                      filterNilai === status.value ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : "hover:bg-gray-100 text-slate-700"
                    }`}
                  >
                    {status.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. GRID DUA KOLOM: TABEL JADWAL & TABEL STATUS NILAI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* KOLOM KIRI: JADWAL HARI INI */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-3.5 border-b border-gray-100 pb-2">
            <FiCalendar className="text-[#1a3a6b] text-xs" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Jadwal Mengajar Hari Ini
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400">
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-3 py-2 text-left">Jam</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-3 py-2 text-left">Mata Kuliah & Kelas</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-3 py-2 text-left">Ruang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {JADWAL_HARI_INI.length > 0 ? (
                  JADWAL_HARI_INI.map((j, i) => (
                    <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-3 py-2.5 text-[11px] text-slate-900 font-bold font-mono whitespace-nowrap">
                        {j.jam}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="text-[12px] font-bold text-slate-800 uppercase leading-tight">{j.matkul}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 font-bold">
                          <span className="px-1.5 py-0.5 bg-gray-150 rounded border border-gray-200">Kelas {j.kelas}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[12px] text-slate-600 font-semibold">
                        {j.ruang}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-gray-400 text-xs font-medium">
                      Tidak ada jadwal mengajar untuk hari ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* KOLOM KANAN: STATUS INPUT NILAI */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-3.5 border-b border-gray-100 pb-2">
            <FiBookOpen className="text-[#1a3a6b] text-xs" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Status Transmisi Nilai Kuliah
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400">
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-3 py-2 text-left">Mata Kuliah</th>
                  <th className="text-[11px] font-semibold uppercase tracking-wider px-3 py-2 text-right">Status Transmisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredNilai.length > 0 ? (
                  filteredNilai.map((n, i) => (
                    <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="text-[12px] font-bold text-slate-800 uppercase leading-tight">{n.mata_kuliah}</div>
                        {n.kelas && (
                          <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
                            Kelas Paket: <span className="font-bold text-slate-600">{n.kelas}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right vertical-middle">
                        <StatusBadge status={n.status_nilai === "Terbit" ? "selesai" : "belum"} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center py-8 text-gray-400 text-xs font-medium">
                      Data rekapitulasi nilai kosong atau tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;