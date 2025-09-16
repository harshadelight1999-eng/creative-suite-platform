import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Activity,
  Cpu,
  GitBranch,
  Zap
} from 'lucide-react';

interface Agent {
  id: number;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'blocked' | 'completed';
  currentTask: string;
  progress: number;
  color: string;
  icon: any;
}

export const CTODashboard: React.FC = () => {
  const [agents] = useState<Agent[]>([
    {
      id: 1,
      name: 'PDF Engineer',
      role: 'PDF Generation',
      status: 'active',
      currentTask: 'Implementing pdfme integration',
      progress: 60,
      color: 'red',
      icon: '📄'
    },
    {
      id: 2,
      name: 'Auth Engineer',
      role: 'Authentication',
      status: 'idle',
      currentTask: 'Setting up Supabase auth',
      progress: 20,
      color: 'orange',
      icon: '🔐'
    },
    {
      id: 3,
      name: 'Payment Engineer',
      role: 'Stripe Integration',
      status: 'idle',
      currentTask: 'Designing pricing tiers',
      progress: 10,
      color: 'yellow',
      icon: '💳'
    },
    {
      id: 4,
      name: 'Database Architect',
      role: 'PostgreSQL',
      status: 'active',
      currentTask: 'Creating user tables',
      progress: 45,
      color: 'green',
      icon: '🗄️'
    },
    {
      id: 5,
      name: 'UI/UX Engineer',
      role: 'Components',
      status: 'active',
      currentTask: 'Building drag-drop canvas',
      progress: 70,
      color: 'blue',
      icon: '🎨'
    },
    {
      id: 6,
      name: 'AI Engineer',
      role: 'Claude Integration',
      status: 'completed',
      currentTask: 'Claude SDK integrated',
      progress: 100,
      color: 'purple',
      icon: '🤖'
    },
    {
      id: 7,
      name: 'DevOps Engineer',
      role: 'CI/CD',
      status: 'blocked',
      currentTask: 'Waiting for test suite',
      progress: 15,
      color: 'gray',
      icon: '🚀'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-yellow-100 text-yellow-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const overallProgress = Math.round(
    agents.reduce((sum, agent) => sum + agent.progress, 0) / agents.length
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CTO Dashboard</h1>
        <p className="text-gray-600">Managing 7 Specialized Agents - Claude SDK Powered</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Agents</p>
              <p className="text-2xl font-bold">
                {agents.filter(a => a.status === 'active').length}/7
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overall Progress</p>
              <p className="text-2xl font-bold">{overallProgress}%</p>
            </div>
            <Cpu className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Tasks</p>
              <p className="text-2xl font-bold">
                {agents.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Blocked</p>
              <p className="text-2xl font-bold">
                {agents.filter(a => a.status === 'blocked').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white rounded-lg shadow-lg p-6">
            {/* Agent Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{agent.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">Agent {agent.id}</h3>
                  <p className="text-sm text-gray-600">{agent.name}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
                {agent.status}
              </span>
            </div>

            {/* Current Task */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Current Task:</p>
              <p className="text-sm font-medium">{agent.currentTask}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{agent.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getProgressColor(agent.progress)}`}
                  style={{ width: `${agent.progress}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm">
                View Logs
              </button>
              <button className="flex-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm text-blue-700">
                Assign Task
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Command Center */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-yellow-500" />
          Command Center
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border-2 border-green-200 transition-colors">
            <GitBranch className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <span className="text-sm font-medium">Deploy to Staging</span>
          </button>
          
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border-2 border-blue-200 transition-colors">
            <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <span className="text-sm font-medium">Sync All Agents</span>
          </button>
          
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border-2 border-purple-200 transition-colors">
            <Cpu className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <span className="text-sm font-medium">Run Integration Tests</span>
          </button>
        </div>
      </div>

      {/* Sprint Progress */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Week 1 Sprint Progress</h2>
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="w-32 text-sm">Day 1 (Today)</span>
            <div className="flex-1 bg-gray-200 rounded-full h-4 ml-4">
              <div className="bg-blue-500 h-4 rounded-full" style={{ width: '60%' }} />
            </div>
            <span className="ml-4 text-sm font-medium">60%</span>
          </div>
          <div className="flex items-center">
            <span className="w-32 text-sm">Day 2</span>
            <div className="flex-1 bg-gray-200 rounded-full h-4 ml-4">
              <div className="bg-gray-400 h-4 rounded-full" style={{ width: '0%' }} />
            </div>
            <span className="ml-4 text-sm font-medium">0%</span>
          </div>
          <div className="flex items-center">
            <span className="w-32 text-sm">Day 3</span>
            <div className="flex-1 bg-gray-200 rounded-full h-4 ml-4">
              <div className="bg-gray-400 h-4 rounded-full" style={{ width: '0%' }} />
            </div>
            <span className="ml-4 text-sm font-medium">0%</span>
          </div>
        </div>
      </div>
    </div>
  );
};