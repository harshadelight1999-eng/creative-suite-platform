-- Row Level Security (RLS) Policies
-- This migration implements comprehensive security policies for all tables

-- Enable RLS on all user-facing tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_collection_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_changes ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flag_usage ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- USER MANAGEMENT POLICIES
-- =============================================================================

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON public.user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- User sessions policies (users can only see their own sessions)
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- User activity log policies (read-only for users)
CREATE POLICY "Users can view their own activity" ON public.user_activity_log
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert activity logs for any user
CREATE POLICY "System can insert activity logs" ON public.user_activity_log
  FOR INSERT WITH CHECK (true);

-- =============================================================================
-- DOCUMENT AND TEMPLATE POLICIES
-- =============================================================================

-- Document templates policies
CREATE POLICY "Public templates are viewable by all authenticated users" ON public.document_templates
  FOR SELECT USING (
    is_public = true 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can view their own private templates" ON public.document_templates
  FOR SELECT USING (
    auth.uid() = created_by 
    AND is_public = false
  );

CREATE POLICY "Users can create templates" ON public.document_templates
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' 
    AND auth.uid() = created_by
  );

CREATE POLICY "Users can update their own templates" ON public.document_templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own templates" ON public.document_templates
  FOR DELETE USING (auth.uid() = created_by);

-- Template ratings policies
CREATE POLICY "Users can view all template ratings" ON public.template_ratings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create ratings" ON public.template_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" ON public.template_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" ON public.template_ratings
  FOR DELETE USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared documents" ON public.documents
  FOR SELECT USING (
    is_public = true 
    OR EXISTS (
      SELECT 1 FROM public.document_shares ds 
      WHERE ds.document_id = documents.id 
      AND (ds.shared_with_user_id = auth.uid() OR ds.shared_with_email = auth.email())
      AND ds.is_active = true
      AND (ds.expires_at IS NULL OR ds.expires_at > NOW())
    )
  );

CREATE POLICY "Users can create their own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users with edit permission can update shared documents" ON public.documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.document_shares ds 
      WHERE ds.document_id = documents.id 
      AND ds.shared_with_user_id = auth.uid()
      AND ds.permission_level = 'edit'
      AND ds.is_active = true
      AND (ds.expires_at IS NULL OR ds.expires_at > NOW())
    )
  );

CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Document versions policies
CREATE POLICY "Users can view versions of their documents" ON public.document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents d 
      WHERE d.id = document_versions.document_id 
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view versions of shared documents" ON public.document_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents d 
      JOIN public.document_shares ds ON d.id = ds.document_id
      WHERE d.id = document_versions.document_id 
      AND ds.shared_with_user_id = auth.uid()
      AND ds.is_active = true
      AND (ds.expires_at IS NULL OR ds.expires_at > NOW())
    )
  );

CREATE POLICY "Users can create versions of their documents" ON public.document_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents d 
      WHERE d.id = document_id 
      AND d.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

-- Document shares policies
CREATE POLICY "Users can view shares of their documents" ON public.document_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.documents d 
      WHERE d.id = document_shares.document_id 
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view shares they received" ON public.document_shares
  FOR SELECT USING (
    shared_with_user_id = auth.uid() 
    OR shared_with_email = auth.email()
  );

CREATE POLICY "Users can create shares for their documents" ON public.document_shares
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.documents d 
      WHERE d.id = document_id 
      AND d.user_id = auth.uid()
    )
    AND auth.uid() = shared_by
  );

CREATE POLICY "Users can update shares of their documents" ON public.document_shares
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.documents d 
      WHERE d.id = document_shares.document_id 
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete shares of their documents" ON public.document_shares
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.documents d 
      WHERE d.id = document_shares.document_id 
      AND d.user_id = auth.uid()
    )
  );

-- Document collections policies
CREATE POLICY "Users can view their own collections" ON public.document_collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own collections" ON public.document_collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" ON public.document_collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" ON public.document_collections
  FOR DELETE USING (auth.uid() = user_id);

-- Document collection items policies
CREATE POLICY "Users can view items in their collections" ON public.document_collection_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.document_collections dc 
      WHERE dc.id = collection_id 
      AND dc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add documents to their collections" ON public.document_collection_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.document_collections dc 
      WHERE dc.id = collection_id 
      AND dc.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.documents d 
      WHERE d.id = document_id 
      AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove documents from their collections" ON public.document_collection_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.document_collections dc 
      WHERE dc.id = collection_id 
      AND dc.user_id = auth.uid()
    )
  );

-- =============================================================================
-- BILLING AND SUBSCRIPTION POLICIES
-- =============================================================================

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Payment history policies
CREATE POLICY "Users can view their own payment history" ON public.payment_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert payment records" ON public.payment_history
  FOR INSERT WITH CHECK (true); -- Webhooks need to insert payments

-- Billing addresses policies
CREATE POLICY "Users can view their own billing addresses" ON public.billing_addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own billing addresses" ON public.billing_addresses
  FOR ALL USING (auth.uid() = user_id);

