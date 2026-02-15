import { supabase } from './supabase';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`;
const REST_BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY,
};

export async function fetchDeals(offset = 0, limit = 10, deviceId?: string) {
    try {
        const { data, error } = await supabase.rpc('get_home_feed', {
            p_limit: limit,
            p_offset: offset,
            p_device_id: deviceId,
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
        if (deviceId) url += `&deviceId=${deviceId}`;
        const response = await fetch(url, { headers });
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
        if (!response.ok) throw new Error('Search failed: ' + response.status);
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
        if (!response.ok) throw new Error('Toggle save failed: ' + response.status);
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
        const REST_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1`;
        const res = await fetch(`${REST_URL}/user_stats?device_id=eq.${deviceId}&select=*`, {
            headers,
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data[0] || null;
    } catch (e) {
        console.error(e);
        return null;
    }
}
