# DEVELOPMENT GUIDE
## Creative Suite Platform - Agent & Contributor Guidelines

**📋 Version**: 1.0  
**📅 Last Updated**: September 16, 2025  
**🎯 Target Audience**: Development agents, contributors, team leads

---

## 🎯 **OVERVIEW**

This guide provides comprehensive instructions for agents and contributors working on the Creative Suite Platform. Our 12-agent development framework ensures coordinated, efficient development while maintaining code quality and architectural integrity.

---

## 🏗️ **AGENT COORDINATION SYSTEM**

### **Agent Specialization Matrix**

Each agent has clearly defined responsibilities and boundaries:

#### **CORE PLATFORM AGENTS**

**🔧 AGENT 1: PDF ENGINE SPECIALIST**
- **Domain**: Document generation, template system
- **Technologies**: pdfme, PDF-lib, Canvas API
- **Deliverables**: `/src/engines/PDFEngine/`
- **Integration**: Provides document structures to UI agents
- **KPIs**: <2s generation, 10+ professional templates

**🔐 AGENT 2: AUTHENTICATION ENGINEER**
- **Domain**: User security, session management
- **Technologies**: Supabase Auth, JWT, OAuth
- **Deliverables**: `/src/services/auth/`, `/src/contexts/AuthContext.tsx`
- **Integration**: Supplies user context to all other agents
- **KPIs**: 99.9% uptime, <100ms auth response

**💳 AGENT 3: PAYMENT PROCESSING ENGINEER**
- **Domain**: Billing, subscriptions, usage tracking
- **Technologies**: Stripe, webhooks, billing APIs
- **Deliverables**: `/src/services/payments/`, `/src/components/Billing/`
- **Integration**: Uses auth context, provides usage limits
- **KPIs**: 99.9% payment success, PCI compliance

**🗄️ AGENT 4: DATABASE ARCHITECT**
- **Domain**: Schema design, query optimization
- **Technologies**: PostgreSQL, Supabase, migrations
- **Deliverables**: `/supabase/migrations/`, API schemas
- **Integration**: Provides data layer for all agents
- **KPIs**: <50ms queries, ACID compliance

**🎨 AGENT 5: UI/UX CORE ENGINEER**
- **Domain**: Design system, responsive components
- **Technologies**: React, Tailwind, Radix UI, @dnd-kit
- **Deliverables**: `/src/components/core/`, design tokens
- **Integration**: Provides UI framework for all engines
- **KPIs**: 95+ Lighthouse score, WCAG 2.1 AA

**🤖 AGENT 6: AI INTEGRATION ENGINEER**
- **Domain**: ML features, intelligent assistance
- **Technologies**: Gemini API, OpenAI, embeddings
- **Deliverables**: `/src/ai/`, AI-powered components
- **Integration**: Enhances all creative engines with AI
- **KPIs**: 95% user satisfaction, <3s response time

**🚀 AGENT 7: TESTING & DEVOPS ENGINEER**
- **Domain**: Testing, CI/CD, monitoring
- **Technologies**: Vitest, Playwright, GitHub Actions
- **Deliverables**: Test suites, deployment pipelines
- **Integration**: Tests all agent deliverables
- **KPIs**: 90%+ coverage, zero-downtime deployments

#### **CREATIVE ENGINE AGENTS**

**🎨 AGENT 8: CANVAS ENGINE SPECIALIST**
- **Domain**: Photo editing, filters, image manipulation
- **Technologies**: Fabric.js, Konva, PIXI.js, WebGL
- **Deliverables**: `/src/engines/CanvasEngine/`
- **Integration**: Shares assets with all creative engines
- **KPIs**: <1s filter application, 50+ effects

