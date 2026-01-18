import { useState } from 'react'
import { Template } from '@pdfme/common'
import { Search, Filter, Download, Eye } from 'lucide-react'

interface TemplateItem {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  template: Partial<Template>
}

const sampleTemplates: TemplateItem[] = [
  {
    id: '1',
    name: 'Business Invoice',
    description: 'Professional invoice template with company branding',
    category: 'Business',
    thumbnail: '/api/placeholder/300/200',
    template: {
      schemas: [
        [
          {
            name: 'companyName',
            type: 'text',
            position: { x: 10, y: 10 },
            width: 100,
            height: 8,
            fontSize: 16,
            fontColor: '#2563eb'
          },
          {
            name: 'invoiceNumber',
            type: 'text',
            position: { x: 150, y: 10 },
            width: 50,
            height: 6,
            fontSize: 12,
            fontColor: '#374151'
          }
        ]
      ]
    }
  },
  {
    id: '2',
    name: 'Certificate Template',
    description: 'Elegant certificate with customizable fields',
    category: 'Education',
    thumbnail: '/api/placeholder/300/200',
    template: {
      schemas: [
        [
          {
            name: 'certificateTitle',
            type: 'text',
            position: { x: 50, y: 40 },
            width: 100,
            height: 10,
            fontSize: 24,
            fontColor: '#dc2626'
          },
          {
            name: 'recipientName',
            type: 'text',
            position: { x: 50, y: 80 },
            width: 100,
            height: 8,
            fontSize: 18,
            fontColor: '#374151'
          }
        ]
      ]
    }
  },
  {
    id: '3',
    name: 'Resume Layout',
    description: 'Modern resume template with structured sections',
    category: 'Personal',
    thumbnail: '/api/placeholder/300/200',
    template: {
      schemas: [
        [
          {
            name: 'fullName',
            type: 'text',
            position: { x: 10, y: 10 },
            width: 80,
            height: 8,
            fontSize: 20,
            fontColor: '#1f2937'
          },
          {
            name: 'jobTitle',
            type: 'text',
            position: { x: 10, y: 20 },
            width: 80,
            height: 6,
            fontSize: 14,
            fontColor: '#6b7280'
          }
        ]
      ]
    }
  }
]

export function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['All', 'Business', 'Education', 'Personal', 'Marketing']

  const filteredTemplates = sampleTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleUseTemplate = (template: TemplateItem) => {
    // In a real app, this would navigate to the PDF editor with the template loaded
    console.log('Using template:', template)
  }

  return (
    <div className="templates-page">
      <div className="border-b bg-white px-6 py-6">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">PDF Templates</h1>
          <p className="text-gray-600">Choose from our collection of professional templates</p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input min-w-32"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <div className="text-6xl text-gray-300">📄</div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {template.category}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {template.description}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Use Template
                  </button>
                  <button className="btn-secondary px-3">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}