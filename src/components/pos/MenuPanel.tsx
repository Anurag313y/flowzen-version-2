import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Settings2, Search, Star, Leaf, Drumstick } from 'lucide-react';
import type { MenuItem, Category, PriceVariant } from '@/types/pos';
import { VariantSelectionDialog } from './VariantSelectionDialog';

const mockCategories: Category[] = [
  { id: 'fav', name: 'Favorites', order: 0 },
  { id: '1', name: 'Starters', order: 1 },
  { id: '2', name: 'Main Course', order: 2 },
  { id: '3', name: 'Biryani', order: 3 },
  { id: '4', name: 'Breads', order: 4 },
  { id: '5', name: 'Beverages', order: 5 },
  { id: '6', name: 'Desserts', order: 6 },
  { id: '7', name: 'Chinese', order: 7 },
  { id: '8', name: 'Soups', order: 8 },
];

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
  { id: '15', name: 'Gulab Jamun', price: 100, categoryId: '6', isAvailable: true, hasModifiers: false, isVeg: true },
  { id: '16', name: 'Hakka Noodles', price: 220, categoryId: '7', isAvailable: true, hasModifiers: true, isVeg: true },
  { id: '17', name: 'Chilli Chicken', price: 320, categoryId: '7', isAvailable: true, hasModifiers: false, isVeg: false, hasVariants: true },
  { id: '18', name: 'Manchurian', price: 260, categoryId: '7', isAvailable: true, hasModifiers: true, isVeg: true, hasVariants: true },
  { id: '19', name: 'Hot & Sour Soup', price: 150, categoryId: '8', isAvailable: true, hasModifiers: false, isVeg: true },
  { id: '20', name: 'Chicken Soup', price: 180, categoryId: '8', isAvailable: true, hasModifiers: false, isVeg: false },
  { id: '21', name: 'Tandoori Roti', price: 40, categoryId: '4', isAvailable: true, hasModifiers: false, isVeg: true },
  { id: '22', name: 'Raita', price: 60, categoryId: '2', isAvailable: true, hasModifiers: false, isVeg: true },
  { id: '23', name: 'Open Item', price: 0, categoryId: '1', isAvailable: true, hasModifiers: true, isVeg: true },
];

interface MenuPanelProps {
  onItemSelect: (item: MenuItem, variant?: PriceVariant) => void;
  isTakeaway?: boolean;
}

export function MenuPanel({ onItemSelect, isTakeaway = false }: MenuPanelProps) {
  const [activeCategory, setActiveCategory] = useState(mockCategories[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);

  const filteredItems = mockMenuItems.filter(item => {
    const matchesCategory = activeCategory === 'fav' 
      ? item.isFavorite 
      : item.categoryId === activeCategory;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatPrice = (price: number) => {
    if (price === 0) return 'Open';
    return `₹${price}`;
  };

  const handleItemClick = (item: MenuItem) => {
    if (!item.isAvailable) return;
    
    if (item.hasVariants) {
      setSelectedMenuItem(item);
      setVariantDialogOpen(true);
    } else {
      onItemSelect(item);
    }
  };

  const handleVariantSelect = (menuItem: MenuItem, variant: PriceVariant) => {
    onItemSelect(menuItem, variant);
  };

  return (
    <div className="flex h-full bg-card rounded-lg border border-border overflow-hidden">
      {/* Left: Category List */}
      <div className="w-28 flex-shrink-0 bg-sidebar-background border-r border-sidebar-border">
        <ScrollArea className="h-full">
          <div className="flex flex-col">
            {mockCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-3 py-3 text-left text-xs font-medium transition-colors border-l-2",
                  "hover:bg-sidebar-accent text-sidebar-foreground",
                  activeCategory === category.id
                    ? "bg-sidebar-accent border-l-primary text-sidebar-accent-foreground"
                    : "border-l-transparent"
                )}
              >
                <div className="flex items-center gap-1.5">
                  {category.id === 'fav' && <Star className="h-3 w-3 text-amber-400" />}
                  <span className="truncate">{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Menu Items */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search Bar */}
        <div className="p-2 border-b border-border flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
          </div>
        </div>

        {/* Menu Items Grid - Compact Cards */}
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 p-2">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                disabled={!item.isAvailable}
                className={cn(
                  "relative p-2 rounded-md border bg-card text-left transition-all duration-150",
                  "hover:bg-accent hover:border-primary/40 hover:shadow-sm",
                  "min-h-[56px] flex flex-col justify-between",
                  !item.isAvailable && "opacity-40 cursor-not-allowed bg-muted hover:bg-muted hover:border-border"
                )}
              >
                {/* Veg/Non-veg indicator */}
                <div className="absolute top-1 left-1">
                  {item.isVeg ? (
                    <Leaf className="h-2.5 w-2.5 text-green-600" />
                  ) : (
                    <Drumstick className="h-2.5 w-2.5 text-red-600" />
                  )}
                </div>

                {/* Modifier/Variant indicators */}
                <div className="absolute top-1 right-1 flex items-center gap-0.5">
                  {item.hasVariants && (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 h-3">F/H</Badge>
                  )}
                  {item.hasModifiers && (
                    <Settings2 className="h-2.5 w-2.5 text-muted-foreground" />
                  )}
                </div>

                {/* Item Name */}
                <span className="text-xs font-medium leading-tight mt-2 line-clamp-2">
                  {item.name}
                </span>

                {/* Price */}
                <span className="text-xs font-mono text-primary font-semibold mt-1">
                  {formatPrice(item.price)}
                </span>

                {/* Unavailable Badge */}
                {!item.isAvailable && (
                  <Badge variant="secondary" className="absolute bottom-1 right-1 text-[9px] px-1 py-0">
                    N/A
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Variant Selection Dialog */}
      <VariantSelectionDialog
        open={variantDialogOpen}
        onClose={() => setVariantDialogOpen(false)}
        menuItem={selectedMenuItem}
        onSelect={handleVariantSelect}
        isTakeaway={isTakeaway}
      />
    </div>
  );
}
