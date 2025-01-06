'use client';

import { BusterList } from '@/components/list/BusterList';
import { faker } from '@faker-js/faker';
import type { BusterListColumn, BusterListRow } from '@/components/list/BusterList/interfaces';
import { useMemo, useState } from 'react';
import { useMount } from 'ahooks';

const columns: BusterListColumn[] = [
  { dataIndex: 'title', title: 'Title' },
  { dataIndex: 'lastUpdated', title: 'Last updated', width: 110 },
  { dataIndex: 'dataset', title: 'Dataset', width: 120 },
  { dataIndex: 'sharing', title: 'Sharing', width: 130 },
  { dataIndex: 'owner', title: 'Owner', width: 140 }
];

export default function ListTest() {
  const [mounted, setMounted] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  const rows: BusterListRow[] = useMemo(() => {
    if (!mounted) return [];

    return datarows;
  }, [mounted]);

  useMount(() => {
    setMounted(true);
  });

  return (
    <div className="relative h-[65vh] w-[800px] border-red-500 bg-white">
      <BusterList
        columns={columns}
        rows={rows}
        onSelectChange={(v) => {
          setSelectedRowKeys(v);
        }}
        selectedRowKeys={selectedRowKeys}
      />
    </div>
  );
}

const sections = [1, 2, 3];
const datarows = sections.flatMap((section) => {
  const rows = Array.from({ length: 100 }).map((_, index) => {
    return {
      id: `row-${index}-section-${section}`,
      data: columns.reduce<Record<string, string>>((acc, column, index) => {
        acc[column.dataIndex] = index === 0 ? faker.lorem.paragraph() : faker.lorem.word();
        return acc;
      }, {})
    };
  });
  const sectionRow: BusterListRow = {
    id: `section-${section}`,
    data: {},
    rowSection: {
      title: `Section ${section}`,
      secondaryTitle: `${rows.length} rows`
    }
  };

  return [sectionRow, ...rows];
});
