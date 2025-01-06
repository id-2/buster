import { AppMaterialIcons } from '@/components';
import { BusterListSelectedOptionPopupContainer } from '@/components/list';
import { useBusterNotifications } from '@/context/BusterNotifications';
import { usePermissionsContextSelector, usePermissionsUserIndividual } from '@/context/Permissions';
import { usePermissionGroupsListIndividual } from '@/context/Permissions/usePermissionsGroups';
import { useMemoizedFn } from 'ahooks';
import { Button, Dropdown, DropdownProps } from 'antd';
import { ItemType } from 'antd/es/menu/interface';
import React, { useMemo } from 'react';

export const TeamSelectedPopup: React.FC<{
  selectedRowKeys: string[];
  onSelectChange: (selectedRowKeys: string[]) => void;
}> = React.memo(({ selectedRowKeys, onSelectChange }) => {
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
});

TeamSelectedPopup.displayName = 'TeamSelectedPopup';

const DeleteButton: React.FC<{
  selectedRowKeys: string[];
  onSelectChange: (selectedRowKeys: string[]) => void;
}> = ({ selectedRowKeys, onSelectChange }) => {
  const deleteTeam = usePermissionsContextSelector((x) => x.deleteTeam);
  const { openConfirmModal, openInfoMessage } = useBusterNotifications();

  const onDeleteClick = useMemoizedFn(async () => {
    const teamPromises = [deleteTeam(selectedRowKeys, true)];
    await Promise.all(teamPromises);
    onSelectChange([]);
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
  const onAssignPermissionClick = useMemoizedFn(() => {
    alert('Assign permissions in bulk is not currently supported');
  });

  return (
    <Button icon={<AppMaterialIcons icon="groups" />} onClick={onAssignPermissionClick}>
      Assign Permission
    </Button>
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
