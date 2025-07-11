import { Mail, BarChart3, Send, List, Server, Settings, TrendingUp } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Mail className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">EmailService</h1>
            <p className="text-sm text-gray-500">v2.1.0</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        <a 
          href="#" 
          className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium"
        >
          <BarChart3 size={20} />
          <span>Dashboard</span>
        </a>
        <a 
          href="#" 
          className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Send size={20} />
          <span>Send Email</span>
        </a>
        <a 
          href="#" 
          className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <List size={20} />
          <span>Email Queue</span>
        </a>
        <a 
          href="#" 
          className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Server size={20} />
          <span>Providers</span>
        </a>
        <a 
          href="#" 
          className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <TrendingUp size={20} />
          <span>Analytics</span>
        </a>
        <a 
          href="#" 
          className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Settings size={20} />
          <span>Settings</span>
        </a>
      </nav>
    </div>
  );
}