**🎬 AGENT 9: VIDEO ENGINE SPECIALIST**
- **Domain**: Video editing, motion graphics, rendering
- **Technologies**: Remotion, FFmpeg-WASM, WebCodecs
- **Deliverables**: `/src/engines/VideoEngine/`
- **Integration**: Uses canvas assets, exports to multiple formats
- **KPIs**: Real-time preview at 30fps, 1:1 render ratio

**📐 AGENT 10: GRAPHICS ENGINE SPECIALIST**
- **Domain**: Vector editing, typography, illustrations
- **Technologies**: SVG.js, Paper.js, OpenType.js
- **Deliverables**: `/src/engines/GraphicsEngine/`
- **Integration**: Provides vectors to other engines
- **KPIs**: Scalable graphics, print-ready output

**💾 AGENT 11: ASSET MANAGEMENT SPECIALIST**
- **Domain**: Media storage, optimization, CDN
- **Technologies**: AWS S3, Cloudinary, WebP conversion
- **Deliverables**: `/src/services/assets/`
- **Integration**: Serves all engines with optimized media
- **KPIs**: 99.9% uptime, global <100ms access

**🤝 AGENT 12: COLLABORATION SPECIALIST**
- **Domain**: Real-time editing, conflict resolution
- **Technologies**: Y.js, Socket.io, WebRTC
- **Deliverables**: `/src/collaboration/`
- **Integration**: Enables live editing across all engines
- **KPIs**: <100ms sync, 50+ concurrent users

---

## 🛠️ **DEVELOPMENT WORKFLOW**

### **Getting Started**

**1. Environment Setup**
```bash
# Clone and setup
git clone https://github.com/harshadelight1999-eng/creative-suite-platform.git
cd creative-suite-platform
npm install

# Environment configuration
cp .env.example .env.local
# Fill in your API keys and configuration

# Start development
npm run dev
```

**2. Agent Task Assignment**
- Check `AGENT_X_TASKS.md` files for current assignments
- Pick unassigned tasks matching your agent specialization
- Update task status in coordination files

**3. Branch Strategy**
```bash
# Create feature branch
git checkout -b feature/agent-X-task-name

# Work on implementation
# Commit frequently with descriptive messages

# Push and create PR
git push origin feature/agent-X-task-name
```

### **Coding Standards**

**TypeScript Configuration**
```typescript
// Use strict mode always
"strict": true
"noImplicitAny": true
"strictNullChecks": true

// Preferred patterns
interface Props {
  readonly data: ReadonlyArray<Item>;
  onUpdate: (item: Item) => void;
}

// Error handling
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  logger.error('Operation failed', { error, context });
  return { success: false, error: error.message };
}
```

**Component Structure**
```typescript
// Component template
interface ComponentProps {
  // Props with clear types
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks first
  const [state, setState] = useState();
  const { data, loading, error } = useCustomHook();

  // Event handlers
  const handleAction = useCallback(() => {
    // Implementation
  }, [dependencies]);

  // Early returns for loading/error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  // Main render
  return (
    <div className="component-container">
      {/* Component content */}
    </div>
  );
};
```

**Service Layer Pattern**
```typescript
// Service interface
interface EngineService {
  initialize(): Promise<void>;
  process(input: InputType): Promise<OutputType>;
  cleanup(): Promise<void>;
}

// Implementation
export class CanvasEngineService implements EngineService {
  private fabric: fabric.Canvas;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    this.fabric = new fabric.Canvas('canvas');
    this.initialized = true;
  }

  async process(input: ImageInput): Promise<ProcessedImage> {
    if (!this.initialized) {
      throw new Error('Service not initialized');
    }
    
    // Processing logic
    return result;
  }

  async cleanup(): Promise<void> {
    this.fabric?.dispose();
    this.initialized = false;
  }
}
```

### **Testing Requirements**

