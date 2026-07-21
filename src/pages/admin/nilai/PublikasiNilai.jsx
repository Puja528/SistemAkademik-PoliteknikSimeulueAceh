import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi"; 
import { AiOutlineEye, AiOutlineCheckCircle, AiOutlineClockCircle } from "react-icons/ai";
import { nilaiAPI } from "../../../services/nilaiAPI";
import LihatNilai from "./LihatNilai"; 
import Loading from "../../../components/admin/Loading";
import Swal from 'sweetalert2';

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
    const hasilKonfirmasi = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Nilai ini akan dipublikasikan dan dapat dilihat oleh mahasiswa!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Publikasikan!',
      cancelButtonText: 'Batal'
    });

    if (!hasilKonfirmasi.isConfirmed) return;

    try {
      await nilaiAPI.publikasikanNilai(parseInt(idJadwal));
      
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Nilai berhasil dipublikasikan!',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });

      muatDataNilai();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Publikasi',
        text: 'Gagal mempublikasikan nilai: ' + error.message,
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#d33',
      });
    }
  };

  // 1. FILTER DATA
  const nilaiTerfilter = dataPublikasi.filter((pub) => {
    const namaMK = pub?.mata_kuliah ? pub.mata_kuliah.toLowerCase() : "";
    const nidnDosen = pub?.nidn_dosen ? pub.nidn_dosen.toLowerCase() : "";

    const cocokCari = namaMK.includes(cari.toLowerCase()) || nidnDosen.includes(cari.toLowerCase());
    const cocokKelas = filterKelas === "Semua Kelas" || pub.kelas === filterKelas;

    const statusDb = pub.status_nilai || "Draft";
    const cocokStatus = filterStatus === "Semua Status" || statusDb === filterStatus;

    return cocokCari && cocokKelas && cocokStatus;
  });

  // 2. URUTKAN DATA BERDASARKAN NAMA MATA KULIAH (A-Z)
  const dataTerurut = [...nilaiTerfilter].sort((a, b) => {
    const namaA = (a.mata_kuliah || "").toUpperCase();
    const namaB = (b.mata_kuliah || "").toUpperCase();
    return namaA.localeCompare(namaB);
  });

  return (
    <div className="flex flex-col gap-5 p-6 bg-gray-50/50 min-h-screen font-sans text-xs text-slate-700">

      {/* 1. AREA CARD SEARCH & FILTER */}
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
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400">
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left w-24">Kode MK</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left">Mata Kuliah & NIDN</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left w-28">Kelas Paket</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left w-36">Tanggal Masuk</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left w-44">Status Transmisi</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-center w-56">Aksi Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-gray-400">
                    <Loading />
                  </td>
                </tr>
              ) : dataTerurut.length > 0 ? (
                dataTerurut.map((pub, index) => {
                  const statusAsli = pub.status_nilai || "Draft";
                  return (
                    <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-gray-400 font-bold text-[12px]">{pub.kode_mk}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-slate-800 font-bold text-[13px] uppercase tracking-wide">{pub.mata_kuliah}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5 font-medium">NIDN: {pub.nidn_dosen}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-gray-100 text-slate-600 border border-gray-200 rounded text-[10px] font-bold">
                          Kelas {pub.kelas}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[13px] text-gray-500 font-medium">{pub.tanggal_input_nilai || "-"}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded border inline-flex items-center gap-1 leading-none ${
                          statusAsli === "Terbit"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {statusAsli === "Terbit" ? (
                            <>
                              <AiOutlineCheckCircle size={11} className="shrink-0" />
                              <span>Terbit (Akses Mhs Open)</span>
                            </>
                          ) : (
                            <>
                              <AiOutlineClockCircle size={11} className="shrink-0" />
                              <span>Draft (Mhs Hidden)</span>
                            </>
                          )}
                        </span>
                      </td>
                      
                      {/* Kolom Aksi Staff */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setModalLihatDetail({ terbuka: true, idJadwal: pub.id_jadwal, namaMK: pub.mata_kuliah })}
                            className="flex-1 bg-white text-slate-600 border border-gray-200 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg font-semibold text-[11px] inline-flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap min-w-[90px]"
                          >
                            <AiOutlineEye className="text-xs shrink-0" />
                            <span>Lihat Nilai</span>
                          </button>

                          {statusAsli === "Draft" ? (
                            <button
                              type="button"
                              onClick={() => tanganiPublikasi(pub.id_jadwal)}
                              className="flex-1 bg-[#1a3a6b] text-white hover:bg-[#244b86] px-2.5 py-1.5 rounded-lg font-semibold text-[11px] inline-flex items-center justify-center transition shadow-sm cursor-pointer whitespace-nowrap min-w-[90px]"
                            >
                              <span>Terbitkan Nilai</span>
                            </button>
                          ) : (
                            <div className="flex-1 min-w-[90px] text-[11px] text-gray-400 font-medium italic text-center selection:bg-transparent">
                              Sudah Rilis
                            </div>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-gray-400 text-xs font-medium">
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