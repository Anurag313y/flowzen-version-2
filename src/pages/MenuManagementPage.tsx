import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Tag,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PriceVariant {
  id: string;
  name: 'full' | 'half' | 'quarter';
  label: string;
  price: number;
  takeawayPrice: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  takeawayPrice: number;
  categoryId: string;
  isAvailable: boolean;
  isVeg: boolean;
  preparationTime: number;
  hasVariants: boolean;
  priceVariants: PriceVariant[];
}

interface Category {
  id: string;
  name: string;
  itemCount: number;
}

const initialCategories: Category[] = [
  { id: '1', name: 'Starters', itemCount: 8 },
  { id: '2', name: 'Main Course', itemCount: 12 },
  { id: '3', name: 'Biryani', itemCount: 6 },
  { id: '4', name: 'Breads', itemCount: 5 },
  { id: '5', name: 'Beverages', itemCount: 10 },
  { id: '6', name: 'Desserts', itemCount: 4 },
];

const initialMenuItems: MenuItem[] = [
  { 
    id: '1', name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', 
    price: 320, takeawayPrice: 300, categoryId: '1', isAvailable: true, isVeg: true, preparationTime: 15,
    hasVariants: true,
    priceVariants: [
      { id: '1-full', name: 'full', label: 'Full', price: 320, takeawayPrice: 300 },
      { id: '1-half', name: 'half', label: 'Half', price: 180, takeawayPrice: 160 },
    ]
  },
  { 
    id: '2', name: 'Chicken 65', description: 'Spicy deep-fried chicken', 
    price: 280, takeawayPrice: 260, categoryId: '1', isAvailable: true, isVeg: false, preparationTime: 12,
    hasVariants: true,
    priceVariants: [
      { id: '2-full', name: 'full', label: 'Full', price: 280, takeawayPrice: 260 },
      { id: '2-half', name: 'half', label: 'Half', price: 160, takeawayPrice: 140 },
    ]
  },
  { 
    id: '3', name: 'Veg Spring Rolls', description: 'Crispy rolls with vegetables', 
    price: 180, takeawayPrice: 160, categoryId: '1', isAvailable: false, isVeg: true, preparationTime: 10,
    hasVariants: false, priceVariants: []
  },
  { 
    id: '4', name: 'Fish Fry', description: 'Crispy fried fish with masala', 
    price: 350, takeawayPrice: 330, categoryId: '1', isAvailable: true, isVeg: false, preparationTime: 18,
    hasVariants: false, priceVariants: []
  },
  { 
    id: '5', name: 'Butter Chicken', description: 'Creamy tomato-based chicken curry', 
    price: 420, takeawayPrice: 400, categoryId: '2', isAvailable: true, isVeg: false, preparationTime: 20,
    hasVariants: true,
    priceVariants: [
      { id: '5-full', name: 'full', label: 'Full', price: 420, takeawayPrice: 400 },
      { id: '5-half', name: 'half', label: 'Half', price: 240, takeawayPrice: 220 },
      { id: '5-quarter', name: 'quarter', label: 'Quarter', price: 140, takeawayPrice: 130 },
    ]
  },
  { 
    id: '6', name: 'Dal Makhani', description: 'Slow-cooked black lentils in cream', 
    price: 280, takeawayPrice: 260, categoryId: '2', isAvailable: true, isVeg: true, preparationTime: 15,
    hasVariants: true,
    priceVariants: [
      { id: '6-full', name: 'full', label: 'Full', price: 280, takeawayPrice: 260 },
      { id: '6-half', name: 'half', label: 'Half', price: 160, takeawayPrice: 150 },
    ]
  },
  { 
    id: '7', name: 'Paneer Butter Masala', description: 'Cottage cheese in rich gravy', 
    price: 340, takeawayPrice: 320, categoryId: '2', isAvailable: true, isVeg: true, preparationTime: 15,
    hasVariants: true,
    priceVariants: [
      { id: '7-full', name: 'full', label: 'Full', price: 340, takeawayPrice: 320 },
      { id: '7-half', name: 'half', label: 'Half', price: 190, takeawayPrice: 180 },
    ]
  },
  { 
    id: '8', name: 'Chicken Biryani', description: 'Aromatic rice with chicken', 
    price: 380, takeawayPrice: 360, categoryId: '3', isAvailable: true, isVeg: false, preparationTime: 25,
    hasVariants: true,
    priceVariants: [
      { id: '8-full', name: 'full', label: 'Full', price: 380, takeawayPrice: 360 },
      { id: '8-half', name: 'half', label: 'Half', price: 220, takeawayPrice: 200 },
    ]
  },
  { 
    id: '9', name: 'Mutton Biryani', description: 'Aromatic rice with mutton', 
    price: 480, takeawayPrice: 460, categoryId: '3', isAvailable: true, isVeg: false, preparationTime: 30,
    hasVariants: true,
    priceVariants: [
      { id: '9-full', name: 'full', label: 'Full', price: 480, takeawayPrice: 460 },
      { id: '9-half', name: 'half', label: 'Half', price: 280, takeawayPrice: 260 },
    ]
  },
  { 
    id: '10', name: 'Veg Biryani', description: 'Aromatic rice with vegetables', 
    price: 280, takeawayPrice: 260, categoryId: '3', isAvailable: true, isVeg: true, preparationTime: 20,
    hasVariants: true,
    priceVariants: [
      { id: '10-full', name: 'full', label: 'Full', price: 280, takeawayPrice: 260 },
      { id: '10-half', name: 'half', label: 'Half', price: 160, takeawayPrice: 150 },
    ]
  },
];

