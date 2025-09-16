import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Award, FileSpreadsheet, ChartBar, Loader2 } from 'lucide-react';
import { initializeClaude, getClaude } from '../../ai/ClaudeService';

interface AIGeneratorProps {
  onDocumentGenerated: (document: any) => void;
}

export const AIGenerator: React.FC<AIGeneratorProps> = ({ onDocumentGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [documentType, setDocumentType] = useState<'pdf' | 'certificate' | 'invoice' | 'report'>('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  const [claudeReady, setClaudeReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Claude with API key from environment
    const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
    if (apiKey) {
      try {
        initializeClaude(apiKey);
        setClaudeReady(true);
      } catch (err) {
        console.error('Failed to initialize Claude:', err);
        setError('Claude API key not configured');
      }
    } else {
      setError('Please add VITE_CLAUDE_API_KEY to your .env file');
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim() || !claudeReady) return;

    setIsGenerating(true);
    setError(null);

    try {
      const claude = getClaude();
      const document = await claude.generateDocument(prompt, documentType);
      
      // Pass generated document to parent component
      onDocumentGenerated(document);
      
      // Clear prompt after successful generation
      setPrompt('');
    } catch (err: any) {
      console.error('Generation failed:', err);
      setError(err.message || 'Failed to generate document');
    } finally {
      setIsGenerating(false);
    }
  };

  const quickTemplates = [
    {
      type: 'certificate' as const,
      label: 'Certificate',
      icon: Award,
      prompt: 'Create a certificate of completion for a Web Development course'
    },
    {
      type: 'invoice' as const,
      label: 'Invoice',
      icon: FileSpreadsheet,
      prompt: 'Generate an invoice for web design services'
    },
    {
      type: 'report' as const,
      label: 'Report',
      icon: ChartBar,
      prompt: 'Create a quarterly business report with charts'
    },
    {
      type: 'pdf' as const,
      label: 'Document',
      icon: FileText,
      prompt: 'Write a professional project proposal'
    }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center mb-6">
        <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
        <h2 className="text-2xl font-bold">AI Document Generator</h2>
        <span className="ml-4 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
          Powered by Claude
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Document Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Type
        </label>
        <div className="grid grid-cols-4 gap-2">
          {quickTemplates.map((template) => (
            <button
              key={template.type}
              onClick={() => {
                setDocumentType(template.type);
                setPrompt(template.prompt);
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                documentType === template.type
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <template.icon className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">{template.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe what you want to create
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., Create a professional invoice for a web development project with 3 line items..."
          className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          disabled={isGenerating}
        />
      </div>

      {/* Advanced Options */}
      <details className="mb-6">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
          Advanced Options
        </summary>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Model</label>
            <select className="w-full p-2 border rounded text-sm">
              <option value="claude-3-opus">Claude 3 Opus (Best Quality)</option>
              <option value="claude-3-sonnet">Claude 3 Sonnet (Faster)</option>
              <option value="claude-3-haiku">Claude 3 Haiku (Fastest)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Temperature</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.7"
              className="w-full"
            />
          </div>
        </div>
      </details>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating || !claudeReady}
        className="w-full py-3 px-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating with Claude...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Document
          </>
        )}
      </button>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPrompt('Create a professional resume for a software engineer with 5 years experience')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
          >
            Resume
          </button>
          <button
            onClick={() => setPrompt('Generate a business proposal for a mobile app development project')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
          >
            Proposal
          </button>
          <button
            onClick={() => setPrompt('Create a contract for freelance design services')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
          >
            Contract
          </button>
          <button
            onClick={() => setPrompt('Generate a product catalog for an e-commerce website')}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full"
          >
            Catalog
          </button>
        </div>
      </div>
    </div>
  );
};