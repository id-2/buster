import { useAntToken } from '@/styles/useAntToken';
import { useMemoizedFn } from 'ahooks';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SplitPane, { Pane } from '@/components/layout/SplitPane';
import { createAutoSaveId } from './helper';
import Cookies from 'js-cookie';

export const AppSplitter: React.FC<{
  leftChildren: React.ReactNode;
  rightChildren: React.ReactNode;
  autoSaveId: string;
  defaultLayout: (string | number)[];
  leftPanelMinSize?: number | string;
  rightPanelMinSize?: number | string;
  leftPanelMaxSize?: number | string;
  rightPanelMaxSize?: number | string;
  className?: string;
  allowResize?: boolean;
  split?: 'vertical' | 'horizontal';
  splitterClassName?: string;
  preserveSide: 'left' | 'right' | null;
  rightHidden?: boolean;
  leftHidden?: boolean;
  style?: React.CSSProperties;
  hideSplitter?: boolean;
}> = ({
  style,
  leftChildren,
  preserveSide,
  rightChildren,
  autoSaveId,
  defaultLayout,
  leftPanelMinSize,
  rightPanelMinSize,
  split,
  leftPanelMaxSize,
  rightPanelMaxSize,
  allowResize,
  className,
  splitterClassName,
  leftHidden,
  rightHidden,
  hideSplitter
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [sizes, setSizes] = useState<(number | string)[]>(defaultLayout);
  const ref = React.useRef<HTMLDivElement>(null);
  const hasHidden = useMemo(() => leftHidden || rightHidden, [leftHidden, rightHidden]);
  const _allowResize = useMemo(() => (hasHidden ? false : allowResize), [hasHidden, allowResize]);

  const _sizes = useMemo(
    () => (hasHidden ? (leftHidden ? ['0px', 'auto'] : ['auto', '0px']) : sizes),
    [hasHidden, leftHidden, sizes]
  );

  const memoizedLeftPaneStyle = useMemo(() => {
    return {
      display: leftHidden ? 'none' : undefined
    };
  }, [leftHidden]);

  const memoizedRightPaneStyle = useMemo(() => {
    return {
      display: rightHidden ? 'none' : undefined
    };
  }, [rightHidden]);

  const sashRender = useMemoizedFn((_: number, active: boolean) => (
    <AppSplitterSash
      hideSplitter={hideSplitter}
      active={active}
      splitterClassName={splitterClassName}
    />
  ));

  const onDragEnd = useMemoizedFn(() => {
    setIsDragging(false);
  });

  const onDragStart = useMemoizedFn(() => {
    setIsDragging(true);
  });

  const onChangePanels = useMemoizedFn((sizes: number[]) => {
    if (!isDragging) return;
    setSizes(sizes);
    const key = createAutoSaveId(autoSaveId);
    const sizesString = preserveSide === 'left' ? [sizes[0], 'auto'] : ['auto', sizes[1]];
    Cookies.set(key, JSON.stringify(sizesString), { expires: 365 });
  });

  const onPreserveSide = useMemoizedFn(() => {
    const [left, right] = sizes;
    if (preserveSide === 'left') {
      setSizes([left, 'auto']);
    } else if (preserveSide === 'right') {
      setSizes(['auto', right]);
    }
  });

  useEffect(() => {
    if (preserveSide) {
      window.addEventListener('resize', onPreserveSide);
      return () => {
        window.removeEventListener('resize', onPreserveSide);
      };
    }
  }, [preserveSide]);

  return (
    <div ref={ref} className="h-full w-full">
      <SplitPane
        split={split}
        className={`${className}`}
        sizes={_sizes}
        style={style}
        allowResize={_allowResize}
        onChange={onChangePanels}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        resizerSize={3}
        sashRender={sashRender}>
        <Pane
          style={memoizedLeftPaneStyle}
          className="flex h-full flex-col"
          minSize={leftPanelMinSize}
          maxSize={leftPanelMaxSize}>
          {leftHidden ? null : leftChildren}
        </Pane>
        <Pane
          className="flex h-full flex-col"
          style={memoizedRightPaneStyle}
          minSize={rightPanelMinSize}
          maxSize={rightPanelMaxSize}>
          {rightHidden ? null : rightChildren}
        </Pane>
      </SplitPane>
    </div>
  );
};
AppSplitter.displayName = 'AppSplitter';

const AppSplitterSash: React.FC<{
  active: boolean;
  splitterClassName?: string;
  hideSplitter?: boolean;
}> = React.memo(({ active, splitterClassName = 'w-[0.5px] absolute', hideSplitter = false }) => {
  const token = useAntToken();

  const splitterStyle = useMemo(() => {
    return {
      left: '1px',
      background: hideSplitter
        ? active
          ? token.colorBorder
          : undefined
        : active
          ? token.colorPrimary
          : token.colorBorder
    };
  }, [hideSplitter, active]);

  return (
    <div
      className={`h-full cursor-col-resize transition ${splitterClassName}`}
      style={splitterStyle}
    />
  );
});
AppSplitterSash.displayName = 'AppSplitterSash';
