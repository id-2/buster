'use client';

import React from 'react';
import { AppContent } from '../../../_components/AppContent';
import { usePermissionsContextSelector, usePermissionsUserIndividual } from '@/context/Permissions';
import { Button, Dropdown, MenuProps } from 'antd';
import { BusterPermissionUser } from '@/api/busterv2/permissions';
import { AppMaterialIcons, BusterUserAvatar } from '@/components';
import { createStyles } from 'antd-style';
import { useAntToken } from '@/styles/useAntToken';
import { createPermissionUserRoleName } from '../../_helpers';
import pluralize from 'pluralize';
import { EditPermissionModal, PermissionModalType } from './_EditPermissionModal';
import { Text, Title } from '@/components';

import { PermissionGroupItemContainer } from '../../_components/PermissionGroupItemContainer';
import { TeamItemContainer } from '../../_components/TeamItemContainer';
import { useBusterNotifications } from '@/context/BusterNotifications';

export const UserIndividualContent: React.FC<{ userId: string }> = ({ userId }) => {
  const updateUser = usePermissionsContextSelector((x) => x.updateUser);
  const selectedUser = usePermissionsUserIndividual({ userId });
  const [openEditPermissionGroupModal, setOpenEditPermissionGroupModal] = React.useState(false);
  const [openEditTeamModal, setOpenEditTeamModal] = React.useState(false);
  const loadingUser = !selectedUser?.id;

  if (loadingUser) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <AppContent className="p-8" scrollable>
        <UserAvatarContainer selectedUser={selectedUser} />

        <UserInfoContainer selectedUser={selectedUser} />

        <PermissionGroupItemContainer
          setOpenModal={setOpenEditPermissionGroupModal}
          permissionGroups={selectedUser.permission_groups}
          onDelete={async (d) => {
            return await updateUser({
              id: userId,
              permission_groups: d.permission_groups
            });
          }}
        />

        <TeamItemContainer
          setOpenModal={setOpenEditTeamModal}
          teams={selectedUser.teams}
          userId={selectedUser.id}
        />
      </AppContent>

      <EditPermissionModal
        selectedUser={selectedUser}
        open={openEditPermissionGroupModal}
        type={PermissionModalType.userGroup}
        onClose={() => {
          setOpenEditPermissionGroupModal(false);
        }}
      />

      <EditPermissionModal
        selectedUser={selectedUser}
        open={openEditTeamModal}
        type={PermissionModalType.userTeam}
        onClose={() => {
          setOpenEditTeamModal(false);
        }}
      />
    </>
  );
};

export const useStyles = createStyles(({ css, token }) => {
  return {
    avatarContainer: css``,
    listItem: css`
      height: 48px;
      border-bottom: 0.5px solid ${token.colorBorder};
      &:last-child {
        border-bottom: none;
      }
    `
  };
});

const UserAvatarContainer: React.FC<{
  selectedUser: BusterPermissionUser;
}> = ({ selectedUser }) => {
  const { styles, cx } = useStyles();
  const token = useAntToken();

  return (
    <div className="flex justify-between space-x-2">
      <div className="flex space-x-2.5">
        <div>
          <BusterUserAvatar size={36} name={selectedUser.name} />
        </div>
        <div className="flex flex-col">
          <Title level={4}>{selectedUser.name}</Title>
          <Text className="text-sm" type="secondary">
            {selectedUser.email}
          </Text>
        </div>
      </div>

      <ThreeDotMenu />
    </div>
  );
};

const ThreeDotMenu: React.FC<{}> = () => {
  const { openInfoMessage } = useBusterNotifications();
  const items: MenuProps['items'] = [
    {
      key: 'edit_name',
      label: 'Edit name',
      icon: <AppMaterialIcons icon="edit" />,
      onClick: () => {
        openInfoMessage('Editing a user name is not currently supported');
      }
    },
    {
      key: 'delete_user',
      label: 'Delete user',
      icon: <AppMaterialIcons icon="delete" />,
      onClick: () => {
        openInfoMessage('Delete user not currently supported');
      }
    }
  ];

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items
      }}>
      <Button type="text" icon={<AppMaterialIcons icon="more_horiz" />}></Button>
    </Dropdown>
  );
};

const UserInfoContainer: React.FC<{
  selectedUser: BusterPermissionUser;
  className?: string;
}> = ({ className = '', selectedUser }) => {
  const token = useAntToken();

  const TextElement = ({ title, value }: { title: string; value: string }) => {
    return (
      <div className="flex flex-col space-y-1">
        <Text type="secondary">{title}</Text>
        <Text>{value}</Text>
      </div>
    );
  };

  return (
    <div
      className={`mt-5 flex w-full items-start overflow-x-auto px-4 py-3 ${className}`}
      style={{
        background: token.colorBgBase,
        borderRadius: token.borderRadius,
        border: `0.5px solid ${token.colorBorder}`
      }}>
      <div className="flex w-full min-w-[400px] items-start justify-between space-x-1 overflow-x-auto">
        <TextElement title="Invited by" value={selectedUser.email} />
        <div className="flex space-x-8">
          <TextElement title="Role" value={createPermissionUserRoleName(selectedUser.role)} />
          <TextElement
            title="Permissions"
            value={pluralize('group', selectedUser.permission_group_count, true)}
          />
          <TextElement title="Datasets" value={String(selectedUser.dataset_count)} />
          <TextElement title="Teams" value={pluralize('team', selectedUser.team_count, true)} />
        </div>
      </div>
    </div>
  );
};

const SkeletonLoader: React.FC = () => {
  return <div className="p-8">{/* <Skeleton /> */}</div>;
};
