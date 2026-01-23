import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )

        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') ?? '20');
        const offset = parseInt(url.searchParams.get('offset') ?? '0');

        // Fetch deals
        // TODO: Ideally use a joined query if relationships setup, or RPC
        const { data: deals, error } = await supabase
            .from('deals')
            .select('*')
            .is('is_active', true)
            .order('last_seen_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        if (!deals.length) {
            return new Response(JSON.stringify([]), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Fetch stats for these deals
        const dealIds = deals.map(d => d.id);
        const { data: stats } = await supabase
            .from('deal_stats_24h')
            .select('*')
            .in('deal_id', dealIds);

        const statsMap = new Map(stats?.map(s => [s.deal_id, s]) ?? []);

        // Enhance deals with badge logic
        const enhancedDeals = deals.map(deal => {
            const stat = statsMap.get(deal.id) || { free_votes_24h: 0, expired_votes_24h: 0 };
            const free = stat.free_votes_24h;
            const expired = stat.expired_votes_24h;

            // Badge Logic
            // Verified Free: >= 3 free votes AND last_free_at within 12h AND free > expired
            // Likely Expired: expired >= 3 AND expired >= free
            // Unverified: Else

            let badge = 'Unverified';
            const lastFree = stat.last_free_at ? new Date(stat.last_free_at) : null;
            const now = new Date();
            const hoursSinceFree = lastFree ? (now.getTime() - lastFree.getTime()) / (1000 * 60 * 60) : 999;

            if (free >= 3 && hoursSinceFree < 12 && free > expired) {
                badge = 'Verified Free';
            } else if (expired >= 3 && expired >= free) {
                badge = 'Likely Expired';
            }

            return {
                ...deal,
                stats: stat,
                badge
            };
        });

        return new Response(JSON.stringify(enhancedDeals), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
