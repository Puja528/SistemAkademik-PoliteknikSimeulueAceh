import React, { useState, useEffect, useMemo } from "react";
import { FiChevronDown } from "react-icons/fi"; // Ditambahkan untuk menyamakan ikon dengan dashboard dosen
import { nilaiAPI } from "../../services/nilaiAPI";
import { mahasiswaAPI } from "../../services/mahasiswaAPI";
import Loading from "../../components/admin/Loading";

export default function KHS() {
  const [selectedSemester, setSelectedSemester] = useState("Semester 1");
  const [dataAkademik, setDataAkademik] = useState({ profil: null, nilai: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const muatData = async () => {
      try {
        setLoading(true);
        const session = JSON.parse(localStorage.getItem("siakad_session"));
        if (!session) return;

        const profil = await mahasiswaAPI.fetchMahasiswaByUserId(session.id);
        const nilaiData = await nilaiAPI.fetchKHSMahasiswa(profil.id_mahasiswa);

        // 1. Simpan data akademik terlebih dahulu
        setDataAkademik({ profil, nilai: nilaiData || [] });

        // 2. Cari semester terbaru yang memiliki data nilai
        if (nilaiData && nilaiData.length > 0) {
          const listSemester = nilaiData.map(
            (n) => Number(n.jadwal?.semester) || 1,
          );
          const semesterTerbesar = Math.max(...listSemester);

          // 3. Update state selectedSemester ke semester terbaru
          setSelectedSemester(`Semester ${semesterTerbesar}`);
        }
      } catch (err) {
        console.error("Gagal memuat data KHS:", err);
      } finally {
        setLoading(false);
      }
    };
    muatData();
  }, []);

  // --- 🛠️ FUNGSI UNTUK MENGONVERSI GRADE KE BOBOT AKADEMIK ---
  const dapatkanBobotDariGrade = (grade) => {
    if (!grade) return 0;
    const g = grade.toUpperCase().trim();
    if (g === "A" || g === "A+") return 4.0;
    if (g === "A-") return 3.7;
    if (g === "B+") return 3.3;
    if (g === "B") return 3.0;
    if (g === "B-") return 2.7;
    if (g === "C+") return 2.3;
    if (g === "C") return 2.0;
    if (g === "D") return 1.0;
    return 0.0; // Untuk grade E / F / T
  };

  // Parsing index semester pilihan (contoh: "Semester 3" -> 3)
  const semIndex = useMemo(() => {
    return Number(selectedSemester.split(" ")[1]) || 1;
  }, [selectedSemester]);

  // Filter nilai semester terpilih (Dioptimalkan dengan useMemo)
  const nilaiFilter = useMemo(() => {
    return dataAkademik.nilai.filter(
      (n) => Number(n.jadwal?.semester) === semIndex,
    );
  }, [dataAkademik.nilai, semIndex]);

  // Perhitungan total SKS semester terpilih & Kalkulasi IPS/IPK (Dioptimalkan dengan useMemo)
  const ringkasanAkademik = useMemo(() => {
    // A. Hitung SKS Semester ini
    const totalSksSem = nilaiFilter.reduce(
      (acc, curr) => acc + (parseInt(curr.jadwal?.sks, 10) || 0),
      0,
    );

    // B. Hitung IPS
    let totalBobotSksSem = 0;
    let totalSksSemKalkulasi = 0;
    nilaiFilter.forEach((n) => {
      const sks = parseInt(n.jadwal?.sks, 10) || 0;
      const bobot = dapatkanBobotDariGrade(n.grade);
      totalBobotSksSem += bobot * sks;
      totalSksSemKalkulasi += sks;
    });
    const ips = totalSksSemKalkulasi > 0 ? (totalBobotSksSem / totalSksSemKalkulasi).toFixed(2) : "0.00";

    // C. Hitung IPK Kumulatif (Seluruh Semester)
    let totalBobotSksAll = 0;
    let totalSksAll = 0;
    dataAkademik.nilai.forEach((n) => {
      const sks = parseInt(n.jadwal?.sks, 10) || 0;
      const bobot = dapatkanBobotDariGrade(n.grade);
      totalBobotSksAll += bobot * sks;
      totalSksAll += sks;
    });
    const ipk = totalSksAll > 0 ? (totalBobotSksAll / totalSksAll).toFixed(2) : "0.00";

    // D. Dapatkan daftar seluruh semester yang unik berdasarkan data riwayat nilai
    const listSemesterUnik = Array.from(
      new Set(dataAkademik.nilai.map((n) => Number(n.jadwal?.semester) || 1))
    ).sort((a, b) => a - b);

    return { 
      totalSksSem, 
      ips, 
      ipk,
      opsiSemester: listSemesterUnik.length > 0 ? listSemesterUnik : [1, 2, 3, 4, 5, 6, 7, 8]
    };
  }, [nilaiFilter, dataAkademik.nilai]);

  // Fungsi utilitas penentu warna lencana grade (Diselaraskan menggunakan badge DaisyUI)
  const getGradeClass = (grade) => {
    if (!grade) return "badge-outline border-rose-200 bg-rose-50 text-rose-700";
    const g = grade.toUpperCase().trim();
    if (["A", "A-", "B+", "A+"].includes(g))
      return "badge-outline border-emerald-200 bg-emerald-50 text-emerald-700";
    if (["B", "B-", "C+"].includes(g))
      return "badge-outline border-amber-200 bg-amber-50 text-amber-700";
    return "badge-outline border-rose-200 bg-rose-50 text-rose-700";
  };

  if (loading)
    return (
      <div className="p-6 text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-center items-center h-40">
        <Loading />
      </div>
    );

  return (
    <main className="p-6 bg-gray-50/50 min-h-screen font-sans text-xs text-slate-700 w-full flex flex-col gap-6 animate-fadeIn">
      {/* Identitas Ringkas Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2.5">
            <span className="w-1 h-5 bg-[#1a3a6b] rounded-full"></span>
            Kartu Hasil Studi (KHS)
          </h2>
          <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">
            PRODI:{" "}
            <span className="font-bold text-slate-600">
              {dataAkademik.profil?.program_studi || "-"}
            </span>{" "}
            • NIM:{" "}
            <span className="font-mono font-bold text-slate-600">
              {dataAkademik.profil?.id_mahasiswa || "-"}
            </span>
          </p>
        </div>
      </div>

      {/* Widget Indikator Ringkas Dashboard Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "IPK Kumulatif (Dinamis)", val: ringkasanAkademik.ipk, sub: "Akumulasi Keseluruhan" },
          { label: "IP Semester (IPS)", val: ringkasanAkademik.ips, sub: `Nilai ${selectedSemester}` },
          { label: "Beban SKS Semester Ini", val: `${ringkasanAkademik.totalSksSem} SKS`, sub: "Kredit Diambil" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
            <p className="text-[13px] font-medium text-gray-500 mb-1.5">{stat.label}</p>
            <p className="text-[32px] font-extrabold text-gray-900 tracking-tight leading-none mt-1">
              {i < 2 ? (
                <span className="text-[#1a3a6b]">{stat.val}</span>
              ) : (
                stat.val
              )}
            </p>
            <p className="text-[11.5px] text-gray-400 mt-2">{stat.sub}</p>
          </div>
        ))}
      </section>

      {/* Area Tabel KHS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">
            Rincian Perolehan Nilai {selectedSemester}
          </h3>

          {/* DROPDOWN DISAMAKAN PERSIS DENGAN DASBOARD DOSEN */}
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
              {ringkasanAkademik.opsiSemester.map((sem) => {
                const valueSem = `Semester ${sem}`;
                const isActive = selectedSemester === valueSem;
                return (
                  <li key={sem} className="w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSemester(valueSem);
                        if (document.activeElement) document.activeElement.blur();
                      }}
                      className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md block text-left w-full truncate transition ${
                        isActive 
                          ? "bg-blue-50 text-blue-700 hover:bg-blue-50" 
                          : "hover:bg-gray-100 text-slate-700"
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

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-transparent border-b border-gray-100">
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Mata Kuliah
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center w-20">
                    SKS
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center w-20">
                    Tugas
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center w-20">
                    UTS
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center w-20">
                    UAS
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center w-24">
                    Nilai Akhir
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center w-24">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {nilaiFilter.length > 0 ? (
                  nilaiFilter.map((n) => (
                    <tr
                      key={n.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-[13px] font-bold text-slate-700 uppercase">
                        {n.jadwal?.mata_kuliah}
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-center font-bold text-slate-600 font-mono">
                        {n.jadwal?.sks || 0} SKS
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-center font-bold text-slate-500 font-mono">
                        {n.nilai_tugas}
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-center font-bold text-slate-500 font-mono">
                        {n.nilai_uts}
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-center font-bold text-slate-500 font-mono">
                        {n.nilai_uas}
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-center font-black text-[#1a3a6b] font-mono">
                        {n.nilai_akhir}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`badge px-2.5 py-1 text-[10px] font-black tracking-wide uppercase ${getGradeClass(n.grade)}`}
                        >
                          {n.grade || "E"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-10 text-center text-slate-400 font-medium tracking-wide"
                    >
                      Belum ada komponen nilai akademik yang dipublikasikan untuk semester ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}