**Unit Testing with Vitest**
```typescript
// Test structure
describe('CanvasEngine', () => {
  let engine: CanvasEngine;

  beforeEach(() => {
    engine = new CanvasEngine();
  });

  afterEach(() => {
    engine.cleanup();
  });

  it('should apply filter correctly', async () => {
    // Arrange
    const input = createMockImage();
    const filter = { type: 'blur', intensity: 0.5 };

    // Act
    const result = await engine.applyFilter(input, filter);

    // Assert
    expect(result).toBeDefined();
    expect(result.filter).toEqual(filter);
  });
});
```

**E2E Testing with Playwright**
```typescript
// E2E test example
test('canvas editing workflow', async ({ page }) => {
  // Navigate to canvas editor
  await page.goto('/canvas');
  
  // Upload image
  await page.setInputFiles('input[type="file"]', 'test-image.jpg');
  
  // Apply filter
  await page.click('[data-testid="blur-filter"]');
  await page.fill('[data-testid="intensity-slider"]', '0.5');
  
  // Verify result
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
});
```

---

## 🔄 **INTEGRATION PROTOCOLS**

### **Cross-Agent Communication**

**Interface Contracts**
All agents must define clear interfaces for other agents:

```typescript
// Engine coordination interface
interface EngineCoordinator {
  registerEngine(type: EngineType, engine: CreativeEngine): void;
  shareAsset(fromEngine: string, toEngine: string, asset: Asset): Promise<void>;
  getEngineCapabilities(type: EngineType): EngineCapability[];
}

// Asset sharing interface
interface AssetShare {
  id: string;
  type: AssetType;
  data: AssetData;
  metadata: AssetMetadata;
  permissions: SharePermissions;
}
```

**Event System**
```typescript
// Engine events
type EngineEvent = 
  | { type: 'ASSET_CREATED'; payload: Asset }
  | { type: 'OPERATION_COMPLETED'; payload: OperationResult }
  | { type: 'ERROR_OCCURRED'; payload: Error };

// Event emission
engine.emit('ASSET_CREATED', newAsset);

// Event listening
engine.on('ASSET_CREATED', (asset) => {
  // Handle asset creation
});
```

### **Data Flow Patterns**

**State Management**
```typescript
// Zustand store structure
interface AppStore {
  // Auth state
  user: User | null;
  session: Session | null;
  
  // Engine states
  canvasEngine: CanvasState;
  videoEngine: VideoState;
  graphicsEngine: GraphicsState;
  
  // Shared state
  activeProject: Project | null;
  collaborators: Collaborator[];
}

// Store actions
interface AppActions {
  // Auth actions
  login: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
  
  // Engine actions
  switchEngine: (type: EngineType) => void;
  saveProject: () => Promise<void>;
}
```

---

## 🎯 **QUALITY ASSURANCE**

### **Code Review Process**

**Review Checklist**
- [ ] TypeScript strict mode compliance
- [ ] Comprehensive error handling
- [ ] Performance optimization
- [ ] Security best practices
- [ ] Accessibility compliance
- [ ] Test coverage >90%
- [ ] Documentation updated

**Performance Guidelines**
```typescript
// Optimize re-renders
const MemoizedComponent = React.memo(({ data }) => {
  return <ExpensiveComponent data={data} />;
});

// Lazy load components
const CanvasEditor = lazy(() => import('./CanvasEditor'));

// Debounce expensive operations
const debouncedSave = useDebounce(saveProject, 1000);
```

### **Security Requirements**

**Input Validation**
```typescript
// Zod schema validation
const AssetSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['image', 'video', 'document']),
  size: z.number().max(100 * 1024 * 1024), // 100MB limit
  format: z.string().regex(/^(jpg|png|gif|mp4|pdf)$/i)
});

// Validation in API routes
const validateAsset = (data: unknown): Asset => {
  return AssetSchema.parse(data);
};
```

**File Upload Security**
```typescript
// Secure file upload
const uploadAsset = async (file: File): Promise<Asset> => {
  // Validate file type and size
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
  
  // Scan for malware (in production)
  await scanFile(file);
  
  // Upload to secure storage
  const url = await uploadToS3(file);
  
  return createAsset({ url, type: file.type, size: file.size });
};
```

