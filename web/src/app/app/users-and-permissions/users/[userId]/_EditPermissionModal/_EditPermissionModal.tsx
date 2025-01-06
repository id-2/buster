import {
  BusterPermissionGroup,
  BusterPermissionTeam,
  BusterPermissionUser
} from '@/api/busterv2/permissions';
import { Modal } from 'antd';
import React from 'react';
import { BusterOrganizationRole } from '@/api/busterv2';
import { UserModalContent } from './_UserModalContent';
import { TeamModalContent } from './_TeamModalContent';
import { PermissionGroupModalContent } from './_PermissionGroupModalContent';
import { useEditPermissionSave } from './useEditPermissionSave';

export enum PermissionModalType {
  userGroup = 'user_group',
  userTeam = 'user_team',
  teamGroup = 'team_group',
  teamUsers = 'team_users',
  permissionTeams = 'permission_teams',
  permissionUsers = 'permission_users',
  permissionDatasets = 'permission_datasets'
}

export const EditPermissionModal: React.FC<{
  open: boolean;
  selectedUser?: BusterPermissionUser;
  selectedTeam?: BusterPermissionTeam;
  selectedPermissionGroup?: BusterPermissionGroup;
  onClose: () => void;
  type: PermissionModalType;
}> = ({ selectedTeam, selectedPermissionGroup, type, onClose, open, selectedUser }) => {
  const [checkValues, setCheckValues] = React.useState<{
    [key: string]: boolean;
  }>({});

  const [checkRoleValues, setCheckRoleValues] = React.useState<
    Record<string, BusterOrganizationRole>
  >({});

  const { onSave, disableApply, applying } = useEditPermissionSave({
    checkValues,
    checkRoleValues,
    onClose,
    type,
    selectedUser,
    selectedTeam,
    selectedPermissionGroup
  });

  return (
    <>
      <Modal
        onClose={onClose}
        open={open}
        destroyOnClose={true}
        cancelButtonProps={{
          type: 'text'
        }}
        okText="Apply"
        okButtonProps={{
          disabled: disableApply,
          loading: applying,
          onClick: onSave,
          type: 'default'
        }}
        onCancel={onClose}
        width={650}>
        {selectedUser && (
          <UserModalContent
            selectedUser={selectedUser}
            type={type as 'user_group' | 'user_team'}
            setCheckValues={setCheckValues}
            checkValues={checkValues}
            checkRoleValues={checkRoleValues}
            setCheckRoleValues={setCheckRoleValues}
            userId={selectedUser.id}
            open={open}
          />
        )}

        {selectedTeam && (
          <TeamModalContent
            selectedTeam={selectedTeam}
            type={type as 'team_group' | 'team_users'}
            loadedPermissionGroupsList={false}
            setCheckValues={setCheckValues}
            checkValues={checkValues}
            checkRoleValues={checkRoleValues}
            setCheckRoleValues={setCheckRoleValues}
            teamId={selectedTeam.id}
            open={open}
          />
        )}

        {selectedPermissionGroup && (
          <PermissionGroupModalContent
            selectedPermissionGroup={selectedPermissionGroup}
            setCheckValues={setCheckValues}
            checkValues={checkValues}
            checkRoleValues={checkRoleValues}
            setCheckRoleValues={setCheckRoleValues}
            open={open}
            type={type as 'permission_teams' | 'permission_users' | 'permission_datasets'}
          />
        )}
      </Modal>
    </>
  );
};
