# Agent 2: Authentication Engineer Tasks

## CURRENT ASSIGNMENT
Focus: Implement complete Supabase authentication system

## TODAY'S TASKS
1. ⬜ Install @supabase/supabase-js
2. ⬜ Create AuthContext provider
3. ⬜ Build Login component
4. ⬜ Build Signup component  
5. ⬜ Implement protected routes

## CODE TO IMPLEMENT

### Task 1: Install and configure Supabase
```bash
npm install @supabase/supabase-js
```

### Task 2: Create auth service
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Task 3: Create AuthContext
```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  subscription: 'free' | 'pro' | 'enterprise';
}

const AuthContext = createContext<{
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}>({} as any);

export const useAuth = () => useContext(AuthContext);
```

## DO NOT WORK ON
- PDF generation
- Payment processing
- UI components (except auth forms)
- Database schemas
- AI integration

## SUCCESS CRITERIA
- Users can sign up with email/password
- Users can log in/out
- Session persists on refresh
- Protected routes working
- User profile stored in context