import Anthropic from '@anthropic-ai/sdk';

/**
 * ClaudeService - Powers our AI document generation
 * Uses Claude API for intelligent content creation
 */
export class ClaudeService {
  private anthropic: Anthropic;
  
  constructor(apiKey: string) {
    this.anthropic = new Anthropic({
      apiKey: apiKey,
      // Use in browser with CORS proxy if needed
      dangerouslyAllowBrowser: true
    });
  }

  /**
   * Generate a professional document from a prompt
   */
  async generateDocument(prompt: string, documentType: 'pdf' | 'certificate' | 'invoice' | 'report') {
    try {
      const systemPrompt = this.getSystemPrompt(documentType);
      
      const response = await this.anthropic.messages.create({
        model: 'claude-3-opus-20240229', // Using the best model
        max_tokens: 4000,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      // Extract the content
      const content = response.content[0].type === 'text' 
        ? response.content[0].text 
        : '';

      // Parse JSON response for structured document
      return this.parseDocumentResponse(content, documentType);
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error('Failed to generate document');
    }
  }

  /**
   * Generate certificate with Claude
   */
  async generateCertificate(recipientName: string, courseName: string, completionDate: Date) {
    const prompt = `
      Create a professional certificate for:
      - Recipient: ${recipientName}
      - Course: ${courseName}
      - Date: ${completionDate.toLocaleDateString()}
      
      Return as JSON with title, subtitle, body text, and signature areas.
    `;

    return this.generateDocument(prompt, 'certificate');
  }

  /**
   * Generate invoice with Claude
   */
  async generateInvoice(clientName: string, items: any[], dueDate: Date) {
    const prompt = `
      Create a professional invoice for:
      - Client: ${clientName}
      - Items: ${JSON.stringify(items)}
      - Due Date: ${dueDate.toLocaleDateString()}
      
      Include invoice number, itemized list, totals, and payment terms.
    `;

    return this.generateDocument(prompt, 'invoice');
  }

  /**
   * Bulk generate documents
   */
  async bulkGenerate(data: any[], template: string) {
    const results = [];
    
    for (const item of data) {
      const prompt = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return item[key] || match;
      });
      
      const document = await this.generateDocument(prompt, 'pdf');
      results.push(document);
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  }

  /**
   * Get system prompt based on document type
   */
  private getSystemPrompt(documentType: string): string {
    const prompts = {
      pdf: `You are a professional document designer. Create well-structured, visually appealing documents. 
            Return your response as JSON with the following structure:
            {
              "title": "Document Title",
              "sections": [
                {
                  "heading": "Section Title",
                  "content": "Section content",
                  "style": { "fontSize": 14, "color": "#000" }
                }
              ],
              "metadata": {
                "author": "Author Name",
                "date": "Creation Date",
                "category": "Document Category"
              }
            }`,
            
      certificate: `You are a certificate designer. Create formal, professional certificates.
                    Return JSON with:
                    {
                      "title": "Certificate of Achievement",
                      "recipient": "Name",
                      "achievement": "Description",
                      "date": "Date",
                      "signatureAreas": [
                        { "label": "Instructor", "name": "" }
                      ],
                      "design": {
                        "borderStyle": "ornate",
                        "seal": true,
                        "colors": { "primary": "#1e40af", "accent": "#fbbf24" }
                      }
                    }`,
                    
      invoice: `You are an invoice generator. Create professional, detailed invoices.
                Return JSON with:
                {
                  "invoiceNumber": "INV-001",
                  "billTo": { "name": "", "address": "" },
                  "items": [
                    { "description": "", "quantity": 1, "price": 0, "total": 0 }
                  ],
                  "subtotal": 0,
                  "tax": 0,
                  "total": 0,
                  "paymentTerms": "Net 30",
                  "notes": ""
                }`,
                
      report: `You are a report writer. Create comprehensive, well-organized reports.
               Return JSON with:
               {
                 "title": "Report Title",
                 "executive_summary": "",
                 "sections": [
                   {
                     "title": "",
                     "content": "",
                     "charts": [],
                     "tables": []
                   }
                 ],
                 "conclusion": "",
                 "recommendations": []
               }`
    };

    return prompts[documentType] || prompts.pdf;
  }

  /**
   * Parse Claude's response into structured document
   */
  private parseDocumentResponse(content: string, documentType: string) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: return as plain text document
      return {
        title: 'Generated Document',
        content: content,
        type: documentType,
        generated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to parse Claude response:', error);
      return {
        title: 'Generated Document',
        content: content,
        type: documentType,
        generated: new Date().toISOString()
      };
    }
  }

  /**
   * Generate content suggestions for canvas elements
   */
  async suggestContent(context: string, elementType: 'heading' | 'paragraph' | 'bullet-points') {
    const prompt = `Based on this context: "${context}"
                    Generate ${elementType} content.
                    Keep it professional and concise.`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229', // Faster model for suggestions
      max_tokens: 500,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  /**
   * Analyze document and provide improvement suggestions
   */
  async analyzeDocument(documentContent: string) {
    const prompt = `Analyze this document and provide improvement suggestions:
                    ${documentContent}
                    
                    Provide feedback on:
                    1. Structure and organization
                    2. Clarity and readability
                    3. Professional tone
                    4. Missing elements
                    5. Visual hierarchy suggestions`;

    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.5,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return response.content[0].type === 'text' ? response.content[0].text : '';
  }
}

// Export singleton instance
let claudeInstance: ClaudeService | null = null;

export const initializeClaude = (apiKey: string) => {
  claudeInstance = new ClaudeService(apiKey);
  return claudeInstance;
};

export const getClaude = () => {
  if (!claudeInstance) {
    throw new Error('Claude not initialized. Call initializeClaude first.');
  }
  return claudeInstance;
};