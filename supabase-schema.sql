-- =====================================================
-- AUTHENTIC LUFFY DATABASE SCHEMA
-- Supabase PostgreSQL
-- =====================================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    sale_price NUMERIC(10, 2),
    quantity INTEGER NOT NULL DEFAULT 0,
    sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SETTINGS TABLE
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. HERO TABLE
CREATE TABLE IF NOT EXISTS hero (
    id TEXT PRIMARY KEY DEFAULT 'main',
    title TEXT NOT NULL,
    subtitle TEXT,
    image TEXT,
    cta_text TEXT,
    cta_link TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero ENABLE ROW LEVEL SECURITY;

-- Allow public read access (SELECT)
CREATE POLICY "Allow public read access on products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on settings" ON settings
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access on hero" ON hero
    FOR SELECT USING (true);

-- Allow authenticated users full access (for admin)
CREATE POLICY "Allow authenticated full access on products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access on categories" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access on settings" ON settings
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated full access on hero" ON hero
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert categories
INSERT INTO categories (id, title, subtitle, image) VALUES
    ('daily', 'GIÀY ĐI HÀNG NGÀY', 'Phong cách tối giản / Tiện Lợi', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80'),
    ('sports', 'GIÀY CHƠI THỂ THAO', 'Hiệu suất cao / Bền bỉ', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80'),
    ('new', 'HÀNG MỚI VỀ', 'Bộ sưu tập Xuân/Hè 2026', 'https://images.unsplash.com/photo-1556906781-9a412961d28c?auto=format&fit=crop&q=80')
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO products (sku, name, category, price, sale_price, quantity, sizes, images, description) VALUES
    (
        'NK-AJ1-001',
        'Nike Air Jordan 1 Retro High OG Chicago',
        'daily',
        3500000,
        3200000,
        5,
        '[38, 39, 40, 41, 42, 43]'::jsonb,
        '["https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800"]'::jsonb,
        'Giày Nike Air Jordan 1 Retro High OG phối màu Chicago cổ điển, 100% authentic.'
    ),
    (
        'NK-AJ1-002',
        'Nike Air Jordan 1 Retro High OG Bred',
        'daily',
        3600000,
        NULL,
        3,
        '[39, 40, 41, 42]'::jsonb,
        '["https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800"]'::jsonb,
        'Giày Nike Air Jordan 1 Retro High OG phối màu Bred, hàng chính hãng.'
    ),
    (
        'NK-ZM-001',
        'Nike Zoom Freak 3',
        'sports',
        2800000,
        2500000,
        0,
        '[40, 41, 42, 43, 44]'::jsonb,
        '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"]'::jsonb,
        'Giày Nike Zoom Freak 3 chuyên dụng bóng rổ, đã hết hàng.'
    ),
    (
        'AD-UB-001',
        'Adidas Ultra Boost 22',
        'sports',
        4200000,
        3800000,
        8,
        '[38, 39, 40, 41, 42, 43, 44]'::jsonb,
        '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"]'::jsonb,
        'Giày Adidas Ultra Boost 22 với công nghệ đệm Boost mới nhất.'
    )
ON CONFLICT (sku) DO NOTHING;

-- Insert hero banner
INSERT INTO hero (id, title, subtitle, image, cta_text, cta_link) VALUES
    (
        'main',
        'Giày Sale Authentic',
        'Giày Đi Hằng Ngày    Giày Chơi Thể Thao',
        'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&q=80&w=1200',
        'Xem Ngay',
        '/category/new'
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    image = EXCLUDED.image,
    cta_text = EXCLUDED.cta_text,
    cta_link = EXCLUDED.cta_link;

-- Insert settings
INSERT INTO settings (key, value) VALUES
    ('footer', '{"companyName":"AUTHENTIC LUFFY","address":"125 Lâm Dụ, Long Biên, Hà Nội","phone":"0868.853.9/31","email":"authenticluffy@gmail.com","facebook":"https://www.facebook.com/profile.php?id=61571167698698","policies":{"returns":"Chính sách đổi trả","warranty":"Hướng dẫn mua hàng","privacy":"Bảo mật thông tin"}}'::jsonb)
ON CONFLICT (key) DO NOTHING;
 
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
 - -   M I G R A T I O N :   A d d   T a o b a o   S y n c   F i e l d s  
 - -   R u n   t h i s   i n   y o u r   S u p a b a s e   S Q L   E d i t o r  
 - -   = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =  
  
 - -   1 .   A d d   t a o b a o _ u r l   c o l u m n  
 A L T E R   T A B L E   p r o d u c t s    
 A D D   C O L U M N   I F   N O T   E X I S T S   t a o b a o _ u r l   T E X T ;  
  
 - -   2 .   A d d   b a d g e _ l a b e l   c o l u m n  
 - -   V a l u e s :   ' s a l e ' ,   ' o r d e r _ s a l e ' ,   o r   N U L L  
 A L T E R   T A B L E   p r o d u c t s    
 A D D   C O L U M N   I F   N O T   E X I S T S   b a d g e _ l a b e l   T E X T ;  
  
 - -   3 .   A d d   I n d e x   f o r   f a s t e r   s e a r c h i n g   o f   s y n c a b l e   p r o d u c t s  
 C R E A T E   I N D E X   I F   N O T   E X I S T S   i d x _ p r o d u c t s _ t a o b a o _ u r l   O N   p r o d u c t s ( t a o b a o _ u r l ) ;  
 