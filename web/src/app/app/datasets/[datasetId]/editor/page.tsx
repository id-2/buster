'use client';

import React from 'react';
import { useDatasetPageContextSelector } from '../_DatasetPageContext';
import { AppSplitter } from '@/components';
import { SQLContainer } from './SQLContainer';
import { DataContainer } from './DataContainer';
import { useMemoizedFn } from 'ahooks';

const defaultLayout = ['auto', '170px'];

export default function Page() {
  const dataset = useDatasetPageContextSelector((state) => state.dataset);
  const datasetData = useDatasetPageContextSelector((state) => state.datasetData);
  const sql = useDatasetPageContextSelector((state) => state.sql);
  const setSQL = useDatasetPageContextSelector((state) => state.setSQL);

  const error = '';

  const onRunQuery = useMemoizedFn(async () => {
    alert('TODO: Run query');
  });

  return (
    <div className="h-full w-full p-5">
      <AppSplitter
        leftChildren={
          <SQLContainer
            className="mb-3"
            datasetSQL={sql}
            setDatasetSQL={setSQL}
            error={error}
            onRunQuery={onRunQuery}
          />
        }
        rightChildren={<DataContainer className="mt-3" data={datasetData.data} />}
        split="horizontal"
        defaultLayout={defaultLayout}
        autoSaveId="dataset-editor"
        preserveSide="left"
        rightPanelMinSize={'80px'}
      />
    </div>
  );
}
