import {
  BusterPermissionGroup,
  BusterPermissionListTeam,
  BusterPermissionListUser,
  BusterPermissionTeam,
  BusterPermissionUser
} from '@/api/busterv2/permissions';
import { useMemoizedFn } from 'ahooks';
import React from 'react';
import { PermissionModalType } from './_EditPermissionModal';
import { BusterOrganizationRole } from '@/api/busterv2';
import { createTeamsBaseParams } from './_TeamModalContent';
import { createUsersBaseParams } from './_UserModalContent';
import { createPermissionGroupsBaseParams } from './_PermissionGroupModalContent';
import { usePermissionsTeams } from '@/context/Permissions/usePermissionsTeams';
import { usePermissionUsers } from '@/context/Permissions/usePermissionsUsers';
import { usePermissionsContextSelector } from '@/context/Permissions';

export const useEditPermissionSave = ({
  selectedPermissionGroup,
  selectedTeam,
  selectedUser,
  checkValues,
  checkRoleValues,
  type,
  onClose
}: {
  type: PermissionModalType;
  selectedUser?: BusterPermissionUser;
  selectedTeam?: BusterPermissionTeam;
  selectedPermissionGroup?: BusterPermissionGroup;
  checkValues: Record<string, boolean>;
  checkRoleValues: Record<string, BusterOrganizationRole>;
  onClose: () => void;
}) => {
  const [applying, setApplying] = React.useState(false);

  const updateUser = usePermissionsContextSelector((x) => x.updateUser);
  const updatePermissionGroup = usePermissionsContextSelector((x) => x.updatePermissionGroup);
  const updateTeam = usePermissionsContextSelector((x) => x.updateTeam);
  const usersList = usePermissionsContextSelector((x) => x.usersList);
  const teamsList = usePermissionsContextSelector((x) => x.teamsList);

  const disableApply = disableApplyCheck({
    selectedPermissionGroup,
    selectedTeam,
    selectedUser,
    checkValues,
    checkRoleValues,
    type,
    usersList,
    teamsList
  });

  const userGroupSave = useMemoizedFn(async () => {
    if (!selectedUser) return;
    return await updateUser({
      id: selectedUser!.id,
      permission_groups: Object.entries(checkValues)
        .filter(([, value]) => value)
        .map(([key]) => key)
    });
  });

  const userTeamSave = useMemoizedFn(async () => {
    if (!selectedUser) return;
    const teams = Object.entries(checkValues)
      .filter(([, value]) => value)
      .map(([key]) => {
        return {
          id: key,
          role: checkRoleValues[key] || BusterOrganizationRole.member
        };
      });
    return await updateUser({
      id: selectedUser!.id,
      teams
    });
  });

  const teamGroupSave = useMemoizedFn(async () => {
    if (!selectedTeam) return;
    return await updateTeam({
      id: selectedTeam!.id,
      permission_groups: Object.entries(checkValues)
        .filter(([, value]) => value)
        .map(([key]) => key)
    });
  });

  const teamUsersSave = useMemoizedFn(async () => {
    if (!selectedTeam) return;
    const userFilter = createTeamsBaseParams(selectedTeam.id);
    const selectedUsersList = usersList[JSON.stringify(userFilter)];

    return await updateTeam({
      id: selectedTeam!.id,
      users: Object.entries(checkValues)
        .filter(([, value]) => value)
        .map(([key]) => key)
        .map((key) => {
          const user = selectedUsersList.find((u) => u.id === key)!;
          return {
            id: user.id,
            role: checkRoleValues[user.id] || user?.team_role || BusterOrganizationRole.member
          };
        })
    });
  });

  const permissionTeamSave = useMemoizedFn(async () => {
    if (!selectedPermissionGroup) return;
    await updatePermissionGroup({
      id: selectedPermissionGroup!.id,
      teams: Object.entries(checkValues)
        .filter(([, value]) => value)
        .map(([key]) => key)
    });
  });

  const permissionUserSave = useMemoizedFn(async () => {
    if (!selectedPermissionGroup) return;
    return await updatePermissionGroup({
      id: selectedPermissionGroup!.id,
      users: Object.entries(checkValues)
        .filter(([, value]) => value)
        .map(([key]) => key)
    });
  });

  const permissionDatasetSave = useMemoizedFn(async () => {
    if (!selectedPermissionGroup) return;
    return await updatePermissionGroup({
      id: selectedPermissionGroup!.id,
      datasets: Object.entries(checkValues)
        .filter(([, value]) => value)
        .map(([key]) => key)
    });
  });

  const onSave = useMemoizedFn(async () => {
    if (applying || disableApply) return;
    setApplying(true);

    const saveRecord: Record<PermissionModalType, () => Promise<unknown>> = {
      [PermissionModalType.permissionDatasets]: permissionDatasetSave,
      [PermissionModalType.permissionTeams]: permissionTeamSave,
      [PermissionModalType.permissionUsers]: permissionUserSave,
      [PermissionModalType.teamUsers]: teamUsersSave,
      [PermissionModalType.teamGroup]: teamGroupSave,
      [PermissionModalType.userGroup]: userGroupSave,
      [PermissionModalType.userTeam]: userTeamSave
    };

    await saveRecord[type]();

    setApplying(false);
    onClose();
  });

  return { onSave, applying, disableApply };
};

