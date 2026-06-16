import React, { useState, useEffect } from "react";
import { FiSearch, FiUser } from "react-icons/fi";
import { nilaiAPI } from "../../services/nilaiAPI";
import { jadwalAPI } from "../../services/jadwalAPI";
import { dosenAPI } from "../../services/dosenAPI";
import axios from "axios";

export default function Nilai() {
  const [daftarJadwal, setDaftarJadwal] = useState([]);
  const [idJadwalTerpilih, setIdJadwalTerpilih] = useState("");
  const [daftarMahasiswa, setDaftarMahasiswa] = useState([]);
  const [jadwalDetail, setJadwalDetail] = useState(null);
  
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const bobotPenilaian = { tugas: 30, uts: 30, uas: 40 }; 

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
          setIdJadwalTerpilih(jadwalSaya[0].id_jadwal); 
          setJadwalDetail(jadwalSaya[0]);
        }
      } catch (error) {
        console.error("Gagal muat jadwal:", error);
      }
    };
    muatAwalJadwalDosen();
  }, []);

  useEffect(() => {
    if (idJadwalTerpilih) {
      muatLembarNilaiMahasiswa();
    }
  }, [idJadwalTerpilih]);

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

  const handleSimpan = async () => {
    if (isLocked) return alert("Nilai terkunci, tidak bisa diubah.");
    try {
      const payloadArray = daftarMahasiswa.map(mhs => ({
        id_jadwal: parseInt(idJadwalTerpilih),
        id_mahasiswa: mhs.id_mahasiswa,
        nilai_tugas: mhs.tugas,
        nilai_uts: mhs.uts,
        nilai_uas: mhs.uas,
        nilai_akhir: mhs.akhir,
        grade: mhs.huruf
      }));

      await nilaiAPI.simpanNilaiMahasiswa(payloadArray);
      await nilaiAPI.updateStatusJadwalNilai(idJadwalTerpilih, "Draft");
      alert("Nilai mahasiswa kelas diampu berhasil dikirim ke Admin!");
    } catch (error) {
      alert("Gagal menyimpan nilai: " + error.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f4f6f9] min-h-screen font-sans">
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Pilih Kelas Mengajar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Mata Kuliah Diampu</label>
            <select 
              value={idJadwalTerpilih}
              onChange={(e) => {
                const targetId = parseInt(e.target.value);
                setIdJadwalTerpilih(targetId);
                setJadwalDetail(daftarJadwal.find(j => j.id_jadwal === targetId));
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer"
            >
              {daftarJadwal.map(j => (
                <option key={j.id_jadwal} value={j.id_jadwal}>{j.mata_kuliah} - Kelas {j.kelas}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Periode Rilis</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-slate-50" disabled>
              <option>Genap 2025/2026</option>
            </select>
          </div>
          <div>
            <button onClick={muatLembarNilaiMahasiswa} className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white rounded-lg px-4 py-2 hover:bg-[#244b86] transition text-sm font-medium cursor-pointer">
              <FiSearch /> Tampilkan Mahasiswa
            </button>
          </div>
        </div>
      </div>

      {jadwalDetail && (
        <div className="bg-[#1a3a6b] text-white rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-md">
          <div><p className="text-xs opacity-70 uppercase tracking-wider">Mata Kuliah</p><h4 className="font-semibold text-sm mt-0.5">{jadwalDetail.mata_kuliah}</h4></div>
          <div><p className="text-xs opacity-70 uppercase tracking-wider">Kode & Bobot</p><h4 className="font-semibold text-sm mt-0.5">{jadwalDetail.kode_mk} • {jadwalDetail.sks} SKS</h4></div>
          <div><p className="text-xs opacity-70 uppercase tracking-wider">Kelas</p><h4 className="font-semibold text-sm mt-0.5">Kelas {jadwalDetail.kelas}</h4></div>
          <div><p className="text-xs opacity-70 uppercase tracking-wider">Status di Admin</p><h4 className={`font-semibold text-sm mt-0.5 uppercase ${jadwalDetail.status_nilai === "Terbit" ? "text-green-400" : "text-yellow-300"}`}>{jadwalDetail.status_nilai || "Draft (Bisa Diisi)"}</h4></div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex-1">
        <div className="flex justify-between items-center gap-4 mb-5">
          <span className="font-bold text-gray-900 text-base flex items-center gap-2"><FiUser /> Pengisian Transkrip Nilai</span>
          <button onClick={handleSimpan} disabled={isLocked || isLoading} className={`flex items-center gap-2 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm cursor-pointer ${isLocked ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
            {isLoading ? "Memproses..." : "Kirim Rapor ke Admin"}
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase">
                <th className="text-left px-4 py-3 w-12">No</th>
                <th className="text-left px-4 py-3">ID Mahasiswa</th>
                <th className="text-left px-4 py-3">Nama Mahasiswa</th>
                <th className="text-center px-2 py-3 w-24">Tugas (30%)</th>
                <th className="text-center px-2 py-3 w-24">UTS (30%)</th>
                <th className="text-center px-2 py-3 w-24">UAS (40%)</th>
                <th className="text-center px-4 py-3 w-28">Nilai Akhir</th>
                <th className="text-center px-4 py-3 w-20">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {daftarMahasiswa.map((mhs) => (
                <tr key={mhs.id_mahasiswa} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-gray-400">{mhs.no}</td>
                  <td className="px-4 py-3 font-mono text-gray-700 font-bold">{mhs.id_mahasiswa}</td>
                  <td className="px-4 py-3 font-bold text-gray-900 uppercase">{mhs.nama}</td>
                  <td className="px-2 py-2 text-center"><input type="number" value={mhs.tugas} disabled={isLocked} onChange={(e) => handleNilaiChange(mhs.id_mahasiswa, "tugas", e.target.value)} className="w-full text-center border rounded py-1 font-semibold disabled:bg-slate-50" /></td>
                  <td className="px-2 py-2 text-center"><input type="number" value={mhs.uts} disabled={isLocked} onChange={(e) => handleNilaiChange(mhs.id_mahasiswa, "uts", e.target.value)} className="w-full text-center border rounded py-1 font-semibold disabled:bg-slate-50" /></td>
                  <td className="px-2 py-2 text-center"><input type="number" value={mhs.uas} disabled={isLocked} onChange={(e) => handleNilaiChange(mhs.id_mahasiswa, "uas", e.target.value)} className="w-full text-center border rounded py-1 font-semibold disabled:bg-slate-50" /></td>
                  <td className="px-4 py-3 text-center font-black text-blue-600 bg-blue-50/10">{mhs.akhir}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-black ${mhs.huruf === "A" || mhs.huruf === "B" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{mhs.huruf}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}