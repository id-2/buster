'use client';

import { useGetDatasetPermissionsOverview } from '@/api/busterv2/datasets';
import React from 'react';

export const PermissionTitleCard: React.FC<{ datasetId: string }> = ({ datasetId }) => {
  const { data, isFetched } = useGetDatasetPermissionsOverview(datasetId);
  const users = data?.users;

  return (
    <div>
      {isFetched ? (
        <div>
          <h1>Permission Title Card {users?.length}</h1>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};
