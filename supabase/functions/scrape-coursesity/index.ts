import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from 'https://deno.land/x/deno_dom/deno-dom-wasm.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Multi-source configuration
const SOURCES = [
  {
    name: 'real.discount',
    listingUrl: 'https://www.real.discount/udemy-coupon-code/',
    coursePattern: /real\.discount\/(offer|([a-zA-Z0-9-]+-Free))\//,
  },
  {
    name: 'coursevania.com',
    listingUrl: 'https://coursevania.com/courses/',
    coursePattern: /coursevania\.com\/courses?\//,
  },
  {
    name: 'discudemy.com',
    listingUrl: 'https://www.discudemy.com/all',
    coursePattern: /discudemy\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+/,
  }
];

interface Deal {
  source: string;
  coursesity_list_url: string;
  coursesity_detail_url: string;
  title: string;
  thumbnail_url: string;
  udemy_url: string;
  is_active: boolean;
  last_seen_at: string;
  rating?: string;
  review_count?: string;
  duration?: string;
}

async function scrapeWithFirecrawl(url: string, firecrawlKey: string): Promise<{ html: string; links: string[] }> {
  // ... (previous implementation remains same, just interface update context)
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${firecrawlKey}`
    },
    body: JSON.stringify({
      url,
      formats: ['html', 'links'],
      waitFor: 3000,
    })
  });

  if (!response.ok) {
    throw new Error(`Firecrawl error for ${url}: ${response.status}`);
  }

  const data = await response.json();
  if (!data.success) {
    console.error(`Firecrawl unsuccessful for ${url}:`, data);
    throw new Error(`Firecrawl unsuccessful for ${url}`);
  }

  console.log(`Firecrawl success for ${url}. HTML length: ${data.data?.html?.length || 0}, Links found: ${data.data?.links?.length || 0}`);

  return {
    html: data.data?.html || '',
    links: data.data?.links || []
  };
}

// Helper to extract metadata from text
function extractMetadata(html: string) {
  const cleanHtml = html.replace(/<[^>]*>/g, ' '); // Strip tags

  // Regex patterns
  const ratingMatch = cleanHtml.match(/Rating:\s*(\d+(\.\d+)?)/i) ||
    cleanHtml.match(/(\d+(\.\d+)?)\s*stars?/i) ||
    cleanHtml.match(/(\d+(\.\d+)?)\s*\/\s*5/);

  const reviewsMatch = cleanHtml.match(/(\d+(?:,\d+)*)\s*reviews?/i) ||
    cleanHtml.match(/(\d+(?:,\d+)*)\s*students?/i); // Fallback to students if reviews missing

  const durationMatch = cleanHtml.match(/(\d+(\.\d+)?)\s*hours?\s*video/i) ||
    cleanHtml.match(/Duration:\s*(\d+(\.\d+)?)(\s*h\w*)?/i);

  return {
    rating: ratingMatch ? ratingMatch[1] : undefined,
    review_count: reviewsMatch ? reviewsMatch[1] : undefined,
    duration: durationMatch ? `${durationMatch[1]}h` : undefined
  };
}

async function extractDealsFromRealDiscount(
  firecrawlKey: string,
  maxDeals: number = 50
): Promise<Deal[]> {
  const deals: Deal[] = [];
  const source = SOURCES[0];

  console.log(`Scraping ${source.name}...`);

  try {
    const { html, links } = await scrapeWithFirecrawl(source.listingUrl, firecrawlKey);

    // Real.discount has direct links to coupon pages
    const courseUrls: string[] = [];

    // Extract from links array
    for (const link of links) {
      if (typeof link === 'string' &&
        link.includes('real.discount') &&
        (link.includes('/offer/') || link.includes('-Free/') || link.includes('/?couponCode='))) {
        if (!courseUrls.includes(link)) {
          courseUrls.push(link);
        }
      }
    }

    // Also parse HTML for offer links
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (doc) {
      const offerLinks = doc.querySelectorAll('a[href*="/offer/"], a[href*="udemy.com"]');
      for (const linkEl of offerLinks) {
        const href = linkEl.getAttribute('href');
        if (href && !courseUrls.includes(href)) {
          if (href.includes('udemy.com/course/')) {
            // Direct Udemy link found!
            const title = linkEl.textContent?.trim() || 'Free Udemy Course';
            deals.push({
              source: source.name,
              coursesity_list_url: source.listingUrl,
              coursesity_detail_url: source.listingUrl,
              title: title.substring(0, 200),
              thumbnail_url: 'https://via.placeholder.com/480x270/1e293b/f1f5f9?text=Free+Course',
              udemy_url: href,
              is_active: true,
              last_seen_at: new Date().toISOString()
            });
          } else if (href.includes('real.discount')) {
            courseUrls.push(href);
          }
        }
      }
    }

    console.log(`Found ${courseUrls.length} course URLs from ${source.name}`);

    // Process detail pages to get Udemy URLs AND Metadata
    const urlsToProcess = courseUrls.slice(0, maxDeals);

    for (const courseUrl of urlsToProcess) {
      try {
        console.log(`Fetching: ${courseUrl}`);
        const detail = await scrapeWithFirecrawl(courseUrl, firecrawlKey);

        // Look for Udemy URL in links
        let udemyUrl = '';
        let title = '';
        let thumbnail = '';

        for (const link of detail.links) {
          if (typeof link === 'string' && link.includes('udemy.com/course/')) {
            udemyUrl = link;
            break;
          }
        }

        // Parse detail page for title and image
        const detailDoc = new DOMParser().parseFromString(detail.html, 'text/html');
        if (detailDoc) {
          const titleEl = detailDoc.querySelector('h1, .course-title, .entry-title');
          title = titleEl?.textContent?.trim() || '';

          const imgEl = detailDoc.querySelector('img[src*="udemy"], img[src*="course"], .course-image img');
          thumbnail = imgEl?.getAttribute('src') || '';

          // Also check for Udemy link in HTML
          if (!udemyUrl) {
            const udemyLinks = detailDoc.querySelectorAll('a[href*="udemy.com/course/"]');
            for (const uLink of udemyLinks) {
              const href = uLink.getAttribute('href');
              if (href) {
                udemyUrl = href;
                break;
              }
            }
          }
        }

        // Extract metadata from the detail page HTML
        const metadata = extractMetadata(detail.html);

        if (udemyUrl && title) {
          deals.push({
            source: source.name,
            coursesity_list_url: source.listingUrl,
            coursesity_detail_url: courseUrl,
            title: title.substring(0, 200),
            thumbnail_url: thumbnail || 'https://via.placeholder.com/480x270/1e293b/f1f5f9?text=Free+Course',
            udemy_url: udemyUrl,
            is_active: true,
            last_seen_at: new Date().toISOString(),
            rating: metadata.rating,
            review_count: metadata.review_count,
            duration: metadata.duration
          });
          console.log(`✓ ${title.substring(0, 50)}... [${metadata.rating || 'No Rating'}]`);
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 300));

      } catch (e) {
        console.error(`Error processing ${courseUrl}:`, e);
      }

      if (deals.length >= maxDeals) break;
    }



  } catch (e) {
    console.error(`Error scraping ${source.name}:`, e);
  }

  return deals;
}

async function extractDealsFromCoursevania(
  firecrawlKey: string,
  maxDeals: number = 50
): Promise<Deal[]> {
  const deals: Deal[] = [];
  const source = SOURCES[1];

  console.log(`Scraping ${source.name}...`);

  try {
    const { html, links } = await scrapeWithFirecrawl(source.listingUrl, firecrawlKey);

    const courseUrls: string[] = [];

    // Extract course URLs from links
    for (const link of links) {
      if (typeof link === 'string' &&
        link.includes('coursevania.com') &&
        !link.includes('/category/') &&
        !link.includes('/page/') &&
        !link.includes('/tag/') &&
        link !== source.listingUrl) {
        if (!courseUrls.includes(link)) {
          courseUrls.push(link);
        }
      }
    }

    // Parse HTML for course cards
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (doc) {
      const courseCards = doc.querySelectorAll('article a[href], .course-item a[href], .card a[href]');
      for (const card of courseCards) {
        const href = card.getAttribute('href');
        if (href &&
          (href.includes('coursevania.com') || href.startsWith('/')) &&
          !href.includes('/category/') &&
          !href.includes('/page/')) {
          const fullUrl = href.startsWith('http') ? href : `https://coursevania.com${href}`;
          if (!courseUrls.includes(fullUrl)) {
            courseUrls.push(fullUrl);
          }
        }
      }
    }

    console.log(`Found ${courseUrls.length} course URLs from ${source.name}`);

    // Process detail pages
    const urlsToProcess = courseUrls.slice(0, maxDeals);

    for (const courseUrl of urlsToProcess) {
      try {
        console.log(`Fetching: ${courseUrl}`);
        const detail = await scrapeWithFirecrawl(courseUrl, firecrawlKey);

        let udemyUrl = '';
        let title = '';
        let thumbnail = '';

        // Check links for Udemy URL
        for (const link of detail.links) {
          if (typeof link === 'string' && link.includes('udemy.com/course/')) {
            udemyUrl = link;
            break;
          }
        }

        // Parse detail page
        const detailDoc = new DOMParser().parseFromString(detail.html, 'text/html');
        if (detailDoc) {
          const titleEl = detailDoc.querySelector('h1, .entry-title, .course-title');
          title = titleEl?.textContent?.trim() || '';
          title = title.replace(/\s*[-–]\s*Coursevania.*$/i, '').trim();

          const imgEl = detailDoc.querySelector('img[src*="udemy"], .featured-image img, .course-image img');
          thumbnail = imgEl?.getAttribute('src') || '';

          if (!udemyUrl) {
            const udemyLinks = detailDoc.querySelectorAll('a[href*="udemy.com/course/"]');
            for (const uLink of udemyLinks) {
              const href = uLink.getAttribute('href');
              if (href) {
                udemyUrl = href;
                break;
              }
            }
          }
        }

        if (udemyUrl && title) {
          deals.push({
            source: source.name,
            coursesity_list_url: source.listingUrl,
            coursesity_detail_url: courseUrl,
            title: title.substring(0, 200),
            thumbnail_url: thumbnail || 'https://via.placeholder.com/480x270/1e293b/f1f5f9?text=Free+Course',
            udemy_url: udemyUrl,
            is_active: true,
            last_seen_at: new Date().toISOString()
          });
          console.log(`✓ ${title.substring(0, 50)}...`);
        }

        await new Promise(r => setTimeout(r, 300));

      } catch (e) {
        console.error(`Error processing ${courseUrl}:`, e);
      }

      if (deals.length >= maxDeals) break;
    }

  } catch (e) {
    console.error(`Error scraping ${source.name}:`, e);
  }

  return deals;
}

