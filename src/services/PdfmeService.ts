import { Template, BLANK_PDF, SchemaForUI } from '@pdfme/common';
import { generate } from '@pdfme/generator';
import { text, image, barcodes } from '@pdfme/schemas';

export interface PdfGenerationProgress {
  stage: 'initializing' | 'processing' | 'rendering' | 'finalizing';
  progress: number;
  message: string;
}

export interface PdfExportOptions {
  filename?: string;
  format?: 'pdf';
  quality?: 'high' | 'medium' | 'low';
  onProgress?: (progress: PdfGenerationProgress) => void;
}

export interface DocumentData {
  id: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  pages?: any[];
  elements?: any[];
}

export class PdfmeService {
  private plugins = { text, image, ...barcodes };
  
  /**
   * Generate PDF from template and data with progress tracking
   */
  async generatePdf(
    template: Template,
    inputs: Record<string, any>[],
    options: PdfExportOptions = {}
  ): Promise<Uint8Array> {
    const { onProgress } = options;
    
    try {
      // Stage 1: Initializing
      onProgress?.({
        stage: 'initializing',
        progress: 10,
        message: 'Preparing template and data...'
      });

      // Validate template and inputs
      this.validateTemplate(template);
      this.validateInputs(inputs, template);

      // Stage 2: Processing
      onProgress?.({
        stage: 'processing',
        progress: 30,
        message: 'Processing document data...'
      });

      // Simulate processing time for progress feedback
      await this.delay(100);

      // Stage 3: Rendering
      onProgress?.({
        stage: 'rendering',
        progress: 70,
        message: 'Rendering PDF pages...'
      });

      // Generate the PDF
      const pdf = await generate({
        template,
        inputs,
        plugins: this.plugins,
        options: {
          author: 'Document Platform',
          title: options.filename || 'Generated Document',
          subject: 'Professional Document',
          creator: 'PDF King Platform',
        }
      });

      // Stage 4: Finalizing
      onProgress?.({
        stage: 'finalizing',
        progress: 100,
        message: 'PDF generation complete!'
      });

      return pdf;
    } catch (error) {
      throw this.handlePdfError(error);
    }
  }

