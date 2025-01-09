'use client';

import React, { useMemo } from 'react';
import { Button, Divider } from 'antd';
import { PreventNavigation } from '@/components';
import { useDatasetContextSelector } from '@/context/Datasets';
import { useHotkeys } from 'react-hotkeys-hook';
import { AppContentHeader } from '../../../_components/AppContentHeader';
import { DatasetApps } from '../_config';
import { useMemoizedFn } from 'ahooks';
import { useUserConfigContextSelector } from '@/context/Users';
import { DatasetsHeaderOptions } from './DatasetHeaderOptions';
import { DatasetBreadcrumb } from './DatasetBreadcrumb';
import { DatasetIndividualThreeDotMenu } from './DatasetIndividualThreeDotMenu';

export const DatasetsIndividualHeader: React.FC<{
  selectedApp: DatasetApps;
  datasetId: string | undefined;
  datasetSQL: string | undefined;
  setSQL: (sql: string) => void;
  sql: string | undefined;
  datasetName: string | undefined;
}> = React.memo(({ sql, setSQL, selectedApp, datasetId, datasetSQL, datasetName }) => {
  const isAdmin = useUserConfigContextSelector((state) => state.isAdmin);
  const setOpenNewDatasetModal = useDatasetContextSelector((state) => state.setOpenNewDatasetModal);

  const disablePublish = useMemo(() => {
    const originalSQL = datasetSQL || '';
    return !datasetId || !sql || originalSQL === sql;
  }, [datasetSQL, sql, datasetId]);

  const preventNavigation = !disablePublish;

  const onReset = useMemoizedFn(() => {
    setSQL(datasetSQL || '');
  });

  const onPublishDataset = useMemoizedFn(async () => {
    // setOpenPublishModal(true);
    alert('TODO: Publish dataset');
  });

  const onCancelPreventNavigation = useMemoizedFn(async () => {
    setTimeout(() => {
      onReset();
    }, 300);
  });

  useHotkeys('d', () => {
    setOpenNewDatasetModal(true);
  });

  return (
    <>
      <AppContentHeader className="items-center justify-between space-x-2">
        <div className="flex items-center space-x-3">
          <DatasetBreadcrumb datasetName={datasetName} />

          <DatasetsHeaderOptions
            isAdmin={isAdmin}
            selectedApp={selectedApp}
            datasetId={datasetId}
          />
        </div>

        <div className="flex items-center">
          <div className="flex items-center">
            <DatasetIndividualThreeDotMenu datasetId={datasetId} />

            <Divider type="vertical" className="!h-4" />

            <div className="flex items-center space-x-2">
              <Button type="text" onClick={onReset} disabled={sql === datasetSQL}>
                Reset
              </Button>
              <Button type="primary" disabled={disablePublish} onClick={onPublishDataset}>
                Publish
              </Button>
            </div>
          </div>
        </div>
      </AppContentHeader>

      <PreventNavigation
        isDirty={preventNavigation}
        title="Would you like to publish your changes to this dataset?"
        description="You are about to leave this page without publishing changes. Would you like to publish your changes before you leave?"
        okText="Publish changes"
        cancelText="Discard changes"
        onOk={onPublishDataset}
        onCancel={onCancelPreventNavigation}
        doNotLeavePageOnOkay
      />
    </>
  );
});

DatasetsIndividualHeader.displayName = 'DatasetsIndividualHeader';
