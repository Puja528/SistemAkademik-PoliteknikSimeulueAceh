import axios from 'axios';

const PROJECT_ID = "mwkewvjpgcvlwgycdpvo";
const API_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";
const BASE_URL = `https://${PROJECT_ID}.supabase.co/rest/v1/absensi`;

const headers = {
    apikey: API_KEY,
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
};

export const absensiAPI = {
    // Ambil rekap absensi yang sudah ter-input di database berdasarkan id_jadwal dan pertemuan
    async fetchAbsensiKelas(idJadwal, pertemuan) {
        try {
            const url = `${BASE_URL}?id_jadwal=eq.${idJadwal}&pertemuan=eq.${pertemuan}`;
            const response = await axios.get(url, { headers });
            return response.data;
        } catch (error) {
            console.error("Eror fetch absensi:", error.message);
            return [];
        }
    },

    // Kirim massal data absensi mahasiswa ke database Supabase
    async simpanAbsensiKelas(payloadArray) {
        try {
            const response = await axios.post(BASE_URL, payloadArray, { headers });
            return response.data;
        } catch (error) {
            console.error("Eror simpan absensi:", error.response?.data || error.message);
            throw new Error("Gagal menyimpan rekam absensi ke server cloud.");
        }
    }
};