async function extractDealsFromDiscUdemy(
  firecrawlKey: string,
  maxDeals: number = 50
): Promise<Deal[]> {
  const deals: Deal[] = [];
  const source = SOURCES[2];

  console.log(`Scraping ${source.name}...`);

  try {
    const { html, links } = await scrapeWithFirecrawl(source.listingUrl, firecrawlKey);

    const courseUrls: string[] = [];
    for (const link of links) {
      if (typeof link === 'string' &&
        link.includes('discudemy.com/') &&
        !link.includes('/all') &&
        !link.includes('/category/') &&
        !link.includes('/language/')) {
        if (!courseUrls.includes(link)) {
          courseUrls.push(link);
        }
      }
    }

    console.log(`Found ${courseUrls.length} course URLs from ${source.name}`);

    for (const courseUrl of courseUrls.slice(0, maxDeals)) {
      try {
        console.log(`Fetching: ${courseUrl}`);
        const detail = await scrapeWithFirecrawl(courseUrl, firecrawlKey);

        // DiscUdemy often has an intermediate page. We need to find the "Go to Course" link
        let nextUrl = '';
        for (const link of detail.links) {
          if (typeof link === 'string' && link.includes('/go/')) {
            nextUrl = link;
            break;
          }
        }

        if (nextUrl) {
          const goDetail = await scrapeWithFirecrawl(nextUrl, firecrawlKey);
          let udemyUrl = '';
          for (const link of goDetail.links) {
            if (typeof link === 'string' && link.includes('udemy.com/course/')) {
              udemyUrl = link;
              break;
            }
          }

          if (udemyUrl) {
            const doc = new DOMParser().parseFromString(detail.html, 'text/html');
            const title = doc?.querySelector('h1')?.textContent?.trim() || 'Free Course';
            const img = doc?.querySelector('.ui.image.rounded')?.getAttribute('src') || '';

            deals.push({
              source: source.name,
              coursesity_list_url: source.listingUrl,
              coursesity_detail_url: courseUrl,
              title: title.substring(0, 200),
              thumbnail_url: img || 'https://via.placeholder.com/480x270/1e293b/f1f5f9?text=Free+Course',
              udemy_url: udemyUrl,
              is_active: true,
              last_seen_at: new Date().toISOString()
            });
            console.log(`✓ ${title.substring(0, 50)}...`);
          }
        }
      } catch (e) {
        console.error(`Error processing ${courseUrl}:`, e);
      }
      if (deals.length >= maxDeals) break;
    }
  } catch (e) {
    console.error(`Error scraping ${source.name}:`, e);
  }

  return deals;
}

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
    if (!firecrawlKey) {
      throw new Error('FIRECRAWL_API_KEY is required');
    }

    console.log('Starting multi-source scrape...');

    // Initialize output info
    const debugLogs: string[] = [];
    let scheduledCount = 0;

    // Scrape from all sources
    const [realDiscountDeals, coursevaniaDeals, discudemyDeals] = await Promise.all([
      extractDealsFromRealDiscount(firecrawlKey, 15),
      extractDealsFromCoursevania(firecrawlKey, 15),
      extractDealsFromDiscUdemy(firecrawlKey, 15)
    ]);

    const allDeals = [...realDiscountDeals, ...coursevaniaDeals, ...discudemyDeals];
    console.log(`Total deals before dedup: ${allDeals.length}`);

    // Deduplicate by udemy_url (normalize URLs first)
    const seenUrls = new Set<string>();
    const uniqueDeals: Deal[] = [];

    for (const deal of allDeals) {
      // Normalize Udemy URL (remove tracking params)
      let normalizedUrl = deal.udemy_url.split('?')[0];
      normalizedUrl = normalizedUrl.replace(/\/$/, ''); // Remove trailing slash

      if (!seenUrls.has(normalizedUrl)) {
        seenUrls.add(normalizedUrl);
        uniqueDeals.push({
          ...deal,
          udemy_url: deal.udemy_url // Keep original with coupon code
        });
      }
    }

    console.log(`Unique deals after dedup: ${uniqueDeals.length}`);

    // Upsert to database - udemy_url unique constraint handles duplicates
    if (uniqueDeals.length > 0) {
      const { error } = await supabase
        .from('deals')
        .upsert(uniqueDeals, {
          onConflict: 'udemy_url',
          ignoreDuplicates: false,
        })

      if (error) {
        console.error('Bulk upsert error:', error);
        // Fallback or retry logic...
      } else {
        console.log(`Successfully upserted ${uniqueDeals.length} deals.`);

        // --- AUTOMATED NOTIFICATION LOGIC ---
        // Strategy: Max 1 notification per run. Must be Quality (>4.5 stars or >1k reviews).

        // 1. Filter candidates
        // 1. Filter candidates (BEST AVAILABLE STRATEGY)
        // We removed the hard quality threshold to guarantee notifications.
        // We will just sort them and pick the best ones available.
        const candidates = [...uniqueDeals];

        // 2. Sort by "Score" (Rating > Reviews)
        candidates.sort((a, b) => {
          const rA = parseFloat(a.rating || '0');
          const rB = parseFloat(b.rating || '0');
          if (rA !== rB) return rB - rA; // Descending rating

          const revA = parseInt((a.review_count || '0').replace(/,/g, ''), 10);
          const revB = parseInt((b.review_count || '0').replace(/,/g, ''), 10);
          return revB - revA; // Descending reviews
        });

        console.log(`Notification candidates: ${candidates.length} (out of ${uniqueDeals.length})`);

        // 3. Notify for Top 3 Best Candidates (Drip Feed: T+0, T+2h, T+4h)

        if (candidates.length > 0) {
          debugLogs.push(`Processing ${candidates.length} candidates. Top 3: ${candidates.slice(0, 3).map(c => c.title).join(', ')}`);
          console.log(`Processing ${candidates.length} candidates for potential notification...`);

          const PUSH_SERVICE_URL = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push`;
          const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

          // Loop through candidates
          for (const bestDeal of candidates) {
            if (scheduledCount >= 3) break;

            try {
              // Check if already notified updated recently (skip if < 24h)
              const { data: existing } = await supabase
                .from('deals')
                .select('id, last_notified_at')
                .eq('udemy_url', bestDeal.udemy_url)
                .maybeSingle();

              const shouldNotify = !existing?.last_notified_at ||
                (new Date().getTime() - new Date(existing.last_notified_at).getTime()) > 86400000; // 24h

              if (shouldNotify) {
                // Calculate Schedule Time
                // scheduledCount=0 -> Now (undefined) 
                // scheduledCount=1 -> Now + 2 hours
                // scheduledCount=2 -> Now + 4 hours
                let sendAfter = undefined;
                if (scheduledCount > 0) {
                  const date = new Date();
                  date.setHours(date.getHours() + (scheduledCount * 2));
                  // Use fixed UTC string format to be safe (no T)
                  sendAfter = date.toISOString().replace('T', ' ').replace(/\.[0-9]{3}Z$/, ' GMT+0000');
                }

                debugLogs.push(`Attempting push for #${scheduledCount}: ${bestDeal.title} (Time: ${sendAfter || 'IMMEDIATE'})`);
                console.log(`Triggering push for Candidate #${scheduledCount + 1}: ${bestDeal.title} (Schedule: ${sendAfter || 'Now'})`);

                const pushRes = await fetch(PUSH_SERVICE_URL, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
                  },
                  body: JSON.stringify({
                    deal_id: existing?.id || 'new',
                    title: '🔥 Free Course Alert!',
                    message: `${bestDeal.rating ? '⭐ ' + bestDeal.rating + ' ' : ''}${bestDeal.title}`,
                    image_url: bestDeal.thumbnail_url,
                    send_after: sendAfter
                  })
                });

                if (pushRes.ok) {
                  debugLogs.push(`SUCCESS: Push accepted for ${bestDeal.title}`);
                  if (existing?.id) {
                    await supabase.from('deals').update({ last_notified_at: new Date().toISOString() }).eq('id', existing.id);
                    scheduledCount++;
                  }
                } else {
                  const errText = await pushRes.text();
                  debugLogs.push(`ERROR: OneSignal rejected ${bestDeal.title}: ${errText}`);
                  console.error('Push Service Error:', errText);
                }
              } else {
                debugLogs.push(`SKIPPED: Already notified ${bestDeal.title}`);
              }
            } catch (e) {
              const err = e instanceof Error ? e.message : String(e);
              debugLogs.push(`EXCEPTION: ${bestDeal.title} - ${err}`);
              console.error(`Notification failed for ${bestDeal.title}:`, e);
            }
          }
          console.log(`Scheduled ${scheduledCount} notifications total.`);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      count: uniqueDeals.length,
      scheduled: scheduledCount,
      debug: debugLogs,
      sources: {
        'real.discount': realDiscountDeals.length,
        'coursevania.com': coursevaniaDeals.length,
        'discudemy.com': discudemyDeals.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error('Scraper error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
