-- 1. Tạo một cái Xô (Bucket) tên là 'products' để chứa ảnh
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Cho phép mọi người xem ảnh (Public Access)
CREATE POLICY "Cho phép xem ảnh công khai"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- 3. Cho phép Admin upload ảnh (Authenticated Access)
CREATE POLICY "Cho phép Admin up ảnh"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'products' );

-- 4. Cho phép Admin xóa ảnh (Authenticated Access)
CREATE POLICY "Cho phép Admin xóa ảnh"
ON storage.objects FOR DELETE
USING ( bucket_id = 'products' );

-- 5. Cho phép Admin sửa ảnh
CREATE POLICY "Cho phép Admin sửa ảnh"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'products' );
