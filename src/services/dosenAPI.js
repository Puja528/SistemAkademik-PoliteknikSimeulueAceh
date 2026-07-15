import axios from 'axios';

const PROJECT_ID = "mwkewvjpgcvlwgycdpvo";
const API_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";

const BASE_URL = `https://${PROJECT_ID}.supabase.co/rest/v1/dosen`;
const STORAGE_URL = `https://${PROJECT_ID}.supabase.co/storage/v1/object`;
const USERS_URL = `https://${PROJECT_ID}.supabase.co/rest/v1/users`;

const headers = {
    apikey: API_KEY,
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
};

export const dosenAPI = {
    async fetchDosen() {
        const response = await axios.get(BASE_URL, { headers });
        return response.data;
    },

    async fetchDosenByUserId(userId) {
        try {
            const urlFilter = `${BASE_URL}?user_id=eq.${userId}`;
            const response = await axios.get(urlFilter, { headers });
            return response.data[0] || null;
        } catch (error) {
            console.error(error.message);
            throw new Error("Gagal mengambil profil dosen.");
        }
    },

    async createDosen(dataInput) {
        try {
            const payloadDosen = {
                nidn: dataInput.nidn.trim(),
                nama: dataInput.nama.trim(),
                program_studi: dataInput.program_studi,
                email: dataInput.email.trim(),
                status: dataInput.status || "Aktif",
                user_id: dataInput.user_id
            };
            const response = await axios.post(BASE_URL, payloadDosen, { headers });
            return response.data;
        } catch (error) {
            console.error(error.message);
            throw new Error("Gagal menyimpan data dosen.");
        }
    },

    async updateDosen(nidn, data) {
        const urlUpdate = `${BASE_URL}?nidn=eq.${nidn}`;
        const response = await axios.patch(urlUpdate, data, { headers });
        return response.data;
    },

    async deleteDosen(nidn) {
        const urlDelete = `${BASE_URL}?nidn=eq.${nidn}`;
        const response = await axios.delete(urlDelete, { headers });
        return response.data;
    },

    // ── FIXED DASHBOARD DATA (Mengatasi Error 400 Bad Request) ──
    async fetchDashboardData(nidn) {
        try {
            const hariIni = new Date().toLocaleDateString("id-ID", { weekday: "long" });
            const jadwalUrl = BASE_URL.replace('dosen', 'jadwal');
            const absensiUrl = BASE_URL.replace('dosen', 'absensi');

            const resJadwal = await axios.get(`${jadwalUrl}?nidn_dosen=eq.${nidn}`, { headers });
            
            // Validasi dan pemetaan ID jadwal untuk menghindari penulisan query kosong/salah format
            const idJadwalList = resJadwal.data
                .map(j => j.id_jadwal)
                .filter(id => id !== undefined && id !== null);
            
            const resJadwalHariIni = resJadwal.data.filter(j => j.hari === hariIni);
            const resNilai = await axios.get(`${jadwalUrl}?nidn_dosen=eq.${nidn}&select=mata_kuliah,status_nilai`, { headers });
            
            let resAbsen = { data: [] };
            if (idJadwalList.length > 0) {
                // Mengambil data absensi mendasar secara aman untuk menghindari error join relasi Supabase
                const queryUrl = `${absensiUrl}?id_jadwal=in.(${idJadwalList.join(',')})&select=id_mahasiswa,status_kehadiran`;
                resAbsen = await axios.get(queryUrl, { headers });
            }

            return {
                jadwal: resJadwalHariIni,
                nilai: resNilai.data,
                disabled: resAbsen.data // Mengembalikan data absen ke properti 'disabled' sesuai kebutuhan file Dashboard Anda
            };
        } catch (error) {
            // Log detail ke konsol jika Supabase menolak request untuk mempermudah debugging kedepannya
            console.error("Detail Error Supabase Dashboard:", error.response?.data || error.message);
            return { jadwal: [], nilai: [], disabled: [] };
        }
    },

    // ── FITUR BARU 1: UPLOAD FOTO PROFIL (FINAL FIXED) ──
    async uploadFotoProfil(file, fileName, currentNidn) {
        try {
            const uploadUrl = `${STORAGE_URL}/akademik-avatar/${fileName}`;
            const fileBuffer = await file.arrayBuffer();
            
            await axios.post(uploadUrl, fileBuffer, {
                headers: {
                    ...headers,
                    "Content-Type": file.type,
                    "x-upsert": "true" 
                }
            });

            const publicUrl = `https://${PROJECT_ID}.supabase.co/storage/v1/object/public/akademik-avatar/${fileName}`;
            await this.updateDosen(currentNidn, { foto: publicUrl });

            return publicUrl;
        } catch (error) {
            console.error("Detail Error Lengkap Storage:", error.response?.data || error);
            throw new Error(error.response?.data?.message || "Gagal mengunggah foto profil ke Storage.");
        }
    },

    async ubahPasswordUser(userId, passwordBaru) {
        try {
            const urlUpdatePassword = `${USERS_URL}?id=eq.${userId}`;
            const response = await axios.patch(urlUpdatePassword, { password: passwordBaru }, { headers });
            return response.data;
        } catch (error) {
            console.error(error);
            throw new Error("Gagal mengubah kata sandi akun.");
        }
    }
};