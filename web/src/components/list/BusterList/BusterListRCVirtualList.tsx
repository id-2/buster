import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BusterListColumn, BusterListProps, BusterListRow, BusterListRowItem } from './interfaces';
import List from 'rc-virtual-list';
import { createStyles } from 'antd-style';
import { Text } from '@/components/text';
import { Checkbox } from 'antd';
import { useDebounceFn, useMemoizedFn, useSize } from 'ahooks';
import { useRouter } from 'next/navigation';
import { BusterListContentMenu } from './BusterListContentMenu';
import tailwind from '../../../../tailwind.config';

const sizes = tailwind.theme.fontSize;
const HEIGHT_OF_HEADER = 32;
const HEIGHT_OF_SECTION_ROW = 36;
const HEIGHT_OF_ROW = 48;

export const BusterListRCVirtualList: React.FC<BusterListProps> = ({
  columns,
  rows,
  selectedRowKeys,
  onSelectChange,
  emptyState,
  showHeader = true,

  columnHeaderVariant,
  contextMenu
}) => {
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef);
  const conatinerHeight = containerSize?.height || 850;
  const containerWidth = containerSize?.width || 700;
  const listHeight = showHeader ? conatinerHeight - HEIGHT_OF_HEADER : conatinerHeight;
  const showEmptyState = (!rows || rows.length === 0) && !!emptyState;
  const scrollY = useRef(0);

  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
    scrollYPosition: number;
    show: boolean;
    id: string;
  } | null>(null);

  const onGlobalSelectChange = useMemoizedFn((v: boolean) => {
    onSelectChange?.(v ? rows.map((row) => row.id) : []);
  });

  const onSelectSectionChange = useMemoizedFn((v: boolean, id: string) => {
    if (!onSelectChange) return;
    const idsInSection = getAllIdsInSection(rows, id);

    if (v === false) {
      onSelectChange(selectedRowKeys?.filter((d) => !idsInSection.includes(d)) || []);
    } else {
      onSelectChange(selectedRowKeys?.concat(idsInSection) || []);
    }
  });

  const onSelectChangePreflight = useMemoizedFn((v: boolean, id: string) => {
    if (!onSelectChange || !selectedRowKeys) return;
    if (v === false) {
      onSelectChange(selectedRowKeys?.filter((d) => d !== id));
    } else {
      onSelectChange(selectedRowKeys?.concat(id) || []);
    }
  });

  const onContextMenuClick = useMemoizedFn((e: React.MouseEvent<HTMLDivElement>, id: string) => {
    if (!contextMenu) return;
    e.stopPropagation();
    e.preventDefault();
    setContextMenuPosition({
      x: e.clientX,
      y: e.clientY,
      show: true,
      id: id,
      scrollYPosition: (e.target as HTMLElement).scrollTop
    });
  });

  const { run: onScrollListener } = useDebounceFn(
    useMemoizedFn((e: React.UIEvent<HTMLDivElement>) => {
      if (!contextMenu) return;
      const newScrollY = (e.target as HTMLElement).scrollTop;
      const scrollYDelta = newScrollY - scrollY.current;
      const hasMoved50PixelsFromScrollYPosition =
        Math.abs((contextMenuPosition?.scrollYPosition || 0) - newScrollY) > 35;
      scrollY.current = newScrollY;
      setContextMenuPosition((v) => ({
        ...v!,
        show: !!v?.show && !hasMoved50PixelsFromScrollYPosition,
        y: (v?.y || 0) - scrollYDelta
      }));
    }),
    { wait: 50 }
  );

  const globalCheckStatus = useMemo(() => {
    if (!selectedRowKeys) return 'unchecked';
    if (selectedRowKeys.length === 0) return 'unchecked';
    if (selectedRowKeys.length === rows.length) return 'checked';
    return 'indeterminate';
  }, [selectedRowKeys?.length, rows.length]);

  //context menu click away
  useEffect(() => {
    if (contextMenu && contextMenuPosition?.show) {
      const listenForClickAwayFromContextMenu = (e: MouseEvent) => {
        if (!contextMenuRef.current?.contains(e.target as Node)) {
          setContextMenuPosition((v) => ({
            ...v!,
            show: false
          }));
        }
      };
      document.addEventListener('click', listenForClickAwayFromContextMenu);
      return () => {
        document.removeEventListener('click', listenForClickAwayFromContextMenu);
      };
    }
  }, [contextMenuRef, contextMenuPosition?.show, contextMenu]);

  return (
    <div
      className="list-container relative flex h-full w-full flex-col overflow-hidden"
      ref={containerRef}>
      {showHeader && (
        <BusterListHeader
          columns={columns}
          onGlobalSelectChange={onGlobalSelectChange}
          globalCheckStatus={globalCheckStatus}
        />
      )}

      {!showEmptyState && (
        <List
          itemHeight={HEIGHT_OF_SECTION_ROW}
          // scrollWidth={containerWidth}
          height={listHeight}
          itemKey={'id'}
          data={rows}
          virtual={true}
          onScroll={onScrollListener}>
          {(data, index, props) => (
            <BusterListRowComponentSelector
              {...props}
              key={index}
              id={data.id}
              row={data}
              onSelectChange={onSelectChangePreflight}
              onSelectSectionChange={onSelectSectionChange}
              columns={columns}
              selectedRowKeys={selectedRowKeys}
              rows={rows}
              onContextMenuClick={onContextMenuClick}
            />
          )}
        </List>
      )}

      {showEmptyState && (
        <div className="flex h-full items-center justify-center">{emptyState}</div>
      )}

      {contextMenu && (
        <BusterListContentMenu
          ref={contextMenuRef}
          open={!!contextMenuPosition?.show}
          menu={contextMenu}
          placement={{ x: contextMenuPosition?.x || 0, y: contextMenuPosition?.y || 0 }}
          id={contextMenuPosition?.id || ''}
        />
      )}
    </div>
  );
};

