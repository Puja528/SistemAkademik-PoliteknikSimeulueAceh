import React, { useState, useEffect } from "react";
import { FiSearch, FiUser, FiEdit2, FiX } from "react-icons/fi";
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

  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // === TAMBAHAN: state modal edit ===
  const [modalEdit, setModalEdit] = useState(null); // null | id_mahasiswa

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

  // === TAMBAHAN: fungsi modal edit ===
  const bukaModalEdit = (idMhs) => setModalEdit(idMhs);
  const tutupModalEdit = () => setModalEdit(null);

  const mhsModal = modalEdit
    ? daftarMahasiswa.find(m => m.id_mahasiswa === modalEdit)
    : null;

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f4f6f9] min-h-screen font-sans text-xs text-slate-700 w-full">

      {/* 1. KOTAK PENYARINGAN KELAS */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-950 mb-4">Pilih Kelas Mengajar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Mata Kuliah Diampu</label>
            <select
              value={idJadwalTerpilih}
              onChange={(e) => {
                const targetId = parseInt(e.target.value);
                setIdJadwalTerpilih(targetId);
                setJadwalDetail(daftarJadwal.find(j => j.id_jadwal === targetId));
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-slate-400 transition"
            >
              {daftarJadwal.map(j => (
                <option key={j.id_jadwal} value={j.id_jadwal}>{j.mata_kuliah} - Kelas {j.kelas}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Periode Rilis</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-gray-50 text-slate-500 font-medium focus:outline-none" disabled>
              <option>Genap 2025/2026</option>
            </select>
          </div>
          <div>
            <button onClick={muatLembarNilaiMahasiswa} className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white rounded-lg px-4 py-1.5 hover:bg-[#244b86] transition font-bold text-xs shadow-sm cursor-pointer h-[32px]">
              <FiSearch className="text-xs" /> Tampilkan Mahasiswa
            </button>
          </div>
        </div>
      </div>

      {/* 2. BANNER DETIL MATAKULIAH (STYLE GRADIENT BIRU) */}
      {jadwalDetail && (
        <div className="text-white rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-sm" style={{ background: "linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)" }}>
          <div><p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">Mata Kuliah</p><h4 className="font-bold text-xs mt-0.5">{jadwalDetail.mata_kuliah}</h4></div>
          <div><p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">Kode & Bobot</p><h4 className="font-bold text-xs mt-0.5">{jadwalDetail.kode_mk} • {jadwalDetail.sks} SKS</h4></div>
          <div><p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">Kelas</p><h4 className="font-bold text-xs mt-0.5">Kelas {jadwalDetail.kelas}</h4></div>
          <div>
            <p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">Status di Admin</p>
            <h4 className={`font-black text-xs mt-0.5 uppercase tracking-wide ${jadwalDetail.status_nilai === "Terbit" ? "text-green-400" : "text-yellow-300"}`}>
              {jadwalDetail.status_nilai || "Draft (Bisa Diisi)"}
            </h4>
          </div>
        </div>
      )}

      {/* 3. TABEL DATA NILAI MAHASISWA */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex-1">
        <div className="flex justify-between items-center gap-4 mb-5">
          <span className="font-bold text-slate-950 text-sm flex items-center gap-2"><FiUser className="text-slate-800" /> Pengisian Transkrip Nilai</span>
          <button
            onClick={handleSimpan}
            disabled={isLocked || isLoading}
            className={`flex items-center gap-1.5 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm cursor-pointer transition ${isLocked ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
          >
            {isLoading ? "Memproses..." : "Kirim Rapor ke Admin"}
          </button>
        </div>

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
                {/* === TAMBAHAN: header kolom Aksi === */}
                <th className="text-center px-4 py-3 w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-600">
              {daftarMahasiswa.map((mhs) => (
                <tr key={mhs.id_mahasiswa} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-medium">{mhs.no}</td>
                  <td className="px-4 py-3 font-mono text-slate-900 font-bold tracking-wide">{mhs.id_mahasiswa}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 uppercase">{mhs.nama}</td>
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="number"
                      value={mhs.tugas}
                      disabled={isLocked}
                      onChange={(e) => handleNilaiChange(mhs.id_mahasiswa, "tugas", e.target.value)}
                      className="w-full text-center border border-gray-200 rounded py-1 font-bold text-slate-800 focus:outline-none focus:border-slate-400 transition disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="number"
                      value={mhs.uts}
                      disabled={isLocked}
                      onChange={(e) => handleNilaiChange(mhs.id_mahasiswa, "uts", e.target.value)}
                      className="w-full text-center border border-gray-200 rounded py-1 font-bold text-slate-800 focus:outline-none focus:border-slate-400 transition disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="number"
                      value={mhs.uas}
                      disabled={isLocked}
                      onChange={(e) => handleNilaiChange(mhs.id_mahasiswa, "uas", e.target.value)}
                      className="w-full text-center border border-gray-200 rounded py-1 font-bold text-slate-800 focus:outline-none focus:border-slate-400 transition disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </td>
                  <td className="px-4 py-3 text-center font-black text-blue-700 bg-blue-50/30 font-mono tracking-wide">{mhs.akhir}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black border tracking-wide ${mhs.huruf === "A" || mhs.huruf === "B" || mhs.huruf === "C" ? "bg-green-50 text-green-700 border-green-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                      {mhs.huruf}
                    </span>
                  </td>
                  {/* === TAMBAHAN: tombol edit per baris === */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => bukaModalEdit(mhs.id_mahasiswa)}
                      disabled={isLocked}
                      title="Edit nilai mahasiswa ini"
                      className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-bold transition
                        ${isLocked
                          ? "border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed"
                          : "border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 cursor-pointer"
                        }`}
                    >
                      <FiEdit2 className="text-[10px]" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* === TAMBAHAN: MODAL EDIT NILAI === */}
      {modalEdit && mhsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) tutupModalEdit(); }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-sm mx-4">

            {/* Header modal */}
            <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Edit Nilai Mahasiswa</p>
                <p className="font-black text-slate-800 text-sm uppercase leading-tight">{mhsModal.nama}</p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">{mhsModal.id_mahasiswa}</p>
              </div>
              <button
                onClick={tutupModalEdit}
                className="text-slate-400 hover:text-slate-700 hover:bg-gray-100 rounded-lg p-1.5 transition cursor-pointer"
                title="Tutup"
              >
                <FiX className="text-base" />
              </button>
            </div>

            {/* Input nilai */}
            <div className="px-5 pt-4 pb-3">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { field: "tugas", label: "Tugas", bobot: "30%" },
                  { field: "uts",   label: "UTS",   bobot: "30%" },
                  { field: "uas",   label: "UAS",   bobot: "40%" },
                ].map(({ field, label, bobot }) => (
                  <div key={field}>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      {label} <span className="text-slate-300 font-normal">({bobot})</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={mhsModal[field]}
                      onChange={(e) => handleNilaiChange(mhsModal.id_mahasiswa, field, e.target.value)}
                      className="w-full text-center border border-gray-200 rounded-lg py-2 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition"
                    />
                  </div>
                ))}
              </div>

              {/* Preview nilai akhir & grade */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Nilai Akhir</p>
                  <p className="text-xl font-black text-blue-700 font-mono leading-none mt-0.5">{mhsModal.akhir}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Grade</p>
                  <span className={`inline-block px-3 py-1 rounded-md text-sm font-black border tracking-wide ${
                    ["A", "B", "C"].includes(mhsModal.huruf)
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    {mhsModal.huruf}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer modal */}
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100">
              <button
                onClick={tutupModalEdit}
                className="px-4 py-1.5 text-xs font-bold border border-gray-200 rounded-lg text-slate-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={tutupModalEdit}
                className="px-4 py-1.5 text-xs font-bold bg-[#1a3a6b] text-white rounded-lg hover:bg-[#244b86] transition cursor-pointer shadow-sm"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
