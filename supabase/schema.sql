-- Supabase Schema for My Closet

-- ==============================================================================
-- 1. Table Definitions
-- ==============================================================================

-- Clothing Items
CREATE TABLE public.clothing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    color TEXT,
    season TEXT,
    occasion TEXT,
    brand TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Outfits
CREATE TABLE public.outfits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Outfit Items (Join Table between Outfits and Clothing Items)
CREATE TABLE public.outfit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
    clothing_item_id UUID NOT NULL REFERENCES public.clothing_items(id) ON DELETE CASCADE,
    -- Prevent the same item from being added multiple times to the same outfit
    UNIQUE(outfit_id, clothing_item_id)
);

-- Planned Outfits
CREATE TABLE public.planned_outfits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
    planned_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 2. Indexes for Performance
-- ==============================================================================

-- User lookups (most queries will be filtered by user_id)
CREATE INDEX idx_clothing_items_user_id ON public.clothing_items(user_id);
CREATE INDEX idx_outfits_user_id ON public.outfits(user_id);
CREATE INDEX idx_planned_outfits_user_id ON public.planned_outfits(user_id);

-- Date based lookups for the calendar functionality
CREATE INDEX idx_planned_outfits_date ON public.planned_outfits(planned_date);

-- Foreign key lookups for joins
CREATE INDEX idx_outfit_items_outfit_id ON public.outfit_items(outfit_id);
CREATE INDEX idx_outfit_items_clothing_item_id ON public.outfit_items(clothing_item_id);

-- Option filters for sorting/filtering closet
CREATE INDEX idx_clothing_items_category ON public.clothing_items(category);
CREATE INDEX idx_clothing_items_season ON public.clothing_items(season);

-- ==============================================================================
-- 3. Row Level Security (RLS)
-- ==============================================================================

ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_outfits ENABLE ROW LEVEL SECURITY;

-- Give users access to only their own data
CREATE POLICY "Users can view their own clothing items" ON public.clothing_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clothing items" ON public.clothing_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clothing items" ON public.clothing_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clothing items" ON public.clothing_items FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own outfits" ON public.outfits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own outfits" ON public.outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own outfits" ON public.outfits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own outfits" ON public.outfits FOR DELETE USING (auth.uid() = user_id);

-- Outfit items depends on the outfit's user_id
CREATE POLICY "Users can view items of their outfits" ON public.outfit_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.outfits WHERE id = outfit_items.outfit_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert items to their outfits" ON public.outfit_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.outfits WHERE id = outfit_items.outfit_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete items from their outfits" ON public.outfit_items FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.outfits WHERE id = outfit_items.outfit_id AND user_id = auth.uid())
);

CREATE POLICY "Users can view their planned outfits" ON public.planned_outfits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their planned outfits" ON public.planned_outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their planned outfits" ON public.planned_outfits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their planned outfits" ON public.planned_outfits FOR DELETE USING (auth.uid() = user_id);

-- ==============================================================================
-- 4. Storage Bucket for Clothing Images
-- ==============================================================================
-- Note: It is often easier to create this via the Supabase Dashboard UI.
-- However, running this SQL (if run as a superuser) will create the bucket.

INSERT INTO storage.buckets (id, name, public) VALUES ('clothing_images', 'clothing_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Anyone can view clothing images" ON storage.objects FOR SELECT USING (bucket_id = 'clothing_images');
CREATE POLICY "Authenticated users can upload clothing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'clothing_images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own clothing images" ON storage.objects FOR DELETE USING (bucket_id = 'clothing_images' AND auth.uid()::text = (storage.foldername(name))[1]);
