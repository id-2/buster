'use client';

import React, { useMemo } from 'react';
import { useDatasetPageContextSelector } from '../_DatasetPageContext';
import { OverviewHeader } from './OverviewHeader';
import { OverviewData } from './OverviewData';
import { Divider } from 'antd';

export default function Page() {
  const selectedApp = useDatasetPageContextSelector((state) => state.selectedApp);
  const dataset = useDatasetPageContextSelector((state) => state.dataset);
  const datasetData = useDatasetPageContextSelector((state) => state.datasetData);
  const isFetchedDataset = useDatasetPageContextSelector((state) => state.isFetchedDataset);
  const isFetchedDatasetData = useDatasetPageContextSelector((state) => state.isFetchedDatasetData);
  const sql = useDatasetPageContextSelector((state) => state.sql);
  const setSQL = useDatasetPageContextSelector((state) => state.setSQL);

  const showSkeletonLoader = !dataset?.id || !isFetchedDataset;

  return (
    <div className="mx-auto overflow-y-auto px-14 pb-12 pt-12">
      <>
        {showSkeletonLoader ? (
          <></>
        ) : (
          <div className="flex w-full flex-col space-y-5">
            <OverviewHeader
              datasetId={dataset.id}
              description={dataset.description}
              name={dataset.name}
            />

            <Divider />

            <OverviewData
              datasetId={dataset.id}
              data={datasetData}
              isFetchedDatasetData={isFetchedDatasetData}
            />
          </div>
        )}
      </>
    </div>
  );
}
