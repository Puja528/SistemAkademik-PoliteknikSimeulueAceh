import React, { useState, useEffect, useCallback } from "react";
import {
  FiSearch,
  FiUser,
  FiCheckSquare,
  FiSave,
  FiAlertCircle,
  FiLock,
} from "react-icons/fi";
import { jadwalAPI } from "../../services/jadwalAPI";
import { dosenAPI } from "../../services/dosenAPI";
import { absensiAPI } from "../../services/absensiAPI";
import axios from "axios";
import Loading from "../../components/admin/Loading";

const TOTAL_PERTEMUAN = 16;

// Helper: "Pertemuan 3" -> 3
const getNomorPertemuan = (label) =>
  parseInt(String(label).replace(/[^0-9]/g, ""), 10);

export default function Absensi() {
  const [daftarJadwal, setDaftarJadwal] = useState([]);
  const [idJadwalTerpilih, setIdJadwalTerpilih] = useState("");
  const [jadwalDetail, setJadwalDetail] = useState(null);

  const [daftarMahasiswa, setDaftarMahasiswa] = useState([]);
  const [filterPertemuan, setFilterPertemuan] = useState("Pertemuan 1");
  const [isLoading, setIsLoading] = useState(false);

  // Daftar nomor pertemuan yang SUDAH punya data absensi tersimpan
  // untuk mata kuliah (id_jadwal) yang sedang dipilih. Dipakai untuk
  // mengunci opsi "Pertemuan Ke-" agar tidak bisa diisi ulang.
  const [pertemuanTerisi, setPertemuanTerisi] = useState([]);
  const [isCekPertemuan, setIsCekPertemuan] = useState(false);

  useEffect(() => {
    // Flag untuk mencegah setState pada komponen yang sudah unmount
    let didCancel = false;

    const muatJadwalAbsen = async () => {
      try {
        setIsLoading(true);
        const localSession = localStorage.getItem("siakad_session");
        if (!localSession) return;
        const dataUserLogin = JSON.parse(localSession);

        const dosenReal = await dosenAPI.fetchDosenByUserId(dataUserLogin.id);
        if (didCancel || !dosenReal) return;

        const semuaJadwal = await jadwalAPI.fetchJadwal();
        if (didCancel) return;

        // Samakan tipe data id_jadwal jadi Number agar konsisten dengan
        // parseInt() yang dipakai saat dropdown mata kuliah diganti manual
        const jadwalSaya = semuaJadwal
          .filter((j) => j.nidn_dosen === dosenReal.nidn)
          .map((j) => ({ ...j, id_jadwal: Number(j.id_jadwal) }));

        setDaftarJadwal(jadwalSaya);

        if (jadwalSaya.length > 0) {
          setIdJadwalTerpilih(jadwalSaya[0].id_jadwal);
          setJadwalDetail(jadwalSaya[0]);
        }
      } catch (error) {
        console.error("Gagal muat data absen:", error);
      } finally {
        if (!didCancel) setIsLoading(false);
      }
    };

    muatJadwalAbsen();

    return () => {
      didCancel = true;
    };
  }, []);

  // Mengecek pertemuan mana saja (1..16) yang sudah punya data absensi
  // tersimpan untuk id_jadwal tertentu. Dipanggil setiap kali mata kuliah
  // berganti, dan setelah simpan, supaya status kunci selalu akurat
  // (termasuk saat halaman di-refresh).
  const cekPertemuanTerisi = useCallback(async (idJadwal) => {
    if (!idJadwal) return;
    setIsCekPertemuan(true);
    try {
      const hasilCek = await Promise.all(
        Array.from({ length: TOTAL_PERTEMUAN }, (_, i) => i + 1).map(
          async (nomor) => {
            try {
              const data = await absensiAPI.fetchAbsensiKelas(
                idJadwal,
                `Pertemuan ${nomor}`,
              );
              return data && data.length > 0 ? nomor : null;
            } catch {
              return null;
            }
          },
        ),
      );
      setPertemuanTerisi(hasilCek.filter((n) => n !== null));
    } catch (error) {
      console.error("Gagal mengecek status pertemuan:", error);
    } finally {
      setIsCekPertemuan(false);
    }
  }, []);

  const muatDaftarHadirMahasiswa = async () => {
    if (!idJadwalTerpilih || !jadwalDetail) return;
    setIsLoading(true);
    try {
      const absenTersimpan = await absensiAPI.fetchAbsensiKelas(
        idJadwalTerpilih,
        filterPertemuan,
      );

      const targetKelasId = parseInt(jadwalDetail.id_kelas);

      const resMhs = await axios.get(
        `https://mwkewvjpgcvlwgycdpvo.supabase.co/rest/v1/mahasiswa`,
        {
          params: { id_kelas: `eq.${targetKelasId}` },
          headers: {
            apikey: "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK",
            Authorization:
              "Bearer sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK",
          },
        },
      );

      const masterMhs = resMhs.data || [];

      // === PERBAIKAN: Mengurutkan nama mahasiswa dari A sampai Z ===
      masterMhs.sort((a, b) => {
        const namaA = (a.nama || "").toUpperCase();
        const namaB = (b.nama || "").toUpperCase();
        return namaA.localeCompare(namaB);
      });

      const lembarAbsen = masterMhs.map((mhs, idx) => {
        const match = absenTersimpan.find(
          (a) => a.id_mahasiswa === mhs.id_mahasiswa,
        );
        return {
          no: idx + 1,
          id_mahasiswa: mhs.id_mahasiswa,
          nama: mhs.nama,
          status: match ? match.status_kehadiran : "Hadir",
          kehadiran: match
            ? match.status_kehadiran === "Hadir"
              ? "100%"
              : "0%"
            : "100%",
        };
      });

      setDaftarMahasiswa(lembarAbsen);
    } catch (error) {
      console.error("Gagal menyusun absensi kelas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (idJadwalTerpilih && jadwalDetail) {
      muatDaftarHadirMahasiswa();
      cekPertemuanTerisi(idJadwalTerpilih);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idJadwalTerpilih]);

  // Status pertemuan yang sedang ditampilkan: terkunci kalau sudah ada
  // di daftar pertemuanTerisi (sudah pernah disimpan sebelumnya).
  const nomorPertemuanAktif = getNomorPertemuan(filterPertemuan);
  const pertemuanAktifTerkunci = pertemuanTerisi.includes(nomorPertemuanAktif);

  const handleStatusChange = (idMhs, statusBaru) => {
    if (pertemuanAktifTerkunci) return; // jaga-jaga, tidak boleh ubah data yang terkunci
    const updated = daftarMahasiswa.map((mhs) => {
      if (mhs.id_mahasiswa === idMhs) {
        const kehadiranBaru = statusBaru === "Hadir" ? "100%" : "0%";
        return { ...mhs, status: statusBaru, kehadiran: kehadiranBaru };
      }
      return mhs;
    });
    setDaftarMahasiswa(updated);
  };

  const handleHadirSemua = () => {
    if (pertemuanAktifTerkunci) return;
    const updated = daftarMahasiswa.map((mhs) => ({
      ...mhs,
      status: "Hadir",
      kehadiran: "100%",
    }));
    setDaftarMahasiswa(updated);
  };

  const handleSimpan = async () => {
    if (pertemuanAktifTerkunci) return;
    try {
      const payloadAbsen = daftarMahasiswa.map((m) => ({
        id_jadwal: parseInt(idJadwalTerpilih),
        id_mahasiswa: m.id_mahasiswa,
        pertemuan: filterPertemuan,
        status_kehadiran: m.status,
        tanggal_absen: new Date().toISOString().split("T")[0],
      }));

      await absensiAPI.simpanAbsensiKelas(payloadAbsen);

      // Tandai pertemuan ini sebagai terisi/terkunci secara optimistik...
      const nomorSelesai = nomorPertemuanAktif;
      setPertemuanTerisi((prev) =>
        prev.includes(nomorSelesai) ? prev : [...prev, nomorSelesai],
      );

      // ...lalu otomatis lanjut ke pertemuan berikutnya (kalau masih ada).
      if (nomorSelesai < TOTAL_PERTEMUAN) {
        setFilterPertemuan(`Pertemuan ${nomorSelesai + 1}`);
        setDaftarMahasiswa([]); // kosongkan dulu, akan terisi ulang saat "Tampilkan" pertemuan baru
        alert(
          `Absensi ${filterPertemuan} berhasil disimpan. Lanjut ke Pertemuan ${nomorSelesai + 1}.`,
        );
      } else {
        alert(
          "Data lembar absensi berkas mahasiswa berhasil diunggah! Semua pertemuan sudah terisi.",
        );
      }

      // Sinkronkan ulang status kunci dari server untuk memastikan akurat
      // (misal ada input dari perangkat/tab lain).
      cekPertemuanTerisi(idJadwalTerpilih);
    } catch (error) {
      alert("Gagal mengunggah absensi: " + error.message);
    }
  };

  const ringkasan = daftarMahasiswa.reduce(
    (acc, mhs) => {
      if (mhs.status === "Hadir") acc.hadir++;
      else if (mhs.status === "Sakit") acc.sakit++;
      else if (mhs.status === "Izin") acc.izin++;
      else acc.alpa++;
      return acc;
    },
    { hadir: 0, sakit: 0, izin: 0, alpa: 0 },
  );

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Hadir":
        return "bg-green-50 text-green-700 border-green-200";
      case "Sakit":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Izin":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Alpa":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-gray-50 text-slate-600 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-[#f4f6f9] min-h-screen font-sans text-xs text-slate-700 w-full">
      {/* 1. SEKSI FORM SELEKSI MATA KULIAH */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h2 className="text-sm font-bold text-slate-950 mb-4">
          Pilih Mata Kuliah & Pertemuan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
              Mata Kuliah
            </label>
            <select
              value={idJadwalTerpilih}
              onChange={(e) => {
                const targetId = parseInt(e.target.value);
                setIdJadwalTerpilih(targetId);
                setJadwalDetail(
                  daftarJadwal.find((j) => j.id_jadwal === targetId),
                );
                setFilterPertemuan("Pertemuan 1");
                setPertemuanTerisi([]);
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-slate-400 transition"
            >
              {daftarJadwal.map((j) => (
                <option key={j.id_jadwal} value={j.id_jadwal}>
                  {j.mata_kuliah} - Kelas {j.kelas}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
              Pertemuan Ke-
              {isCekPertemuan && (
                <span className="ml-1 normal-case font-normal text-slate-300">
                  (memeriksa...)
                </span>
              )}
            </label>
            <select
              value={filterPertemuan}
              onChange={(e) => setFilterPertemuan(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-white text-slate-700 font-medium cursor-pointer focus:outline-none focus:border-slate-400 transition"
            >
              {[...Array(TOTAL_PERTEMUAN)].map((_, i) => {
                const nomor = i + 1;
                const terkunci = pertemuanTerisi.includes(nomor);
                return (
                  <option
                    key={nomor}
                    value={`Pertemuan ${nomor}`}
                    disabled={terkunci}
                    className={terkunci ? "text-gray-300" : ""}
                  >
                    {`Pertemuan ${nomor}`}
                    {terkunci ? " — Terkunci (sudah diabsen)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
              Jam Kerja
            </label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs bg-gray-50 text-slate-500 font-medium focus:outline-none"
              disabled
            >
              <option>
                {jadwalDetail
                  ? `${jadwalDetail.jam_mulai?.substring(0, 5)} WIB`
                  : "--:--"}
              </option>
            </select>
          </div>
          <div>
            <button
              onClick={muatDaftarHadirMahasiswa}
              className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] text-white rounded-lg px-4 py-1.5 hover:bg-[#244b86] transition font-bold text-xs shadow-sm cursor-pointer h-[32px]"
            >
              <FiSearch className="text-xs" /> Tampilkan
            </button>
          </div>
        </div>
      </div>

      {/* 2. AREA DETAIL JADWAL YANG TERPILIH (GRADIENT STYLE) */}
      {jadwalDetail && (
        <div
          className="text-white rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-sm"
          style={{
            background:
              "linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)",
          }}
        >
          <div>
            <p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">
              Mata Kuliah
            </p>
            <h4 className="font-bold text-xs mt-0.5">
              {jadwalDetail.mata_kuliah}
            </h4>
          </div>
          <div>
            <p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">
              Ruangan
            </p>
            <h4 className="font-bold text-xs mt-0.5">{jadwalDetail.ruangan}</h4>
          </div>
          <div>
            <p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">
              Pertemuan
            </p>
            <h4 className="font-bold text-xs mt-0.5">
              {filterPertemuan}
              {pertemuanAktifTerkunci ? " (Terkunci)" : ""}
            </h4>
          </div>
          <div>
            <p className="text-[10px] opacity-75 font-bold uppercase tracking-wider">
              Tanggal Sesi
            </p>
            <h4 className="font-bold text-xs mt-0.5">
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h4>
          </div>
        </div>
      )}

      {/* 3. AREA TABEL LEMBAR ABSENSI */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex-1">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-5">
          <span className="font-bold text-slate-950 text-sm flex items-center gap-2">
            <FiUser className="text-slate-800" /> Daftar Mahasiswa
          </span>
          <div className="flex items-center gap-2">
            {pertemuanAktifTerkunci && (
              <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-[11px] font-bold">
                <FiLock className="text-xs" /> Pertemuan ini sudah diabsen &amp;
                terkunci
              </span>
            )}
            <button
              onClick={handleHadirSemua}
              disabled={pertemuanAktifTerkunci}
              className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg transition text-xs font-bold shadow-sm ${
                pertemuanAktifTerkunci
                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                  : "bg-white text-slate-600 border-gray-200 hover:bg-gray-50 cursor-pointer"
              }`}
            >
              <FiCheckSquare
                className={
                  pertemuanAktifTerkunci
                    ? "text-gray-300 text-sm"
                    : "text-emerald-600 text-sm"
                }
              />{" "}
              Hadir Semua
            </button>
            <button
              onClick={handleSimpan}
              disabled={pertemuanAktifTerkunci}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition text-xs font-bold shadow-sm ${
                pertemuanAktifTerkunci
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
              }`}
            >
              <FiSave className="text-sm" /> Simpan Absensi
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="text-left px-4 py-3 w-12">No</th>
                <th className="text-left px-4 py-3">ID Mahasiswa</th>
                <th className="text-left px-4 py-3">Nama Mahasiswa</th>
                <th className="text-left px-4 py-3">Kehadiran</th>
                <th className="text-center px-4 py-3 w-40">Status Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-slate-600">
              {daftarMahasiswa.map((mhs) => (
                <tr
                  key={mhs.id_mahasiswa}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3.5 text-gray-400 font-medium">
                    {mhs.no}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-900 font-bold tracking-wide">
                    {mhs.id_mahasiswa}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-800 uppercase">
                    {mhs.nama}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-slate-700 font-bold">
                      {mhs.kehadiran}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <select
                      value={mhs.status}
                      onChange={(e) =>
                        handleStatusChange(mhs.id_mahasiswa, e.target.value)
                      }
                      disabled={pertemuanAktifTerkunci}
                      className={`w-full border rounded-lg px-2.5 py-1 text-[11px] font-bold focus:outline-none transition leading-none text-center ${
                        pertemuanAktifTerkunci
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                          : `cursor-pointer ${getStatusBadgeClass(mhs.status)}`
                      }`}
                    >
                      <option value="Hadir" className="bg-white text-slate-800">
                        Hadir
                      </option>
                      <option value="Sakit" className="bg-white text-slate-800">
                        Sakit
                      </option>
                      <option value="Izin" className="bg-white text-slate-800">
                        Izin
                      </option>
                      <option value="Alpa" className="bg-white text-slate-800">
                        Alpa
                      </option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {daftarMahasiswa.length === 0 && (
          <div className="text-center py-10 text-gray-400 flex flex-col items-center gap-2">
            <FiAlertCircle size={20} className="text-gray-300" />
            <p className="font-medium">
              Pilih mata kuliah terlebih dahulu, lalu klik tombol Tampilkan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
