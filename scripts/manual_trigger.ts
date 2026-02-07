
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    console.error('Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... deno run --allow-net --allow-env scripts/manual_trigger.ts');
    Deno.exit(1);
}

const PUSH_SERVICE_URL = `${SUPABASE_URL}/functions/v1/send-push`;

async function triggerPush() {
    console.log('triggering push notification...');
    console.log('Target URL:', PUSH_SERVICE_URL);

    const payload = {
        deal_id: 'test-manual-' + Date.now(),
        title: '🔔 Test Notification',
        message: 'This is a manual test from the CLI script.',
        image_url: 'https://via.placeholder.com/480x270/1e293b/f1f5f9?text=Test+Push'
    };

    try {
        const response = await fetch(PUSH_SERVICE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log('Response Status:', response.status);
        console.log('Response Body:', text);

        if (response.ok) {
            console.log('✅ Notification sent successfully!');
        } else {
            console.error('❌ Notification failed.');
        }

    } catch (error) {
        console.error('Error sending request:', error);
    }
}

triggerPush();
