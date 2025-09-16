-- Usage Tracking and Analytics Schema
-- This migration creates comprehensive usage tracking, analytics, and system monitoring tables

-- Usage tracking for subscription limits and billing
CREATE TABLE public.usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Resource tracking
  resource_type TEXT NOT NULL CHECK (resource_type IN ('document_generation', 'ai_request', 'template_usage', 'pdf_export', 'collaboration', 'storage_usage', 'api_call')),
  resource_id UUID, -- Reference to document, template, etc.
  resource_name TEXT, -- Human-readable resource name
  
  -- Billing period for subscription limits
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  
  -- Usage metrics
  usage_count INTEGER DEFAULT 1,
  usage_amount DECIMAL(10,2), -- For metered billing (e.g., storage GB, API calls)
  usage_unit TEXT, -- 'count', 'gb', 'mb', 'minutes', etc.
  
  -- Cost tracking
  unit_cost DECIMAL(10,4), -- Cost per unit for this resource type
  total_cost DECIMAL(10,2), -- Calculated total cost
  
  -- Context and metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  source_ip INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, resource_type, resource_id, billing_period_start)
);

-- Performance analytics for system optimization
CREATE TABLE public.performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  session_id UUID, -- Link to user session if available
  
  -- Action tracking
  action_type TEXT NOT NULL CHECK (action_type IN ('pdf_generation', 'ai_request', 'template_load', 'document_save', 'document_load', 'user_login', 'user_signup', 'payment_process', 'api_call')),
  resource_id UUID,
  resource_type TEXT,
  
  -- Performance metrics
  duration_ms INTEGER NOT NULL,
  memory_usage_mb INTEGER,
  cpu_usage_percent DECIMAL(5,2),
  network_bytes_in BIGINT,
  network_bytes_out BIGINT,
  
  -- Success tracking
  success BOOLEAN DEFAULT true,
  error_code TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Request context
  endpoint TEXT, -- API endpoint or page route
  http_method TEXT,
  status_code INTEGER,
  
  -- User context
  user_agent TEXT,
  ip_address INET,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  os_version TEXT,
  
  -- Geographic data
  country_code TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  
  -- Additional context
  referrer_url TEXT,
  page_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User engagement and behavior analytics
CREATE TABLE public.user_engagement (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Session tracking
  session_id UUID NOT NULL,
  session_start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  session_end_at TIMESTAMP WITH TIME ZONE,
  session_duration_minutes INTEGER,
  
  -- Page/feature usage
  pages_visited INTEGER DEFAULT 0,
  features_used TEXT[] DEFAULT '{}',
  documents_created INTEGER DEFAULT 0,
  documents_edited INTEGER DEFAULT 0,
  templates_viewed INTEGER DEFAULT 0,
  templates_used INTEGER DEFAULT 0,
  
  -- Interaction metrics
  clicks_count INTEGER DEFAULT 0,
  scrolls_count INTEGER DEFAULT 0,
  form_submissions INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  
  -- Conversion tracking
  conversion_events JSONB DEFAULT '[]'::jsonb,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  
  -- Device and context
  device_type TEXT,
  browser_name TEXT,
  os_name TEXT,
  screen_resolution TEXT,
  
  -- Geographic data
  country_code TEXT,
  region TEXT,
  city TEXT,
  
  -- Date for aggregation
  date DATE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, session_id, date)
);

-- System health monitoring
CREATE TABLE public.system_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Service identification
  service_name TEXT NOT NULL CHECK (service_name IN ('pdf_service', 'ai_service', 'database', 'auth_service', 'payment_service', 'file_storage', 'api_gateway', 'web_app')),
  instance_id TEXT, -- For load-balanced services
  
  -- Metric details
  metric_name TEXT NOT NULL CHECK (metric_name IN ('response_time', 'error_rate', 'throughput', 'cpu_usage', 'memory_usage', 'disk_usage', 'network_latency', 'queue_length', 'concurrent_users')),
  metric_value DECIMAL(10,4) NOT NULL,
  metric_unit TEXT NOT NULL, -- 'ms', 'percent', 'count', 'bytes', etc.
  
  -- Health status
  status TEXT DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical', 'down')),
  threshold_warning DECIMAL(10,4),
  threshold_critical DECIMAL(10,4),
  
  -- Additional context
  tags JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error tracking and monitoring
CREATE TABLE public.error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Error classification
  error_type TEXT NOT NULL CHECK (error_type IN ('application', 'database', 'network', 'validation', 'authentication', 'authorization', 'payment', 'external_api')),
  error_level TEXT NOT NULL CHECK (error_level IN ('debug', 'info', 'warning', 'error', 'critical')),
  error_code TEXT,
  error_message TEXT NOT NULL,
  
  -- Context
  service_name TEXT,
  endpoint TEXT,
  request_id TEXT,
  session_id UUID,
  
  -- Stack trace and debugging
  stack_trace TEXT,
  request_data JSONB,
  response_data JSONB,
  
  -- User context
  user_agent TEXT,
  ip_address INET,
  
  -- Resolution tracking
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags and A/B testing
CREATE TABLE public.feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Flag configuration
  is_enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  
  -- Targeting rules
  target_user_ids UUID[] DEFAULT '{}',
  target_user_groups TEXT[] DEFAULT '{}', -- 'beta_users', 'premium_users', etc.
  target_countries TEXT[] DEFAULT '{}',
  
  -- A/B testing
  experiment_name TEXT,
  variant_name TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Lifecycle
  created_by UUID REFERENCES public.profiles(id),
  is_permanent BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flag usage tracking
CREATE TABLE public.feature_flag_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_flag_id UUID REFERENCES public.feature_flags(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Usage context
  was_enabled BOOLEAN NOT NULL,
  variant_shown TEXT,
  
  -- Context
  session_id UUID,
  page_url TEXT,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(feature_flag_id, user_id, created_at::date)
);

-- Performance indexes for analytics queries
CREATE INDEX idx_usage_tracking_user_period ON public.usage_tracking(user_id, billing_period_start, billing_period_end);
CREATE INDEX idx_usage_tracking_resource_type ON public.usage_tracking(resource_type);
CREATE INDEX idx_usage_tracking_resource_id ON public.usage_tracking(resource_id) WHERE resource_id IS NOT NULL;
CREATE INDEX idx_usage_tracking_created_at ON public.usage_tracking(created_at);
CREATE INDEX idx_usage_tracking_billing_period ON public.usage_tracking(billing_period_start, billing_period_end);

CREATE INDEX idx_performance_metrics_action_type ON public.performance_metrics(action_type);
CREATE INDEX idx_performance_metrics_created_at ON public.performance_metrics(created_at);
CREATE INDEX idx_performance_metrics_user_id ON public.performance_metrics(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_performance_metrics_success ON public.performance_metrics(success);
CREATE INDEX idx_performance_metrics_duration ON public.performance_metrics(duration_ms);
CREATE INDEX idx_performance_metrics_endpoint ON public.performance_metrics(endpoint) WHERE endpoint IS NOT NULL;

CREATE INDEX idx_user_engagement_user_id ON public.user_engagement(user_id);
CREATE INDEX idx_user_engagement_date ON public.user_engagement(date);
CREATE INDEX idx_user_engagement_session ON public.user_engagement(session_id);
CREATE INDEX idx_user_engagement_duration ON public.user_engagement(session_duration_minutes) WHERE session_duration_minutes IS NOT NULL;

CREATE INDEX idx_system_health_service_metric ON public.system_health(service_name, metric_name);
CREATE INDEX idx_system_health_recorded_at ON public.system_health(recorded_at);
CREATE INDEX idx_system_health_status ON public.system_health(status);

CREATE INDEX idx_error_logs_error_type ON public.error_logs(error_type);
CREATE INDEX idx_error_logs_error_level ON public.error_logs(error_level);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at);
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_error_logs_service ON public.error_logs(service_name) WHERE service_name IS NOT NULL;
CREATE INDEX idx_error_logs_resolved ON public.error_logs(is_resolved, created_at) WHERE is_resolved = false;

