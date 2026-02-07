
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://edzquzoglijjxlslbyll.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkenF1em9nbGlqanhsc2xieWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDgxMDQsImV4cCI6MjA4NDQ4NDEwNH0.ACuQ0C_KSpB7tACF4gsBzE7a6M6RoE6Dw2I823qdZ-s';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
