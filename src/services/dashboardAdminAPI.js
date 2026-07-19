import axios from 'axios';

const PROJECT_ID = "mwkewvjpgcvlwgycdpvo";
const API_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";
const headers = { apikey: API_KEY, Authorization: `Bearer ${API_KEY}` };

export const dashboardAPI = {
    async fetchDashboardStats() {
        // Mengambil jumlah total baris dari tiap tabel
        const [resMhs, resDosen, resJadwal] = await Promise.all([
            axios.get(`https://${PROJECT_ID}.supabase.co/rest/v1/mahasiswa?select=count`, { headers }),
            axios.get(`https://${PROJECT_ID}.supabase.co/rest/v1/dosen?select=count`, { headers }),
            axios.get(`https://${PROJECT_ID}.supabase.co/rest/v1/jadwal?select=count`, { headers })
        ]);

        return {
            totalStudents: resMhs.data[0].count,
            totalLecturers: resDosen.data[0].count,
            totalSchedules: resJadwal.data[0].count
        };
    },
    
    async logAktivitas(judul, detail, tipe, userName) {
        await axios.post(`https://${PROJECT_ID}.supabase.co/rest/v1/aktivitas`, {
            judul, detail, tipe, user_name: userName
        }, { headers });
    },

    async fetchRecentActivities() {
        // Ambil 5 aktivitas terbaru
        const res = await axios.get(`https://${PROJECT_ID}.supabase.co/rest/v1/aktivitas?order=waktu.desc&limit=5`, { headers });
        return res.data;
    }
};