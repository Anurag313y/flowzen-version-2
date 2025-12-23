import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InventoryUnit = 'kg' | 'g' | 'ltr' | 'ml' | 'pcs' | 'dozen';

export interface UnitConversion {
  fromUnit: InventoryUnit;
  toUnit: InventoryUnit;
  factor: number; // multiply by this to convert from -> to
}

export const UNIT_CONVERSIONS: UnitConversion[] = [
  { fromUnit: 'kg', toUnit: 'g', factor: 1000 },
  { fromUnit: 'g', toUnit: 'kg', factor: 0.001 },
  { fromUnit: 'ltr', toUnit: 'ml', factor: 1000 },
  { fromUnit: 'ml', toUnit: 'ltr', factor: 0.001 },
  { fromUnit: 'dozen', toUnit: 'pcs', factor: 12 },
  { fromUnit: 'pcs', toUnit: 'dozen', factor: 1 / 12 },
];

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  baseUnit: InventoryUnit;
  currentStock: number;
  minStock: number;
  criticalStock: number; // Block ordering below this
  maxStock: number;
  unitPrice: number;
  expiryDate?: string;
  lastUpdated: string;
}

export interface RecipeIngredient {
  inventoryItemId: string;
  quantity: number;
  unit: InventoryUnit;
}

export interface Recipe {
  id: string;
  menuItemId: string;
  menuItemName: string;
  ingredients: RecipeIngredient[];
  portionSize: 'full' | 'half' | 'quarter';
  portionMultiplier: number;
}

interface InventoryStore {
  items: InventoryItem[];
  recipes: Recipe[];
  
  // Inventory actions
  addItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  updateStock: (itemId: string, quantity: number, operation: 'add' | 'subtract') => boolean;
  updateItem: (itemId: string, updates: Partial<InventoryItem>) => void;
  
  // Recipe actions
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (recipeId: string, updates: Partial<Recipe>) => void;
  
  // Deduction on order
  deductForMenuItem: (menuItemId: string, quantity: number, portionSize?: string) => { success: boolean; errors: string[] };
  
  // Checks
  canOrderMenuItem: (menuItemId: string, quantity: number, portionSize?: string) => { canOrder: boolean; lowStockItems: string[]; blockedItems: string[] };
  getItemById: (id: string) => InventoryItem | undefined;
  getLowStockItems: () => InventoryItem[];
  getCriticalStockItems: () => InventoryItem[];
}

// Convert quantity between units
const convertUnit = (quantity: number, fromUnit: InventoryUnit, toUnit: InventoryUnit): number => {
  if (fromUnit === toUnit) return quantity;
  
  const conversion = UNIT_CONVERSIONS.find(
    (c) => c.fromUnit === fromUnit && c.toUnit === toUnit
  );
  
  if (conversion) {
    return quantity * conversion.factor;
  }
  
  // Try reverse conversion
  const reverseConversion = UNIT_CONVERSIONS.find(
    (c) => c.fromUnit === toUnit && c.toUnit === fromUnit
  );
  
  if (reverseConversion) {
    return quantity / reverseConversion.factor;
  }
  
  return quantity; // Same unit family assumed
};

