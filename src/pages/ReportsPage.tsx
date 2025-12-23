import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  FileDown,
  Calendar,
  Utensils,
  Bed,
  CreditCard,
  Clock,
  Package,
  UserCheck,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// POS Report Data
const salesData = [
  { day: 'Mon', revenue: 12500, orders: 45 },
  { day: 'Tue', revenue: 15800, orders: 52 },
  { day: 'Wed', revenue: 14200, orders: 48 },
  { day: 'Thu', revenue: 18500, orders: 62 },
  { day: 'Fri', revenue: 22000, orders: 78 },
  { day: 'Sat', revenue: 28500, orders: 95 },
  { day: 'Sun', revenue: 24800, orders: 82 },
];

const categoryData = [
  { name: 'Main Course', value: 35, color: 'hsl(220, 60%, 50%)' },
  { name: 'Starters', value: 25, color: 'hsl(160, 50%, 40%)' },
  { name: 'Beverages', value: 20, color: 'hsl(45, 100%, 48%)' },
  { name: 'Desserts', value: 12, color: 'hsl(280, 50%, 50%)' },
  { name: 'Breads', value: 8, color: 'hsl(6, 63%, 50%)' },
];

const hourlyData = [
  { hour: '10AM', revenue: 2500 },
  { hour: '11AM', revenue: 4200 },
  { hour: '12PM', revenue: 8500 },
  { hour: '1PM', revenue: 12000 },
  { hour: '2PM', revenue: 6800 },
  { hour: '3PM', revenue: 3500 },
  { hour: '4PM', revenue: 2800 },
  { hour: '5PM', revenue: 4500 },
  { hour: '6PM', revenue: 7200 },
  { hour: '7PM', revenue: 15500 },
  { hour: '8PM', revenue: 18200 },
  { hour: '9PM', revenue: 14800 },
  { hour: '10PM', revenue: 8500 },
];

const paymentMethodData = [
  { method: 'Cash', percentage: 45, amount: 61335 },
  { method: 'UPI', percentage: 35, amount: 47705 },
  { method: 'Card', percentage: 18, amount: 24534 },
  { method: 'Other', percentage: 2, amount: 2726 },
];

const itemWiseData = [
  { name: 'Butter Chicken', quantity: 156, revenue: 65520 },
  { name: 'Chicken Biryani', quantity: 142, revenue: 53960 },
  { name: 'Paneer Butter Masala', quantity: 128, revenue: 43520 },
  { name: 'Dal Makhani', quantity: 115, revenue: 32200 },
  { name: 'Garlic Naan', quantity: 324, revenue: 25920 },
  { name: 'Tandoori Chicken', quantity: 98, revenue: 44100 },
  { name: 'Veg Biryani', quantity: 86, revenue: 25800 },
  { name: 'Chicken Tikka', quantity: 112, revenue: 39200 },
];

const staffPerformanceData = [
  { name: 'John', orders: 145, revenue: 42500, avgOrder: 293 },
  { name: 'Sarah', orders: 132, revenue: 38900, avgOrder: 295 },
  { name: 'Mike', orders: 118, revenue: 34200, avgOrder: 290 },
  { name: 'Lisa', orders: 98, revenue: 28500, avgOrder: 291 },
];

const taxData = [
  { month: 'Jan', cgst: 12500, sgst: 12500, total: 25000 },
  { month: 'Feb', cgst: 14200, sgst: 14200, total: 28400 },
  { month: 'Mar', cgst: 16800, sgst: 16800, total: 33600 },
  { month: 'Apr', cgst: 15500, sgst: 15500, total: 31000 },
];

// PMS Report Data
const occupancyData = [
  { month: 'Jan', occupancy: 72, adr: 4500, revpar: 3240 },
  { month: 'Feb', occupancy: 78, adr: 4800, revpar: 3744 },
  { month: 'Mar', occupancy: 85, adr: 5200, revpar: 4420 },
  { month: 'Apr', occupancy: 68, adr: 4200, revpar: 2856 },
  { month: 'May', occupancy: 62, adr: 3800, revpar: 2356 },
  { month: 'Jun', occupancy: 75, adr: 4600, revpar: 3450 },
];

const roomTypeData = [
  { type: 'Standard', bookings: 245, revenue: 1102500, color: 'hsl(220, 60%, 50%)' },
  { type: 'Deluxe', bookings: 156, revenue: 936000, color: 'hsl(160, 50%, 40%)' },
  { type: 'Suite', bookings: 68, revenue: 612000, color: 'hsl(45, 100%, 48%)' },
  { type: 'Premium Suite', bookings: 24, revenue: 360000, color: 'hsl(280, 50%, 50%)' },
];

const guestSourceData = [
  { source: 'Direct', percentage: 35, bookings: 172 },
  { source: 'OTA (MakeMyTrip)', percentage: 28, bookings: 138 },
  { source: 'OTA (Booking.com)', percentage: 22, bookings: 108 },
  { source: 'Travel Agents', percentage: 10, bookings: 49 },
  { source: 'Corporate', percentage: 5, bookings: 26 },
];

