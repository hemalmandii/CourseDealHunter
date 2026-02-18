import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
    if (!_supabase) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (url && key) {
            _supabase = createClient(url, key);
        } else {
            // During build/prerender, return a dummy client that won't crash
            _supabase = createClient('https://placeholder.supabase.co', 'placeholder');
        }
    }
    return _supabase;
}

// Backward-compatible lazy export
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        return (getSupabase() as any)[prop];
    },
});


