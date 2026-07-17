import React, { useState, useEffect, useMemo } from 'react'; // Tambahkan useMemo
import { absensiAPI } from '../../services/absensiAPI';
import { mahasiswaAPI } from '../../services/mahasiswaAPI';
import Loading from '../../components/admin/Loading';

export default function Absensi() {
  const [dataAbsen, setDataAbsen] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = JSON.parse(localStorage.getItem("siakad_session"));
        const mhs = await mahasiswaAPI.fetchMahasiswaByUserId(session.id);
        const data = await absensiAPI.fetchAbsensiMahasiswa(mhs.id_mahasiswa);
        setDataAbsen(data);
      } catch (err) {
        console.error("Gagal memuat data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // AGREGASI DATA (Dioptimalkan dengan useMemo)
  const { matakuliah, ringkasan } = useMemo(() => {
    const map = dataAbsen.reduce((acc, curr) => {
      const id = curr.id_jadwal;
      if (!acc[id]) {
        acc[id] = { id, mk: curr.jadwal?.mata_kuliah, kode: curr.jadwal?.kode_mk || curr.jadwal?.kode, sks: curr.jadwal?.sks, hadir: 0, total: 0 };
      }
      acc[id].total += 1;
      if (curr.status_kehadiran === 'Hadir') acc[id].hadir += 1;
      acc[id].persentase = Math.round((acc[id].hadir / acc[id].total) * 100);
      return acc;
    }, {});

    const ringkasanData = {
      totalPertemuan: dataAbsen.length,
      hadir: dataAbsen.filter(a => a.status_kehadiran === 'Hadir').length,
      sakit: dataAbsen.filter(a => a.status_kehadiran === 'Sakit').length,
      izin: dataAbsen.filter(a => a.status_kehadiran === 'Izin').length,
      alpa: dataAbsen.filter(a => a.status_kehadiran === 'Alpa').length,
      persentaseTotal: dataAbsen.length > 0 
        ? Math.round((dataAbsen.filter(a => a.status_kehadiran === 'Hadir').length / dataAbsen.length) * 100) + "%" 
        : "0%"
    };

    return { matakuliah: Object.values(map), ringkasan: ringkasanData };
  }, [dataAbsen]);

  // Fungsi pembantu format tanggal
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) return <div className="p-6 text-xs font-bold uppercase tracking-wider text-slate-400"><Loading/></div>;

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f4f6f9] min-h-screen font-sans text-xs text-slate-700 w-full">
      {/* HEADER HALAMAN */}
      <div>
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2.5">
          <span className="w-1 h-5 bg-[#1a3a6b] rounded-full"></span>
          Presensi & Syarat Kelayakan Ujian
        </h2>
        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">
          Aturan Akademik: <span className="font-bold text-rose-600">Batas Minimum Kehadiran Ikut UAS = 75%</span>
        </p>
      </div>

      {/* KARTU STATISTIK RINGKASAN */}
      <section className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm col-span-2 flex flex-col justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Akumulasi Kehadiran Global</p>
          <p className="text-2xl font-black text-[#1a3a6b] tracking-tight mt-2">{ringkasan.persentaseTotal}</p>
        </div>
        {[
          { label: "Total Pertemuan", val: ringkasan.totalPertemuan, sub: "Sudah jalan", color: "text-slate-900" },
          { label: "Total Hadir", val: ringkasan.hadir, sub: "Pertemuan", color: "text-emerald-600" },
          { label: "Sakit / Izin", val: ringkasan.sakit + ringkasan.izin, sub: "Surat Resmi", color: "text-amber-500" },
          { label: "Alpa", val: ringkasan.alpa, sub: "Mangkir", color: "text-rose-500" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <div className="mt-2">
              <p className={`text-lg font-black tracking-tight ${stat.color}`}>{stat.val}</p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5 italic">{stat.sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* DAFTAR PERSENTASE MATA KULIAH & LOG KANAN */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SISI KIRI: PROGRES TIAP MK */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">📊 Detail Kehadiran per Mata Kuliah</h3>
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 shadow-sm">
            {matakuliah.map((mk) => {
              const diBawahAmbangBatas = mk.persentase < 75;
              return (
                <div key={mk.id} className="p-4 rounded-lg border border-gray-100 bg-slate-50/60 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono font-black text-[#1a3a6b] bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded uppercase">{mk.kode || "MK"}</span>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mt-1.5">{mk.mk} ({mk.sks} SKS)</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-500 font-mono">{mk.hadir} / {mk.total}</span>
                      <p className={`text-xs font-black font-mono mt-0.5 ${diBawahAmbangBatas ? 'text-rose-600' : 'text-emerald-600'}`}>{mk.persentase}%</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar Visualisasi Kehadiran */}
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${diBawahAmbangBatas ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(mk.persentase, 100)}%` }}
                    />
                  </div>

                  {/* Peringatan jika kehadiran kurang dari 75% */}
                  {diBawahAmbangBatas && (
                    <p className="text-[10px] text-rose-500 font-medium tracking-wide">⚠️ Kehadiran di bawah 75%, Anda terancam tidak dapat mengikuti UAS.</p>
                  )}
                </div>
              );
            })}
            {matakuliah.length === 0 && (
              <p className="text-center text-slate-400 py-6 font-medium tracking-wide">Belum ada riwayat data presensi kelas berjalan.</p>
            )}
          </div>
        </div>

        {/* SISI KANAN: LOG AKTIVITAS ABSENSI */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">⏱️ Log Absensi Terakhir</h3>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 shadow-sm">
            {dataAbsen.slice(-5).reverse().map((log) => {
              const isHadir = log.status_kehadiran === 'Hadir';
              const isSakitIzin = ['Sakit', 'Izin'].includes(log.status_kehadiran);
              return (
                <div key={log.id_absen} className="p-3 bg-slate-50/60 border border-gray-100 rounded-lg flex justify-between items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 uppercase truncate tracking-wide">{log.jadwal?.mata_kuliah}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{log.tanggal_absen}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide border flex-shrink-0 ${
                    isHadir ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    isSakitIzin ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {log.status_kehadiran}
                  </span>
                </div>
              );
            })}
            {dataAbsen.length === 0 && (
              <p className="text-center text-slate-400 py-6 font-medium tracking-wide">Tidak ada log aktivitas absensi terbaru.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}