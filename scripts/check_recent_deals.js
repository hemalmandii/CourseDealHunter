
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkRecentDeals() {
    console.log('Checking recent notification activity...');

    // Get deals notified in the last 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: deals, error } = await supabase
        .from('deals')
        .select('title, rating, review_count, last_notified_at')
        .gt('last_notified_at', oneHourAgo)
        .order('last_notified_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${deals.length} deals notified in the last 1 hour.`);

    deals.forEach(d => {
        const notifiedAt = new Date(d.last_notified_at).toLocaleString();
        console.log(`- [✅ Notified] ${d.title.substring(0, 50)}...`);
        console.log(`    📅 Time: ${notifiedAt}`);
    });
}

checkRecentDeals();
