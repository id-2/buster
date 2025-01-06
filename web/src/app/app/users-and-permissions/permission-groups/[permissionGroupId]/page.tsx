'use client';

import React from 'react';
import { Dropdown, MenuProps, Skeleton } from 'antd';
import { AppContent } from '@/app/app/_components/AppContent';
import { useAntToken } from '@/styles/useAntToken';
import { BusterPermissionGroup } from '@/api/busterv2/permissions';

import { useMemoizedFn, useUnmount } from 'ahooks';
import { AppMaterialIcons, EditableTitle } from '@/components';
import { formatDate } from '@/utils/date';
import pluralize from 'pluralize';
import { Text } from '@/components';
import {
  EditPermissionModal,
  PermissionModalType
} from '../../users/[userId]/_EditPermissionModal';
import { UserItemContainer } from '../../_components/UserItemContainer';
import { TeamItemContainer } from '../../_components/TeamItemContainer';
import { DatasetItemContainer } from '../../_components/DatasetItemContainer';
import {
  usePermissionsContextSelector,
  usePermissionsGroupIndividual
} from '@/context/Permissions';

export default function Page({
  params: { permissionGroupId }
}: {
  params: {
    permissionGroupId: string;
  };
}) {
  const selectedPermissionGroup = usePermissionsGroupIndividual({ permissionGroupId });
  const [openEditUsersModal, setOpenEditUsersModal] = React.useState(false);
  const [openEditTeamsModal, setOpenEditTeamsModal] = React.useState(false);
  const [openEditDatasetsModal, setOpenEditDatasetsModal] = React.useState(false);

  if (!selectedPermissionGroup) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <AppContent scrollable className="p-8">
        <PermissionGroupPrimaryContainer selectedPermissionGroup={selectedPermissionGroup} />

        <PermissionGroupInfoContainer selectedPermissionGroup={selectedPermissionGroup} />

        <DatasetItemContainer
          setOpenModal={setOpenEditDatasetsModal}
          datasets={selectedPermissionGroup.datasets}
        />

        <TeamItemContainer
          setOpenModal={setOpenEditTeamsModal}
          teams={selectedPermissionGroup.teams}
          permissionGroupId={selectedPermissionGroup.id}
        />

        <UserItemContainer
          setOpenModal={setOpenEditUsersModal}
          users={selectedPermissionGroup.users}
          teamId={selectedPermissionGroup.id}
          allUsers={selectedPermissionGroup.users}
        />
      </AppContent>

      <EditPermissionModal
        selectedPermissionGroup={selectedPermissionGroup}
        open={openEditDatasetsModal}
        type={PermissionModalType.permissionDatasets}
        onClose={() => {
          setOpenEditDatasetsModal(false);
        }}
      />

      <EditPermissionModal
        selectedPermissionGroup={selectedPermissionGroup}
        open={openEditTeamsModal}
        type={PermissionModalType.permissionTeams}
        onClose={() => {
          setOpenEditTeamsModal(false);
        }}
      />

      <EditPermissionModal
        selectedPermissionGroup={selectedPermissionGroup}
        open={openEditUsersModal}
        type={PermissionModalType.permissionUsers}
        onClose={() => {
          setOpenEditUsersModal(false);
        }}
      />
    </>
  );
}

const PermissionGroupPrimaryContainer: React.FC<{
  selectedPermissionGroup: BusterPermissionGroup;
}> = ({ selectedPermissionGroup }) => {
  const token = useAntToken();
  const updatePermissionGroup = usePermissionsContextSelector((x) => x.updatePermissionGroup);
  const deletePermissionGroup = usePermissionsContextSelector((x) => x.deletePermissionGroup);
  const [editing, setEditing] = React.useState(false);

  const onChangeTeamName = useMemoizedFn((value: string) => {
    updatePermissionGroup({
      id: selectedPermissionGroup.id,
      name: value
    });
  });

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <AppMaterialIcons icon="edit_square" />,
      label: 'Edit permission name',
      onClick: () => {
        setEditing(true);
      }
    },
    {
      key: 'delete',
      icon: <AppMaterialIcons icon="delete" />,
      label: 'Delete permission',
      onClick: async () => {
        await deletePermissionGroup([selectedPermissionGroup.id]);
      }
    }
  ];

  return (
    <div className="flex justify-between space-x-2">
      <div className="flex space-x-2.5">
        <div className={'flex flex-col space-y-1'}>
          <EditableTitle
            onChange={(v) => {
              onChangeTeamName(v);
            }}
            onEdit={(v) => {
              setEditing(v);
            }}
            editing={editing}>
            {selectedPermissionGroup.name}
          </EditableTitle>

          <Text className="text-sm" type="secondary">
            {`Last updated: ${formatDate({
              date: selectedPermissionGroup.updated_at,
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

const PermissionGroupInfoContainer: React.FC<{
  selectedPermissionGroup: BusterPermissionGroup;
  className?: string;
}> = ({ className = '', selectedPermissionGroup }) => {
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
        <TextElement title="Created by" value={selectedPermissionGroup.created_by.name} />

        <div className="flex space-x-8">
          <TextElement
            title="Permission Groups"
            value={pluralize('datasets', selectedPermissionGroup.dataset_count, true)}
          />
          <TextElement
            title="Members"
            value={pluralize('member', selectedPermissionGroup.member_count, true)}
          />
          <TextElement
            title="Teams"
            value={pluralize('member', selectedPermissionGroup.team_count, true)}
          />
        </div>
      </div>
    </div>
  );
};

const SkeletonLoader: React.FC = () => {
  return (
    <div className="p-8">
      <Skeleton></Skeleton>
    </div>
  );
};
