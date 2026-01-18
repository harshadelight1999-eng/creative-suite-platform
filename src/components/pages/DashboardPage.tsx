import { BarChart3, FileText, Users, TrendingUp, Plus, Clock, Star } from 'lucide-react'

export function DashboardPage() {
  const stats = [
    { label: 'Total Documents', value: '1,234', change: '+12%', icon: FileText, color: 'text-blue-600' },
    { label: 'Templates Used', value: '89', change: '+5%', icon: Star, color: 'text-purple-600' },
    { label: 'Active Users', value: '456', change: '+18%', icon: Users, color: 'text-green-600' },
    { label: 'This Month', value: '234', change: '+8%', icon: TrendingUp, color: 'text-orange-600' },
  ]

  const recentDocuments = [
    { name: 'Invoice #1234', type: 'PDF', updated: '2 hours ago', status: 'Completed' },
    { name: 'Marketing Brochure', type: 'Design', updated: '4 hours ago', status: 'In Progress' },
    { name: 'Certificate Template', type: 'PDF', updated: '1 day ago', status: 'Completed' },
    { name: 'Video Presentation', type: 'Video', updated: '2 days ago', status: 'Draft' },
    { name: 'Business Card', type: 'Design', updated: '3 days ago', status: 'Completed' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'In Progress': return 'bg-blue-100 text-blue-800'
      case 'Draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="dashboard-page">
      <div className="border-b bg-white px-6 py-6">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your projects.</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Document
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${stat.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <span className="text-sm font-medium text-green-600">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            )
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Documents */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Documents</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{doc.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <span>{doc.type}</span>
                          <span>•</span>
                          <Clock className="h-3 w-3" />
                          <span>{doc.updated}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <button className="w-full text-left p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Create PDF</div>
                    <div className="text-sm text-gray-500">Start with a blank document</div>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Use Template</div>
                    <div className="text-sm text-gray-500">Choose from pre-made designs</div>
                  </div>
                </div>
              </button>

              <button className="w-full text-left p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Analytics</div>
                    <div className="text-sm text-gray-500">View detailed reports</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}