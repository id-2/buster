import { BusterDataset } from '@/api/busterv2/datasets';
import { AppMaterialIcons } from '@/components';
import AppDataGrid from '@/components/table/AppDataGrid';
import { useUserConfigContextSelector } from '@/context/Users';
import { createBusterRoute, BusterRoutes } from '@/routes';
import { useAntToken } from '@/styles/useAntToken';
import { Button } from 'antd';
import Link from 'next/link';
import React from 'react';
import { Text, Title } from '@/components/text';
import { useMemoizedFn } from 'ahooks';
import isEmpty from 'lodash/isEmpty';
import { createStyles } from 'antd-style';

export const OverviewData: React.FC<{
  definition: BusterDataset['definition'];
  datasetId: string;
  data: BusterDataset['data'];
}> = React.memo(({ definition, datasetId, data }) => {
  const token = useAntToken();
  const isAdmin = useUserConfigContextSelector((state) => state.isAdmin);

  const defaultCellFormatter = useMemoizedFn((value: any, key: string): string => {
    return String(value);
  });

  if (!definition) {
    return (
      <div className="flex justify-center pt-12">
        <div
          className="flex max-w-[300px] flex-col items-center justify-center space-y-5"
          style={{}}>
          <div className="flex flex-col items-center space-y-3">
            <Title level={4}>Build your dataset</Title>
            <Text
              type="secondary"
              className="text-center">{`To build your dataset, you’ll need to create a data model or view with our SQL editor.`}</Text>
          </div>
          <Link
            prefetch
            href={createBusterRoute({
              route: BusterRoutes.APP_DATASETS_ID_SQL,
              datasetId
            })}>
            <Button type="default" icon={<AppMaterialIcons icon="add" />}>
              Build dataset
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="buster-chart h-full w-full overflow-auto"
      style={{
        maxHeight: '500px',
        border: `0.5px solid ${token.colorBorder}`,
        borderRadius: `${token.borderRadius}px`
      }}>
      {!isEmpty(data) ? (
        <AppDataGrid
          rows={data || []}
          headerFormat={isAdmin ? (v) => v : undefined}
          cellFormat={defaultCellFormatter}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
});

OverviewData.displayName = 'OverviewData';

const EmptyState = () => {
  const { styles, cx } = useStyles();
  return (
    <div className={cx(styles.emptyState, 'flex justify-center py-24')}>
      <Text type="tertiary">No data available</Text>
    </div>
  );
};

const useStyles = createStyles(({ token }) => ({
  emptyState: {
    background: token.colorBgBase
  }
}));