const initialInventory: InventoryItem[] = [
  { id: 'inv-001', name: 'Basmati Rice', category: 'Grains', baseUnit: 'kg', currentStock: 45, minStock: 20, criticalStock: 5, maxStock: 100, unitPrice: 85, lastUpdated: new Date().toISOString() },
  { id: 'inv-002', name: 'Chicken', category: 'Meat', baseUnit: 'kg', currentStock: 12, minStock: 15, criticalStock: 3, maxStock: 50, unitPrice: 280, expiryDate: '2024-01-25', lastUpdated: new Date().toISOString() },
  { id: 'inv-003', name: 'Onions', category: 'Vegetables', baseUnit: 'kg', currentStock: 35, minStock: 20, criticalStock: 5, maxStock: 60, unitPrice: 35, lastUpdated: new Date().toISOString() },
  { id: 'inv-004', name: 'Tomatoes', category: 'Vegetables', baseUnit: 'kg', currentStock: 8, minStock: 15, criticalStock: 2, maxStock: 40, unitPrice: 45, lastUpdated: new Date().toISOString() },
  { id: 'inv-005', name: 'Cooking Oil', category: 'Oils', baseUnit: 'ltr', currentStock: 25, minStock: 10, criticalStock: 2, maxStock: 40, unitPrice: 165, lastUpdated: new Date().toISOString() },
  { id: 'inv-006', name: 'Paneer', category: 'Dairy', baseUnit: 'kg', currentStock: 6, minStock: 8, criticalStock: 1, maxStock: 25, unitPrice: 320, expiryDate: '2024-01-23', lastUpdated: new Date().toISOString() },
  { id: 'inv-007', name: 'Garam Masala', category: 'Spices', baseUnit: 'kg', currentStock: 3, minStock: 2, criticalStock: 0.5, maxStock: 10, unitPrice: 450, lastUpdated: new Date().toISOString() },
  { id: 'inv-008', name: 'Fresh Cream', category: 'Dairy', baseUnit: 'ltr', currentStock: 4, minStock: 5, criticalStock: 1, maxStock: 15, unitPrice: 220, lastUpdated: new Date().toISOString() },
  { id: 'inv-009', name: 'Butter', category: 'Dairy', baseUnit: 'kg', currentStock: 8, minStock: 5, criticalStock: 1, maxStock: 20, unitPrice: 480, lastUpdated: new Date().toISOString() },
  { id: 'inv-010', name: 'Mutton', category: 'Meat', baseUnit: 'kg', currentStock: 5, minStock: 10, criticalStock: 2, maxStock: 30, unitPrice: 650, expiryDate: '2024-01-24', lastUpdated: new Date().toISOString() },
  { id: 'inv-011', name: 'Yogurt', category: 'Dairy', baseUnit: 'kg', currentStock: 10, minStock: 5, criticalStock: 1, maxStock: 20, unitPrice: 80, lastUpdated: new Date().toISOString() },
  { id: 'inv-012', name: 'Green Chili', category: 'Vegetables', baseUnit: 'kg', currentStock: 2, minStock: 1, criticalStock: 0.2, maxStock: 5, unitPrice: 120, lastUpdated: new Date().toISOString() },
  { id: 'inv-013', name: 'Ginger', category: 'Vegetables', baseUnit: 'kg', currentStock: 3, minStock: 2, criticalStock: 0.5, maxStock: 8, unitPrice: 180, lastUpdated: new Date().toISOString() },
  { id: 'inv-014', name: 'Garlic', category: 'Vegetables', baseUnit: 'kg', currentStock: 4, minStock: 2, criticalStock: 0.5, maxStock: 10, unitPrice: 200, lastUpdated: new Date().toISOString() },
  { id: 'inv-015', name: 'Coriander Leaves', category: 'Vegetables', baseUnit: 'kg', currentStock: 1.5, minStock: 1, criticalStock: 0.2, maxStock: 5, unitPrice: 100, lastUpdated: new Date().toISOString() },
];

