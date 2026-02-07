
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
    console.error('Usage: set SUPABASE_URL=... && set SUPABASE_SERVICE_ROLE_KEY=... && node scripts/manual_trigger.js');
    process.exit(1);
}

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function triggerPush() {
    console.log('Triggering push notification via Supabase Client...');

    const payload = {
        deal_id: 'test-manual-' + Date.now(),
        title: '🔔 Test Notification (Supabase JS)',
        message: 'This is a manual test using the Supabase Client.',
        image_url: 'https://via.placeholder.com/480x270/1e293b/f1f5f9?text=Test+Push'
    };

    try {
        const { data, error } = await supabase.functions.invoke('send-push', {
            body: payload
        });

        if (error) {
            console.error('❌ Notification failed:', error);
            if (error instanceof Error) {
                console.error(error.message);
            }
        } else {
            console.log('✅ Notification sent successfully!');
            console.log('Result:', data);
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

triggerPush();
