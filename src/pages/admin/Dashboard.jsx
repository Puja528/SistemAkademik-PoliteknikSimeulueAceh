import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AiOutlineUser,
  AiOutlineBook,
  AiOutlineCalendar,
  AiOutlineUserAdd,
  AiOutlinePlusCircle,
  AiOutlineSolution
} from 'react-icons/ai';
import { FiCalendar, FiSearch } from 'react-icons/fi';
import { dashboardAPI } from '../../services/dashboardAdminAPI';
import Loading from "../../components/admin/Loading";

// Helper Komponen Tabel
const TH = ({ children, className = "" }) => (
  <th className={`text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2.5 border-b border-gray-100 text-left ${className}`}>{children}</th>
);

const TD = ({ children, className = "" }) => (
  <td className={`px-3 py-3.5 text-[13px] text-gray-600 border-b border-gray-50 transition-colors ${className}`}>{children}</td>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalStudents: 0, totalLecturers: 0, totalSchedules: 0 });
  const [loading, setLoading] = useState(true);
  const [aktivitas, setAktivitas] = useState([]);
  const [waktu, setWaktu] = useState(new Date());
  const [searchAktivitas, setSearchAktivitas] = useState("");
  const [profilAdmin, setProfilAdmin] = useState(null);

  // 1. Hook Pertama: Hanya Mengurusi Real-time Clock dengan Cleanup Function
  useEffect(() => {
    const timer = setInterval(() => setWaktu(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Hook Kedua: Mengambil Seluruh Data API Secara Kolektif Sekaligus (Aman & Sesuai Modul)
  useEffect(() => {
    let didCancel = false; // Flag untuk mencegah memory leak dan race condition

    const muatSeluruhDataDashboard = async () => {
      try {
        setLoading(true);
        
        // Ambil sesi profil lokal
        const localSession = JSON.parse(localStorage.getItem("siakad_session"));
        
        // Jalankan kedua API secara bersamaan menggunakan Promise.all (Jauh lebih cepat dan efisien)
        const [dataStats, dataAktivitas] = await Promise.all([
          dashboardAPI.fetchDashboardStats(),
          dashboardAPI.fetchRecentActivities()
        ]);

        // Cegah perubahan state jika komponen sudah keburu di-unmount
        if (!didCancel) {
          setProfilAdmin(localSession || { nama: "Staff Administrasi", role: "Super Admin" });
          setStats(dataStats);

          // Format data aktivitas terbaru
          const formatted = dataAktivitas.map(item => ({
            id: item.id,
            type: item.tipe,
            title: item.judul,
            user: item.user_name,
            detail: item.detail,
            time: new Date(item.waktu).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }));
          setAktivitas(formatted);
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard admin:", err);
      } finally {
        if (!didCancel) {
          setLoading(false);
        }
      }
    };

    muatSeluruhDataDashboard();

    // Cleanup function untuk membatalkan proses jika user berpindah halaman dengan cepat
    return () => {
      didCancel = true;
    };
  }, []); // 🌟 Terkunci dengan aman menggunakan dependency array kosong

  const hari = waktu.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const jam = waktu.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const filteredAktivitas = aktivitas.filter((item) =>
    item.title.toLowerCase().includes(searchAktivitas.toLowerCase()) || 
    item.user.toLowerCase().includes(searchAktivitas.toLowerCase())
  );

  if (loading) return <div className="p-6 flex justify-center items-center min-h-screen"><Loading /></div>;

  return (
    <div className="p-6 flex flex-col gap-5 bg-gray-50/50 min-h-screen animate-fadeIn font-sans">
      {/* 1. HEADER & PROFIL */}
      <div 
        className="rounded-xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        style={{ background: 'linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)' }}
      >
        <div>
          <h1 className="text-xl font-bold m-0 mb-1.5 tracking-tight">Selamat Datang, {profilAdmin?.nama}</h1>
          <p className="text-[13px] opacity-80 m-0">
            SIAKAD Politeknik Simeulue Aceh · Hak Akses: {profilAdmin?.role || "Staff Administrasi"}
          </p>
        </div>
        <div className="text-right flex-shrink-0 bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-white/10 self-start sm:self-auto">
          <div className="text-[11px] opacity-75 mb-0.5 font-medium uppercase tracking-wider">{hari}</div>
          <div className="text-xl font-mono font-bold tracking-wider">{jam} WIB</div>
        </div>
      </div>

      {/* 2. SECTION STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: AiOutlineUser, label: "Total Mahasiswa", value: stats.totalStudents, sub: "Data Terintegrasi" },
          { icon: AiOutlineBook, label: "Total Dosen", value: stats.totalLecturers, sub: "Semester Berjalan" },
          { icon: AiOutlineCalendar, label: "Total Jadwal Kuliah", value: stats.totalSchedules, sub: "Aktif Terjadwal" },
        ].map(({ icon: Icon, label, value, sub }, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <Icon size={16} className="text-[#1a3a6b]" />
              <span className="text-[13px] text-gray-500 font-medium">{label}</span>
            </div>
            <span className="text-[32px] font-extrabold text-gray-900">{value}</span>
            <span className="text-[11.5px] text-gray-400 block mt-0.5">{sub}</span>
          </div>
        ))}
      </div>

      {/* 3. SECTION QUICK ACTIONS */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FiCalendar size={16} className="text-gray-500" />
          <span className="text-[14px] font-bold text-gray-800">Aksi Cepat Administrasi</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/admin/mahasiswa/')}
            className="bg-white border border-gray-200 hover:border-[#1a3a6b] p-5 rounded-xl flex flex-col items-center justify-center gap-2 transition shadow-sm group hover:-translate-y-0.5 cursor-pointer"
          >
            <AiOutlineUserAdd className="text-xl text-[#1a3a6b]" />
            <span className="text-[12px] font-semibold text-slate-700 group-hover:text-[#1a3a6b]">Tambah Mahasiswa</span>
          </button>

          <button 
            onClick={() => navigate('/admin/dosen/')}
            className="bg-white border border-gray-200 hover:border-[#1a3a6b] p-5 rounded-xl flex flex-col items-center justify-center gap-2 transition shadow-sm group hover:-translate-y-0.5 cursor-pointer"
          >
            <AiOutlinePlusCircle className="text-xl text-[#1a3a6b]" />
            <span className="text-[12px] font-semibold text-slate-700 group-hover:text-[#1a3a6b]">Tambah Dosen</span>
          </button>

          <button 
            onClick={() => navigate('/admin/jadwal')}
            className="bg-white border border-gray-200 hover:border-[#1a3a6b] p-5 rounded-xl flex flex-col items-center justify-center gap-2 transition shadow-sm group hover:-translate-y-0.5 cursor-pointer"
          >
            <AiOutlineSolution className="text-xl text-[#1a3a6b]" />
            <span className="text-[12px] font-semibold text-slate-700 group-hover:text-[#1a3a6b]">Kelola Jadwal</span>
          </button>
        </div>
      </div>

      {/* 4. SECTION RECENT ACTIVITY */}
      <div className="bg-white rounded-xl border border-gray-200/80 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[14px] font-bold text-gray-800">Aktivitas Terkini Sistem</span>
        </div>

        <div className="relative w-full sm:w-64 mb-4">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FiSearch className="text-gray-400" size={14} />
          </span>
          <input 
            type="text" 
            placeholder="Cari aktivitas..." 
            value={searchAktivitas}
            onChange={(e) => setSearchAktivitas(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Waktu", "User", "Aktivitas", "Detail"].map((h) => <TH key={h}>{h}</TH>)}
              </tr>
            </thead>
            <tbody>
              {filteredAktivitas.length > 0 ? (
                filteredAktivitas.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                    <TD className="text-gray-900 font-semibold">{r.time}</TD>
                    <TD className="font-semibold text-slate-700">{r.user}</TD>
                    <TD className="font-medium text-slate-800">{r.title}</TD>
                    <TD className="text-gray-400 text-[12px] font-medium">{r.detail}</TD>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-3 py-10 text-center text-gray-400 text-[12px] font-medium">
                    Belum ada aktivitas terbaru dari sistem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;