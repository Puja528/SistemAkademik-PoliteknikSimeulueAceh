import "./assets/tailwind.css";
import React, { lazy, Suspense, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// ---- IMPORT DARI ROLE ADMIN / STAFF (KODINGAN ANDA) ----
const MainLayouts = lazy(() => import("./layouts/admin/MainLayouts"));
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
const MahasiswaLayout = lazy(() => import("./layouts/mahasiswa/MahasiswaLayout"));

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
  // LOGIKA PEMBACAAN SESI: Mengambil data user yang tersimpan di browser saat aplikasi di-refresh
  const [sesiUser, setSesiUser] = useState(() => {
    const dataLokal = localStorage.getItem("siakad_session");
    return dataLokal ? JSON.parse(dataLokal) : null;
  });

  // LOGIKA PENYIMPANAN SESI: Menyimpan data kiriman dari Login.jsx ke dalam state dan localStorage
  const tanganiLoginSukses = (dataProfil) => {
    setSesiUser(dataProfil);
    localStorage.setItem("siakad_session", JSON.stringify(dataProfil));
  };

  // LOGIKA LOGOUT GLOBAL
  const tanganiLogout = () => {
    setSesiUser(null);
    localStorage.removeItem("siakad_session");
  };

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Jalur Utama Otomatis langsung mengarah ke Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* LOGIKA GERBANG LOGIN DINAMIS */}
          <Route
            path="/login"
            element={
              sesiUser ? (
                sesiUser.role === "staff" ? <Navigate to="/admin/dashboard" replace /> :
                  sesiUser.role === "dosen" ? <Navigate to="/dosen" replace /> :
                    <Navigate to="/mahasiswa" replace />
              ) : (
                <Login onLoginSukses={tanganiLoginSukses} />
              )
            }
          />

          {/* =========================================================
              1. JALUR ROUTE ROLE ADMIN / STAFF ADMINISTRASI (ANDA) 
             ========================================================= */}
          <Route
            path="/admin"
            element={sesiUser?.role === "staff" ? <MainLayouts onLogout={tanganiLogout} /> : <Navigate to="/login" replace />}
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="mahasiswa" element={<MasterData />} />
            <Route path="dosen" element={<MasterDosen />} />
            <Route path="jadwal" element={<OperasiAkademik />} />
            <Route path="nilai" element={<PublikasiNilai />} />
          </Route>

          {/* =========================================================
              2. JALUR ROUTE ROLE MAHASISWA (TEMAN)
              PERBAIKAN: Mengalirkan onLogout langsung ke komponen halaman asli tanpa mengubah struktur Route bawaan
             ========================================================= */}
          <Route
            element={sesiUser?.role === "mahasiswa" ? <MahasiswaLayout onLogout={tanganiLogout} /> : <Navigate to="/login" replace />}
          >
            {/* Halaman anak tidak perlu dititipkan onLogout lagi karena sudah dihandle oleh Layout di atas */}
            <Route path="/mahasiswa" element={<DashboardUtama />} />
            <Route path="/mahasiswa/khs" element={<KHS />} />
            <Route path="/mahasiswa/presensi" element={<Absensi />} />
          </Route>

          {/* =========================================================
              3. JALUR ROUTE ROLE DOSEN (TEMAN)
             ========================================================= */}
          <Route
            element={sesiUser?.role === "dosen" ? <DosenLayout onLogout={tanganiLogout} /> : <Navigate to="/login" replace />}
          >
            <Route path="/dosen" element={<DosenDashboard />} />
            <Route path="/dosen/absensi" element={<DosenAbsensi />} />
            <Route path="/dosen/nilai" element={<DosenNilai />} />
            <Route path="/dosen/jadwal" element={<DosenJadwal />} />
          </Route>

          {/* Rute Cerdas URL Acak */}
          <Route
            path="*"
            element={
              sesiUser ? (
                sesiUser.role === "staff" ? <Navigate to="/admin/dashboard" replace /> :
                  sesiUser.role === "dosen" ? <Navigate to="/dosen" replace /> :
                    <Navigate to="/mahasiswa" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;