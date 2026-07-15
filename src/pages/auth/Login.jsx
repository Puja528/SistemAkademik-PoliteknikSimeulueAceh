import React, { useState } from "react";
import { authAPI } from "../../services/authAPI"; // INTEGRASI: Impor service auth berbasis Axios

const Login = ({ onLoginSukses }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pesanError, setPesanError] = useState("");

  const tanganiLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPesanError("");

    try {
      const hasilLogin = await authAPI.login(email.trim(), password);
      onLoginSukses({
        id: hasilLogin.id,
        email: hasilLogin.email,
        nama: hasilLogin.nama,
        role: hasilLogin.role 
      });

    } catch (error) {
      setPesanError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 text-slate-700 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200/60 p-8 md:p-10 transition-all">

        {/* LOGO KAMPUS LOKAL ASSETS & TEXT PORTAL */}
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-5">
          <div className="w-14 h-14 bg-white flex-shrink-0 p-0.5">
            <img 
              src="../src/assets/LogoPolteksim.png" 
              alt="Polteksim Logo" 
              className="w-full h-full object-contain"
              onError={(e) => { 
                e.target.style.display = 'none'; 
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="text-[10px] text-[#1a3a6b] font-black text-center leading-none hidden">POLTEKSIM</span>
          </div>
          
          <div>
            <h2 className="text-lg font-black text-[#1a3a6b] uppercase tracking-wider m-0 leading-tight">
              Polteksim Portal
            </h2>
            <p className="text-sm text-gray-400 font-normal m-0 mt-0.5 capitalize">
              Sistem Informasi Akademik
            </p>
          </div>
        </div>

        {/* NOTIFIKASI ERROR */}
        {pesanError && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl animate-fadeIn">
            {pesanError}
          </div>
        )}

        {/* FORM LOGIN */}
        <form onSubmit={tanganiLogin} className="space-y-5">

          {/* INPUT EMAIL */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Surat Elektronik Resmi Institusi
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="nama@polteksimeulue.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-gray-50/50 text-slate-900 text-xs font-medium px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1a3a6b] focus:bg-white transition disabled:opacity-60"
            />
          </div>

          {/* INPUT PASSWORD */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-gray-50/50 text-slate-900 text-xs font-medium px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1a3a6b] focus:bg-white transition disabled:opacity-60"
            />
          </div>

          {/* TOMBOL SUBMIT */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white text-xs font-bold py-3.5 rounded-xl transition active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#1a3a6b] hover:bg-[#244b86]"
              }`}
            >
              {isSubmitting ? "Memverifikasi..." : "Masuk ke Akun"}
            </button>
          </div>

        </form>

        {/* FOOTER KETERANGAN */}
        <div className="text-center mt-8 pt-5 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
            Hak Akses Terbatas. Hubungi bagian BAAK jika Anda melupakan informasi akun Anda.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;