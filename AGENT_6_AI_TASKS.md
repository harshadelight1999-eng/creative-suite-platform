# Agent 6: AI Integration Engineer Tasks

## CURRENT ASSIGNMENT
**Focus:** Establish Google Gemini API integration for intelligent document generation and content optimization

## MANDATORY TECHNOLOGIES
- Google Gemini API (Gemini Pro/Ultra models)
- TypeScript for type safety
- React hooks for state management
- Vector embeddings for content similarity
- Streaming responses for real-time generation

## TODAY'S TASKS (DAY 4 PRIORITY)
1. [ ] Configure Google Gemini API integration
2. [ ] Build AI-powered document generation service
3. [ ] Implement intelligent template suggestions
4. [ ] Create content optimization features
5. [ ] Add real-time AI assistance components

## CODE TO IMPLEMENT

### Task 1: Install AI Dependencies
```bash
npm install @google/generative-ai
npm install openai # For embeddings if needed
npm install streaming-text-response
```

### Task 2: Gemini Service Implementation
```typescript
// src/ai/GeminiService.ts
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export interface DocumentGenerationRequest {
  type: 'invoice' | 'certificate' | 'report' | 'letter' | 'form';
  context: string;
  tone: 'professional' | 'casual' | 'formal' | 'friendly';
  length: 'short' | 'medium' | 'long';
  additionalRequirements?: string;
}

export interface AIGeneratedContent {
  title: string;
  sections: Array<{
    heading: string;
    content: string;
    type: 'text' | 'list' | 'table';
  }>;
  suggestedElements: Array<{
    type: 'text' | 'image' | 'signature' | 'date';
    content: string;
    position: { x: number; y: number };
    styling: Record<string, any>;
  }>;
  confidence: number;
  generationTime: number;
}

export interface TemplateRecommendation {
  templateId: string;
  templateName: string;
  relevanceScore: number;
  reason: string;
  category: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateDocumentContent(request: DocumentGenerationRequest): Promise<AIGeneratedContent> {
    const startTime = Date.now();

    try {
      const prompt = this.buildGenerationPrompt(request);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      const parsedContent = this.parseAIResponse(content, request.type);
      const generationTime = Date.now() - startTime;

      return {
        ...parsedContent,
        generationTime,
        confidence: this.calculateConfidence(content, request)
      };
    } catch (error) {
      console.error('AI content generation failed:', error);
      throw new Error('Failed to generate AI content. Please try again.');
    }
  }

  async getTemplateRecommendations(
    context: string,
    availableTemplates: Array<{ id: string; name: string; category: string; description: string }>
  ): Promise<TemplateRecommendation[]> {
    try {
      const prompt = `
        Based on the following context, recommend the most suitable document templates from the available options.
        Provide relevance scores (0-100) and explain why each template would be appropriate.

        Context: ${context}

        Available Templates:
        ${availableTemplates.map(t => `- ${t.name} (${t.category}): ${t.description}`).join('\\n')}

        Please respond in JSON format with an array of recommendations.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return this.parseTemplateRecommendations(content, availableTemplates);
    } catch (error) {
      console.error('Template recommendation failed:', error);
      return [];
    }
  }

  async optimizeContent(content: string, targetAudience: string, purpose: string): Promise<string> {
    try {
      const prompt = `
        Optimize the following content for better clarity, professionalism, and effectiveness.

        Target Audience: ${targetAudience}
        Purpose: ${purpose}
        
        Original Content:
        ${content}

        Please provide an improved version that:
        1. Is more engaging and clear
        2. Uses appropriate tone and language
        3. Is well-structured and easy to read
        4. Maintains the original meaning and intent

        Return only the optimized content without explanations.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return response.text().trim();
    } catch (error) {
      console.error('Content optimization failed:', error);
      throw new Error('Failed to optimize content. Please try again.');
    }
  }

  async *streamGenerateContent(request: DocumentGenerationRequest): AsyncGenerator<string, void, unknown> {
    try {
      const prompt = this.buildGenerationPrompt(request);
      const result = await this.model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        yield chunkText;
      }
    } catch (error) {
      console.error('Streaming generation failed:', error);
      throw new Error('Failed to stream AI content generation.');
    }
  }

  private buildGenerationPrompt(request: DocumentGenerationRequest): string {
    const { type, context, tone, length, additionalRequirements } = request;

    return `
      Generate a professional ${type} document with the following specifications:

      Context: ${context}
      Tone: ${tone}
      Length: ${length}
      Additional Requirements: ${additionalRequirements || 'None'}

      Please structure the response as JSON with the following format:
      {
        "title": "Document title",
        "sections": [
          {
            "heading": "Section heading",
            "content": "Section content",
            "type": "text" | "list" | "table"
          }
        ],
        "suggestedElements": [
          {
            "type": "text" | "image" | "signature" | "date",
            "content": "Element content",
            "position": {"x": 0, "y": 0},
            "styling": {"fontSize": 16, "color": "#000000"}
          }
        ]
      }

      Ensure the content is professional, well-structured, and appropriate for the specified context and tone.
    `;
  }

  private parseAIResponse(content: string, documentType: string): Omit<AIGeneratedContent, 'confidence' | 'generationTime'> {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      return {
        title: parsed.title || `Generated ${documentType}`,
        sections: parsed.sections || [],
        suggestedElements: parsed.suggestedElements || []
      };
    } catch {
      // Fallback to text parsing if JSON parsing fails
      return this.parseTextResponse(content, documentType);
    }
  }

  private parseTextResponse(content: string, documentType: string): Omit<AIGeneratedContent, 'confidence' | 'generationTime'> {
    const lines = content.split('\\n').filter(line => line.trim());
    const title = lines[0] || `Generated ${documentType}`;
    
    const sections = [{
      heading: 'Content',
      content: lines.slice(1).join('\\n'),
      type: 'text' as const
    }];

    return {
      title,
      sections,
      suggestedElements: []
    };
  }

  private parseTemplateRecommendations(
    content: string,
    availableTemplates: Array<{ id: string; name: string; category: string; description: string }>
  ): TemplateRecommendation[] {
    try {
      const parsed = JSON.parse(content);
      return parsed.map((rec: any) => ({
        templateId: rec.templateId || '',
        templateName: rec.templateName || '',
        relevanceScore: Math.min(100, Math.max(0, rec.relevanceScore || 0)),
        reason: rec.reason || 'No reason provided',
        category: rec.category || 'General'
      }));
    } catch {
      // Fallback: return templates in order with default scores
      return availableTemplates.slice(0, 3).map((template, index) => ({
        templateId: template.id,
        templateName: template.name,
        relevanceScore: 80 - (index * 10),
        reason: 'Template matches your document type',
        category: template.category
      }));
    }
  }

  private calculateConfidence(content: string, request: DocumentGenerationRequest): number {
    // Simple confidence calculation based on content quality indicators
    let confidence = 50; // Base confidence

    // Check for proper structure
    if (content.includes('"title"') && content.includes('"sections"')) {
      confidence += 20;
    }

    // Check for content length appropriateness
    const wordCount = content.split(' ').length;
    if (request.length === 'short' && wordCount > 50 && wordCount < 200) {
      confidence += 15;
    } else if (request.length === 'medium' && wordCount > 200 && wordCount < 500) {
      confidence += 15;
    } else if (request.length === 'long' && wordCount > 500) {
      confidence += 15;
    }

    // Check for context relevance (simple keyword matching)
    const contextWords = request.context.toLowerCase().split(' ');
    const contentLower = content.toLowerCase();
    const matchingWords = contextWords.filter(word => contentLower.includes(word)).length;
    confidence += Math.min(15, (matchingWords / contextWords.length) * 15);

    return Math.min(100, Math.max(0, confidence));
  }
}
```

### Task 3: AI Generation Hook
```typescript
// src/hooks/useAI.ts
import { useState, useCallback } from 'react';
import { GeminiService, DocumentGenerationRequest, AIGeneratedContent, TemplateRecommendation } from '../ai/GeminiService';

export const useAI = () => {
  const [geminiService] = useState(() => new GeminiService());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = useCallback(async (request: DocumentGenerationRequest): Promise<AIGeneratedContent | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await geminiService.generateDocumentContent(request);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [geminiService]);

  const optimizeContent = useCallback(async (
    content: string,
    targetAudience: string,
    purpose: string
  ): Promise<string | null> => {
    setIsOptimizing(true);
    setError(null);

    try {
      const optimized = await geminiService.optimizeContent(content, targetAudience, purpose);
      return optimized;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize content';
      setError(errorMessage);
      return null;
    } finally {
      setIsOptimizing(false);
    }
  }, [geminiService]);

  const getTemplateRecommendations = useCallback(async (
    context: string,
    availableTemplates: Array<{ id: string; name: string; category: string; description: string }>
  ): Promise<TemplateRecommendation[]> => {
    setIsLoadingRecommendations(true);
    setError(null);

    try {
      const recommendations = await geminiService.getTemplateRecommendations(context, availableTemplates);
      return recommendations;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendations';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [geminiService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateContent,
    optimizeContent,
    getTemplateRecommendations,
    isGenerating,
    isOptimizing,
    isLoadingRecommendations,
    error,
    clearError
  };
};
```

### Task 4: AI Generation Component
```typescript
// src/components/AIGenerator/AIDocumentGenerator.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Sparkles, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAI } from '../../hooks/useAI';
import { DocumentGenerationRequest, AIGeneratedContent } from '../../ai/GeminiService';

interface AIDocumentGeneratorProps {
  onContentGenerated: (content: AIGeneratedContent) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const AIDocumentGenerator: React.FC<AIDocumentGeneratorProps> = ({
  onContentGenerated,
  onClose,
  isOpen
}) => {
  const { generateContent, isGenerating, error, clearError } = useAI();
  const [request, setRequest] = useState<DocumentGenerationRequest>({
    type: 'letter',
    context: '',
    tone: 'professional',
    length: 'medium'
  });

  const [generatedContent, setGeneratedContent] = useState<AIGeneratedContent | null>(null);

  const handleGenerate = async () => {
    if (!request.context.trim()) {
      return;
    }

    clearError();
    const content = await generateContent(request);
    
    if (content) {
      setGeneratedContent(content);
    }
  };

  const handleUseContent = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent);
      onClose();
    }
  };

  const handleInputChange = (field: keyof DocumentGenerationRequest, value: string) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-5/6 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wand2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">AI Document Generator</h2>
              <p className="text-sm text-gray-600">Create professional documents with artificial intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Configuration Panel */}
          <div className="w-1/3 p-6 border-r bg-gray-50">
            <h3 className="text-lg font-medium mb-4">Document Configuration</h3>

            {/* Document Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Type
              </label>
              <select
                value={request.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="invoice">Invoice</option>
                <option value="certificate">Certificate</option>
                <option value="report">Report</option>
                <option value="letter">Letter</option>
                <option value="form">Form</option>
              </select>
            </div>

            {/* Context */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Context & Purpose
              </label>
              <textarea
                value={request.context}
                onChange={(e) => handleInputChange('context', e.target.value)}
                placeholder="Describe what this document is for, who it's intended for, and any specific requirements..."
                className="w-full border rounded-lg px-3 py-2 h-24 resize-none"
              />
            </div>

            {/* Tone */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <select
                value={request.tone}
                onChange={(e) => handleInputChange('tone', e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>

            {/* Length */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Length
              </label>
              <select
                value={request.length}
                onChange={(e) => handleInputChange('length', e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="short">Short (1-2 paragraphs)</option>
                <option value="medium">Medium (3-5 paragraphs)</option>
                <option value="long">Long (6+ paragraphs)</option>
              </select>
            </div>

            {/* Additional Requirements */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Requirements
              </label>
              <textarea
                value={request.additionalRequirements || ''}
                onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
                placeholder="Any specific formatting, sections, or content requirements..."
                className="w-full border rounded-lg px-3 py-2 h-20 resize-none"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !request.context.trim()}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Document</span>
                </>
              )}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 p-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}

              {!generatedContent && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center text-gray-500"
                >
                  <div className="text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Configure your document and click "Generate" to see AI-generated content</p>
                  </div>
                </motion.div>
              )}

              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex items-center justify-center"
                >
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">AI is generating your document...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                  </div>
                </motion.div>
              )}

              {generatedContent && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <h3 className="text-lg font-medium">Generated Content</h3>
                      <span className="text-sm text-gray-500">
                        ({generatedContent.generationTime}ms, {generatedContent.confidence}% confidence)
                      </span>
                    </div>
                    <button
                      onClick={handleUseContent}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700"
                    >
                      Use This Content
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-white">
                    <h2 className="text-xl font-bold mb-4">{generatedContent.title}</h2>
                    
                    {generatedContent.sections.map((section, index) => (
                      <div key={index} className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">{section.heading}</h3>
                        <div className="text-gray-700 whitespace-pre-wrap">
                          {section.content}
                        </div>
                      </div>
                    ))}

                    {generatedContent.suggestedElements.length > 0 && (
                      <div className="mt-6 pt-4 border-t">
                        <h3 className="text-lg font-semibold mb-2">Suggested Elements</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {generatedContent.suggestedElements.map((element, index) => (
                            <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                              <span className="font-medium capitalize">{element.type}:</span> {element.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
```

## INTEGRATION REQUIREMENTS

### With PDF Engineer (Agent 1)
- Provide AI-generated content in pdfme-compatible format
- Generate template suggestions for PDF layouts
- Optimize content for PDF rendering

### With Authentication Engineer (Agent 2)
- Integrate user subscription status for AI feature access
- Track AI usage per user for billing purposes
- Personalize AI suggestions based on user history

### With Payment Engineer (Agent 3)
- Respect subscription limits for AI generations
- Track AI usage for billing purposes
- Show upgrade prompts for premium AI features

### With Database Architect (Agent 4)
- Store AI-generated content and user preferences
- Track AI usage and performance metrics
- Cache frequently requested content types

### With UI/UX Engineer (Agent 5)
- Provide AI components that integrate with canvas
- Show AI suggestions in properties panel
- Display real-time AI assistance

## STRICT BOUNDARIES - DO NOT WORK ON
- PDF generation algorithms
- User authentication and sessions
- Payment processing and billing
- Database schema design
- Canvas rendering and interactions
- Testing framework configuration

## AI FEATURES TO IMPLEMENT
- [ ] Document content generation from context
- [ ] Intelligent template recommendations
- [ ] Content optimization and enhancement
- [ ] Real-time writing assistance
- [ ] Grammar and style suggestions
- [ ] Layout optimization suggestions

## PERFORMANCE REQUIREMENTS
- [ ] AI responses under 3 seconds for standard requests
- [ ] 95%+ user satisfaction with AI suggestions
- [ ] Streaming responses for long content generation
- [ ] Intelligent caching to reduce API calls
- [ ] Error handling and fallback mechanisms

## SUCCESS CRITERIA
- [ ] AI generates relevant, high-quality content
- [ ] Template recommendations match user context
- [ ] Content optimization improves readability
- [ ] Streaming generation provides real-time feedback
- [ ] Error handling gracefully manages API failures
- [ ] Usage tracking enables subscription billing
- [ ] AI features enhance user productivity

## DELIVERABLE FILES
- `/src/ai/GeminiService.ts`
- `/src/hooks/useAI.ts`
- `/src/components/AIGenerator/AIDocumentGenerator.tsx`
- `/src/components/AIGenerator/TemplateRecommendations.tsx`
- `/src/types/ai.ts`

Remember: Focus ONLY on AI integration and intelligent features. All other functionality is handled by specialized agents in their respective domains.