import axios from 'axios';

// Menggunakan data asli proyek Supabase kamu sesuai konfigurasi tim
const BASE_URL = "https://mwkewvjpgcvlwgycdpvo.supabase.co/rest/v1/mahasiswa"; 
const API_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";

const headers = {
    apikey: API_KEY,
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
};

export const mahasiswaAPI = {
    // 1. Ambil Semua Data
    async fetchMahasiswa() {
        const response = await axios.get(BASE_URL, { headers });
        return response.data;
    },

    // ── FUNGSI BARU: AMBIL 1 DATA MAHASISWA BERDASARKAN USER_ID (UUID) ──
    async fetchMahasiswaByUserId(userId) {
        try {
            // Menggunakan filter REST API Supabase: url?user_id=eq.UUID
            const urlFilter = `${BASE_URL}?user_id=eq.${userId}`;
            const response = await axios.get(urlFilter, { headers });
            
            // PostgREST Supabase selalu mengembalikan Array. 
            // Kita ambil indeks ke-0 karena datanya pasti tunggal/satu.
            return response.data[0] || null;
        } catch (error) {
            console.error("Error fetch mahasiswa by user_id:", error.response?.data || error.message);
            throw new Error("Gagal mengambil profil mahasiswa dari server.");
        }
    },

    // 2. Tambah Data Baru
    async createMahasiswa(data) {
        const response = await axios.post(BASE_URL, data, { headers });
        return response.data;
    },

    // 3. Update Data (Berdasarkan id_mahasiswa / NIM)
    async updateMahasiswa(id, data) {
        // Format query param di Supabase untuk filter: ?id_mahasiswa=eq.NIM
        const urlUpdate = `${BASE_URL}?id_mahasiswa=eq.${id}`;
        const response = await axios.patch(urlUpdate, data, { headers });
        return response.data;
    },

    // 4. Hapus Data
    async deleteMahasiswa(id) {
        const urlDelete = `${BASE_URL}?id_mahasiswa=eq.${id}`;
        const response = await axios.delete(urlDelete, { headers });
        return response.data;
    }
};