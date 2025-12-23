import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChefHat,
  Package,
  Scale,
  AlertTriangle,
  BookOpen,
  Layers,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useInventoryStore, type Recipe, type RecipeIngredient, type InventoryUnit, type InventoryItem } from '@/store/inventoryStore';

// Menu items mock (should match with menu)
const menuItems = [
  { id: '1', name: 'Paneer Tikka', category: 'Starters' },
  { id: '2', name: 'Chicken 65', category: 'Starters' },
  { id: '3', name: 'Veg Spring Rolls', category: 'Starters' },
  { id: '4', name: 'Fish Fry', category: 'Starters' },
  { id: '5', name: 'Butter Chicken', category: 'Main Course' },
  { id: '6', name: 'Dal Makhani', category: 'Main Course' },
  { id: '7', name: 'Paneer Butter Masala', category: 'Main Course' },
  { id: '8', name: 'Chicken Biryani', category: 'Biryani' },
  { id: '9', name: 'Mutton Biryani', category: 'Biryani' },
  { id: '10', name: 'Veg Biryani', category: 'Biryani' },
];

const portionSizes = [
  { value: 'full', label: 'Full', multiplier: 1 },
  { value: 'half', label: 'Half', multiplier: 0.5 },
  { value: 'quarter', label: 'Quarter', multiplier: 0.25 },
];

const units: InventoryUnit[] = ['kg', 'g', 'ltr', 'ml', 'pcs', 'dozen'];

