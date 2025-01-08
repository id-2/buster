'use client';

import { AppSegmented } from '@/components';
import { SegmentedProps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import { DatasetApps, DataSetAppText } from '../_config';
import { createBusterRoute, BusterRoutes } from '@/routes';

export const DatasetsHeaderOptions: React.FC<{
  selectedApp: DatasetApps;
  isAdmin: boolean;
  datasetId: string;
}> = React.memo(({ datasetId, isAdmin, selectedApp }) => {
  const { push } = useRouter();
  const optionsItems = isAdmin
    ? [DatasetApps.OVERVIEW, DatasetApps.PERMISSIONS, DatasetApps.EDITOR]
    : [DatasetApps.OVERVIEW, DatasetApps.PERMISSIONS];

  const options: SegmentedProps['options'] = useMemo(
    () =>
      optionsItems.map((key) => ({
        label: (
          <Link prefetch href={keyToRoute(datasetId, key)}>
            {DataSetAppText[key as DatasetApps]}
          </Link>
        ),
        value: key
      })),
    [datasetId, optionsItems]
  );

  return (
    <AppSegmented
      options={options}
      value={selectedApp}
      onChange={(value) => {
        push(keyToRoute(datasetId, value as DatasetApps));
      }}
    />
  );
});
DatasetsHeaderOptions.displayName = 'DatasetsHeaderOptions';

const keyToRoute = (datasetId: string, key: DatasetApps) => {
  const record: Record<DatasetApps, string> = {
    [DatasetApps.PERMISSIONS]: createBusterRoute({
      route: BusterRoutes.APP_DATASETS_ID_DESCRIPTIONS,
      datasetId
    }),
    [DatasetApps.OVERVIEW]: createBusterRoute({
      route: BusterRoutes.APP_DATASETS_ID_OVERVIEW,
      datasetId
    }),
    [DatasetApps.EDITOR]: createBusterRoute({
      route: BusterRoutes.APP_DATASETS_ID_SQL,
      datasetId
    })
  };

  return record[key];
};
