import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Utensils,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Bed,
  CalendarCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

function StatCard({ title, value, change, changeLabel, icon: Icon, variant = 'default' }: StatCardProps) {
  const isPositive = change && change > 0;
  
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1 font-mono">{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  isPositive ? "text-success" : "text-destructive"
                )}>
                  {isPositive ? '+' : ''}{change}%
                </span>
                <span className="text-sm text-muted-foreground">{changeLabel}</span>
              </div>
            )}
          </div>
          <div className={cn(
            "p-3 rounded-xl",
            variant === 'success' && "bg-success/10 text-success",
            variant === 'warning' && "bg-warning/10 text-warning",
            variant === 'destructive' && "bg-destructive/10 text-destructive",
            variant === 'default' && "bg-primary/10 text-primary"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

function QuickAction({ title, description, href, icon: Icon }: QuickActionProps) {
  return (
    <Link to={href}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer group border-0 shadow-sm">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </CardContent>
      </Card>
    </Link>
  );
}

interface RecentOrderProps {
  orderNumber: string;
  table: string;
  amount: number;
  status: 'pending' | 'in-progress' | 'completed';
  time: string;
}

function RecentOrder({ orderNumber, table, amount, status, time }: RecentOrderProps) {
  const statusConfig = {
    'pending': { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' },
    'in-progress': { icon: AlertCircle, color: 'text-sky-600', bg: 'bg-sky-50', label: 'In Progress' },
    'completed': { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Completed' },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", config.bg)}>
          <StatusIcon className={cn("h-4 w-4", config.color)} />
        </div>
        <div>
          <p className="font-medium text-sm">{orderNumber}</p>
          <p className="text-xs text-muted-foreground">{table} • {time}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono font-medium">₹{amount.toLocaleString()}</p>
        <Badge variant="outline" className="text-xs">{config.label}</Badge>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your restaurant and hotel operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono bg-success/10 text-success border-success/30">
            Shift #2 • Open
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value="₹45,230"
          change={12.5}
          changeLabel="vs yesterday"
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="Orders Today"
          value="68"
          change={8.2}
          changeLabel="vs yesterday"
          icon={ShoppingCart}
        />
        <StatCard
          title="Room Occupancy"
          value="78%"
          change={-2.3}
          changeLabel="vs last week"
          icon={Bed}
          variant="warning"
        />
        <StatCard
          title="Active Tables"
          value="12/24"
          icon={Utensils}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <RecentOrder
                orderNumber="ORD-2212-0045"
                table="Table 5"
                amount={1850}
                status="in-progress"
                time="5 min ago"
              />
              <RecentOrder
                orderNumber="ORD-2212-0044"
                table="Table 12"
                amount={2340}
                status="pending"
                time="12 min ago"
              />
              <RecentOrder
                orderNumber="ORD-2212-0043"
                table="Takeaway"
                amount={680}
                status="completed"
                time="25 min ago"
              />
              <RecentOrder
                orderNumber="ORD-2212-0042"
                table="Table 3"
                amount={4520}
                status="completed"
                time="45 min ago"
              />
              <RecentOrder
                orderNumber="ORD-2212-0041"
                table="Table 8"
                amount={1200}
                status="completed"
                time="1 hr ago"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Quick Actions</h3>
          <div className="space-y-3">
            <QuickAction
              title="New Order"
              description="Start a new POS order"
              href="/pos"
              icon={ShoppingCart}
            />
            <QuickAction
              title="Kitchen Display"
              description="View KOT orders"
              href="/kitchen"
              icon={Utensils}
            />
            <QuickAction
              title="View Reports"
              description="Sales & analytics"
              href="/reports"
              icon={TrendingUp}
            />
            <QuickAction
              title="Manage Inventory"
              description="Stock & supplies"
              href="/inventory"
              icon={Utensils}
            />
          </div>
        </div>
      </div>

      {/* Hotel Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Status */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Room Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-emerald-50 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600">18</p>
                <p className="text-sm text-muted-foreground">Occupied</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-xl">
                <p className="text-2xl font-bold text-amber-600">3</p>
                <p className="text-sm text-muted-foreground">Checkout</p>
              </div>
              <div className="text-center p-4 bg-sky-50 rounded-xl">
                <p className="text-2xl font-bold text-sky-600">2</p>
                <p className="text-sm text-muted-foreground">Cleaning</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Arrivals */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Today's Arrivals</CardTitle>
            <Badge className="bg-primary/10 text-primary border-0">4 Expected</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'John Smith', room: '304', time: '2:00 PM', status: 'confirmed' },
                { name: 'Sarah Johnson', room: '512', time: '3:30 PM', status: 'confirmed' },
                { name: 'Mike Chen', room: '201', time: '5:00 PM', status: 'pending' },
                { name: 'Emily Davis', room: '408', time: '6:00 PM', status: 'confirmed' },
              ].map((arrival, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{arrival.name}</p>
                      <p className="text-xs text-muted-foreground">Room {arrival.room}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{arrival.time}</p>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs",
                        arrival.status === 'confirmed' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-amber-600 border-amber-200 bg-amber-50'
                      )}
                    >
                      {arrival.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
