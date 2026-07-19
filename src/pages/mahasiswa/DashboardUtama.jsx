import React, { useState, useEffect } from 'react';
import { mahasiswaAPI } from '../../services/mahasiswaAPI';
import { nilaiAPI } from '../../services/nilaiAPI';
import Loading from '../../components/admin/Loading';

const TH = ({ children, className = "" }) => (
  <th className={`text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5 border-b border-gray-100 text-left ${className}`}>{children}</th>
);

const TD = ({ children, className = "" }) => (
  <td className={`px-4 py-3.5 text-[13px] text-gray-600 border-b border-gray-50 transition-colors ${className}`}>{children}</td>
);

export default function DashboardUtama() {
  const [activeTab, setActiveTab] = useState('khs');
  const [selectedSemester, setSelectedSemester] = useState('Semester 1');
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
          
          // === PERBAIKAN 1: Filter Duplikasi Data berdasarkan id_jadwal terbaru ===
          const nilaiTerfilter = [];
          const checkedJadwalIds = new Set();

          if (nilaiData && Array.isArray(nilaiData)) {
            [...nilaiData].reverse().forEach((item) => {
              if (item.id_jadwal && !checkedJadwalIds.has(item.id_jadwal)) {
                checkedJadwalIds.add(item.id_jadwal);
                nilaiTerfilter.push(item);
              }
            });
            nilaiTerfilter.reverse();
          }

          setDataAkademik({ profil, nilai: nilaiTerfilter });
        }
      } catch (error) {
        console.error("Gagal sinkronisasi data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    muatData();
  }, []);

  // === PERBAIKAN 2: Fungsi Bantu Hitung Bobot Mutu (Skala 4.00) ===
  const hitungBobotGrade = (grade) => {
    if (!grade) return 0;
    const g = grade.toUpperCase().trim();
    if (g === 'A') return 4.0;
    if (g === 'A-') return 3.7;
    if (g === 'B+') return 3.3;
    if (g === 'B') return 3.0;
    if (g === 'B-') return 2.7;
    if (g === 'C+') return 2.3;
    if (g === 'C') return 2.0;
    if (g === 'D') return 1.0;
    return 0.0;
  };

  const semFilter = selectedSemester.split(' ')[1];
  const khsPerSemester = dataAkademik.nilai.filter(n => n.jadwal?.semester == semFilter);

  // === PERBAIKAN 3: Hitung IPS secara Akurat berbasis Bobot Huruf Mutu & SKS ===
  const totalSksSem = khsPerSemester.reduce((acc, curr) => acc + (curr.jadwal?.sks || 0), 0);
  const totalBobotSem = khsPerSemester.reduce((acc, curr) => acc + (hitungBobotGrade(curr.grade) * (curr.jadwal?.sks || 0)), 0);
  const ipsDinamis = totalSksSem > 0 ? (totalBobotSem / totalSksSem).toFixed(2) : "0.00";
  
  // === PERBAIKAN 4: Hitung IPK & SKS Total secara Akurat (Kumulatif Seluruh Semester) ===
  const totalSksLulus = dataAkademik.nilai.reduce((acc, curr) => acc + (curr.jadwal?.sks || 0), 0);
  const totalBobotKumu = dataAkademik.nilai.reduce((acc, curr) => acc + (hitungBobotGrade(curr.grade) * (curr.jadwal?.sks || 0)), 0);
  const ipkOtomatis = totalSksLulus > 0 ? (totalBobotKumu / totalSksLulus).toFixed(2) : "0.00";

  // Ambil data nilai yang diurutkan secara kronologis untuk tab transkrip
  const transkripSemua = [...dataAkademik.nilai].sort((a, b) => (a.jadwal?.semester || 0) - (b.jadwal?.semester || 0));

  const handleUnduhPDF = () => {
    alert('Sistem Sedang Memproses: Mengunduh dokumen transkrip nilai resmi format PDF...');
  };

  const hari = waktu.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const jam = waktu.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  // Fungsi utilitas warna untuk tag grade ringkas
  const getGradeClass = (grade) => {
    if (['A', 'A-', 'B+'].includes(grade)) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (['B', 'B-', 'C+'].includes(grade)) return 'border-amber-200 bg-amber-50 text-amber-700';
    return 'border-rose-200 bg-rose-50 text-rose-700';
  };

  if (isLoading) {
    return <div className="text-xs font-bold uppercase tracking-wider text-slate-400 p-6"><Loading/></div>;
  }

  return (
    <div className="p-6 flex flex-col gap-5 bg-gray-50/50 min-h-screen animate-fadeIn font-sans">
      
      {/* 1. SEKSI HEADER PORTAL */}
      <div className="rounded-xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm" style={{ background: "linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)" }}>
        <div>
          <h1 className="text-xl font-bold m-0 mb-1.5 tracking-tight">Portal Informasi Akademik</h1>
          <p className="text-[13px] opacity-80 m-0 leading-relaxed">
            Selamat datang di halaman utama. Anda terdata sebagai mahasiswa aktif pada Program Studi <strong className="text-white underline">{dataAkademik.profil ? dataAkademik.profil.program_studi : "-"}</strong> dengan NIM <strong className="text-white font-mono">{dataAkademik.profil ? dataAkademik.profil.id_mahasiswa : "-"}</strong>.
          </p>
        </div>
        <div className="text-right flex-shrink-0 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-white/10 self-start sm:self-auto">
          <div className="text-[11px] opacity-75 mb-0.5 font-medium uppercase tracking-wider">{hari}</div>
          <div className="text-xl font-mono font-bold tracking-wider">{jam} WIB</div>
        </div>
      </div>

      {/* 2. STATISTIK UTAMA (GRID CARD BAR) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: "IPK Kumulatif", 
            value: dataAkademik.profil?.ipk && dataAkademik.profil?.ipk !== "0.00" ? Number(dataAkademik.profil.ipk).toFixed(2) : ipkOtomatis, 
            sub: "Kalkulasi Otomatis Transkrip" 
          },
          { 
            label: "IP Semester (IPS)", 
            value: activeTab === 'khs' ? ipsDinamis : 'N/A', 
            sub: `Nilai Terpilih: ${selectedSemester}` 
          },
          { 
            label: "SKS Selesai", 
            value: `${totalSksLulus} SKS`, 
            sub: "Total Kredit Lulus Bersih" 
          },
          { 
            label: "Status Akademik", 
            value: dataAkademik.profil ? dataAkademik.profil.status : "-", 
            sub: "Status Registrasi", 
            isStatus: true 
          }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
            <span className="text-[13px] text-gray-500 font-medium block mb-1.5">{stat.label}</span>
            <span className={`text-[32px] font-extrabold tracking-tight block leading-none ${
              stat.isStatus ? (dataAkademik.profil?.status === "Aktif" ? "text-emerald-600" : "text-amber-500") : "text-gray-900"
            }`}>
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
          <div className="flex bg-gray-100/80 border border-gray-200/50 p-1 rounded-xl self-start sm:self-auto">
            <button 
              onClick={() => setActiveTab('khs')} 
              className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-lg transition-all cursor-pointer ${activeTab === 'khs' ? 'bg-[#1a3a6b] text-white shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
            >
              KHS Per Semester
            </button>
            <button 
              onClick={() => setActiveTab('transkrip')} 
              className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-lg transition-all cursor-pointer ${activeTab === 'transkrip' ? 'bg-[#1a3a6b] text-white shadow-sm' : 'text-gray-400 hover:text-gray-900'}`}
            >
              Transkrip Nilai
            </button>
          </div>
        </div>

        {/* 4. RENDER ISI TAB KHS SEMESTER */}
        {activeTab === 'khs' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Rincian Komponen Nilai Berjalan</h4>
              <select 
                value={selectedSemester} 
                onChange={(e) => setSelectedSemester(e.target.value)} 
                className="bg-white text-xs font-bold px-3 py-1.5 rounded-lg border border-gray-200 text-slate-700 cursor-pointer outline-none shadow-sm focus:border-slate-300"
              >
                <option>Semester 1</option>
                <option>Semester 2</option>
                <option>Semester 3</option>
                <option>Semester 4</option>
                <option>Semester 5</option>
                <option>Semester 6</option>
                <option>Semester 7</option>
                <option>Semester 8</option>
              </select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TH>Kode</TH>
                    <TH>Mata Kuliah</TH>
                    <TH className="text-center">SKS</TH>
                    <TH className="text-center">Grade Akhir</TH>
                  </tr>
                </thead>
                <tbody>
                  {khsPerSemester.map((n) => (
                    <tr key={n.id_jadwal || n.id} className="hover:bg-gray-50/70 transition-colors">
                      <TD className="text-[#1a3a6b] font-bold font-mono">{n.jadwal?.kode_mk}</TD>
                      <TD className="font-semibold text-slate-700 uppercase">{n.jadwal?.mata_kuliah}</TD>
                      <TD className="text-center font-bold text-slate-600">{n.jadwal?.sks} SKS</TD>
                      <TD className="text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] font-black tracking-wide uppercase ${getGradeClass(n.grade)}`}>
                          {n.grade || 'E'}
                        </span>
                      </TD>
                    </tr>
                  ))}
                  {khsPerSemester.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-3 py-10 text-center text-gray-400 text-[12px] font-medium">
                        Belum ada komponen nilai yang dipublikasikan untuk semester ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. RENDER ISI TAB TRANSKRIP NILAI */}
        {activeTab === 'transkrip' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wide">Rekapitulasi Akumulasi Kelulusan</h4>
              <button 
                onClick={handleUnduhPDF} 
                className="bg-slate-900 hover:bg-slate-800 border border-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm cursor-pointer transition-colors"
              >
                Unduh PDF Transkrip
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <TH className="text-center w-32">Semester</TH>
                    <TH>Mata Kuliah</TH>
                    <TH className="text-center w-28">Kredit</TH>
                    <TH className="text-center w-40">Capaian Grade</TH>
                  </tr>
                </thead>
                <tbody>
                  {transkripSemua.map((t) => (
                    <tr key={t.id_jadwal || t.id} className="hover:bg-gray-50/70 transition-colors">
                      <TD className="text-center text-gray-400 font-semibold font-mono">SEMESTER {t.jadwal?.semester}</TD>
                      <TD className="font-semibold text-slate-700 uppercase">{t.jadwal?.mata_kuliah}</TD>
                      <TD className="text-center font-bold text-slate-600">{t.jadwal?.sks || 0} SKS</TD>
                      <TD className="text-center text-xs">
                        <span className={`inline-block px-2 py-0.5 rounded font-black font-mono uppercase ${
                          ['A', 'A-', 'B+'].includes(t.grade) ? 'text-emerald-600' : ['B', 'B-', 'C+'].includes(t.grade) ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                          {t.grade || 'N/A'}
                        </span>
                      </TD>
                    </tr>
                  ))}
                  {transkripSemua.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-3 py-10 text-center text-gray-400 text-[12px] font-medium">
                        Data riwayat kelulusan mata kuliah kosong.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}