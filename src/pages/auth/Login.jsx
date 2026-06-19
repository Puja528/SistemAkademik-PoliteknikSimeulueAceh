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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-slate-700 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-10 transition-all">

        {/* LOGO ATAU NAMA INSTITUSI */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white text-xl font-black mb-3 select-none">
            A
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-wider">
            Sistem Informasi Academic
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Politeknik Negeri Simeulue
          </p>
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
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Email Institusi Resmi
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="nama@polteksimeulue.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition disabled:opacity-60"
            />
          </div>

          {/* INPUT PASSWORD */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
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
              className="w-full bg-slate-50 text-slate-900 text-xs font-medium px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-black focus:bg-white transition disabled:opacity-60"
            />
          </div>

          {/* TOMBOL SUBMIT */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white text-xs font-bold py-3.5 rounded-xl transition active:scale-[0.98] shadow-md flex items-center justify-center gap-2 ${
                isSubmitting ? "bg-slate-400 cursor-not-allowed" : "bg-black hover:bg-slate-800"
              }`}
            >
              {isSubmitting ? "Memverifikasi..." : "Masuk ke Akun"}
            </button>
          </div>

        </form>

        {/* FOOTER KETERANGAN */}
        <div className="text-center mt-8 pt-5 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-medium">
            Hak Akses Terbatas. Hubungi bagian BAAK jika Anda lupa kredensial akun Anda.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;