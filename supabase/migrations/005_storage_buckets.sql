-- =============================================================================
-- BRICKFLOW ERP - 005_storage_buckets.sql
-- Supabase Storage Buckets & Storage RLS Policies
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CREATE STORAGE BUCKETS
-- -----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('factory-logos', 'factory-logos', TRUE, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
    ('invoices', 'invoices', FALSE, 10485760, ARRAY['application/pdf']),
    ('expense-attachments', 'expense-attachments', FALSE, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf']),
    ('documents', 'documents', FALSE, 20971520, ARRAY['image/png', 'image/jpeg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- -----------------------------------------------------------------------------
-- 2. STORAGE POLICIES
-- -----------------------------------------------------------------------------

-- factory-logos: Public read, Authenticated upload
DROP POLICY IF EXISTS "Public can view factory logos" ON storage.objects;
CREATE POLICY "Public can view factory logos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'factory-logos');

DROP POLICY IF EXISTS "Authenticated users can upload factory logos" ON storage.objects;
CREATE POLICY "Authenticated users can upload factory logos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'factory-logos');

-- invoices: Tenant read & insert
DROP POLICY IF EXISTS "Authenticated users can access invoice pdfs" ON storage.objects;
CREATE POLICY "Authenticated users can access invoice pdfs"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'invoices')
    WITH CHECK (bucket_id = 'invoices');

-- expense-attachments: Tenant access
DROP POLICY IF EXISTS "Authenticated users can access expense attachments" ON storage.objects;
CREATE POLICY "Authenticated users can access expense attachments"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'expense-attachments')
    WITH CHECK (bucket_id = 'expense-attachments');

-- documents: Tenant access
DROP POLICY IF EXISTS "Authenticated users can access documents" ON storage.objects;
CREATE POLICY "Authenticated users can access documents"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = 'documents')
    WITH CHECK (bucket_id = 'documents');
