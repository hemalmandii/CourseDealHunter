
const TARGET_URL = 'https://www.real.discount/udemy-coupon-code/';
require('dotenv').config();
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

async function testFirecrawl() {
    // Dynamic import to handle ESM-only node-fetch
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

    console.log(`Testing Firecrawl with key: ${FIRECRAWL_API_KEY ? 'Present' : 'Missing'}`);
    console.log(`Target: ${TARGET_URL}`);

    try {
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
            },
            body: JSON.stringify({
                url: TARGET_URL,
                formats: ['html', 'links'],
                waitFor: 3000,
            })
        });

        const status = response.status;
        console.log(`Firecrawl Status: ${status}`);

        const data = await response.json();

        if (!data.success) {
            console.error('Firecrawl Error:', data);
            return;
        }

        console.log(`Success! HTML Length: ${data.data.html ? data.data.html.length : 0}`);
        console.log(`Links found: ${data.data.links ? data.data.links.length : 0}`);

        // Basic check for deal links
        const links = data.data.links || [];
        const dealLinks = links.filter(l => (typeof l === 'string') && (l.includes('/offer/') || l.includes('-Free/')));
        console.log(`Potential Deal Links Found: ${dealLinks.length}`);

        if (dealLinks.length > 0) {
            console.log('Sample links:', dealLinks.slice(0, 3));
        } else {
            console.log('No deal links found in the returned links array.');
        }

    } catch (e) {
        console.error('Script Error:', e);
    }
}

testFirecrawl();
