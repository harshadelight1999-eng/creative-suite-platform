# CLAUDE PROJECT MEMORY
## Creative Suite Platform - AI-Powered Multimedia Editor

**📅 Last Updated**: September 16, 2025  
**🔧 Status**: Active Development  
**🎯 Current Phase**: Foundation Complete, Canvas Engine Development

---

## 🏗️ **PROJECT IDENTITY**

### **Core Information**
- **Project Name**: Creative Suite Platform (evolved from "PDF King")
- **GitHub Repository**: https://github.com/harshadelight1999-eng/creative-suite-platform
- **GitHub Account**: `harshadelight1999-eng`
- **Project Directory**: `/Users/devji/Downloads/project pdf king`
- **Primary Branch**: `main`

### **Platform Vision**
Comprehensive cloud-native creative suite combining:
- **Canvas Engine**: Photoshop-like photo editing
- **Video Engine**: Timeline-based video production  
- **Graphics Engine**: Vector design and illustration
- **PDF Engine**: Professional document generation
- **AI Integration**: Intelligent creative assistance
- **Real-time Collaboration**: Live multi-user editing

---

## 🎯 **DEVELOPMENT FRAMEWORK**

### **12-Agent Specialization System**
The project uses a coordinated 12-agent development framework:

| Agent | Domain | Key Technologies | Current Status |
|-------|--------|------------------|----------------|
| **1 - PDF Engine** | Document generation | pdfme, PDF-lib | ✅ Foundation complete |
| **2 - Authentication** | User security | Supabase Auth, JWT | 🔄 Implementation needed |
| **3 - Payments** | Billing system | Stripe webhooks | 🔄 Implementation needed |
| **4 - Database** | Data architecture | PostgreSQL, Supabase | ✅ Schemas designed |
| **5 - UI/UX Core** | Design system | React, Tailwind, Radix | 🔄 Components needed |
| **6 - AI Integration** | ML features | Gemini API, OpenAI | 🔄 Service layer needed |
| **7 - DevOps** | Testing, deployment | Vitest, GitHub Actions | ✅ CI/CD configured |
| **8 - Canvas Engine** | Photo editing | Fabric.js, Konva | 🚧 Priority development |
| **9 - Video Engine** | Video production | Remotion, FFmpeg | 📅 Phase 3 |
| **10 - Graphics Engine** | Vector design | SVG.js, Paper.js | 📅 Phase 4 |
| **11 - Asset Management** | Media storage | Cloudinary, S3 | 🔄 Implementation needed |
| **12 - Collaboration** | Real-time editing | Y.js, Socket.io | 📅 Phase 5 |

---

## 🛠️ **TECHNICAL STACK**

### **Frontend Core**
```json
{
  "framework": "React 18.3.1 + TypeScript 5.5.3",
  "build": "Vite 5.4.2",
  "styling": "Tailwind CSS + Radix UI",
  "state": "Zustand + Immer",
  "routing": "React Router DOM"
}
```

### **Creative Engines**
```json
{
  "canvas": "Fabric.js 5.3.0 + Konva 9.2.0 + PIXI.js",
  "video": "Remotion 4.0.0 + FFmpeg-WASM",
  "vector": "SVG.js 3.2.0 + Paper.js",
  "pdf": "pdfme 5.4.1 + PDF-lib"
}
```

### **Backend Services**
```json
{
  "database": "PostgreSQL via Supabase",
  "auth": "Supabase Auth + JWT",
  "payments": "Stripe + webhooks",
  "storage": "AWS S3 + Cloudinary CDN",
  "ai": "Gemini API + OpenAI"
}
```

### **Collaboration & Real-time**
```json
{
  "realtime": "Y.js 13.6.0 for shared editing",
  "communication": "Socket.io 4.7.0",
  "webrtc": "Simple-peer for P2P"
}
```

---

## 🚀 **DEVELOPMENT SETUP**

### **Environment Configuration**
**Required Environment Variables:**
```bash
# Supabase (Database & Auth)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (Payments)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# AI Services
VITE_GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Asset Management
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### **Essential Commands**
```bash
# Development
npm run dev                 # Start development server
npm run build              # Production build
npm run preview            # Preview production build

# Testing
npm run test               # Unit tests with Vitest
npm run test:e2e          # E2E tests with Playwright
npm run type-check        # TypeScript validation
npm run lint              # ESLint validation

