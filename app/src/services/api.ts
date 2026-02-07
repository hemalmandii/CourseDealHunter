import Constants from 'expo-constants';
import { supabase } from '../utils/supabase'; // Ensure this path is correct based on your project structure

console.log('DEBUG: Loaded supabase module:', supabase);
if (!supabase) console.error('CRITICAL: Supabase client is UNDEFINED');
if (supabase && !supabase.rpc) console.error('CRITICAL: Supabase RPC method missing');

// For local dev with Supabase Edge Functions, it's usually http://localhost:54321/functions/v1
// But on real device/emulator, localhost is different. 
// User should replace this.
export const API_BASE_URL = 'https://edzquzoglijjxlslbyll.supabase.co/functions/v1';
export const REST_BASE_URL = 'https://edzquzoglijjxlslbyll.supabase.co/rest/v1';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkenF1em9nbGlqanhsc2xieWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDgxMDQsImV4cCI6MjA4NDQ4NDEwNH0.ACuQ0C_KSpB7tACF4gsBzE7a6M6RoE6Dw2I823qdZ-s';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY,
};

// Migrated to SQL RPC for reliability
export async function fetchDeals(offset = 0, limit = 10, deviceId?: string) {
    try {
        const { data, error } = await supabase.rpc('get_home_feed', {
            p_limit: limit,
            p_offset: offset,
            p_device_id: deviceId
        });

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('Fetch Deals RPC Error:', e);
        return [];
    }
}

export async function fetchDeal(id: string, deviceId?: string) {
    try {
        const t = new Date().getTime();
        let url = `${API_BASE_URL}/deal-detail?id=${id}&t=${t}`;
        if (deviceId) {
            url += `&deviceId=${deviceId}`;
        }
        const response = await fetch(url, {
            headers
        });
        if (!response.ok) throw new Error('Failed to fetch deal');
        return await response.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function submitVote(dealId: string, deviceId: string, vote: 'free' | 'expired') {
    try {
        const response = await fetch(`${API_BASE_URL}/vote`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ deal_id: dealId, device_id: deviceId, vote }),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Failed to vote');
        }
        return await response.json();
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export async function searchDeals(query: string) {
    try {
        const response = await fetch(`${REST_BASE_URL}/rpc/search_deals`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ query }),
        });
        if (!response.ok) {
            const text = await response.text();
            console.error('Search failed status:', response.status, text);
            throw new Error('Search failed: ' + response.status);
        }
        return await response.json();
    } catch (e) {
        console.error('Search Error:', e);
        return [];
    }
}

export async function toggleSaveDeal(dealId: string, deviceId: string) {
    try {
        const response = await fetch(`${REST_BASE_URL}/rpc/toggle_save_deal`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ p_deal_id: dealId, p_device_id: deviceId }),
        });
        if (!response.ok) {
            const text = await response.text();
            console.error('Toggle Save failed status:', response.status, text);
            throw new Error('Toggle save failed: ' + response.status);
        }
        return await response.json();
    } catch (e) {
        console.error('Toggle Save Error:', e);
        throw e;
    }
}

export async function fetchSavedDeals(deviceId: string) {
    try {
        const response = await fetch(`${REST_BASE_URL}/rpc/get_saved_deals`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ p_device_id: deviceId }),
        });
        if (!response.ok) throw new Error('Failed to fetch saved deals');
        return await response.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function getUserStats(deviceId: string) {
    try {
        // Direct table select via REST
        const response = await fetch(`${API_BASE_URL}/../rest/v1/user_stats?device_id=eq.${deviceId}&select=*`, {
            headers: { ...headers, 'apikey': SUPABASE_ANON_KEY } // REST requires proper apikey header in some configs
        });
        // Note: Edge Functions URL is functions/v1. REST is at root /rest/v1.
        // We need the Project URL.
        const REST_URL = API_BASE_URL.replace('/functions/v1', '/rest/v1');

        const res = await fetch(`${REST_URL}/user_stats?device_id=eq.${deviceId}&select=*`, {
            headers
        });

        if (!res.ok) return null;
        const data = await res.json();
        return data[0] || null;
    } catch (e) {
        console.error(e);
        return null;
    }
}
