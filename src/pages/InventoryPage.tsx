import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  AlertTriangle,
  Package,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  expiryDate?: string;
  lastUpdated: string;
  unitPrice: number;
}

const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Basmati Rice', category: 'Grains', unit: 'kg', currentStock: 45, minStock: 20, maxStock: 100, lastUpdated: '2024-01-20', unitPrice: 85 },
  { id: '2', name: 'Chicken Breast', category: 'Meat', unit: 'kg', currentStock: 12, minStock: 15, maxStock: 50, expiryDate: '2024-01-25', lastUpdated: '2024-01-20', unitPrice: 280 },
  { id: '3', name: 'Onions', category: 'Vegetables', unit: 'kg', currentStock: 35, minStock: 20, maxStock: 60, lastUpdated: '2024-01-19', unitPrice: 35 },
  { id: '4', name: 'Tomatoes', category: 'Vegetables', unit: 'kg', currentStock: 8, minStock: 15, maxStock: 40, expiryDate: '2024-01-24', lastUpdated: '2024-01-20', unitPrice: 45 },
  { id: '5', name: 'Cooking Oil', category: 'Oils', unit: 'ltr', currentStock: 25, minStock: 10, maxStock: 40, lastUpdated: '2024-01-18', unitPrice: 165 },
  { id: '6', name: 'Paneer', category: 'Dairy', unit: 'kg', currentStock: 6, minStock: 8, maxStock: 25, expiryDate: '2024-01-23', lastUpdated: '2024-01-20', unitPrice: 320 },
  { id: '7', name: 'Garam Masala', category: 'Spices', unit: 'kg', currentStock: 3, minStock: 2, maxStock: 10, lastUpdated: '2024-01-15', unitPrice: 450 },
  { id: '8', name: 'Fresh Cream', category: 'Dairy', unit: 'ltr', currentStock: 4, minStock: 5, maxStock: 15, expiryDate: '2024-01-22', lastUpdated: '2024-01-20', unitPrice: 220 },
  { id: '9', name: 'Butter', category: 'Dairy', unit: 'kg', currentStock: 8, minStock: 5, maxStock: 20, expiryDate: '2024-01-28', lastUpdated: '2024-01-19', unitPrice: 480 },
  { id: '10', name: 'Mutton', category: 'Meat', unit: 'kg', currentStock: 5, minStock: 10, maxStock: 30, expiryDate: '2024-01-24', lastUpdated: '2024-01-20', unitPrice: 650 },
];

const categories = ['All', 'Grains', 'Meat', 'Vegetables', 'Oils', 'Dairy', 'Spices'];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('all');

  const filteredInventory = mockInventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const isLowStock = item.currentStock < item.minStock;
    const matchesStock = stockFilter === 'all' || 
      (stockFilter === 'low' && isLowStock) ||
      (stockFilter === 'normal' && !isLowStock);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const lowStockCount = mockInventory.filter(i => i.currentStock < i.minStock).length;
  const expiringCount = mockInventory.filter(i => {
    if (!i.expiryDate) return false;
    const expiry = new Date(i.expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }).length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStockLevel = (current: number, min: number, max: number) => {
    return (current / max) * 100;
  };

  const getStockColor = (current: number, min: number) => {
    if (current < min) return 'bg-destructive';
    if (current < min * 1.5) return 'bg-warning';
    return 'bg-success';
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Raw materials and stock management
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{mockInventory.length}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(lowStockCount > 0 && "border-destructive/50")}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-destructive/10">
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
              <div className="text-sm text-muted-foreground">Low Stock</div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(expiringCount > 0 && "border-warning/50")}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">{expiringCount}</div>
              <div className="text-sm text-muted-foreground">Expiring Soon</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-success/10">
              <Calendar className="h-5 w-5 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold">FIFO</div>
              <div className="text-sm text-muted-foreground">Stock Method</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
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
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Stock Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="normal">Normal Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Current / Min</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const isLow = item.currentStock < item.minStock;
                const expiringSoon = isExpiringSoon(item.expiryDate);

                return (
                  <TableRow key={item.id} className={cn(isLow && "bg-destructive/5")}>
                    <TableCell>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground">per {item.unit}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="w-40">
                      <Progress 
                        value={getStockLevel(item.currentStock, item.minStock, item.maxStock)} 
                        className={cn("h-2", getStockColor(item.currentStock, item.minStock))}
                      />
                    </TableCell>
                    <TableCell>
                      <span className={cn("font-mono", isLow && "text-destructive font-semibold")}>
                        {item.currentStock}
                      </span>
                      <span className="text-muted-foreground"> / {item.minStock} {item.unit}</span>
                    </TableCell>
                    <TableCell className="font-mono">{formatPrice(item.unitPrice)}</TableCell>
                    <TableCell>
                      {item.expiryDate ? (
                        <Badge 
                          variant="outline" 
                          className={cn(expiringSoon && "text-warning border-warning/30 bg-warning/10")}
                        >
                          {item.expiryDate}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.lastUpdated}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
