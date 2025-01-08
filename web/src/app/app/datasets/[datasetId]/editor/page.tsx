'use client';

import React from 'react';
import { DatasetSQL } from '../_DatasetSQL';
import { useDatasetPageContextSelector } from '../_DatasetPageContext';

export default function Page() {
  const dataset = useDatasetPageContextSelector((state) => state.dataset);
  const sql = useDatasetPageContextSelector((state) => state.sql);
  const setSQL = useDatasetPageContextSelector((state) => state.setSQL);

  return (
    <div className="h-full w-full">
      <DatasetSQL setSQL={setSQL} sql={sql} selectedDataset={dataset} />
    </div>
  );
}
