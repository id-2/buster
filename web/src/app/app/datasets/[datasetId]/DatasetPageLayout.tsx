'use client';

import React from 'react';
import { DatasetsIndividualHeader } from './_DatasetsIndividualHeader';
import { AppContent } from '../../_components/AppContent';
import { DatasetPageProvider, useDatasetPageContextSelector } from './_DatasetPageContext';

export const DatasetPageLayout: React.FC<{ children: React.ReactNode; datasetId: string }> = ({
  children,
  datasetId
}) => {
  return (
    <DatasetPageProvider datasetId={datasetId}>
      <LayoutContent>{children}</LayoutContent>
    </DatasetPageProvider>
  );
};

const LayoutContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sql = useDatasetPageContextSelector((state) => state.sql);
  const selectedApp = useDatasetPageContextSelector((state) => state.selectedApp);
  const dataset = useDatasetPageContextSelector((state) => state.dataset);
  const setSQL = useDatasetPageContextSelector((state) => state.setSQL);

  return (
    <>
      <DatasetsIndividualHeader
        selectedApp={selectedApp}
        sql={sql}
        datasetId={dataset?.data?.id}
        datasetSQL={dataset?.data?.sql}
        datasetName={dataset?.data?.name}
        setSQL={setSQL}
      />
      <AppContent>{children}</AppContent>
    </>
  );
};
