import React, { useState, useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { nilaiAPI } from "../../../services/nilaiAPI";

const LihatNilai = ({ idJadwal, namaMK, onTutup }) => {
  const [daftarNilaiMhs, setDaftarNilaiMhs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ambilDetailNilai = async () => {
      setIsLoading(true);
      try {
        const data = await nilaiAPI.fetchDetailNilaiMahasiswa(idJadwal);
        
        // === PERBAIKAN 1: Filter Duplikasi Data Mahasiswa (Ambil entry terbaru) ===
        const nilaiTerfilter = [];
        const checkedMahasiswaIds = new Set();

        if (data && Array.isArray(data)) {
          // Balik data terlebih dahulu agar entry terbaru di database diproses duluan
          [...data].reverse().forEach((item) => {
            if (item.id_mahasiswa && !checkedMahasiswaIds.has(item.id_mahasiswa)) {
              checkedMahasiswaIds.add(item.id_mahasiswa);
              nilaiTerfilter.push(item);
            }
          });
          // Kembalikan ke urutan semula sebelum di-sort
          nilaiTerfilter.reverse();
          
          // === PERBAIKAN 2: Mengurutkan nama mahasiswa dari A sampai Z ===
          nilaiTerfilter.sort((a, b) => {
            const namaA = (a.mahasiswa?.nama || "").toUpperCase();
            const namaB = (b.mahasiswa?.nama || "").toUpperCase();
            return namaA.localeCompare(namaB);
          });
        }

        setDaftarNilaiMhs(nilaiTerfilter);
      } catch (error) {
        console.error("Gagal memuat rincian nilai siswa:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (idJadwal) ambilDetailNilai();
  }, [idJadwal]);

  return (
    <div className="fixed inset-0 bg-white z-[9999] p-6 md:p-12 text-slate-700 overflow-y-auto min-h-screen font-sans">
      <div className="max-w-5xl mx-auto w-full pb-12 text-xs">
        
        {/* HEADER MODAL DETAIL */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-5 mb-8 w-full">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Rincian Lembar Nilai Mahasiswa
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Mata Kuliah: <span className="text-slate-800 font-bold uppercase">{namaMK}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onTutup}
            className="text-gray-400 hover:text-slate-600 p-2 rounded-lg hover:bg-gray-50 border border-gray-200 flex items-center gap-2 text-xs font-semibold transition cursor-pointer"
          >
            <AiOutlineClose className="text-xs" />
            <span>Tutup Rincian</span>
          </button>
        </div>

        {/* TABEL NILAI SISWA */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">NIM Mahasiswa</th>
                <th className="px-6 py-3.5">Nama Lengkap</th>
                <th className="px-6 py-3.5 text-center">Nilai Tugas</th>
                <th className="px-6 py-3.5 text-center">Nilai UTS</th>
                <th className="px-6 py-3.5 text-center">Nilai UAS</th>
                <th className="px-6 py-3.5 text-center">Nilai Akhir</th>
                <th className="px-6 py-3.5 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-600 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-400 font-medium">
                    Mengambil rincian nilai dari database...
                  </td>
                </tr>
              ) : daftarNilaiMhs.length > 0 ? (
                daftarNilaiMhs.map((mhsNilai, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-mono text-slate-900 font-bold tracking-wide">{mhsNilai.id_mahasiswa}</td>
                    <td className="px-6 py-4 text-slate-800 font-bold uppercase">{mhsNilai.mahasiswa?.nama || "Mahasiswa"}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{mhsNilai.nilai_tugas || 0}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{mhsNilai.nilai_uts || 0}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{mhsNilai.nilai_uas || 0}</td>
                    <td className="px-6 py-4 text-center text-slate-900 font-bold bg-slate-50/50">{mhsNilai.nilai_akhir || 0}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border inline-block leading-none ${
                        ['A','B+','B','B-'].includes(mhsNilai.grade) 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {mhsNilai.grade || "E"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-gray-400 font-medium">
                    Dosen belum mengisi lembar nilai untuk mahasiswa di kelas ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default LihatNilai;