const initialRecipes: Recipe[] = [
  // Chicken Biryani - Full
  {
    id: 'rec-001',
    menuItemId: '8',
    menuItemName: 'Chicken Biryani',
    portionSize: 'full',
    portionMultiplier: 1,
    ingredients: [
      { inventoryItemId: 'inv-001', quantity: 200, unit: 'g' }, // Rice
      { inventoryItemId: 'inv-002', quantity: 250, unit: 'g' }, // Chicken
      { inventoryItemId: 'inv-003', quantity: 100, unit: 'g' }, // Onions
      { inventoryItemId: 'inv-004', quantity: 50, unit: 'g' },  // Tomatoes
      { inventoryItemId: 'inv-005', quantity: 30, unit: 'ml' }, // Oil
      { inventoryItemId: 'inv-007', quantity: 5, unit: 'g' },   // Garam Masala
      { inventoryItemId: 'inv-011', quantity: 50, unit: 'g' },  // Yogurt
    ],
  },
  // Chicken Biryani - Half
  {
    id: 'rec-002',
    menuItemId: '8',
    menuItemName: 'Chicken Biryani',
    portionSize: 'half',
    portionMultiplier: 0.5,
    ingredients: [
      { inventoryItemId: 'inv-001', quantity: 100, unit: 'g' },
      { inventoryItemId: 'inv-002', quantity: 125, unit: 'g' },
      { inventoryItemId: 'inv-003', quantity: 50, unit: 'g' },
      { inventoryItemId: 'inv-004', quantity: 25, unit: 'g' },
      { inventoryItemId: 'inv-005', quantity: 15, unit: 'ml' },
      { inventoryItemId: 'inv-007', quantity: 2.5, unit: 'g' },
      { inventoryItemId: 'inv-011', quantity: 25, unit: 'g' },
    ],
  },
  // Butter Chicken
  {
    id: 'rec-003',
    menuItemId: '5',
    menuItemName: 'Butter Chicken',
    portionSize: 'full',
    portionMultiplier: 1,
    ingredients: [
      { inventoryItemId: 'inv-002', quantity: 300, unit: 'g' }, // Chicken
      { inventoryItemId: 'inv-009', quantity: 50, unit: 'g' },  // Butter
      { inventoryItemId: 'inv-008', quantity: 100, unit: 'ml' }, // Cream
      { inventoryItemId: 'inv-004', quantity: 150, unit: 'g' }, // Tomatoes
      { inventoryItemId: 'inv-003', quantity: 50, unit: 'g' },  // Onions
      { inventoryItemId: 'inv-007', quantity: 5, unit: 'g' },   // Garam Masala
    ],
  },
  // Paneer Tikka
  {
    id: 'rec-004',
    menuItemId: '1',
    menuItemName: 'Paneer Tikka',
    portionSize: 'full',
    portionMultiplier: 1,
    ingredients: [
      { inventoryItemId: 'inv-006', quantity: 200, unit: 'g' }, // Paneer
      { inventoryItemId: 'inv-011', quantity: 50, unit: 'g' },  // Yogurt
      { inventoryItemId: 'inv-007', quantity: 3, unit: 'g' },   // Garam Masala
      { inventoryItemId: 'inv-005', quantity: 20, unit: 'ml' }, // Oil
    ],
  },
  // Dal Makhani
  {
    id: 'rec-005',
    menuItemId: '6',
    menuItemName: 'Dal Makhani',
    portionSize: 'full',
    portionMultiplier: 1,
    ingredients: [
      { inventoryItemId: 'inv-009', quantity: 30, unit: 'g' },  // Butter
      { inventoryItemId: 'inv-008', quantity: 50, unit: 'ml' }, // Cream
      { inventoryItemId: 'inv-003', quantity: 30, unit: 'g' },  // Onions
      { inventoryItemId: 'inv-004', quantity: 50, unit: 'g' },  // Tomatoes
    ],
  },
  // Paneer Butter Masala
  {
    id: 'rec-006',
    menuItemId: '7',
    menuItemName: 'Paneer Butter Masala',
    portionSize: 'full',
    portionMultiplier: 1,
    ingredients: [
      { inventoryItemId: 'inv-006', quantity: 250, unit: 'g' }, // Paneer
      { inventoryItemId: 'inv-009', quantity: 40, unit: 'g' },  // Butter
      { inventoryItemId: 'inv-008', quantity: 80, unit: 'ml' }, // Cream
      { inventoryItemId: 'inv-004', quantity: 100, unit: 'g' }, // Tomatoes
      { inventoryItemId: 'inv-003', quantity: 40, unit: 'g' },  // Onions
    ],
  },
];

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      items: initialInventory,
      recipes: initialRecipes,

      addItem: (item) => {
        const newItem: InventoryItem = {
          ...item,
          id: `inv-${Date.now()}`,
          lastUpdated: new Date().toISOString(),
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },

      updateStock: (itemId, quantity, operation) => {
        const item = get().items.find((i) => i.id === itemId);
        if (!item) return false;

        const newStock = operation === 'add' 
          ? item.currentStock + quantity 
          : item.currentStock - quantity;

        if (newStock < 0) return false;

        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId
              ? { ...i, currentStock: newStock, lastUpdated: new Date().toISOString() }
              : i
          ),
        }));
        return true;
      },

      updateItem: (itemId, updates) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === itemId
              ? { ...i, ...updates, lastUpdated: new Date().toISOString() }
              : i
          ),
        }));
      },

      addRecipe: (recipe) => {
        const newRecipe: Recipe = {
          ...recipe,
          id: `rec-${Date.now()}`,
        };
        set((state) => ({ recipes: [...state.recipes, newRecipe] }));
      },

      updateRecipe: (recipeId, updates) => {
        set((state) => ({
          recipes: state.recipes.map((r) =>
            r.id === recipeId ? { ...r, ...updates } : r
          ),
        }));
      },

      deductForMenuItem: (menuItemId, quantity, portionSize = 'full') => {
        const recipes = get().recipes.filter(
          (r) => r.menuItemId === menuItemId && r.portionSize === portionSize
        );

        if (recipes.length === 0) {
          // No recipe found, skip deduction
          return { success: true, errors: [] };
        }

        const recipe = recipes[0];
        const errors: string[] = [];
        const deductions: { itemId: string; amount: number }[] = [];

        // Calculate all deductions first
        for (const ingredient of recipe.ingredients) {
          const item = get().items.find((i) => i.id === ingredient.inventoryItemId);
          if (!item) continue;

          const requiredInBaseUnit = convertUnit(
            ingredient.quantity * quantity,
            ingredient.unit,
            item.baseUnit
          );

          if (item.currentStock < requiredInBaseUnit) {
            errors.push(`Insufficient ${item.name}: need ${requiredInBaseUnit.toFixed(2)}${item.baseUnit}, have ${item.currentStock.toFixed(2)}${item.baseUnit}`);
          } else {
            deductions.push({ itemId: item.id, amount: requiredInBaseUnit });
          }
        }

        if (errors.length > 0) {
          return { success: false, errors };
        }

        // Apply all deductions
        for (const deduction of deductions) {
          get().updateStock(deduction.itemId, deduction.amount, 'subtract');
        }

        return { success: true, errors: [] };
      },

      canOrderMenuItem: (menuItemId, quantity, portionSize = 'full') => {
        const recipes = get().recipes.filter(
          (r) => r.menuItemId === menuItemId && r.portionSize === portionSize
        );

        if (recipes.length === 0) {
          return { canOrder: true, lowStockItems: [], blockedItems: [] };
        }

        const recipe = recipes[0];
        const lowStockItems: string[] = [];
        const blockedItems: string[] = [];

        for (const ingredient of recipe.ingredients) {
          const item = get().items.find((i) => i.id === ingredient.inventoryItemId);
          if (!item) continue;

          const requiredInBaseUnit = convertUnit(
            ingredient.quantity * quantity,
            ingredient.unit,
            item.baseUnit
          );

          if (item.currentStock <= item.criticalStock) {
            blockedItems.push(item.name);
          } else if (item.currentStock < requiredInBaseUnit) {
            blockedItems.push(item.name);
          } else if (item.currentStock < item.minStock) {
            lowStockItems.push(item.name);
          }
        }

        return {
          canOrder: blockedItems.length === 0,
          lowStockItems,
          blockedItems,
        };
      },

      getItemById: (id) => get().items.find((i) => i.id === id),

      getLowStockItems: () => get().items.filter((i) => i.currentStock < i.minStock && i.currentStock > i.criticalStock),

      getCriticalStockItems: () => get().items.filter((i) => i.currentStock <= i.criticalStock),
    }),
    {
      name: 'inventory-storage',
    }
  )
);
