import { Template } from '@pdfme/common';

export interface BusinessLetterData {
  companyLogo?: string;
  companyName: string;
  companyAddress: string;
  date: string;
  recipientName: string;
  recipientAddress: string;
  subject: string;
  salutation: string;
  bodyContent: string;
  closing: string;
  signature: string;
}

export interface InvoiceData {
  invoiceTitle: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  fromCompany: string;
  fromAddress: string;
  billToLabel: string;
  billToCompany: string;
  billToAddress: string;
  itemHeader: string;
  qtyHeader: string;
  rateHeader: string;
  totalHeader: string;
  item1: string;
  qty1: string;
  rate1: string;
  total1: string;
  subtotalLabel: string;
  subtotalAmount: string;
  taxLabel: string;
  taxAmount: string;
  grandTotalLabel: string;
  grandTotalAmount: string;
  paymentTerms: string;
}

export interface ReportData {
  reportTitle: string;
  reportSubtitle: string;
  reportDate: string;
  summaryTitle: string;
  summaryContent: string;
  metricsTitle: string;
  metric1Label: string;
  metric1Value: string;
  metric2Label: string;
  metric2Value: string;
  metric3Label: string;
  metric3Value: string;
  analysisTitle: string;
  analysisContent: string;
  recommendationsTitle: string;
  recommendationsContent: string;
}

export type TemplateType = 'business-letter' | 'invoice' | 'report' | 'custom';

export interface TemplateOption {
  id: TemplateType;
  name: string;
  description: string;
  thumbnail?: string;
  category: 'business' | 'financial' | 'report' | 'custom';
  template: Template;
  sampleData: BusinessLetterData | InvoiceData | ReportData | Record<string, any>;
}

export const TEMPLATE_CATEGORIES = {
  business: 'Business Documents',
  financial: 'Financial Documents', 
  report: 'Reports & Analytics',
  custom: 'Custom Templates'
} as const;

// Sample data for templates
export const SAMPLE_BUSINESS_LETTER: BusinessLetterData = {
  companyName: 'ABC Corporation',
  companyAddress: '123 Business St\\nSuite 100\\nCity, State 12345\\nPhone: (555) 123-4567',
  date: new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }),
  recipientName: 'John Smith',
  recipientAddress: 'XYZ Company\\n456 Client Ave\\nCity, State 67890',
  subject: 'Re: Business Proposal Discussion',
  salutation: 'Dear Mr. Smith,',
  bodyContent: 'Thank you for taking the time to meet with us last week to discuss our business proposal. We were impressed by your company\\'s commitment to innovation and quality.\\n\\nAs discussed, we would like to move forward with the partnership opportunity. Our team has prepared a comprehensive proposal that outlines the mutual benefits and timeline for implementation.\\n\\nWe believe this collaboration will create significant value for both organizations and look forward to your feedback.',
  closing: 'Sincerely,',
  signature: 'Jane Doe\\nBusiness Development Manager'
};

export const SAMPLE_INVOICE: InvoiceData = {
  invoiceTitle: 'INVOICE',
  invoiceNumber: 'INV-2024-001',
  invoiceDate: `Date: ${new Date().toLocaleDateString()}`,
  dueDate: `Due: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
  fromCompany: 'Your Company Name',
  fromAddress: '123 Business Street\\nSuite 100\\nCity, State 12345\\nPhone: (555) 123-4567\\nEmail: billing@company.com',
  billToLabel: 'Bill To:',
  billToCompany: 'Client Company Inc.',
  billToAddress: '456 Client Avenue\\nSuite 200\\nClient City, State 67890',
  itemHeader: 'Description',
  qtyHeader: 'Qty',
  rateHeader: 'Rate',
  totalHeader: 'Amount',
  item1: 'Professional Services - Consultation',
  qty1: '10',
  rate1: '$150.00',
  total1: '$1,500.00',
  subtotalLabel: 'Subtotal:',
  subtotalAmount: '$1,500.00',
  taxLabel: 'Tax (8.5%):',
  taxAmount: '$127.50',
  grandTotalLabel: 'Total:',
  grandTotalAmount: '$1,627.50',
  paymentTerms: 'Payment Terms: Net 30 days. Late payments may be subject to a 1.5% monthly service charge.\\nPayment Methods: Check, Wire Transfer, or ACH. Please include invoice number with payment.'
};

export const SAMPLE_REPORT: ReportData = {
  reportTitle: 'Quarterly Business Report',
  reportSubtitle: 'Performance Analysis and Strategic Insights',
  reportDate: `Report Date: ${new Date().toLocaleDateString()}`,
  summaryTitle: 'Executive Summary',
  summaryContent: 'This quarter showed strong performance across all key metrics with revenue growth of 15% compared to the previous quarter. Customer satisfaction remains high at 94%, and operational efficiency has improved by 12% through process optimization initiatives.\\n\\nKey achievements include successful product launch, expansion into two new markets, and completion of digital transformation phase one.',
  metricsTitle: 'Key Performance Metrics',
  metric1Label: 'Revenue Growth:',
  metric1Value: '15% QoQ',
  metric2Label: 'Customer Satisfaction:',
  metric2Value: '94%',
  metric3Label: 'Operational Efficiency:',
  metric3Value: '+12%',
  analysisTitle: 'Detailed Analysis',
  analysisContent: 'Revenue growth was driven primarily by increased demand in our core product lines and successful penetration of new market segments. The customer satisfaction score of 94% represents a 3-point increase from last quarter, attributed to improved customer service response times and product quality enhancements.\\n\\nOperational efficiency gains were achieved through automation of key processes and staff training programs.',
  recommendationsTitle: 'Strategic Recommendations',
  recommendationsContent: '1. Continue investment in customer service infrastructure to maintain satisfaction levels\\n2. Expand marketing efforts in high-performing new markets\\n3. Accelerate digital transformation initiatives for additional efficiency gains\\n4. Consider strategic partnerships to enhance product offerings'
};

export const PDF_TEMPLATES: TemplateOption[] = [
  {
    id: 'business-letter',
    name: 'Business Letter',
    description: 'Professional business correspondence template',
    category: 'business',
    template: {} as Template, // Will be populated by PdfmeService
    sampleData: SAMPLE_BUSINESS_LETTER
  },
  {
    id: 'invoice',
    name: 'Invoice',
    description: 'Professional invoice template with itemized billing',
    category: 'financial',
    template: {} as Template, // Will be populated by PdfmeService
    sampleData: SAMPLE_INVOICE
  },
  {
    id: 'report',
    name: 'Business Report',
    description: 'Comprehensive business report with metrics and analysis',
    category: 'report',
    template: {} as Template, // Will be populated by PdfmeService
    sampleData: SAMPLE_REPORT
  }
];