import "./assets/tailwind.css";
import React, { lazy, Suspense } from "react"; 
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ---- IMPORT DARI ROLE ADMIN / STAFF (KODINGAN ANDA) ----
const MainLayouts = lazy(() => import("./layouts/MainLayouts"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Loading = lazy(() => import("./components/Loading"));
const MasterData = lazy(() => import("./pages/admin/mahasiswa/MasterMahasiswa"));
const MasterDosen = lazy(() => import("./pages/admin/dosen/MasterDosen"));
const OperasiAkademik = lazy(() => import("./pages/admin/jadwal/OperasiAkademik"));
const PublikasiNilai = lazy(() => import("./pages/admin/nilai/PublikasiNilai"));

// ---- IMPORT DARI ROLE MAHASISWA & DOSEN (KODINGAN TEMAN) ----
const Login = lazy(() => import("./pages/auth/Login"));
const DashboardUtama = lazy(() => import("./pages/mahasiswa/DashboardUtama"));
const KHS = lazy(() => import("./pages/mahasiswa/KHS"));
const Absensi = lazy(() => import("./pages/mahasiswa/Absensi"));
const DosenDashboard = lazy(() => import("./pages/Dosen/Dashboard"));
const DosenNilai = lazy(() => import("./pages/Dosen/Nilai"));
const DosenJadwal = lazy(() => import("./pages/Dosen/Jadwal"));
const DosenAbsensi = lazy(() => import("./pages/Dosen/Absensi"));
const DosenLayout = lazy(() => import("./layouts/Dosen/DosenLayout"));

// Komponen Page Loader Efek Memuat Halaman
const PageLoader = () => (
  <div className="flex min-h-screen bg-latar items-center justify-center font-poppins">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-soft-light border-t-soft-button rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-teks-samping tracking-wider uppercase font-barlow">
        Memuat Halaman...
      </p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      {/* Menggunakan PageLoader sebagai fallback utama agar seragam */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Jalur Utama Otomatis ke Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* =========================================================
              1. JALUR ROUTE ROLE ADMIN / STAFF ADMINISTRASI (ANDA) 
             ========================================================= */}
          <Route path="/admin" element={<MainLayouts />}>
            <Route path="dashboard" element={<Dashboard />} />          
            <Route path="mahasiswa" element={<MasterData />} />
            <Route path="dosen" element={<MasterDosen />} />
            <Route path="jadwal" element={<OperasiAkademik />} />
            <Route path="nilai" element={<PublikasiNilai />} />
          </Route>

          {/* =========================================================
              2. JALUR ROUTE ROLE MAHASISWA (TEMAN)
             ========================================================= */}
          <Route path="/mahasiswa" element={<DashboardUtama />} />
          <Route path="/mahasiswa/khs" element={<KHS />} />
          <Route path="/mahasiswa/presensi" element={<Absensi />} />

          {/* =========================================================
              3. JALUR ROUTE ROLE DOSEN (TEMAN)
             ========================================================= */}
          <Route element={<DosenLayout />}>
            <Route path="/dosen" element={<DosenDashboard />} />
            <Route path="/dosen/absensi" element={<DosenAbsensi />} />
            <Route path="/dosen/nilai" element={<DosenNilai />} />
            <Route path="/dosen/jadwal" element={<DosenJadwal />} />
          </Route>

          {/* Jika mengetik URL sembarangan, otomatis dilempar ke Login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;