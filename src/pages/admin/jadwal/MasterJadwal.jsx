import React, { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiTrash2, FiEdit2, FiCalendar, FiClock, FiMapPin, FiChevronDown } from "react-icons/fi";
import { jadwalAPI } from "../../../services/jadwalAPI";
import BuatJadwalBaru from "./TambahJadwal";
import EditJadwal from "./EditJadwal";
import Loading from "../../../components/admin/Loading";

const MasterJadwal = () => {
  const [dataJadwal, setDataJadwal] = useState([]);
  const [cari, setCari] = useState("");
  const [filterProdi, setFilterProdi] = useState("Semua Program Studi");
  const [isModalTerbuka, setIsModalTerbuka] = useState(false);
  const [isEditTerbuka, setIsEditTerbuka] = useState(false);
  const [jadwalEdit, setJadwalEdit] = useState(null);
  const [jadwalTerpilih, setJadwalTerpilih] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pesanError, setPesanError] = useState("");

  const muatData = async () => {
    setIsLoading(true);
    setPesanError("");
    try {
      const data = await jadwalAPI.fetchJadwal();
      setDataJadwal(data ? [...data].reverse() : []);
    } catch (error) {
      setPesanError("Gagal terhubung dengan server database jadwal.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    muatData();
  }, []);

  const tanganiHapusSatu = async (id) => {
    if (window.confirm("Yakin ingin menghapus jadwal ini?")) {
      try {
        await jadwalAPI.deleteJadwal(id);
        setJadwalTerpilih(jadwalTerpilih.filter(item => item !== id));
        muatData();
        alert("Jadwal perkuliahan berhasil dihapus!");
      } catch (error) {
        console.error("Error network:", error);
        alert("Gagal menghapus jadwal: Terjadi masalah koneksi ke server.");
      }
    }
  };

  const tanganiHapusBanyak = async () => {
    if (window.confirm(`Yakin hapus ${jadwalTerpilih.length} jadwal terpilih?`)) {
      try {
        for (const id of jadwalTerpilih) {
          await jadwalAPI.deleteJadwal(id);
        }
        setJadwalTerpilih([]);
        muatData();
        alert("Semua jadwal terpilih berhasil dihapus!");
      } catch (error) {
        console.error("Error network:", error);
        alert("Beberapa jadwal gagal dihapus akibat gangguan koneksi server.");
      }
    }
  };

  const jadwalTerfilter = dataJadwal.filter((jdl) => {
    const namaMK = jdl?.mata_kuliah?.toLowerCase() || "";
    const dosenMK = jdl?.nidn_dosen?.toLowerCase() || "";
    const kodeMK = jdl?.kode_mk?.toLowerCase() || "";
    const cocokCari = namaMK.includes(cari.toLowerCase()) || dosenMK.includes(cari.toLowerCase()) || kodeMK.includes(cari.toLowerCase());
    
    let cocokProdi = true;
    if (jdl.kode_mk) {
      if (filterProdi === "D4 Pengolahan dan Penyimpanan Hasil Perikanan") cocokProdi = jdl.kode_mk.toUpperCase().startsWith("PPHP");
      else if (filterProdi === "D3 Perikanan Tangkap") cocokProdi = jdl.kode_mk.toUpperCase().startsWith("PTK");
      else if (filterProdi === "D3 Budi Daya Ikan") cocokProdi = jdl.kode_mk.toUpperCase().startsWith("BDI");
    }
    return cocokCari && cocokProdi;
  });

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 bg-slate-50/50 min-h-screen animate-fadeIn font-sans relative">
      
      {/* 1. FILTER BAR */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        
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

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* DROPDOWN FILTER PROGRAM STUDI (DAISYUI) */}
          <div className="dropdown dropdown-bottom w-full sm:w-auto">
            <div 
              tabIndex={0} 
              role="button" 
              className="w-full sm:w-64 border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 font-medium cursor-pointer flex items-center justify-between gap-2 hover:bg-gray-50/50 transition select-none"
            >
              <span className="truncate">
                {filterProdi === "D4 Pengolahan dan Penyimpanan Hasil Perikanan" && "D4 Pengolahan Hasil Perikanan (PPHP)"}
                {filterProdi === "D3 Perikanan Tangkap" && "D3 Perikanan Tangkap (PTK)"}
                {filterProdi === "D3 Budi Daya Ikan" && "D3 Budi Daya Ikan (BDI)"}
                {filterProdi === "Semua Program Studi" && "Semua Program Studi"}
              </span>
              <FiChevronDown className="text-gray-400 shrink-0 text-[10px]" />
            </div>
            <ul 
              tabIndex={0} 
              className="dropdown-content menu p-1.5 shadow-lg bg-white rounded-lg border border-gray-200/80 w-full sm:w-64 gap-0.5 z-[100] mt-1 text-slate-700 font-sans"
            >
              {[
                { value: "Semua Program Studi", label: "Semua Program Studi" },
                { value: "D4 Pengolahan dan Penyimpanan Hasil Perikanan", label: "D4 Pengolahan Hasil Perikanan (PPHP)" },
                { value: "D3 Perikanan Tangkap", label: "D3 Perikanan Tangkap (PTK)" },
                { value: "D3 Budi Daya Ikan", label: "D3 Budi Daya Ikan (BDI)" }
              ].map((prodi) => (
                <li key={prodi.value}>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterProdi(prodi.value);
                      if (document.activeElement) document.activeElement.blur();
                    }}
                    className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md block text-left w-full transition ${
                      filterProdi === prodi.value ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : "hover:bg-gray-100 text-slate-700"
                    }`}
                  >
                    {prodi.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {jadwalTerpilih.length > 0 && (
            <button 
              type="button"
              onClick={tanganiHapusBanyak} 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 text-white rounded-lg px-4 py-1.5 hover:bg-red-700 transition font-bold text-xs shadow-sm cursor-pointer shrink-0"
            >
              <FiTrash2 size={13} /> 
              <span>Hapus ({jadwalTerpilih.length})</span>
            </button>
          )}

          <button 
            type="button"
            onClick={() => setIsModalTerbuka(true)} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1a3a6b] text-white rounded-lg px-4 py-1.5 hover:bg-[#244b86] transition font-bold text-xs shadow-sm cursor-pointer shrink-0 whitespace-nowrap"
          >
            <FiPlus size={13} /> 
            <span>Buat Jadwal</span>
          </button>
        </div>
      </div>

      {/* 2. AREA KONTEN */}
      {pesanError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
          {pesanError}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 flex justify-center items-center shadow-sm">
          <Loading />
        </div>
      ) : jadwalTerfilter.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-xs font-medium text-gray-400 shadow-sm">
          Tidak ada jadwal kuliah yang cocok dengan kriteria pencarian.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jadwalTerfilter.map((jdl) => (
            <div key={jdl.id_jadwal} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm relative flex flex-col justify-between hover:border-slate-300 transition-all">
              <input 
                type="checkbox" 
                className="absolute top-5 right-5 w-3.5 h-3.5 cursor-pointer z-10 accent-[#1a3a6b]"
                checked={jadwalTerpilih.includes(jdl.id_jadwal)}
                onChange={(e) => {
                  if (e.target.checked) setJadwalTerpilih([...jadwalTerpilih, jdl.id_jadwal]);
                  else setJadwalTerpilih(jadwalTerpilih.filter(id => id !== jdl.id_jadwal));
                }}
              />
              
              <div>
                <div className="flex justify-between items-center pr-8">
                  <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded border border-slate-900 uppercase leading-none">{jdl.kelas || "Reguler"}</span>
                  <span className="text-[10px] text-slate-500 font-bold uppercase bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-md truncate max-w-[130px]">
                    {jdl.kode_mk || "MK"} • {jdl.sks || "0"} SKS
                  </span>
                </div>
                
                <h4 className="text-[13px] font-bold text-slate-800 uppercase mt-4 pr-8 line-clamp-2 min-h-[40px] flex items-center leading-snug">{jdl.mata_kuliah}</h4>
                <p className="text-xs font-semibold text-gray-400 mt-1">NIDN: <span className="font-mono text-gray-600 font-bold">{jdl.nidn_dosen || "-"}</span></p>
                
                <div className="pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-2 mt-4">
                  <div className="flex items-center gap-2.5 text-gray-500 font-medium">
                    <FiCalendar className="text-gray-400 text-xs" /> <span className="text-[12px]">{jdl.hari}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-500 font-medium">
                    <FiClock className="text-gray-400 text-xs" /> <span className="text-[12px]">{jdl.jam_mulai?.substring(0, 5)} - {jdl.jam_selesai?.substring(0, 5)} WIB</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-500 font-medium">
                    <FiMapPin className="text-gray-400 text-xs" /> <span className="text-[12px] truncate">{jdl.ruangan}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex gap-2">
                <button 
                  type="button"
                  onClick={() => { setJadwalEdit(jdl); setIsEditTerbuka(true); }} 
                  className="flex-1 text-[11px] bg-slate-50 text-slate-600 font-bold py-1.5 rounded-lg hover:bg-gray-100 border border-gray-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FiEdit2 size={12} className="text-gray-400" /> <span>Edit</span>
                </button>
                <button 
                  type="button"
                  onClick={() => tanganiHapusSatu(jdl.id_jadwal)} 
                  className="flex-1 text-[11px] bg-red-50 text-red-600 font-bold py-1.5 rounded-lg hover:bg-red-100/70 border border-red-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FiTrash2 size={12} className="text-red-400" /> <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OVERLAY MODALS */}
      <BuatJadwalBaru isModalTerbuka={isModalTerbuka} setIsModalTerbuka={setIsModalTerbuka} onSuksesSimpan={() => { muatData(); alert("Jadwal perkuliahan baru berhasil ditambahkan!"); }} />
      <EditJadwal isEditTerbuka={isEditTerbuka} setIsEditTerbuka={setIsEditTerbuka} dataEdit={jadwalEdit} onSuksesEdit={() => { muatData(); alert("Perubahan data jadwal berhasil diperbarui!"); }} />
    </div>
  );
};

export default MasterJadwal;