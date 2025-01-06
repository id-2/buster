'use client';

import React, { useContext, useEffect, useMemo } from 'react';
import { Breadcrumb, Button, Divider, Skeleton } from 'antd';
import Link from 'next/link';
import { BusterRoutes, createBusterRoute } from '@/routes';
import { AppSegmented, AppTooltip, PreventNavigation } from '@/components';
import { useDatasetContextSelector } from '@/context/Datasets';
import { useHotkeys } from 'react-hotkeys-hook';
import { AppContentHeader } from '../../_components/AppContentHeader';
import { BreadcrumbSeperator } from '@/styles/context/useBreadcrumbStyles';
import { SegmentedProps } from 'antd/lib';
import { DataSetAppIcons, DatasetApps, DataSetAppText } from './_config';
import { BusterDataset } from '@/api/busterv2/datasets';
import { useMemoizedFn } from 'ahooks';
import { PublishDatasetModal } from './_PublishModal';
import { useRouter } from 'next/navigation';
import { useUserConfigContextSelector } from '@/context/Users';

export const DatasetsIndividualHeader: React.FC<{
  selectedApp: DatasetApps;
  selectedDataset: BusterDataset | undefined;
  setSQL: (sql: string) => void;
  sql: string;
}> = ({ sql, selectedDataset, setSQL, selectedApp }) => {
  const isAdmin = useUserConfigContextSelector((state) => state.isAdmin);
  const setOpenNewDatasetModal = useDatasetContextSelector((state) => state.setOpenNewDatasetModal);
  const showSkeletonLoader = !selectedDataset?.id;
  const [openPublishModal, setOpenPublishModal] = React.useState(false);

  const isSQLApp = selectedApp === DatasetApps.SQL;

  const disablePublish = useMemo(() => {
    const originalSQL = selectedDataset?.definition || '';
    return originalSQL === sql;
  }, [selectedDataset?.definition, sql]);

  const preventNavigation = !disablePublish;

  const breadcrumbItems = [
    {
      title: (
        <Link prefetch href={createBusterRoute({ route: BusterRoutes.APP_DATASETS })}>
          Datasets
        </Link>
      )
    },
    {
      title: selectedDataset?.name
    }
  ].filter((item) => item.title);

  const onReset = useMemoizedFn(() => {
    setSQL(selectedDataset?.definition || '');
  });

  const onClosePublishModal = useMemoizedFn(() => {
    setOpenPublishModal(false);
  });

  const onOkayPreventNavigation = useMemoizedFn(async () => {
    setOpenPublishModal(true);
  });

  const onCancelPreventNavigation = useMemoizedFn(async () => {
    setTimeout(() => {
      onReset();
    }, 300);
  });

  useHotkeys('d', () => {
    setOpenNewDatasetModal(true);
  });

  useHotkeys('p', () => {
    if (isSQLApp) setOpenPublishModal(true);
  });

  if (showSkeletonLoader) return <SkeletonLoader />;

  return (
    <>
      <AppContentHeader className="items-center justify-between space-x-2">
        <div className="flex space-x-1">
          <Breadcrumb
            className="flex items-center"
            items={breadcrumbItems}
            separator={<BreadcrumbSeperator />}
          />
          {/* <DatasetFilters
            activeFilters={dashboardListFilters}  
            onChangeFilter={onSetDatasetListFilters}
          /> */}
        </div>

        <div className="flex items-center">
          <DatasetsHeaderOptions
            isAdmin={isAdmin}
            selectedApp={selectedApp}
            datasetId={selectedDataset?.id || ''}
          />

          <div
            className="flex items-center"
            style={{
              display: isSQLApp ? 'flex' : 'none'
            }}>
            <Divider type="vertical" className="!h-5" />

            <div className="flex items-center space-x-2">
              <Button type="text" onClick={onReset} disabled={sql === selectedDataset?.definition}>
                Reset
              </Button>

              <AppTooltip title={'Open publish dataset'} shortcuts={['p']}>
                <Button
                  type="primary"
                  disabled={disablePublish}
                  onClick={() => {
                    setOpenPublishModal(true);
                  }}>
                  Publish
                </Button>
              </AppTooltip>
            </div>
          </div>
        </div>
      </AppContentHeader>

      <PublishDatasetModal
        open={openPublishModal}
        selectedDataset={selectedDataset}
        sql={sql}
        onClose={onClosePublishModal}
      />

      <PreventNavigation
        isDirty={preventNavigation}
        title="Would you like to publish your changes to this dataset?"
        description="You are about to leave this page without publishing changes. Would you like to publish your changes before you leave?"
        okText="Publish changes"
        cancelText="Discard changes"
        onOk={onOkayPreventNavigation}
        onCancel={onCancelPreventNavigation}
        doNotLeavePageOnOkay
      />
    </>
  );
};

const keyToRoute = (datasetId: string, key: DatasetApps) => {
  const record: Record<DatasetApps, string> = {
    [DatasetApps.DESCRIPTIONS]: createBusterRoute({
      route: BusterRoutes.APP_DATASETS_ID_DESCRIPTIONS,
      datasetId
    }),
    [DatasetApps.OVERVIEW]: createBusterRoute({
      route: BusterRoutes.APP_DATASETS_ID_OVERVIEW,
      datasetId
    }),
    [DatasetApps.SQL]: createBusterRoute({
      route: BusterRoutes.APP_DATASETS_ID_SQL,
      datasetId
    })
  };

  return record[key];
};

const DatasetsHeaderOptions: React.FC<{
  selectedApp: DatasetApps;
  isAdmin: boolean;
  datasetId: string;
}> = ({ datasetId, isAdmin, selectedApp }) => {
  const { push } = useRouter();
  const optionsItems = isAdmin
    ? [DatasetApps.OVERVIEW, DatasetApps.DESCRIPTIONS, DatasetApps.SQL]
    : [DatasetApps.OVERVIEW, DatasetApps.DESCRIPTIONS];
  const options: SegmentedProps['options'] = optionsItems.map((key) => ({
    label: (
      <Link prefetch href={keyToRoute(datasetId, key)}>
        {DataSetAppText[key as DatasetApps]}
      </Link>
    ),
    value: key,
    icon: DataSetAppIcons[key as DatasetApps]
  }));
  return (
    <AppSegmented
      options={options}
      value={selectedApp}
      onChange={(value) => {
        push(keyToRoute(datasetId, value as DatasetApps));
      }}
    />
  );
};

const SkeletonLoader: React.FC<{}> = () => {
  const size = 'small';
  const buttonShape = 'round';

  return (
    <AppContentHeader className="items-center justify-between space-x-2">
      <div className="flex h-full w-3/4 items-center justify-center space-x-2">
        <Skeleton.Button
          className="!flex h-full min-w-12 !items-center"
          size={size}
          shape={buttonShape}
          style={{ width: '100%' }}
        />

        <Skeleton.Input
          block
          className="!flex h-full w-24 !items-center overflow-hidden rounded"
          size={size}
        />
      </div>
    </AppContentHeader>
  );
};
