# Agent 7: Testing & DevOps Engineer Tasks

## CURRENT ASSIGNMENT
**Focus:** Complete testing infrastructure and CI/CD deployment pipeline for production readiness

## MANDATORY TECHNOLOGIES
- Vitest for unit and integration testing
- Cypress for end-to-end testing
- GitHub Actions for CI/CD pipeline
- ESLint and Prettier for code quality
- Docker for containerization

## TODAY'S TASKS (DAY 2 PRIORITY)
1. [ ] Configure Vitest testing framework with comprehensive coverage
2. [ ] Set up Cypress for end-to-end testing
3. [ ] Implement GitHub Actions CI/CD pipeline
4. [ ] Configure code quality tools and pre-commit hooks
5. [ ] Set up monitoring and error tracking systems

## CODE TO IMPLEMENT

### Task 1: Install Testing Dependencies
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
npm install -D cypress @cypress/react @cypress/vite-dev-server
npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D husky lint-staged
npm install -D @playwright/test # Alternative to Cypress for e2e
```

### Task 2: Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
        '**/types.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    testTimeout: 10000,
    hookTimeout: 10000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
```

### Task 3: Test Setup Configuration
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.mock('../../env', () => ({
  VITE_SUPABASE_URL: 'http://localhost:54321',
  VITE_SUPABASE_ANON_KEY: 'test-key',
  VITE_STRIPE_PUBLIC_KEY: 'pk_test_123',
  VITE_GEMINI_API_KEY: 'test-gemini-key'
}));

// Mock external services
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
      getSession: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }))
}));

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    redirectToCheckout: vi.fn(),
    confirmCardPayment: vi.fn()
  }))
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      generateContent: vi.fn(() => Promise.resolve({
        response: { text: () => 'Mock AI response' }
      }))
    }))
  }))
}));

// Global test helpers
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}));

global.matchMedia = vi.fn(() => ({
  matches: false,
  addListener: vi.fn(),
  removeListener: vi.fn()
}));
```

### Task 4: Component Testing Examples
```typescript
// src/test/components/PdfGenerator.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PdfGenerator } from '../../components/PdfGenerator/PdfGenerator';

const mockDocument = {
  id: 'test-doc',
  title: 'Test Document',
  pages: [{
    elements: [{
      id: 'element-1',
      type: 'text',
      x: 10,
      y: 10,
      width: 100,
      height: 20,
      content: 'Test text'
    }]
  }]
};

describe('PdfGenerator', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders PDF generator when open', () => {
    render(
      <PdfGenerator
        document={mockDocument}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    expect(screen.getByText('Professional PDF Generator')).toBeInTheDocument();
    expect(screen.getByText('Generate PDF')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <PdfGenerator
        document={mockDocument}
        onClose={mockOnClose}
        isOpen={false}
      />
    );

    expect(screen.queryByText('Professional PDF Generator')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <PdfGenerator
        document={mockDocument}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows generating state when PDF generation is in progress', async () => {
    render(
      <PdfGenerator
        document={mockDocument}
        onClose={mockOnClose}
        isOpen={true}
      />
    );

    fireEvent.click(screen.getByText('Generate PDF'));
    
    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });
  });
});
```

### Task 5: Service Testing
```typescript
// src/test/services/PdfmeService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PdfmeService } from '../../services/PdfmeService';

vi.mock('@pdfme/generator', () => ({
  generate: vi.fn(() => Promise.resolve({ buffer: new ArrayBuffer(8) }))
}));

describe('PdfmeService', () => {
  let service: PdfmeService;

  beforeEach(() => {
    service = new PdfmeService();
  });

  it('creates default template', () => {
    const template = service.getDefaultTemplate();
    
    expect(template).toHaveProperty('basePdf');
    expect(template).toHaveProperty('schemas');
    expect(template.schemas).toHaveLength(1);
  });

  it('generates PDF from data', async () => {
    const testData = { title: 'Test Document' };
    const blob = await service.generatePDF(testData);
    
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
  });

  it('handles generation errors gracefully', async () => {
    const { generate } = await import('@pdfme/generator');
    vi.mocked(generate).mockRejectedValueOnce(new Error('Generation failed'));

    const testData = { title: 'Test Document' };
    
    await expect(service.generatePDF(testData)).rejects.toThrow('Generation failed');
  });
});
```

### Task 6: Integration Testing
```typescript
// src/test/integration/auth-flow.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { App } from '../../App';

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows user to sign up and login', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    // Navigate to signup
    fireEvent.click(screen.getByText('Sign Up'));
    
    // Fill signup form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    
    // Verify success
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });

  it('shows error for invalid credentials', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    );

    // Try to login with invalid credentials
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

