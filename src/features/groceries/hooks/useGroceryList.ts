import { useState, useEffect } from 'react';
import { GroceryItem, GroceryCategory } from '../../../types';
import { storageGet, storageSet, STORAGE_KEYS } from '../../../lib/storage';

const DEFAULT_ITEMS: GroceryItem[] = [
  { id: 'g1', name: 'Potato', category: 'produce', inStock: true, addedAt: '2024-01-01' },
  { id: 'g2', name: 'Onion', category: 'produce', inStock: true, addedAt: '2024-01-01' },
  { id: 'g3', name: 'Spinach', category: 'produce', inStock: true, addedAt: '2024-01-01' },
  { id: 'g4', name: 'Arugula', category: 'produce', inStock: true, addedAt: '2024-01-01' },
  { id: 'g5', name: 'Avocado', category: 'produce', inStock: true, addedAt: '2024-01-01' },
  { id: 'g6', name: 'Eggs', category: 'protein', inStock: true, addedAt: '2024-01-01' },
  { id: 'g7', name: 'Ham', category: 'protein', inStock: true, addedAt: '2024-01-01' },
  { id: 'g8', name: 'Frozen patties', category: 'protein', inStock: true, addedAt: '2024-01-01' },
  { id: 'g9', name: 'Chicken breast', category: 'protein', inStock: false, addedAt: '2024-01-01' },
  { id: 'g10', name: 'Greek yogurt', category: 'dairy', inStock: true, addedAt: '2024-01-01' },
  { id: 'g11', name: 'Cheese', category: 'dairy', inStock: true, addedAt: '2024-01-01' },
  { id: 'g12', name: 'Milk', category: 'dairy', inStock: true, addedAt: '2024-01-01' },
  { id: 'g13', name: 'Olive oil', category: 'pantry', inStock: true, addedAt: '2024-01-01' },
  { id: 'g14', name: 'Cinnamon', category: 'pantry', inStock: true, addedAt: '2024-01-01' },
  { id: 'g15', name: 'Rolled oats', category: 'pantry', inStock: false, addedAt: '2024-01-01' },
];

export function useGroceryList() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    storageGet<GroceryItem[]>(STORAGE_KEYS.GROCERIES).then((stored) => {
      if (stored && stored.length > 0) {
        setItems(stored);
      } else {
        setItems(DEFAULT_ITEMS);
        storageSet(STORAGE_KEYS.GROCERIES, DEFAULT_ITEMS);
      }
      setInitialised(true);
    });
  }, []);

  const persist = async (updated: GroceryItem[]) => {
    setItems(updated);
    await storageSet(STORAGE_KEYS.GROCERIES, updated);
  };

  const addItem = (name: string, category: GroceryCategory, quantity?: string) => {
    const newItem: GroceryItem = {
      id: `g${Date.now()}`,
      name: name.trim(),
      category,
      quantity,
      inStock: true,
      addedAt: new Date().toISOString().split('T')[0],
    };
    persist([...items, newItem]);
  };

  const toggleInStock = (id: string) => {
    persist(items.map((item) => (item.id === id ? { ...item, inStock: !item.inStock } : item)));
  };

  const removeItem = (id: string) => {
    persist(items.filter((item) => item.id !== id));
  };

  const inStockItems = items.filter((i) => i.inStock);

  return { items, inStockItems, addItem, toggleInStock, removeItem, initialised };
}