-- Discount code usage policies
CREATE POLICY "Users can view their own discount usage" ON public.discount_code_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create discount usage records" ON public.discount_code_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscription changes policies
CREATE POLICY "Users can view their own subscription changes" ON public.subscription_changes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscription changes" ON public.subscription_changes
  FOR INSERT WITH CHECK (true); -- System tracking

-- =============================================================================
-- ANALYTICS AND USAGE POLICIES
-- =============================================================================

-- Usage tracking policies
CREATE POLICY "Users can view their own usage" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can track usage for all users" ON public.usage_tracking
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update usage tracking" ON public.usage_tracking
  FOR UPDATE USING (true);

-- Performance metrics policies (anonymous data)
CREATE POLICY "Users can view their own performance metrics" ON public.performance_metrics
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can insert performance metrics" ON public.performance_metrics
  FOR INSERT WITH CHECK (true);

-- User engagement policies
CREATE POLICY "Users can view their own engagement data" ON public.user_engagement
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can track user engagement" ON public.user_engagement
  FOR ALL USING (true); -- System needs full access for analytics

-- Error logs policies
CREATE POLICY "Users can view their own error logs" ON public.error_logs
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can insert error logs" ON public.error_logs
  FOR INSERT WITH CHECK (true);

-- Feature flag usage policies
CREATE POLICY "Users can view their own feature flag usage" ON public.feature_flag_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can track feature flag usage" ON public.feature_flag_usage
  FOR INSERT WITH CHECK (true);

-- =============================================================================
-- PUBLIC ACCESS POLICIES (for non-authenticated users)
-- =============================================================================

-- Allow public access to read-only reference data
CREATE POLICY "Public can view subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view document categories" ON public.document_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active discount codes" ON public.discount_codes
  FOR SELECT USING (is_active = true AND valid_from <= NOW() AND (valid_until IS NULL OR valid_until > NOW()));

-- Allow public access to featured public templates (for marketing/showcase)
CREATE POLICY "Public can view featured templates" ON public.document_templates
  FOR SELECT USING (is_public = true AND is_featured = true);

-- =============================================================================
-- ADMIN POLICIES (for admin users)
-- =============================================================================

-- Note: Admin access would typically be handled through service role or 
-- specific admin role checking. For now, we'll use service role bypass.
-- In a production system, you might want to add admin role checking:
-- 
-- Example admin policy:
-- CREATE POLICY "Admin full access" ON public.profiles
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM public.profiles p 
--       WHERE p.id = auth.uid() 
--       AND p.role = 'admin'
--     )
--   );

-- =============================================================================
-- UTILITY FUNCTIONS FOR POLICIES
-- =============================================================================

-- Function to check if user has premium subscription
CREATE OR REPLACE FUNCTION public.is_premium_user(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles p
    WHERE p.id = user_uuid
    AND p.subscription_tier IN ('pro', 'enterprise')
    AND p.subscription_status = 'active'
  );
END;
$$;

-- Function to check document access permissions
CREATE OR REPLACE FUNCTION public.can_access_document(document_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user owns the document
  IF EXISTS (
    SELECT 1 FROM public.documents d 
    WHERE d.id = document_uuid AND d.user_id = user_uuid
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if document is shared with user
  IF EXISTS (
    SELECT 1 FROM public.document_shares ds 
    WHERE ds.document_id = document_uuid 
    AND ds.shared_with_user_id = user_uuid
    AND ds.is_active = true
    AND (ds.expires_at IS NULL OR ds.expires_at > NOW())
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if document is public
  IF EXISTS (
    SELECT 1 FROM public.documents d 
    WHERE d.id = document_uuid AND d.is_public = true
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION public.check_subscription_limit(
  user_uuid UUID,
  resource_type_param TEXT,
  limit_amount INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_plan TEXT;
  plan_limit INTEGER;
  current_usage INTEGER;
BEGIN
  -- Get user's current plan
  SELECT subscription_tier INTO user_plan
  FROM public.profiles
  WHERE id = user_uuid;
  
  -- Get plan limit based on resource type
  CASE resource_type_param
    WHEN 'document_generation' THEN
      SELECT document_limit INTO plan_limit
      FROM public.subscription_plans
      WHERE id = user_plan;
    WHEN 'ai_request' THEN
      SELECT ai_generations_limit INTO plan_limit
      FROM public.subscription_plans
      WHERE id = user_plan;
    ELSE
      -- Unknown resource type, allow access
      RETURN TRUE;
  END CASE;
  
  -- Check if plan has unlimited access
  IF plan_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Get current usage for this billing period
  SELECT COALESCE(SUM(usage_count), 0) INTO current_usage
  FROM public.usage_tracking
  WHERE user_id = user_uuid
    AND resource_type = resource_type_param
    AND billing_period_start = date_trunc('month', NOW());
  
  -- Check if adding the requested amount would exceed the limit
  RETURN (current_usage + limit_amount) <= plan_limit;
END;
$$;

-- Comments for documentation
COMMENT ON FUNCTION public.is_premium_user IS 'Checks if a user has an active premium subscription';
COMMENT ON FUNCTION public.can_access_document IS 'Checks if a user can access a specific document';
COMMENT ON FUNCTION public.check_subscription_limit IS 'Validates if a user can perform an action within their subscription limits';