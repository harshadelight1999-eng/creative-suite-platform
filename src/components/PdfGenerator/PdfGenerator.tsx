import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Designer } from '@pdfme/ui';
import { Template } from '@pdfme/common';
import { Download, FileText, Wand2, Eye, ArrowLeft, Settings } from 'lucide-react';
import { pdfmeService, PdfGenerationProgress } from '../../services/PdfmeService';
import { TemplateType, PDF_TEMPLATES, SAMPLE_BUSINESS_LETTER, SAMPLE_INVOICE, SAMPLE_REPORT } from '../../types/PdfTemplates';
import { TemplateSelector } from './TemplateSelector';
import { ProgressIndicator, ErrorDisplay, SuccessDisplay } from './ProgressIndicator';

interface PdfGeneratorProps {
  document?: any; // Your existing document type
  onClose: () => void;
  isOpen: boolean;
}

export const PdfGenerator: React.FC<PdfGeneratorProps> = ({ document, onClose, isOpen }) => {
  const designerRef = useRef<HTMLDivElement>(null);
  const designer = useRef<Designer | null>(null);
  
  // State management
  const [currentStep, setCurrentStep] = useState<'select' | 'design' | 'preview'>('select');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<PdfGenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lastGeneratedPdf, setLastGeneratedPdf] = useState<Uint8Array | null>(null);
  const [currentFilename, setCurrentFilename] = useState<string>('');

  // Template selection handlers
  const handleTemplateSelect = useCallback((templateType: TemplateType) => {
    setSelectedTemplate(templateType);
    setError(null);
    
    let newTemplate: Template;
    
    switch (templateType) {
      case 'business-letter':
        newTemplate = pdfmeService.getBusinessLetterTemplate();
        break;
      case 'invoice':
        newTemplate = pdfmeService.getInvoiceTemplate();
        break;
      case 'report':
        newTemplate = pdfmeService.getReportTemplate();
        break;
      default:
        if (document) {
          newTemplate = pdfmeService.convertDocumentToTemplate(document);
        } else {
          newTemplate = pdfmeService.getBusinessLetterTemplate(); // fallback
        }
    }
    
    setTemplate(newTemplate);
  }, [document]);

  const handleCustomTemplate = useCallback(() => {
    setSelectedTemplate('custom');
    setError(null);
    
    if (document) {
      const customTemplate = pdfmeService.convertDocumentToTemplate(document);
      setTemplate(customTemplate);
    } else {
      // Start with blank template
      setTemplate(pdfmeService.getBusinessLetterTemplate());
    }
  }, [document]);

  const proceedToDesigner = useCallback(() => {
    if (template) {
      setCurrentStep('design');
    }
  }, [template]);

  // Initialize designer when entering design step
  useEffect(() => {
    if (currentStep === 'design' && designerRef.current && template && !designer.current) {
      try {
        designer.current = new Designer({
          domContainer: designerRef.current,
          template,
          options: {
            lang: 'en',
            labels: {
              'clear': 'Clear',
              'addNewField': 'Add Field',
              'editField': 'Edit Field',
              'copyField': 'Copy Field',
              'deleteField': 'Delete Field',
            },
          },
        });

        // Listen for template changes
        designer.current.onChangeTemplate((newTemplate) => {
          setTemplate(newTemplate);
        });
      } catch (err) {
        setError(`Failed to initialize designer: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    return () => {
      if (designer.current) {
        designer.current.destroy();
        designer.current = null;
      }
    };
  }, [currentStep, template]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('select');
      setSelectedTemplate(null);
      setTemplate(null);
      setError(null);
      setSuccess(false);
      setLastGeneratedPdf(null);
    } else {
      // Cleanup when closing
      if (designer.current) {
        designer.current.destroy();
        designer.current = null;
      }
    }
  }, [isOpen]);

  const generatePDF = async () => {
    if (!template || !selectedTemplate) return;

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(null);

    try {
      // Get sample data based on selected template
      let inputs: Record<string, any>[];
      let filename: string;

      switch (selectedTemplate) {
        case 'business-letter':
          inputs = [SAMPLE_BUSINESS_LETTER];
          filename = 'business-letter.pdf';
          break;
        case 'invoice':
          inputs = [SAMPLE_INVOICE];
          filename = 'invoice.pdf';
          break;
        case 'report':
          inputs = [SAMPLE_REPORT];
          filename = 'business-report.pdf';
          break;
        default:
          inputs = [{
            title: document?.title || 'Custom Document',
            documentTitle: document?.title || 'Custom Document',
          }];
          filename = `${document?.title || 'document'}.pdf`;
      }

      setCurrentFilename(filename);

      // Generate PDF with progress tracking
      const pdfData = await pdfmeService.generatePdf(template, inputs, {
        filename,
        onProgress: (progress) => {
          setGenerationProgress(progress);
        }
      });

      // Store for preview
      setLastGeneratedPdf(pdfData);

      // Download PDF
      await pdfmeService.downloadPdf(pdfData, filename);

      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const previewPDF = async () => {
    if (lastGeneratedPdf) {
      try {
        await pdfmeService.previewPdf(lastGeneratedPdf);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to preview PDF');
      }
    }
  };

  const generateWithAI = async () => {
    // This will integrate with your AI system later
    setError('AI-powered PDF generation coming soon! This feature will be available in the next update.');
  };

  const handleRetry = () => {
    setError(null);
    generatePDF();
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  const goBackToTemplateSelection = () => {
    setCurrentStep('select');
    setSelectedTemplate(null);
    setTemplate(null);
    if (designer.current) {
      designer.current.destroy();
      designer.current = null;
    }
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select':
        return (
          <div className="p-6">
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onTemplateSelect={handleTemplateSelect}
              onCustomTemplate={handleCustomTemplate}
            />
          </div>
        );
      
      case 'design':
        return (
          <div className="flex-1 p-4">
            <div 
              ref={designerRef} 
              className="w-full h-full border rounded-lg"
              style={{ minHeight: '500px' }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    switch (currentStep) {
      case 'select':
        return 'Choose PDF Template';
      case 'design':
        return `Customize ${selectedTemplate === 'business-letter' ? 'Business Letter' : 
                              selectedTemplate === 'invoice' ? 'Invoice' :
                              selectedTemplate === 'report' ? 'Business Report' : 'Custom'} Template`;
      default:
        return 'Professional PDF Generator';
    }
  };

  const canProceed = currentStep === 'select' && selectedTemplate;
  const canGenerate = currentStep === 'design' && template && !isGenerating;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              {currentStep === 'design' && (
                <button
                  onClick={goBackToTemplateSelection}
                  className="p-1 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <FileText className="w-5 h-5" />
              <h2 className="text-xl font-semibold">{getHeaderTitle()}</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              {currentStep === 'design' && (
                <>
                  <button
                    onClick={generateWithAI}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>AI Generate</span>
                  </button>
                  
                  {lastGeneratedPdf && (
                    <button
                      onClick={previewPDF}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview</span>
                    </button>
                  )}
                  
                  <button
                    onClick={generatePDF}
                    disabled={!canGenerate}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGenerating ? 'Generating...' : 'Generate PDF'}</span>
                  </button>
                </>
              )}
              
              {currentStep === 'select' && canProceed && (
                <button
                  onClick={proceedToDesigner}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Settings className="w-4 h-4" />
                  <span>Customize Template</span>
                </button>
              )}
              
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>

          {/* Content */}
          {renderStepContent()}

          {/* Footer */}
          {currentStep === 'design' && (
            <div className="p-4 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                <p><strong>Pro Tip:</strong> Use the designer above to customize your PDF layout, then click "Generate PDF" to download.</p>
                <p>✨ <strong>Features:</strong> Professional templates • Multi-page support • Real-time preview • Export progress tracking</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator 
        progress={generationProgress || { stage: 'initializing', progress: 0, message: 'Starting...' }}
        isVisible={isGenerating && !!generationProgress}
      />

      {/* Error Display */}
      <ErrorDisplay
        error={error}
        onRetry={handleRetry}
        onClose={handleCloseError}
        isVisible={!!error}
      />

      {/* Success Display */}
      <SuccessDisplay
        isVisible={success}
        onClose={handleCloseSuccess}
        onViewPdf={lastGeneratedPdf ? previewPDF : undefined}
        filename={currentFilename}
      />
    </>
  );
};