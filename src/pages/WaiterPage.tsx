import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore, generateOrderNumber, type KOTOrder, type TableOrder } from '@/store/orderStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { VariantSelectionDialog } from '@/components/pos/VariantSelectionDialog';
import {
  LogOut,
  Plus,
  Minus,
  Trash2,
  ChefHat,
  Clock,
  CheckCircle,
  AlertTriangle,
  Printer,
  Search,
  Users,
  Leaf,
  Drumstick,
  X,
  Home,
  ClipboardList,
  Bell,
} from 'lucide-react';
import type { MenuItem, Order, OrderItem, PriceVariant } from '@/types/pos';

// Mock menu items with variants (same as MenuPanel)
const mockMenuItems: MenuItem[] = [
  { id: '1', name: 'Paneer Tikka', price: 320, categoryId: '1', isAvailable: true, hasModifiers: true, isVeg: true, isFavorite: true, hasVariants: true,
    priceVariants: [
      { id: 'full', name: 'full', label: 'Full', price: 320, takeawayPrice: 300 },
      { id: 'half', name: 'half', label: 'Half', price: 180, takeawayPrice: 170 },
    ]
  },
  { id: '2', name: 'Chicken 65', price: 280, categoryId: '1', isAvailable: true, hasModifiers: false, isVeg: false, isFavorite: true, hasVariants: true,
    priceVariants: [
      { id: 'full', name: 'full', label: 'Full', price: 280 },
      { id: 'half', name: 'half', label: 'Half', price: 160 },
    ]
  },
  { id: '3', name: 'Veg Spring Rolls', price: 180, categoryId: '1', isAvailable: false, hasModifiers: false, isVeg: true },
  { id: '4', name: 'Fish Fry', price: 350, categoryId: '1', isAvailable: true, hasModifiers: true, isVeg: false, hasVariants: true },
  { id: '5', name: 'Butter Chicken', price: 420, categoryId: '2', isAvailable: true, hasModifiers: true, isVeg: false, isFavorite: true, hasVariants: true,
    priceVariants: [
      { id: 'full', name: 'full', label: 'Full', price: 420, takeawayPrice: 400 },
      { id: 'half', name: 'half', label: 'Half', price: 240, takeawayPrice: 230 },
      { id: 'quarter', name: 'quarter', label: 'Quarter', price: 140, takeawayPrice: 130 },
    ]
  },
  { id: '6', name: 'Dal Makhani', price: 280, categoryId: '2', isAvailable: true, hasModifiers: false, isVeg: true, hasVariants: true },
  { id: '7', name: 'Paneer Butter Masala', price: 340, categoryId: '2', isAvailable: true, hasModifiers: false, isVeg: true, hasVariants: true },
  { id: '8', name: 'Chicken Biryani', price: 380, categoryId: '3', isAvailable: true, hasModifiers: true, isVeg: false, isFavorite: true, hasVariants: true,
    priceVariants: [
      { id: 'full', name: 'full', label: 'Full', price: 380 },
      { id: 'half', name: 'half', label: 'Half', price: 220 },
    ]
  },
  { id: '9', name: 'Mutton Biryani', price: 480, categoryId: '3', isAvailable: true, hasModifiers: true, isVeg: false, hasVariants: true },
  { id: '10', name: 'Veg Biryani', price: 280, categoryId: '3', isAvailable: true, hasModifiers: false, isVeg: true, hasVariants: true },
  { id: '11', name: 'Butter Naan', price: 60, categoryId: '4', isAvailable: true, hasModifiers: false, isVeg: true },
  { id: '12', name: 'Garlic Naan', price: 80, categoryId: '4', isAvailable: true, hasModifiers: false, isVeg: true },
  { id: '13', name: 'Fresh Lime Soda', price: 80, categoryId: '5', isAvailable: true, hasModifiers: true, isVeg: true },
  { id: '14', name: 'Mango Lassi', price: 120, categoryId: '5', isAvailable: true, hasModifiers: false, isVeg: true },
];

const categories = [
  { id: 'all', name: 'All' },
  { id: '1', name: 'Starters' },
  { id: '2', name: 'Main Course' },
  { id: '3', name: 'Biryani' },
  { id: '4', name: 'Breads' },
  { id: '5', name: 'Beverages' },
];

type View = 'tables' | 'order' | 'kot-status';

