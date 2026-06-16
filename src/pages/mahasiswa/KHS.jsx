import React, { useState } from 'react';
import Sidebar from '../../components/mahasiswa/Sidebar';
import Header from '../../components/mahasiswa/Header';
import dataKHS from '../../data/mahasiswa/khsData.json';

export default function KHS() {
  const [activeTab, setActiveTab] = useState('khs'); // 'khs' atau 'transkrip'
  const [selectedSemester, setSelectedSemester] = useState('Semester 3');
  
  const { ringkasanAkademik, khsPerSemester, transkripSemua } = dataKHS;

  const handleUnduhPDF = () => {
    alert('Sistem Sedang Memproses: Mengunduh dokumen transkrip nilai resmi format PDF...');
  };

  return (
    <div className="flex min-h-screen bg-latar font-poppins text-teks">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* HEADER HALAMAN */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-poppins-extrabold text-soft-dark flex items-center gap-3">
                <span className="w-1.5 h-6 bg-soft-button rounded-full"></span>
                Panel Hasil Studi Akademik
              </h2>
              <p className="text-xs text-teks-samping font-barlow mt-1 uppercase tracking-wider font-bold">
                PRODI: {ringkasanAkademik.prodi} • NIM: {ringkasanAkademik.nim}
              </p>
            </div>

            {/* TAB NAVIGASI UTAMA (US-05 & US-07) */}
            <div className="flex bg-white border border-garis p-1 rounded-xl shadow-xs self-start sm:self-auto">
              <button 
                onClick={() => setActiveTab('khs')}
                className={`px-4 py-2 text-xs font-bold font-barlow uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeTab === 'khs' ? 'bg-soft-button text-white shadow-xs' : 'text-teks-samping hover:text-teks'
                }`}
              >
                📑 KHS Per Semester
              </button>
              <button 
                onClick={() => setActiveTab('transkrip')}
                className={`px-4 py-2 text-xs font-bold font-barlow uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeTab === 'transkrip' ? 'bg-soft-button text-white shadow-xs' : 'text-teks-samping hover:text-teks'
                }`}
              >
                🎓 Transkrip Nilai
              </button>
            </div>
          </div>

          {/* MATRIKS RINGKASAN IP & IPK OTOMATIS (Kriteria US-05 & US-07) */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-garis shadow-xs">
              <p className="text-[9px] font-bold font-barlow text-teks-samping uppercase tracking-widest mb-1">IPK Kumulatif (Terbaru)</p>
              <p className="text-2xl font-poppins-extrabold text-soft-dark">{ringkasanAkademik.ipkTerbaru}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-garis shadow-xs">
              <p className="text-[9px] font-bold font-barlow text-teks-samping uppercase tracking-widest mb-1">IP Semester (IPS)</p>
              <p className="text-2xl font-poppins-extrabold text-soft-button">
                {activeTab === 'khs' ? khsPerSemester.ips : 'N/A (Tab Transkrip)'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-garis shadow-xs">
              <p className="text-[9px] font-bold font-barlow text-teks-samping uppercase tracking-widest mb-1">Total SKS Selesai</p>
              <p className="text-2xl font-poppins-extrabold text-teks">{ringkasanAkademik.sksLulusTotal} SKS</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-garis shadow-xs">
              <p className="text-[9px] font-bold font-barlow text-teks-samping uppercase tracking-widest mb-1">Status Akademik</p>
              <p className="text-2xl font-poppins-extrabold text-emerald-600">Aktif</p>
            </div>
          </section>

          {/* KONDISIONAL TAMPILAN TAB 1: KHS PER SEMESTER (US-05) */}
          {activeTab === 'khs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-soft-dark flex items-center gap-2">
                  📋 Hasil Studi {selectedSemester}
                </h3>
                {/* Selector Semester */}
                <select 
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="bg-white text-xs font-bold px-3 py-1.5 rounded-lg border border-garis text-soft-dark cursor-pointer outline-none shadow-xs"
                >
                  <option>Semester 1</option>
                  <option>Semester 2</option>
                  <option>Semester 3</option>
                </select>
              </div>

              <div className="bg-white rounded-2xl border border-garis shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-latar/50 border-b border-garis">
                        <th className="px-6 py-4 text-[10px] font-bold font-barlow text-teks-samping uppercase">Kode</th>
                        <th className="px-6 py-4 text-[10px] font-bold font-barlow text-teks-samping uppercase">Mata Kuliah</th>
                        <th className="px-6 py-4 text-[10px] font-bold font-barlow text-teks-samping uppercase text-center">SKS</th>
                        <th className="px-6 py-4 text-[10px] font-bold font-barlow text-teks-samping uppercase text-center">Nilai Huruf</th>
                        <th className="px-6 py-4 text-[10px] font-bold font-barlow text-teks-samping uppercase text-center">Bobot Angka</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-garis">
                      {khsPerSemester.nilai.map((n) => (
                        <tr key={n.id} className="hover:bg-soft-light/20 transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-soft-dark">{n.kode}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-teks">{n.mk}</td>
                          <td className="px-6 py-4 text-xs text-center font-medium">{n.sks}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-block px-3 py-1 rounded-lg text-[10px] font-poppins-extrabold bg-emerald-100 text-emerald-700">
                              {n.huruf}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-center font-bold text-teks">{n.bobot.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* KONDISIONAL TAMPILAN TAB 2: TRANSKRIP NILAI KESELURUHAN (US-07) */}
          {activeTab === 'transkrip' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-soft-dark flex items-center gap-2">
                  🎓 Rekapitulasi Seluruh Mata Kuliah Telah Lulus
                </h3>
                {/* Tombol Unduh PDF Kriteria US-07 */}
                <button 
                  onClick={handleUnduhPDF}
                  className="bg-soft-dark hover:bg-soft-button text-white px-4 py-2 rounded-xl text-[10px] font-bold font-barlow uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  📥 Unduh PDF Transkrip
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-garis shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-latar/50 border-b border-garis">
                        <th className="px-6 py-4 text-[10px] font-bold font-barlow text-teks-samping uppercase text-center">Sem</th>
                        <th className="px-6 py-4 text-[10px] font-bold font-barlow text-teks-samping uppercase">Kode</th>
                        <th className="px-6 py-4 text-[10px] font-bold font-barlow text-teks-samping uppercase">Mata Kuliah Kelulusan</th>
                        <th className="px-6 py-4 text-[10px] font-bold font-barlow text-teks-samping uppercase text-center">SKS</th>
                        <th className="px-6 py-4 text-[10px] font-bold font-barlow text-teks-samping uppercase text-center">Nilai Akhir</th>
                        <th className="px-6 py-4 text-[10px] font-bold font-barlow text-teks-samping uppercase text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-garis">
                      {/* Gabungan data simulasi kelulusan */}
                      {transkripSemua.map((t) => (
                        <tr key={t.id} className="hover:bg-soft-light/20 transition-colors">
                          <td className="px-6 py-4 text-xs text-center font-bold text-teks-samping font-barlow">S-{t.sem}</td>
                          <td className="px-6 py-4 text-xs font-bold text-soft-dark">{t.kode}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-teks">{t.mk}</td>
                          <td className="px-6 py-4 text-xs text-center font-medium">{t.sks}</td>
                          <td className="px-6 py-4 text-center font-poppins-extrabold text-xs text-soft-button">{t.huruf}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-[10px] font-bold font-barlow text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}