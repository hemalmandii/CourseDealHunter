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
    coursePattern: /real\.discount\/offer\//,
  },
  {
    name: 'coursevania.com',
    listingUrl: 'https://coursevania.com/courses/',
    coursePattern: /coursevania\.com\/courses?\//,
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
}

async function scrapeWithFirecrawl(url: string, firecrawlKey: string): Promise<{ html: string; links: string[] }> {
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
    throw new Error(`Firecrawl unsuccessful for ${url}`);
  }

  return {
    html: data.data?.html || '',
    links: data.data?.links || []
  };
}

async function extractDealsFromRealDiscount(
  firecrawlKey: string,
  maxDeals: number = 10
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
        (link.includes('/offer/') || link.includes('/?couponCode='))) {
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

    // Process detail pages to get Udemy URLs
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
  maxDeals: number = 10
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

    // Scrape from both sources
    const [realDiscountDeals, coursevaniaDeals] = await Promise.all([
      extractDealsFromRealDiscount(firecrawlKey, 10),
      extractDealsFromCoursevania(firecrawlKey, 10)
    ]);

    const allDeals = [...realDiscountDeals, ...coursevaniaDeals];
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
          ignoreDuplicates: false
        });

      if (error) {
        // Fallback to individual inserts if bulk fails
        console.log('Bulk upsert failed, trying individual inserts...');
        let successCount = 0;

        for (const deal of uniqueDeals) {
          const { error: insertError } = await supabase
            .from('deals')
            .upsert(deal, {
              onConflict: 'coursesity_detail_url',
              ignoreDuplicates: false
            });

          if (!insertError) successCount++;
        }

        console.log(`Inserted ${successCount}/${uniqueDeals.length} deals`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      count: uniqueDeals.length,
      sources: {
        'real.discount': realDiscountDeals.length,
        'coursevania.com': coursevaniaDeals.length
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
