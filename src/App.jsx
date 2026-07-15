import "./assets/tailwind.css";
import React, { lazy, Suspense, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

const MainLayouts = lazy(() => import("./layouts/admin/MainLayouts"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const Loading = lazy(() => import("./components/admin/Loading"));
const MasterData = lazy(() => import("./pages/admin/mahasiswa/MasterMahasiswa"));
const TambahMahasiswa = lazy(() => import("./pages/admin/mahasiswa/TambahMahasiswa"));
const MasterDosen = lazy(() => import("./pages/admin/dosen/MasterDosen"));
const TambahDosen = lazy(() => import("./pages/admin/dosen/TambahDosen"));
const OperasiAkademik = lazy(() => import("./pages/admin/jadwal/MasterJadwal"));
const PublikasiNilai = lazy(() => import("./pages/admin/nilai/PublikasiNilai"));

const Login = lazy(() => import("./pages/auth/Login"));
const DashboardUtama = lazy(() => import("./pages/mahasiswa/DashboardUtama"));
const KHS = lazy(() => import("./pages/mahasiswa/KHS"));
const Profil = lazy(() => import("./pages/mahasiswa/Profil"));

const Absensi = lazy(() => import("./pages/mahasiswa/Absensi"));
const MahasiswaLayout = lazy(() => import("./layouts/mahasiswa/MahasiswaLayout"));
const Transkrip = lazy(() => import("./pages/mahasiswa/Transkrip"));
const DosenDashboard = lazy(() => import("./pages/Dosen/Dashboard"));
const DosenNilai = lazy(() => import("./pages/Dosen/Nilai"));
const DosenJadwal = lazy(() => import("./pages/Dosen/Jadwal"));
const DosenAbsensi = lazy(() => import("./pages/Dosen/Absensi"));
const DosenLayout = lazy(() => import("./layouts/Dosen/DosenLayout"));
const DosenProfil = lazy(() => import("./pages/Dosen/Profil"));

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
  const [sesiUser, setSesiUser] = useState(() => {
    const dataLokal = localStorage.getItem("siakad_session");
    return dataLokal ? JSON.parse(dataLokal) : null;
  });

  const tanganiLoginSukses = (dataProfil) => {
    setSesiUser(dataProfil);
    localStorage.setItem("siakad_session", JSON.stringify(dataProfil));
  };

  const tanganiLogout = () => {
    setSesiUser(null);
    localStorage.removeItem("siakad_session");
  };

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

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

          <Route
            path="/admin"
            element={sesiUser?.role === "staff" ? <MainLayouts onLogout={tanganiLogout} /> : <Navigate to="/login" replace />}
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="mahasiswa" element={<MasterData />} />
            <Route path="mahasiswa/TambahMahasiswa" element={<TambahMahasiswa />} />
            <Route path="dosen" element={<MasterDosen />} />
            <Route path="dosen/TambahDosen" element={<TambahDosen />} />
            <Route path="jadwal" element={<OperasiAkademik />} />
            <Route path="nilai" element={<PublikasiNilai />} />
          </Route>

          <Route
            element={sesiUser?.role === "mahasiswa" ? <MahasiswaLayout onLogout={tanganiLogout} /> : <Navigate to="/login" replace />}
          >
            <Route path="/mahasiswa" element={<DashboardUtama />} />
            <Route path="/mahasiswa/khs" element={<KHS />} />
            <Route path="/mahasiswa/transkrip" element={<Transkrip />} />
            <Route path="/mahasiswa/presensi" element={<Absensi />} />
            <Route path="/mahasiswa/profil" element={<Profil />} />
          </Route>

          <Route
            element={sesiUser?.role === "dosen" ? <DosenLayout onLogout={tanganiLogout} /> : <Navigate to="/login" replace />}
          >
            <Route path="/dosen" element={<DosenDashboard />} />
            <Route path="/dosen/absensi" element={<DosenAbsensi />} />
            <Route path="/dosen/nilai" element={<DosenNilai />} />
            <Route path="/dosen/jadwal" element={<DosenJadwal />} />
            <Route path="/dosen/profil" element={<DosenProfil />} />
          </Route>

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