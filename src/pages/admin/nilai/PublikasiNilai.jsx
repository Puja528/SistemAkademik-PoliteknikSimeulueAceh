import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi"; // Menggunakan FiSearch sesuai halaman acuan
import { AiOutlineEye, AiOutlineCheckCircle, AiOutlineClockCircle } from "react-icons/ai";
import { nilaiAPI } from "../../../services/nilaiAPI";
import LihatNilai from "./LihatNilai"; 
import Loading from "../../../components/admin/Loading";

const PublikasiNilai = () => {
  const [dataPublikasi, setDataPublikasi] = useState([]);
  const [cari, setCari] = useState("");
  const [filterKelas, setFilterKelas] = useState("Semua Kelas");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [isLoading, setIsLoading] = useState(true);
  const [pesanEror, setPesanEror] = useState("");

  const [modalLihatDetail, setModalLihatDetail] = useState({ terbuka: false, idJadwal: null, namaMK: "" });

  const muatDataNilai = async () => {
    setIsLoading(true);
    setPesanEror("");
    try {
      const data = await nilaiAPI.fetchRekapNilaiAdmin();
      setDataPublikasi(data || []);
    } catch (error) {
      console.error("Gagal mengambil antrean nilai:", error);
      setPesanEror("Gagal mengambil data antrean nilai dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    muatDataNilai();
  }, []);

  const tanganiPublikasi = async (idJadwal) => {
    if (window.confirm("Apakah kamu yakin ingin mempublikasikan nilai ini ke mahasiswa?")) {
      try {
        await nilaiAPI.publikasikanNilai(parseInt(idJadwal));
        alert("Nilai berhasil dipublikasikan!");
        muatDataNilai();
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

    const statusDb = pub.status_nilai || "Draft";
    const cocokStatus = filterStatus === "Semua Status" || statusDb === filterStatus;

    return cocokCari && cocokKelas && cocokStatus;
  });

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f4f6f9] min-h-screen font-sans text-xs text-slate-700">

      {/* 1. AREA CARD SEARCH & FILTER (100% Identik dengan Halaman Acuan) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        
        {/* Input Pencarian */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Cari mata kuliah, kode, NIDN..."
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs bg-gray-50 focus:outline-none focus:border-slate-400 transition"
          />
        </div>

        {/* Dropdown Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 font-medium cursor-pointer max-w-xs truncate focus:outline-none"
          >
            <option value="Semua Kelas">Semua Kelas</option>
            <option value="A">Kelas A</option>
            <option value="B">Kelas B</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 font-medium cursor-pointer max-w-xs truncate focus:outline-none"
          >
            <option value="Semua Status">Semua Status</option>
            <option value="Terbit">Terbit</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* 2. AREA TABEL UTAMA */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex-1">
        
        {pesanEror && (
          <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
            {pesanEror}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="text-left px-4 py-3.5">Kode MK</th>
                <th className="text-left px-4 py-3.5">Mata Kuliah & NIDN</th>
                <th className="text-left px-4 py-3.5">Kelas Paket</th>
                <th className="text-left px-4 py-3.5">Tanggal Masuk</th>
                <th className="text-left px-4 py-3.5">Status Transmisi</th>
                <th className="text-center px-4 py-3.5 w-60">Aksi Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-gray-400 font-medium">
                    <Loading />
                  </td>
                </tr>
              ) : nilaiTerfilter.length > 0 ? (
                nilaiTerfilter.map((pub, index) => {
                  const statusAsli = pub.status_nilai || "Draft";
                  return (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-gray-400 font-bold tracking-wide">{pub.kode_mk}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-slate-900 font-bold leading-snug">{pub.mata_kuliah}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5 font-medium">NIDN: {pub.nidn_dosen}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-1 bg-gray-100 text-slate-700 rounded-md font-bold text-[10px]">
                          Kelas {pub.kelas}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500">{pub.tanggal_input_nilai || "-"}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {statusAsli === "Terbit" ? (
                            <AiOutlineCheckCircle className="text-emerald-500 text-base shrink-0" />
                          ) : (
                            <AiOutlineClockCircle className="text-amber-500 text-base shrink-0" />
                          )}
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border inline-block leading-none ${
                            statusAsli === "Terbit"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {statusAsli === "Terbit" ? "Terbit (Akses Mhs Open)" : "Draft (Mhs Hidden)"}
                          </span>
                        </div>
                      </td>
                      
                      {/* Kolom Aksi Staff */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setModalLihatDetail({ terbuka: true, idJadwal: pub.id_jadwal, namaMK: pub.mata_kuliah })}
                            className="bg-white text-slate-600 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer whitespace-nowrap min-w-[100px]"
                          >
                            <AiOutlineEye className="text-sm shrink-0" />
                            <span>Lihat Nilai</span>
                          </button>

                          {statusAsli === "Draft" && (
                            <button
                              type="button"
                              onClick={() => tanganiPublikasi(pub.id_jadwal)}
                              className="bg-[#1a3a6b] text-white hover:bg-[#244b86] px-3 py-1.5 rounded-lg font-semibold text-xs inline-flex items-center justify-center transition duration-150 shadow-sm cursor-pointer whitespace-nowrap"
                            >
                              <span>Terbitkan Nilai</span>
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-gray-400 font-medium">
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