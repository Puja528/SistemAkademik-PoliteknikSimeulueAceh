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
        const nilaiData = await nilaiAPI.fetchKHSMahasiswa(profil.id_mahasiswa) || []; // Fallback ke array kosong jika null[cite: 9]
        
        // Urutkan nilai berdasarkan semester terkecil (S-1, S-2, dst) secara kronologis[cite: 9]
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

  // Penentu warna teks grade huruf mutu[cite: 9]
  const getGradeColor = (grade) => {
    if (!grade) return 'text-rose-600 font-black';
    const g = grade.toUpperCase().trim();
    if (['A', 'A-', 'B+', 'A+'].includes(g)) return 'text-emerald-600 font-black';
    if (['B', 'B-', 'C+'].includes(g)) return 'text-amber-600 font-black';
    return 'text-rose-600 font-black';
  };

  if (loading) return <div className="p-6 text-xs font-bold uppercase tracking-wider text-slate-400"><Loading/></div>;

  return (
    <main className="p-6 bg-[#f4f6f9] min-h-screen font-sans text-xs text-slate-700 w-full flex flex-col gap-6">
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
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IPK Kumulatif Akhir (Dinamis)</p>
          <p className="text-xl font-black text-[#1a3a6b] tracking-tight mt-1">{ringkasanTranskrip.ipkKumulatif}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total SKS Diperoleh</p>
          <p className="text-xl font-black text-slate-900 tracking-tight mt-1">{ringkasanTranskrip.totalSksLulus} SKS</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Mahasiswa</p>
          <p className="text-xl font-black text-emerald-600 tracking-tight mt-1 uppercase">{dataAkademik.profil?.status || "Aktif"}</p>
        </div>
      </section>

      {/* Area Tabel Transkrip */}
      <div className="space-y-3">
        <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">🎓 Rekapitulasi Historis Seluruh Mata Kuliah</h3>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center w-28">Semester</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Mata Kuliah</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center w-32">Kredit SKS</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center w-28">Huruf Mutu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataAkademik.nilai.length > 0 ? (
                  dataAkademik.nilai.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-center font-bold text-slate-400 bg-slate-50/40 font-mono">SEMESTER {t.jadwal?.semester || '?'}</td>
                      <td className="px-5 py-3.5 text-xs font-bold text-slate-900 uppercase">{t.jadwal?.mata_kuliah}</td>
                      <td className="px-4 py-3.5 text-xs text-center font-bold text-slate-700 font-mono">{t.jadwal?.sks || 0} SKS</td>
                      <td className={`px-5 py-3.5 text-center text-xs uppercase tracking-wide ${getGradeColor(t.grade)}`}>
                        {t.grade || 'N/A'}
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