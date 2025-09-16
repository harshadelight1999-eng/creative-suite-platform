# Agent 1: PDF Engineer Tasks

## CURRENT ASSIGNMENT
Focus: Replace jsPDF with pdfme professional library

## TODAY'S TASKS
1. ✅ Install @pdfme libraries (DONE)
2. ⬜ Create PdfmeService.ts service class
3. ⬜ Build template converter function
4. ⬜ Implement multi-page support
5. ⬜ Add export progress indicator

## CODE TO IMPLEMENT

### Task 1: Create PdfmeService.ts
```typescript
// src/services/PdfmeService.ts
import { Template, generate, Designer } from '@pdfme/ui';
import { BLANK_PDF } from '@pdfme/common';

export class PdfmeService {
  private template: Template;
  
  constructor() {
    this.template = this.getDefaultTemplate();
  }
  
  getDefaultTemplate(): Template {
    return {
      basePdf: BLANK_PDF,
      schemas: [
        {
          title: {
            type: 'text',
            position: { x: 20, y: 20 },
            width: 170,
            height: 15,
            fontSize: 18,
          }
        }
      ]
    };
  }
  
  async generatePDF(data: any): Promise<Blob> {
    const pdf = await generate({
      template: this.template,
      inputs: [data]
    });
    return new Blob([pdf.buffer], { type: 'application/pdf' });
  }
}
```

### Task 2: Replace ExportModal content
- Location: src/components/ExportModal/ExportModal.tsx
- Replace jsPDF code with PdfmeService
- Add progress bar during generation

### Task 3: Create template library
- Location: src/templates/
- Invoice template
- Certificate template  
- Report template

## DO NOT WORK ON
- Authentication
- Payments
- Database
- AI integration
- Video editing
- Deployment

## SUCCESS CRITERIA
- PDF generation working with pdfme
- Multi-page support enabled
- 3+ templates available
- Export progress shown
- No jsPDF dependencies remain