
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
require('dotenv').config();

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_REST_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

async function checkHistory() {
    console.log('Fetching OneSignal notification history...');

    try {
        const response = await fetch(`https://onesignal.com/api/v1/notifications?app_id=${ONESIGNAL_APP_ID}&limit=10&kind=0`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.notifications) {
            console.log(`\nFound ${data.notifications.length} recent notifications:`);
            data.notifications.forEach(n => {
                console.log(`\nID: ${n.id}`);
                console.log(`Title: ${n.headings?.en || 'No Title'}`);
                console.log(`Send After: ${n.send_after || 'Immediate'}`);
                console.log(`Completed At: ${n.completed_at ? new Date(n.completed_at * 1000).toLocaleString() : 'Pending'}`);
                console.log(`Canceled: ${n.canceled}`);
                console.log(`Included Segments: ${n.included_segments}`);
            });
        } else {
            console.log('No notifications found or error:', data);
        }

    } catch (e) {
        console.error('Error fetching history:', e);
    }
}

checkHistory();
