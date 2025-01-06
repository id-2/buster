'use client';

import { BusterPermissionTeam } from '@/api/busterv2/permissions';
import { AppContent } from '@/app/app/_components/AppContent';
import { AppMaterialIcons, EditableTitle } from '@/components';
import { useAntToken } from '@/styles/useAntToken';
import { formatDate } from '@/utils';
import { Dropdown, MenuProps } from 'antd';
import pluralize from 'pluralize';
import { useContext } from 'react';
import React from 'react';
import {
  EditPermissionModal,
  PermissionModalType
} from '../../users/[userId]/_EditPermissionModal';
import { useMemoizedFn, useUnmount } from 'ahooks';
import { Text } from '@/components';
import { PermissionGroupItemContainer } from '../../_components/PermissionGroupItemContainer';
import { UserItemContainer } from '../../_components/UserItemContainer';
import { usePermissionsContextSelector, usePermissionsTeamIndividual } from '@/context/Permissions';

export default function TeamPage({
  params: { teamId }
}: {
  params: {
    teamId: string;
  };
}) {
  const updateTeam = usePermissionsContextSelector((x) => x.updateTeam);
  const unsubscribeTeam = usePermissionsContextSelector((x) => x.unsubscribeTeam);

  const selectedTeam = usePermissionsTeamIndividual({ teamId });
  const [openEditPermissionGroupModal, setOpenEditPermissionGroupModal] = React.useState(false);
  const [openEditUsersModal, setOpenEditUsersModal] = React.useState(false);

  const loadingTeam = !selectedTeam?.id;

  useUnmount(() => {
    unsubscribeTeam(teamId);
  });

  if (loadingTeam) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <AppContent scrollable className="p-8">
        <TeamPrimaryContainer selectedTeam={selectedTeam} />

        <TeamInfoContainer selectedTeam={selectedTeam} />

        <PermissionGroupItemContainer
          setOpenModal={setOpenEditPermissionGroupModal}
          onDelete={async (d) => {
            return await updateTeam({
              id: selectedTeam.id,
              permission_groups: d.permission_groups
            });
          }}
          permissionGroups={selectedTeam.permission_groups}
        />

        <UserItemContainer
          setOpenModal={setOpenEditUsersModal}
          users={selectedTeam.users}
          teamId={teamId}
          allUsers={selectedTeam.users}
        />
      </AppContent>

      <EditPermissionModal
        selectedTeam={selectedTeam}
        open={openEditPermissionGroupModal}
        type={PermissionModalType.teamGroup}
        onClose={() => {
          setOpenEditPermissionGroupModal(false);
        }}
      />

      <EditPermissionModal
        selectedTeam={selectedTeam}
        open={openEditUsersModal}
        type={PermissionModalType.teamUsers}
        onClose={() => {
          setOpenEditUsersModal(false);
        }}
      />
    </>
  );
}

const TeamPrimaryContainer: React.FC<{
  selectedTeam: BusterPermissionTeam;
}> = ({ selectedTeam }) => {
  const token = useAntToken();
  const updateTeam = usePermissionsContextSelector((x) => x.updateTeam);
  const deleteTeam = usePermissionsContextSelector((x) => x.deleteTeam);
  const [editing, setEditing] = React.useState(false);

  const onChangeTeamName = useMemoizedFn((value: string) => {
    updateTeam({
      id: selectedTeam.id,
      name: value
    });
  });

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <AppMaterialIcons icon="edit_square" />,
      label: 'Edit team name',
      onClick: () => {
        setEditing(true);
      }
    },
    {
      key: 'delete',
      icon: <AppMaterialIcons icon="delete" />,
      label: 'Delete team',
      onClick: async () => {
        await deleteTeam([selectedTeam.id]);
      }
    }
  ];

  return (
    <div className="flex justify-between space-x-2">
      <div className="flex space-x-2.5">
        <div className={'flex flex-col space-y-1'}>
          <div className={'max-h-[19px] overflow-hidden'}>
            <EditableTitle editing={editing} onChange={onChangeTeamName} onEdit={setEditing}>
              {selectedTeam.name}
            </EditableTitle>
          </div>

          <Text className="text-sm" type="secondary">
            {`Last updated: ${formatDate({
              date: selectedTeam.updated_at,
              format: 'lll'
            })}`}
          </Text>
        </div>
      </div>

      <div className="cursor-pointer">
        <Dropdown
          trigger={['click']}
          menu={{
            items: dropdownItems
          }}>
          <AppMaterialIcons
            style={{
              color: token.colorIcon
            }}
            size={18}
            icon="more_horiz"
          />
        </Dropdown>
      </div>
    </div>
  );
};

const TeamInfoContainer: React.FC<{
  selectedTeam: BusterPermissionTeam;
  className?: string;
}> = ({ className = '', selectedTeam }) => {
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
        <TextElement title="Created by" value={selectedTeam.created_by.name} />

        <div className="flex space-x-8">
          <TextElement
            title="Permission Groups"
            value={pluralize('group', selectedTeam.permission_group_count, true)}
          />
          <TextElement
            title="Members"
            value={pluralize('member', selectedTeam.member_count, true)}
          />
        </div>
      </div>
    </div>
  );
};

const SkeletonLoader: React.FC = () => {
  return <div className="p-8">{/* <Skeleton /> */}</div>;
};
