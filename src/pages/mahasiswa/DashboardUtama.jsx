import React, { useState, useEffect } from 'react';
// Tetap membaca JSON untuk fallback tabel data di bawah banner
import dataKHS from '../../data/mahasiswa/khsData.json';
// Import mahasiswaAPI untuk memanggil data profil database
import { mahasiswaAPI } from '../../services/mahasiswaAPI.js';

export default function DashboardUtama() {
  const [activeTab, setActiveTab] = useState('khs'); 
  const [selectedSemester, setSelectedSemester] = useState('Semester 3');
  
  // ── STATE BACKEND UTAMA: Menampung profil Kiki dari database Supabase ──
  const [profilMhs, setProfilMhs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── EFFECT BACKEND: Ambil data mahasiswa berdasarkan session user yang login ──
  useEffect(() => {
    const muatProfilMahasiswaReal = async () => {
      try {
        setIsLoading(true);
        const localSession = localStorage.getItem("siakad_session");
        if (!localSession) return;

        const dataUserLogin = JSON.parse(localSession);
        const loggedInUserId = dataUserLogin.id; // Mengambil UUID Auth Kiki

        // Jalankan query REST API Axios mencari baris mahasiswa yang cocok
        const dataMhsReal = await mahasiswaAPI.fetchMahasiswaByUserId(loggedInUserId);
        
        if (dataMhsReal) {
          setProfilMhs(dataMhsReal);
        }
      } catch (error) {
        console.error("Gagal sinkronisasi data mahasiswa:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    muatProfilMahasiswaReal();
  }, []);

  const { khsPerSemester, transkripSemua } = dataKHS;

  const handleUnduhPDF = () => {
    alert('Sistem Sedang Memproses: Mengunduh dokumen transkrip nilai resmi format PDF...');
  };

  if (isLoading) {
    return (
      <div className="text-xs font-bold uppercase tracking-wider text-slate-400 p-6">
        Menghubungkan ke database akademik...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* BANNER SELAMAT DATANG BERANDA UTAMA (Dinamis dari Supabase) */}
      <div className="bg-gradient-to-r from-soft-dark to-soft-button p-6 rounded-2xl text-white shadow-xs">
        <h1 className="text-xl font-bold font-poppins-extrabold">Portal Informasi Akademik</h1>
        <p className="text-xs opacity-90 mt-1">
          {/* DATA DINAMIS DB: Menampilkan Prodi dan NIM asli milik Kiki dari database */}
          Selamat datang di halaman utama. Saat ini Anda terdata sebagai mahasiswa aktif pada Program Studi {profilMhs ? profilMhs.program_studi : "-"} dengan nomor induk mahasiswa {profilMhs ? profilMhs.id_mahasiswa : "-"}.
        </p>
      </div>

      {/* MATRIKS RINGKASAN IP & IPK UTOMATIS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-garis shadow-xs">
          <p className="text-[9px] font-bold font-barlow text-teks-samping uppercase tracking-widest mb-1">IPK Kumulatif (Terbaru)</p>
          {/* DATA DINAMIS DB: Menampilkan nilai IPK asli Kiki dari database */}
          <p className="text-2xl font-poppins-extrabold text-soft-dark">
            {profilMhs && profilMhs.ipk !== undefined ? Number(profilMhs.ipk).toFixed(2) : "0.00"}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-garis shadow-xs">
          <p className="text-[9px] font-bold font-barlow text-teks-samping uppercase tracking-widest mb-1">IP Semester (IPS)</p>
          <p className="text-2xl font-poppins-extrabold text-soft-button">
            {activeTab === 'khs' ? khsPerSemester.ips : 'N/A (Tab Transkrip)'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-garis shadow-xs">
          <p className="text-[9px] font-bold font-barlow text-teks-samping uppercase tracking-widest mb-1">Total SKS Selesai</p>
          <p className="text-2xl font-poppins-extrabold text-teks">{dataKHS.ringkasanAkademik.sksLulusTotal} SKS</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-garis shadow-xs">
          <p className="text-[9px] font-bold font-barlow text-teks-samping uppercase tracking-widest mb-1">Status Akademik</p>
          {/* DATA DINAMIS DB: Menampilkan status aktif/cuti asli dari database */}
          <p className={`text-2xl font-poppins-extrabold ${profilMhs?.status === "Aktif" ? "text-emerald-600" : "text-amber-500"}`}>
            {profilMhs ? profilMhs.status : "Aktif"}
          </p>
        </div>
      </section>

      {/* TAB NAVIGASI UTAMA DATA PANEL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-garis">
        <h3 className="font-bold text-sm text-soft-dark flex items-center gap-2">
          📊 Lembar Transkrip & Evaluasi Hasil Studi
        </h3>
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

      {/* KONDISIONAL TAMPILAN TAB 1: KHS PER SEMESTER */}
      {activeTab === 'khs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-xs text-soft-dark">📋 Rincian Nilai Berjalan - {selectedSemester}</h4>
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

      {/* KONDISIONAL TAMPILAN TAB 2: TRANSKRIP NILAI KESELURUHAN */}
      {activeTab === 'transkrip' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-xs text-soft-dark">🎓 Rekapitulasi Kelulusan Mata Kuliah</h4>
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

    </div>
  );
}