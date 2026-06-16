import { createClient } from '@supabase/supabase-js';

// Menggunakan PROJECT_ID dan API_KEY yang sama persis dengan file dosenAPI.js kamu
const SUPABASE_URL = "https://mwkewvjpgcvlwgycdpvo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-mjKGRjVH18ef1G8ZCjTHg_dcP5lVxK";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);