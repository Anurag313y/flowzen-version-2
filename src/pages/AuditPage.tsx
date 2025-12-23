import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Search,
  Filter,
  Lock,
  FileText,
  CreditCard,
  User,
  Settings,
  AlertTriangle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  category: 'order' | 'payment' | 'void' | 'settings' | 'inventory' | 'user';
  details: string;
  severity: 'info' | 'warning' | 'critical';
  deviceId: string;
}

const mockAuditLogs: AuditLog[] = [
  { id: '1', timestamp: '2024-01-22 14:32:15', user: 'John Manager', role: 'Manager', action: 'Void Approved', category: 'void', details: 'Approved void for ORD-2212-0045 - Reason: Customer complaint', severity: 'critical', deviceId: 'POS-001' },
  { id: '2', timestamp: '2024-01-22 14:28:42', user: 'Sarah Cashier', role: 'Cashier', action: 'Payment Received', category: 'payment', details: 'Cash payment ₹1,850 for ORD-2212-0044', severity: 'info', deviceId: 'POS-002' },
  { id: '3', timestamp: '2024-01-22 14:15:33', user: 'Mike Kitchen', role: 'Kitchen', action: 'KOT Printed', category: 'order', details: 'KOT generated for Table 8 - 4 items', severity: 'info', deviceId: 'KDS-001' },
  { id: '4', timestamp: '2024-01-22 14:10:22', user: 'John Manager', role: 'Manager', action: 'NC Bill Created', category: 'void', details: 'No-charge bill ORD-2212-0040 - Reason: Manager hospitality', severity: 'warning', deviceId: 'POS-001' },
  { id: '5', timestamp: '2024-01-22 13:55:18', user: 'Admin', role: 'Admin', action: 'Price Updated', category: 'settings', details: 'Butter Chicken price changed from ₹380 to ₹420', severity: 'warning', deviceId: 'ADMIN-001' },
  { id: '6', timestamp: '2024-01-22 13:45:10', user: 'Sarah Cashier', role: 'Cashier', action: 'Discount Applied', category: 'order', details: '10% discount on ORD-2212-0042 - Approved by Manager', severity: 'info', deviceId: 'POS-002' },
  { id: '7', timestamp: '2024-01-22 13:30:05', user: 'Store Manager', role: 'Manager', action: 'Stock Adjusted', category: 'inventory', details: 'Chicken Breast stock adjusted -5kg - Reason: Spoilage', severity: 'warning', deviceId: 'INV-001' },
  { id: '8', timestamp: '2024-01-22 13:15:00', user: 'John Manager', role: 'Manager', action: 'Shift Opened', category: 'settings', details: 'Shift #2 opened with ₹5,000 cash', severity: 'info', deviceId: 'POS-001' },
  { id: '9', timestamp: '2024-01-22 13:00:00', user: 'System', role: 'System', action: 'Day Started', category: 'settings', details: 'Business day 2024-01-22 initialized', severity: 'info', deviceId: 'SYSTEM' },
  { id: '10', timestamp: '2024-01-22 12:58:30', user: 'Admin', role: 'Admin', action: 'User Login', category: 'user', details: 'Admin logged in from IP 192.168.1.100', severity: 'info', deviceId: 'ADMIN-001' },
];

const categoryConfig = {
  order: { icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
  payment: { icon: CreditCard, color: 'text-success', bg: 'bg-success/10' },
  void: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
  settings: { icon: Settings, color: 'text-muted-foreground', bg: 'bg-muted' },
  inventory: { icon: RefreshCw, color: 'text-warning', bg: 'bg-warning/10' },
  user: { icon: User, color: 'text-primary', bg: 'bg-primary/10' },
};

const severityConfig = {
  info: { color: 'text-muted-foreground', border: 'border-muted' },
  warning: { color: 'text-warning', border: 'border-warning/30' },
  critical: { color: 'text-destructive', border: 'border-destructive/30' },
};

export default function AuditPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter;
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesCategory && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Audit Logs</h1>
            <p className="text-sm text-muted-foreground">
              Immutable record of all system activities
            </p>
          </div>
        </div>
        <Badge variant="outline" className="font-mono">
          Read-Only
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="order">Orders</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="void">Voids/NC</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="user">User Activity</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-1">
              {filteredLogs.map((log, index) => {
                const category = categoryConfig[log.category];
                const severity = severityConfig[log.severity];
                const CategoryIcon = category.icon;

                return (
                  <div
                    key={log.id}
                    className={cn(
                      "relative pl-8 pb-6 border-l-2 border-border last:border-l-0 last:pb-0",
                      log.severity === 'critical' && "border-l-destructive/50"
                    )}
                  >
                    {/* Timeline Dot */}
                    <div className={cn(
                      "absolute left-[-9px] p-1.5 rounded-full",
                      category.bg
                    )}>
                      <CategoryIcon className={cn("h-3.5 w-3.5", category.color)} />
                    </div>

                    {/* Content */}
                    <div className="ml-4">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{log.action}</span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs", severity.color, severity.border)}
                          >
                            {log.severity}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.timestamp}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {log.details}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {log.user} ({log.role})
                        </span>
                        <span className="font-mono">{log.deviceId}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Footer Notice */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Audit logs are immutable and cannot be modified or deleted. All entries are timestamped and cryptographically signed.</span>
      </div>
    </div>
  );
}
