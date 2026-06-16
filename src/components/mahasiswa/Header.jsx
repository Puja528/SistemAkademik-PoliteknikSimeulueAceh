import React from 'react';
import data from '../../data/mahasiswa/dashboardData.json';

export default function Header() {
  return (
    <header className="h-20 bg-white border-b border-garis px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <p className="text-[10px] text-teks-samping uppercase font-medium tracking-wider">Selamat Datang Kembali</p>
        <h1 className="font-bold text-teks text-base">{data.mahasiswa.nama}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-xs font-bold text-teks">{data.mahasiswa.nim}</p>
          <p className="text-[10px] text-soft-dark font-bold bg-soft-light px-2 py-0.5 rounded-sm mt-0.5">{data.mahasiswa.status}</p>
        </div>
        <div className="w-10 h-10 bg-soft-light rounded-full border border-garis flex items-center justify-center text-sm font-bold text-soft-dark">RA</div>
      </div>
    </header>
  );
}