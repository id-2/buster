'use client';

import React from 'react';
import { Breadcrumb, Button } from 'antd';
import Link from 'next/link';
import { BusterRoutes, createBusterRoute } from '@/routes';
import { AppMaterialIcons, AppTooltip } from '@/components';
import { NewDatasetModal } from './_NewDatasetModal';
import { AppContentHeader } from '../_components/AppContentHeader';
import { useDatasetContextSelector, useIndividualDataset } from '@/context/Datasets';
import { useHotkeys } from 'react-hotkeys-hook';
import { useUserConfigContextSelector } from '@/context/Users';

export const DatasetHeader: React.FC<{}> = React.memo(() => {
  const openedDatasetId = useDatasetContextSelector((state) => state.openedDatasetId);
  const openNewDatasetModal = useDatasetContextSelector((state) => state.openNewDatasetModal);
  const setOpenNewDatasetModal = useDatasetContextSelector((state) => state.setOpenNewDatasetModal);
  const isAdmin = useUserConfigContextSelector((state) => state.isAdmin);
  const { dataset } = useIndividualDataset({ datasetId: openedDatasetId });
  const datasetTitle = dataset?.name || 'Datasets';

  const breadcrumbItems = [
    {
      title: (
        <Link
          suppressHydrationWarning
          href={
            openedDatasetId
              ? createBusterRoute({
                  route: BusterRoutes.APP_DATASETS_ID_OVERVIEW,
                  datasetId: openedDatasetId
                })
              : createBusterRoute({ route: BusterRoutes.APP_DATASETS })
          }>
          {datasetTitle}
        </Link>
      )
    }
  ].filter((item) => item.title);

  useHotkeys('d', () => {
    setOpenNewDatasetModal(true);
  });

  return (
    <>
      <AppContentHeader className="items-center justify-between space-x-2">
        <div className="flex space-x-1">
          <Breadcrumb className="flex items-center" items={breadcrumbItems} />
          {/* <DatasetFilters
            activeFilters={dashboardListFilters}
            onChangeFilter={onSetDatasetListFilters}
          /> */}
        </div>

        <div className="flex items-center">
          {isAdmin && (
            <AppTooltip title={'Create new dashboard'} shortcuts={['D']}>
              <Button
                type="default"
                icon={<AppMaterialIcons icon="add" />}
                onClick={() => setOpenNewDatasetModal(true)}>
                New Dataset
              </Button>
            </AppTooltip>
          )}
        </div>
      </AppContentHeader>

      {isAdmin && (
        <NewDatasetModal open={openNewDatasetModal} onClose={() => setOpenNewDatasetModal(false)} />
      )}
    </>
  );
});
DatasetHeader.displayName = 'DatasetHeader';
