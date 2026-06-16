import axios from 'axios';

const PROJECT_ID = "mwkewvjpgcvlwgycdpvo";
const API_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";
const USERS_URL = `https://${PROJECT_ID}.supabase.co/rest/v1/users`; 

const headers = {
    apikey: API_KEY,
    "Content-Type": "application/json"
};

export const authAPI = {
    async login(email, password) {
        try {
            // Menggunakan ilike untuk email agar pencarian aman dari salah ketik huruf besar/kecil
            // Menggunakan eq untuk password teks biasa yang ada di tabel users kamu
            const urlFilter = `${USERS_URL}?email=ilike.${email.trim()}&password=eq.${password.trim()}`;
            const response = await axios.get(urlFilter, { headers });

            // Jika respons berupa array kosong, berarti data tidak cocok
            if (response.data.length === 0) {
                throw new Error("Email atau kata sandi yang Anda masukkan salah.");
            }

            // Sukses, kembalikan data profil pengguna baris pertama (termasuk kolom 'role')
            return response.data[0];
        } catch (error) {
            console.error("Detail Error pada authAPI:", error.message);
            throw new Error(error.response?.data?.message || error.message);
        }
    }
};