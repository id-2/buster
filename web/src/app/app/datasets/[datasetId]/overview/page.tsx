'use client';

import React, { useMemo } from 'react';
import { useDatasetPageContextSelector } from '../_DatasetPageContext';
import { BusterDataset } from '@/api/busterv2/datasets';
import { AppMaterialIcons, EditableTitle, Title, PulseLoader, Text } from '@/components';
import { AppDropdownSelect } from '@/components/dropdown';
import { AppDataSourceIcon } from '@/components/icons/AppDataSourceIcons';
import AppDataGrid from '@/components/table/AppDataGrid';
import { useDatasetContextSelector, useDatasets } from '@/context/Datasets';
import { useDataSourceContextSelector } from '@/context/DataSources';
import { useUserConfigContextSelector } from '@/context/Users';
import { createBusterRoute, BusterRoutes } from '@/routes';
import { useAntToken } from '@/styles/useAntToken';
import { formatDate } from '@/utils';
import { useMemoizedFn, useMount } from 'ahooks';
import { MenuProps, Dropdown, Button, Divider } from 'antd';
import Link from 'next/link';
import { OverviewHeader } from './OverviewHeader';
import { OverviewData } from './OverviewData';

export default function Page() {
  const selectedApp = useDatasetPageContextSelector((state) => state.selectedApp);
  const dataset = useDatasetPageContextSelector((state) => state.dataset);
  const sql = useDatasetPageContextSelector((state) => state.sql);
  const setSQL = useDatasetPageContextSelector((state) => state.setSQL);

  const showSkeletonLoader = !dataset || !dataset?.id;

  console.log(dataset);

  return (
    <div className="mx-auto overflow-y-auto px-14 pb-12 pt-12">
      <>
        {showSkeletonLoader ? (
          <></>
        ) : (
          <div className="flex w-full flex-col space-y-5">
            <OverviewHeader
              datasetId={dataset.id}
              description={dataset.when_to_use}
              name={dataset.name}
            />

            <Divider />

            <OverviewData
              definition={dataset.definition}
              datasetId={dataset.id}
              data={dataset.data}
            />
          </div>
        )}
      </>
    </div>
  );
}
