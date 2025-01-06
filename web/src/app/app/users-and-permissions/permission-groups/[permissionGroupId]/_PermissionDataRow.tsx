import { BusterPermissionGroup } from '@/api/busterv2/permissions';
import React, { useContext } from 'react';
import { Dropdown, MenuProps } from 'antd';
import { AppMaterialIcons } from '@/components';
import { useStyles } from '../../users/[userId]/_UserIndividualContent';
import { BusterRoutes } from '@/routes';
import { Text } from '@/components';
import { useAppLayoutContextSelector } from '@/context/BusterAppLayout';
import { useDatasetContextSelector } from '@/context/Datasets';

export const PermissionDatasetRow: React.FC<{
  index: number;
  dataset: BusterPermissionGroup['datasets'][0];
}> = ({ dataset, index }) => {
  const { styles, cx } = useStyles();
  const onChangePage = useAppLayoutContextSelector((s) => s.onChangePage);
  const onDeleteDataset = useDatasetContextSelector((state) => state.onDeleteDataset);

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'go',
      icon: <AppMaterialIcons icon="arrow_outward" />,
      label: 'Open dataset',
      onClick: () => {
        onChangePage({
          route: BusterRoutes.APP_DATASETS_ID_OVERVIEW,
          datasetId: dataset.id
        });
      }
    },
    {
      key: 'delete',
      icon: <AppMaterialIcons icon="delete" />,
      label: 'Remove',
      onClick: () => {
        onDeleteDataset(dataset.id);
      }
    }
  ];

  return (
    <div className={cx('flex w-full justify-between px-4 py-4', styles.listItem)}>
      <Text>{dataset.name}</Text>

      <div className="flex space-x-6">
        <Text>{dataset.database_name}</Text>
        <Dropdown
          trigger={['click']}
          menu={{
            items: dropdownItems
          }}>
          <Text type="secondary" className="cursor-pointer">
            <AppMaterialIcons icon="more_horiz" />
          </Text>
        </Dropdown>
      </div>
    </div>
  );
};
