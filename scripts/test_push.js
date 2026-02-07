
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

const SUPABASE_URL = 'https://edzquzoglijjxlslbyll.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testPush() {
    console.log('Testing "send-push" function...');
    // Calculate schedule time (Now + 10 mins)
    const date = new Date();
    date.setMinutes(date.getMinutes() + 10);
    // My used format: 2026-02-05T17:36:12 GMT+0000
    const sendAfter = date.toISOString().replace(/\.[0-9]{3}Z$/, ' GMT+0000');
    // Standard format: 2026-02-05 17:36:12 GMT+0000 (Testing if T is allowed)

    console.log(`Scheduling for: ${sendAfter}`);

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                deal_id: 'test-sched-123',
                title: '⏰ Scheduled Test',
                message: `This should be sent at ${sendAfter}`,
                image_url: 'https://via.placeholder.com/300',
                send_after: sendAfter
            })
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Body: ${text}`);

    } catch (e) {
        console.error('Script Error:', e);
    }
}

testPush();
