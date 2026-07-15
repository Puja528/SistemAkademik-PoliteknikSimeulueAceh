import React, { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";
import { mahasiswaAPI } from "../../../services/mahasiswaAPI.js";
import { supabase } from "../../../supabaseClient";
import Loading from "../../../components/admin/Loading";

const TambahMahasiswa = ({ isTambahTerbuka, setIsTambahTerbuka, onSuksesSimpan }) => {
  const [inputBaru, setInputBaru] = useState({
    id_mahasiswa: "",
    nama: "",
    program_studi: "D4 Pengolahan dan Penyimpanan Hasil Perikanan",
    emailPrefix: "",
    id: "",
    angkatan: new Date().getFullYear().toString(),
    status: "Aktif",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [emailError, setEmailError] = useState("");

  const tahunSekarang = new Date().getFullYear();
  const daftarAngkatan = [tahunSekarang.toString(), (tahunSekarang + 1).toString()];

  const cekEmailUnik = async (prefix) => {
    if (!prefix) return;
    const emailLengkap = `${prefix.trim()}@polteksim.ac.id`;

    const { data } = await supabase
      .from("users")
      .select("email")
      .eq("email", emailLengkap)
      .maybeSingle();

    if (data) {
      setEmailError("Email ini sudah terdaftar!");
    } else {
      setEmailError("");
    }
  };

  useEffect(() => {
    const fetchKelas = async () => {
      const { data } = await supabase.from("kelas").select("id, nama_kelas");
      setDaftarKelas(data || []);
    };
    fetchKelas();
  }, []);

  if (!isTambahTerbuka) return null;

  const tanganiSimpanMahasiswa = async (e) => {
    e.preventDefault();
    if (emailError) return;
    
    setIsSubmitting(true);
    const emailLengkap = `${inputBaru.emailPrefix.trim()}@polteksim.ac.id`;

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailLengkap,
        password: "MahasiswaPolteksim2026!",
      });
      if (authError) throw authError;

      const uuidMhsBaru = authData.user?.id;

      await supabase.from("users").insert([{
        id: uuidMhsBaru,
        email: emailLengkap,
        nama: inputBaru.nama.trim(),
        role: "mahasiswa",
        password: "MahasiswaPoltek2026!"
      }]);

      const dataSiapSimpan = {
        id_mahasiswa: inputBaru.id_mahasiswa.trim(),
        nama: inputBaru.nama.trim(),
        program_studi: inputBaru.program_studi,
        email: emailLengkap,
        id_kelas: parseInt(inputBaru.id),
        angkatan: parseInt(inputBaru.angkatan),
        status: inputBaru.status,
        user_id: uuidMhsBaru
      };

      await mahasiswaAPI.createMahasiswa(dataSiapSimpan);
      onSuksesSimpan();
      setIsTambahTerbuka(false);
      alert("Mahasiswa berhasil didaftarkan!");
    } catch (error) {
      console.error("Detail Error:", error);
      alert("Gagal: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[9999] p-6 md:p-12 text-gray-600 overflow-y-auto min-h-screen font-sans">
      <form onSubmit={tanganiSimpanMahasiswa} className="max-w-4xl mx-auto w-full text-xs">
        
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-5 mb-8">
          <div>
            <h3 className="text-base font-bold text-gray-800">Tambah Mahasiswa Baru</h3>
            <p className="text-[11.5px] text-gray-400 mt-0.5 font-medium">Lengkapi berkas data diri & akademik mahasiswa</p>
          </div>
          <button 
            type="button" 
            onClick={() => setIsTambahTerbuka(false)} 
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 border border-gray-200 flex items-center gap-2 text-xs font-semibold transition cursor-pointer"
          >
            <FiX size={15} /> Tutup
          </button>
        </div>

        <div className="space-y-8">
          {/* Kelompok Form: Data Diri */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-[#1a3a6b] uppercase tracking-wider border-b border-gray-100 pb-2">Data Diri</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">NIM</label>
                <input 
                  type="text" 
                  required 
                  disabled={isSubmitting} 
                  value={inputBaru.id_mahasiswa} 
                  onChange={(e) => setInputBaru({ ...inputBaru, id_mahasiswa: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-gray-50/50 font-mono text-gray-700 focus:outline-none focus:border-slate-400 transition" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</label>
                <input 
                  type="text" 
                  required 
                  disabled={isSubmitting} 
                  value={inputBaru.nama} 
                  onChange={(e) => setInputBaru({ ...inputBaru, nama: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white text-gray-700 font-medium focus:outline-none focus:border-slate-400 transition" 
                />
              </div>
            </div>
          </div>

          {/* Kelompok Form: Data Akademik */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-[#1a3a6b] uppercase tracking-wider border-b border-gray-100 pb-2">Data Akademik</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Program Studi</label>
                <select 
                  required 
                  value={inputBaru.program_studi} 
                  onChange={(e) => setInputBaru({ ...inputBaru, program_studi: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white text-gray-700 font-medium cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  <option value="D4 Pengolahan dan Penyimpanan Hasil Perikanan">D4 Pengolahan dan Penyimpanan Hasil Perikanan</option>
                  <option value="D3 Perikanan Tangkap">D3 Perikanan Tangkap</option>
                  <option value="D3 Budi Daya Ikan">D3 Budi Daya Ikan</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Kelas</label>
                <select 
                  required 
                  value={inputBaru.id} 
                  onChange={(e) => setInputBaru({ ...inputBaru, id: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white text-gray-700 font-semibold cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  <option value="">Pilih Kelas</option>
                  {daftarKelas.map((k) => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Angkatan</label>
                <select 
                  required 
                  value={inputBaru.angkatan} 
                  onChange={(e) => setInputBaru({ ...inputBaru, angkatan: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white text-gray-700 font-medium cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  {daftarAngkatan.map((thn) => <option key={thn} value={thn}>{thn}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Kelompok Form: Akses Sistem */}
          <div className="space-y-4">
            <h4 className="text-[11px] font-bold text-[#1a3a6b] uppercase tracking-wider border-b border-gray-100 pb-2">Akses & Status Sistem</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Institusi</label>
                <div className={`flex items-center bg-white border rounded-lg overflow-hidden transition focus-within:border-slate-400 ${emailError ? 'border-red-400' : 'border-gray-200'}`}>
                  <input 
                    type="text" 
                    required 
                    placeholder="username" 
                    onBlur={(e) => cekEmailUnik(e.target.value)} 
                    onChange={(e) => { setInputBaru({ ...inputBaru, emailPrefix: e.target.value }); setEmailError(""); }} 
                    className="w-full bg-transparent text-xs px-3 py-2 text-gray-700 font-medium focus:outline-none" 
                  />
                  <span className="text-[11px] font-semibold text-gray-400 px-3 bg-gray-50 py-2 border-l border-gray-100 select-none">
                    @polteksim.ac.id
                  </span>
                </div>
                {emailError && <p className="text-[11px] text-red-500 font-semibold mt-0.5">{emailError}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status Keaktifan</label>
                <select 
                  required 
                  value={inputBaru.status} 
                  onChange={(e) => setInputBaru({ ...inputBaru, status: e.target.value })} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white text-gray-700 font-medium cursor-pointer focus:outline-none focus:border-slate-400 transition"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <div className="border-t border-gray-200 pt-8 mt-12 flex justify-end gap-2.5">
          <button 
            type="button" 
            onClick={() => setIsTambahTerbuka(false)} 
            className="bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold px-5 py-2 rounded-lg transition border border-gray-200 cursor-pointer"
          >
            Batalkan
          </button>
          
          <button 
            type="submit" 
            disabled={isSubmitting || !!emailError} 
            style={{ backgroundColor: (isSubmitting || emailError) ? "#9ca3af" : "#1a3a6b" }}
            onMouseEnter={(e) => !(isSubmitting || emailError) && (e.currentTarget.style.backgroundColor = "#244b86")}
            onMouseLeave={(e) => !(isSubmitting || emailError) && (e.currentTarget.style.backgroundColor = "#1a3a6b")}
            className="text-white text-xs font-semibold px-6 py-2 rounded-lg transition shadow-sm cursor-pointer min-w-[150px]"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Data Mahasiswa"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TambahMahasiswa;