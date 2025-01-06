'use client';

import { DatasetPageProvider, useDatasetPageContextSelector } from './_DatasetPageContext';
import { DatasetsIndividualHeader } from './_DatasetsIndividualHeader';
import { AppContent } from '@/app/app/_components/AppContent';
import React from 'react';

export default function Layout({
  params,
  children
}: {
  params: { datasetId: string };
  children: React.ReactNode;
}) {
  return (
    <DatasetPageProvider datasetId={params.datasetId}>
      <LayoutContent>{children}</LayoutContent>
    </DatasetPageProvider>
  );
}

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
        selectedDataset={dataset}
        setSQL={setSQL}
      />
      <AppContent>{children}</AppContent>
    </>
  );
};
