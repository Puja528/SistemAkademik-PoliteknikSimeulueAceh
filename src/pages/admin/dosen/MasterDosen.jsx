import React, { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiMoreHorizontal, FiEdit2, FiTrash2, FiAlertTriangle } from "react-icons/fi";
import { dosenAPI } from "../../../services/dosenAPI";
import TambahDosen from "./TambahDosen";
import EditDosen from "./EditDosen"; 
import Loading from "../../../components/admin/Loading";

const MasterDosen = () => {
  const [dataDosen, setDataDosen] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cari, setCari] = useState("");
  const [filterProdi, setFilterProdi] = useState("Semua Program Studi");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [pesanEror, setPesanEror] = useState("");

  const [isTambahTerbuka, setIsTambahTerbuka] = useState(false);
  const [dropdownAktif, setDropdownAktif] = useState(null); 
  const [dataTerpilih, setDataTerpilih] = useState(null);   
  const [isEditTerbuka, setIsEditTerbuka] = useState(false);
  const [isHapusTerbuka, setIsHapusTerbuka] = useState(false);

  const muatDataDosenDariDatabase = async () => {
    try {
      setIsLoading(true);
      setPesanEror("");
      const data = await dosenAPI.fetchDosen();
      
      let dataTerurut = [];
      if (data && Array.isArray(data)) {
        dataTerurut = [...data].sort((a, b) => {
          const namaA = (a.nama || "").toUpperCase();
          const namaB = (b.nama || "").toUpperCase();
          return namaA.localeCompare(namaB);
        });
      }

      setDataDosen(dataTerurut);
    } catch (error) {
      console.error("Gagal memuat data dosen:", error);
      setPesanEror("Gagal mengambil data dosen dari server Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    muatDataDosenDariDatabase();
  }, []);

  const tanganiTambahDosenLokal = () => {
    muatDataDosenDariDatabase();
  };

  const tanganiEditDosenLokal = () => {
    muatDataDosenDariDatabase();
  };

  const tanganiHapusDosenLokal = async () => {
    if (!dataTerpilih) return;
    try {
      await dosenAPI.deleteDosen(dataTerpilih.nidn);
      setIsHapusTerbuka(false);
      setDataTerpilih(null);
      muatDataDosenDariDatabase();
    } catch (error) {
      console.error("Error deleting data:", error);
      alert(error.message || "Gagal menghapus data dosen di server.");
    }
  };

  const dosenTerfilter = dataDosen.filter((dsn) => {
    const namaDsn = dsn?.nama ? dsn.nama.toLowerCase() : "";
    const nidnDsn = dsn?.nidn ? dsn.nidn.toLowerCase() : "";
    
    const cocokCari = namaDsn.includes(cari.toLowerCase()) || nidnDsn.includes(cari.toLowerCase());
    const cocokProdi = filterProdi === "Semua Program Studi" || dsn.program_studi === filterProdi;
    const cocokStatus = filterStatus === "Semua Status" || dsn.status === filterStatus;
    
    return cocokCari && cocokProdi && cocokStatus;
  });

  return (
    <div className="flex flex-col gap-5 p-6 bg-gray-50/50 min-h-screen font-sans relative">
      
      {/* 1. FILTER BAR */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau NIDN..."
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs bg-gray-50 focus:outline-none focus:border-slate-400 transition"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto justify-end">
          <select 
            value={filterProdi}
            onChange={(e) => setFilterProdi(e.target.value)}
            className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 font-medium cursor-pointer max-w-xs truncate focus:outline-none"
          >
            <option>Semua Program Studi</option>
            <option>D4 Pengolahan dan Penyimpanan Hasil Perikanan</option>
            <option>D3 Perikanan Tangkap</option>
            <option>D3 Budi Daya Ikan</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 font-medium cursor-pointer focus:outline-none"
          >
            <option>Semua Status</option>
            <option>Aktif</option>
            <option>Nonaktif</option>
          </select>

          <button 
            type="button"
            onClick={() => setIsTambahTerbuka(true)} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1a3a6b] text-white rounded-lg px-4 py-1.5 hover:bg-[#244b86] transition font-medium text-xs shadow-sm cursor-pointer shrink-0"
          >
            <FiPlus size={13} />
            <span>Tambah Dosen</span>
          </button>
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
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left">NIDN</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left">Nama Lengkap</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left">Program Studi</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left">Email Resmi</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left">Status</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-gray-400">
                    <Loading/>
                  </td>
                </tr>
              ) : dosenTerfilter.length > 0 ? (
                dosenTerfilter.map((dsn, idx) => (
                  <tr key={dsn.nidn} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-[12px] text-gray-400 font-bold">{dsn.nidn}</td>
                    <td className="px-4 py-3 text-[13px] font-bold text-slate-800 uppercase">{dsn.nama}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-500 font-medium">{dsn.program_studi}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-500 font-medium">
                      <span className="text-gray-400 mr-1.5"></span>{dsn.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border inline-block leading-none ${
                        dsn.status === "Aktif" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {dsn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center relative overflow-visible">
                      <button 
                        type="button"
                        onClick={() => setDropdownAktif(dropdownAktif === idx ? null : idx)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition cursor-pointer"
                      >
                        <FiMoreHorizontal className="text-sm" />
                      </button>

                      {dropdownAktif === idx && (
                        <div className="absolute right-12 top-1.5 w-28 bg-white border border-gray-200 shadow-xl rounded-lg p-1 z-50 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setDataTerpilih(dsn);
                              setIsEditTerbuka(true);
                              setDropdownAktif(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-gray-50 rounded-md transition cursor-pointer"
                          >
                            <FiEdit2 className="text-gray-400 text-xs" />
                            <span>Edit Data</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDataTerpilih(dsn);
                              setIsHapusTerbuka(true);
                              setDropdownAktif(null);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                          >
                            <FiTrash2 className="text-red-400 text-xs" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-gray-400 text-xs font-medium">
                    Data dosen tidak ditemukan di database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL & POPUP */}
      <TambahDosen 
        isTambahTerbuka={isTambahTerbuka} 
        setIsTambahTerbuka={setIsTambahTerbuka} 
        onSuksesSimpan={tanganiTambahDosenLokal} 
      />

      <EditDosen
        isEditTerbuka={isEditTerbuka}
        setIsEditTerbuka={setIsEditTerbuka}
        dataTerpilih={dataTerpilih}
        onSuksesEdit={tanganiEditDosenLokal}
      />

      {isHapusTerbuka && dataTerpilih && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[99999]">
          <div className="bg-white rounded-xl border border-gray-200 max-w-sm w-full p-5 text-center shadow-2xl animate-fadeIn">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3 text-red-600">
              <FiAlertTriangle className="text-lg" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Konfirmasi Hapus Data</h3>
            <p className="text-[11.5px] text-gray-500 mt-1.5 leading-relaxed">
              Apakah Anda yakin menghapus berkas dosen <strong className="text-gray-800 font-bold">{dataTerpilih.nama}</strong> ({dataTerpilih.nidn})? Tindakan ini bersifat permanen.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-5">
              <button 
                type="button" 
                onClick={() => setIsHapusTerbuka(false)} 
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold py-2 rounded-lg transition border border-gray-200 cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={tanganiHapusDosenLokal}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg transition shadow-sm cursor-pointer"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDosen;