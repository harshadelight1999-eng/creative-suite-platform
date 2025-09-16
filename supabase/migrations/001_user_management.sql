-- User Management Schema
-- This migration creates the core user management tables extending Supabase auth

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  stripe_customer_id TEXT UNIQUE,
  onboarding_completed BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences and settings
CREATE TABLE public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  notification_settings JSONB DEFAULT '{"email": true, "push": false, "marketing": false}'::jsonb,
  default_template_id UUID,
  pdf_settings JSONB DEFAULT '{"format": "A4", "orientation": "portrait", "quality": "high"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User sessions for enhanced tracking
CREATE TABLE public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  location_country TEXT,
  location_city TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User activity log for audit trails
CREATE TABLE public.user_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'login', 'logout', 'profile_update', 'password_change', etc.
  resource_type TEXT, -- 'document', 'template', 'subscription', etc.
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX idx_profiles_stripe_customer ON public.profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_user_preferences_theme ON public.user_preferences(theme);

CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON public.user_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_user_sessions_expires_at ON public.user_sessions(expires_at);
CREATE INDEX idx_user_sessions_token ON public.user_sessions(session_token);

CREATE INDEX idx_user_activity_user_id ON public.user_activity_log(user_id);
CREATE INDEX idx_user_activity_action_type ON public.user_activity_log(action_type);
CREATE INDEX idx_user_activity_created_at ON public.user_activity_log(created_at);
CREATE INDEX idx_user_activity_resource ON public.user_activity_log(resource_type, resource_id) WHERE resource_id IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users with subscription and billing information';
COMMENT ON TABLE public.user_preferences IS 'User-specific settings and preferences for the application';
COMMENT ON TABLE public.user_sessions IS 'Enhanced session tracking for security and analytics';
COMMENT ON TABLE public.user_activity_log IS 'Audit trail for user actions and system events';

COMMENT ON COLUMN public.profiles.subscription_tier IS 'Current subscription plan: free, pro, or enterprise';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for billing integration';
COMMENT ON COLUMN public.user_preferences.notification_settings IS 'JSON object containing notification preferences';
COMMENT ON COLUMN public.user_preferences.pdf_settings IS 'JSON object containing default PDF generation settings';