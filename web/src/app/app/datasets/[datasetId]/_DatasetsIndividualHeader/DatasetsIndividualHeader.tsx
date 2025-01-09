'use client';

import React, { useMemo } from 'react';
import { Button, Divider } from 'antd';
import { AppTooltip, PreventNavigation } from '@/components';
import { useDatasetContextSelector } from '@/context/Datasets';
import { useHotkeys } from 'react-hotkeys-hook';
import { AppContentHeader } from '../../../_components/AppContentHeader';
import { DatasetApps } from '../_config';
import { BusterDataset } from '@/api/busterv2/datasets';
import { useMemoizedFn } from 'ahooks';
import { useUserConfigContextSelector } from '@/context/Users';
import { DatasetsHeaderOptions } from './DatasetHeaderOptions';
import { DatasetBreadcrumb } from './DatasetBreadcrumb';
import { DatasetIndividualThreeDotMenu } from './DatasetIndividualThreeDotMenu';

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

  const isSQLApp = selectedApp === DatasetApps.EDITOR;

  const disablePublish = useMemo(() => {
    const originalSQL = selectedDataset?.definition || '';
    return !selectedDataset?.id || !sql || originalSQL === sql;
  }, [selectedDataset?.definition, sql]);

  const preventNavigation = !disablePublish;

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

  const onOpenPublishModal = useMemoizedFn(() => {
    setOpenPublishModal(true);
  });

  useHotkeys('d', () => {
    setOpenNewDatasetModal(true);
  });

  useHotkeys('p', () => {
    if (isSQLApp) setOpenPublishModal(true);
  });

  if (showSkeletonLoader) return <></>;

  return (
    <>
      <AppContentHeader className="items-center justify-between space-x-2">
        <div className="flex items-center space-x-3">
          <DatasetBreadcrumb datasetName={selectedDataset?.name} />

          <DatasetsHeaderOptions
            isAdmin={isAdmin}
            selectedApp={selectedApp}
            datasetId={selectedDataset?.id || ''}
          />
        </div>

        <div className="flex items-center">
          <div className="flex items-center">
            <DatasetIndividualThreeDotMenu datasetId={selectedDataset?.id} />

            <Divider type="vertical" className="!h-4" />

            <div className="flex items-center space-x-2">
              <Button type="text" onClick={onReset} disabled={sql === selectedDataset?.definition}>
                Reset
              </Button>
              <AppTooltip title={'Open publish dataset'} shortcuts={['p']}>
                <Button type="primary" disabled={disablePublish} onClick={onOpenPublishModal}>
                  Publish
                </Button>
              </AppTooltip>
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
        onOk={onOkayPreventNavigation}
        onCancel={onCancelPreventNavigation}
        doNotLeavePageOnOkay
      />
    </>
  );
};