// Add a memoized checkbox component
const MemoizedCheckbox = React.memo(
  ({
    checked,
    indeterminate,
    onChange
  }: {
    checked: boolean;
    indeterminate: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <Checkbox
      checked={checked}
      indeterminate={indeterminate}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  )
);
MemoizedCheckbox.displayName = 'MemoizedCheckbox';

const CheckboxColumn: React.FC<{
  checkStatus: 'checked' | 'unchecked' | 'indeterminate' | undefined;
  onChange: (v: boolean) => void;
  className?: string;
}> = ({ checkStatus, onChange, className = '' }) => {
  const { styles, cx } = useStyles();
  const showBox = checkStatus === 'checked' || checkStatus === 'indeterminate';

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={cx(
        styles.checkboxColumn,
        'flex items-center justify-center opacity-0',
        className,
        'group-hover:opacity-100',
        showBox ? 'opacity-100' : ''
      )}>
      <MemoizedCheckbox
        checked={checkStatus === 'checked'}
        indeterminate={checkStatus === 'indeterminate'}
        onChange={onChange}
      />
    </div>
  );
};

const BusterListHeader: React.FC<{
  columns: BusterListColumn[];
  onGlobalSelectChange?: (v: boolean) => void;
  globalCheckStatus?: 'checked' | 'unchecked' | 'indeterminate';
}> = ({ columns, onGlobalSelectChange, globalCheckStatus }) => {
  const { styles, cx } = useStyles();
  const showCheckboxColumn = !!onGlobalSelectChange;
  const showGlobalCheckbox =
    globalCheckStatus === 'indeterminate' || globalCheckStatus === 'checked';

  return (
    <div className={cx(styles.header, 'group')}>
      {showCheckboxColumn && (
        <CheckboxColumn
          checkStatus={globalCheckStatus}
          onChange={(v) => onGlobalSelectChange?.(v)}
          className={showGlobalCheckbox ? 'opacity-100' : ''}
        />
      )}

      {columns.map((column) => (
        <div
          className="header-cell flex items-center"
          key={column.dataIndex}
          style={{
            width: column.width || '100%',
            flex: column.width ? 'none' : 1
          }}>
          <Text size="sm" type="secondary" ellipsis>
            {column.title}
          </Text>
        </div>
      ))}
    </div>
  );
};

