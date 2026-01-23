import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Get candidate deals (udemy_url is null OR last_crawled_at > 7 days)
        // Using simple logic for MVP: just get nulls
        const { data: deals, error } = await supabase
            .from('deals')
            .select('id, coursesity_detail_url')
            .is('udemy_url', null)
            .limit(10); // Batch size

        if (error) throw error;
        if (!deals || deals.length === 0) {
            return new Response(JSON.stringify({ message: 'No deals to resolve' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        console.log(`Resolving ${deals.length} deals`);
        const updates = [];

        for (const deal of deals) {
            try {
                console.log(`Fetching: ${deal.coursesity_detail_url}`);
                const res = await fetch(deal.coursesity_detail_url);
                const html = await res.text();
                const doc = new DOMParser().parseFromString(html, 'text/html');

                if (doc) {
                    // Try to find outbound link via standard DOM
                    let links = doc.querySelectorAll('a');
                    let udemyUrl = null;

                    // Helper to find Udemy link
                    const findUdemy = (nodelist) => {
                        for (const link of nodelist) {
                            const href = link.getAttribute('href');
                            if (href && (href.includes('udemy.com') || href.includes('udemy.com/course'))) {
                                if (!href.includes('coursesity.com')) return href;
                            }
                        }
                        return null;
                    }

                    udemyUrl = findUdemy(links);

                    // Firecrawl augmentation if no link found and key exists
                    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
                    if (!udemyUrl && firecrawlKey) {
                        console.log(`Using Firecrawl for detail: ${deal.coursesity_detail_url}`);
                        try {
                            const fcRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${firecrawlKey}`
                                },
                                body: JSON.stringify({
                                    url: deal.coursesity_detail_url,
                                    formats: ['extract'],
                                    extract: { prompt: "Find the direct link to the Udemy course." }
                                })
                            });

                            if (fcRes.ok) {
                                const fcData = await fcRes.json();
                                // Assuming extract might return it, or we just parse HTML from it if we asked for HTML
                                // 'extract' feature is experimental/beta in Firecrawl, might fallback to HTML
                                if (fcData.data?.extract?.udemy_link) { // Hypothetical
                                    udemyUrl = fcData.data.extract.udemy_link;
                                } else if (fcData.data?.metadata?.sourceURL && fcData.data.metadata.sourceURL.includes('udemy.com')) {
                                    udemyUrl = fcData.data.metadata.sourceURL;
                                }
                            }
                        } catch (e) { console.error('Firecrawl detail error', e); }
                    }

                    if (udemyUrl) {
                        updates.push({
                            id: deal.id,
                            udemy_url: udemyUrl,
                            last_crawled_at: new Date().toISOString()
                        });
                    }
                }
            } catch (e) {
                console.error(`Failed to resolve ${deal.id}:`, e);
                // Optionally update last_crawled_at so we don't retry immediately
                updates.push({
                    id: deal.id,
                    last_crawled_at: new Date().toISOString()
                });
            }
        }

        // Bulk update approach: Iterate and update (Supabase upsert by ID is easiest)
        // Or just loop updates
        for (const update of updates) {
            await supabase.from('deals').update(update).eq('id', update.id);
        }

        return new Response(JSON.stringify({ success: true, resolved: updates.length }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
