# Agent 4: Database Architect Tasks

## CURRENT ASSIGNMENT
**Focus:** Complete PostgreSQL schema design and optimization for all platform features

## MANDATORY TECHNOLOGIES
- PostgreSQL 15+ via Supabase
- SQL migrations and schema management
- Database indexing and optimization
- Supabase realtime subscriptions
- Row Level Security (RLS) policies

## TODAY'S TASKS (DAY 1 PRIORITY)
1. [ ] Design comprehensive user management schema
2. [ ] Create document storage and versioning tables
3. [ ] Implement billing and subscription data models
4. [ ] Set up usage tracking and analytics tables
5. [ ] Configure RLS policies and database triggers

## SCHEMA DESIGN REQUIREMENTS

### Task 1: User Management Schema
```sql
-- /supabase/migrations/001_user_management.sql

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid')),
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences and settings
CREATE TABLE public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'en',
  notification_settings JSONB DEFAULT '{"email": true, "push": false}'::jsonb,
  default_template_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
```

### Task 2: Document Storage Schema
```sql
-- /supabase/migrations/002_document_storage.sql

-- Document templates
CREATE TABLE public.document_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'invoice', 'certificate', 'report', 'letter', 'form'
  is_premium BOOLEAN DEFAULT false,
  template_data JSONB NOT NULL, -- pdfme template structure
  preview_image_url TEXT,
  created_by UUID REFERENCES public.profiles(id),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User documents
CREATE TABLE public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  template_id UUID REFERENCES public.document_templates(id),
  title TEXT NOT NULL,
  description TEXT,
  document_data JSONB NOT NULL, -- Complete document structure
  pdf_url TEXT, -- Generated PDF storage URL
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generated', 'published', 'archived')),
  is_ai_generated BOOLEAN DEFAULT false,
  generation_metadata JSONB, -- AI generation details, performance metrics
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document versions for history tracking
CREATE TABLE public.document_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  document_data JSONB NOT NULL,
  change_summary TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, version_number)
);

-- Indexes for performance
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_template_id ON public.documents(template_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);
CREATE INDEX idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX idx_templates_category ON public.document_templates(category);
CREATE INDEX idx_templates_is_premium ON public.document_templates(is_premium);
```

### Task 3: Billing and Subscription Schema
```sql
-- /supabase/migrations/003_billing_subscriptions.sql

-- Subscription plans
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY, -- 'free', 'pro', 'enterprise'
  name TEXT NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  document_limit INTEGER, -- -1 for unlimited
  features JSONB NOT NULL,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT REFERENCES public.subscription_plans(id) NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment history
CREATE TABLE public.payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'canceled')),
  payment_method_type TEXT, -- 'card', 'bank_transfer', etc.
  invoice_url TEXT,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for billing queries
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_payment_history_user_id ON public.payment_history(user_id);
CREATE INDEX idx_payment_history_status ON public.payment_history(status);
```

### Task 4: Usage Tracking and Analytics
```sql
-- /supabase/migrations/004_usage_analytics.sql

-- Usage tracking for subscription limits
CREATE TABLE public.usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  resource_type TEXT NOT NULL, -- 'document_generation', 'ai_request', 'template_usage'
  resource_id UUID, -- Reference to document, template, etc.
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  usage_count INTEGER DEFAULT 1,
  metadata JSONB, -- Additional tracking data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_type, resource_id, billing_period_start)
);

-- Performance analytics
CREATE TABLE public.performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  action_type TEXT NOT NULL, -- 'pdf_generation', 'ai_request', 'template_load'
  resource_id UUID,
  duration_ms INTEGER NOT NULL,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System health monitoring
CREATE TABLE public.system_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL, -- 'pdf_service', 'ai_service', 'database'
  metric_name TEXT NOT NULL, -- 'response_time', 'error_rate', 'throughput'
  metric_value DECIMAL(10,4) NOT NULL,
  status TEXT DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical')),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_usage_tracking_user_period ON public.usage_tracking(user_id, billing_period_start, billing_period_end);
CREATE INDEX idx_usage_tracking_resource_type ON public.usage_tracking(resource_type);
CREATE INDEX idx_performance_metrics_action_type ON public.performance_metrics(action_type);
CREATE INDEX idx_performance_metrics_created_at ON public.performance_metrics(created_at);
CREATE INDEX idx_system_health_service_metric ON public.system_health(service_name, metric_name);
```

