import { EditableTitle, Title } from '@/components';
import { useDatasetContextSelector } from '@/context/Datasets';
import React from 'react';
import { useMemoizedFn } from 'ahooks';

export const OverviewHeader: React.FC<{ datasetId: string; description: string; name: string }> =
  React.memo(({ datasetId, description, name }) => {
    const onUpdateDataset = useDatasetContextSelector((state) => state.onUpdateDataset);

    const onEditTitle = useMemoizedFn((value: string) => {
      if (value) {
        onUpdateDataset({
          id: datasetId,
          name: value
        });
      }
    });

    return (
      <div className="flex justify-between space-x-2">
        <div className="flex space-x-4">
          <div className="flex flex-col space-y-1">
            <EditableTitle onChange={onEditTitle} level={3}>
              {name}
            </EditableTitle>
            <Title level={4} type="secondary">
              {description}
            </Title>
          </div>
        </div>
      </div>
    );
  });
OverviewHeader.displayName = 'OverviewHeader';
