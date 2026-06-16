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
        setDaftarNilaiMhs(data || []);
      } catch (error) {
        console.error("Gagal memuat rincian nilai siswa:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (idJadwal) ambilDetailNilai();
  }, [idJadwal]);

  return (
    <div className="fixed inset-0 bg-white z-[9999] p-6 md:p-12 animate-fadeIn text-slate-700 overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full pb-12">
        
        {/* HEADER MODAL DETAIL */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-6 w-full">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">
              Rincian Lembar Nilai Mahasiswa
            </h3>
            <p className="text-xs text-blue-600 mt-0.5 font-bold uppercase tracking-wide">
              Mata Kuliah: {namaMK}
            </p>
          </div>
          <button
            type="button"
            onClick={onTutup}
            className="text-slate-400 hover:text-slate-900 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition border border-slate-200 flex items-center gap-2 text-xs font-bold"
          >
            <AiOutlineClose className="text-sm" />
            <span>Tutup Rincian</span>
          </button>
        </div>

        {/* TABEL NILAI SISWA */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">NIM Mahasiswa</th>
                <th className="px-6 py-3.5">Nama Lengkap</th>
                <th className="px-6 py-3.5 text-center">Nilai Tugas</th>
                <th className="px-6 py-3.5 text-center">Nilai UTS</th>
                <th className="px-6 py-3.5 text-center">Nilai UAS</th>
                <th className="px-6 py-3.5 text-center">Nilai Akhir</th>
                <th className="px-6 py-3.5 text-center">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400 animate-pulse font-bold">
                    Mengambil rincian nilai dari cloud database...
                  </td>
                </tr>
              ) : daftarNilaiMhs.length > 0 ? (
                daftarNilaiMhs.map((mhsNilai, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-mono text-slate-900 font-bold">{mhsNilai.id_mahasiswa}</td>
                    <td className="px-6 py-4 text-slate-800 font-bold">{mhsNilai.mahasiswa?.nama || "Mahasiswa"}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{mhsNilai.nilai_tugas || 0}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{mhsNilai.nilai_uts || 0}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{mhsNilai.nilai_uas || 0}</td>
                    <td className="px-6 py-4 text-center text-slate-900 font-extrabold bg-blue-50/20">{mhsNilai.nilai_akhir || 0}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black ${
                        ['A','B'].includes(mhsNilai.grade) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}>
                        {mhsNilai.grade || "E"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
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