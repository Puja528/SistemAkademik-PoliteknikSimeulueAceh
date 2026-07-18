import React, { useState, useEffect, useMemo } from "react";
import {
  FiBook,
  FiUsers,
  FiCheckSquare,
  FiBookOpen,
  FiCalendar,
  FiSearch,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { dosenAPI } from "../../services/dosenAPI";
import { jadwalAPI } from "../../services/jadwalAPI"; // 1. TAMBAHKAN IMPORT JADWAL API AGAR SINKRON
import Loading from "../../components/admin/Loading.jsx";

// Sama seperti pada Absensi.jsx: konfigurasi koneksi Supabase untuk query roster mahasiswa resmi
const SUPABASE_URL = "https://mwkewvjpgcvlwgycdpvo.supabase.co";
const SUPABASE_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";

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
      className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold border ${bgClass}`}
    >
      {label}
    </span>
  );
};

const TH = ({ children, className = "" }) => (
  <th
    className={`text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3 border-b border-gray-200 text-left ${className}`}
  >
    {children}
  </th>
);

const TD = ({ children, className = "" }) => (
  <td
    className={`px-3 py-3 text-xs text-slate-600 border-b border-gray-100 transition-colors ${className}`}
  >
    {children}
  </td>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [waktu, setWaktu] = useState(new Date());
  const [searchAbsen, setSearchAbsen] = useState("");
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

        // 1. Ambil data profil dosen berdasarkan user ID session
        const profil = await dosenAPI.fetchDosenByUserId(localSession.id);
        if (didCancel) return;
        setProfilDosen(profil);

        if (profil) {
          // 2. Ambil data dashboard dasar (nilai & absen)
          const dataDashboard = await dosenAPI.fetchDashboardData(profil.nidn);
          if (didCancel) return;

          // 3. PERBAIKAN UTAMA: Ambil data master jadwal resmi dan saring lewat NIDN agar pasti sinkron
          const semuaJadwal = await jadwalAPI.fetchJadwal();
          const jadwalSaya = semuaJadwal.filter(
            (j) => j.nidn_dosen === profil.nidn,
          );
          if (didCancel) return;

          // 4. Susun ulang data secara komprehensif ke state
          const dataDisesuaikan = {
            nilai: dataDashboard.nilai || [],
            absen: dataDashboard.absen || dataDashboard.disabled || [],
            jadwal: jadwalSaya, // Memastikan array jadwal terisi dari master data jadwal
          };

          setDataDosen(dataDisesuaikan);

          // 5. PERBAIKAN TOTAL MAHASISWA: hitung dari roster resmi per kelas (id_kelas),
          // bukan dari dedup log absensi historis. Log absensi bisa berisi sisa data
          // mahasiswa yang sudah pindah/keluar kelas, sehingga totalnya bisa lebih
          // besar dari jumlah mahasiswa yang sebenarnya terdaftar aktif.
          const idKelasUnik = [
            ...new Set(
              jadwalSaya
                .map((j) => j.id_kelas)
                .filter((id) => id !== undefined && id !== null),
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
                },
              );
              if (didCancel) return;

              const rosterMhs = resMhs.data || [];
              const idMhsUnik = [
                ...new Set(
                  rosterMhs
                    .map((m) => (m.id_mahasiswa ? String(m.id_mahasiswa) : null))
                    .filter(Boolean),
                ),
              ];
              setTotalMahasiswaAktif(idMhsUnik.length);
            } catch (errMhs) {
              console.error("Gagal memuat roster mahasiswa aktif:", errMhs);
              // Fallback: tetap pakai dedup dari log absensi kalau query roster gagal
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

  const rekapAbsensiPerMahasiswa = useMemo(() => {
    const map = {};

    for (const a of dataDosen.absen || []) {
      const id = a.id_mahasiswa;
      if (!map[id]) {
        map[id] = {
          nim: id,
          nama: a.mahasiswa?.nama || String(id),
          total: 0,
          hadir: 0,
        };
      }
      map[id].total += 1;
      if (a.status_kehadiran === "Hadir") map[id].hadir += 1;
    }
    return Object.values(map).map((m) => ({
      ...m,
      persen: m.total > 0 ? Math.round((m.hadir / m.total) * 100) : 0,
      kehadiran: `${m.hadir}/${m.total} pertemuan`,
    }));
  }, [dataDosen.absen]);

  const filteredAbsensi = useMemo(() => {
    return rekapAbsensiPerMahasiswa.filter(
      (item) =>
        item.nama.toLowerCase().includes(searchAbsen.toLowerCase()) ||
        String(item.nim).includes(searchAbsen),
    );
  }, [rekapAbsensiPerMahasiswa, searchAbsen]);

  const filteredNilai = useMemo(() => {
    return (dataDosen.nilai || []).filter(
      (item) =>
        filterNilai === "semua" ||
        (item.status_nilai === "Terbit" ? "selesai" : "belum") === filterNilai,
    );
  }, [dataDosen.nilai, filterNilai]);

  if (isLoading)
    return (
      <div className="p-6 text-xs font-bold uppercase tracking-wider text-gray-400">
        <Loading />
      </div>
    );

  return (
    <div className="p-6 flex flex-col gap-6 bg-[#f4f6f9] min-h-screen font-sans text-xs text-slate-700 w-full">
      {/* KARTU WELCOME GRADIENT */}
      <div
        className="rounded-xl p-5 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)",
        }}
      >
        <div
          onClick={() => navigate("/dosen/profil")}
          className="cursor-pointer hover:opacity-90 transition-opacity"
        >
          <h1 className="text-lg font-black m-0 mb-1 tracking-tight">
            Selamat Datang, {profilDosen?.nama}
          </h1>
          <p className="text-xs opacity-85 m-0 font-medium">
            NIDN: {profilDosen?.nidn} · Program Studi{" "}
            {profilDosen?.program_studi}
          </p>
        </div>

        <div className="text-left sm:text-right flex-shrink-0 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 w-full sm:w-auto">
          <div className="text-[10px] opacity-75 mb-0.5 font-bold uppercase tracking-wider">
            {hari}
          </div>
          <div className="text-lg font-mono font-black tracking-wider">
            {jam} WIB
          </div>
        </div>
      </div>

      {/* TIGA KARTU STATISTIK UTAMA */}
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
            // Dihitung dari roster resmi per id_kelas (lihat useEffect di atas),
            // sehingga selalu sinkron dengan jumlah yang didaftarkan admin —
            // tidak lagi terpengaruh sisa data di log absensi historis.
            value: totalMahasiswaAktif,
            sub: "Kelas Yang Diampu",
            bgIcon: "bg-emerald-50 text-emerald-600",
          },
          {
            icon: FiBookOpen,
            label: "Status Nilai",
            value: `${(dataDosen.nilai || []).filter((n) => n.status_nilai === "Terbit").length}/${dataDosen.nilai?.length || 0}`,
            sub: "Selesai diinput",
            bgIcon: "bg-purple-50 text-purple-600",
          },
        ].map(({ icon: Icon, label, value, sub, bgIcon }, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex justify-between items-center"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {label}
              </span>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                {value}
              </h3>
              <span className="text-[11px] text-gray-400 font-medium block">
                {sub}
              </span>
            </div>
            <div className={`p-3.5 rounded-xl ${bgIcon}`}>
              <Icon className="text-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* GRID DUA KOLOM: JADWAL & STATUS NILAI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* KOTAK JADWAL MENGAJAR HARI INI */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <FiCalendar className="text-[#1a3a6b] text-sm" />
            <span className="text-sm font-bold text-slate-950">
              Jadwal Mengajar Hari Ini
            </span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Jam", "Mata Kuliah", "Ruang"].map((h) => (
                    <TH key={h}>{h}</TH>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {JADWAL_HARI_INI.length > 0 ? (
                  JADWAL_HARI_INI.map((j, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-3 py-3 text-xs text-slate-900 font-bold font-mono whitespace-nowrap">
                        {j.jam}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <div className="font-bold text-slate-800 uppercase">
                          {j.matkul}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Kelas {j.kelas}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-700 font-semibold">
                        {j.ruang}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center py-8 text-gray-400 font-medium"
                    >
                      Tidak ada jadwal mengajar untuk hari ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* KOTAK STATUS INPUT NILAI */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <FiBookOpen className="text-[#1a3a6b] text-sm" />
            <span className="text-sm font-bold text-slate-950">
              Status Nilai Mata Kuliah
            </span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <TH>Mata Kuliah & Kelas</TH>
                  <TH className="text-right">Status</TH>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredNilai.length > 0 ? (
                  filteredNilai.map((n, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-3 py-3 text-xs">
                        <div className="font-bold text-slate-800 uppercase">
                          {n.mata_kuliah}
                        </div>
                        {n.kelas && (
                          <div className="text-[11px] text-slate-400 font-medium">
                            Kelas {n.kelas}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <StatusBadge
                          status={
                            n.status_nilai === "Terbit" ? "selesai" : "belum"
                          }
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="2"
                      className="text-center py-8 text-gray-400 font-medium"
                    >
                      Data rekapitulasi nilai kosong.
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
