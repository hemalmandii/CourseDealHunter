import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LISTING_URL = 'https://coursesity.com/free-tutorials?cl=udemy'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    let html = '';
    const deals: any[] = [];

    // 1. Try Firecrawl if API key exists
    if (firecrawlKey) {
      console.log('Using Firecrawl for scraping...');
      try {
        const fcRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${firecrawlKey}`
          },
          body: JSON.stringify({
            url: LISTING_URL,
            formats: ['html'],
          })
        });

        if (fcRes.ok) {
          const fcData = await fcRes.json();
          if (fcData.success && fcData.data?.html) {
            html = fcData.data.html;
            console.log('Firecrawl succeeded');
          } else {
            console.error('Firecrawl returned no HTML:', fcData);
          }
        } else {
          console.error(`Firecrawl error: ${fcRes.status}`);
        }
      } catch (e) {
        console.error('Firecrawl exception:', e);
      }
    }

    // 2. Fallback to standard fetch
    if (!html) {
      console.log(`Fetching listing via standard fetch: ${LISTING_URL}`);
      const res = await fetch(LISTING_URL);
      if (!res.ok) throw new Error(`Failed to fetch listing: ${res.status}`);
      html = await res.text();
    }

    // 3. Parse HTML
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc) throw new Error('Failed to parse HTML');

    // 4. Extract deals
    const allLinks = doc.querySelectorAll('a');
    const processedUrls = new Set<string>();

    for (const link of allLinks) {
      const href = link.getAttribute('href');
      if (href && href.includes('/course/')) {
        const fullDetailUrl = href.startsWith('http') ? href : `https://coursesity.com${href}`;

        if (processedUrls.has(fullDetailUrl)) continue;
        processedUrls.add(fullDetailUrl);

        // Walk up to find card container
        let card = link.parentElement;
        let depth = 0;
        let title = '';
        let thumbnail = '';
        let rating = 0;
        let duration = '';

        while (card && depth < 5) {
          const titleNode = card.querySelector('h1, h2, h3, h4, .title');
          const imgNode = card.querySelector('img');

          if (titleNode) {
            title = titleNode.textContent?.trim() || '';
          }
          if (imgNode) {
            thumbnail = imgNode.getAttribute('src') || imgNode.getAttribute('data-src') || '';
          }

          const ratingNode = card.querySelector('.rating, .stars, [class*="rating"]');
          if (ratingNode) {
            const rText = ratingNode.textContent?.trim().match(/[\d.]+/);
            rating = rText ? parseFloat(rText[0]) : 0;
          }

          const durNode = card.querySelector('.duration, [class*="duration"]');
          if (durNode) duration = durNode.textContent?.trim() || '';

          if (title) break;
          card = card.parentElement;
          depth++;
        }

        if (title) {
          // Use placeholder if no thumbnail found
          const finalThumbnail = thumbnail || 'https://via.placeholder.com/480x270/1e293b/f1f5f9?text=Course+Deal';
          deals.push({
            coursesity_detail_url: fullDetailUrl,
            coursesity_list_url: LISTING_URL,
            title: title,
            thumbnail_url: finalThumbnail,
            rating_value: rating || null,
            duration_text: duration || null,
            is_active: true,
            last_seen_at: new Date().toISOString()
          });
        }
      }
    }

    console.log(`Found ${deals.length} deals.`);

    // 5. Upsert to database
    if (deals.length > 0) {
      const { error } = await supabase
        .from('deals')
        .upsert(deals, {
          onConflict: 'coursesity_detail_url',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('Upsert error:', error);
        throw error;
      }
    }

    return new Response(JSON.stringify({ success: true, count: deals.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
