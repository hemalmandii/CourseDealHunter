
const SUPABASE_URL = 'https://edzquzoglijjxlslbyll.supabase.co';
require('dotenv').config();
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function triggerScraper() {
    // Dynamic import to handle ESM-only node-fetch
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

    console.log('Triggering "scrape-coursesity" function...');
    console.log(`URL: ${SUPABASE_URL}/functions/v1/scrape-coursesity`);

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/scrape-coursesity`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const fs = require('fs');
        const json = await response.json();
        const outputPath = require('path').join(__dirname, 'debug_output.json');
        fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
        console.log(`Saved response to ${outputPath}`);
        console.log(`Response:`);
        console.log(JSON.stringify(json, null, 2));

        if (response.ok) {
            console.log('✅ Function invoked successfully.');
        } else {
            console.error('❌ Function invocation failed.');
        }

    } catch (e) {
        console.error('Script Error:', e);
    }
}

triggerScraper();
