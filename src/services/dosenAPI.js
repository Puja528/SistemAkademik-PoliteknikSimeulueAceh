import axios from 'axios';

const PROJECT_ID = "mwkewvjpgcvlwgycdpvo";
const API_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";

const BASE_URL = `https://${PROJECT_ID}.supabase.co/rest/v1/dosen`; 

const headers = {
    apikey: API_KEY,
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
};

export const dosenAPI = {
    // 1. Ambil Semua Data Dosen
    async fetchDosen() {
        const response = await axios.get(BASE_URL, { headers });
        return response.data;
    },

    // ── FUNGSI BARU: AMBIL 1 DATA DOSEN BERDASARKAN USER_ID (UUID) ──
    async fetchDosenByUserId(userId) {
        try {
            const urlFilter = `${BASE_URL}?user_id=eq.${userId}`;
            const response = await axios.get(urlFilter, { headers });
            return response.data[0] || null; 
        } catch (error) {
            console.error("Error fetch dosen by user_id:", error.response?.data || error.message);
            throw new Error("Gagal mengambil profil dosen dari server.");
        }
    },

    // 2. Tambah Data Dosen Baru Langsung ke Tabel
    async createDosen(dataInput) {
        try {
            const payloadDosen = {
                nidn: dataInput.nidn.trim(),
                nama: dataInput.nama.trim(),
                program_studi: dataInput.program_studi,
                email: dataInput.email.trim(),
                status: dataInput.status || "Aktif",
                user_id: dataInput.user_id // ── MODIFIKASI: Menyertakan user_id agar masuk ke DB ──
            };
            const response = await axios.post(BASE_URL, payloadDosen, { headers });
            return response.data;
        } catch (error) {
            console.error("Eror tambah dosen:", error.response?.data || error.message);
            throw new Error("Gagal menyimpan data dosen ke tabel.");
        }
    },

    // 3. Update Data Dosen
    async updateDosen(nidn, data) {
        const urlUpdate = `${BASE_URL}?nidn=eq.${nidn}`;
        const response = await axios.patch(urlUpdate, data, { headers });
        return response.data;
    },

    // 4. Hapus Data Dosen
    async deleteDosen(nidn) {
        const urlDelete = `${BASE_URL}?nidn=eq.${nidn}`;
        const response = await axios.delete(urlDelete, { headers });
        return response.data;
    }
};