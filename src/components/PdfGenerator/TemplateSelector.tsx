import React from 'react';
import { FileText, Receipt, BarChart3, Settings } from 'lucide-react';
import { TemplateType, TEMPLATE_CATEGORIES } from '../../types/PdfTemplates';

interface TemplateSelectorProps {
  selectedTemplate: TemplateType | null;
  onTemplateSelect: (templateType: TemplateType) => void;
  onCustomTemplate: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect,
  onCustomTemplate
}) => {
  const templates = [
    {
      id: 'business-letter' as TemplateType,
      name: 'Business Letter',
      description: 'Professional business correspondence',
      icon: FileText,
      category: 'business',
      color: 'blue'
    },
    {
      id: 'invoice' as TemplateType,
      name: 'Invoice',
      description: 'Itemized billing document',
      icon: Receipt,
      category: 'financial',
      color: 'green'
    },
    {
      id: 'report' as TemplateType,
      name: 'Business Report',
      description: 'Analytics and insights report',
      icon: BarChart3,
      category: 'report',
      color: 'purple'
    }
  ];

  const getIconColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = 'w-8 h-8';
    if (isSelected) {
      switch (color) {
        case 'blue': return `${baseClasses} text-blue-600`;
        case 'green': return `${baseClasses} text-green-600`;
        case 'purple': return `${baseClasses} text-purple-600`;
        default: return `${baseClasses} text-gray-600`;
      }
    }
    return `${baseClasses} text-gray-400`;
  };

  const getCardClasses = (templateId: TemplateType, color: string) => {
    const baseClasses = 'p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md';
    const isSelected = selectedTemplate === templateId;
    
    if (isSelected) {
      switch (color) {
        case 'blue': return `${baseClasses} border-blue-500 bg-blue-50`;
        case 'green': return `${baseClasses} border-green-500 bg-green-50`;
        case 'purple': return `${baseClasses} border-purple-500 bg-purple-50`;
        default: return `${baseClasses} border-gray-500 bg-gray-50`;
      }
    }
    
    return `${baseClasses} border-gray-200 bg-white hover:border-gray-300`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Choose a Template
        </h3>
        <p className="text-sm text-gray-600">
          Select a professional template to get started quickly
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => {
          const IconComponent = template.icon;
          const isSelected = selectedTemplate === template.id;
          
          return (
            <div
              key={template.id}
              className={getCardClasses(template.id, template.color)}
              onClick={() => onTemplateSelect(template.id)}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-full ${
                  isSelected 
                    ? `bg-${template.color}-100` 
                    : 'bg-gray-100'
                }`}>
                  <IconComponent className={getIconColorClasses(template.color, isSelected)} />
                </div>
                
                <div>
                  <h4 className={`font-medium ${
                    isSelected ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {template.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {template.description}
                  </p>
                </div>

                <div className={`text-xs px-2 py-1 rounded-full ${
                  isSelected
                    ? `bg-${template.color}-200 text-${template.color}-800`
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {TEMPLATE_CATEGORIES[template.category as keyof typeof TEMPLATE_CATEGORIES]}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Template Option */}
      <div className="border-t pt-6">
        <div
          className={`p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 ${
            selectedTemplate === 'custom' 
              ? 'border-orange-500 bg-orange-50' 
              : 'border-gray-300'
          }`}
          onClick={onCustomTemplate}
        >
          <div className="flex items-center justify-center space-x-3">
            <div className={`p-2 rounded-full ${
              selectedTemplate === 'custom' ? 'bg-orange-100' : 'bg-gray-100'
            }`}>
              <Settings className={`w-6 h-6 ${
                selectedTemplate === 'custom' ? 'text-orange-600' : 'text-gray-400'
              }`} />
            </div>
            <div className="text-center">
              <h4 className={`font-medium ${
                selectedTemplate === 'custom' ? 'text-gray-900' : 'text-gray-700'
              }`}>
                Custom Template
              </h4>
              <p className="text-xs text-gray-500">
                Start with a blank template or import your own
              </p>
            </div>
          </div>
        </div>
      </div>

      {selectedTemplate && selectedTemplate !== 'custom' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            </div>
            <div>
              <h5 className="font-medium text-blue-900 text-sm">
                Template Features
              </h5>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• Professional layout with optimized spacing</li>
                <li>• Pre-filled sample data for quick preview</li>
                <li>• Fully customizable fields and styling</li>
                <li>• Export-ready PDF generation</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};