  /**
   * Download generated PDF
   */
  async downloadPdf(
    pdfData: Uint8Array,
    filename: string = 'document.pdf'
  ): Promise<void> {
    try {
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
      
      // Temporarily add to DOM and trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Preview PDF in new tab
   */
  async previewPdf(pdfData: Uint8Array): Promise<void> {
    try {
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        throw new Error('Popup blocked. Please allow popups for PDF preview.');
      }
      
      // Clean up URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      throw new Error(`Failed to preview PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert document data to pdfme template format
   */
  convertDocumentToTemplate(document: DocumentData): Template {
    try {
      const schemas: SchemaForUI[] = [];
      
      // Handle multiple pages
      if (document.pages && document.pages.length > 0) {
        document.pages.forEach((page, pageIndex) => {
          const pageSchema: Record<string, any> = {};
          
          if (page.elements && page.elements.length > 0) {
            page.elements.forEach((element: any) => {
              const fieldId = `${element.id}_page${pageIndex}`;
              pageSchema[fieldId] = this.convertElementToField(element);
            });
          }
          
          schemas.push(pageSchema);
        });
      } else {
        // Single page fallback
        const pageSchema: Record<string, any> = {
          title: {
            type: 'text',
            position: { x: 20, y: 20 },
            width: 170,
            height: 15,
            fontSize: 18,
            fontColor: '#000000',
            fontName: 'Helvetica',
          }
        };
        
        if (document.elements) {
          document.elements.forEach((element: any) => {
            pageSchema[element.id] = this.convertElementToField(element);
          });
        }
        
        schemas.push(pageSchema);
      }

      return {
        basePdf: BLANK_PDF,
        schemas
      };
    } catch (error) {
      throw new Error(`Failed to convert document to template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get predefined professional templates
   */
  getBusinessLetterTemplate(): Template {
    return {
      basePdf: BLANK_PDF,
      schemas: [{
        // Header
        companyLogo: {
          type: 'image',
          position: { x: 20, y: 20 },
          width: 40,
          height: 20,
        },
        companyName: {
          type: 'text',
          position: { x: 70, y: 25 },
          width: 120,
          height: 10,
          fontSize: 16,
          fontColor: '#2563eb',
          fontName: 'Helvetica-Bold',
        },
        companyAddress: {
          type: 'text',
          position: { x: 70, y: 35 },
          width: 120,
          height: 15,
          fontSize: 10,
          fontColor: '#6b7280',
        },
        
        // Date
        date: {
          type: 'text',
          position: { x: 150, y: 60 },
          width: 40,
          height: 8,
          fontSize: 10,
        },
        
        // Recipient
        recipientName: {
          type: 'text',
          position: { x: 20, y: 80 },
          width: 80,
          height: 8,
          fontSize: 12,
          fontName: 'Helvetica-Bold',
        },
        recipientAddress: {
          type: 'text',
          position: { x: 20, y: 90 },
          width: 80,
          height: 20,
          fontSize: 10,
        },
        
        // Subject
        subject: {
          type: 'text',
          position: { x: 20, y: 120 },
          width: 170,
          height: 8,
          fontSize: 12,
          fontName: 'Helvetica-Bold',
        },
        
        // Body
        salutation: {
          type: 'text',
          position: { x: 20, y: 135 },
          width: 170,
          height: 8,
          fontSize: 11,
        },
        bodyContent: {
          type: 'text',
          position: { x: 20, y: 150 },
          width: 170,
          height: 80,
          fontSize: 11,
          lineHeight: 1.5,
        },
        
        // Closing
        closing: {
          type: 'text',
          position: { x: 20, y: 240 },
          width: 170,
          height: 8,
          fontSize: 11,
        },
        signature: {
          type: 'text',
          position: { x: 20, y: 260 },
          width: 80,
          height: 8,
          fontSize: 11,
          fontName: 'Helvetica-Bold',
        }
      }]
    };
  }

  getInvoiceTemplate(): Template {
    return {
      basePdf: BLANK_PDF,
      schemas: [{
        // Header
        invoiceTitle: {
          type: 'text',
          position: { x: 20, y: 20 },
          width: 60,
          height: 15,
          fontSize: 24,
          fontColor: '#1f2937',
          fontName: 'Helvetica-Bold',
        },
        invoiceNumber: {
          type: 'text',
          position: { x: 130, y: 25 },
          width: 60,
          height: 8,
          fontSize: 12,
          fontName: 'Helvetica-Bold',
        },
        invoiceDate: {
          type: 'text',
          position: { x: 130, y: 35 },
          width: 60,
          height: 8,
          fontSize: 10,
        },
        dueDate: {
          type: 'text',
          position: { x: 130, y: 45 },
          width: 60,
          height: 8,
          fontSize: 10,
        },
        
        // Company Info
        fromCompany: {
          type: 'text',
          position: { x: 20, y: 60 },
          width: 80,
          height: 20,
          fontSize: 11,
          fontName: 'Helvetica-Bold',
        },
        fromAddress: {
          type: 'text',
          position: { x: 20, y: 80 },
          width: 80,
          height: 25,
          fontSize: 9,
        },
        
        // Client Info
        billToLabel: {
          type: 'text',
          position: { x: 110, y: 60 },
          width: 30,
          height: 8,
          fontSize: 10,
          fontName: 'Helvetica-Bold',
        },
        billToCompany: {
          type: 'text',
          position: { x: 110, y: 70 },
          width: 80,
          height: 8,
          fontSize: 11,
          fontName: 'Helvetica-Bold',
        },
        billToAddress: {
          type: 'text',
          position: { x: 110, y: 80 },
          width: 80,
          height: 25,
          fontSize: 9,
        },
        
        // Table Headers
        itemHeader: {
          type: 'text',
          position: { x: 20, y: 120 },
          width: 60,
          height: 8,
          fontSize: 10,
          fontName: 'Helvetica-Bold',
        },
        qtyHeader: {
          type: 'text',
          position: { x: 85, y: 120 },
          width: 20,
          height: 8,
          fontSize: 10,
          fontName: 'Helvetica-Bold',
        },
        rateHeader: {
          type: 'text',
          position: { x: 110, y: 120 },
          width: 30,
          height: 8,
          fontSize: 10,
          fontName: 'Helvetica-Bold',
        },
        totalHeader: {
          type: 'text',
          position: { x: 145, y: 120 },
          width: 45,
          height: 8,
          fontSize: 10,
          fontName: 'Helvetica-Bold',
        },
        
        // Line Items (example for first few rows)
        item1: {
          type: 'text',
          position: { x: 20, y: 135 },
          width: 60,
          height: 8,
          fontSize: 9,
        },
        qty1: {
          type: 'text',
          position: { x: 85, y: 135 },
          width: 20,
          height: 8,
          fontSize: 9,
        },
        rate1: {
          type: 'text',
          position: { x: 110, y: 135 },
          width: 30,
          height: 8,
          fontSize: 9,
        },
        total1: {
          type: 'text',
          position: { x: 145, y: 135 },
          width: 45,
          height: 8,
          fontSize: 9,
        },
        
        // Totals
        subtotalLabel: {
          type: 'text',
          position: { x: 120, y: 200 },
          width: 25,
          height: 8,
          fontSize: 10,
        },
        subtotalAmount: {
          type: 'text',
          position: { x: 145, y: 200 },
          width: 45,
          height: 8,
          fontSize: 10,
        },
        taxLabel: {
          type: 'text',
          position: { x: 120, y: 210 },
          width: 25,
          height: 8,
          fontSize: 10,
        },
        taxAmount: {
          type: 'text',
          position: { x: 145, y: 210 },
          width: 45,
          height: 8,
          fontSize: 10,
        },
        grandTotalLabel: {
          type: 'text',
          position: { x: 120, y: 225 },
          width: 25,
          height: 8,
          fontSize: 12,
          fontName: 'Helvetica-Bold',
        },
        grandTotalAmount: {
          type: 'text',
          position: { x: 145, y: 225 },
          width: 45,
          height: 8,
          fontSize: 12,
          fontName: 'Helvetica-Bold',
        },
        
        // Payment Terms
        paymentTerms: {
          type: 'text',
          position: { x: 20, y: 250 },
          width: 170,
          height: 20,
          fontSize: 9,
        }
      }]
    };
  }

  getReportTemplate(): Template {
    return {
      basePdf: BLANK_PDF,
      schemas: [{
        // Header
        reportTitle: {
          type: 'text',
          position: { x: 20, y: 20 },
          width: 170,
          height: 15,
          fontSize: 20,
          fontColor: '#1f2937',
          fontName: 'Helvetica-Bold',
          alignment: 'center',
        },
        reportSubtitle: {
          type: 'text',
          position: { x: 20, y: 35 },
          width: 170,
          height: 10,
          fontSize: 12,
          fontColor: '#6b7280',
          alignment: 'center',
        },
        reportDate: {
          type: 'text',
          position: { x: 150, y: 50 },
          width: 40,
          height: 8,
          fontSize: 10,
        },
        
        // Executive Summary
        summaryTitle: {
          type: 'text',
          position: { x: 20, y: 70 },
          width: 170,
          height: 10,
          fontSize: 14,
          fontName: 'Helvetica-Bold',
        },
        summaryContent: {
          type: 'text',
          position: { x: 20, y: 85 },
          width: 170,
          height: 30,
          fontSize: 10,
          lineHeight: 1.4,
        },
        
        // Key Metrics Section
        metricsTitle: {
          type: 'text',
          position: { x: 20, y: 125 },
          width: 170,
          height: 10,
          fontSize: 14,
          fontName: 'Helvetica-Bold',
        },
        metric1Label: {
          type: 'text',
          position: { x: 25, y: 140 },
          width: 60,
          height: 8,
          fontSize: 10,
          fontName: 'Helvetica-Bold',
        },
        metric1Value: {
          type: 'text',
          position: { x: 90, y: 140 },
          width: 40,
          height: 8,
          fontSize: 10,
        },
        metric2Label: {
          type: 'text',
          position: { x: 25, y: 150 },
          width: 60,
          height: 8,
          fontSize: 10,
          fontName: 'Helvetica-Bold',
        },
        metric2Value: {
          type: 'text',
          position: { x: 90, y: 150 },
          width: 40,
          height: 8,
          fontSize: 10,
        },
        metric3Label: {
          type: 'text',
          position: { x: 25, y: 160 },
          width: 60,
          height: 8,
          fontSize: 10,
          fontName: 'Helvetica-Bold',
        },
        metric3Value: {
          type: 'text',
          position: { x: 90, y: 160 },
          width: 40,
          height: 8,
          fontSize: 10,
        },
        
        // Analysis Section
        analysisTitle: {
          type: 'text',
          position: { x: 20, y: 180 },
          width: 170,
          height: 10,
          fontSize: 14,
          fontName: 'Helvetica-Bold',
        },
        analysisContent: {
          type: 'text',
          position: { x: 20, y: 195 },
          width: 170,
          height: 40,
          fontSize: 10,
          lineHeight: 1.4,
        },
        
        // Recommendations
        recommendationsTitle: {
          type: 'text',
          position: { x: 20, y: 245 },
          width: 170,
          height: 10,
          fontSize: 14,
          fontName: 'Helvetica-Bold',
        },
        recommendationsContent: {
          type: 'text',
          position: { x: 20, y: 260 },
          width: 170,
          height: 25,
          fontSize: 10,
          lineHeight: 1.4,
        }
      }]
    };
  }

  /**
   * Private helper methods
   */
  private convertElementToField(element: any): any {
    const baseField = {
      type: element.type === 'image' ? 'image' : 'text',
      position: {
        x: (element.x || 0) * 0.75, // Convert pixels to points
        y: (element.y || 0) * 0.75,
      },
      width: (element.width || 100) * 0.75,
      height: (element.height || 20) * 0.75,
    };

    if (element.type === 'text') {
      return {
        ...baseField,
        fontSize: element.fontSize || 12,
        fontColor: element.color || '#000000',
        fontName: element.fontWeight === 'bold' ? 'Helvetica-Bold' : 'Helvetica',
        alignment: element.textAlign || 'left',
        lineHeight: element.lineHeight || 1.2,
      };
    }

    return baseField;
  }

  private validateTemplate(template: Template): void {
    if (!template) {
      throw new Error('Template is required');
    }
    if (!template.schemas || template.schemas.length === 0) {
      throw new Error('Template must have at least one schema');
    }
  }

  private validateInputs(inputs: Record<string, any>[], template: Template): void {
    if (!inputs || inputs.length === 0) {
      throw new Error('Input data is required');
    }
    
    // Check if inputs match template structure
    const firstSchema = template.schemas[0];
    const requiredFields = Object.keys(firstSchema || {});
    
    if (requiredFields.length > 0) {
      const firstInput = inputs[0];
      const missingFields = requiredFields.filter(field => !(field in firstInput));
      
      if (missingFields.length > 0) {
        console.warn(`Missing input fields: ${missingFields.join(', ')}`);
      }
    }
  }

  private handlePdfError(error: any): Error {
    if (error instanceof Error) {
      return new Error(`PDF Generation Error: ${error.message}`);
    }
    return new Error(`PDF Generation Error: ${String(error)}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const pdfmeService = new PdfmeService();