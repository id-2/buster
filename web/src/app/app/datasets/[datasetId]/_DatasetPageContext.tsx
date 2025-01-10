'use client';

import { useIndividualDataset } from '@/context/Datasets';
import { useSelectedLayoutSegment } from 'next/navigation';
import React, { PropsWithChildren, useEffect, useLayoutEffect, useState } from 'react';
import { DatasetApps } from './_config';
import {
  createContext,
  ContextSelector,
  useContextSelector
} from '@fluentui/react-context-selector';

export const useDatasetPageContext = ({ datasetId }: { datasetId: string }) => {
  const segments = useSelectedLayoutSegment() as DatasetApps;
  const { dataset, datasetData } = useIndividualDataset({ datasetId });
  const originalDatasetSQL = dataset.data?.sql;
  const datasetYmlFile = dataset.data?.yml_file;

  const [sql, setSQL] = useState<string>(originalDatasetSQL || '');
  const [ymlFile, setYmlFile] = useState<string>(datasetYmlFile || '');

  const selectedApp = segments;

  useEffect(() => {
    setSQL(originalDatasetSQL || '');
  }, [originalDatasetSQL]);

  useEffect(() => {
    setYmlFile(datasetYmlFile || '');
  }, [datasetYmlFile]);

  return { sql, ymlFile, selectedApp, setSQL, setYmlFile, datasetData, dataset };
};

const DatasetPageContext = createContext<ReturnType<typeof useDatasetPageContext>>(
  {} as ReturnType<typeof useDatasetPageContext>
);

export const DatasetPageProvider: React.FC<
  PropsWithChildren<{
    datasetId: string;
  }>
> = ({ children, datasetId }) => {
  const datasetPageContext = useDatasetPageContext({ datasetId });

  return (
    <DatasetPageContext.Provider value={datasetPageContext}>{children}</DatasetPageContext.Provider>
  );
};

export const useDatasetPageContextSelector = <T,>(
  selector: ContextSelector<ReturnType<typeof useDatasetPageContext>, T>
) => useContextSelector(DatasetPageContext, selector);