# Database
npm run db:migrate        # Run Supabase migrations
npm run db:reset          # Reset database
```

---

## 📁 **PROJECT ARCHITECTURE**

### **Directory Structure**
```
creative-suite-platform/
├── .github/workflows/      # CI/CD automation
├── .claude/agents/         # Agent configuration files
├── src/
│   ├── engines/           # Creative engines (Canvas, Video, Graphics, PDF)
│   ├── components/        # React components by feature
│   ├── services/          # API integrations & business logic
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   └── collaboration/     # Real-time editing system
├── supabase/migrations/   # Database schema evolution
├── resources/documentation/ # Project documentation
└── docs/                  # User-facing documentation
```

### **Key Configuration Files**
- **Package definition**: `resources/documentation/COMPLETE_PACKAGE.json`
- **Agent coordination**: `CTO_COORDINATION_FRAMEWORK.md`
- **Platform expansion**: `CREATIVE_PLATFORM_EXPANSION.md`
- **CI/CD pipeline**: `.github/workflows/ci-cd.yml`

---

## 🔄 **CI/CD PIPELINE**

### **GitHub Actions Workflow**
**Automated on every push/PR:**
1. **Quality Gates**: Linting, type checking, unit tests
2. **Security Scanning**: Trivy vulnerability detection
3. **Performance Testing**: Lighthouse CI validation
4. **E2E Testing**: Playwright automation
5. **Build Process**: Production build with artifacts
6. **Deployment**: Staging (develop) → Production (main)

### **Deployment Targets**
- **Staging**: `develop` branch → Vercel staging environment
- **Production**: `main` branch → Vercel production environment
- **Releases**: Automated GitHub releases on production deployment

---

## 🎯 **CURRENT PRIORITIES**

### **Immediate Focus (Phase 2)**
1. **Canvas Engine Development**
   - Advanced photo editing with filters
   - Layer management system
   - Brush tools with pressure sensitivity
   - Selection tools (marquee, lasso, magic wand)
   - Non-destructive editing capabilities

2. **Authentication System**
   - Complete Supabase Auth integration
   - User profile management
   - Role-based access control
   - Session management

3. **Core UI Components**
   - Design system implementation
   - Responsive layout framework
   - Accessibility compliance (WCAG 2.1 AA)

### **Performance Targets**
- **Canvas Operations**: <100ms response time
- **Filter Application**: <1 second for 4K images
- **PDF Generation**: <2 seconds for standard documents
- **Page Load Speed**: <2 seconds first contentful paint
- **Test Coverage**: 90%+ across all modules

---

## 🔍 **IMPORTANT CONTEXT FOR AGENTS**

### **Development Guidelines**
1. **Agent Boundaries**: Each agent must stay within their domain expertise
2. **Integration Contracts**: All cross-agent communication via defined interfaces
3. **Code Quality**: TypeScript strict mode, comprehensive error handling
4. **Testing Requirements**: Unit tests + integration tests for all features
5. **Performance First**: Optimize for user experience and responsiveness

### **Common Patterns**
```typescript
// Service Layer Pattern
interface CreativeEngine {
  export(format: ExportFormat): Promise<Blob>;
  import(file: File): Promise<void>;
  undo(): void;
  redo(): void;
}

// State Management Pattern
interface EngineState {
  isLoading: boolean;
  error: string | null;
  currentTool: ToolType;
  history: HistoryItem[];
}

// Component Pattern
interface EngineComponent {
  engine: CreativeEngine;
  onExport: (blob: Blob) => void;
  onError: (error: Error) => void;
}
```

### **Integration Points**
- **Engine Coordination**: Via `EngineCoordinator` class
- **Asset Sharing**: Cross-engine asset pipeline
- **User Context**: Shared authentication state
- **Real-time Sync**: Collaborative editing events

---

## 📊 **SUCCESS METRICS**

### **Technical KPIs**
- **Uptime**: 99.9% availability target
- **Performance**: Core Web Vitals compliance
- **Security**: Zero critical vulnerabilities
- **Coverage**: 90%+ test coverage maintained

### **Product KPIs**
- **User Engagement**: Session duration and feature adoption
- **Creative Output**: Documents/images/videos created per user
- **Collaboration**: Multi-user session frequency
- **AI Utilization**: AI feature usage and satisfaction

---

## 🧠 **MEMORY ANCHORS**

**Key Facts for Future Sessions:**
- Started as "PDF King", evolved to full creative suite
- 12-agent development framework for coordinated work
- GitHub: `harshadelight1999-eng/creative-suite-platform`
- Current focus: Canvas Engine (photo editing capabilities)
- Tech stack: React + TypeScript + Fabric.js + Supabase
- CI/CD: Fully automated with GitHub Actions + Vercel
- Target market: SMBs, content creators, design teams
- Competitive positioning: Unified alternative to Adobe Creative Cloud

**Critical Success Factors:**
1. Maintain agent specialization boundaries
2. Prioritize real-time collaboration features
3. Ensure AI integration adds genuine value
4. Keep performance targets as primary constraints
5. Build for scalability from day one

---

*This document serves as the canonical source of truth for the Creative Suite Platform project. All agents and contributors should reference this for context, current status, and development guidelines.*

**🤖 Last updated by Claude Code on 2025-09-16**