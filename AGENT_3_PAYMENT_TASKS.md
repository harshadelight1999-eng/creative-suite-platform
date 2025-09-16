# Agent 3: Payment Processing Engineer Tasks

## CURRENT ASSIGNMENT
**Focus:** Complete Stripe subscription and billing system implementation

## MANDATORY TECHNOLOGIES
- Stripe API (payments, subscriptions, webhooks)
- TypeScript for type safety
- React hooks for state management
- Supabase for user data integration

## TODAY'S TASKS (DAY 3 PRIORITY)
1. [ ] Install and configure Stripe SDK
2. [ ] Create StripeService.ts with full payment processing
3. [ ] Implement subscription tier management
4. [ ] Build billing portal components
5. [ ] Set up webhook handling for subscription events

## CODE TO IMPLEMENT

### Task 1: Install Stripe Dependencies
```bash
npm install @stripe/stripe-js stripe
npm install -D @types/stripe
```

### Task 2: Create Stripe Service
```typescript
// src/services/StripeService.ts
import { loadStripe, Stripe } from '@stripe/stripe-js';

export interface SubscriptionTier {
  id: 'free' | 'pro' | 'enterprise';
  name: string;
  price: number;
  features: string[];
  documentLimit: number;
  stripePriceId: string;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: ['5 documents per month', 'Basic templates', 'Standard support'],
    documentLimit: 5,
    stripePriceId: ''
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 19.99,
    features: ['100 documents per month', 'Premium templates', 'Priority support', 'AI generation'],
    documentLimit: 100,
    stripePriceId: 'price_pro_monthly'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    features: ['Unlimited documents', 'Custom templates', '24/7 support', 'API access'],
    documentLimit: -1,
    stripePriceId: 'price_enterprise_monthly'
  }
];

export class StripeService {
  private stripe: Stripe | null = null;

  async initialize(): Promise<void> {
    this.stripe = await loadStripe(process.env.VITE_STRIPE_PUBLIC_KEY!);
  }

  async createSubscription(userId: string, priceId: string): Promise<void> {
    // Implementation for subscription creation
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    // Implementation for subscription cancellation
  }

  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<void> {
    // Implementation for subscription updates
  }

  async createCustomerPortalSession(customerId: string): Promise<string> {
    // Implementation for customer portal access
  }
}
```

### Task 3: Create Billing Components
```typescript
// src/components/Billing/SubscriptionPlan.tsx
interface SubscriptionPlanProps {
  tier: SubscriptionTier;
  isCurrentPlan: boolean;
  onSelectPlan: (tierId: string) => void;
}

export const SubscriptionPlan: React.FC<SubscriptionPlanProps> = ({
  tier,
  isCurrentPlan,
  onSelectPlan
}) => {
  return (
    <div className={`border rounded-lg p-6 ${isCurrentPlan ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
      <h3 className="text-xl font-semibold">{tier.name}</h3>
      <p className="text-3xl font-bold">${tier.price}<span className="text-sm font-normal">/month</span></p>
      <ul className="mt-4 space-y-2">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={() => onSelectPlan(tier.id)}
        disabled={isCurrentPlan}
        className={`w-full mt-6 py-2 px-4 rounded-lg ${
          isCurrentPlan
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isCurrentPlan ? 'Current Plan' : `Upgrade to ${tier.name}`}
      </button>
    </div>
  );
};
```

### Task 4: Usage Tracking Hook
```typescript
// src/hooks/useSubscription.ts
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UsageData {
  documentsUsed: number;
  documentsLimit: number;
  currentTier: SubscriptionTier;
  billingPeriodEnd: Date;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const incrementUsage = async () => {
    // Track document generation
  };

  const canGenerateDocument = (): boolean => {
    if (!usage) return false;
    return usage.documentsLimit === -1 || usage.documentsUsed < usage.documentsLimit;
  };

  return {
    usage,
    loading,
    incrementUsage,
    canGenerateDocument
  };
};
```

## INTEGRATION REQUIREMENTS

### With Authentication Engineer (Agent 2)
- Receive user ID and profile data
- Integrate with user context for subscription status
- Handle subscription state in auth flow

### With Database Architect (Agent 4)
- Use subscription tables for billing data
- Track usage metrics in database
- Store payment history and receipts

### With UI/UX Engineer (Agent 5)
- Provide billing UI components
- Integrate subscription upgrade flows
- Show usage limits and warnings

## STRICT BOUNDARIES - DO NOT WORK ON
- PDF generation logic
- Authentication implementation
- Database schema design
- UI component styling (provide functional components only)
- AI integration
- Testing framework setup

## SUCCESS CRITERIA
- [ ] Users can subscribe to Pro/Enterprise plans
- [ ] Subscription management portal functional
- [ ] Usage tracking accurate and real-time
- [ ] Webhook handling for payment events
- [ ] PCI compliance maintained
- [ ] 99.9% payment success rate
- [ ] Integration with Supabase user data
- [ ] Comprehensive error handling for failed payments

## TIMELINE
- **Day 3:** Complete Stripe integration and basic subscription flow
- **Day 4:** Advanced billing features and usage tracking
- **Day 5:** Payment portal and subscription management

## DELIVERABLE FILES
- `/src/services/StripeService.ts`
- `/src/components/Billing/SubscriptionPlan.tsx`
- `/src/components/Billing/BillingPortal.tsx`
- `/src/hooks/useSubscription.ts`
- `/src/types/billing.ts`

Remember: Focus ONLY on payment processing and billing. All other functionality is handled by specialized agents in their respective domains.