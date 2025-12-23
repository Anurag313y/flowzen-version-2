import { useState, useCallback } from 'react';
import { MenuPanel } from '@/components/pos/MenuPanel';
import { OrderBillPanel } from '@/components/pos/OrderBillPanel';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { Badge } from '@/components/ui/badge';
import { WifiOff } from 'lucide-react';
import type { Order, OrderItem, MenuItem, Payment, PriceVariant } from '@/types/pos';
import { toast } from 'sonner';
import { useOrderStore, generateOrderNumber, type KOTOrder, type TableOrder } from '@/store/orderStore';

// Order number generation moved to orderStore for consistency

const createEmptyOrder = (): Order => ({
  id: Date.now().toString(),
  orderNumber: generateOrderNumber(),
  orderType: 'dine-in',
  items: [],
  subtotal: 0,
  discount: 0,
  discountType: 'fixed',
  serviceCharge: 0,
  tax: 0,
  taxInclusive: true,
  rounding: 0,
  grandTotal: 0,
  paymentStatus: 'unpaid',
  paidAmount: 0,
  status: 'active',
  createdAt: new Date(),
  updatedAt: new Date(),
});

export default function POSPage() {
  const [order, setOrder] = useState<Order>(createEmptyOrder());
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [isOffline] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [covers, setCovers] = useState(2);
  
  const { assignOrderToTable, addKOTOrder, settleTableBill, getTableByNumber } = useOrderStore();

  const calculateTotals = useCallback((items: OrderItem[]): Partial<Order> => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const serviceCharge = subtotal * 0.05; // 5% service charge
    const taxableAmount = subtotal + serviceCharge;
    const tax = taxableAmount * 0.05; // 5% GST
    const grandTotal = subtotal + serviceCharge + tax;
    const rounding = Math.round(grandTotal) - grandTotal;

    return {
      subtotal,
      serviceCharge,
      tax,
      grandTotal: grandTotal + rounding,
      rounding,
    };
  }, []);

  const handleItemSelect = useCallback((menuItem: MenuItem, variant?: PriceVariant) => {
    setOrder((prev) => {
      // Check if item already exists with same variant
      const existingIndex = prev.items.findIndex(
        (item) => item.menuItem.id === menuItem.id && 
                  item.selectedVariant?.id === variant?.id
      );

      const price = variant ? variant.price : menuItem.price;
      let newItems: OrderItem[];

      if (existingIndex >= 0) {
        // Update quantity
        newItems = prev.items.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * price,
              }
            : item
        );
      } else {
        // Add new item
        const newItem: OrderItem = {
          id: Date.now().toString(),
          menuItem,
          quantity: 1,
          modifiers: [],
          subtotal: price,
          selectedVariant: variant,
        };
        newItems = [...prev.items, newItem];
      }

      return {
        ...prev,
        items: newItems,
        ...calculateTotals(newItems),
        updatedAt: new Date(),
      };
    });
  }, [calculateTotals]);

  const handleUpdateQuantity = useCallback((itemId: string, delta: number) => {
    setOrder((prev) => {
      const newItems = prev.items
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
        .filter(Boolean) as OrderItem[];

      return {
        ...prev,
        items: newItems,
        ...calculateTotals(newItems),
        updatedAt: new Date(),
      };
    });
  }, [calculateTotals]);

  const handleRemoveItem = useCallback((itemId: string) => {
    setOrder((prev) => {
      const newItems = prev.items.filter((item) => item.id !== itemId);
      return {
        ...prev,
        items: newItems,
        ...calculateTotals(newItems),
        updatedAt: new Date(),
      };
    });
  }, [calculateTotals]);

  const handleOrderTypeChange = useCallback((type: Order['orderType']) => {
    setOrder((prev) => ({
      ...prev,
      orderType: type,
      tableNumber: type === 'dine-in' ? prev.tableNumber : undefined,
    }));
  }, []);

  const handleTableChange = useCallback((table: string) => {
    setOrder((prev) => ({
      ...prev,
      tableNumber: table,
    }));
  }, []);

  const handlePrintSaveKOT = useCallback(() => {
    // Create KOT order for kitchen
    const kotOrder: KOTOrder = {
      id: Date.now().toString(),
      orderNumber: order.orderNumber,
      table: order.tableNumber || 'Takeaway',
      time: 'Just now',
      isRush: false,
      createdAt: new Date(),
      items: order.items.map((item) => ({
        id: item.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        status: 'pending' as const,
        notes: item.notes,
      })),
      customerName: customerName || undefined,
      customerMobile: customerMobile || undefined,
    };
    
    addKOTOrder(kotOrder);

    // If dine-in, assign order to table
    if (order.orderType === 'dine-in' && order.tableNumber) {
      const tableOrder: TableOrder = {
        orderNumber: order.orderNumber,
        guests: covers,
        amount: Math.round(order.grandTotal),
        startTime: new Date(),
        items: order.items.map((item) => ({
          id: item.id,
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.subtotal,
        })),
        customerName: customerName || undefined,
        customerMobile: customerMobile || undefined,
      };
      assignOrderToTable(order.tableNumber, tableOrder);
    }

    toast.success('KOT printed & saved', {
      description: `Order ${order.orderNumber}${customerName ? ` - ${customerName}` : ''}`,
    });
    setOrder((prev) => ({ ...prev, status: 'kot-sent' }));
  }, [order, customerName, customerMobile, covers, addKOTOrder, assignOrderToTable]);

  const handlePaymentComplete = useCallback((payments: Payment[]) => {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    
    setOrder((prev) => {
      const newPaidAmount = prev.paidAmount + totalPaid;
      const isFullyPaid = newPaidAmount >= prev.grandTotal;
      
      // If fully paid and dine-in, settle the table
      if (isFullyPaid && prev.orderType === 'dine-in' && prev.tableNumber) {
        const table = getTableByNumber(prev.tableNumber);
        if (table) {
          settleTableBill(table.id);
        }
      }
      
      return {
        ...prev,
        paidAmount: newPaidAmount,
        paymentStatus: isFullyPaid ? 'paid' : 'partial',
        status: isFullyPaid ? 'settled' : prev.status,
      };
    });
    
    toast.success('Payment completed');
    
    // Reset order after settlement
    setTimeout(() => {
      setOrder(createEmptyOrder());
      setCustomerName('');
      setCustomerMobile('');
      setCovers(2);
    }, 1500);
  }, [getTableByNumber, settleTableBill]);

  return (
    <div className="h-[calc(100vh-88px)] flex flex-col">
      {/* Offline Banner */}
      {isOffline && (
        <div className="offline-banner px-4 py-2 flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Offline Mode - Orders will sync when connected</span>
        </div>
      )}

      {/* Page Header - Compact */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">POS</h1>
          <Badge variant="outline" className="font-mono text-xs">
            {order.orderNumber}
          </Badge>
          {order.tableNumber && (
            <Badge className="bg-primary/10 text-primary text-xs">
              {order.tableNumber}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </Badge>
        </div>
      </div>

      {/* Main POS Layout - 2 Sections */}
      <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
        {/* Menu Panel - Left */}
        <div className="col-span-7 xl:col-span-8 min-h-0">
          <MenuPanel onItemSelect={handleItemSelect} />
        </div>

        {/* Order & Bill Panel - Right */}
        <div className="col-span-5 xl:col-span-4 min-h-0">
          <OrderBillPanel
            order={order}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onOrderTypeChange={handleOrderTypeChange}
            onTableChange={handleTableChange}
            onPrintSaveKOT={handlePrintSaveKOT}
            onSettleBill={() => setPaymentOpen(true)}
            customerName={customerName}
            customerMobile={customerMobile}
            onCustomerNameChange={setCustomerName}
            onCustomerMobileChange={setCustomerMobile}
          />
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        order={order}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}
