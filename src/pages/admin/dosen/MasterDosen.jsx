import React, { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiMoreHorizontal, FiEdit2, FiTrash2, FiAlertTriangle, FiChevronDown } from "react-icons/fi";
import { dosenAPI } from "../../../services/dosenAPI";
import TambahDosen from "./TambahDosen";
import EditDosen from "./EditDosen"; 
import Loading from "../../../components/admin/Loading";
import { dashboardAPI } from "../../../services/dashboardAdminAPI";

const MasterDosen = () => {
  const [dataDosen, setDataDosen] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cari, setCari] = useState("");
  const [filterProdi, setFilterProdi] = useState("Semua Program Studi");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [pesanEror, setPesanEror] = useState("");

  const [isTambahTerbuka, setIsTambahTerbuka] = useState(false);
  const [dataTerpilih, setDataTerpilih] = useState(null);   
  const [isEditTerbuka, setIsEditTerbuka] = useState(false);
  const [isHapusTerbuka, setIsHapusTerbuka] = useState(false);

  const getAdminName = () => {
    const localSession = JSON.parse(localStorage.getItem("siakad_session"));
    return localSession?.nama || "staff";
  };

  const muatDataDosenDariDatabase = async () => {
    try {
      setIsLoading(true);
      setPesanEror("");
      const data = await dosenAPI.fetchDosen();
      setDataDosen(data ? [...data].reverse() : []);
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
      await dashboardAPI.logAktivitas(
        "Master Dosen", 
        `Menghapus data dosen: ${dataTerpilih.nama} (NIDN: ${dataTerpilih.nidn})`, 
        "DELETE", 
        getAdminName()
      );
    } catch (logErr) {
      console.error("Gagal mencatat log aktivitas:", logErr);
    }

    setIsHapusTerbuka(false);
    setDataTerpilih(null);
    muatDataDosenDariDatabase();
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
    <div className="flex flex-col gap-5 p-6 bg-gray-50/50 min-h-screen font-sans relative animate-fadeIn">
      
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
          
          {/* DROPDOWN FILTER PROGRAM STUDI */}
          <div className="dropdown dropdown-bottom w-full sm:w-auto">
            <div 
              tabIndex={0} 
              role="button" 
              className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 font-medium cursor-pointer flex items-center justify-between gap-2 hover:bg-gray-50/50 transition select-none"
            >
              <span className="truncate">{filterProdi}</span>
              <FiChevronDown className="text-gray-400 shrink-0 text-[10px]" />
            </div>
            <ul 
              tabIndex={0} 
              className="dropdown-content menu p-1.5 shadow-lg bg-white rounded-lg border border-gray-200/80 w-full sm:w-64 gap-0.5 z-[100] mt-1 text-slate-700 font-sans"
            >
              {["Semua Program Studi", "D4 Pengolahan dan Penyimpanan Hasil Perikanan", "D3 Perikanan Tangkap", "D3 Budi Daya Ikan"].map((prodi) => (
                <li key={prodi}>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterProdi(prodi);
                      if (document.activeElement) document.activeElement.blur();
                    }}
                    className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md block text-left w-full transition ${
                      filterProdi === prodi ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : "hover:bg-gray-100 text-slate-700"
                    }`}
                  >
                    {prodi}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* DROPDOWN FILTER STATUS */}
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
              {["Semua Status", "Aktif", "Nonaktif"].map((status) => (
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

        <div className="overflow-x-auto rounded-lg border border-gray-100 min-h-[300px]">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400">
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left bg-transparent">NIDN</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left bg-transparent">Nama Lengkap</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left bg-transparent">Program Studi</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left bg-transparent">Email Resmi</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left bg-transparent">Status</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-center w-24 bg-transparent">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-400">
                    <div className="flex justify-center items-center w-full py-4">
                      <Loading />
                    </div>
                  </td>
                </tr>
              ) : dosenTerfilter.length > 0 ? (
                dosenTerfilter.map((dsn) => (
                  <tr key={dsn.nidn} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-[12px] text-gray-400 font-bold border-b border-gray-50">{dsn.nidn}</td>
                    <td className="px-4 py-3 text-[13px] font-bold text-slate-800 uppercase border-b border-gray-50">{dsn.nama}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-500 font-medium border-b border-gray-50">{dsn.program_studi}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-500 font-medium border-b border-gray-50">{dsn.email}</td>
                    <td className="px-4 py-3 border-b border-gray-50">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border inline-block leading-none ${
                        dsn.status === "Aktif" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {dsn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center !overflow-visible border-b border-gray-50">
                      
                      {/* DROPDOWN AKSI */}
                      <div className="dropdown dropdown-bottom dropdown-end inline-block">
                        <div 
                          tabIndex={0} 
                          role="button" 
                          className="btn btn-outline btn-xs p-1 text-gray-400 border-none bg-transparent hover:bg-gray-100 hover:text-gray-600 transition h-auto min-h-0 rounded-md cursor-pointer flex items-center justify-center"
                        >
                          <FiMoreHorizontal className="text-sm" />
                        </div>
                        <ul 
                          tabIndex={0} 
                          className="dropdown-content menu p-1.5 shadow-lg bg-white rounded-lg border border-gray-200/80 w-28 gap-0.5 z-[100] mt-1 text-slate-700 font-sans"
                        >
                          <li>
                            <button
                              type="button"
                              onClick={() => {
                                setDataTerpilih(dsn);
                                setIsEditTerbuka(true);
                                if (document.activeElement) document.activeElement.blur();
                              }}
                              className="px-2.5 py-1.5 text-[11px] font-bold rounded-md flex items-center gap-2 hover:bg-gray-100 text-slate-700 transition"
                            >
                              <FiEdit2 className="text-gray-400 text-xs" />
                              <span>Edit Data</span>
                            </button>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() => {
                                setDataTerpilih(dsn);
                                setIsHapusTerbuka(true);
                                if (document.activeElement) document.activeElement.blur();
                              }}
                              className="px-2.5 py-1.5 text-[11px] font-bold rounded-md flex items-center gap-2 hover:bg-red-50 text-red-600 transition"
                            >
                              <FiTrash2 className="text-red-400 text-xs" />
                              <span>Hapus</span>
                            </button>
                          </li>
                        </ul>
                      </div>

                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-gray-400 text-xs font-medium">
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
          <div className="bg-white rounded-xl border border-gray-200 max-w-sm w-full p-5 text-center shadow-2xl animate-scaleUp">
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