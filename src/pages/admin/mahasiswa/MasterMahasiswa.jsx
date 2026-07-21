import React, { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiMoreHorizontal, FiEdit2, FiTrash2, FiChevronDown } from "react-icons/fi";
import { mahasiswaAPI } from "../../../services/mahasiswaAPI.js";
import TambahMahasiswa from "./TambahMahasiswa";
import EditMahasiswa from "./EditMahasiswa";
import Loading from "../../../components/admin/Loading.jsx";
import Swal from 'sweetalert2';

const MasterMahasiswa = () => {
  const [dataMhs, setDataMhs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cari, setCari] = useState("");
  const [filterProdi, setFilterProdi] = useState("Semua Program Studi");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  const [isTambahTerbuka, setIsTambahTerbuka] = useState(false);

  const [dataTerpilih, setDataTerpilih] = useState(null);
  const [isEditTerbuka, setIsEditTerbuka] = useState(false);

  const ambilDataMahasiswa = async () => {
    try {
      setLoading(true);
      const data = await mahasiswaAPI.fetchMahasiswa();
      
      let dataTerurut = [];
      if (data && Array.isArray(data)) {
        dataTerurut = [...data].sort((a, b) => {
          const namaA = (a.nama || "").toUpperCase();
          const namaB = (b.nama || "").toUpperCase();
          return namaA.localeCompare(namaB);
        });
      }
      
      setDataMhs(dataTerurut);
    } catch (error) {
      console.error("Error fetching data:", error);

      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Data',
        text: error.response?.data?.message || error.message,
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#d33',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilDataMahasiswa();
  }, []);

  const tanganiTambahMhsLokal = () => {
    ambilDataMahasiswa();
  };

  const tanganiEditMhsLokal = () => {
    ambilDataMahasiswa();
  };

  const tanganiHapusMhsDatabase = async (mhs) => {
    const hasilKonfirmasi = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: `Data mahasiswa ${mhs?.nama || ''} (${mhs?.id_mahasiswa || ''}) akan dihapus secara permanen!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (!hasilKonfirmasi.isConfirmed) return;

    try {
      await mahasiswaAPI.deleteMahasiswa(mhs.id_mahasiswa);
      
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data mahasiswa berhasil dihapus.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
      });

      ambilDataMahasiswa();
    } catch (error) {
      console.error("Error deleting data:", error);

      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: error.response?.data?.message || error.message,
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#d33',
      });
    }
  };

  // Logika Penyaringan Data
  const dataTerfilter = dataMhs.filter((mhs) => {
    const namaMhs = mhs?.nama ? mhs.nama.toLowerCase() : "";
    const idMhs = mhs?.id_mahasiswa ? mhs.id_mahasiswa.toLowerCase() : "";
    
    const cocokCari = namaMhs.includes(cari.toLowerCase()) || idMhs.includes(cari.toLowerCase());
    const cocokProdi = filterProdi === "Semua Program Studi" || mhs.program_studi === filterProdi;
    const cocokStatus = filterStatus === "Semua Status" || mhs.status === filterStatus;
    
    return cocokCari && cocokProdi && cocokStatus;
  });

  return (
    <div className="flex flex-col gap-5 p-6 bg-gray-50/50 min-h-screen font-sans animate-fadeIn">
      
      {/* 1. FILTER BAR */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau NIM..."
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1a3a6b] text-white rounded-lg px-4 py-1.5 hover:bg-[#244b86] transition font-medium text-xs shadow-xs cursor-pointer shrink-0"
          >
            <FiPlus size={13} />
            <span>Tambah Mahasiswa</span>
          </button>
        </div>
      </div>

      {/* 2. TABEL DATA */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex-1">
        <div className="overflow-x-auto rounded-lg border border-gray-100 min-h-[300px]">
          <table className="table w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-400">
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left bg-transparent">ID Mahasiswa</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left bg-transparent">Nama</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left bg-transparent">Prodi</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left bg-transparent">Kelas</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left bg-transparent">Angkatan</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-left bg-transparent">Status</th>
                <th className="text-[11px] font-semibold uppercase tracking-wider px-4 py-2.5 text-center w-24 bg-transparent">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-400">
                    <div className="flex justify-center items-center w-full py-4">
                      <Loading />
                    </div>
                  </td>
                </tr>
              ) : dataTerfilter.length > 0 ? (
                dataTerfilter.map((mhs) => (
                  <tr key={mhs.id_mahasiswa} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-[12px] text-gray-400 font-bold border-b border-gray-50">{mhs.id_mahasiswa}</td>
                    <td className="px-4 py-3 text-[13px] font-bold text-slate-800 uppercase border-b border-gray-50">{mhs.nama}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-500 font-medium border-b border-gray-50">{mhs.program_studi}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-500 font-semibold border-b border-gray-50">{mhs.kelas?.nama_kelas || "-"}</td>
                    <td className="px-4 py-3 text-[13px] text-gray-500 font-medium border-b border-gray-50">{mhs.angkatan}</td>
                    <td className="px-4 py-3 border-b border-gray-50">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border inline-block leading-none ${
                        mhs.status === "Aktif" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {mhs.status}
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
                                setDataTerpilih(mhs);
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
                                tanganiHapusMhsDatabase(mhs);
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
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-400 text-xs font-medium">
                    Data mahasiswa tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL & POPUP */}
      <TambahMahasiswa 
        isTambahTerbuka={isTambahTerbuka} 
        setIsTambahTerbuka={setIsTambahTerbuka} 
        onSuksesSimpan={tanganiTambahMhsLokal} 
      />

      <EditMahasiswa 
        isEditTerbuka={isEditTerbuka}
        setIsEditTerbuka={setIsEditTerbuka}
        dataTerpilih={dataTerpilih}
        onSuksesEdit={tanganiEditMhsLokal}
      />
    </div>
  );
};

export default MasterMahasiswa;