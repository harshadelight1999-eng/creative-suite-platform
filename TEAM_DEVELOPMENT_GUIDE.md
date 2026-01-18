# Team Development Guide 👥

> **Multi-Developer Coordination for Creative Suite Platform**

## 🎯 Overview

This guide helps your development team work together on the Creative Suite Platform using our 12-Agent system. Each developer can pick an agent role and work on specific features without conflicts.

## 🏗️ Development Architecture

```
                    ┌─────────────────────┐
                    │   CTO DASHBOARD     │
                    │  (Coordination Hub) │
                    └──────────┬──────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       │                       │                       │
┌──────┴──────┐         ┌──────┴──────┐         ┌──────┴──────┐
│  CORE TEAM  │         │  UI TEAM    │         │ INFRA TEAM  │
├─────────────┤         ├─────────────┤         ├─────────────┤
│ Agent 1 PDF │         │ Agent 5 UI  │         │ Agent 2 Auth│
│ Agent 6 AI  │         │ Agent 8 Form│         │ Agent 3 Pay │
│ Agent 9 Col │         │ Agent 10 WF │         │ Agent 4 DB  │
└─────────────┘         └─────────────┘         │ Agent 7 Dev │
                                                └─────────────┘
```

## 📋 Agent Task Assignments

### Core Team

| Agent | File | Focus Area | Dependencies |
|-------|------|------------|--------------|
| **1. PDF Engine** | `AGENT_1_PDF_TASKS.md` | PDF generation, forms, templates | pdfme, pdf-lib |
| **6. AI Integration** | `AGENT_6_AI_TASKS.md` | Smart suggestions, auto-fill | Gemini API |
| **9. Collaboration** | `AGENT_9_COLLAB_TASKS.md` | Real-time sync, comments | Y.js, Socket.io |

### UI Team

| Agent | File | Focus Area | Dependencies |
|-------|------|------------|--------------|
| **5. UI/UX** | `AGENT_5_UI_UX_TASKS.md` | Components, canvas, design system | React, Tailwind |
| **8. Forms** | `AGENT_8_FORMS_TASKS.md` | Form builder, validation | SurveyJS |
| **10. Workflows** | `AGENT_10_WORKFLOW_TASKS.md` | Automation, approvals | NocoBase |

### Infrastructure Team

| Agent | File | Focus Area | Dependencies |
|-------|------|------------|--------------|
| **2. Auth** | `AGENT_2_AUTH_TASKS.md` | Login, sessions, permissions | Supabase Auth |
| **3. Payments** | `AGENT_3_PAYMENT_TASKS.md` | Subscriptions, billing | Stripe |
| **4. Database** | `AGENT_4_DATABASE_TASKS.md` | Schema, migrations, queries | PostgreSQL |
| **7. DevOps** | `AGENT_7_DEVOPS_TASKS.md` | CI/CD, testing, deployment | GitHub Actions |

## 🚀 Quick Start for Developers

### Step 1: Clone & Setup
```bash
git clone https://github.com/harshadelight1999-eng/creative-suite-platform.git
cd creative-suite-platform
npm install
cp .env.example .env.local
```

### Step 2: Configure Environment
```bash
# .env.local
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
VITE_GEMINI_API_KEY=your_gemini_key
```

### Step 3: Start Development
```bash
npm run dev
```

### Step 4: Pick Your Agent
1. Read the main task file: `AGENT_X_TASKS.md`
2. Read the prompt file: `AGENT_X_PROMPT.md`
3. Create your feature branch: `git checkout -b feature/agent-X-task-name`
4. Work on assigned tasks only
5. Submit PR for review

## 📁 Directory Ownership

Each agent owns specific directories:

```
src/
├── components/
│   ├── Canvas/          # Agent 5 (UI/UX)
│   ├── pdf/             # Agent 1 (PDF)
│   ├── forms/           # Agent 8 (Forms)
│   ├── auth/            # Agent 2 (Auth)
│   ├── billing/         # Agent 3 (Payments)
│   └── workflow/        # Agent 10 (Workflows)
├── services/
│   ├── PdfService.ts    # Agent 1
│   ├── AuthService.ts   # Agent 2
│   ├── StripeService.ts # Agent 3
│   ├── AIService.ts     # Agent 6
│   └── CollabService.ts # Agent 9
├── hooks/
│   ├── useDocument.ts   # Agent 1
│   ├── useAuth.ts       # Agent 2
│   ├── usePayment.ts    # Agent 3
│   ├── useCanvas.ts     # Agent 5
│   └── useCollab.ts     # Agent 9
└── lib/
    ├── supabase.ts      # Agent 4
    └── stripe.ts        # Agent 3
```

## 🔄 Git Workflow

### Branch Naming
```
feature/agent-1-pdfme-service
feature/agent-5-canvas-zoom
bugfix/agent-2-session-refresh
hotfix/agent-3-payment-failure
```

### Commit Messages
```
feat(agent-1): implement PdfmeService with template support
fix(agent-2): resolve session expiry issue
docs(agent-7): update deployment guide
test(agent-5): add canvas element tests
```

### Pull Request Process
1. Create PR with description
2. Request review from related agent
3. Pass CI/CD checks
4. Merge to `develop` branch
5. Weekly merge to `main`

## 🧪 Testing Requirements

Each agent must maintain:
- Unit tests for services
- Component tests for UI
- Integration tests for flows
- Minimum 80% coverage

```bash
npm run test              # Run all tests
npm run test:agent-1      # Run Agent 1 tests
npm run test:coverage     # Coverage report
```

## 📞 Communication

### Daily Sync
- Update your agent task file with progress
- Mark tasks as [x] completed, [/] in progress

### Conflicts
- If your work depends on another agent, coordinate first
- Use the `INTEGRATION REQUIREMENTS` section in task files
- Create shared interfaces in `src/types/`

## 🎯 Current Sprint Goals

### Week 1 (Foundation)
- [ ] Agent 1: PdfmeService with basic templates
- [ ] Agent 2: Supabase auth flow
- [ ] Agent 5: Canvas with drag-drop

### Week 2 (Core Features)
- [ ] Agent 1: Interactive form fields
- [ ] Agent 3: Stripe integration
- [ ] Agent 4: Database schema

### Week 3 (Integration)
- [ ] Agent 6: AI suggestions
- [ ] Agent 9: Real-time collaboration
- [ ] Agent 7: CI/CD pipeline

## 📊 Progress Tracking

Update the CTO Dashboard (`src/components/CTODashboard/`) with:
- Agent status
- Task completion
- Blockers
- Integration points

---

**Remember: Stay in your lane! Each agent has specific boundaries. Check your `DO NOT WORK ON` section before starting.**
