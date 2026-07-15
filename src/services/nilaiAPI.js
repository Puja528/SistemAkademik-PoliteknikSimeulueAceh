import axios from 'axios';

const PROJECT_ID = "mwkewvjpgcvlwgycdpvo";
const API_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";

// Base URL langsung mengarah ke endpoint tabel 'nilai'
const BASE_URL = `https://${PROJECT_ID}.supabase.co/rest/v1/nilai`;
// URL untuk tabel jadwal karena nanti kita butuh update status_nilai di sana
const JADWAL_URL = `https://${PROJECT_ID}.supabase.co/rest/v1/jadwal`;

const headers = {
    apikey: API_KEY,
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
};

export const nilaiAPI = {
    // 1. Ambil detail nilai mahasiswa berdasarkan id_jadwal (Dipakai Sisi Admin & Dosen)
    // Menggunakan embedding select untuk menarik data profil mahasiswa sekaligus
    async fetchDetailNilaiMahasiswa(idJadwal) {
        try {
            const urlFetch = `${BASE_URL}?id_jadwal=eq.${idJadwal}&select=*,mahasiswa(*)`;
            const response = await axios.get(urlFetch, { headers });
            return response.data;
        } catch (error) {
            console.error("Eror memuat rincian nilai:", error.response?.data || error.message);
            throw new Error("Gagal mengambil rincian nilai mahasiswa dari server.");
        }
    },

    // 2. Simpan atau Upsert Nilai (Bisa buat input baru / update nilai lama)
    async simpanNilaiMahasiswa(dataNilaiArray) {
        try {
            // Supabase mendukung bulk insert/upsert dengan mengirim array of object langsung
            // Menggunakan On-Conflict id agar jika id sudah ada, dia otomatis meng-update
            const response = await axios.post(BASE_URL, dataNilaiArray, { headers });
            return response.data;
        } catch (error) {
            console.error("Detail Eror Supabase (Simpan Nilai):", error.response?.data || error.message);
            const pesanDetail = error.response?.data?.message || "Gagal menyimpan perubahan data nilai ke tabel.";
            throw new Error(pesanDetail);
        }
    },

    // 3. Update status_nilai di tabel jadwal menjadi 'Terbit' atau 'Draft' (Dipakai Sisi Admin/Dosen)
    // 3. Update status_nilai di tabel jadwal
    async updateStatusJadwalNilai(idJadwal, status, tanggalInput = null) {
        try {
            // PERBAIKAN: Gunakan 'id_jadwal' sesuai struktur tabel kamu
            const urlUpdate = `${JADWAL_URL}?id_jadwal=eq.${idJadwal}`;

            const dataPayload = {
                status_nilai: status,
                tanggal_input_nilai: tanggalInput || new Date().toISOString().split('T')[0]
            };

            // Menggunakan PATCH untuk update data
            const response = await axios.patch(urlUpdate, dataPayload, { headers });
            return response.data;
        } catch (error) {
            console.error("Error update status:", error.response?.data || error.message);
            throw new Error("Gagal memperbarui status publikasi nilai di server.");
        }
    },

    // Tambahkan fungsi ini ke dalam nilaiAPI
    async publikasikanNilai(idJadwal) {
        try {
            const urlUpdate = `${JADWAL_URL}?id_jadwal=eq.${idJadwal}`;
            const response = await axios.patch(urlUpdate, {
                status_nilai: "Terbit"
            }, { headers });
            return response.data;
        } catch (error) {
            console.error("Error publikasi nilai:", error.response?.data || error.message);
            throw new Error("Gagal mempublikasikan nilai.");
        }
    },

    // Pastikan fungsi ini ada untuk Admin
    async fetchRekapNilaiAdmin() {
        try {
            // Mengambil semua data jadwal
            const response = await axios.get(JADWAL_URL, { headers });
            return response.data;
        } catch (error) {
            throw new Error("Gagal mengambil data jadwal untuk admin.");
        }
    },

    async fetchKHSMahasiswa(idMahasiswa) {
    try {
        // Kita join dengan tabel jadwal agar nama mata kuliah dan SKS bisa terbaca
        // Gunakan filter status_nilai=eq.Terbit agar hanya nilai yang sudah dipublikasi yang tampil
        const urlKHS = `${BASE_URL}?id_mahasiswa=eq.${idMahasiswa}&select=*,jadwal(mata_kuliah,kode_mk,sks,semester)&jadwal.status_nilai=eq.Terbit`;
        const response = await axios.get(urlKHS, { headers });
        return response.data;
    } catch (error) {
        console.error("Eror memuat KHS:", error.response?.data || error.message);
        throw new Error("Gagal memuat data Kartu Hasil Studi.");
    }
}
};