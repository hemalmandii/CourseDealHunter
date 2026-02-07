
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function resetNotifications() {
    console.log('Resetting last_notified_at for recent deals...');

    // Reset for deals seen in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // First select them to show what we are resetting
    const { data: deals, error: fetchError } = await supabase
        .from('deals')
        .select('id, title, last_notified_at')
        .gt('last_seen_at', oneDayAgo)
        .not('last_notified_at', 'is', null);

    if (fetchError) {
        console.error('Error fetching:', fetchError);
        return;
    }

    console.log(`Found ${deals.length} deals to reset.`);

    if (deals.length > 0) {
        const ids = deals.map(d => d.id);
        const { error: updateError } = await supabase
            .from('deals')
            .update({ last_notified_at: null })
            .in('id', ids);

        if (updateError) {
            console.error('Error resetting:', updateError);
        } else {
            console.log('✅ Successfully reset notifications. You can run the scraper again now and it WILL try to notify.');
        }
    }
}

resetNotifications();
