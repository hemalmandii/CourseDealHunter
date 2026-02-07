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
        const id = url.searchParams.get('id');
        const deviceId = url.searchParams.get('deviceId');

        if (!id) {
            return new Response(JSON.stringify({ error: 'Missing id' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const { data: deal, error } = await supabase
            .from('deals')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Get saved status
        let isSaved = false;
        if (deviceId) {
            const { data: save } = await supabase
                .from('deal_saves')
                .select('id')
                .eq('deal_id', id)
                .eq('device_id', deviceId)
                .maybeSingle();
            if (save) isSaved = true;
        }

        // Get stats
        const { data: stats } = await supabase
            .from('deal_stats_24h')
            .select('*')
            .eq('deal_id', id)
            .single();

        const free = stats?.free_votes_24h ?? 0;
        const expired = stats?.expired_votes_24h ?? 0;
        let badge = 'Unverified';
        const lastFree = stats?.last_free_at ? new Date(stats.last_free_at) : null;
        const now = new Date();
        const hoursSinceFree = lastFree ? (now.getTime() - lastFree.getTime()) / (1000 * 60 * 60) : 999;

        if (free >= 3 && hoursSinceFree < 12 && free > expired) {
            badge = 'Verified Free';
        } else if (expired >= 3 && expired >= free) {
            badge = 'Likely Expired';
        }

        return new Response(JSON.stringify({ ...deal, stats, badge, is_saved: isSaved }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