CREATE INDEX idx_feature_flags_name ON public.feature_flags(name);
CREATE INDEX idx_feature_flags_enabled ON public.feature_flags(is_enabled) WHERE is_enabled = true;
CREATE INDEX idx_feature_flags_experiment ON public.feature_flags(experiment_name) WHERE experiment_name IS NOT NULL;

CREATE INDEX idx_feature_flag_usage_flag_id ON public.feature_flag_usage(feature_flag_id);
CREATE INDEX idx_feature_flag_usage_user_id ON public.feature_flag_usage(user_id);
CREATE INDEX idx_feature_flag_usage_created_at ON public.feature_flag_usage(created_at);

-- Partitioning setup for large tables (commented out for initial setup)
-- Consider partitioning these tables by date for better performance:
-- - performance_metrics (by created_at monthly)
-- - user_engagement (by date monthly)
-- - system_health (by recorded_at weekly)
-- - error_logs (by created_at monthly)

-- Create aggregated views for common analytics queries
CREATE OR REPLACE VIEW public.daily_user_stats AS
SELECT 
  date_trunc('day', created_at)::date as date,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) as total_sessions,
  AVG(session_duration_minutes) as avg_session_duration,
  SUM(documents_created) as total_documents_created,
  SUM(templates_used) as total_templates_used
FROM public.user_engagement
WHERE session_end_at IS NOT NULL
GROUP BY date_trunc('day', created_at)::date
ORDER BY date DESC;

CREATE OR REPLACE VIEW public.monthly_usage_summary AS
SELECT 
  user_id,
  billing_period_start,
  billing_period_end,
  resource_type,
  SUM(usage_count) as total_usage,
  SUM(total_cost) as total_cost
FROM public.usage_tracking
GROUP BY user_id, billing_period_start, billing_period_end, resource_type
ORDER BY billing_period_start DESC, user_id;

-- Comments for documentation
COMMENT ON TABLE public.usage_tracking IS 'Tracks resource usage for billing and subscription limit enforcement';
COMMENT ON TABLE public.performance_metrics IS 'Performance monitoring and optimization data';
COMMENT ON TABLE public.user_engagement IS 'User behavior and engagement analytics';
COMMENT ON TABLE public.system_health IS 'System health monitoring and alerting';
COMMENT ON TABLE public.error_logs IS 'Application error tracking and monitoring';
COMMENT ON TABLE public.feature_flags IS 'Feature flag configuration for gradual rollouts and A/B testing';
COMMENT ON TABLE public.feature_flag_usage IS 'Tracks feature flag exposure and usage by users';

COMMENT ON COLUMN public.usage_tracking.resource_type IS 'Type of resource being tracked for billing purposes';
COMMENT ON COLUMN public.usage_tracking.usage_amount IS 'Quantity used for metered billing (storage, API calls, etc.)';
COMMENT ON COLUMN public.performance_metrics.duration_ms IS 'Duration of the action in milliseconds';
COMMENT ON COLUMN public.user_engagement.conversion_events IS 'JSON array of conversion events during the session';
COMMENT ON COLUMN public.system_health.metric_value IS 'Numeric value of the health metric';
COMMENT ON COLUMN public.feature_flags.rollout_percentage IS 'Percentage of users who should see this feature (0-100)';

COMMENT ON VIEW public.daily_user_stats IS 'Daily aggregated user activity statistics';
COMMENT ON VIEW public.monthly_usage_summary IS 'Monthly usage summary per user for billing calculations';