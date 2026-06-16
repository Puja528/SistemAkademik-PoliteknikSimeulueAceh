import React, { useState, useEffect } from "react";
// Impor ikon lengkap termasuk alternatif aman agar bebas dari error ekspor Vite
import { AiOutlineSearch, AiOutlinePlus, AiOutlineMore, AiOutlineEdit, AiOutlineDelete, AiOutlineWarning } from "react-icons/ai";
import { dosenAPI } from "../../../services/dosenAPI"; // IMPOR API DOSEN YANG SUDAH KITA BUAT
import TambahDosen from "./TambahDosen";
import EditDosen from "./EditDosen"; 

const MasterDosen = () => {
  // BERSIHKAN DATA LOKAL: Ganti inisialisasi awal ke array kosong
  const [dataDosen, setDataDosen] = useState([]);
  const [cari, setCari] = useState("");
  const [filterProdi, setFilterProdi] = useState("Semua Program Studi");
  const [filterStatus, setFilterStatus] = useState("Semua Status");
  
  // STATE BARU: Untuk indikator pemuatan data dan penanganan eror
  const [isLoading, setIsLoading] = useState(true);
  const [pesanEror, setPesanEror] = useState("");

  const [isTambahTerbuka, setIsTambahTerbuka] = useState(false);
  const [dropdownAktif, setDropdownAktif] = useState(null); 
  const [dataTerpilih, setDataTerpilih] = useState(null);   
  const [isEditTerbuka, setIsEditTerbuka] = useState(false);
  const [isHapusTerbuka, setIsHapusTerbuka] = useState(false);

  // ==========================================
  // 1. FUNGSI MEMBACA DATA (READ FROM DATABASE)
  // ==========================================
  const muatDataDosenDariDatabase = async () => {
    setIsLoading(true);
    setPesanEror("");
    try {
      const data = await dosenAPI.fetchDosen();
      setDataDosen(data);
    } catch (error) {
      console.error("Gagal memuat data dosen:", error);
      setPesanEror("Gagal mengambil data dosen dari server Supabase.");
    } finally {
      setIsLoading(false);
    }
  };

  // Jalankan penarikan data secara otomatis saat komponen pertama kali di-mount
  useEffect(() => {
    muatDataDosenDariDatabase();
  }, []);

  // ==========================================
  // 2. FUNGSI TAMBAH DATA (CREATE SINKRON)
  // ==========================================
  const tanganiTambahDosenLokal = (dosenBaru) => {
    // Parameter dosenBaru didapatkan setelah form modal TambahDosen sukses mengirim data ke database
    setDataDosen([dosenBaru, ...dataDosen]);
  };

  // ==========================================
  // 3. FUNGSI EDIT DATA (UPDATE SINKRON)
  // ==========================================
  const tanganiEditDosenLokal = (dataTerupdate) => {
    const hasilUpdate = dataDosen.map((dsn) =>
      dsn.nidn === dataTerupdate.nidn ? dataTerupdate : dsn
    );
    setDataDosen(hasilUpdate);
  };

  // ==========================================
  // 4. FUNGSI HAPUS DATA (DELETE FROM DATABASE)
  // ==========================================
  const tanganiHapusDosenLokal = async () => {
    if (!dataTerpilih) return;
    
    try {
      // Eksekusi penghapusan di server Supabase berdasarkan NIDN
      await dosenAPI.deleteDosen(dataTerpilih.nidn);
      
      // Update tampilan UI jika sukses terhapus di server
      const dataSisa = dataDosen.filter((dsn) => dsn.nidn !== dataTerpilih.nidn);
      setDataDosen(dataSisa);
      setIsHapusTerbuka(false);
      alert(`Berhasil menghapus berkas dosen: ${dataTerpilih.nama}`);
    } catch (error) {
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
    <div className="max-w-[1600px] mx-auto space-y-6 animate-fadeIn relative">
      
      {/* Judul Mobile (Hanya muncul di layar hp) */}
      <div className="flex justify-between items-center md:hidden">
        <h2 className="text-xl font-bold text-slate-900">Data Dosen</h2>
      </div>

      {/* AREA FILTER UTAMA */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Input Pencarian */}
        <div className="relative w-full md:w-96">
          <AiOutlineSearch className="absolute left-4 top-3.5 text-slate-400 text-lg" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau NIDN..."
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            className="w-full bg-slate-50 text-xs font-medium pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-black transition"
          />
        </div>

        {/* Dropdown Filter & Tombol Tambah */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto justify-end">
          
          <select 
            value={filterProdi}
            onChange={(e) => setFilterProdi(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 focus:outline-none max-w-xs truncate cursor-pointer"
          >
            <option>Semua Program Studi</option>
            <option>D4 Pengolahan dan Penyimpanan Hasil Perikanan</option>
            <option>D3 Perikanan Tangkap</option>
            <option>D3 Budi Daya Ikan</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 text-xs font-semibold px-4 py-3 rounded-xl border border-slate-200 focus:outline-none cursor-pointer"
          >
            <option>Semua Status</option>
            <option>Aktif</option>
            <option>Nonaktif</option>
          </select>

          <button 
            type="button"
            onClick={() => setIsTambahTerbuka(true)} 
            className="w-full sm:w-auto bg-black text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-sm shrink-0"
          >
            <AiOutlinePlus className="text-sm" />
            <span>Tambah Dosen</span>
          </button>

        </div>
      </div>

      {/* AREA TABEL UTAMA */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-visible">
        
        {/* ELEMEN KRITIS: TAMPILKAN EROR JIKA KONEKSI SUPABASE GAGAL */}
        {pesanEror && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
            {pesanEror}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">NIDN</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Program Studi</th>
                <th className="px-6 py-4">Email Resmi</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              
              {/* LAYOUT KONDISIONAL: JIKA SEDANG MEMUAT DATA DARI SERVER */}
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-bold bg-slate-50/10 tracking-wider">
                    Menghubungkan ke Database Supabase...
                  </td>
                </tr>
              ) : dosenTerfilter.length > 0 ? (
                dosenTerfilter.map((dsn, idx) => (
                  <tr key={dsn.nidn} className="hover:bg-slate-50/40 transition">
                    <td className="px-6 py-4.5 font-bold text-sm font-medium text-slate-900">{dsn.nidn}</td>
                    <td className="px-6 py-4.5 text-sm font-medium text-slate-900">{dsn.nama}</td>
                    <td className="px-6 py-4.5 text-sm font-normal text-slate-500">{dsn.program_studi}</td>
                    <td className="px-6 py-4.5 text-sm font-normal text-slate-500">
                      <span className="text-slate-400 mr-1.5">✉</span>{dsn.email}
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-md inline-block leading-none ${
                        dsn.status === "Aktif" 
                          ? "bg-slate-900 text-white" 
                          : "bg-slate-100 text-slate-400"
                      }`}>
                        {dsn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-center relative overflow-visible">
                      <button 
                        type="button" 
                        onClick={() => setDropdownAktif(dropdownAktif === idx ? null : idx)}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition"
                      >
                        <AiOutlineMore className="text-lg" />
                      </button>

                      {/* POPUP MENU MELAYANG AKSI DOSEN */}
                      {dropdownAktif === idx && (
                        <div className="absolute right-14 top-2 w-32 bg-white border border-slate-200/80 shadow-xl rounded-xl p-1 z-50 text-left animate-fadeIn">
                          <button
                            type="button"
                            onClick={() => {
                              setDataTerpilih(dsn);
                              setIsEditTerbuka(true);
                              setDropdownAktif(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition"
                          >
                            <AiOutlineEdit className="text-slate-500 text-sm" />
                            <span>Edit Data</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDataTerpilih(dsn);
                              setIsHapusTerbuka(true);
                              setDropdownAktif(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <AiOutlineDelete className="text-rose-500 text-sm" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-semibold bg-slate-50/20">
                    Data dosen tidak ditemukan di database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COMPONENT MODAL FORM TAMBAH */}
      <TambahDosen 
        isTambahTerbuka={isTambahTerbuka} 
        setIsTambahTerbuka={setIsTambahTerbuka} 
        onSuksesSimpan={tanganiTambahDosenLokal} 
      />

      {/* COMPONENT MODAL FORM EDIT */}
      <EditDosen
        isEditTerbuka={isEditTerbuka}
        setIsEditTerbuka={setIsEditTerbuka}
        dataTerpilih={dataTerpilih}
        onSuksesEdit={tanganiEditDosenLokal}
      />

      {/* DIALOG POPUP KONFIRMASI HAPUS DATA DOSEN */}
      {isHapusTerbuka && dataTerpilih && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-100 max-w-md w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4 text-rose-600">
              <AiOutlineWarning className="text-2xl" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Konfirmasi Hapus Dosen</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus berkas dosen <strong className="text-slate-900 font-semibold">{dataTerpilih.nama}</strong> ({dataTerpilih.nidn})? Tindakan ini bersifat permanen.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button 
                type="button" 
                onClick={() => setIsHapusTerbuka(false)} 
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={tanganiHapusDosenLokal} 
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-xl transition"
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