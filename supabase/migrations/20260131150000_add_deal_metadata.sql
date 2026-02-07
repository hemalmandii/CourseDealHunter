-- Add metadata columns for enhanced deal information
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS rating text,
ADD COLUMN IF NOT EXISTS review_count text,
ADD COLUMN IF NOT EXISTS duration text;

-- Add comments for clarity
COMMENT ON COLUMN public.deals.rating IS 'Course rating (e.g., "4.7") scraped from source';
COMMENT ON COLUMN public.deals.review_count IS 'Number of reviews (e.g., "1,203") scraped from source';
COMMENT ON COLUMN public.deals.duration IS 'Course duration (e.g., "12.5 hours") scraped from source';
