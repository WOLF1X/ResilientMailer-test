import { useQuery } from "@tanstack/react-query";
import { Email } from "@shared/schema";
import { Check, Clock, Eye, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmailHistory() {
  const { data: emails, isLoading } = useQuery<Email[]>({
    queryKey: ["/api/emails/recent"],
    refetchInterval: 30000,
  });

  const getStatusBadge = (status: string) => {
    if (status === 'sent') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          <Check className="w-3 h-3 mr-1" />
          Delivered
        </span>
      );
    } else if (status.startsWith('retry')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3 mr-1" />
          {status}
        </span>
      );
    } else if (status === 'failed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Failed
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {status}
        </span>
      );
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Recent Email Activity</h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Filter size={16} />
            </Button>
            <Button variant="ghost" size="sm">
              <Download size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Email ID</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                  <td className="py-4 px-6"><Skeleton className="h-4 w-32" /></td>
                  <td className="py-4 px-6"><Skeleton className="h-4 w-40" /></td>
                  <td className="py-4 px-6"><Skeleton className="h-4 w-24" /></td>
                  <td className="py-4 px-6"><Skeleton className="h-6 w-20" /></td>
                  <td className="py-4 px-6"><Skeleton className="h-4 w-20" /></td>
                  <td className="py-4 px-6"><Skeleton className="h-4 w-12" /></td>
                </tr>
              ))
            ) : emails && emails.length > 0 ? (
              emails.map((email) => (
                <tr key={email.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-mono text-gray-900">
                    {email.id.substring(0, 12)}...
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">{email.recipient}</td>
                  <td className="py-4 px-6 text-sm text-gray-900">{email.subject}</td>
                  <td className="py-4 px-6 text-sm text-gray-600">{email.provider || '-'}</td>
                  <td className="py-4 px-6">
                    {getStatusBadge(email.status)}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {formatTimestamp(email.createdAt)}
                  </td>
                  <td className="py-4 px-6">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                      <Eye size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 px-6 text-center text-gray-500">
                  No emails found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {emails && emails.length > 0 && (
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Showing {emails.length} of recent emails</p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
