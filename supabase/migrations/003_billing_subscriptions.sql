-- Billing and Subscription Management Schema
-- This migration creates comprehensive billing, subscription, and payment tracking tables

-- Subscription plans with feature definitions
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY, -- 'free', 'pro', 'enterprise'
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  currency TEXT DEFAULT 'usd',
  
  -- Feature limits
  document_limit INTEGER, -- -1 for unlimited
  ai_generations_limit INTEGER, -- -1 for unlimited
  template_access_level TEXT DEFAULT 'basic' CHECK (template_access_level IN ('basic', 'premium', 'all')),
  storage_limit_gb INTEGER, -- -1 for unlimited
  collaborators_limit INTEGER, -- -1 for unlimited
  
  -- Feature flags
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Stripe integration
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  stripe_product_id TEXT,
  
  -- Plan management
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES public.subscription_plans(id) NOT NULL,
  
  -- Stripe subscription details
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  
  -- Subscription status and lifecycle
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'incomplete_expired', 'trialing', 'paused')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  -- Billing periods
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  
  -- Cancellation management
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  -- Pause/resume functionality
  pause_collection BOOLEAN DEFAULT false,
  pause_collection_resumes_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment history and transaction tracking
CREATE TABLE public.payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  
  -- Stripe payment details
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_invoice_id TEXT,
  stripe_charge_id TEXT,
  
  -- Payment information
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'canceled', 'processing', 'requires_payment_method', 'requires_confirmation', 'requires_action')),
  
  -- Payment method details
  payment_method_type TEXT, -- 'card', 'bank_transfer', 'digital_wallet', etc.
  payment_method_details JSONB, -- Card last 4, brand, etc.
  
  -- Invoice and receipt management
  invoice_url TEXT,
  receipt_url TEXT,
  hosted_invoice_url TEXT,
  
  -- Failure handling
  failure_reason TEXT,
  failure_code TEXT,
  
  -- Refund tracking
  refunded_amount DECIMAL(10,2) DEFAULT 0,
  refund_reason TEXT,
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing addresses for tax compliance
CREATE TABLE public.billing_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Address details
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  
  -- Tax information
  tax_id TEXT, -- VAT number, tax ID, etc.
  tax_id_type TEXT, -- 'vat', 'gst', 'ein', etc.
  
  -- Address management
  is_default BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discount codes and promotions
CREATE TABLE public.discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT,
  description TEXT,
  
  -- Discount configuration
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  
  -- Stripe coupon integration
  stripe_coupon_id TEXT UNIQUE,
  stripe_promotion_code_id TEXT,
  
  -- Usage limits
  max_redemptions INTEGER, -- NULL for unlimited
  current_redemptions INTEGER DEFAULT 0,
  max_redemptions_per_customer INTEGER DEFAULT 1,
  
  -- Validity period
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Restrictions
  minimum_amount DECIMAL(10,2),
  applicable_plans TEXT[], -- Array of plan IDs
  first_time_customers_only BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Discount code usage tracking
CREATE TABLE public.discount_code_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discount_code_id UUID REFERENCES public.discount_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  
  -- Usage details
  discount_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  
  -- Stripe details
  stripe_discount_id TEXT,
  
  -- Timestamps
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(discount_code_id, user_id)
);

-- Subscription change history for auditing
CREATE TABLE public.subscription_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Change details
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'plan_changed', 'canceled', 'resumed', 'trial_started', 'trial_ended', 'payment_failed', 'payment_succeeded')),
  previous_plan_id TEXT,
  new_plan_id TEXT,
  previous_status TEXT,
  new_status TEXT,
  
  -- Financial impact
  amount_change DECIMAL(10,2),
  effective_date TIMESTAMP WITH TIME ZONE,
  
  -- Reason and metadata
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON public.subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX idx_subscriptions_current_period ON public.subscriptions(current_period_start, current_period_end);
CREATE INDEX idx_subscriptions_trial_end ON public.subscriptions(trial_end) WHERE trial_end IS NOT NULL;

CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX idx_payment_history_subscription_id ON public.payment_history(subscription_id);
CREATE INDEX idx_payment_history_status ON public.payment_history(status);
CREATE INDEX idx_payment_history_stripe_payment_intent ON public.payment_history(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX idx_payment_history_created_at ON public.payment_history(created_at DESC);
CREATE INDEX idx_payment_history_amount ON public.payment_history(amount DESC);

CREATE INDEX idx_billing_addresses_user_id ON public.billing_addresses(user_id);
CREATE INDEX idx_billing_addresses_default ON public.billing_addresses(is_default) WHERE is_default = true;
CREATE INDEX idx_billing_addresses_country ON public.billing_addresses(country);

CREATE INDEX idx_discount_codes_code ON public.discount_codes(code);
CREATE INDEX idx_discount_codes_active ON public.discount_codes(is_active) WHERE is_active = true;
CREATE INDEX idx_discount_codes_valid_period ON public.discount_codes(valid_from, valid_until);
CREATE INDEX idx_discount_codes_stripe_coupon ON public.discount_codes(stripe_coupon_id) WHERE stripe_coupon_id IS NOT NULL;

CREATE INDEX idx_discount_code_usage_user_id ON public.discount_code_usage(user_id);
CREATE INDEX idx_discount_code_usage_code_id ON public.discount_code_usage(discount_code_id);

CREATE INDEX idx_subscription_changes_subscription_id ON public.subscription_changes(subscription_id);
CREATE INDEX idx_subscription_changes_user_id ON public.subscription_changes(user_id);
CREATE INDEX idx_subscription_changes_type ON public.subscription_changes(change_type);
CREATE INDEX idx_subscription_changes_created_at ON public.subscription_changes(created_at DESC);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (id, name, description, price_monthly, price_yearly, document_limit, ai_generations_limit, template_access_level, storage_limit_gb, collaborators_limit, features, stripe_price_id_monthly, stripe_price_id_yearly, is_popular, sort_order) VALUES
(
  'free',
  'Free',
  'Perfect for getting started with basic document generation',
  0.00,
  0.00,
  5, -- 5 documents per month
  10, -- 10 AI generations per month
  'basic',
  1, -- 1GB storage
  0, -- No collaborators
  '{"templates": "basic", "exports": ["pdf"], "support": "community", "watermark": true}',
  NULL,
  NULL,
  false,
  1
),
(
  'pro',
  'Pro',
  'Advanced features for professionals and small teams',
  19.99,
  199.99, -- ~17% discount annually
  100, -- 100 documents per month
  500, -- 500 AI generations per month
  'premium',
  10, -- 10GB storage
  5, -- Up to 5 collaborators
  '{"templates": "premium", "exports": ["pdf", "docx", "png"], "support": "email", "watermark": false, "analytics": true, "api_access": true}',
  'price_1ProMonthly',
  'price_1ProYearly',
  true,
  2
),
(
  'enterprise',
  'Enterprise',
  'Full-featured solution for teams and organizations',
  99.99,
  999.99, -- ~17% discount annually
  -1, -- Unlimited documents
  -1, -- Unlimited AI generations
  'all',
  -1, -- Unlimited storage
  -1, -- Unlimited collaborators
  '{"templates": "all", "exports": ["pdf", "docx", "png", "html"], "support": "priority", "watermark": false, "analytics": true, "api_access": true, "sso": true, "custom_branding": true, "dedicated_support": true}',
  'price_1EnterpriseMonthly',
  'price_1EnterpriseYearly',
  false,
  3
);

-- Comments for documentation
COMMENT ON TABLE public.subscription_plans IS 'Available subscription plans with pricing and feature definitions';
COMMENT ON TABLE public.subscriptions IS 'User subscriptions with Stripe integration and lifecycle management';
COMMENT ON TABLE public.payment_history IS 'Complete payment transaction history with Stripe details';
COMMENT ON TABLE public.billing_addresses IS 'User billing addresses for tax compliance and invoicing';
COMMENT ON TABLE public.discount_codes IS 'Promotional discount codes and coupons';
COMMENT ON TABLE public.discount_code_usage IS 'Tracking of discount code redemptions';
COMMENT ON TABLE public.subscription_changes IS 'Audit trail of subscription modifications';

COMMENT ON COLUMN public.subscription_plans.document_limit IS 'Monthly document generation limit (-1 for unlimited)';
COMMENT ON COLUMN public.subscription_plans.features IS 'JSON object defining available features for this plan';
COMMENT ON COLUMN public.subscriptions.metadata IS 'Additional subscription metadata from Stripe';
COMMENT ON COLUMN public.payment_history.payment_method_details IS 'JSON object with payment method details (card brand, last 4, etc.)';
COMMENT ON COLUMN public.discount_codes.applicable_plans IS 'Array of plan IDs this discount applies to (NULL for all plans)';