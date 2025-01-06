import { BusterPermissionUser } from '@/api/busterv2/permissions';
import { AppMaterialIcons, Text } from '@/components';
import { usePermissionsContextSelector } from '@/context/Permissions';
import { createBusterRoute, BusterRoutes } from '@/routes';
import { MenuProps, Dropdown } from 'antd';
import Link from 'next/link';
import pluralize from 'pluralize';
import React from 'react';
import { useStyles } from '../users/[userId]/_UserIndividualContent';

export const PermissionTeamRow: React.FC<{
  index: number;
  team: BusterPermissionUser['teams'][0];
  userId?: string;
  permissionGroupId?: string;
}> = ({ team, index, userId, permissionGroupId }) => {
  const { styles, cx } = useStyles();
  const updateUser = usePermissionsContextSelector((x) => x.updateUser);
  const updatePermissionGroup = usePermissionsContextSelector((x) => x.updatePermissionGroup);
  const permissionGroups = usePermissionsContextSelector((x) => x.permissionGroups);
  const users = usePermissionsContextSelector((x) => x.users);

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'open',
      label: (
        <Link
          prefetch
          href={createBusterRoute({
            route: BusterRoutes.APP_TEAMS_ID,
            teamId: team.id
          })}>
          Open team
        </Link>
      ),
      icon: <AppMaterialIcons icon="arrow_outward" />
    },
    {
      key: 'remove_team',
      label: 'Remove team',
      icon: <AppMaterialIcons icon="delete" />,
      onClick: async () => {
        if (userId) {
          const user = users[userId];
          updateUser({
            id: userId,
            teams: user.teams
              .filter((t) => t.id !== team.id)
              .map((t) => ({
                id: t.id,
                role: t.team_role
              }))
          });
        }
        if (permissionGroupId) {
          const permissionGroup = permissionGroups[permissionGroupId];
          await updatePermissionGroup({
            id: permissionGroupId,
            teams: permissionGroup.teams.filter((t) => t.id !== team.id).map((t) => t.id)
          });
        }
      }
    }
  ];

  return (
    <div className={cx('flex w-full justify-between px-4 py-4', styles.listItem)}>
      <Text>{team.name}</Text>

      <div className="flex space-x-6">
        <Text>{pluralize('member', team.member_count, true)}</Text>

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
