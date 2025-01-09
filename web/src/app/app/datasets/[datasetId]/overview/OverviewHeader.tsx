import { EditableTitle, Title, Text } from '@/components';
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
            <Text className="!text-md" type="secondary">
              {description}
            </Text>
          </div>
        </div>
      </div>
    );
  });
OverviewHeader.displayName = 'OverviewHeader';
