import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setujuSyarat, setSetujuSyarat] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Pendaftaran berhasil! Silakan cek email aktivasi Anda.');
  };

  return (
    <div className="min-h-screen bg-latar flex items-center justify-center font-poppins antialiased p-0 sm:p-4">
      <div className="w-full max-w-5xl min-h-[700px] bg-white sm:rounded-2xl shadow-xl border border-garis overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* SISI KIRI: Visual Branding / Ilustrasi (Konsisten dengan Login) */}
        <div className="hidden lg:flex lg:col-span-5 bg-soft-dark relative p-12 flex-col justify-between text-white">
          <div className="absolute inset-0 bg-gradient-to-b from-soft-button/30 to-soft-dark/90 z-10"></div>
          
          {/* Logo */}
          <div className="relative z-20 flex items-center gap-3">
            <div className="w-9 h-9 bg-white text-soft-dark rounded-xl flex items-center justify-center font-poppins-extrabold text-base shadow-sm">
              P
            </div>
            <div>
              <h2 className="font-barlow font-bold text-sm tracking-wider leading-none">POLTEKSIM</h2>
              <p className="text-[10px] text-sky-200 tracking-widest mt-1 uppercase">Portal Akademik</p>
            </div>
          </div>

          {/* Slogan Tengah */}
          <div className="relative z-20 space-y-3">
            <span className="text-[10px] font-bold font-barlow text-soft-dark bg-white px-2.5 py-0.5 rounded-full tracking-wide inline-block uppercase">
              Registrasi Akun
            </span>
            <h1 className="text-xl font-poppins-extrabold leading-tight">
              Mulai Perjalanan Akademik Anda di Sini
            </h1>
            <p className="text-xs text-sky-100/90 leading-relaxed font-normal">
              Daftarkan akun mahasiswa Anda untuk mendapatkan akses penuh ke pengisian KRS, jadwal perkuliahan digital, presensi berbasis koordinat, dan rekap nilai transkrip.
            </p>
          </div>

          {/* Footer Kiri */}
          <div className="relative z-20">
            <p className="text-[10px] text-sky-200/60 font-barlow">
              © 2026 Politeknik Kelautan & Perikanan.
            </p>
          </div>
        </div>

        {/* SISI KANAN: Form Registrasi */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center p-8 sm:p-16 bg-white">
          <div className="mb-6">
            <h2 className="text-2xl font-poppins-extrabold text-teks tracking-tight">Daftar Akun Baru</h2>
            <p className="text-xs text-teks-samping mt-1.5 font-barlow">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-soft-button font-bold hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input Nama Lengkap */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold font-barlow text-teks-samping uppercase tracking-wider">
                Nama Lengkap (Sesuai KTP/Ijazah)
              </label>
              <input 
                type="text" 
                required
                placeholder="Contoh: Rian Altamira"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                className="w-full px-4 py-2.5 bg-latar/40 border border-garis rounded-xl text-xs font-semibold text-teks focus:outline-none focus:border-soft-button focus:bg-white transition-all placeholder:text-teks-samping/40"
              />
            </div>

            {/* Input NIM */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold font-barlow text-teks-samping uppercase tracking-wider">
                NIM (Nomor Induk Mahasiswa)
              </label>
              <input 
                type="text" 
                required
                placeholder="Contoh: 22040101032"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                className="w-full px-4 py-2.5 bg-latar/40 border border-garis rounded-xl text-xs font-semibold text-teks focus:outline-none focus:border-soft-button focus:bg-white transition-all placeholder:text-teks-samping/40"
              />
            </div>

            {/* Input Email Institusi */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold font-barlow text-teks-samping uppercase tracking-wider">
                Email Mahasiswa / Institusi
              </label>
              <input 
                type="email" 
                required
                placeholder="rian.altamira@student.polteksim.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-latar/40 border border-garis rounded-xl text-xs font-semibold text-teks focus:outline-none focus:border-soft-button focus:bg-white transition-all placeholder:text-teks-samping/40"
              />
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold font-barlow text-teks-samping uppercase tracking-wider">
                Buat Kata Sandi Baru
              </label>
              <input 
                type="password" 
                required
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-latar/40 border border-garis rounded-xl text-xs font-semibold text-teks focus:outline-none focus:border-soft-button focus:bg-white transition-all placeholder:text-teks-samping/40"
              />
            </div>

            {/* Checkbox Syarat & Ketentuan */}
            <div className="flex items-start gap-2 py-1">
              <input 
                type="checkbox" 
                id="terms"
                required
                checked={setujuSyarat}
                onChange={(e) => setSetujuSyarat(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-garis text-soft-button focus:ring-soft-light cursor-pointer"
              />
              <label htmlFor="terms" className="text-[11px] text-teks-samping font-medium font-barlow select-none cursor-pointer leading-relaxed">
                Saya menyatakan data di atas benar dan menyetujui <a href="#syarat" className="text-soft-button font-bold hover:underline">Syarat & Ketentuan Ketentuan</a> serta <a href="#privasi" className="text-soft-button font-bold hover:underline">Kebijakan Privasi</a> kampus.
              </label>
            </div>

            {/* Button Submit */}
            <button 
              type="submit"
              className="w-full bg-soft-button hover:bg-soft-dark text-white font-bold py-3.5 rounded-xl text-xs tracking-wide shadow-md hover:shadow-lg transition-all duration-200 mt-2 cursor-pointer"
            >
              Mulai Mendaftar
            </button>
          </form>

          {/* Help Center Footer */}
          <div className="mt-8 pt-4 border-t border-garis text-[11px] text-teks-samping font-barlow text-center">
            Punya kendala registrasi nim? <a href="#bantuan" className="text-soft-button font-bold hover:underline">Hubungi Layanan Akademik BAAD</a>
          </div>
        </div>

      </div>
    </div>
  );
}