interface NewItemState {
  name: string;
  description: string;
  categoryId: string;
  isVeg: boolean;
  preparationTime: string;
  hasVariants: boolean;
  fullPrice: string;
  fullTakeaway: string;
  halfPrice: string;
  halfTakeaway: string;
  quarterPrice: string;
  quarterTakeaway: string;
}

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<NewItemState>({
    name: '', description: '', categoryId: '1', isVeg: true, preparationTime: '15',
    hasVariants: false, fullPrice: '', fullTakeaway: '', halfPrice: '', halfTakeaway: '', quarterPrice: '', quarterTakeaway: ''
  });
  const [newCategory, setNewCategory] = useState('');

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddItem = () => {
    if (!newItem.name.trim() || !newItem.fullPrice) {
      toast.error('Please fill in required fields');
      return;
    }

    const fullPrice = parseFloat(newItem.fullPrice);
    const fullTakeaway = parseFloat(newItem.fullTakeaway) || fullPrice;
    
    const priceVariants: PriceVariant[] = [];
    
    if (newItem.hasVariants) {
      priceVariants.push({
        id: `${Date.now()}-full`,
        name: 'full',
        label: 'Full',
        price: fullPrice,
        takeawayPrice: fullTakeaway
      });
      
      if (newItem.halfPrice) {
        priceVariants.push({
          id: `${Date.now()}-half`,
          name: 'half',
          label: 'Half',
          price: parseFloat(newItem.halfPrice),
          takeawayPrice: parseFloat(newItem.halfTakeaway) || parseFloat(newItem.halfPrice)
        });
      }
      
      if (newItem.quarterPrice) {
        priceVariants.push({
          id: `${Date.now()}-quarter`,
          name: 'quarter',
          label: 'Quarter',
          price: parseFloat(newItem.quarterPrice),
          takeawayPrice: parseFloat(newItem.quarterTakeaway) || parseFloat(newItem.quarterPrice)
        });
      }
    }

    const item: MenuItem = {
      id: Date.now().toString(),
      name: newItem.name,
      description: newItem.description,
      price: fullPrice,
      takeawayPrice: fullTakeaway,
      categoryId: newItem.categoryId,
      isAvailable: true,
      isVeg: newItem.isVeg,
      preparationTime: parseInt(newItem.preparationTime),
      hasVariants: newItem.hasVariants,
      priceVariants: priceVariants,
    };
    
    setMenuItems([...menuItems, item]);
    setNewItem({
      name: '', description: '', categoryId: '1', isVeg: true, preparationTime: '15',
      hasVariants: false, fullPrice: '', fullTakeaway: '', halfPrice: '', halfTakeaway: '', quarterPrice: '', quarterTakeaway: ''
    });
    setIsItemDialogOpen(false);
    toast.success(`${newItem.name} added to menu`);
  };

  const handleUpdateItem = () => {
    if (!editingItem) return;
    setMenuItems(menuItems.map(item => item.id === editingItem.id ? editingItem : item));
    setEditingItem(null);
    setIsEditDialogOpen(false);
    toast.success('Menu item updated');
  };

  const handleDeleteItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
    toast.success('Menu item deleted');
  };

  const handleToggleAvailability = (id: string) => {
    setMenuItems(menuItems.map(item => 
      item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
    ));
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Please enter category name');
      return;
    }
    const category: Category = {
      id: Date.now().toString(),
      name: newCategory,
      itemCount: 0,
    };
    setCategories([...categories, category]);
    setNewCategory('');
    setIsCategoryDialogOpen(false);
    toast.success(`Category "${newCategory}" added`);
  };

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || 'Unknown';
  };

  const openEditDialog = (item: MenuItem) => {
    setEditingItem({ ...item });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage your restaurant menu items with Full/Half/Quarter pricing
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Tag className="h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>Create a new menu category</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., Appetizers"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddCategory}>Add Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Menu Item</DialogTitle>
                <DialogDescription>Add a new item with optional portion pricing (Full/Half/Quarter)</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g., Butter Chicken"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Brief description of the dish"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newItem.categoryId} onValueChange={(v) => setNewItem({ ...newItem, categoryId: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="prepTime">Prep Time (min)</Label>
                    <Input
                      id="prepTime"
                      type="number"
                      value={newItem.preparationTime}
                      onChange={(e) => setNewItem({ ...newItem, preparationTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newItem.isVeg}
                      onCheckedChange={(v) => setNewItem({ ...newItem, isVeg: v })}
                    />
                    <Label>Vegetarian</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newItem.hasVariants}
                      onCheckedChange={(v) => setNewItem({ ...newItem, hasVariants: v })}
                    />
                    <Label>Enable Portion Variants (Full/Half/Quarter)</Label>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                  <h4 className="font-medium">Pricing</h4>
                  
                  {/* Full Portion (Always visible) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>{newItem.hasVariants ? 'Full Portion - Dine-in *' : 'Dine-in Price *'}</Label>
                      <Input
                        type="number"
                        value={newItem.fullPrice}
                        onChange={(e) => setNewItem({ ...newItem, fullPrice: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{newItem.hasVariants ? 'Full Portion - Takeaway' : 'Takeaway Price'}</Label>
                      <Input
                        type="number"
                        value={newItem.fullTakeaway}
                        onChange={(e) => setNewItem({ ...newItem, fullTakeaway: e.target.value })}
                        placeholder="Same as dine-in"
                      />
                    </div>
                  </div>

                  {/* Half & Quarter Portions */}
                  {newItem.hasVariants && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Half Portion - Dine-in</Label>
                          <Input
                            type="number"
                            value={newItem.halfPrice}
                            onChange={(e) => setNewItem({ ...newItem, halfPrice: e.target.value })}
                            placeholder="0"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Half Portion - Takeaway</Label>
                          <Input
                            type="number"
                            value={newItem.halfTakeaway}
                            onChange={(e) => setNewItem({ ...newItem, halfTakeaway: e.target.value })}
                            placeholder="Same as dine-in"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Quarter Portion - Dine-in</Label>
                          <Input
                            type="number"
                            value={newItem.quarterPrice}
                            onChange={(e) => setNewItem({ ...newItem, quarterPrice: e.target.value })}
                            placeholder="0 (optional)"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Quarter Portion - Takeaway</Label>
                          <Input
                            type="number"
                            value={newItem.quarterTakeaway}
                            onChange={(e) => setNewItem({ ...newItem, quarterTakeaway: e.target.value })}
                            placeholder="Same as dine-in"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{menuItems.length}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">{menuItems.filter(i => i.isAvailable).length}</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{menuItems.filter(i => i.hasVariants).length}</div>
            <div className="text-sm text-muted-foreground">With Variants</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">{menuItems.filter(i => i.isVeg).length}</div>
            <div className="text-sm text-muted-foreground">Vegetarian</div>
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
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Full Price</TableHead>
                <TableHead>Half Price</TableHead>
                <TableHead>Quarter Price</TableHead>
                <TableHead>Prep Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => {
                const fullVariant = item.priceVariants.find(v => v.name === 'full');
                const halfVariant = item.priceVariants.find(v => v.name === 'half');
                const quarterVariant = item.priceVariants.find(v => v.name === 'quarter');
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-3 w-3 rounded-full border-2",
                          item.isVeg ? "border-success bg-success/20" : "border-destructive bg-destructive/20"
                        )} />
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {item.name}
                            {item.hasVariants && (
                              <Badge variant="outline" className="text-xs">Variants</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">{item.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryName(item.categoryId)}</Badge>
                    </TableCell>
                    <TableCell className="font-mono">
                      {item.hasVariants && fullVariant 
                        ? formatPrice(fullVariant.price)
                        : formatPrice(item.price)
                      }
                    </TableCell>
                    <TableCell className="font-mono">
                      {halfVariant ? formatPrice(halfVariant.price) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="font-mono">
                      {quarterVariant ? formatPrice(quarterVariant.price) : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>{item.preparationTime} min</TableCell>
                    <TableCell>
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={() => handleToggleAvailability(item.id)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(item)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteItem(item.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Update item details and pricing</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editName">Item Name</Label>
                <Input
                  id="editName"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select 
                    value={editingItem.categoryId} 
                    onValueChange={(v) => setEditingItem({ ...editingItem, categoryId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Prep Time (min)</Label>
                  <Input
                    type="number"
                    value={editingItem.preparationTime}
                    onChange={(e) => setEditingItem({ ...editingItem, preparationTime: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingItem.isVeg}
                    onCheckedChange={(v) => setEditingItem({ ...editingItem, isVeg: v })}
                  />
                  <Label>Vegetarian</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingItem.hasVariants}
                    onCheckedChange={(v) => setEditingItem({ ...editingItem, hasVariants: v })}
                  />
                  <Label>Enable Variants</Label>
                </div>
              </div>
              
              {/* Pricing Section */}
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <h4 className="font-medium">Pricing</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Full/Base - Dine-in</Label>
                    <Input
                      type="number"
                      value={editingItem.price}
                      onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Full/Base - Takeaway</Label>
                    <Input
                      type="number"
                      value={editingItem.takeawayPrice}
                      onChange={(e) => setEditingItem({ ...editingItem, takeawayPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                {editingItem.hasVariants && editingItem.priceVariants.length > 0 && (
                  <div className="space-y-3">
                    {editingItem.priceVariants.map((variant, idx) => (
                      <div key={variant.id} className="grid grid-cols-3 gap-3 items-center">
                        <Label className="capitalize font-medium">{variant.label}</Label>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={(e) => {
                            const newVariants = [...editingItem.priceVariants];
                            newVariants[idx] = { ...variant, price: parseFloat(e.target.value) || 0 };
                            setEditingItem({ ...editingItem, priceVariants: newVariants });
                          }}
                          placeholder="Dine-in"
                        />
                        <Input
                          type="number"
                          value={variant.takeawayPrice}
                          onChange={(e) => {
                            const newVariants = [...editingItem.priceVariants];
                            newVariants[idx] = { ...variant, takeawayPrice: parseFloat(e.target.value) || 0 };
                            setEditingItem({ ...editingItem, priceVariants: newVariants });
                          }}
                          placeholder="Takeaway"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
