import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { PdfGenerationProgress } from '../../services/PdfmeService';

interface ProgressIndicatorProps {
  progress: PdfGenerationProgress;
  isVisible: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  progress, 
  isVisible 
}) => {
  if (!isVisible) return null;

  const stages = [
    { id: 'initializing', label: 'Initializing', description: 'Preparing template and data' },
    { id: 'processing', label: 'Processing', description: 'Processing document data' },
    { id: 'rendering', label: 'Rendering', description: 'Rendering PDF pages' },
    { id: 'finalizing', label: 'Finalizing', description: 'Completing generation' }
  ];

  const getStageStatus = (stageId: string) => {
    const currentStageIndex = stages.findIndex(s => s.id === progress.stage);
    const stageIndex = stages.findIndex(s => s.id === stageId);
    
    if (stageIndex < currentStageIndex) return 'completed';
    if (stageIndex === currentStageIndex) return 'active';
    return 'pending';
  };

  const getStageIcon = (stageId: string) => {
    const status = getStageStatus(stageId);
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active':
        return (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Generating PDF
          </h3>
          <p className="text-sm text-gray-600">{progress.message}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="space-y-3">
          {stages.map((stage) => {
            const status = getStageStatus(stage.id);
            return (
              <div 
                key={stage.id}
                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                  status === 'active' ? 'bg-blue-50' : 
                  status === 'completed' ? 'bg-green-50' : 'bg-gray-50'
                }`}
              >
                {getStageIcon(stage.id)}
                <div className="flex-1">
                  <div className={`font-medium text-sm ${
                    status === 'active' ? 'text-blue-700' :
                    status === 'completed' ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {stage.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {stage.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Estimated Time */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Estimated time remaining: {Math.max(0, Math.ceil((100 - progress.progress) / 25))} seconds
          </p>
        </div>
      </div>
    </div>
  );
};

interface ErrorDisplayProps {
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
  isVisible: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry, 
  onClose, 
  isVisible 
}) => {
  if (!isVisible || !error) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            PDF Generation Failed
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {error}
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SuccessDisplayProps {
  isVisible: boolean;
  onClose: () => void;
  onViewPdf?: () => void;
  filename?: string;
}

export const SuccessDisplay: React.FC<SuccessDisplayProps> = ({ 
  isVisible, 
  onClose, 
  onViewPdf,
  filename 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            PDF Generated Successfully!
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {filename ? `${filename} has been downloaded to your device.` : 'Your PDF has been generated and downloaded.'}
          </p>
          <div className="flex space-x-3 justify-center">
            {onViewPdf && (
              <button
                onClick={onViewPdf}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Preview PDF
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};