import axios from 'axios';

const PROJECT_ID = "mwkewvjpgcvlwgycdpvo";
const API_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";

// Base URL langsung mengarah ke endpoint tabel 'jadwal'
const BASE_URL = `https://${PROJECT_ID}.supabase.co/rest/v1/jadwal`; 

const headers = {
    apikey: API_KEY,
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    // Menambahkan preferensi agar Supabase mengembalikan data yang baru dimasukkan/diubah
    "Prefer": "return=representation" 
};

export const jadwalAPI = {
    async fetchJadwal() {
        try {
            const response = await axios.get(BASE_URL, { headers });
            return response.data;
        } catch (error) {
            console.error("Eror memuat jadwal:", error.response?.data || error.message);
            throw new Error("Gagal mengambil data jadwal.");
        }
    },
    async createJadwal(dataInput) {
        try {
            const response = await axios.post(BASE_URL, dataInput, { headers });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || "Gagal simpan jadwal.");
        }
    },
    // PERBAIKAN: Gunakan 'id' sesuai skema database kamu
    async updateJadwal(id, data) {
        try {
            const urlUpdate = `${BASE_URL}?id=eq.${id}`;
            const response = await axios.patch(urlUpdate, data, { headers });
            return response.data;
        } catch (error) {
            throw new Error("Gagal memperbarui data jadwal.");
        }
    },
    async deleteJadwal(id) {
        try {
            const urlDelete = `${BASE_URL}?id=eq.${id}`;
            const response = await axios.delete(urlDelete, { headers });
            return response.data;
        } catch (error) {
            throw new Error("Gagal menghapus data jadwal.");
        }
    }
};