const BusterListRowComponentSelector = React.forwardRef<
  HTMLDivElement,
  {
    row: BusterListRow;
    columns: BusterListColumn[];
    id: string;
    onSelectChange?: (v: boolean, id: string) => void;
    onSelectSectionChange?: (v: boolean, id: string) => void;
    onContextMenuClick?: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
    selectedRowKeys?: string[];
    rows: BusterListRow[];
  }
>(
  (
    {
      row,
      rows,
      columns,
      onSelectChange,
      onSelectSectionChange,
      selectedRowKeys,
      onContextMenuClick
    },
    ref
  ) => {
    if (row.rowSection) {
      return (
        <BusterListSectionComponent
          rowSection={row.rowSection}
          ref={ref}
          id={row.id}
          key={row.id}
          rows={rows}
          selectedRowKeys={selectedRowKeys}
          onSelectSectionChange={onSelectSectionChange}
        />
      );
    }

    return (
      <BusterListRowComponent
        row={row}
        columns={columns}
        key={row.id}
        onSelectChange={onSelectChange}
        checked={!!selectedRowKeys?.includes(row.id)}
        ref={ref}
        onContextMenuClick={onContextMenuClick}
      />
    );
  }
);
BusterListRowComponentSelector.displayName = 'BusterListRowComponent';

const BusterListSectionComponent = React.memo(
  React.forwardRef<
    HTMLDivElement,
    {
      rowSection: NonNullable<BusterListRow['rowSection']>;
      onSelectSectionChange?: (v: boolean, id: string) => void;
      id: string;
      selectedRowKeys?: string[];
      rows: BusterListRow[];
    }
  >(({ rowSection, onSelectSectionChange, id, selectedRowKeys, rows }, ref) => {
    const { styles, cx } = useStyles();

    const indexOfSection = useMemo(() => {
      return rows.findIndex((row) => row.id === id);
    }, [rows.length, id]);

    const idsInSection = useMemo(() => {
      return getAllIdsInSection(rows, id);
    }, [rows.length, id]);

    const checkStatus = useMemo(() => {
      if (!selectedRowKeys) return 'unchecked';
      if (rowSection.disableSection) return 'unchecked';
      if (selectedRowKeys?.length === 0) return 'unchecked';

      const allIdsSelected = idsInSection.every((id) => selectedRowKeys.includes(id));
      if (allIdsSelected) return 'checked';
      const someIdsSelected = idsInSection.some((id) => selectedRowKeys.includes(id));
      if (someIdsSelected) return 'indeterminate';
      return 'unchecked';
    }, [selectedRowKeys?.length, idsInSection, indexOfSection, rowSection]);

    return (
      <div className={cx(styles.sectionRow, 'group flex items-center')} ref={ref}>
        {onSelectSectionChange && (
          <CheckboxColumn
            checkStatus={checkStatus}
            onChange={(v) => onSelectSectionChange?.(v, id)}
          />
        )}

        <div
          className="flex items-center space-x-2"
          style={{
            paddingLeft: 4,
            lineHeight: 1
          }}>
          <Text size="sm" type="secondary">
            {rowSection.title}
          </Text>
          <Text size="sm" type="tertiary">
            {rowSection.secondaryTitle}
          </Text>
        </div>
      </div>
    );
  })
);
BusterListSectionComponent.displayName = 'BusterListSectionComponent';

