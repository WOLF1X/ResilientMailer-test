import { ProviderStatus as IProviderStatus } from "@shared/schema";
import { Mail, MoreVertical, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProviderStatusProps {
  providers?: IProviderStatus[];
  isLoading: boolean;
  circuitBreakerStatus: string;
}

export default function ProviderStatus({ providers, isLoading, circuitBreakerStatus }: ProviderStatusProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Provider Status</h3>
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Provider Status</h3>
      
      <div className="space-y-4">
        {providers?.map((provider, index) => (
          <div key={provider.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                index === 0 ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                <Mail className={index === 0 ? 'text-blue-500' : 'text-purple-500'} size={20} />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{provider.name}</h4>
                <p className="text-sm text-gray-500">{provider.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-emerald-600">{provider.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{provider.latency}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{provider.successRate}</p>
                <p className="text-xs text-gray-500">Success</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Circuit Breaker Status */}
      <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <Shield className="text-emerald-600" size={16} />
            </div>
            <div>
              <h4 className="font-medium text-emerald-900">Circuit Breaker</h4>
              <p className="text-sm text-emerald-700">All systems operational</p>
            </div>
          </div>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
            circuitBreakerStatus === 'CLOSED' 
              ? 'bg-emerald-100 text-emerald-800'
              : circuitBreakerStatus === 'OPEN'
              ? 'bg-red-100 text-red-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {circuitBreakerStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
