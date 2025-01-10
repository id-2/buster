import { AppMaterialIcons } from '@/components';
import { useDatasetContextSelector } from '@/context/Datasets';
import { Button, Dropdown, MenuProps } from 'antd';
import React, { useMemo } from 'react';

export const DatasetIndividualThreeDotMenu: React.FC<{
  datasetId?: string;
}> = React.memo(({ datasetId }) => {
  const onDeleteDataset = useDatasetContextSelector((state) => state.onDeleteDataset);

  const menu: MenuProps = useMemo(() => {
    return {
      items: [
        {
          key: '1',
          label: 'Delete dataset',
          icon: <AppMaterialIcons icon="delete" />,
          onClick: datasetId ? () => onDeleteDataset(datasetId) : undefined
        }
      ]
    };
  }, [datasetId, onDeleteDataset]);

  return (
    <Dropdown menu={menu} trigger={['click']}>
      <Button type="text" icon={<AppMaterialIcons icon="more_horiz" />} />
    </Dropdown>
  );
});
DatasetIndividualThreeDotMenu.displayName = 'DatasetIndividualThreeDotMenu';
