import { BusterPermissionUser } from '@/api/busterv2/permissions';
import { AppMaterialIcons, AppTooltip, Text } from '@/components';
import { createBusterRoute, BusterRoutes } from '@/routes';
import { MenuProps, Dropdown } from 'antd';
import Link from 'next/link';
import pluralize from 'pluralize';
import React, { useContext } from 'react';
import { useStyles } from '../users/[userId]/_UserIndividualContent';
import { useBusterNotifications } from '@/context/BusterNotifications';

export const PermissionGroupRow: React.FC<{
  index: number;
  group: BusterPermissionUser['permission_groups'][0];
  onDelete: () => void;
}> = ({ onDelete, group, index }) => {
  const { styles, cx } = useStyles();
  const { openConfirmModal } = useBusterNotifications();

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'open',
      icon: <AppMaterialIcons icon="arrow_outward" />,
      label: (
        <Link
          prefetch
          href={createBusterRoute({
            route: BusterRoutes.APP_PERMISSIONS_ID,
            permissionId: group.id
          })}>
          Open permission group
        </Link>
      )
    },
    {
      key: 'delete',
      icon: <AppMaterialIcons icon="delete" />,
      disabled: group.identities?.includes('Team'),
      label: (
        <AppTooltip
          placement="bottom"
          title={group.identities?.includes('Team') ? 'This group is associated with a team' : ''}>
          Remove group
        </AppTooltip>
      ),
      onClick: () => {
        openConfirmModal({
          title: 'Remove group',
          content: 'Are you sure you want to remove this permission group?',
          onOk: () => {
            onDelete();
          }
        }).catch((e) => {
          //
        });
      }
    }
  ];

  return (
    <div className={cx('flex w-full justify-between px-4 py-4', styles.listItem)}>
      <Text>{group.name}</Text>

      <div className="flex space-x-6">
        <Text>{pluralize('dataset', group.dataset_count, true)}</Text>
        {group.identities && <Text type="secondary">{group.identities.join(', ')}</Text>}
        <Text type="secondary" className="cursor-pointer">
          <Dropdown
            trigger={['click']}
            menu={{
              items: dropdownItems
            }}>
            <AppMaterialIcons icon="more_horiz" />
          </Dropdown>
        </Text>
      </div>
    </div>
  );
};
