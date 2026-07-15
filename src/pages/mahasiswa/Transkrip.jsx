import React, { useState, useEffect } from 'react';
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
        const nilaiData = await nilaiAPI.fetchKHSMahasiswa(profil.id_mahasiswa);
        
        // Urutkan nilai berdasarkan semester terkecil (S-1, S-2, dst) secara kronologis
        const nilaiTerurut = [...nilaiData].sort((a, b) => (a.jadwal?.semester || 0) - (b.jadwal?.semester || 0));
        
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

  // Hitung akumulasi akumulatif total SKS lulus dari database
  const totalSksLulus = dataAkademik.nilai.reduce((acc, curr) => acc + (Number(curr.jadwal?.sks) || 0), 0);

  // Perhitungan IPK Kumulatif Secara Dinamis dari Seluruh Nilai yang Ada
  const hitungIPKDinamis = () => {
    let totalBobotSKS = 0;
    let totalSKS = 0;

    dataAkademik.nilai.forEach(n => {
      const sks = Number(n.jadwal?.sks) || 0;
      const bobot = dapatkanBobotDariGrade(n.grade);
      totalBobotSKS += (bobot * sks);
      totalSKS += sks;
    });

    return totalSKS > 0 ? (totalBobotSKS / totalSKS).toFixed(2) : "0.00";
  };

  const ipkKumulatif = hitungIPKDinamis();

  // Penentu warna teks grade huruf mutu
  const getGradeColor = (grade) => {
    if (['A', 'A-', 'B+'].includes(grade)) return 'text-emerald-600 font-black';
    if (['B', 'B-', 'C+'].includes(grade)) return 'text-amber-600 font-black';
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
          <p className="text-xl font-black text-[#1a3a6b] tracking-tight mt-1">{ipkKumulatif}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total SKS Diperoleh</p>
          <p className="text-xl font-black text-slate-900 tracking-tight mt-1">{totalSksLulus} SKS</p>
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
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-400 text-center w-24">Semester</th>
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