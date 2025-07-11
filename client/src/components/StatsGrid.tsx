import { DashboardStats } from "@shared/schema";
import { Send, CheckCircle, Clock, Gauge } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsGridProps {
  stats?: DashboardStats;
  isLoading: boolean;
}

export default function StatsGrid({ stats, isLoading }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Emails Sent Today</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.emailsSentToday?.toLocaleString() || '0'}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Send className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-emerald-600 font-medium">+12.5%</span>
          <span className="text-gray-500 ml-2">vs yesterday</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Success Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.successRate || 0}%
            </p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="text-emerald-500" size={24} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-emerald-600 font-medium">+0.3%</span>
          <span className="text-gray-500 ml-2">vs last week</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Queue Size</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.queueSize || 0}
            </p>
          </div>
          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
            <Clock className="text-amber-500" size={24} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-gray-500">Processing time:</span>
          <span className="text-gray-900 font-medium ml-1">~2.3s</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Rate Limit</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.rateLimitUsage || 0}%
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Gauge className="text-purple-500" size={24} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-gray-500">Resets in:</span>
          <span className="text-gray-900 font-medium ml-1">23m 15s</span>
        </div>
      </div>
    </div>
  );
}
