import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/components/pages/HomePage'
import { PDFEditorPage } from '@/components/pages/PDFEditorPage'
import { TemplatesPage } from '@/components/pages/TemplatesPage'
import { DashboardPage } from '@/components/pages/DashboardPage'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pdf-editor" element={<PDFEditorPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App