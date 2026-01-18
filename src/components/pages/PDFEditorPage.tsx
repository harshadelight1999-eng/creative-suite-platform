import { useState } from 'react'
import { Template } from '@pdfme/common'
import { PDFEditor } from '@/components/pdf/PDFEditor'
import { DragDropCanvas } from '@/components/ui/DragDropCanvas'

export function PDFEditorPage() {
  const [currentTemplate, setCurrentTemplate] = useState<Template>()

  return (
    <div className="pdf-editor-page">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PDF Editor</h1>
            <p className="text-gray-600 mt-1">Create and edit PDF documents with drag-and-drop functionality</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary">Import PDF</button>
            <button className="btn-primary">Export PDF</button>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        <div className="w-80 border-r bg-gray-50">
          <DragDropCanvas />
        </div>

        <div className="flex-1">
          <PDFEditor
            template={currentTemplate}
            onTemplateChange={setCurrentTemplate}
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
}