import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BusterListColumn, BusterListProps, BusterListRow, BusterListRowItem } from './interfaces';
import { VariableSizeList as List } from 'react-window';
import { createStyles } from 'antd-style';
import { Text } from '@/components/text';
import { Checkbox } from 'antd';
import { useDebounceFn, useMemoizedFn } from 'ahooks';
import { useRouter } from 'next/navigation';
import { BusterListContentMenu } from './BusterListContentMenu';
import tailwind from '../../../../tailwind.config';
import AutoSizer from 'react-virtualized-auto-sizer';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import get from 'lodash/get';
import Link from 'next/link';

const sizes = tailwind.theme.fontSize;
const HEIGHT_OF_HEADER = 32;
const HEIGHT_OF_SECTION_ROW = 36;
const HEIGHT_OF_ROW = 48;
const WIDTH_OF_CHECKBOX_COLUMN = 30;

export const BusterList: React.FC<BusterListProps> = ({
  columns,
  rows,
  selectedRowKeys,
  onSelectChange,
  emptyState,
  showHeader = true,
  columnHeaderVariant,
  contextMenu,
  showSelectAll = true
}) => {
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
    const x = e.clientX - 5;
    const y = e.clientY - 5; // offset the top by 30px
    const menuWidth = 250; // width of the menu
    const menuHeight = 200; // height of the menu
    const pageWidth = window.innerWidth;
    const pageHeight = window.innerHeight;

    // Ensure the menu does not render offscreen horizontally
    const adjustedX = Math.min(Math.max(0, x), pageWidth - menuWidth);
    // Ensure the menu does not render offscreen vertically, considering the offset
    const adjustedY = Math.min(Math.max(0, y), pageHeight - menuHeight);

    setContextMenuPosition({
      x: adjustedX,
      y: adjustedY,
      show: true,
      id: id,
      scrollYPosition: window.scrollY
    });
  });

  // const { run: onScrollListener } = useDebounceFn(
  //   useMemoizedFn((e: React.UIEvent<HTMLDivElement>) => {
  //     if (!contextMenu) return;
  //     const newScrollY = (e.target as HTMLElement).scrollTop;
  //     const scrollYDelta = newScrollY - scrollY.current;
  //     const hasMoved50PixelsFromScrollYPosition =
  //       Math.abs((contextMenuPosition?.scrollYPosition || 0) - newScrollY) > 35;
  //     scrollY.current = newScrollY;
  //     setContextMenuPosition((v) => ({
  //       ...v!,
  //       show: !!v?.show && !hasMoved50PixelsFromScrollYPosition,
  //       y: (v?.y || 0) - scrollYDelta
  //     }));
  //   }),
  //   { wait: 50 }
  // );

  const itemSize = useMemoizedFn((index: number) => {
    const row = rows[index];
    return row.rowSection ? HEIGHT_OF_SECTION_ROW : HEIGHT_OF_ROW;
  });

  const globalCheckStatus = useMemo(() => {
    if (!selectedRowKeys) return 'unchecked';
    if (selectedRowKeys.length === 0) return 'unchecked';
    if (selectedRowKeys.length === rows.length) return 'checked';
    return 'indeterminate';
  }, [selectedRowKeys?.length, rows.length]);

  const itemData = useMemo(() => {
    return {
      columns,
      rows,
      selectedRowKeys,
      onSelectChange: onSelectChange ? onSelectChangePreflight : undefined,
      onSelectSectionChange: onSelectChange ? onSelectSectionChange : undefined,
      onContextMenuClick
    };
  }, [columns, rows, selectedRowKeys, onSelectChange, onSelectSectionChange, onContextMenuClick]);

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
      {showHeader && !showEmptyState && (
        <BusterListHeader
          columns={columns}
          onGlobalSelectChange={onGlobalSelectChange}
          globalCheckStatus={globalCheckStatus}
          rowsLength={rows.length}
          showSelectAll={showSelectAll}
        />
      )}

      {!showEmptyState && (
        <div className="relative h-full w-full">
          <AutoSizer>
            {({ height, width }) => (
              <List
                height={height}
                width={width}
                estimatedItemSize={HEIGHT_OF_ROW}
                overscanCount={10}
                itemData={itemData}
                itemSize={itemSize}
                itemCount={rows.length}>
                {({ index, style, data }) => (
                  <BusterListRowComponentSelector
                    style={style}
                    row={rows[index]}
                    id={rows[index].id}
                    {...data}
                  />
                )}
              </List>
            )}
          </AutoSizer>
        </div>
      )}

      {showEmptyState && (
        <div className="flex h-full items-center justify-center">{emptyState}</div>
      )}

      {contextMenu && contextMenuPosition?.id && (
        <BusterListContentMenu
          ref={contextMenuRef}
          open={!!contextMenuPosition?.show}
          menu={contextMenu}
          id={contextMenuPosition?.id || ''}
          placement={{ x: contextMenuPosition?.x || 0, y: contextMenuPosition?.y || 0 }}
        />
      )}
    </div>
  );
};
BusterList.displayName = 'BusterList';
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
  }) => {
    const handleChange = useMemoizedFn((e: CheckboxChangeEvent) => {
      onChange?.(e.target.checked);
    });

    return <Checkbox checked={checked} indeterminate={indeterminate} onChange={handleChange} />;
  }
);
MemoizedCheckbox.displayName = 'MemoizedCheckbox';

