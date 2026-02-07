const { createClient } = require('@supabase/supabase-js');
// Node 18+ has native fetch. We don't need node-fetch if on Node 24.
// If you are on an older version, uncomment the next line and install node-fetch@2
// const fetch = require('node-fetch'); 

// --- CONFIGURATION ---
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

if (SUPABASE_KEY.includes('YOUR_') || FIRECRAWL_API_KEY.includes('YOUR_')) {
    console.error('❌ ERROR: You must open this script and set SUPABASE_KEY and FIRECRAWL_API_KEY at the top.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- SCRAPER LOGIC ---
const SOURCES = [
    {
        name: 'real.discount',
        listingUrl: 'https://www.real.discount/udemy-coupon-code/',
    },
    {
        name: 'coursevania.com',
        listingUrl: 'https://coursevania.com/courses/',
    },
    {
        name: 'discudemy.com',
        listingUrl: 'https://www.discudemy.com/all',
    }
];

async function scrapeWithFirecrawl(url) {
    console.log(`🔥 Fetching: ${url}`);
    try {
        const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
            },
            body: JSON.stringify({
                url,
                formats: ['html', 'links'],
                waitFor: 3000,
            })
        });

        if (!response.ok) {
            const txt = await response.text();
            throw new Error(`Status ${response.status}: ${txt}`);
        }
        const data = await response.json();
        if (!data.success) throw new Error('Firecrawl success=false');

        return {
            html: data.data?.html || '',
            links: data.data?.links || []
        };
    } catch (e) {
        console.error(`❌ Firecrawl error for ${url}:`, e.message);
        return { html: '', links: [] };
    }
}

// Simple Regex Extractor
function extractMetadata(html) {
    const cleanHtml = html.replace(/<[^>]*>/g, ' ');
    const ratingMatch = cleanHtml.match(/Rating:\s*(\d+(\.\d+)?)/i) || cleanHtml.match(/(\d+(\.\d+)?)\s*stars?/i);
    const reviewsMatch = cleanHtml.match(/(\d+(?:,\d+)*)\s*reviews?/i) || cleanHtml.match(/(\d+(?:,\d+)*)\s*students?/i);
    const durationMatch = cleanHtml.match(/(\d+(\.\d+)?)\s*hours?\s*video/i) || cleanHtml.match(/Duration:\s*(\d+(\.\d+)?)(\s*h\w*)?/i);

    return {
        rating: ratingMatch ? ratingMatch[1] : undefined,
        review_count: reviewsMatch ? reviewsMatch[1] : undefined,
        duration: durationMatch ? `${durationMatch[1]}h` : undefined
    };
}

async function run() {
    console.log('🚀 Starting Local Scraper (Full Run)...');

    const deals = [];

    // Iterate through ALL sources
    for (const source of SOURCES) {
        console.log(`\nProcessing source: ${source.name}...`);
        console.log(`Listing URL: ${source.listingUrl}`);

        const { html, links } = await scrapeWithFirecrawl(source.listingUrl);

        // Link Extraction (More robust)
        const courseUrls = [];
        for (const link of links) {
            if (typeof link === 'string') {
                // Filter based on source domain patterns
                if (source.name === 'real.discount' && (link.includes('/offer/') || link.includes('-Free/'))) {
                    if (!courseUrls.includes(link)) courseUrls.push(link);
                } else if (source.name === 'coursevania.com' && link.includes('/courses/')) {
                    if (!courseUrls.includes(link)) courseUrls.push(link);
                } else if (source.name === 'discudemy.com' && link.includes('/go/')) {
                    if (!courseUrls.includes(link)) courseUrls.push(link);
                }
            }
        }

        console.log(`Found ${courseUrls.length} potential course links from ${source.name}. Processing ALL...`);

        // Process ALL found links (Removed slice limit)
        for (const url of courseUrls) {
            const detail = await scrapeWithFirecrawl(url);

            let udemyUrl = '';
            // Basic link finder for Udemy
            for (const l of detail.links) {
                if (l.includes('udemy.com/course/')) { udemyUrl = l; break; }
            }

            if (udemyUrl) {
                const meta = extractMetadata(detail.html);
                const titleMatch = detail.html.match(/<h1[^>]*>(.*?)<\/h1>/i);
                const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'Free Udemy Course';

                // Basic validation to avoid empty titles or bad data
                if (title && title.length > 5) {
                    deals.push({
                        source: source.name,
                        coursesity_list_url: source.listingUrl,
                        coursesity_detail_url: url,
                        title: title.substring(0, 200),
                        thumbnail_url: 'https://via.placeholder.com/480x270?text=Course',
                        udemy_url: udemyUrl,
                        is_active: true,
                        last_seen_at: new Date().toISOString(),
                        rating: meta.rating,
                        review_count: meta.review_count,
                        duration: meta.duration
                    });
                    console.log(`✅ Ready to save: ${title}`);
                }
            }
        }
    }

    if (deals.length > 0) {
        console.log(`\n💾 Saving ${deals.length} deals to Supabase...`);

        // Upsert in batches of 50 to avoid payload limits
        const BATCH_SIZE = 50;
        for (let i = 0; i < deals.length; i += BATCH_SIZE) {
            const batch = deals.slice(i, i + BATCH_SIZE);
            const { error } = await supabase.from('deals').upsert(batch, {
                onConflict: 'udemy_url',
                ignoreDuplicates: false
            });

            if (error) console.error('❌ DB Error (Batch):', error);
            else console.log(`🎉 Batch ${i / BATCH_SIZE + 1} upserted successfully.`);
        }
        console.log('✅ All deals processed.');
    } else {
        console.log('No valid deals found to save.');
    }
}

run();
