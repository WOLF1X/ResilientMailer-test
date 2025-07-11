import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import StatsGrid from "@/components/StatsGrid";
import SendEmailForm from "@/components/SendEmailForm";
import ProviderStatus from "@/components/ProviderStatus";
import EmailHistory from "@/components/EmailHistory";
import SystemLogs from "@/components/SystemLogs";
import { DashboardStats, ProviderStatus as IProviderStatus } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: providers, isLoading: providersLoading } = useQuery<IProviderStatus[]>({
    queryKey: ["/api/providers/status"],
    refetchInterval: 30000,
  });

  const { data: circuitBreaker } = useQuery<{ status: string }>({
    queryKey: ["/api/circuit-breaker/status"],
    refetchInterval: 10000,
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Email Service Dashboard</h2>
              <p className="text-gray-500 mt-1">Monitor and manage your resilient email sending service</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-600">Operational</span>
              </div>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-sync-alt mr-2"></i>
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <StatsGrid stats={stats} isLoading={statsLoading} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <SendEmailForm />
            </div>
            <div className="lg:col-span-2">
              <ProviderStatus 
                providers={providers} 
                isLoading={providersLoading}
                circuitBreakerStatus={circuitBreaker?.status || 'CLOSED'}
              />
            </div>
          </div>

          <EmailHistory />
          <SystemLogs />
        </main>
      </div>
    </div>
  );
}
