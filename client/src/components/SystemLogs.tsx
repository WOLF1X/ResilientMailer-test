import { useQuery } from "@tanstack/react-query";
import { EmailLog } from "@shared/schema";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

export default function SystemLogs() {
  const { data: logs, isLoading } = useQuery<EmailLog[]>({
    queryKey: ["/api/logs/recent"],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time feel
  });

  const getLevelBadge = (level: string) => {
    const levelColors = {
      info: 'bg-blue-900 text-blue-200',
      success: 'bg-emerald-900 text-emerald-200',
      warn: 'bg-amber-900 text-amber-200',
      error: 'bg-red-900 text-red-200',
    };
    
    return levelColors[level as keyof typeof levelColors] || levelColors.info;
  };

  const formatTimestamp = (timestamp: Date | string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">System Logs</h3>
          <div className="flex items-center space-x-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm space-y-2 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full bg-gray-700" />
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={`${log.id}-${index}`} className="flex items-start space-x-4 text-gray-300">
                <span className="text-gray-500 text-xs whitespace-nowrap">
                  {formatTimestamp(log.timestamp)}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs uppercase ${getLevelBadge(log.level)}`}>
                  {log.level}
                </span>
                <span className="flex-1">{log.message}</span>
              </div>
            ))
          ) : (
            <div className="text-gray-400 text-center py-4">
              No logs available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
