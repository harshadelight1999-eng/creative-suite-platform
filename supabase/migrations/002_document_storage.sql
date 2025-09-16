-- Document Storage and Template Management Schema
-- This migration creates tables for document templates, user documents, and version control

-- Document categories for organization
CREATE TABLE public.document_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT, -- For UI icons
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document templates - both system and user-created
CREATE TABLE public.document_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.document_categories(id) ON DELETE SET NULL,
  is_premium BOOLEAN DEFAULT false,
  is_system_template BOOLEAN DEFAULT false, -- System vs user-created
  template_data JSONB NOT NULL, -- Complete pdfme template structure
  preview_image_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_time_minutes INTEGER DEFAULT 5,
  
  -- Template metadata
  version TEXT DEFAULT '1.0.0',
  template_format TEXT DEFAULT 'pdfme' CHECK (template_format IN ('pdfme', 'custom')),
  page_count INTEGER DEFAULT 1,
  template_size_kb INTEGER,
  
  -- Publishing and access control
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  
  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template ratings and reviews
CREATE TABLE public.template_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.document_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- User documents
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.document_templates(id) ON DELETE SET NULL,
  
  -- Document metadata
  title TEXT NOT NULL,
  description TEXT,
  document_data JSONB NOT NULL, -- Complete document structure with user data
  
  -- File storage
  pdf_url TEXT, -- Generated PDF storage URL
  pdf_size_bytes BIGINT,
  pdf_page_count INTEGER,
  
  -- Document state
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'generated', 'published', 'archived', 'failed')),
  is_ai_generated BOOLEAN DEFAULT false,
  generation_metadata JSONB, -- AI generation details, performance metrics
  
  -- Sharing and collaboration
  is_public BOOLEAN DEFAULT false,
  sharing_settings JSONB DEFAULT '{"allowComments": false, "allowDownload": true}'::jsonb,
  share_token TEXT UNIQUE, -- For public sharing
  
  -- Performance tracking
  generation_time_ms INTEGER,
  last_generated_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document versions for history tracking and rollback
CREATE TABLE public.document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  document_data JSONB NOT NULL,
  pdf_url TEXT, -- Version-specific PDF if generated
  change_summary TEXT,
  is_auto_save BOOLEAN DEFAULT false,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, version_number)
);

-- Document sharing and collaboration
CREATE TABLE public.document_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  shared_with_email TEXT,
  shared_with_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'comment', 'edit')),
  share_token TEXT UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (shared_with_email IS NOT NULL OR shared_with_user_id IS NOT NULL)
);

-- Document collections/folders for organization
CREATE TABLE public.document_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6', -- Hex color for UI
  icon_name TEXT,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document to collection mapping (many-to-many)
CREATE TABLE public.document_collection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES public.document_collections(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, collection_id)
);

-- Performance indexes
CREATE INDEX idx_document_templates_category ON public.document_templates(category_id);
CREATE INDEX idx_document_templates_premium ON public.document_templates(is_premium);
CREATE INDEX idx_document_templates_public ON public.document_templates(is_public);
CREATE INDEX idx_document_templates_featured ON public.document_templates(is_featured) WHERE is_featured = true;
CREATE INDEX idx_document_templates_created_by ON public.document_templates(created_by);
CREATE INDEX idx_document_templates_tags ON public.document_templates USING GIN(tags);
CREATE INDEX idx_document_templates_rating ON public.document_templates(rating_average DESC, rating_count DESC);

CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_template_id ON public.documents(template_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX idx_documents_public ON public.documents(is_public) WHERE is_public = true;
CREATE INDEX idx_documents_share_token ON public.documents(share_token) WHERE share_token IS NOT NULL;

CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_document_versions_created_at ON public.document_versions(created_at DESC);

CREATE INDEX idx_template_ratings_template_id ON public.template_ratings(template_id);
CREATE INDEX idx_template_ratings_user_id ON public.template_ratings(user_id);
CREATE INDEX idx_template_ratings_rating ON public.template_ratings(rating);

CREATE INDEX idx_document_shares_document_id ON public.document_shares(document_id);
CREATE INDEX idx_document_shares_shared_with_user ON public.document_shares(shared_with_user_id);
CREATE INDEX idx_document_shares_token ON public.document_shares(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_document_shares_active ON public.document_shares(is_active) WHERE is_active = true;

CREATE INDEX idx_document_collections_user_id ON public.document_collections(user_id);
CREATE INDEX idx_document_collection_items_document ON public.document_collection_items(document_id);
CREATE INDEX idx_document_collection_items_collection ON public.document_collection_items(collection_id);

-- Full-text search indexes
CREATE INDEX idx_document_templates_search ON public.document_templates USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_documents_search ON public.documents USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Insert default document categories
INSERT INTO public.document_categories (name, slug, description, icon_name, sort_order) VALUES
('Invoices', 'invoices', 'Professional invoice templates for business billing', 'invoice', 1),
('Certificates', 'certificates', 'Certificate templates for achievements and awards', 'certificate', 2),
('Reports', 'reports', 'Business and academic report templates', 'report', 3),
('Letters', 'letters', 'Formal and business letter templates', 'letter', 4),
('Forms', 'forms', 'Various form templates for data collection', 'form', 5),
('Presentations', 'presentations', 'Presentation and pitch deck templates', 'presentation', 6),
('Contracts', 'contracts', 'Legal contract and agreement templates', 'contract', 7),
('Marketing', 'marketing', 'Marketing materials and brochure templates', 'marketing', 8);

-- Comments for documentation
COMMENT ON TABLE public.document_categories IS 'Categories for organizing document templates';
COMMENT ON TABLE public.document_templates IS 'Document templates with metadata, ratings, and access control';
COMMENT ON TABLE public.documents IS 'User-created documents with generation tracking and sharing capabilities';
COMMENT ON TABLE public.document_versions IS 'Version history for documents enabling rollback and change tracking';
COMMENT ON TABLE public.template_ratings IS 'User ratings and reviews for document templates';
COMMENT ON TABLE public.document_shares IS 'Document sharing permissions and access control';
COMMENT ON TABLE public.document_collections IS 'User-created collections/folders for organizing documents';
COMMENT ON TABLE public.document_collection_items IS 'Many-to-many mapping of documents to collections';

COMMENT ON COLUMN public.document_templates.template_data IS 'Complete pdfme template structure in JSON format';
COMMENT ON COLUMN public.documents.document_data IS 'Complete document data including user inputs and template structure';
COMMENT ON COLUMN public.documents.generation_metadata IS 'Metadata about document generation including AI details and performance metrics';
COMMENT ON COLUMN public.documents.sharing_settings IS 'JSON object controlling document sharing permissions and options';