const CheckboxColumn: React.FC<{
  checkStatus: 'checked' | 'unchecked' | 'indeterminate' | undefined;
  onChange: (v: boolean) => void;
  className?: string;
}> = React.memo(({ checkStatus, onChange, className = '' }) => {
  const { styles, cx } = useStyles();
  const showBox = checkStatus === 'checked' || checkStatus === 'indeterminate';

  const onClickStopPropagation = useMemoizedFn((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  });

  return (
    <div
      onClick={onClickStopPropagation}
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
});
CheckboxColumn.displayName = 'CheckboxColumn';

const BusterListHeader: React.FC<{
  columns: BusterListColumn[];
  onGlobalSelectChange?: (v: boolean) => void;
  globalCheckStatus?: 'checked' | 'unchecked' | 'indeterminate';
  showSelectAll?: boolean;
  rowsLength: number;
}> = React.memo(
  ({ columns, showSelectAll = true, onGlobalSelectChange, globalCheckStatus, rowsLength }) => {
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
            className={cx({
              'opacity-100': showGlobalCheckbox,
              '!invisible': rowsLength === 0,
              'pointer-events-none !invisible !opacity-0': !showSelectAll
            })}
          />
        )}

        {columns.map((column, index) => (
          <div
            className="header-cell flex items-center"
            key={column.dataIndex}
            style={{
              width: column.width || '100%',
              flex: column.width ? 'none' : 1,
              marginRight: index === columns.length - 1 ? '24px' : undefined
            }}>
            {column.headerRender ? (
              column.headerRender(column.title)
            ) : (
              <Text size="sm" type="secondary" ellipsis>
                {column.title}
              </Text>
            )}
          </div>
        ))}
      </div>
    );
  }
);
BusterListHeader.displayName = 'BusterListHeader';

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
    style: React.CSSProperties;
  }
>(
  (
    {
      style,
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
          style={style}
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
        style={style}
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
      style: React.CSSProperties;
    }
  >(({ rowSection, onSelectSectionChange, id, selectedRowKeys, rows, style }, ref) => {
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

    const onChange = useMemoizedFn((checked: boolean) => {
      onSelectSectionChange?.(checked, id);
    });

    return (
      <div className={cx(styles.sectionRow, 'group flex items-center')} style={style} ref={ref}>
        {onSelectSectionChange && <CheckboxColumn checkStatus={checkStatus} onChange={onChange} />}

        <div className="flex items-center space-x-2 pl-[4px] leading-none">
          <Text size="sm">{rowSection.title}</Text>
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
      style: React.CSSProperties;
    }
  >(({ style, row, columns, onSelectChange, checked, onContextMenuClick }, ref) => {
    const { styles, cx } = useStyles();
    const link = row.link;
    // const router = useRouter();

    const onClick = useMemoizedFn(() => {
      // if (link) {
      //   const isLocalLink = link.startsWith('/');
      //   if (isLocalLink) {
      //     router.push(link);
      //   } else {
      //     window.open(link, '_blank');
      //   }
      // }
      row.onClick?.();
    });

    const onContextMenu = useMemoizedFn((e: React.MouseEvent<HTMLDivElement>) => {
      onContextMenuClick?.(e, row.id);
    });

    const onChange = useMemoizedFn((checked: boolean) => {
      onSelectChange?.(checked, row.id);
    });

    return (
      <LinkWrapper href={link}>
        <div
          onClick={onClick}
          style={style}
          onContextMenu={onContextMenu}
          className={cx(styles.row, 'group flex items-center', checked ? 'checked' : '', {
            clickable: !!(link || row.onClick)
          })}
          ref={ref}>
          {!!onSelectChange ? (
            <CheckboxColumn checkStatus={checked ? 'checked' : 'unchecked'} onChange={onChange} />
          ) : (
            <div className="pl-2.5"></div>
          )}
          {columns.map((column, columnIndex) => (
            <BusterListCellComponent
              key={column.dataIndex}
              data={get(row.data, column.dataIndex)}
              row={row}
              render={column.render}
              isFirstCell={columnIndex === 0}
              isLastCell={columnIndex === columns.length - 1}
              width={column.width}
              onSelectChange={onSelectChange}
            />
          ))}
        </div>
      </LinkWrapper>
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
  width?: number | undefined;
  onSelectChange?: (v: boolean, id: string) => void;
  render?: (data: string | number | React.ReactNode, row: BusterListRowItem) => React.ReactNode;
}> = React.memo(({ data, width, row, render, isFirstCell, isLastCell, onSelectChange }) => {
  const { styles, cx } = useStyles();

  const memoizedStyle = useMemo(() => {
    return {
      width: width || '100%',
      flex: width ? 'none' : 1,
      marginRight: isLastCell ? (!!onSelectChange ? '24px' : '12px') : undefined
    };
  }, [width, isLastCell, onSelectChange]);

  return (
    <div
      className={cx(styles.cell, 'row-cell flex items-center overflow-hidden', {
        secondary: !isFirstCell
      })}
      style={memoizedStyle}>
      <div className="w-full truncate">{render ? render(data, row?.data) : data}</div>
    </div>
  );
});
BusterListCellComponent.displayName = 'BusterListCellComponent';

const useStyles = createStyles(({ token, css }) => ({
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
    width: ${WIDTH_OF_CHECKBOX_COLUMN}px;
    min-width: ${WIDTH_OF_CHECKBOX_COLUMN}px;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  sectionRow: css`
    height: ${HEIGHT_OF_SECTION_ROW}px;
    min-height: ${HEIGHT_OF_SECTION_ROW}px;
    background-color: ${token.controlItemBgActive};
    //  border-bottom: 0.5px solid ${token.colorBorder};
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

const LinkWrapper: React.FC<{
  href?: string;
  children: React.ReactNode;
}> = ({ href, children }) => {
  if (!href) return <>{children}</>;
  return (
    <Link href={href} prefetch={true}>
      {children}
    </Link>
  );
};
