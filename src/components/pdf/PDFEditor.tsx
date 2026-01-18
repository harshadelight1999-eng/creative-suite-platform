import { useEffect, useRef } from 'react'
import { Designer } from '@pdfme/ui'
import { Template } from '@pdfme/common'
import { text, image, barcodes } from '@pdfme/schemas'

interface PDFEditorProps {
  template?: Template
  onTemplateChange?: (template: Template) => void
  className?: string
}

const plugins = { text, image, ...barcodes }

const defaultTemplate: Template = {
  schemas: [
    [
      {
        name: 'title',
        type: 'text',
        position: { x: 10, y: 10 },
        width: 100,
        height: 10,
        fontSize: 20,
        fontColor: '#000000'
      },
      {
        name: 'content',
        type: 'text',
        position: { x: 10, y: 30 },
        width: 180,
        height: 50,
        fontSize: 12,
        fontColor: '#333333'
      }
    ]
  ],
  basePdf: "data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL091dGxpbmVzIDIgMCBSCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKL1R5cGUgL091dGxpbmVzCi9Db3VudCAwCj4+CmVuZG9iagoKMyAwIG9iago8PAovVHlwZSAvUGFnZXMKL0NvdW50IDEKL0tpZHMgWzQgMCBSXQo+PgplbmRvYmoKCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA1IDAgUgo+Pgo+PgovTWVkaWFCb3ggWzAgMCAyMTIgMjc3XQovQ29udGVudHMgNiAwIFIKPj4KZW5kb2JqCgo1IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL1RpbWVzLVJvbWFuCj4+CmVuZG9iagoKNiAwIG9iago8PAovTGVuZ3RoIDQ0Cj4+CnN0cmVhbQpCVApxCjcwIDUwIFRECi9GMSA2MDBUZAP3cQpUIFRKCkVUCmVuZHN0cmVhbQplbmRvYmoKCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDc0IDAwMDAwIG4gCjAwMDAwMDAxMjAgMDAwMDAgbiAKMDAwMDAwMDE3NyAwMDAwMCBuIAowMDAwMDAwMzY0IDAwMDAwIG4gCjAwMDAwMDA0NjYgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA3Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo1NjUKJSVFT0Y="
}

export function PDFEditor({ template = defaultTemplate, onTemplateChange, className }: PDFEditorProps) {
  const designerRef = useRef<HTMLDivElement>(null)
  const designerInstanceRef = useRef<Designer | null>(null)

  useEffect(() => {
    if (!designerRef.current) return

    const designer = new Designer({
      domContainer: designerRef.current,
      template,
      plugins
    })

    designerInstanceRef.current = designer

    designer.onChangeTemplate((newTemplate) => {
      onTemplateChange?.(newTemplate)
    })

    return () => {
      designer.destroy()
    }
  }, [])

  useEffect(() => {
    if (designerInstanceRef.current && template) {
      designerInstanceRef.current.updateTemplate(template)
    }
  }, [template])

  return (
    <div className={`pdf-editor ${className || ''}`}>
      <div className="pdf-editor-toolbar bg-white border-b p-4 flex gap-2">
        <button className="btn-primary text-sm">Add Text</button>
        <button className="btn-secondary text-sm">Add Image</button>
        <button className="btn-secondary text-sm">Add Barcode</button>
        <div className="flex-1" />
        <button className="btn-primary text-sm">Save Template</button>
      </div>
      <div
        ref={designerRef}
        className="pdf-designer-container flex-1 bg-gray-50"
        style={{ minHeight: '600px' }}
      />
    </div>
  )
}