export const disableApplyCheck = ({
  selectedPermissionGroup,
  selectedTeam,
  selectedUser,
  checkValues,
  checkRoleValues,
  type,
  usersList,
  teamsList
}: {
  selectedPermissionGroup?: BusterPermissionGroup;
  selectedTeam?: BusterPermissionTeam;
  selectedUser?: BusterPermissionUser;
  checkValues: Record<string, boolean>;
  checkRoleValues: Record<string, BusterOrganizationRole>;
  type: PermissionModalType;
  usersList: Record<string, BusterPermissionListUser[]>;
  teamsList: Record<string, BusterPermissionListTeam[]>;
}) => {
  const disableRecord: Record<PermissionModalType, () => boolean> = {
    user_group: () => {
      const checkedOriginal = selectedUser?.permission_groups.map((group) => group.id);
      const checkedNew = Object.keys(checkValues).filter((key) => checkValues[key]);
      return JSON.stringify(checkedOriginal) === JSON.stringify(checkedNew);
    },
    user_team: () => {
      const checkedOriginal = selectedUser?.teams.map((team) => team.id);
      const checkedNew = Object.keys(checkValues).filter((key) => checkValues[key]);
      const userFilter = createUsersBaseParams(selectedUser?.id || '');
      const selectedTeamsList: BusterPermissionListTeam[] | null =
        teamsList[JSON.stringify(userFilter)] || [];
      const isChangedRoles = Object.entries(checkRoleValues).some(([key, value]) => {
        const team = selectedTeamsList.find((u) => u.id === key);
        return team?.team_role !== value;
      });
      return JSON.stringify(checkedOriginal) === JSON.stringify(checkedNew) && !isChangedRoles;
    },
    team_group: () => {
      const checkedOriginal = selectedTeam?.permission_groups.map((group) => group.id);
      const checkedNew = Object.keys(checkValues).filter((key) => checkValues[key]);
      return JSON.stringify(checkedOriginal) === JSON.stringify(checkedNew);
    },
    team_users: () => {
      const checkedOriginal = selectedTeam?.users.map((user) => user.id);
      const checkedNew = Object.keys(checkValues).filter((key) => checkValues[key]);
      const teamFilter = createTeamsBaseParams(selectedTeam?.id!);
      const selectedUsersList: BusterPermissionListUser[] | null =
        usersList[JSON.stringify(teamFilter)] || [];
      const isChangedRoles = Object.entries(checkRoleValues).some(([key, value]) => {
        const user = selectedUsersList.find((u) => u.id === key);
        return user?.team_role !== value;
      });

      return JSON.stringify(checkedOriginal) === JSON.stringify(checkedNew) && !isChangedRoles;
    },
    permission_teams: () => {
      const checkedOriginal = selectedPermissionGroup?.teams.map((team) => team.id);
      const checkedNew = Object.keys(checkValues).filter((key) => checkValues[key]);
      return JSON.stringify(checkedOriginal) === JSON.stringify(checkedNew);
    },
    permission_users: () => {
      const checkedOriginal = selectedPermissionGroup?.users.map((user) => user.id);
      const checkedNew = Object.keys(checkValues).filter((key) => checkValues[key]);
      const permissionFilter = createPermissionGroupsBaseParams(selectedPermissionGroup?.id || '');
      const selectedUsersList: BusterPermissionListUser[] | null =
        usersList[JSON.stringify(permissionFilter)] || [];
      const isChangedRoles = Object.entries(checkRoleValues).some(([key, value]) => {
        const user = selectedUsersList.find((u) => u.id === key);
        return user?.role !== value;
      });
      return JSON.stringify(checkedOriginal) === JSON.stringify(checkedNew) && !isChangedRoles;
    },
    permission_datasets: () => {
      const checkedOriginal = selectedPermissionGroup?.datasets.map((dataset) => dataset.id);
      const checkedNew = Object.keys(checkValues).filter((key) => checkValues[key]);
      return JSON.stringify(checkedOriginal) === JSON.stringify(checkedNew);
    }
  };

  return disableRecord[type]?.() ?? true;
};
