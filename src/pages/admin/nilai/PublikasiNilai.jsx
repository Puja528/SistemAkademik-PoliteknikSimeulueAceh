import React, { useState, useEffect } from "react";
import { FiSearch, FiEye, FiCheckCircle, FiClock, FiChevronDown } from "react-icons/fi";
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
      setPesanEror("Gagal mengambil data antrean nilai dari server Supabase.");
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
    <div className="flex flex-col gap-5 p-6 bg-gray-50/50 min-h-screen font-sans relative animate-fadeIn">

      {/* 1. FILTER BAR (Menggunakan Dropdown DaisyUI) */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        
        {/* Input Pencarian */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Cari mata kuliah atau NIDN..."
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs bg-gray-50 focus:outline-none focus:border-slate-400 transition text-slate-700"
          />
        </div>

        {/* Dropdown Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* DROPDOWN FILTER KELAS */}
          <div className="dropdown dropdown-bottom w-full sm:w-auto">
            <div 
              tabIndex={0} 
              role="button" 
              className="w-full sm:w-36 border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 font-medium cursor-pointer flex items-center justify-between gap-2 hover:bg-gray-50/50 transition select-none"
            >
              <span className="truncate">{filterKelas === "Semua Kelas" ? "Semua Kelas" : `Kelas ${filterKelas}`}</span>
              <FiChevronDown className="text-gray-400 shrink-0 text-[10px]" />
            </div>
            <ul 
              tabIndex={0} 
              className="dropdown-content menu p-1.5 shadow-lg bg-white rounded-lg border border-gray-200/80 w-full sm:w-36 gap-0.5 z-[100] mt-1 text-slate-700 font-sans"
            >
              {[
                { value: "Semua Kelas", label: "Semua Kelas" },
                { value: "A", label: "Kelas A" },
                { value: "B", label: "Kelas B" }
              ].map((kelas) => (
                <li key={kelas.value}>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterKelas(kelas.value);
                      if (document.activeElement) document.activeElement.blur();
                    }}
                    className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md block text-left w-full transition ${
                      filterKelas === kelas.value ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : "hover:bg-gray-100 text-slate-700"
                    }`}
                  >
                    {kelas.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* DROPDOWN FILTER STATUS TRANSMISI */}
          <div className="dropdown dropdown-bottom w-full sm:w-auto">
            <div 
              tabIndex={0} 
              role="button" 
              className="w-full sm:w-36 border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 font-medium cursor-pointer flex items-center justify-between gap-2 hover:bg-gray-50/50 transition select-none"
            >
              <span className="truncate">{filterStatus}</span>
              <FiChevronDown className="text-gray-400 shrink-0 text-[10px]" />
            </div>
            <ul 
              tabIndex={0} 
              className="dropdown-content menu p-1.5 shadow-lg bg-white rounded-lg border border-gray-200/80 w-full sm:w-36 gap-0.5 z-[100] mt-1 text-slate-700 font-sans"
            >
              {["Semua Status", "Terbit", "Draft"].map((status) => (
                <li key={status}>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterStatus(status);
                      if (document.activeElement) document.activeElement.blur();
                    }}
                    className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md block text-left w-full transition ${
                      filterStatus === status ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : "hover:bg-gray-100 text-slate-700"
                    }`}
                  >
                    {status}
                  </button>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* 2. TABEL DATA */}
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
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left">Kode MK</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left">Mata Kuliah & NIDN</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left">Kelas Paket</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left">Tanggal Masuk</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left">Status Transmisi</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-center w-60">Aksi Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-gray-400">
                    <Loading />
                  </td>
                </tr>
              ) : nilaiTerfilter.length > 0 ? (
                nilaiTerfilter.map((pub, index) => {
                  const statusAsli = pub.status_nilai || "Draft";
                  return (
                    <tr key={index} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono text-[12px] text-gray-400 font-bold">{pub.kode_mk}</td>
                      <td className="px-4 py-3">
                        <div className="text-[13px] font-bold text-slate-800 uppercase leading-snug">{pub.mata_kuliah}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5 font-medium">NIDN: {pub.nidn_dosen}</div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-gray-500 font-medium">
                        <span className="px-2 py-0.5 bg-gray-100 text-slate-700 rounded border border-gray-200 font-bold text-[10px]">
                          Kelas {pub.kelas}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-gray-500 font-medium">{pub.tanggal_input_nilai || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {statusAsli === "Terbit" ? (
                            <FiCheckCircle className="text-emerald-500 text-sm shrink-0" />
                          ) : (
                            <FiClock className="text-amber-500 text-sm shrink-0" />
                          )}
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border inline-block leading-none ${
                            statusAsli === "Terbit"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                            {statusAsli === "Terbit" ? "Terbit (Akses Mhs Open)" : "Draft (Mhs Hidden)"}
                          </span>
                        </div>
                      </td>
                      
                      {/* Kolom Aksi Staff */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setModalLihatDetail({ terbuka: true, idJadwal: pub.id_jadwal, namaMK: pub.mata_kuliah })}
                            className="bg-white text-slate-600 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer whitespace-nowrap min-w-[100px]"
                          >
                            <FiEye className="text-xs shrink-0 text-gray-400" />
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