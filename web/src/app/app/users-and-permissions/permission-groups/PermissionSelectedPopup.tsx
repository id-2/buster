import { AppMaterialIcons } from '@/components';
import { BusterListSelectedOptionPopupContainer } from '@/components/list';
import { useBusterNotifications } from '@/context/BusterNotifications';
import { usePermissionsContextSelector } from '@/context/Permissions';
import { useMemoizedFn } from 'ahooks';
import { Button } from 'antd';
import React from 'react';

export const PermissionSelectedPopup: React.FC<{
  selectedRowKeys: string[];
  onSelectChange: (selectedRowKeys: string[]) => void;
}> = ({ selectedRowKeys, onSelectChange }) => {
  return (
    <BusterListSelectedOptionPopupContainer
      selectedRowKeys={selectedRowKeys}
      onSelectChange={onSelectChange}
      buttons={[
        <TeamsButton
          key="teams"
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

PermissionSelectedPopup.displayName = 'PermissionSelectedPopup';

const DeleteButton: React.FC<{
  selectedRowKeys: string[];
  onSelectChange: (selectedRowKeys: string[]) => void;
}> = ({ selectedRowKeys, onSelectChange }) => {
  const deletePermissionGroup = usePermissionsContextSelector(
    (state) => state.deletePermissionGroup
  );
  const { openConfirmModal } = useBusterNotifications();

  const onDeleteClick = useMemoizedFn(async () => {
    await openConfirmModal({
      title: 'Delete Permission Groups',
      content: 'Are you sure you want to delete these permission groups?',
      onOk: async () => {
        await deletePermissionGroup(selectedRowKeys);
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

const TeamsButton: React.FC<{
  selectedRowKeys: string[];
  onSelectChange: (selectedRowKeys: string[]) => void;
}> = ({ selectedRowKeys, onSelectChange }) => {
  const onTeamsClick = useMemoizedFn(() => {
    alert('Teams in bulk is not currently supported');
  });

  return (
    <Button icon={<AppMaterialIcons icon="groups" />} onClick={onTeamsClick}>
      Teams
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
