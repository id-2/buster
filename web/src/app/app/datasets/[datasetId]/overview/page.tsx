'use client';

import React, { useContext } from 'react';
import { DatasetIndividualContent } from '../_DatasetContent';
import { useDatasetPageContextSelector } from '../_DatasetPageContext';

export default function Page() {
  const selectedApp = useDatasetPageContextSelector((state) => state.selectedApp);
  const dataset = useDatasetPageContextSelector((state) => state.dataset);
  const sql = useDatasetPageContextSelector((state) => state.sql);
  const setSQL = useDatasetPageContextSelector((state) => state.setSQL);

  return (
    <div className="mx-auto overflow-y-auto px-14 pb-12 pt-12">
      <DatasetIndividualContent
        setSQL={setSQL}
        sql={sql}
        selectedApp={selectedApp}
        selectedDataset={dataset}
      />
    </div>
  );
}
