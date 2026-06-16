import React, { useState } from 'react';
// 1. HAPUS import Sidebar dan Header dari sini!
import dataKHS from '../../data/mahasiswa/khsData.json';

export default function KHS() {
  const [activeTab, setActiveTab] = useState('khs'); 
  const [selectedSemester, setSelectedSemester] = useState('Semester 3');
  
  const { ringkasanAkademik, khsPerSemester, transkripSemua } = dataKHS;

  const handleUnduhPDF = () => {
    alert('Sistem Sedang Memproses: Mengunduh dokumen transkrip nilai resmi format PDF...');
  };

  // 2. PERBAIKAN: Gunakan fragment <> sebagai pembungkus utamanya
  return (
    <div className="space-y-6">
      
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

        {/* TAB NAVIGASI UTAMA */}
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

      {/* MATRIKS RINGKASAN IP & IPK */}
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

      {/* ... SISA KODE KONDISIONAL TABEL KHS & TRANSKRIP DI BAWAHNYA TETAP SAMA ... */}

    </div>
  );
}