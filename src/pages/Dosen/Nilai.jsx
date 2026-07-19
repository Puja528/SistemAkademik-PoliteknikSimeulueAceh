import React, { useState, useEffect } from "react";
import { FiSearch, FiUser, FiAlertCircle, FiEdit2, FiChevronDown } from "react-icons/fi";
import { nilaiAPI } from "../../services/nilaiAPI";
import { jadwalAPI } from "../../services/jadwalAPI";
import { dosenAPI } from "../../services/dosenAPI";
import axios from "axios"; 
import Loading from "../../components/admin/Loading";

export default function Nilai() {
  const [daftarJadwal, setDaftarJadwal] = useState([]);
  const [idJadwalTerpilih, setIdJadwalTerpilih] = useState("");
  const [daftarMahasiswa, setDaftarMahasiswa] = useState([]);
  const [jadwalDetail, setJadwalDetail] = useState(null);
  const [barisAktif, setBarisAktif] = useState(null); 
  const [adaPerubahanBaru, setAdaPerubahanBaru] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const bobotPenilaian = { tugas: 30, uts: 30, uas: 40 };

  // 1. Ambil Data Jadwal Dosen
  useEffect(() => {
    const muatAwalJadwalDosen = async () => {
      try {
        const localSession = localStorage.getItem("siakad_session");
        if (!localSession) return;
        const dataUserLogin = JSON.parse(localSession);

        const dosenReal = await dosenAPI.fetchDosenByUserId(dataUserLogin.id);
        if (!dosenReal) return;

        const semuaJadwal = await jadwalAPI.fetchJadwal();
        const jadwalSaya = semuaJadwal.filter(j => j.nidn_dosen === dosenReal.nidn);
        setDaftarJadwal(jadwalSaya);

        if (jadwalSaya.length > 0) {
          const jadwalBudiDaya = jadwalSaya.find(j => 
            j.mata_kuliah.toLowerCase().includes("budi daya laut") || 
            j.mata_kuliah.toLowerCase().includes("budidaya laut")
          );

          const jadwalDefault = jadwalBudiDaya || jadwalSaya[0];
          setIdJadwalTerpilih(jadwalDefault.id_jadwal);
          setJadwalDetail(jadwalDefault);
        }
      } catch (error) {
        console.error("Gagal muat jadwal:", error);
      }
    };
    muatAwalJadwalDosen();
  }, []);

  useEffect(() => {
    if (jadwalDetail) {
      muatLembarNilaiMahasiswa();
    }
  }, [jadwalDetail]);

  const muatLembarNilaiMahasiswa = async () => {
    if (!idJadwalTerpilih || !jadwalDetail) return;
    setIsLoading(true);
    try {
      const nilaiTersimpan = await nilaiAPI.fetchDetailNilaiMahasiswa(idJadwalTerpilih);
      const targetKelasId = parseInt(jadwalDetail.id_kelas);

      const resMhs = await axios.get(`https://mwkewvjpgcvlwgycdpvo.supabase.co/rest/v1/mahasiswa`, {
        params: { id_kelas: `eq.${targetKelasId}` },
        headers: {
          apikey: "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK",
          Authorization: "Bearer sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK"
        }
      });

      const masterMhs = resMhs.data || [];
      const lembarKerja = masterMhs.map((mhs, idx) => {
        const matchNilai = nilaiTersimpan.find(n => n.id_mahasiswa === mhs.id_mahasiswa);
        return {
          no: idx + 1,
          id_mahasiswa: mhs.id_mahasiswa,
          nama: mhs.nama,
          tugas: matchNilai ? matchNilai.nilai_tugas : 0,
          uts: matchNilai ? matchNilai.nilai_uts : 0,
          uas: matchNilai ? matchNilai.nilai_uas : 0,
          akhir: matchNilai ? matchNilai.nilai_akhir : 0,
          huruf: matchNilai ? matchNilai.grade : "E",
          status: matchNilai ? (matchNilai.nilai_akhir >= 60 ? "Lulus" : "Tidak Lulus") : "Tidak Lulus"
        };
      });

      setDaftarMahasiswa(lembarKerja);
      setIsLocked(jadwalDetail?.status_nilai === "Terbit");
      setAdaPerubahanBaru(false); 
    } catch (error) {
      console.error("Gagal menyusun lembar nilai rombel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const hitungHurufMutu = (nilai) => {
    if (nilai >= 85) return "A";
    if (nilai >= 75) return "B";
    if (nilai >= 60) return "C";
    if (nilai >= 45) return "D";
    return "E";
  };

  const handleNilaiChange = (idMhs, field, value) => {
    let numValue = value === "" ? 0 : parseFloat(value);
    if (numValue < 0) numValue = 0;
    if (numValue > 100) numValue = 100;

    setAdaPerubahanBaru(true);

    const updated = daftarMahasiswa.map((mhs) => {
      if (mhs.id_mahasiswa === idMhs) {
        const updatedMhs = { ...mhs, [field]: numValue };
        const nilaiAkhir =
          (updatedMhs.tugas * (bobotPenilaian.tugas / 100)) +
          (updatedMhs.uts * (bobotPenilaian.uts / 100)) +
          (updatedMhs.uas * (bobotPenilaian.uas / 100));

        updatedMhs.akhir = parseFloat(nilaiAkhir.toFixed(2));
        updatedMhs.huruf = hitungHurufMutu(updatedMhs.akhir);
        updatedMhs.status = updatedMhs.akhir >= 60 ? "Lulus" : "Tidak Lulus";
        return updatedMhs;
      }
      return mhs;
    });
    setDaftarMahasiswa(updated);
  };

  const handleSimpanSemua = async () => {
    if (isLocked) return alert("Nilai sudah Diterbitkan (Terbit). Tidak bisa diubah lagi.");
    if (daftarMahasiswa.length === 0) return alert("Tidak ada data nilai mahasiswa.");
    
    try {
      setIsLoading(true);
      const payloadArray = daftarMahasiswa.map(mhs => ({
        id_jadwal: idJadwalTerpilih,
        id_mahasiswa: mhs.id_mahasiswa,
        nilai_tugas: mhs.tugas,
        nilai_uts: mhs.uts,
        nilai_uas: mhs.uas,
        nilai_akhir: mhs.akhir,
        grade: mhs.huruf
      }));

      await nilaiAPI.simpanNilaiMahasiswa(payloadArray);
      await nilaiAPI.updateStatusJadwalNilai(idJadwalTerpilih, "Draft");
      
      setJadwalDetail(prev => prev ? { ...prev, status_nilai: "Draft" } : null);
      setAdaPerubahanBaru(false); 
      
      alert("Seluruh nilai rapor berhasil dikirim ke Admin!");
    } catch (error) {
      alert("Gagal menyimpan nilai: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isTombolKirimDisabled = (!adaPerubahanBaru && jadwalDetail?.status_nilai === "Draft") || isLocked || isLoading;

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f4f6f9] min-h-screen font-sans text-xs text-slate-700 w-full animate-fadeIn">

      {/* 1. KOTAK PENYARINGAN KELAS */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-950 mb-4">Pilih Kelas Mengajar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          
          {/* DROPDOWN MATAKULIAH DAISYUI DENGAN SCROLL VERTIVAL */}
          <div className="flex flex-col w-full">
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Mata Kuliah Diampu</label>
            <div className="dropdown dropdown-bottom w-full">
              <div 
                tabIndex={0} 
                role="button" 
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white text-slate-700 font-bold cursor-pointer flex items-center justify-between gap-2 hover:bg-gray-50/50 transition h-9 select-none"
              >
                <span className="truncate">
                  {daftarJadwal.find(j => String(j.id_jadwal) === String(idJadwalTerpilih)) 
                    ? `${daftarJadwal.find(j => String(j.id_jadwal) === String(idJadwalTerpilih)).mata_kuliah} - Kelas ${daftarJadwal.find(j => String(j.id_jadwal) === String(idJadwalTerpilih)).kelas}`
                    : "Pilih Mata Kuliah"}
                </span>
                <FiChevronDown className="text-gray-400 shrink-0 text-[10px]" />
              </div>
              <ul 
                tabIndex={0} 
                className="dropdown-content menu p-1.5 shadow-lg bg-white rounded-lg border border-gray-200/80 w-full max-h-56 overflow-y-auto flex-col flex-nowrap gap-0.5 z-[100] mt-1 text-slate-700 font-sans"
              >
                {daftarJadwal.map((j) => (
                  <li key={j.id_jadwal} className="w-full">
                    <button
                      type="button"
                      onClick={() => {
                        setIdJadwalTerpilih(j.id_jadwal);
                        setJadwalDetail(j);
                        if (document.activeElement) document.activeElement.blur();
                      }}
                      className={`px-2.5 py-1.5 text-[11px] font-bold rounded-md block text-left w-full truncate transition ${
                        String(idJadwalTerpilih) === String(j.id_jadwal) ? "bg-blue-50 text-blue-700 hover:bg-blue-50" : "hover:bg-gray-100 text-slate-700"
                      }`}
                    >
                      {j.mata_kuliah} - Kelas {j.kelas}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Periode Rilis</label>
            <div className="w-full h-9 border border-gray-200 bg-slate-50 rounded-lg px-3 text-xs text-slate-500 font-bold flex items-center shadow-inner">
              Genap 2025/2026
            </div>
          </div>
          <div>
            <button onClick={muatLembarNilaiMahasiswa} className="btn bg-[#1a3a6b] text-white hover:bg-[#244b86] border-none w-full h-9 min-h-0 rounded-lg text-xs font-bold shadow-none tracking-wide cursor-pointer">
              <FiSearch className="text-xs" /> Tampilkan Mahasiswa
            </button>
          </div>
        </div>
      </div>

      {/* 2. BANNER DETIL MATAKULIAH */}
      {jadwalDetail && (
        <div className="text-white rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-sm" style={{ background: "linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)" }}>
          <div><p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">Mata Kuliah</p><h4 className="font-bold text-xs mt-0.5">{jadwalDetail.mata_kuliah}</h4></div>
          <div><p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">Kode & Bobot</p><h4 className="font-bold text-xs mt-0.5">{jadwalDetail.kode_mk} • {jadwalDetail.sks} SKS</h4></div>
          <div><p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">Kelas</p><h4 className="font-bold text-xs mt-0.5">Kelas {jadwalDetail.kelas}</h4></div>
          <div>
            <p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">Status di Admin</p>
            <h4 className={`font-black text-xs mt-0.5 uppercase tracking-wide ${jadwalDetail.status_nilai === "Terbit" ? "text-green-400" : "text-yellow-300"}`}>
              {jadwalDetail.status_nilai === "Draft" ? "DRAFT (SUDAH DIKIRIM)" : jadwalDetail.status_nilai === "Terbit" ? "TERBIT (TERKUNCI)" : "BELUM DIKIRIM"}
            </h4>
          </div>
        </div>
      )}

      {/* 3. TABEL DATA NILAI MAHASISWA */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex-1">
        <div className="flex justify-between items-center gap-4 mb-5">
          <span className="font-bold text-slate-950 text-sm flex items-center gap-2"><FiUser className="text-slate-800" /> Pengisian Transkrip Nilai</span>
          
          {daftarMahasiswa.length > 0 && (
            <button
              onClick={handleSimpanSemua}
              disabled={isTombolKirimDisabled}
              className={`flex items-center gap-1.5 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm cursor-pointer transition ${
                isTombolKirimDisabled 
                  ? "bg-gray-400 cursor-not-allowed opacity-75" 
                  : "bg-[#f97316] hover:bg-[#ea580c]"
              }`}
            >
              {isLocked 
                ? "Nilai Terkunci (Terbit)" 
                : (!adaPerubahanBaru && jadwalDetail?.status_nilai === "Draft")
                  ? "Nilai Sudah Terkirim ke Admin"
                  : isLoading 
                    ? "Memproses..." 
                    : "Kirim Nilai Rapor ke Admin"}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center items-center"><Loading /></div>
        ) : daftarMahasiswa.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="text-left px-4 py-3 w-12">No</th>
                  <th className="text-left px-4 py-3">ID Mahasiswa</th>
                  <th className="text-left px-4 py-3">Nama Mahasiswa</th>
                  <th className="text-center px-2 py-3 w-24">Tugas (30%)</th>
                  <th className="text-center px-2 py-3 w-24">UTS (30%)</th>
                  <th className="text-center px-2 py-3 w-24">UAS (40%)</th>
                  <th className="text-center px-4 py-3 w-28">Nilai Akhir</th>
                  <th className="text-center px-4 py-3 w-20">Grade</th>
                  <th className="text-center px-4 py-3 w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-slate-600">
                {daftarMahasiswa.map((mhs) => (
                  <tr 
                    key={mhs.id_mahasiswa} 
                    className={`transition-colors ${barisAktif === mhs.id_mahasiswa ? "bg-amber-50/60" : "hover:bg-gray-50/50"}`}
                  >
                    <td className="px-4 py-3 text-gray-400 font-medium">{mhs.no}</td>
                    <td className="px-4 py-3 font-mono text-slate-900 font-bold tracking-wide">{mhs.id_mahasiswa}</td>
                    <td className="px-4 py-3 font-bold text-slate-800 uppercase">{mhs.nama}</td>
                    
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="number"
                        min="0" max="100"
                        value={mhs.tugas}
                        disabled={isLocked}
                        onChange={(e) => handleNilaiChange(mhs.id_mahasiswa, "tugas", e.target.value)}
                        className={`w-full text-center border rounded px-2 py-1 focus:outline-none font-bold text-slate-880 bg-white disabled:bg-gray-50 disabled:text-gray-400 ${barisAktif === mhs.id_mahasiswa ? "border-amber-400" : "border-gray-200 focus:border-slate-400"}`}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="number"
                        min="0" max="100"
                        value={mhs.uts}
                        disabled={isLocked}
                        onChange={(e) => handleNilaiChange(mhs.id_mahasiswa, "uts", e.target.value)}
                        className={`w-full text-center border rounded px-2 py-1 focus:outline-none font-bold text-slate-880 bg-white disabled:bg-gray-50 disabled:text-gray-400 ${barisAktif === mhs.id_mahasiswa ? "border-amber-400" : "border-gray-200 focus:border-slate-400"}`}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <input
                        type="number"
                        min="0" max="100"
                        value={mhs.uas}
                        disabled={isLocked}
                        onChange={(e) => handleNilaiChange(mhs.id_mahasiswa, "uas", e.target.value)}
                        className={`w-full text-center border rounded px-2 py-1 focus:outline-none font-bold text-slate-880 bg-white disabled:bg-gray-50 disabled:text-gray-400 ${barisAktif === mhs.id_mahasiswa ? "border-amber-400" : "border-gray-200 focus:border-slate-400"}`}
                      />
                    </td>
                    
                    <td className="px-4 py-3 text-center font-black text-blue-700 bg-blue-50/30 font-mono tracking-wide">{mhs.akhir}</td>
                    
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black border tracking-wide ${mhs.huruf === "A" || mhs.huruf === "B" || mhs.huruf === "C" ? "bg-green-50 text-green-700 border-green-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                        {mhs.huruf}
                      </span>
                    </td>

                    <td className="px-4 py-1.5 text-center">
                      <button
                        onClick={() => setBarisAktif(mhs.id_mahasiswa)}
                        disabled={isLocked}
                        className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded border text-[10px] font-bold transition ${
                          isLocked
                            ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                            : "border-amber-200 text-amber-600 hover:bg-amber-50 cursor-pointer"
                        }`}
                      >
                        <FiEdit2 size={10} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2 border border-dashed border-gray-200 rounded-xl">
            <FiAlertCircle size={24} className="text-gray-300" />
            <p className="font-semibold text-xs text-gray-500">Pilih kelas terlebih dahulu, lalu klik tombol Tampilkan Mahasiswa.</p>
          </div>
        )}
      </div>
    </div>
  );
}