export default function WaiterPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { tables, kotOrders, assignOrderToTable, addKOTOrder, updateKOTItemStatus } = useOrderStore();
  const { deductForMenuItem, canOrderMenuItem, getLowStockItems, getCriticalStockItems } = useInventoryStore();

  const [view, setView] = useState<View>('tables');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [customerName, setCustomerName] = useState('');
  const [covers, setCovers] = useState(2);
  
  // Variant selection state
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  const lowStockItems = getLowStockItems();
  const criticalStockItems = getCriticalStockItems();

  // Remove dark theme - use balanced light/dark design
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTableSelect = (tableNumber: string) => {
    setSelectedTable(tableNumber);
    setOrderItems([]);
    setCustomerName('');
    setCovers(2);
    setView('order');
  };

  const filteredItems = mockMenuItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch = searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.isAvailable;
  });

  // Handle menu item click - show variant dialog if has variants
  const handleMenuItemClick = useCallback((menuItem: MenuItem) => {
    if (menuItem.hasVariants) {
      setSelectedMenuItem(menuItem);
      setVariantDialogOpen(true);
    } else {
      handleAddItemDirect(menuItem, null);
    }
  }, []);

  // Add item directly (for items without variants or after variant selection)
  const handleAddItemDirect = useCallback((menuItem: MenuItem, variant: PriceVariant | null) => {
    // Check inventory
    const stockCheck = canOrderMenuItem(menuItem.id, 1);
    
    if (!stockCheck.canOrder) {
      toast.error(`Cannot add ${menuItem.name}`, {
        description: `Out of stock: ${stockCheck.blockedItems.join(', ')}`,
      });
      return;
    }

    if (stockCheck.lowStockItems.length > 0) {
      toast.warning(`Low stock alert`, {
        description: `${stockCheck.lowStockItems.join(', ')} running low`,
      });
    }

    const price = variant ? variant.price : menuItem.price;
    const itemKey = variant ? `${menuItem.id}-${variant.id}` : menuItem.id;

    setOrderItems((prev) => {
      const existingIndex = prev.findIndex((item) => 
        item.menuItem.id === menuItem.id && 
        item.selectedVariant?.id === variant?.id
      );
      
      if (existingIndex >= 0) {
        return prev.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * price,
              }
            : item
        );
      }
      
      return [
        ...prev,
        {
          id: Date.now().toString(),
          menuItem,
          quantity: 1,
          modifiers: [],
          subtotal: price,
          selectedVariant: variant || undefined,
        },
      ];
    });
  }, [canOrderMenuItem]);

  // Handle variant selection from dialog
  const handleVariantSelect = useCallback((menuItem: MenuItem, variant: PriceVariant) => {
    handleAddItemDirect(menuItem, variant);
  }, [handleAddItemDirect]);

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== itemId) return item;
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return null;
          const price = item.selectedVariant ? item.selectedVariant.price : item.menuItem.price;
          return {
            ...item,
            quantity: newQuantity,
            subtotal: newQuantity * price,
          };
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSaveAndPrintKOT = () => {
    if (!selectedTable || orderItems.length === 0) return;

    // Deduct inventory for all items
    for (const item of orderItems) {
      const result = deductForMenuItem(item.menuItem.id, item.quantity);
      if (!result.success) {
        toast.error(`Inventory error for ${item.menuItem.name}`, {
          description: result.errors.join(', '),
        });
        return;
      }
    }

    const orderNumber = generateOrderNumber();
    const total = calculateTotal();
    const taxAmount = total * 0.05;
    const grandTotal = total + taxAmount;

    // Create KOT Order
    const kotOrder: KOTOrder = {
      id: Date.now().toString(),
      orderNumber,
      table: selectedTable,
      time: 'Just now',
      isRush: false,
      createdAt: new Date(),
      items: orderItems.map((item) => ({
        id: item.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        status: 'pending' as const,
        notes: item.notes,
      })),
      customerName: customerName || undefined,
    };

    addKOTOrder(kotOrder);

    // Assign to table
    const tableOrder: TableOrder = {
      orderNumber,
      guests: covers,
      amount: Math.round(grandTotal),
      startTime: new Date(),
      items: orderItems.map((item) => ({
        id: item.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.subtotal,
      })),
      customerName: customerName || undefined,
    };
    // Pass waiter name to assignOrderToTable
    assignOrderToTable(selectedTable, tableOrder, user?.name);

    toast.success('KOT Saved & Sent to Kitchen', {
      description: `Order ${orderNumber} for ${selectedTable}`,
    });

    // Reset and go back to tables
    setOrderItems([]);
    setSelectedTable(null);
    setCustomerName('');
    setCovers(2);
    setView('tables');
  };

  const getTableStatus = (tableNumber: string) => {
    const table = tables.find((t) => t.number === tableNumber);
    return table?.status || 'available';
  };

  const getTableOrder = (tableNumber: string) => {
    const table = tables.find((t) => t.number === tableNumber);
    return table?.currentOrder;
  };

  // Count ready items for notification
  const readyOrdersCount = kotOrders.reduce((count, order) => {
    const allReady = order.items.every((item) => item.status === 'ready');
    return allReady ? count + 1 : count;
  }, 0);

  const formatPrice = (price: number) => `₹${price}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
            {user?.avatar}
          </div>
          <div>
            <p className="font-medium text-sm text-white">{user?.name}</p>
            <p className="text-xs text-slate-300">Waiter</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-300 hover:text-white hover:bg-slate-700">
          <LogOut className="h-5 w-5" />
        </Button>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200 px-4 py-2 flex gap-2 sticky top-14 z-10 shadow-sm">
        <Button
          variant={view === 'tables' ? 'default' : 'ghost'}
          size="sm"
          className={cn("gap-2", view !== 'tables' && "text-slate-600 hover:text-slate-900")}
          onClick={() => setView('tables')}
        >
          <Home className="h-4 w-4" />
          Tables
        </Button>
        <Button
          variant={view === 'kot-status' ? 'default' : 'ghost'}
          size="sm"
          className={cn("gap-2 relative", view !== 'kot-status' && "text-slate-600 hover:text-slate-900")}
          onClick={() => setView('kot-status')}
        >
          <ClipboardList className="h-4 w-4" />
          KOT Status
          {readyOrdersCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-success text-success-foreground text-xs">
              {readyOrdersCount}
            </Badge>
          )}
        </Button>
      </nav>

      {/* Alerts */}
      {(lowStockItems.length > 0 || criticalStockItems.length > 0) && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-amber-700 font-medium">
              {criticalStockItems.length > 0
                ? `Critical: ${criticalStockItems.map((i) => i.name).join(', ')}`
                : `Low Stock: ${lowStockItems.map((i) => i.name).join(', ')}`}
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Tables View */}
        {view === 'tables' && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-slate-800">Select Table</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {tables.map((table) => {
                const status = table.status;
                const order = table.currentOrder;
                
                return (
                  <button
                    key={table.id}
                    onClick={() => status !== 'reserved' && status !== 'cleaning' && handleTableSelect(table.number)}
                    disabled={status === 'reserved' || status === 'cleaning'}
                    className={cn(
                      "aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all bg-white shadow-sm",
                      status === 'available' && "border-emerald-300 hover:bg-emerald-50 hover:border-emerald-500",
                      status === 'occupied' && "border-amber-300 hover:bg-amber-50 hover:border-amber-500",
                      status === 'reserved' && "border-slate-200 bg-slate-100 cursor-not-allowed opacity-60",
                      status === 'cleaning' && "border-slate-200 bg-slate-100 cursor-not-allowed opacity-60"
                    )}
                  >
                    <span className="text-lg font-bold text-slate-800">{table.number}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {table.capacity}
                    </span>
                    {order && (
                      <span className="text-xs text-amber-600 font-medium mt-1">
                        {formatPrice(order.amount)}
                      </span>
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] mt-1",
                        status === 'available' && "text-emerald-600 border-emerald-300 bg-emerald-50",
                        status === 'occupied' && "text-amber-600 border-amber-300 bg-amber-50",
                        status === 'reserved' && "text-slate-500 bg-slate-100",
                        status === 'cleaning' && "text-slate-500 bg-slate-100"
                      )}
                    >
                      {status}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Order View */}
        {view === 'order' && selectedTable && (
          <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-120px)]">
            {/* Table Info */}
            <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setView('tables')} className="text-slate-500 hover:text-slate-900">
                  <X className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="font-semibold text-slate-800">{selectedTable}</h2>
                  <p className="text-xs text-slate-500">Taking order</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Guest name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-24 sm:w-32 h-8 text-sm bg-slate-50 border-slate-200"
                />
                <div className="flex items-center gap-1 border border-slate-200 rounded-md px-2 py-1 bg-slate-50">
                  <Users className="h-4 w-4 text-slate-400 hidden sm:block" />
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCovers(Math.max(1, covers - 1))}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium w-4 text-center text-slate-700">{covers}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCovers(covers + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Menu Section - Mobile uses tabs, Desktop uses side-by-side */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
              {/* Menu Items - Takes more space on mobile */}
              <div className="flex-1 flex flex-col min-h-0 md:border-r border-border overflow-hidden">
                {/* Search */}
                <div className="p-2 border-b border-border shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search menu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 p-2 overflow-x-auto border-b border-border shrink-0">
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={activeCategory === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCategory(cat.id)}
                      className="flex-shrink-0"
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>

                {/* Items Grid - Scrollable */}
                <ScrollArea className="flex-1 min-h-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 pb-4">
                    {filteredItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleMenuItemClick(item)}
                        className="p-3 rounded-lg border bg-card hover:bg-accent hover:border-primary/40 transition-all text-left relative"
                      >
                        <div className="flex items-start justify-between mb-1">
                          {item.isVeg ? (
                            <Leaf className="h-3 w-3 text-green-600" />
                          ) : (
                            <Drumstick className="h-3 w-3 text-red-600" />
                          )}
                          {item.hasVariants && (
                            <Badge variant="outline" className="text-[8px] px-1 py-0">F/H/Q</Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                        <p className="text-sm text-primary font-semibold mt-1">{formatPrice(item.price)}</p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Order Summary - Fixed height on mobile, full height on desktop */}
              <div className="h-48 md:h-auto md:w-80 flex flex-col bg-card border-t md:border-t-0 shrink-0">
                <div className="p-2 border-b border-border shrink-0 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Order ({orderItems.length})</h3>
                  <span className="font-bold text-primary">{formatPrice(calculateTotal())}</span>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-2 space-y-1">
                    {orderItems.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        <ChefHat className="h-6 w-6 mx-auto mb-1 opacity-50" />
                        <p className="text-xs">No items added</p>
                      </div>
                    ) : (
                      orderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-1 p-1.5 bg-muted/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">
                              {item.menuItem.name}
                              {item.selectedVariant && (
                                <span className="text-muted-foreground ml-1">({item.selectedVariant.label})</span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                            >
                              <Minus className="h-2.5 w-2.5" />
                            </Button>
                            <span className="w-4 text-center text-xs font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                            >
                              <Plus className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-destructive"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                          <span className="text-xs font-semibold w-12 text-right">{formatPrice(item.subtotal)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Save KOT Button */}
                <div className="p-2 border-t border-border shrink-0">
                  <Button
                    className="w-full h-10 text-sm gap-2"
                    disabled={orderItems.length === 0}
                    onClick={handleSaveAndPrintKOT}
                  >
                    <Printer className="h-4 w-4" />
                    Save & Print KOT
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KOT Status View */}
        {view === 'kot-status' && (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">KOT Status</h2>
            
            {kotOrders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No active orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {kotOrders.map((order) => {
                  const allReady = order.items.every((item) => item.status === 'ready');
                  
                  return (
                    <Card key={order.id} className={cn(allReady && "border-success")}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{order.orderNumber}</CardTitle>
                            <Badge variant="outline">{order.table}</Badge>
                            {order.isRush && (
                              <Badge className="bg-destructive text-destructive-foreground">RUSH</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {order.time}
                          </div>
                        </div>
                        {order.customerName && (
                          <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className={cn(
                                "flex items-center justify-between p-2 rounded-lg",
                                item.status === 'pending' && "bg-amber-50 dark:bg-amber-950/20",
                                item.status === 'preparing' && "bg-sky-50 dark:bg-sky-950/20",
                                item.status === 'ready' && "bg-emerald-50 dark:bg-emerald-950/20"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{item.quantity}x</span>
                                <span className="text-sm">{item.name}</span>
                                {item.notes && (
                                  <span className="text-xs text-muted-foreground">({item.notes})</span>
                                )}
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  item.status === 'pending' && "text-amber-600 border-amber-300",
                                  item.status === 'preparing' && "text-sky-600 border-sky-300",
                                  item.status === 'ready' && "text-emerald-600 border-emerald-300"
                                )}
                              >
                                {item.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                {item.status === 'preparing' && <ChefHat className="h-3 w-3 mr-1" />}
                                {item.status === 'ready' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {item.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        
                        {allReady && (
                          <div className="mt-3 flex items-center gap-2 p-2 bg-success/10 rounded-lg text-success">
                            <Bell className="h-4 w-4" />
                            <span className="text-sm font-medium">Ready to serve!</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Variant Selection Dialog */}
      <VariantSelectionDialog
        open={variantDialogOpen}
        onClose={() => setVariantDialogOpen(false)}
        menuItem={selectedMenuItem}
        onSelect={handleVariantSelect}
      />
    </div>
  );
}
