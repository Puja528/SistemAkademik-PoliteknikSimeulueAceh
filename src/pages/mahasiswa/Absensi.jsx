import React from 'react';
// PERBAIKAN: Hapus import Sidebar dan Header karena sudah diurus secara terpusat oleh MahasiswaLayout
import dataAbsensi from '../../data/mahasiswa/absensiData.json';

export default function Absensi() {
  const { ringkasan, matakuliah, riwayatHarian } = dataAbsensi;

  // PERBAIKAN: Langsung merender isi konten utamanya saja
  return (
    <div className="space-y-8">
      
      {/* HEADER HALAMAN */}
      <div>
        <h2 className="text-xl font-poppins-extrabold text-soft-dark flex items-center gap-3">
          <span className="w-1.5 h-6 bg-soft-button rounded-full"></span>
          Presensi & Syarat Kelayakan Uian
        </h2>
        <p className="text-xs text-teks-samping font-barlow mt-1 uppercase tracking-wider font-bold">
          US-06: Batas Minimum Kehadiran Ikut UAS = 75%
        </p>
      </div>

      {/* KARTU STATISTIK RINGKASAN */}
      <section className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-garis shadow-xs col-span-2 flex flex-col justify-between">
          <p className="text-[10px] font-bold font-barlow text-teks-samping uppercase tracking-wider">Akumulasi Kehadiran Global</p>
          <p className="text-3xl font-poppins-extrabold text-soft-dark mt-2">{ringkasan.persentaseTotal}</p>
          <p className="text-[10px] text-emerald-600 font-medium font-barlow mt-1 flex items-center gap-1">
            <span>🛡️</span> Rata-rata aman dari ambang batas aman
          </p>
        </div>
        {[
          { label: "Total Pertemuan", val: ringkasan.totalPertemuan, sub: "Sudah jalan", color: "text-teks" },
          { label: "Total Hadir", val: ringkasan.hadir, sub: "Pertemuan", color: "text-emerald-600" },
          { label: "Sakit / Izin", val: ringkasan.sakit + ringkasan.izin, sub: "Surat Resmi", color: "text-amber-500" },
          { label: "Alpa", val: ringkasan.alpa, sub: "Mangkir", color: "text-rose-500" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-garis shadow-xs">
            <p className="text-[9px] font-bold font-barlow text-teks-samping uppercase tracking-widest">{stat.label}</p>
            <p className={`text-xl font-poppins-extrabold mt-2 ${stat.color}`}>{stat.val}</p>
            <p className="text-[9px] text-teks-samping font-medium font-barlow italic">{stat.sub}</p>
          </div>
        ))}
      </section>

      {/* DAFTAR PERSENTASE MATA KULIAH & ALARM WARNING */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-soft-dark flex items-center gap-2">
            📊 Detail Kehadiran per Mata Kuliah
          </h3>
          
          <div className="bg-white rounded-2xl border border-garis p-6 space-y-6 shadow-sm">
            {matakuliah.map((mk) => {
              const diBawahAmbangBatas = mk.persentase < 75;

              return (
                <div key={mk.id} className="p-4 rounded-xl border border-garis/60 bg-latar/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-soft-button bg-soft-light px-2 py-0.5 rounded">
                        {mk.kode}
                      </span>
                      <h4 className="text-xs font-bold text-teks mt-1">{mk.mk} ({mk.sks} SKS)</h4>
                    </div>
                    <div className="text-right flex items-center sm:flex-col gap-2 sm:gap-0">
                      <span className="text-xs font-poppins-extrabold text-teks">
                        {mk.hadir} / {mk.total} <span className="text-teks-samping font-normal text-[10px]">Muka</span>
                      </span>
                      <span className={`text-xs font-poppins-extrabold ${diBawahAmbangBatas ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {mk.persentase}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="w-full bg-garis h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          diBawahAmbangBatas ? 'bg-rose-500' : 'bg-soft-button'
                        }`} 
                        style={{ width: `${mk.persentase}%` }}
                      ></div>
                    </div>

                    {diBawahAmbangBatas && (
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md animate-pulse">
                        <span>⚠️</span>
                        <span>Peringatan: Kehadiran kurang dari 75%! Anda terancam tidak bisa mengikuti UAS.</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LOG AKTIVITAS PRESENSI */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-soft-dark flex items-center gap-2">
            ⏱️ Log Absensi Terakhir
          </h3>

          <div className="bg-white rounded-2xl border border-garis p-4 space-y-3 shadow-sm">
            {riwayatHarian.map((log) => (
              <div key={log.id} className="p-3 bg-latar/40 border border-garis/60 rounded-xl flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-teks truncate">{log.mk}</h4>
                  <p className="text-[10px] text-teks-samping font-medium font-barlow mt-0.5">
                    {log.tgl} • {log.jam} WIB
                  </p>
                  <p className="text-[9px] text-soft-button font-mono italic mt-0.5">{log.metode}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[9px] font-poppins-extrabold uppercase tracking-wider ${
                  log.status === 'Hadir' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}