import React, { useState, useEffect, useMemo } from "react";
import { FiChevronDown } from "react-icons/fi"; // Ditambahkan untuk menyamakan ikon dengan dashboard dosen
import { mahasiswaAPI } from "../../services/mahasiswaAPI";
import { nilaiAPI } from "../../services/nilaiAPI";
import Loading from "../../components/admin/Loading";

const TH = ({ children, className = "" }) => (
  <th
    className={`text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 border-b border-gray-100 text-left bg-transparent ${className}`}
  >
    {children}
  </th>
);

const TD = ({ children, className = "" }) => (
  <td
    className={`px-4 py-3.5 text-[13px] text-gray-600 border-b border-gray-50 transition-colors ${className}`}
  >
    {children}
  </td>
);

export default function DashboardUtama() {
  const [activeTab, setActiveTab] = useState("khs");
  const [selectedSemester, setSelectedSemester] = useState("Semester 1");
  const [dataAkademik, setDataAkademik] = useState({ profil: null, nilai: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [waktu, setWaktu] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setWaktu(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const muatData = async () => {
      try {
        setIsLoading(true);
        const localSession = localStorage.getItem("siakad_session");
        if (!localSession) return;

        const dataUserLogin = JSON.parse(localSession);
        const profil = await mahasiswaAPI.fetchMahasiswaByUserId(dataUserLogin.id);

        if (profil) {
          const nilaiData = await nilaiAPI.fetchKHSMahasiswa(profil.id_mahasiswa);
          setDataAkademik({ profil, nilai: nilaiData || [] });

          if (nilaiData && nilaiData.length > 0) {
            const listSemester = nilaiData.map((n) => Number(n.jadwal?.semester) || 1);
            const semesterTerbesar = Math.max(...listSemester);
            setSelectedSemester(`Semester ${semesterTerbesar}`);
          }
        }
      } catch (error) {
        console.error("Gagal sinkronisasi data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    muatData();
  }, []);

  const dapatkanBobotDariGrade = (grade) => {
    if (!grade) return 0;
    const g = grade.toUpperCase().trim();
    if (["A", "A+"].includes(g)) return 4.0;
    if (g === "A-") return 3.7;
    if (g === "B+") return 3.3;
    if (g === "B") return 3.0;
    if (g === "B-") return 2.7;
    if (g === "C+") return 2.3;
    if (g === "C") return 2.0;
    if (g === "D") return 1.0;
    return 0.0;
  };

  const semFilter = useMemo(() => {
    return Number(selectedSemester.split(" ")[1]) || 1;
  }, [selectedSemester]);

  const kalkulasiAkademik = useMemo(() => {
    const nilaiSemesterTerpilih = dataAkademik.nilai.filter(
      (n) => Number(n.jadwal?.semester) === semFilter
    );

    let totalBobotSksSem = 0;
    let totalSksSem = 0;
    nilaiSemesterTerpilih.forEach((n) => {
      const sks = parseInt(n.jadwal?.sks, 10) || 0;
      const bobot = dapatkanBobotDariGrade(n.grade);
      totalBobotSksSem += bobot * sks;
      totalSksSem += sks;
    });
    const ips = totalSksSem > 0 ? (totalBobotSksSem / totalSksSem).toFixed(2) : "0.00";

    let totalBobotSksAll = 0;
    let totalSksAll = 0;
    dataAkademik.nilai.forEach((n) => {
      const sks = parseInt(n.jadwal?.sks, 10) || 0;
      const bobot = dapatkanBobotDariGrade(n.grade);
      totalBobotSksAll += bobot * sks;
      totalSksAll += sks;
    });
    const ipk = totalSksAll > 0 ? (totalBobotSksAll / totalSksAll).toFixed(2) : "0.00";

    const listSemesterUnik = Array.from(
      new Set(dataAkademik.nilai.map((n) => Number(n.jadwal?.semester) || 1))
    ).sort((a, b) => a - b);

    const transkripTerurut = [...dataAkademik.nilai].sort(
      (a, b) => (Number(a.jadwal?.semester) || 0) - (Number(b.jadwal?.semester) || 0)
    );

    return {
      ips,
      ipk,
      totalSksSelesai: totalSksAll,
      nilaiSemesterTerpilih,
      transkripTerurut,
      opsiSemester: listSemesterUnik.length > 0 ? listSemesterUnik : [1]
    };
  }, [dataAkademik.nilai, semFilter]);

  const getGradeClass = (grade) => {
    if (!grade) return "badge badge-outline border-rose-200 bg-rose-50 text-rose-700";
    const g = grade.toUpperCase().trim();
    if (["A", "A-", "B+", "A+"].includes(g))
      return "badge badge-outline border-emerald-200 bg-emerald-50 text-emerald-700";
    if (["B", "B-", "C+"].includes(g))
      return "badge badge-outline border-amber-200 bg-amber-50 text-amber-700";
    return "badge badge-outline border-rose-200 bg-rose-50 text-rose-700";
  };

  const handleUnduhPDF = () => {
    alert("Sistem Sedang Memproses: Mengunduh dokumen transkrip nilai resmi format PDF...");
  };

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

  if (isLoading) {
    return (
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 p-6 flex justify-center items-center h-40">
        <Loading />
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-5 bg-gray-50/50 min-h-screen animate-fadeIn font-sans text-xs text-slate-700">
      
      {/* 1. SEKSI HEADER PORTAL */}
      <div
        className="rounded-xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        style={{
          background: "linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)",
        }}
      >
        <div>
          <h1 className="text-xl font-bold m-0 mb-1.5 tracking-tight">
            Portal Informasi Akademik
          </h1>
          <p className="text-[13px] opacity-80 m-0 leading-relaxed">
            Selamat datang di halaman utama. Anda terdata sebagai mahasiswa aktif pada Program Studi{" "}
            <strong className="text-white underline">
              {dataAkademik.profil ? dataAkademik.profil.program_studi : "-"}
            </strong>{" "}
            dengan NIM{" "}
            <strong className="text-white font-mono">
              {dataAkademik.profil ? dataAkademik.profil.id_mahasiswa : "-"}
            </strong>.
          </p>
        </div>
        <div className="text-right flex-shrink-0 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-white/10 self-start sm:self-auto">
          <div className="text-[11px] opacity-75 mb-0.5 font-medium uppercase tracking-wider">
            {hari}
          </div>
          <div className="text-xl font-mono font-bold tracking-wider">
            {jam} WIB
          </div>
        </div>
      </div>

      {/* 2. STATISTIK UTAMA */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "IPK Kumulatif", value: kalkulasiAkademik.ipk, sub: "Akumulasi Keseluruhan" },
          { label: "IP Semester (IPS)", value: kalkulasiAkademik.ips, sub: `Nilai ${selectedSemester}` },
          { label: "SKS Selesai", value: `${kalkulasiAkademik.totalSksSelesai} SKS`, sub: "Total Kredit Lulus" },
          { label: "Status Akademik", value: dataAkademik.profil ? dataAkademik.profil.status : "-", sub: "Status Registrasi", isStatus: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
            <span className="text-[13px] text-gray-500 font-medium block mb-1.5">{stat.label}</span>
            <span className={`text-[32px] font-extrabold tracking-tight block leading-none ${stat.isStatus ? dataAkademik.profil?.status === "Aktif" ? "text-emerald-600" : "text-amber-500" : "text-gray-900"}`}>
              {stat.value}
            </span>
            <span className="text-[11.5px] text-gray-400 block mt-2">{stat.sub}</span>
          </div>
        ))}
      </section>

      {/* 3. TABS NAVIGASI LEMBAR EVALUASI */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-[14px] font-bold text-gray-800">Lembar Hasil Studi & Transkrip Evaluasi</span>
          <div className="join bg-gray-100 p-0.5 rounded-xl border border-gray-200/40 self-start sm:self-auto">
            <button onClick={() => setActiveTab("khs")} className={`btn btn-xs join-item rounded-lg text-[11px] font-bold border-none px-4 py-1.5 h-auto min-h-0 transition-all duration-200 shadow-none ${activeTab === "khs" ? "bg-[#1a3a6b] text-white hover:bg-[#15305b] shadow-sm" : "bg-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-200/50"}`}>KHS Per Semester</button>
            <button onClick={() => setActiveTab("transkrip")} className={`btn btn-xs join-item rounded-lg text-[11px] font-bold border-none px-4 py-1.5 h-auto min-h-0 transition-all duration-200 shadow-none ${activeTab === "transkrip" ? "bg-[#1a3a6b] text-white hover:bg-[#15305b] shadow-sm" : "bg-transparent text-gray-400 hover:text-gray-900 hover:bg-gray-200/50"}`}>Transkrip Nilai</button>
          </div>
        </div>

        {/* 4. RENDER ISI TAB KHS SEMESTER */}
        {activeTab === "khs" && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Rincian Komponen Nilai Berjalan</h4>
              
              {/* DROPDOWN DISAMAKAN PERSIS DENGAN Halaman ABSENSI DOSEN */}
              <div className="dropdown dropdown-bottom dropdown-end">
                <div 
                  tabIndex={0} 
                  role="button" 
                  className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white text-slate-700 font-bold cursor-pointer flex items-center justify-between gap-2 hover:bg-gray-50/50 transition h-9 min-w-[130px] select-none"
                >
                  <span className="truncate">{selectedSemester}</span>
                  <FiChevronDown className="text-gray-400 shrink-0 text-[10px]" />
                </div>
                <ul 
                  tabIndex={0} 
                  className="dropdown-content menu p-1.5 shadow-lg bg-white rounded-lg border border-gray-200/80 w-full max-h-56 overflow-y-auto flex-col flex-nowrap gap-0.5 z-[100] mt-1 text-slate-700 font-sans"
                >
                  {kalkulasiAkademik.opsiSemester.map((sem) => {
                    const valueSem = `Semester ${sem}`;
                    return (
                      <li key={sem} className="w-full">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSemester(valueSem);
                            if (document.activeElement) document.activeElement.blur();
                          }}
                          className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md block text-left w-full truncate transition ${
                            selectedSemester === valueSem ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : "hover:bg-gray-100 text-slate-700"
                          }`}
                        >
                          {valueSem}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

            </div>
            <div className="overflow-x-auto">
              <table className="table w-full border-collapse">
                <thead>
                  <tr>
                    <TH>Kode</TH><TH>Mata Kuliah</TH><TH className="text-center">SKS</TH><TH className="text-center">Grade Akhir</TH>
                  </tr>
                </thead>
                <tbody>
                  {kalkulasiAkademik.nilaiSemesterTerpilih.map((n) => (
                    <tr key={n.id} className="hover:bg-gray-50/70 transition-colors">
                      <TD className="text-[#1a3a6b] font-bold font-mono">{n.jadwal?.kode_mk || "MK"}</TD>
                      <TD className="font-semibold text-slate-700 uppercase">{n.jadwal?.mata_kuliah}</TD>
                      <TD className="text-center font-bold text-slate-600 font-mono">{n.jadwal?.sks || 0} SKS</TD>
                      <TD className="text-center"><span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wide uppercase ${getGradeClass(n.grade)}`}>{n.grade || "E"}</span></TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. RENDER ISI TAB TRANSKRIP NILAI */}
        {activeTab === "transkrip" && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Rekapitulasi Akumulasi Kelulusan</h4>
              <button onClick={handleUnduhPDF} className="btn btn-outline btn-xs border-slate-300 hover:border-[#1a3a6b] hover:bg-[#1a3a6b] text-slate-700 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 h-auto min-h-0">Unduh PDF Transkrip</button>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full border-collapse">
                <thead>
                  <tr>
                    <TH className="text-center w-32">Semester</TH><TH>Mata Kuliah</TH><TH className="text-center w-40">Capaian Grade</TH>
                  </tr>
                </thead>
                <tbody>
                  {kalkulasiAkademik.transkripTerurut.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/70 transition-colors">
                      <TD className="text-center text-gray-400 font-semibold font-mono">SEMESTER {t.jadwal?.semester || "?"}</TD>
                      <TD className="font-semibold text-slate-700 uppercase">{t.jadwal?.mata_kuliah}</TD>
                      <TD className="text-center"><span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-wide uppercase ${getGradeClass(t.grade)}`}>{t.grade || "E"}</span></TD>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}