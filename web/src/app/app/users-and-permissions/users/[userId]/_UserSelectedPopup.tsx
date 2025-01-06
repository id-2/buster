import { AppMaterialIcons } from '@/components';
import { BusterListSelectedOptionPopupContainer } from '@/components/list';
import { useBusterNotifications } from '@/context/BusterNotifications';
import { usePermissionsContextSelector, usePermissionsUserIndividual } from '@/context/Permissions';
import { usePermissionGroupsListIndividual } from '@/context/Permissions/usePermissionsGroups';
import { useMemoizedFn } from 'ahooks';
import { Button, Dropdown, DropdownProps } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import React, { useMemo } from 'react';

export const UsersSelectedPopup: React.FC<{
  selectedRowKeys: string[];
  onSelectChange: (selectedRowKeys: string[]) => void;
}> = ({ selectedRowKeys, onSelectChange }) => {
  return (
    <BusterListSelectedOptionPopupContainer
      selectedRowKeys={selectedRowKeys}
      onSelectChange={onSelectChange}
      buttons={[
        <AssignPermissionButton
          key="assign-permission"
          selectedRowKeys={selectedRowKeys}
          onSelectChange={onSelectChange}
        />,
        <MembersButton
          key="members"
          selectedRowKeys={selectedRowKeys}
          onSelectChange={onSelectChange}
        />,
        <DatasetsButton
          key="datasets"
          selectedRowKeys={selectedRowKeys}
          onSelectChange={onSelectChange}
        />,
        <DeleteButton
          key="delete"
          selectedRowKeys={selectedRowKeys}
          onSelectChange={onSelectChange}
        />
      ]}
      show={selectedRowKeys.length > 0}
    />
  );
};

UsersSelectedPopup.displayName = 'PermissionSelectedPopup';

const DeleteButton: React.FC<{
  selectedRowKeys: string[];
  onSelectChange: (selectedRowKeys: string[]) => void;
}> = ({ selectedRowKeys, onSelectChange }) => {
  const { openConfirmModal, openInfoMessage } = useBusterNotifications();

  const onDeleteClick = useMemoizedFn(async () => {
    await openConfirmModal({
      title: 'Delete Users',
      content: 'Are you sure you want to delete these permission groups?',
      onOk: async () => {
        openInfoMessage('Delete user not currently supported');
        onSelectChange([]);
      }
    });
  });

  return (
    <Button icon={<AppMaterialIcons icon="delete" />} onClick={onDeleteClick}>
      Delete
    </Button>
  );
};

const AssignPermissionButton: React.FC<{
  selectedRowKeys: string[];
  onSelectChange: (selectedRowKeys: string[]) => void;
}> = ({ selectedRowKeys, onSelectChange }) => {
  const updateUser = usePermissionsContextSelector((x) => x.updateUser);
  const permissionGroupsList = usePermissionGroupsListIndividual();

  const dropdownItems: ItemType[] = useMemo(() => {
    return permissionGroupsList.map(({ name, id }) => ({
      label: name,
      key: id,
      onClick: () => onAssignPermissionClick(id)
    }));
  }, [permissionGroupsList]);

  const onAssignPermissionClick = useMemoizedFn(async (permissionGroupId: string) => {
    const updateUserPreflight = async (userId: string) => {
      //
    };

    const userPromises = selectedRowKeys.map((userId) => {
      return updateUserPreflight(userId);
    });

    await Promise.all(userPromises);

    alert('Assign permissions in bulk is not currently supported');

    onSelectChange([]);
  });

  return (
    <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
      <Button icon={<AppMaterialIcons icon="groups" />}>Assign Permission</Button>
    </Dropdown>
  );
};

const MembersButton: React.FC<{
  selectedRowKeys: string[];
  onSelectChange: (selectedRowKeys: string[]) => void;
}> = ({ selectedRowKeys, onSelectChange }) => {
  const onMembersClick = useMemoizedFn(() => {
    alert('Members in bulk is not currently supported');
  });

  return (
    <Button icon={<AppMaterialIcons icon="account_circle" />} onClick={onMembersClick}>
      Members
    </Button>
  );
};

const DatasetsButton: React.FC<{
  selectedRowKeys: string[];
  onSelectChange: (selectedRowKeys: string[]) => void;
}> = ({ selectedRowKeys, onSelectChange }) => {
  const onDatasetsClick = useMemoizedFn(() => {
    alert('Datasets in bulk is not currently supported');
  });

  return (
    <Button icon={<AppMaterialIcons icon="table_view" />} onClick={onDatasetsClick}>
      Datasets
    </Button>
  );
};
