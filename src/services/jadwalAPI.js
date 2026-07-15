import axios from 'axios';

const PROJECT_ID = "mwkewvjpgcvlwgycdpvo";
const API_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";

const BASE_URL = `https://${PROJECT_ID}.supabase.co/rest/v1/jadwal`; 

const headers = {
    apikey: API_KEY,
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation" 
};

export const jadwalAPI = {
    async fetchJadwal() {
        try {
            const response = await axios.get(BASE_URL, { headers });
            return response.data;
        } catch (error) {
            console.error("Error memuat jadwal:", error.response?.data || error.message);
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
    async updateJadwal(id_jadwal, data) {
        try {
            const urlUpdate = `${BASE_URL}?id_jadwal=eq.${id_jadwal}`;
            const response = await axios.patch(urlUpdate, data, { headers });
            return response.data;
        } catch (error) {
            throw new Error("Gagal memperbarui data jadwal.");
        }
    },
    async deleteJadwal(id_jadwal) {
        try {
            const urlDelete = `${BASE_URL}?id_jadwal=eq.${id_jadwal}`;
            const response = await axios.delete(urlDelete, { headers });
            return response.data;
        } catch (error) {
            throw new Error("Gagal menghapus data jadwal.");
        }
    }
};