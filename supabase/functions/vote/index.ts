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
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Service role for writing votes
        )

        const { deal_id, device_id, vote } = await req.json();

        if (!deal_id || !device_id || !['free', 'expired'].includes(vote)) {
            return new Response(JSON.stringify({ error: 'Invalid input' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Rate Limit: Check if this device voted on this deal in last 24h
        // Assuming we have an index or just querying
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: existingVote, error: checkError } = await supabase
            .from('deal_votes')
            .select('id')
            .eq('deal_id', deal_id)
            .eq('device_id', device_id)
            .gt('created_at', oneDayAgo)
            .limit(1)
            .single();

        // single() returns error if no rows found (PGRST116), which is good for us here means no vote
        if (existingVote) {
            return new Response(JSON.stringify({ error: 'Already voted in last 24h' }), {
                status: 429,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Insert vote
        const { error: insertError } = await supabase.from('deal_votes').insert({
            deal_id,
            device_id,
            vote
        });

        if (insertError) throw insertError;

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
