import { Link } from 'react-router-dom'
import { FileText, Palette, Video, Wand2, ArrowRight } from 'lucide-react'

export function HomePage() {
  const features = [
    {
      icon: FileText,
      title: 'PDF Creation & Editing',
      description: 'Professional PDF editor with drag-and-drop interface using PDFme',
      link: '/pdf-editor',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Palette,
      title: 'Design Studio',
      description: 'Advanced design tools with Craft.js and Konva for creative content',
      link: '/design-studio',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: Video,
      title: 'Video Creation',
      description: 'Video editing and creation powered by Remotion',
      link: '/video-editor',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: Wand2,
      title: 'AI Enhancement',
      description: 'AI-powered content generation and optimization',
      link: '/ai-tools',
      color: 'text-orange-600 bg-orange-100'
    }
  ]

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 px-6 py-16">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Creative Suite Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A comprehensive content creation platform built with cutting-edge libraries including PDFme,
            Craft.js, dnd-kit, and Remotion. Create, edit, and export professional documents, designs, and videos.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/pdf-editor" className="btn-primary text-lg px-8 py-3">
              Start Creating
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/templates" className="btn-secondary text-lg px-8 py-3">
              Browse Templates
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Powerful Tools at Your Fingertips
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Link
                  key={feature.title}
                  to={feature.link}
                  className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-200"
                >
                  <div className={`inline-flex p-3 rounded-lg ${feature.color} mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-gray-50 px-6 py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Built with Industry-Leading Technologies
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-center">
            {[
              'React 18',
              'TypeScript',
              'Vite',
              'Tailwind CSS',
              'PDFme',
              'Craft.js',
              'dnd-kit',
              'Remotion',
              'Konva',
              'Fabric.js',
              'Supabase',
              'OpenAI'
            ].map((tech) => (
              <div key={tech} className="flex flex-col items-center">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 w-full">
                  <div className="text-sm font-medium text-gray-900">{tech}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}