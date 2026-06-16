import React, { useState, useEffect } from "react";
// DISESUAIKAN: Menggunakan baris impor ikon eksklusif milikmu
import { AiOutlineSearch, AiOutlinePlus, AiOutlineCalendar, AiOutlineClockCircle, AiOutlineEnvironment } from "react-icons/ai";
import { jadwalAPI } from "../../../services/jadwalAPI"; // INTEGRASI: Import service API terbaru
import BuatJadwalBaru from "./BuatJadwalBaru";

const OperasiAkademik = () => {
  // MENGGUNAKAN DATABASE: Inisialisasi awal diganti ke array kosong
  const [dataJadwal, setDataJadwal] = useState([]);
  const [cari, setCari] = useState("");
  const [filterProdi, setFilterProdi] = useState("Semua Program Studi");
  const [isModalTerbuka, setIsModalTerbuka] = useState(false);

  // STATE BARU: Indikator loading sinkronisasi database dan penanganan error
  const [isLoading, setIsLoading] = useState(true);
  const [pesanError, setPesanError] = useState("");

  // ==========================================
  // 1. FUNGSI MEMBACA DATA DARI SUPABASE (READ)
  // ==========================================
  const muatDataJadwalDariDatabase = async () => {
    setIsLoading(true);
    setPesanError("");
    try {
      const data = await jadwalAPI.fetchJadwal();
      setDataJadwal(data || []);
    } catch (error) {
      console.error("Gagal memuat jadwal:", error);
      setPesanError("Gagal terhubung dengan server database jadwal.");
    } finally {
      setIsLoading(false);
    }
  };

  // Jalankan penarikan data cloud secara otomatis saat halaman dibuka
  useEffect(() => {
    muatDataJadwalDariDatabase();
  }, []);

  // ==========================================
  // 2. FUNGSI TAMBAH DATA REAKTIF UI (CREATE)
  // ==========================================
  const tanganiJadwalBaruLokal = (jadwalBaru) => {
    setDataJadwal([jadwalBaru, ...dataJadwal]);
  };

  // ==========================================
  // 3. LOGIKA FILTER PENCARIAN & PRODI
  // ==========================================
  const jadwalTerfilter = dataJadwal.filter((jdl) => {
    // SINKRONISASI: Menyesuaikan dengan nama atribut/kolom tabel di database Supabase
    const namaMK = jdl?.mata_kuliah ? jdl.mata_kuliah.toLowerCase() : "";
    const dosenMK = jdl?.nidn_dosen ? jdl.nidn_dosen.toLowerCase() : "";
    const kodeMK = jdl?.kode_mk ? jdl.kode_mk.toLowerCase() : "";
    
    const cocokCari = namaMK.includes(cari.toLowerCase()) || 
                      dosenMK.includes(cari.toLowerCase()) || 
                      kodeMK.includes(cari.toLowerCase());

    let cocokProdi = true;
    if (jdl.kode_mk) {
      if (filterProdi === "D4 Pengolahan dan Penyimpanan Hasil Perikanan") {
        cocokProdi = jdl.kode_mk.toUpperCase().startsWith("PPHP");
      } else if (filterProdi === "D3 Perikanan Tangkap") {
        cocokProdi = jdl.kode_mk.toUpperCase().startsWith("PTK");
      } else if (filterProdi === "D3 Budi Daya Ikan") {
        cocokProdi = jdl.kode_mk.toUpperCase().startsWith("BDI");
      }
    }

    return cocokCari && cocokProdi;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-fadeIn">
      
      {/* FILTER PANEL */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        <div className="relative w-full md:w-96">
          <AiOutlineSearch className="absolute left-4 top-3.5 text-slate-400 text-lg" />
          <input
            type="text"
            placeholder="Cari berdasarkan mata kuliah, kode, atau NIDN dosen..."
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            className="w-full bg-slate-50 text-xs font-medium pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-black transition"
          />
        </div>

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

          <button 
            type="button"
            onClick={() => setIsModalTerbuka(true)} 
            className="w-full sm:w-auto bg-black text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-sm shrink-0"
          >
            <AiOutlinePlus className="text-sm" />
            <span>Buat Jadwal Baru</span>
          </button>

        </div>
      </div>

      {/* BANNER NOTIFIKASI ERROR SERVER */}
      {pesanError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl">
          {pesanError}
        </div>
      )}

      {/* GRID KARTU JADWAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full bg-white border border-slate-200/60 rounded-2xl py-12 text-center text-slate-400 font-bold tracking-wider shadow-sm animate-pulse">
            Sinkronisasi Jadwal dengan Supabase...
          </div>
        ) : jadwalTerfilter.length > 0 ? (
          jadwalTerfilter.map((jdl) => (
            <div key={jdl.id_jadwal} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
              
              <div className="flex justify-between items-start">
                <span className="bg-slate-900 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md tracking-wider">
                  {jdl.kelas || "Reguler"}
                </span>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                  {jdl.kode_mk || "MK"} • {jdl.sks || "0"} SKS
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{jdl.mata_kuliah}</h4>
                <p className="text-xs font-medium text-slate-400 mt-1 truncate">NIDN Pengampu: <span className="text-slate-700 font-semibold">{jdl.nidn_dosen}</span></p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5 font-medium">
                <div className="flex items-center gap-2">
                  <AiOutlineCalendar className="text-slate-400 text-sm" />
                  <span>Hari {jdl.hari}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AiOutlineClockCircle className="text-slate-400 text-sm" />
                  {/* DATA REVISI: Menggabungkan jam_mulai & jam_selesai database dengan pemotongan string detik */}
                  <span>{jdl.jam_mulai?.substring(0, 5)} - {jdl.jam_selesai?.substring(0, 5)} WIB</span>
                </div>
                <div className="flex items-center gap-2">
                  <AiOutlineEnvironment className="text-slate-400 text-sm" />
                  <span className="text-slate-800 font-semibold truncate">{jdl.ruangan}</span>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full bg-white border border-slate-200/60 rounded-2xl py-12 text-center text-slate-400 font-semibold shadow-sm">
            Tidak ada jadwal perkuliahan yang ditemukan di cloud server.
          </div>
        )}
      </div>

      <BuatJadwalBaru 
        isModalTerbuka={isModalTerbuka}
        setIsModalTerbuka={setIsModalTerbuka}
        onSuksesSimpan={tanganiJadwalBaruLokal}
      />

    </div>
  );
};

export default OperasiAkademik;