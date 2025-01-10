import React from 'react';
import { PermissionTitleCard } from './PermissionTitleCard';
import { prefetchGetDatasetPermissionsOverview } from '@/api/busterv2/datasets/permissions/queryRequests';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function Page({ params }: { params: { datasetId: string } }) {
  const datasetId = params.datasetId;
  const queryClient = await prefetchGetDatasetPermissionsOverview(datasetId);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="m-auto max-w-[1400px] overflow-y-auto px-14 pb-12 pt-12">
        <PermissionTitleCard datasetId={datasetId} />
      </div>
    </HydrationBoundary>
  );
}