const revenueByServiceData = [
  { service: 'Room Revenue', amount: 3010500, percentage: 68 },
  { service: 'F&B Revenue', amount: 884500, percentage: 20 },
  { service: 'Spa & Wellness', amount: 221000, percentage: 5 },
  { service: 'Other Services', amount: 309000, percentage: 7 },
];

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
}

function StatCard({ title, value, change, icon: Icon }: StatCardProps) {
  const isPositive = change > 0;
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1 font-mono">{value}</p>
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
              <span className="text-sm text-muted-foreground">vs last period</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function POSReports({ dateRange }: { dateRange: string }) {
  const [reportType, setReportType] = useState('sales');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value="₹1,36,300" change={12.5} icon={DollarSign} />
        <StatCard title="Total Orders" value="462" change={8.2} icon={ShoppingCart} />
        <StatCard title="Avg Order Value" value="₹295" change={4.1} icon={TrendingUp} />
        <StatCard title="Customers Served" value="385" change={-2.3} icon={Users} />
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'sales', label: 'Sales Report' },
          { id: 'items', label: 'Item-wise' },
          { id: 'payment', label: 'Payment Methods' },
          { id: 'hourly', label: 'Hourly Analysis' },
          { id: 'staff', label: 'Staff Performance' },
          { id: 'tax', label: 'Tax Report' },
        ].map((type) => (
          <Button
            key={type.id}
            variant={reportType === type.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setReportType(type.id)}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Report Content */}
      {reportType === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value">
                      {categoryData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {categoryData.map((cat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm">{cat.name}</span>
                      </div>
                      <span className="font-mono text-sm">{cat.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'items' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {itemWiseData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">{index + 1}</span>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} sold</p>
                    </div>
                  </div>
                  <span className="font-mono text-lg font-semibold">₹{item.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'payment' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethodData.map((payment, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{payment.method}</span>
                    <div className="text-right">
                      <span className="font-mono">₹{payment.amount.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground ml-2">({payment.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${payment.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'hourly' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hourly Sales Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hour" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {reportType === 'staff' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Staff Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staffPerformanceData.map((staff, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">{staff.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold">₹{staff.revenue.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Avg: ₹{staff.avgOrder}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'tax' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tax Collection Report</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taxData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`]}
                />
                <Bar dataKey="cgst" name="CGST" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sgst" name="SGST" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PMSReports({ dateRange }: { dateRange: string }) {
  const [reportType, setReportType] = useState('occupancy');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg Occupancy" value="73%" change={5.2} icon={Bed} />
        <StatCard title="Total Revenue" value="₹44,25,000" change={12.8} icon={DollarSign} />
        <StatCard title="ADR" value="₹4,550" change={3.5} icon={TrendingUp} />
        <StatCard title="Total Bookings" value="493" change={8.1} icon={UserCheck} />
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'occupancy', label: 'Occupancy Report' },
          { id: 'revenue', label: 'Revenue Report' },
          { id: 'rooms', label: 'Room Type Analysis' },
          { id: 'source', label: 'Booking Source' },
          { id: 'services', label: 'Service Revenue' },
        ].map((type) => (
          <Button
            key={type.id}
            variant={reportType === type.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setReportType(type.id)}
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Report Content */}
      {reportType === 'occupancy' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Occupancy & RevPAR</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-muted-foreground" />
                <YAxis yAxisId="left" className="text-muted-foreground" />
                <YAxis yAxisId="right" orientation="right" className="text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="occupancy" name="Occupancy %" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="revpar" name="RevPAR" stroke="hsl(var(--success))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {reportType === 'revenue' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue Breakdown by Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByServiceData.map((service, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{service.service}</span>
                    <div className="text-right">
                      <span className="font-mono font-semibold">₹{service.amount.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground ml-2">({service.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: `${service.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'rooms' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bookings by Room Type</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={roomTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="bookings">
                    {roomTypeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} bookings`]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue by Room Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roomTypeData.map((room, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: room.color }} />
                      <div>
                        <p className="font-medium">{room.type}</p>
                        <p className="text-sm text-muted-foreground">{room.bookings} bookings</p>
                      </div>
                    </div>
                    <span className="font-mono font-semibold">₹{room.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'source' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Booking Source Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {guestSourceData.map((source, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{source.source}</span>
                    <div className="text-right">
                      <span className="font-mono">{source.bookings} bookings</span>
                      <span className="text-sm text-muted-foreground ml-2">({source.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${source.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'services' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Additional Services Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByServiceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" className="text-muted-foreground" />
                <YAxis type="category" dataKey="service" className="text-muted-foreground" width={120} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`]}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('week');

  const handleExport = () => {
    toast.success('Report exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive business insights and analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <FileDown className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="pos" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pos" className="gap-2">
            <Utensils className="h-4 w-4" />
            Restaurant POS
          </TabsTrigger>
          <TabsTrigger value="pms" className="gap-2">
            <Bed className="h-4 w-4" />
            Hotel PMS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pos">
          <POSReports dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="pms">
          <PMSReports dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