### Task 7: E2E Testing with Cypress
```typescript
// cypress/e2e/document-creation.cy.ts
describe('Document Creation Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    
    // Mock user authentication
    cy.window().then((win) => {
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'user-1', email: 'test@example.com' }
      }));
    });
  });

  it('creates a new document from scratch', () => {
    // Navigate to document creation
    cy.get('[data-testid="create-document"]').click();
    
    // Select document type
    cy.get('[data-testid="document-type-invoice"]').click();
    
    // Add elements to canvas
    cy.get('[data-testid="add-text-element"]').click();
    cy.get('[data-testid="canvas"]').click(100, 100);
    
    // Edit text content
    cy.get('[data-testid="text-element"]').dblclick();
    cy.get('[data-testid="text-input"]').type('Invoice Title');
    cy.get('[data-testid="canvas"]').click(200, 200); // Click outside to finish editing
    
    // Generate PDF
    cy.get('[data-testid="generate-pdf"]').click();
    cy.get('[data-testid="pdf-progress"]').should('be.visible');
    
    // Verify PDF generation completes
    cy.get('[data-testid="pdf-download-link"]', { timeout: 10000 }).should('be.visible');
  });

  it('uses AI to generate document content', () => {
    cy.get('[data-testid="create-document"]').click();
    cy.get('[data-testid="ai-generate"]').click();
    
    // Fill AI generation form
    cy.get('[data-testid="ai-context"]').type('Create a professional invoice for web development services');
    cy.get('[data-testid="ai-tone"]').select('professional');
    cy.get('[data-testid="ai-generate-button"]').click();
    
    // Wait for AI generation
    cy.get('[data-testid="ai-generating"]').should('be.visible');
    cy.get('[data-testid="ai-content"]', { timeout: 15000 }).should('be.visible');
    
    // Use generated content
    cy.get('[data-testid="use-ai-content"]').click();
    cy.get('[data-testid="canvas"]').should('contain', 'Invoice');
  });

  it('handles subscription limits', () => {
    // Set free tier user
    cy.window().then((win) => {
      win.localStorage.setItem('user-subscription', JSON.stringify({
        tier: 'free',
        documentsUsed: 5,
        documentsLimit: 5
      }));
    });

    cy.get('[data-testid="create-document"]').click();
    
    // Should show upgrade prompt
    cy.get('[data-testid="upgrade-prompt"]').should('be.visible');
    cy.get('[data-testid="upgrade-button"]').click();
    
    // Should navigate to billing page
    cy.url().should('include', '/billing');
  });
});
```

### Task 8: GitHub Actions CI/CD Pipeline
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run ESLint
      run: npm run lint

    - name: Run TypeScript check
      run: npm run type-check

    - name: Run unit tests
      run: npm run test:unit
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

    - name: Run integration tests
      run: npm run test:integration

    - name: Generate coverage report
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build application
      run: npm run build

    - name: Run Cypress tests
      uses: cypress-io/github-action@v6
      with:
        start: npm run preview
        wait-on: 'http://localhost:4173'
        wait-on-timeout: 120
        browser: chrome
        record: true
      env:
        CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  build-and-deploy:
    runs-on: ubuntu-latest
    needs: [test, e2e-tests]
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build for production
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        VITE_STRIPE_PUBLIC_KEY: ${{ secrets.VITE_STRIPE_PUBLIC_KEY }}
        VITE_GEMINI_API_KEY: ${{ secrets.VITE_GEMINI_API_KEY }}

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-args: '--prod'
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  lighthouse-audit:
    runs-on: ubuntu-latest
    needs: build-and-deploy
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Lighthouse CI
      uses: treosh/lighthouse-ci-action@v10
      with:
        uploadArtifacts: true
        temporaryPublicStorage: true
        configPath: './.lighthouserc.json'
```

### Task 9: Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:unit": "vitest run --coverage",
    "test:integration": "vitest run src/test/integration",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:coverage": "vitest run --coverage --reporter=lcov",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "prepare": "husky install"
  }
}
```

### Task 10: Quality Assurance Configuration
```json
// .eslintrc.json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:accessibility/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "rules": {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "error"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

## INTEGRATION REQUIREMENTS

### With All Agents
- Test all components and services from every agent
- Validate integration points between agents
- Monitor performance across all features
- Ensure security standards for all implementations

### Cross-Agent Testing Priorities
- **PDF Engine (Agent 1):** PDF generation performance and accuracy
- **Authentication (Agent 2):** Security testing and session management
- **Payments (Agent 3):** Transaction integrity and PCI compliance
- **Database (Agent 4):** Query performance and data integrity
- **UI/UX (Agent 5):** User interaction and accessibility
- **AI Integration (Agent 6):** AI response accuracy and performance

## STRICT BOUNDARIES - DO NOT WORK ON
- Feature implementation (handled by other agents)
- Business logic development
- UI component creation
- API integration development
- Database schema design

## TESTING COVERAGE REQUIREMENTS
- [ ] 90%+ unit test coverage
- [ ] 100% critical path integration testing
- [ ] Complete e2e testing for user workflows
- [ ] Performance testing for all major features
- [ ] Security testing for authentication and payments
- [ ] Accessibility testing (WCAG 2.1 AA compliance)

## CI/CD PIPELINE REQUIREMENTS
- [ ] Automated testing on all pull requests
- [ ] Code quality gates (ESLint, TypeScript, Prettier)
- [ ] Security scanning for vulnerabilities
- [ ] Performance auditing with Lighthouse
- [ ] Automated deployment to staging and production
- [ ] Rollback capabilities for failed deployments

## MONITORING AND OBSERVABILITY
- [ ] Error tracking and alerting
- [ ] Performance monitoring and metrics
- [ ] User behavior analytics
- [ ] System health monitoring
- [ ] Log aggregation and analysis

## SUCCESS CRITERIA
- [ ] Zero-downtime deployments
- [ ] Sub-2-minute build times
- [ ] 99.9% test reliability
- [ ] Comprehensive error handling
- [ ] Real-time monitoring and alerting
- [ ] Automated security scanning
- [ ] Performance regression detection

## DELIVERABLE FILES
- `/vitest.config.ts`
- `/cypress.config.ts`
- `/src/test/setup.ts`
- `/src/test/components/` (comprehensive component tests)
- `/src/test/services/` (service integration tests)
- `/src/test/e2e/` (end-to-end test suites)
- `/.github/workflows/ci-cd.yml`
- `/.eslintrc.json`
- `/.prettierrc`
- `/package.json` (updated scripts)

Remember: Focus ONLY on testing, quality assurance, and deployment infrastructure. All feature development is handled by other specialized agents.