import React, { useState, useEffect, useMemo } from 'react'; // Tambahkan useMemo
import { nilaiAPI } from '../../services/nilaiAPI';
import { mahasiswaAPI } from '../../services/mahasiswaAPI';
import Loading from '../../components/admin/Loading';

export default function Transkrip() {
  const [dataAkademik, setDataAkademik] = useState({ profil: null, nilai: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const muatData = async () => {
      try {
        setLoading(true);
        const session = JSON.parse(localStorage.getItem("siakad_session"));
        if (!session) return;

        const profil = await mahasiswaAPI.fetchMahasiswaByUserId(session.id);
        const nilaiData = await nilaiAPI.fetchKHSMahasiswa(profil.id_mahasiswa) || []; // Fallback ke array kosong jika null
        
        // Urutkan nilai berdasarkan semester terkecil (S-1, S-2, dst) secara kronologis
        const nilaiTerurut = [...nilaiData].sort((a, b) => {
          const semA = Number(a.jadwal?.semester) || 0;
          const semB = Number(b.jadwal?.semester) || 0;
          return semA - semB;
        });
        
        setDataAkademik({ profil, nilai: nilaiTerurut });
      } catch (err) {
        console.error("Gagal memuat transkrip nilai:", err);
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
    if (g === 'A' || g === 'A+') return 4.0;
    if (g === 'A-') return 3.7;
    if (g === 'B+') return 3.3;
    if (g === 'B') return 3.0;
    if (g === 'B-') return 2.7;
    if (g === 'C+') return 2.3;
    if (g === 'C') return 2.0;
    if (g === 'D') return 1.0;
    return 0.0; // Untuk grade E / F / T
  };

  // ✅ MEMOISASI KAKULASI RINGKASAN AKADEMIK (SKS & IPK)
  const ringkasanTranskrip = useMemo(() => {
    let totalSKS = 0;
    let totalBobotSKS = 0;

    dataAkademik.nilai.forEach(n => {
      const sks = parseInt(n.jadwal?.sks, 10) || 0;
      const bobot = dapatkanBobotDariGrade(n.grade);
      totalBobotSKS += (bobot * sks);
      totalSKS += sks;
    });

    const ipk = totalSKS > 0 ? (totalBobotSKS / totalSKS).toFixed(2) : "0.00";

    return {
      totalSksLulus: totalSKS,
      ipkKumulatif: ipk
    };
  }, [dataAkademik.nilai]);

  // Fungsi utilitas penentu warna lencana grade (Diselaraskan dengan badge DaisyUI)
  const getGradeClass = (grade) => {
    if (!grade) return "badge-outline border-rose-200 bg-rose-50 text-rose-700";
    const g = grade.toUpperCase().trim();
    if (['A', 'A-', 'B+', 'A+'].includes(g))
      return "badge-outline border-emerald-200 bg-emerald-50 text-emerald-700";
    if (['B', 'B-', 'C+'].includes(g))
      return "badge-outline border-amber-200 bg-amber-50 text-amber-700";
    return "badge-outline border-rose-200 bg-rose-50 text-rose-700";
  };

  if (loading) return <div className="p-6 text-xs font-bold uppercase tracking-wider text-slate-400 flex justify-center items-center h-40"><Loading/></div>;

  return (
    <main className="p-6 bg-gray-50/50 min-h-screen font-sans text-xs text-slate-700 w-full flex flex-col gap-6 animate-fadeIn">
      {/* Identitas Ringkas Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2.5">
            <span className="w-1 h-5 bg-[#1a3a6b] rounded-full"></span>
            Transkrip Nilai Akademik
          </h2>
          <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">
            PRODI: <span className="font-bold text-slate-600">{dataAkademik.profil?.program_studi || "-"}</span> • NIM: <span className="font-mono font-bold text-slate-600">{dataAkademik.profil?.id_mahasiswa || "-"}</span>
          </p>
        </div>
      </div>

      {/* Widget Makro Transkrip Grid Card */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "IPK Kumulatif Akhir (Dinamis)", val: ringkasanTranskrip.ipkKumulatif, sub: "Akumulasi Keseluruhan" },
          { label: "Total SKS Diperoleh", val: `${ringkasanTranskrip.totalSksLulus} SKS`, sub: "Kredit Diambil" },
          { 
            label: "Status Mahasiswa", 
            val: dataAkademik.profil?.status || "Aktif", 
            sub: "Status Registrasi",
            isStatus: true 
          }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
            <p className="text-[13px] font-medium text-gray-500 mb-1.5">{stat.label}</p>
            <p className={`text-[32px] font-extrabold tracking-tight leading-none mt-1 ${
              stat.isStatus
                ? (dataAkademik.profil?.status === "Aktif" || !dataAkademik.profil ? "text-emerald-600" : "text-amber-500")
                : (i === 0 ? "text-[#1a3a6b]" : "text-gray-900")
            }`}>
              {stat.val}
            </p>
            <p className="text-[11.5px] text-gray-400 mt-2">{stat.sub}</p>
          </div>
        ))}
      </section>

      {/* Area Tabel Transkrip */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">🎓 Rekapitulasi Historis Seluruh Mata Kuliah</h3>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-transparent border-b border-gray-100">
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center w-28">Semester</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">Mata Kuliah</th>
                  <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center w-32">Kredit SKS</th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center w-28">Huruf Mutu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dataAkademik.nilai.length > 0 ? (
                  dataAkademik.nilai.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-3.5 text-[13px] text-center font-bold text-slate-400 bg-gray-50/30 font-mono">SEMESTER {t.jadwal?.semester || '?'}</td>
                      <td className="px-5 py-3.5 text-[13px] font-bold text-slate-700 uppercase">{t.jadwal?.mata_kuliah}</td>
                      <td className="px-4 py-3.5 text-[13px] text-center font-bold text-slate-600 font-mono">{t.jadwal?.sks || 0} SKS</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`badge px-2.5 py-1 text-[10px] font-black tracking-wide uppercase ${getGradeClass(t.grade)}`}>
                          {t.grade || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-10 text-center text-slate-400 font-medium tracking-wide">
                      Belum ada riwayat komponen transkrip nilai yang terdaftar.
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