import { useState, useEffect } from 'react';

interface VirtualizationOptions {
  items: any[];
  height: number;
  itemHeight: number;
}

export const useVirtualization = ({ items, height, itemHeight }: VirtualizationOptions) => {
  const [visibleItems, setVisibleItems] = useState(items);

  useEffect(() => {
    const visibleCount = Math.ceil(height / itemHeight);
    const slicedItems = items.slice(0, visibleCount);
    setVisibleItems(slicedItems);
  }, [items, height, itemHeight]);

  return visibleItems;
};