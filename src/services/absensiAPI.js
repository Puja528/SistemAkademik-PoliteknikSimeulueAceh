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
    async fetchAbsensiKelas(idJadwal, pertemuan) {
        const url = `${BASE_URL}?id_jadwal=eq.${idJadwal}&pertemuan=eq.${pertemuan}`;
        const res = await axios.get(url, { headers });
        return res.data;
    },
    // Fungsi untuk mahasiswa mengambil riwayat absensinya sendiri
    async fetchAbsensiMahasiswa(idMahasiswa) {
        const url = `${BASE_URL}?id_mahasiswa=eq.${idMahasiswa}&select=*,jadwal(mata_kuliah,sks)`;
        const res = await axios.get(url, { headers });
        return res.data;
    },
    async simpanAbsensiKelas(payloadArray) {
        // Menggunakan upsert untuk menghindari duplikasi jika tanggal/pertemuan sama
        const url = `${BASE_URL}?on_conflict=id_absen`;
        const res = await axios.post(BASE_URL, payloadArray, { headers });
        return res.data;
    }
};