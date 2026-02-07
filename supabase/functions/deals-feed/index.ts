import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Deal {
    id: string;
    created_at: string;
    last_free_at?: string;
    is_active: boolean;
    [key: string]: any;
}

interface DealStat {
    deal_id: string;
    free_votes_24h: number;
    expired_votes_24h: number;
    last_free_at?: string;
}

Deno.serve(async (req: request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )

        const url = new URL(req.url);
        const limit = 10;
        const offset = parseInt(url.searchParams.get('offset') ?? '0');
        const deviceId = url.searchParams.get('deviceId');

        // Logic: 
        // 1. Try to get HIGH QUALITY deals first (Verified Free or New & Not flagged)
        // 2. If we don't have enough to fill the page, BACKFILL with older/risky deals
        // 3. Mark them so UI can show warning if needed

        let finalDeals: Deal[] = [];
        const MIN_CONTENT_SIZE = 10;

        // --- STAGE 1: The "Gold Standard" ---
        const { data: bestDeals, error: bestError } = await supabase
            .from('deals')
            .select('*')
            .eq('is_active', true)
            .gt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24h
            .order('created_at', { ascending: false })
            .range(0, 19); // Grab top 20 to filter

        if (bestError) throw bestError;

        // Enhance with Stats to filter out "Likely Expired"
        const bestIds = bestDeals?.map((d: Deal) => d.id) ?? [];
        const statsMap = new Map<string, DealStat>();

        if (bestIds.length > 0) {
            const { data: stats } = await supabase
                .from('deal_stats_24h')
                .select('*')
                .in('deal_id', bestIds);

            stats?.forEach((s: DealStat) => statsMap.set(s.deal_id, s));
        }

        // Strict Filter: Remove deals with high expiry votes
        const strictDeals = (bestDeals || []).filter((deal: Deal) => {
            const stat = statsMap.get(deal.id);
            if (!stat) return true; // No votes = Assume innocent
            // Filter out if Expiry votes > Free votes AND Expiry > 1
            if (stat.expired_votes_24h > 1 && stat.expired_votes_24h >= stat.free_votes_24h) return false;
            return true;
        });

        finalDeals = [...strictDeals];

        // --- STAGE 2: The "Backfill" ---
        // If we are below MIN_CONTENT_SIZE, fetch older/risky deals to ensure screen isn't blank
        if (finalDeals.length < MIN_CONTENT_SIZE) {
            const needed = MIN_CONTENT_SIZE - finalDeals.length;
            const excludeIds = finalDeals.map(d => d.id);

            // Fetch generic latest that are NOT in our strict list
            const { data: backfillDeals } = await supabase
                .from('deals')
                .select('*')
                .eq('is_active', true)
                .not('id', 'in', `(${excludeIds.join(',')})`) // Exclude what we already have
                .order('created_at', { ascending: false })
                .limit(needed * 2); // Fetch a bit more to be safe

            if (backfillDeals) {
                finalDeals = [...finalDeals, ...backfillDeals];
            }
        }

        // Paging Logic
        let pagedDeals = finalDeals;

        if (offset > 0) {
            const { data: standardDeals, error } = await supabase
                .from('deals')
                .select('*')
                .is('is_active', true)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (!error && standardDeals) pagedDeals = standardDeals;
        } else {
            // Page 0: Slice strictly
            pagedDeals = finalDeals.slice(0, limit);
        }

        // Enhance with Stats & Saved Status again for the final list
        const finalIds = pagedDeals.map(d => d.id);
        if (finalIds.length === 0) {
            return new Response(JSON.stringify([]), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Re-fetch stats for the final list (some might be new from backfill)
        const { data: finalStats } = await supabase
            .from('deal_stats_24h')
            .select('*')
            .in('deal_id', finalIds);

        const finalStatsMap = new Map<string, DealStat>(finalStats?.map((s: DealStat) => [s.deal_id, s]) ?? []);

        // Fetch saves
        let savedDealIds = new Set<string>();
        if (deviceId) {
            const { data: saves } = await supabase
                .from('deal_saves')
                .select('deal_id')
                .eq('device_id', deviceId)
                .in('deal_id', finalIds);

            if (saves) savedDealIds = new Set(saves.map((s: { deal_id: string }) => s.deal_id));
        }

        const enhancedDeals = pagedDeals.map(deal => {
            const stat = finalStatsMap.get(deal.id) || { deal_id: deal.id, free_votes_24h: 0, expired_votes_24h: 0 };
            const free = stat.free_votes_24h;
            const expired = stat.expired_votes_24h;

            let badge = 'Unverified';
            const lastFree = stat.last_free_at ? new Date(stat.last_free_at) : null;
            const now = new Date();
            const hoursSinceFree = lastFree ? (now.getTime() - lastFree.getTime()) / (1000 * 60 * 60) : 999;
            const isFresh = (now.getTime() - new Date(deal.created_at).getTime()) < (24 * 60 * 60 * 1000);

            if (free >= 3 && hoursSinceFree < 12 && free > expired) {
                badge = 'Verified Free';
            } else if (expired >= 3 && expired >= free) {
                badge = 'Likely Expired';
            } else if (isFresh && expired === 0) {
                badge = 'New';
            } else if (!isFresh && free === 0 && expired === 0) {
                badge = 'Old / Status Unknown';
            }

            return {
                ...deal,
                stats: stat,
                badge,
                is_saved: savedDealIds.has(deal.id)
            };
        });

        return new Response(JSON.stringify(enhancedDeals), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
