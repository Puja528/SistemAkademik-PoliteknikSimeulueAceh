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

// Helper Komponen Tabel - Diselaraskan dengan standardisasi DaisyUI text & spacing
const TH = ({ children, className = "" }) => (
  <th className={`text-[11px] font-bold text-slate-400 uppercase tracking-wider px-4 py-3 border-b border-gray-100 text-left bg-transparent ${className}`}>{children}</th>
);

const TD = ({ children, className = "" }) => (
  <td className={`px-4 py-3.5 text-xs text-slate-600 border-b border-slate-50 transition-colors ${className}`}>{children}</td>
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

  // 2. Hook Kedua: Mengambil Seluruh Data API Secara Kolektif Sekaligus
  useEffect(() => {
    let didCancel = false;

    const muatSeluruhDataDashboard = async () => {
      try {
        setLoading(true);
        
        const localSession = JSON.parse(localStorage.getItem("siakad_session"));
        
        const [dataStats, dataAktivitas] = await Promise.all([
          dashboardAPI.fetchDashboardStats(),
          dashboardAPI.fetchRecentActivities()
        ]);

        if (!didCancel) {
          setProfilAdmin(localSession || { nama: "Staff Administrasi", role: "Super Admin" });
          setStats(dataStats);

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

    return () => {
      didCancel = true;
    };
  }, []);

  const hari = waktu.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const jam = waktu.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const filteredAktivitas = aktivitas.filter((item) =>
    item.title.toLowerCase().includes(searchAktivitas.toLowerCase()) || 
    item.user.toLowerCase().includes(searchAktivitas.toLowerCase())
  );

  if (loading) return <div className="p-6 flex justify-center items-center min-h-screen"><Loading /></div>;

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 bg-slate-50/50 min-h-screen animate-fadeIn font-sans">
      {/* 1. HEADER & PROFIL (Gradasi & Blur Box DaisyUI) */}
      <div 
        className="card shadow-xs rounded-xl p-5 md:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, #1a3a6b 0%, #244b86 60%, #2e5fa3 100%)' }}
      >
        <div>
          <h1 className="text-lg md:text-xl font-black m-0 mb-1 tracking-tight">Selamat Datang, {profilAdmin?.nama}</h1>
          <p className="text-[11px] md:text-xs opacity-80 m-0 font-medium tracking-wide">
            SIAKAD Politeknik Simeulue Aceh · Hak Akses: {profilAdmin?.role || "Staff Administrasi"}
          </p>
        </div>
        <div className="text-right flex-shrink-0 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 self-start sm:self-auto shadow-inner">
          <div className="text-[9px] opacity-75 mb-0.5 font-bold uppercase tracking-wider">{hari}</div>
          <div className="text-base md:text-lg font-mono font-black tracking-wider">{jam} WIB</div>
        </div>
      </div>

      {/* 2. SECTION STATISTIK (Menggunakan Stats Card DaisyUI) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: AiOutlineUser, label: "Total Mahasiswa", value: stats.totalStudents, sub: "Data Terintegrasi" },
          { icon: AiOutlineBook, label: "Total Dosen", value: stats.totalLecturers, sub: "Semester Berjalan" },
          { icon: AiOutlineCalendar, label: "Total Jadwal Kuliah", value: stats.totalSchedules, sub: "Aktif Terjadwal" },
        ].map(({ icon: Icon, label, value, sub }, i) => (
          <div key={i} className="stats shadow-xs border border-gray-100 rounded-xl bg-white overflow-hidden">
            <div className="stat p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon size={15} className="text-[#1a3a6b]" />
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">{label}</span>
                </div>
                <div className="stat-value text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{value}</div>
              </div>
              <div className="stat-desc text-[10px] text-slate-400 font-medium tracking-wide mt-2">{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. SECTION QUICK ACTIONS (Tombol Seragam Dengan DaisyUI) */}
      <div className="card shadow-xs border border-gray-100 bg-white rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FiCalendar size={15} className="text-[#1a3a6b]" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Aksi Cepat Administrasi</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/admin/mahasiswa/')}
            className="btn btn-outline hover:bg-[#1a3a6b] hover:text-white border-slate-200 hover:border-[#1a3a6b] h-auto py-5 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-150 shadow-xs normal-case font-sans font-bold group"
          >
            <AiOutlineUserAdd className="text-lg text-[#1a3a6b] group-hover:text-white transition-colors" />
            <span className="text-xs text-slate-600 group-hover:text-white transition-colors">Tambah Mahasiswa</span>
          </button>

          <button 
            onClick={() => navigate('/admin/dosen/')}
            className="btn btn-outline hover:bg-[#1a3a6b] hover:text-white border-slate-200 hover:border-[#1a3a6b] h-auto py-5 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-150 shadow-xs normal-case font-sans font-bold group"
          >
            <AiOutlinePlusCircle className="text-lg text-[#1a3a6b] group-hover:text-white transition-colors" />
            <span className="text-xs text-slate-600 group-hover:text-white transition-colors">Tambah Dosen</span>
          </button>

          <button 
            onClick={() => navigate('/admin/jadwal')}
            className="btn btn-outline hover:bg-[#1a3a6b] hover:text-white border-slate-200 hover:border-[#1a3a6b] h-auto py-5 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-150 shadow-xs normal-case font-sans font-bold group"
          >
            <AiOutlineSolution className="text-lg text-[#1a3a6b] group-hover:text-white transition-colors" />
            <span className="text-xs text-slate-600 group-hover:text-white transition-colors">Kelola Jadwal</span>
          </button>
        </div>
      </div>

      {/* 4. SECTION RECENT ACTIVITY (Komponen Tabel & Cari DaisyUI) */}
      <div className="card shadow-xs border border-gray-100 bg-white rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Aktivitas Terkini Sistem</span>
        </div>

        {/* Form Input Group DaisyUI */}
        <div className="form-control w-full sm:w-64 mb-4">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="text-slate-400" size={13} />
            </span>
            <input 
              type="text" 
              placeholder="Cari aktivitas..." 
              value={searchAktivitas}
              onChange={(e) => setSearchAktivitas(e.target.value)}
              className="input input-xs h-8 pl-9 pr-3 w-full bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium placeholder-slate-400 focus:outline-hidden focus:border-slate-400 focus:bg-white transition-all shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="table w-full border-none">
            <thead>
              <tr className="bg-transparent border-none">
                {["Waktu", "User", "Aktivitas", "Detail"].map((h) => <TH key={h}>{h}</TH>)}
              </tr>
            </thead>
            <tbody>
              {filteredAktivitas.length > 0 ? (
                filteredAktivitas.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 border-none transition-colors">
                    <TD className="text-slate-900 font-bold">{r.time}</TD>
                    <TD className="font-bold text-slate-700">{r.user}</TD>
                    <TD className="font-semibold text-slate-800">{r.title}</TD>
                    <TD className="text-slate-400 font-medium">{r.detail}</TD>
                  </tr>
                ))
              ) : (
                <tr className="border-none">
                  <td colSpan="4" className="px-4 py-12 text-center text-slate-400 text-xs font-semibold bg-transparent">
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