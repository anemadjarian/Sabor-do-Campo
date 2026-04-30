import { useCallback, useEffect, useState } from 'react';
import { createMenuItem, fetchCategories, fetchMenuItems } from '../services/menuService';

export function useMenu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCategories = useCallback(async () => {
    const data = await fetchCategories();
    setCategories(data ?? []);
  }, []);

  const loadItems = useCallback(async (category = '') => {
    setIsLoading(true);
    setError('');

    try {
      const data = await fetchMenuItems(category);
      setItems(data ?? []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories().catch(() => setCategories([]));
  }, [loadCategories]);

  useEffect(() => {
    loadItems(selectedCategory);
  }, [loadItems, selectedCategory]);

  const refreshMenu = useCallback(() => loadItems(selectedCategory), [loadItems, selectedCategory]);

  const addMenuItem = useCallback(async (payload) => {
    const createdItem = await createMenuItem(payload);
    await loadItems(selectedCategory);
    return createdItem;
  }, [loadItems, selectedCategory]);

  return {
    categories,
    items,
    isLoading,
    error,
    selectedCategory,
    setSelectedCategory,
    refreshMenu,
    addMenuItem,
  };
}
