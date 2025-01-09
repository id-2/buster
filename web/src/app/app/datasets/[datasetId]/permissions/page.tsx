'use client';

import React from 'react';
import { DatasetDescriptions } from './_DatasetDescriptions';
import { useUserConfigContextSelector } from '@/context/Users';
import { useDatasetPageContextSelector } from '../_DatasetPageContext';

export default function Page() {
  const sql = useDatasetPageContextSelector((state) => state.sql);
  const selectedApp = useDatasetPageContextSelector((state) => state.selectedApp);
  const dataset = useDatasetPageContextSelector((state) => state.dataset);
  const setSQL = useDatasetPageContextSelector((state) => state.setSQL);
  const isAdmin = useUserConfigContextSelector((state) => state.isAdmin);

  return (
    <div className="m-auto max-w-[1400px] overflow-y-auto px-14 pb-12 pt-12">
      <DatasetDescriptions
        setSQL={setSQL}
        sql={sql}
        isAdmin={isAdmin}
        selectedApp={selectedApp}
        selectedDataset={dataset}
      />
    </div>
  );
}
