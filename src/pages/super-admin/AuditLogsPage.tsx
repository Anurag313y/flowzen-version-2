import { useSuperAdminStore } from '@/store/superAdminStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Activity, Building2, HeadphonesIcon, Settings } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const { activityLogs } = useSuperAdminStore();

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'client':
        return <Building2 className="h-4 w-4 text-primary" />;
      case 'complaint':
        return <HeadphonesIcon className="h-4 w-4 text-warning" />;
      default:
        return <Settings className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('deleted') || action.includes('suspended')) {
      return 'text-destructive';
    }
    if (action.includes('resumed') || action.includes('renewed') || action.includes('added')) {
      return 'text-success';
    }
    return 'text-foreground';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">Track all administrative actions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Activity History</CardTitle>
          </div>
          <CardDescription>Complete log of all actions performed in the system</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Log ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No activity logs yet
                    </TableCell>
                  </TableRow>
                ) : (
                  activityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{log.id}</TableCell>
                      <TableCell className={getActionColor(log.action)}>
                        {log.action}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTargetIcon(log.targetType)}
                          <div>
                            <p className="font-medium">{log.targetName || '-'}</p>
                            <p className="text-xs text-muted-foreground">{log.targetId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{log.performedBy}</TableCell>
                      <TableCell>
                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ipAddress || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