const BusterListRowComponent = React.memo(
  React.forwardRef<
    HTMLDivElement,
    {
      row: BusterListRow;
      columns: BusterListColumn[];
      checked: boolean;
      onSelectChange?: (v: boolean, id: string) => void;
      onContextMenuClick?: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
    }
  >(({ row, columns, onSelectChange, checked, onContextMenuClick }, ref) => {
    const { styles, cx } = useStyles();
    const link = row.link;
    const router = useRouter();

    const onClick = useMemoizedFn(() => {
      if (link) {
        const isLocalLink = link.startsWith('/');
        if (isLocalLink) {
          router.push(link);
        } else {
          window.open(link, '_blank');
        }
      }
      row.onClick?.();
    });

    return (
      <div
        onClick={onClick}
        onContextMenu={(e) => {
          onContextMenuClick?.(e, row.id);
        }}
        className={cx(styles.row, 'group flex items-center', checked ? 'checked' : '', {
          clickable: !!(link || row.onClick)
        })}
        ref={ref}>
        {!!onSelectChange && (
          <CheckboxColumn
            checkStatus={checked ? 'checked' : 'unchecked'}
            onChange={(checked) => {
              onSelectChange(checked, row.id);
            }}
          />
        )}
        {columns.map((column, columnIndex) => (
          <div
            className="row-cell overflow-hidden"
            key={column.dataIndex}
            style={{
              width: column.width || '100%',
              flex: column.width ? 'none' : 1
            }}>
            <BusterListCellComponent
              data={row.data![column.dataIndex]}
              row={row}
              render={column.render}
              isFirstCell={columnIndex === 0}
              isLastCell={columnIndex === columns.length - 1}
            />
          </div>
        ))}
      </div>
    );
  }),
  (prevProps, nextProps) => {
    return prevProps.checked === nextProps.checked && prevProps.row.id === nextProps.row.id;
  }
);
BusterListRowComponent.displayName = 'BusterListRowComponent';

const BusterListCellComponent: React.FC<{
  data: string | number | React.ReactNode;
  row: BusterListRowItem['data'];
  isFirstCell?: boolean;
  isLastCell?: boolean;
  render?: (data: string | number | React.ReactNode, row: BusterListRowItem) => React.ReactNode;
}> = ({ data, row, render, isFirstCell, isLastCell }) => {
  const { styles, cx } = useStyles();
  return (
    <div
      className={cx(styles.cell, 'truncate', {
        secondary: !isFirstCell
      })}>
      {render ? render(data, row?.data) : data}
    </div>
  );
};

const useStyles = createStyles(({ token, prefixCls, css }) => ({
  header: css`
    height: ${HEIGHT_OF_HEADER}px;
    min-height: ${HEIGHT_OF_HEADER}px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    border-bottom: 0.5px solid ${token.colorBorder};

    .header-cell {
      padding: 0 4px;
      height: 100%;

      &:first-child {
        padding-left: 18px;
      }
    }
  `,
  row: css`
    height: ${HEIGHT_OF_ROW}px;
    min-height: ${HEIGHT_OF_ROW}px;

    border-bottom: 0.5px solid ${token.colorBorder};

    &:hover {
      background-color: ${token.controlItemBgHover};
    }

    &.clickable {
      cursor: pointer;
    }

    .row-cell {
      padding: 0 4px;
      display: flex;
      align-items: center;
      height: 100%;
    }

    &.checked {
      background-color: ${token.colorPrimaryBg};
      &:hover {
        background-color: ${token.colorPrimaryBgHover};
      }
    }
  `,
  checkboxColumn: css`
    padding-left: 4px;
    padding-right: 0px;
    width: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  sectionRow: css`
    height: ${HEIGHT_OF_SECTION_ROW}px;
    min-height: ${HEIGHT_OF_SECTION_ROW}px;
    background-color: ${token.controlItemBgActive};
    border-bottom: 0.5px solid ${token.colorBorder};
    &:hover {
      background-color: ${token.controlItemBgActiveHover};
    }
  `,
  cell: css`
    color: ${token.colorText};
    font-size: ${sizes.base};

    &.secondary {
      color: ${token.colorTextTertiary};
      font-size: ${sizes.sm};
    }
  `
}));

const getAllIdsInSection = (rows: BusterListRow[], sectionId: string) => {
  const sectionIndex = rows.findIndex((row) => row.id === sectionId);
  if (sectionIndex === -1) return [];

  const ids: string[] = [];

  // Start from the row after the section
  for (let i = sectionIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    // Stop if we hit another section row
    if (row.rowSection) break;
    ids.push(row.id);
  }

  return ids;
};