export default function RecipeManagementPage() {
  const { items: inventoryItems, recipes, addRecipe, updateRecipe } = useInventoryStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  // New recipe form state
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [selectedPortionSize, setSelectedPortionSize] = useState<'full' | 'half' | 'quarter'>('full');
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [newIngredient, setNewIngredient] = useState({
    inventoryItemId: '',
    quantity: '',
    unit: 'g' as InventoryUnit,
  });

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.menuItemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group recipes by menu item
  const groupedRecipes = filteredRecipes.reduce((acc, recipe) => {
    if (!acc[recipe.menuItemId]) {
      acc[recipe.menuItemId] = [];
    }
    acc[recipe.menuItemId].push(recipe);
    return acc;
  }, {} as Record<string, Recipe[]>);

  const getInventoryItemName = (id: string) => {
    return inventoryItems.find((i) => i.id === id)?.name || 'Unknown';
  };

  const getMenuItemName = (id: string) => {
    return menuItems.find((m) => m.id === id)?.name || 'Unknown';
  };

  const handleAddIngredient = () => {
    if (!newIngredient.inventoryItemId || !newIngredient.quantity) {
      toast.error('Please select an ingredient and quantity');
      return;
    }

    const exists = ingredients.find(
      (i) => i.inventoryItemId === newIngredient.inventoryItemId
    );

    if (exists) {
      toast.error('Ingredient already added');
      return;
    }

    setIngredients([
      ...ingredients,
      {
        inventoryItemId: newIngredient.inventoryItemId,
        quantity: parseFloat(newIngredient.quantity),
        unit: newIngredient.unit,
      },
    ]);

    setNewIngredient({
      inventoryItemId: '',
      quantity: '',
      unit: 'g',
    });
  };

  const handleRemoveIngredient = (inventoryItemId: string) => {
    setIngredients(ingredients.filter((i) => i.inventoryItemId !== inventoryItemId));
  };

  const handleSaveRecipe = () => {
    if (!selectedMenuItem) {
      toast.error('Please select a menu item');
      return;
    }

    if (ingredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }

    const menuItem = menuItems.find((m) => m.id === selectedMenuItem);
    const portion = portionSizes.find((p) => p.value === selectedPortionSize);

    const recipeData = {
      menuItemId: selectedMenuItem,
      menuItemName: menuItem?.name || '',
      portionSize: selectedPortionSize,
      portionMultiplier: portion?.multiplier || 1,
      ingredients,
    };

    if (editingRecipe) {
      updateRecipe(editingRecipe.id, recipeData);
      toast.success('Recipe updated successfully');
    } else {
      addRecipe(recipeData);
      toast.success('Recipe added successfully');
    }

    resetForm();
  };

  const resetForm = () => {
    setSelectedMenuItem('');
    setSelectedPortionSize('full');
    setIngredients([]);
    setNewIngredient({ inventoryItemId: '', quantity: '', unit: 'g' });
    setIsAddDialogOpen(false);
    setEditingRecipe(null);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setSelectedMenuItem(recipe.menuItemId);
    setSelectedPortionSize(recipe.portionSize);
    setIngredients([...recipe.ingredients]);
    setIsAddDialogOpen(true);
  };

  const getMenuItemsWithoutRecipe = () => {
    const recipedMenuItems = new Set(recipes.map((r) => r.menuItemId));
    return menuItems.filter((m) => !recipedMenuItems.has(m.id));
  };

  const stats = {
    totalRecipes: recipes.length,
    menuItemsCovered: new Set(recipes.map((r) => r.menuItemId)).size,
    totalMenuItems: menuItems.length,
    missingRecipes: menuItems.length - new Set(recipes.map((r) => r.menuItemId)).size,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Recipe Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Define ingredients for each dish to enable automatic inventory deduction
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsAddDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                {editingRecipe ? 'Edit Recipe' : 'Create New Recipe'}
              </DialogTitle>
              <DialogDescription>
                Define the ingredients required to prepare this dish
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto space-y-6 py-4">
              {/* Menu Item & Portion Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Menu Item *</Label>
                  <Select value={selectedMenuItem} onValueChange={setSelectedMenuItem}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dish" />
                    </SelectTrigger>
                    <SelectContent>
                      {menuItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <span className="flex items-center gap-2">
                            {item.name}
                            <span className="text-xs text-muted-foreground">({item.category})</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Portion Size *</Label>
                  <Select value={selectedPortionSize} onValueChange={(v: 'full' | 'half' | 'quarter') => setSelectedPortionSize(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {portionSizes.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label} ({size.multiplier * 100}%)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Add Ingredient Form */}
              <Card className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Add Ingredient
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Inventory Item</Label>
                      <Select 
                        value={newIngredient.inventoryItemId} 
                        onValueChange={(v) => setNewIngredient({ ...newIngredient, inventoryItemId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select ingredient" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name} ({item.currentStock} {item.baseUnit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newIngredient.quantity}
                        onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                      />
                    </div>
                    <div className="w-20 space-y-1">
                      <Label className="text-xs">Unit</Label>
                      <Select 
                        value={newIngredient.unit} 
                        onValueChange={(v: InventoryUnit) => setNewIngredient({ ...newIngredient, unit: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddIngredient} className="gap-1">
                      <Plus className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredients List */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Recipe Ingredients ({ingredients.length})
                </Label>
                
                {ingredients.length === 0 ? (
                  <div className="border rounded-lg p-8 text-center text-muted-foreground">
                    <Scale className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No ingredients added yet</p>
                    <p className="text-xs">Add ingredients from your inventory above</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingredient</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead className="text-right">Unit</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ingredients.map((ing) => {
                          const item = inventoryItems.find((i) => i.id === ing.inventoryItemId);
                          return (
                            <TableRow key={ing.inventoryItemId}>
                              <TableCell className="font-medium">{item?.name || 'Unknown'}</TableCell>
                              <TableCell className="text-right font-mono">{ing.quantity}</TableCell>
                              <TableCell className="text-right">{ing.unit}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="iconSm"
                                  onClick={() => handleRemoveIngredient(ing.inventoryItemId)}
                                  className="text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
              <Button onClick={handleSaveRecipe}>
                {editingRecipe ? 'Update Recipe' : 'Save Recipe'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalRecipes}</div>
                <div className="text-xs text-muted-foreground">Total Recipes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <ChefHat className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">{stats.menuItemsCovered}</div>
                <div className="text-xs text-muted-foreground">Dishes Covered</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold">{inventoryItems.length}</div>
                <div className="text-xs text-muted-foreground">Inventory Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">{stats.missingRecipes}</div>
                <div className="text-xs text-muted-foreground">Missing Recipes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recipes List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">All Recipes</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedRecipes).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No recipes found</p>
              <p className="text-sm">Click "Add Recipe" to create your first recipe</p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-2">
              {Object.entries(groupedRecipes).map(([menuItemId, itemRecipes]) => {
                const menuItem = menuItems.find((m) => m.id === menuItemId);
                
                return (
                  <AccordionItem 
                    key={menuItemId} 
                    value={menuItemId}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3">
                        <ChefHat className="h-5 w-5 text-primary" />
                        <div className="text-left">
                          <div className="font-semibold">{menuItem?.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {itemRecipes.length} portion{itemRecipes.length > 1 ? 's' : ''} • {menuItem?.category}
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-4">
                        {itemRecipes.map((recipe) => (
                          <div key={recipe.id} className="border rounded-lg p-4 bg-muted/30">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="secondary" className="gap-1">
                                <Layers className="h-3 w-3" />
                                {recipe.portionSize.charAt(0).toUpperCase() + recipe.portionSize.slice(1)} Portion
                              </Badge>
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="iconSm"
                                  onClick={() => handleEditRecipe(recipe)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {recipe.ingredients.map((ing) => {
                                const item = inventoryItems.find((i) => i.id === ing.inventoryItemId);
                                const isLow = item && item.currentStock < item.minStock;
                                
                                return (
                                  <div 
                                    key={ing.inventoryItemId}
                                    className={cn(
                                      "flex items-center gap-2 p-2 rounded-lg border bg-background",
                                      isLow && "border-warning/50 bg-warning/5"
                                    )}
                                  >
                                    <Package className={cn("h-4 w-4", isLow ? "text-warning" : "text-muted-foreground")} />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm font-medium truncate">{item?.name}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {ing.quantity} {ing.unit}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Missing Recipes Alert */}
      {stats.missingRecipes > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Dishes Without Recipes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              The following dishes don't have recipes. Inventory won't be deducted when these are ordered.
            </p>
            <div className="flex flex-wrap gap-2">
              {getMenuItemsWithoutRecipe().map((item) => (
                <Badge key={item.id} variant="outline" className="gap-1">
                  {item.name}
                  <span className="text-xs text-muted-foreground">({item.category})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}