### Task 5: Row Level Security Policies
```sql
-- /supabase/migrations/005_security_policies.sql

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Documents policies
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.documents
  FOR DELETE USING (auth.uid() = user_id);

-- Template access policies
CREATE POLICY "Public templates are viewable by all authenticated users" ON public.document_templates
  FOR SELECT USING (is_public = true AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their own private templates" ON public.document_templates
  FOR SELECT USING (created_by = auth.uid());

-- Subscription policies
CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view their own usage" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);
```

### Task 6: Database Functions and Triggers
```sql
-- /supabase/migrations/006_functions_triggers.sql

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to track usage automatically
CREATE OR REPLACE FUNCTION track_document_generation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usage_tracking (
    user_id,
    resource_type,
    resource_id,
    billing_period_start,
    billing_period_end
  )
  VALUES (
    NEW.user_id,
    'document_generation',
    NEW.id,
    date_trunc('month', NOW()),
    (date_trunc('month', NOW()) + INTERVAL '1 month - 1 day')::date
  )
  ON CONFLICT (user_id, resource_type, resource_id, billing_period_start)
  DO UPDATE SET usage_count = usage_tracking.usage_count + 1;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for automatic usage tracking
CREATE TRIGGER track_document_usage AFTER INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION track_document_generation();

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_document_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  plan_limit INTEGER;
  current_usage INTEGER;
BEGIN
  -- Get user's current plan
  SELECT subscription_tier INTO user_plan
  FROM public.profiles
  WHERE id = NEW.user_id;
  
  -- Get plan limit
  SELECT document_limit INTO plan_limit
  FROM public.subscription_plans
  WHERE id = user_plan;
  
  -- Check if plan has unlimited documents
  IF plan_limit = -1 THEN
    RETURN NEW;
  END IF;
  
  -- Get current usage for this billing period
  SELECT COALESCE(SUM(usage_count), 0) INTO current_usage
  FROM public.usage_tracking
  WHERE user_id = NEW.user_id
    AND resource_type = 'document_generation'
    AND billing_period_start = date_trunc('month', NOW());
  
  -- Check limit
  IF current_usage >= plan_limit THEN
    RAISE EXCEPTION 'Document limit exceeded for current subscription plan';
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for subscription limit enforcement
CREATE TRIGGER enforce_document_limit BEFORE INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION check_document_limit();
```

## INTEGRATION REQUIREMENTS

### With Authentication Engineer (Agent 2)
- Provide user profile schema that extends Supabase auth
- Support user roles and permissions
- Enable session management and security policies

### With Payment Engineer (Agent 3)
- Provide subscription and billing table structures
- Support usage tracking for billing purposes
- Enable real-time subscription status updates

### With PDF Engineer (Agent 1)
- Provide document storage and template schemas
- Support document versioning and metadata
- Enable template library management

### With UI/UX Engineer (Agent 5)
- Provide optimized queries for frontend components
- Support real-time data subscriptions
- Enable efficient pagination and filtering

### With AI Engineer (Agent 6)
- Provide document metadata for AI processing
- Support AI-generated content tracking
- Enable performance analytics for AI features

## STRICT BOUNDARIES - DO NOT WORK ON
- Frontend components or UI design
- Authentication logic implementation
- Payment processing code
- PDF generation algorithms
- AI model integration
- Testing framework setup

## SUCCESS CRITERIA
- [ ] All table schemas created with proper relationships
- [ ] Row Level Security policies implemented
- [ ] Database indexes optimized for performance
- [ ] Usage tracking system functional
- [ ] Subscription limit enforcement working
- [ ] Real-time capabilities configured
- [ ] Migration scripts tested and documented
- [ ] Query performance under 50ms for simple operations

## PERFORMANCE REQUIREMENTS
- **Query Response Time:** <50ms for simple operations, <200ms for complex joins
- **Database Uptime:** 99.9% availability
- **Backup Strategy:** Automated daily backups with point-in-time recovery
- **Scaling:** Design for horizontal scaling with read replicas

## DELIVERABLE FILES
- `/supabase/migrations/001_user_management.sql`
- `/supabase/migrations/002_document_storage.sql`
- `/supabase/migrations/003_billing_subscriptions.sql`
- `/supabase/migrations/004_usage_analytics.sql`
- `/supabase/migrations/005_security_policies.sql`
- `/supabase/migrations/006_functions_triggers.sql`
- `/src/types/database.ts` (TypeScript type definitions)

Remember: Focus ONLY on database architecture, optimization, and data modeling. All application logic is handled by other specialized agents.