import React, { useState, useEffect } from "react";
import { AiOutlineSearch, AiOutlineEye, AiOutlineCheckCircle, AiOutlineClockCircle } from "react-icons/ai";
import { nilaiAPI } from "../../../services/nilaiAPI"; 
import LihatNilai from "./LihatNilai"; // Menghubungkan ke file kosongmu

const PublikasiNilai = () => {
  const [dataPublikasi, setDataPublikasi] = useState([]);
  const [cari, setCari] = useState("");
  const [filterKelas, setFilterKelas] = useState("Semua Kelas");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk kontrol Modal Detail Lihat Nilai
  const [modalLihatDetail, setModalLihatDetail] = useState({ terbuka: false, idJadwal: null, namaMK: "" });

  const muatDataNilai = async () => {
    setIsLoading(true);
    try {
      const data = await nilaiAPI.fetchRekapNilaiAdmin();
      setDataPublikasi(data || []);
    } catch (error) {
      console.error("Gagal mengambil antrean nilai:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    muatDataNilai();
  }, []);

  // Fungsi saat tombol "Terbitkan Nilai" diklik Admin
  const tanganiPublikasi = async (idJadwal) => {
    if (window.confirm("Apakah kamu yakin ingin mempublikasikan nilai ini ke mahasiswa?")) {
      try {
        await nilaiAPI.publikasikanNilai(idJadwal);
        alert("Nilai berhasil dipublikasikan! Mahasiswa sekarang dapat melihat KHS mereka.");
        muatDataNilai(); // Refresh data otomatis
      } catch (error) {
        alert("Gagal mempublikasikan nilai: " + error.message);
      }
    }
  };

  const nilaiTerfilter = dataPublikasi.filter((pub) => {
    const namaMK = pub?.mata_kuliah ? pub.mata_kuliah.toLowerCase() : "";
    const nidnDosen = pub?.nidn_dosen ? pub.nidn_dosen.toLowerCase() : "";
   
    const cocokCari = namaMK.includes(cari.toLowerCase()) || nidnDosen.includes(cari.toLowerCase());
    const cocokKelas = filterKelas === "Semua Kelas" || pub.kelas === filterKelas;
    
    // Sinkronisasi status_nilai dari database (jika null anggap Draft)
    const statusDb = pub.status_nilai || "Draft";
    const cocokStatus = filterStatus === "Semua Status" || statusDb === filterStatus;
   
    return cocokCari && cocokKelas && cocokStatus;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-fadeIn">
      
      {/* AREA FILTER UTAMA */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <AiOutlineSearch className="absolute left-4 top-3.5 text-slate-400 text-lg" />
          <input
            type="text"
            placeholder="Cari berdasarkan matakuliah atau NIDN dosen..."
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            className="w-full bg-slate-50 text-xs font-medium pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-black transition"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
          >
            <option>Semua Kelas</option>
            <option>A</option>
            <option>B</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
          >
            <option>Semua Status</option>
            <option value="Terbit">Terbit</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* AREA TABEL UTAMA */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Kode MK</th>
                <th className="px-6 py-4">Mata Kuliah & NIDN</th>
                <th className="px-6 py-4">Kelas Paket</th>
                <th className="px-6 py-4">Tanggal Masuk</th>
                <th className="px-6 py-4">Status Transmisi</th>
                <th className="px-6 py-4 text-center">Aksi Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-bold animate-pulse">
                    Menghubungkan ke server tabel nilai Supabase...
                  </td>
                </tr>
              ) : nilaiTerfilter.length > 0 ? (
                nilaiTerfilter.map((pub, index) => {
                  const statusAsli = pub.status_nilai || "Draft";
                  return (
                    <tr key={index} className="hover:bg-slate-50/40 transition">
                      <td className="px-6 py-4.5 font-bold text-slate-400 tracking-wide">{pub.kode_mk}</td>
                      <td className="px-6 py-4.5">
                        <div className="text-slate-900 font-bold leading-snug">{pub.mata_kuliah}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-medium">NIDN: {pub.nidn_dosen}</div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded-md font-bold text-[10px]">
                          Kelas {pub.kelas}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-slate-400">{pub.tanggal_input_nilai || "-"}</td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-1.5">
                          {statusAsli === "Terbit" ? (
                            <AiOutlineCheckCircle className="text-emerald-500 text-base" />
                          ) : (
                            <AiOutlineClockCircle className="text-amber-500 text-base" />
                          )}
                          <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md inline-block leading-none ${
                            statusAsli === "Terbit"
                              ? "bg-black text-white"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {statusAsli === "Terbit" ? "Terbit (Akses Mhs Open)" : "Draft (Mhs Hidden)"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-center flex items-center justify-center gap-2">
                        <button 
                          onClick={() => setModalLihatDetail({ terbuka: true, idJadwal: pub.id_jadwal, namaMK: pub.mata_kuliah })}
                          className="bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 px-3 py-1.5 rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 transition duration-150"
                        >
                          <AiOutlineEye className="text-sm" />
                          <span>Lihat Nilai</span>
                        </button>
                        
                        {statusAsli === "Draft" && (
                          <button 
                            onClick={() => tanganiPublikasi(pub.id_jadwal)}
                            className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-xl font-bold text-[11px] inline-flex items-center gap-1.5 transition duration-150 shadow-sm shadow-blue-100"
                          >
                            <span>Terbitkan Nilai</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-semibold bg-slate-50/20">
                    Tidak ada antrean publikasi nilai ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RENDER MODAL DETAIL LIHAT NILAI */}
      {modalLihatDetail.terbuka && (
        <LihatNilai 
          idJadwal={modalLihatDetail.idJadwal}
          namaMK={modalLihatDetail.namaMK}
          onTutup={() => setModalLihatDetail({ terbuka: false, idJadwal: null, namaMK: "" })}
        />
      )}
    </div>
  );
};

export default PublikasiNilai;