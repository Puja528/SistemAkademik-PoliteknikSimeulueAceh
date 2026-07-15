import axios from 'axios';

const BASE_URL = "https://mwkewvjpgcvlwgycdpvo.supabase.co/rest/v1/mahasiswa";
const API_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";

const headers = {
    apikey: API_KEY,
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
};

export const mahasiswaAPI = {
    async fetchMahasiswa() {
        const url = `${BASE_URL}?select=*,kelas(nama_kelas)`;
        const response = await axios.get(url, { headers });
        return response.data;

    },

    async fetchMahasiswaByUserId(userId) {
        try {
            const urlFilter = `${BASE_URL}?user_id=eq.${userId}`;
            const response = await axios.get(urlFilter, { headers });
            return response.data[0] || null;
        } catch (error) {
            console.error("Error fetch mahasiswa by user_id:", error.response?.data || error.message);
            throw new Error("Gagal mengambil profil mahasiswa dari server.");
        }
    },

    async createMahasiswa(data) {
        const payload = {
            id_mahasiswa: data.id_mahasiswa,
            nama: data.nama,
            program_studi: data.program_studi,
            email: data.email,
            id_kelas: data.id_kelas,
            angkatan: Number(data.angkatan),
            status: data.status,
            user_id: data.user_id
        };
        const response = await axios.post(BASE_URL, payload, { headers });
        return response.data;
    },

    async updateMahasiswa(id, data) {
        const urlUpdate = `${BASE_URL}?id_mahasiswa=eq.${id}`;
        const payload = {
            id_mahasiswa: data.id_mahasiswa,
            nama: data.nama,
            program_studi: data.program_studi,
            email: data.email,
            id_kelas: data.id_kelas,
            angkatan: data.angkatan,
            status: data.status
        };
        const response = await axios.patch(urlUpdate, payload, { headers });
        return response.data;
    },

    async deleteMahasiswa(id) {
        const urlDelete = `${BASE_URL}?id_mahasiswa=eq.${id}`;
        const response = await axios.delete(urlDelete, { headers });
        return response.data;
    }
};