---

## 📊 **MONITORING & ANALYTICS**

### **Performance Monitoring**

**Core Web Vitals**
```typescript
// Performance measurement
const measurePerformance = () => {
  // Largest Contentful Paint
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    analytics.track('LCP', { value: lastEntry.startTime });
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      analytics.track('FID', { value: entry.processingStart - entry.startTime });
    }
  }).observe({ entryTypes: ['first-input'] });
};
```

**Error Tracking**
```typescript
// Sentry integration
import * as Sentry from '@sentry/react';

// Error boundary
const ErrorBoundary = Sentry.withErrorBoundary(App, {
  fallback: ({ error, resetError }) => (
    <ErrorFallback error={error} onReset={resetError} />
  )
});

// Manual error reporting
const handleEngineError = (error: Error, context: ErrorContext) => {
  Sentry.captureException(error, {
    tags: {
      engine: context.engine,
      operation: context.operation
    },
    extra: context.metadata
  });
};
```

---

## 🚀 **DEPLOYMENT & RELEASE**

### **Release Process**

**Version Management**
```bash
# Create release branch
git checkout -b release/v1.2.0

# Update version and changelog
npm version minor
npm run build
npm run test

# Merge to main
git checkout main
git merge release/v1.2.0

# Tag release
git tag v1.2.0
git push origin main --tags
```

**Deployment Pipeline**
The CI/CD automatically handles:
1. **Quality Gates**: All tests must pass
2. **Security Scan**: No critical vulnerabilities
3. **Performance Check**: Lighthouse CI validation
4. **Staging Deploy**: Auto-deploy to staging environment
5. **Production Deploy**: Manual approval for production
6. **Release Notes**: Auto-generated from commits

### **Hotfix Process**
```bash
# Create hotfix from main
git checkout -b hotfix/critical-bug-fix main

# Fix and test
# ... implementation ...

# Deploy directly to production
git checkout main
git merge hotfix/critical-bug-fix
git push origin main
```

---

## 📚 **RESOURCES & REFERENCES**

### **Essential Documentation**
- **Project Memory**: `CLAUDE.md` - Canonical project information
- **Architecture**: `CTO_COORDINATION_FRAMEWORK.md` - Agent coordination
- **Expansion Plan**: `CREATIVE_PLATFORM_EXPANSION.md` - Platform evolution
- **API Documentation**: `/docs/api/` - Service interfaces
- **Component Library**: `/docs/components/` - UI component docs

### **External Resources**
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Fabric.js**: http://fabricjs.com/docs/
- **Remotion**: https://www.remotion.dev/docs/
- **Supabase**: https://supabase.com/docs/
- **Stripe**: https://stripe.com/docs/

### **Communication Channels**
- **GitHub Issues**: Feature requests and bug reports
- **GitHub Discussions**: Technical discussions and Q&A
- **PR Reviews**: Code review and feedback
- **Agent Coordination**: Task status updates in agent files

---

## 🎯 **SUCCESS METRICS**

### **Agent-Specific KPIs**
Each agent has specific success metrics defined in their domain. Monitor:
- **Performance**: Response times and throughput
- **Quality**: Bug rates and user satisfaction
- **Coverage**: Test coverage and documentation
- **Integration**: Cross-agent compatibility

### **Platform-Wide Metrics**
- **User Experience**: Core Web Vitals, accessibility scores
- **System Health**: Uptime, error rates, performance
- **Development Velocity**: Feature delivery, bug resolution
- **Code Quality**: Technical debt, test coverage

---

*This guide is a living document. Update it as the platform evolves and new patterns emerge. All agents should contribute to improving our development practices.*

**🤖 Generated with [Claude Code](https://claude.ai/code)**

**📅 Last Updated**: September 16, 2025