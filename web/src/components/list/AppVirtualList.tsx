import React, { useLayoutEffect, useRef, useState } from 'react';
import VirtualList, { ListRef } from 'rc-virtual-list';
import { AnimatePresence, Variants, motion } from 'framer-motion';
import { useWindowSize } from '@/hooks';
import { useDebounce, useMemoizedFn, usePrevious } from 'ahooks';

export const AppVirtualList: React.FC<{
  items: {
    id: string;
    component: React.ReactNode;
    itemHeight: number;
  }[];
  initialHeight: number;
  initialItemHeight: number;
}> = ({ items, initialHeight, initialItemHeight }) => {
  const [virtualKey, setVirtualKey] = useState(0);
  const [height, setHeight] = useState(initialHeight);
  const listRef = React.useRef<ListRef>(null);
  const [newItemIds, setNewItemIds] = useState<string[]>([]);
  const [isRemovingIds, setIsRemovingIds] = useState<string[]>([]);
  const windowHeight = useDebounce(useWindowSize().height, { wait: 100 });

  const internalItems = useRef(items);

  const onAddFromData = useMemoizedFn(() => {
    const itemsNotInOld = items.filter(
      (item) => !internalItems.current.some((oldItem) => oldItem.id === item.id)
    );
    setNewItemIds((prev) => [...prev, ...itemsNotInOld.map((item) => item.id)]);
    internalItems.current = items;
  });

  const onAddedComplete = (id: string) => {
    setNewItemIds((prev) => prev.filter((i) => i !== id));
  };

  const onRemoveAnimationStart = (id: string) => {
    setIsRemovingIds((prev) => [...prev, id]);
  };

  const onRemoveFromData = (id: string) => {
    internalItems.current = internalItems.current.filter((item) => item.id !== id);
    //force update
    setIsRemovingIds((prev) => prev.filter((i) => i !== id));
  };

  useLayoutEffect(() => {
    if (listRef && listRef.current?.nativeElement) {
      const parentHeight = listRef.current?.nativeElement.parentElement?.clientHeight;
      setHeight(parentHeight || height);
    }
  }, [listRef, windowHeight]);

  useLayoutEffect(() => {
    const currentItemIds = items.map((item) => item.id);
    const previousItemIds = internalItems.current.map((item) => item.id);

    const itemsRemoved = internalItems.current.filter((item) => !currentItemIds.includes(item.id));
    const itemsAdded = items.filter(
      (item) => !internalItems.current.some((oldItem) => oldItem.id === item.id)
    );

    if (itemsRemoved.length === itemsAdded.length) {
      setVirtualKey((prev) => prev + 1);
      internalItems.current = items;
      return;
    }

    itemsRemoved.forEach((item) => {
      onRemoveAnimationStart(item.id);
    });

    itemsAdded.forEach((item) => {
      onAddFromData();
    });
  }, [items]);

  return (
    <>
      <AnimatePresence initial={false} key={String(virtualKey)}>
        <VirtualList
          data={internalItems.current}
          height={height}
          itemHeight={initialItemHeight}
          itemKey="id"
          ref={listRef}
          style={{
            boxSizing: 'border-box'
          }}>
          {(item) => (
            <ForwardMyVirtualItem
              {...item}
              newItemIds={newItemIds}
              removeItemIds={isRemovingIds}
              onAnimationComplete={onAddedComplete}
              onRemoveAnimationStart={onRemoveAnimationStart}
              onRemoveFromData={onRemoveFromData}
            />
          )}
        </VirtualList>
      </AnimatePresence>
    </>
  );
};

const MyVirtualItem: React.ForwardRefRenderFunction<
  HTMLDivElement,
  {
    id: string;
    component: React.ReactNode;
    itemHeight: number;
    onAnimationComplete: (id: string) => void;
    onRemoveAnimationStart: (id: string) => void;
    onRemoveFromData: (id: string) => void;
    newItemIds: string[];
    removeItemIds: string[];
  }
> = (
  {
    id,
    component,
    removeItemIds,
    onRemoveAnimationStart,
    onRemoveFromData,
    onAnimationComplete,
    newItemIds,
    itemHeight
  },
  ref
) => {
  const isAnimating = newItemIds.includes(id);
  const isRemoving = removeItemIds.includes(id);
  const variants: Variants = {
    hidden: isAnimating ? { opacity: 1, height: 0 } : { opacity: 1, height: itemHeight },
    visible: { opacity: 1, height: itemHeight },
    exit: { opacity: 0, height: 0 }
  };
  const animateProp = isRemoving ? 'exit' : isAnimating ? 'visible' : 'hidden';

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={animateProp}
      exit="exit"
      custom={id}
      variants={variants}
      transition={{ duration: 0.3 }}
      onAnimationComplete={(v) => {
        onAnimationComplete(id);
        if (v === 'exit' && isRemoving) {
          onRemoveFromData(id);
        }
      }}>
      {component}
    </motion.div>
  );
};

const ForwardMyVirtualItem = React.forwardRef(MyVirtualItem);
