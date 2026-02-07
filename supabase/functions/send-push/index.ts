import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const { deal_id, title, message, image_url, send_after } = await req.json();

        if (!title || !message) {
            return new Response(JSON.stringify({ error: 'Missing title or message' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID');
        const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

        if (!ONESIGNAL_APP_ID || !ONESIGNAL_REST_API_KEY) {
            console.error('OneSignal credentials missing');
            return new Response(JSON.stringify({ error: 'Server configuration error' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log(`Sending push for deal: ${deal_id} - "${title}"${send_after ? ` (Scheduled: ${send_after})` : ''}`);

        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`
            },
            body: JSON.stringify({
                app_id: ONESIGNAL_APP_ID,
                included_segments: ['All'], // Send to all subscribed users
                headings: { en: title },
                contents: { en: message },
                data: { dealId: deal_id }, // Deep linking data
                big_picture: image_url, // For expanded notification view
                android_accent_color: 'A435F0', // Match brand color
                small_icon: 'ic_stat_onesignal_default',
                send_after: send_after || undefined // Optional scheduling
            })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('OneSignal API Error:', result);
            throw new Error(result.errors?.[0] || 'Failed to send notification');
        }

        return new Response(JSON.stringify({ success: true, result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error('send-push error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
