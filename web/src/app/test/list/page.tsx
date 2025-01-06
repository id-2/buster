'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  BusterListColumn,
  BusterListRow,
  BusterListRowItem,
  BusterListSectionRow
} from '@/components/list';
import { faker } from '@faker-js/faker';
import { BusterAvatar } from '@/components';
import { BusterList } from '@/components/list/BusterList/BusterListReactWindow';

export default function ListTest() {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const rows = useMemo(() => {
    if (!mounted) return [];
    return datarows;
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative h-[65vh] w-[800px] border-red-500 bg-white">
      <BusterList
        columns={columns}
        rows={rows}
        selectedRowKeys={selectedRowKeys}
        onSelectChange={setSelectedRowKeys}
        emptyState={<div>No data</div>}
      />
    </div>
  );
}

const columns: BusterListColumn[] = [
  {
    dataIndex: 'title',
    title: 'Title',
    render: (value) => (
      <div className="flex space-x-2">
        <div>{value}</div>
        <BusterAvatar />
        <div>test</div>
      </div>
    )
  },
  { dataIndex: 'lastUpdated', title: 'Last updated', width: 110 },
  { dataIndex: 'dataset', title: 'Dataset', width: 120 },
  { dataIndex: 'sharing', title: 'Sharing', width: 130 },
  { dataIndex: 'owner', title: 'Owner', width: 140 }
];
const sections = [1, 2, 3, 4, 5, 6, 7];
const datarows: BusterListRow[] = sections.flatMap((section) => {
  const rows: BusterListRowItem[] = Array.from({ length: 30 * section }).map((_, index) => {
    return {
      id: `row-${index}-section-${section}`,
      type: 'primary',
      data: columns.reduce<Record<string, string>>((acc, column, columnIndex) => {
        acc[column.dataIndex] = index === 0 ? faker.lorem.paragraph() : faker.lorem.word();
        if (index === section * 12 - 1) {
          acc[column.dataIndex] = 'last';
        }
        return acc;
      }, {})
    };
  });
  const section1: BusterListSectionRow = {
    title: `Section ${section}`,
    secondaryTitle: `${rows.length} rows`
  };
  const sectionRow: BusterListRow = {
    id: `section-${section}`,
    data: null,
    rowSection: section1
  };

  return [sectionRow, ...rows];
});
