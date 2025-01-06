import { BusterPermissionTeam } from '@/api/busterv2/permissions';
import React, { useContext } from 'react';
import { useStyles } from '../users/[userId]/_UserIndividualContent';
import { AppMaterialIcons, BusterUserAvatar, Text } from '@/components';
import { usePermissionsContextSelector } from '@/context/Permissions';
import { createBusterRoute, BusterRoutes } from '@/routes';
import { MenuProps, Dropdown } from 'antd';
import Link from 'next/link';
import { createPermissionUserRoleName } from '../_helpers';
import { useBusterNotifications } from '@/context/BusterNotifications';

export const PermissionUserRow: React.FC<{
  index: number;
  teamId: string;
  user: BusterPermissionTeam['users'][0];
  allUsers: BusterPermissionTeam['users'];
}> = ({ user, teamId, allUsers, index }) => {
  const { styles, cx } = useStyles();
  const updateTeam = usePermissionsContextSelector((x) => x.updateTeam);
  const { openConfirmModal } = useBusterNotifications();

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'go',
      icon: <AppMaterialIcons icon="arrow_outward" />,
      label: (
        <Link
          href={createBusterRoute({
            route: BusterRoutes.APP_USERS_ID,
            userId: user.id
          })}>{`Open ${user.name}`}</Link>
      )
    },
    {
      key: 'delete',
      icon: <AppMaterialIcons icon="delete" />,
      label: 'Remove',
      onClick: async () => {
        openConfirmModal({
          title: 'Remove user',
          content: 'Are you sure you want to remove this user?',
          onOk: () => {
            const newUsers = allUsers.filter((u) => u.id !== user.id);
            updateTeam({
              id: teamId,
              users: newUsers
            });
          }
        }).catch((e) => {
          //
        });
      }
    }
  ];

  return (
    <div
      className={cx('flex w-full items-center justify-between px-4 py-0', styles.listItem)}
      style={{
        height: 48
      }}>
      <div className="flex space-x-2">
        <div className="flex items-center">
          <BusterUserAvatar size={26} name={user.name} />
        </div>
        <div className="flex flex-col">
          <Text>{user.name}</Text>
          <Text type="secondary">{user.email}</Text>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <Text>{createPermissionUserRoleName(user.role)}</Text>
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
