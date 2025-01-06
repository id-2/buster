import { BusterOrganizationRole } from '@/api/busterv2';
import { BusterPermissionTeam, BusterPermissionListUser } from '@/api/busterv2/permissions';
import { BusterUserAvatar, ItemContainer, Title } from '@/components';
import { Checkbox, Select } from 'antd';
import React, { useContext, useEffect } from 'react';
import { organizationRoleOptions } from '../../../_helpers';
import { useStyles } from '../_UserIndividualContent';
import { Text } from '@/components';
import { useMemoizedFn, useMount } from 'ahooks';
import {
  PermissionsListGroupRequest,
  PermissionsListUsersRequest
} from '@/api/buster-socket/permissions';
import { PermissionGroupRowCheck } from '../../../_components/PermissionGroupRowCheck';
import { usePermissionsContextSelector } from '@/context/Permissions';
import { usePermissionUsersIndividual } from '@/context/Permissions/usePermissionsUsers';
import { usePermissionGroupsListIndividual } from '@/context/Permissions/usePermissionsGroups';

export const createTeamsBaseParams = (teamId: string) => ({
  team_id: teamId,
  belongs_to: null
});

export const TeamModalContent: React.FC<{
  selectedTeam: BusterPermissionTeam;
  type: 'team_group' | 'team_users';
  loadedPermissionGroupsList: boolean;
  setCheckValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  checkValues: Record<string, boolean>;
  checkRoleValues: Record<string, BusterOrganizationRole>;
  setCheckRoleValues: React.Dispatch<React.SetStateAction<Record<string, BusterOrganizationRole>>>;
  teamId: string;
  open: boolean;
}> = ({
  checkValues,
  setCheckValues,
  type,
  selectedTeam,
  checkRoleValues,
  open,
  setCheckRoleValues,
  teamId
}) => {
  const permissionFilters: Omit<PermissionsListGroupRequest['payload'], 'page' | 'page_size'> =
    createTeamsBaseParams(teamId);
  const usersFilters: Omit<PermissionsListUsersRequest['payload'], 'page' | 'page_size'> =
    createTeamsBaseParams(teamId);

  const initPermissionUsersList = usePermissionsContextSelector((x) => x.initPermissionUsersList);
  const initPermissionGroupsList = usePermissionsContextSelector((x) => x.initPermissionGroupsList);

  const usersList = usePermissionUsersIndividual(usersFilters);
  const permissionGroupsList = usePermissionGroupsListIndividual(permissionFilters);

  const onReset = useMemoizedFn(() => {
    setCheckRoleValues({});
    if (type === 'team_group' && selectedTeam) {
      const checkValues = selectedTeam.permission_groups.reduce<Record<string, boolean>>(
        (acc, group) => {
          acc[group.id] = true;
          return acc;
        },
        {}
      );
      setCheckValues(checkValues);
    }

    if (type === 'team_users' && selectedTeam) {
      const checkValues = selectedTeam.users.reduce<Record<string, boolean>>((acc, user) => {
        acc[user.id] = true;
        return acc;
      }, {});
      setCheckValues(checkValues);
      const checkRolesValues = selectedTeam.users.reduce<Record<string, BusterOrganizationRole>>(
        (acc, user) => {
          acc[user.id] = user.role;
          return acc;
        },
        {}
      );
      setCheckRoleValues(checkRolesValues);
    }
  });

  useEffect(() => {
    if (open) onReset();
  }, [open]);

  useMount(async () => {
    if (type === 'team_users') {
      const res = await initPermissionUsersList(permissionFilters);
      const checkValues = res.reduce<Record<string, boolean>>((acc, user) => {
        acc[user.id] = user.belongs_to;
        return acc;
      }, {});
      setCheckValues(checkValues);
      const checkRolesValues = res.reduce<Record<string, BusterOrganizationRole>>((acc, user) => {
        acc[user.id] = user.team_role || user.role;
        return acc;
      }, {});
      setCheckRoleValues(checkRolesValues);
    } else if (type === 'team_group') {
      const res = await initPermissionGroupsList(usersFilters);
      const checkValues = res.reduce<Record<string, boolean>>((acc, group) => {
        acc[group.id] = group.belongs_to;
        return acc;
      }, {});
      setCheckValues(checkValues);
    }
  });

  return (
    <div className="p-2">
      <div className="flex space-x-2.5">
        <div className="flex flex-col">
          <Title level={4}>{selectedTeam.name}</Title>
        </div>
      </div>

      <ItemContainer
        className="mt-5 max-h-[500px] overflow-auto"
        bodyClass="!p-0"
        title={type === 'team_group' ? 'Permission Groups' : 'Users'}>
        {type === 'team_group' ? (
          <PermissionGroupRowCheck
            permissionGroupsList={permissionGroupsList}
            setCheckValues={setCheckValues}
            checkValues={checkValues}
          />
        ) : (
          <UserGroupRow
            loadedUsersList={true}
            usersList={usersList}
            setCheckValues={setCheckValues}
            checkValues={checkValues}
            checkRoleValues={checkRoleValues}
            setCheckRoleValues={setCheckRoleValues}
          />
        )}
      </ItemContainer>
    </div>
  );
};

export const UserGroupRow: React.FC<{
  loadedUsersList: boolean;
  usersList: BusterPermissionListUser[];
  setCheckValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  checkRoleValues: Record<string, BusterOrganizationRole>;
  setCheckRoleValues: React.Dispatch<React.SetStateAction<Record<string, BusterOrganizationRole>>>;
  checkValues: Record<string, boolean>;
  hideRole?: boolean;
}> = ({
  loadedUsersList,
  setCheckRoleValues,
  checkRoleValues,
  checkValues,
  setCheckValues,
  usersList,
  hideRole
}) => {
  const { styles, cx } = useStyles();

  return (
    <>
      {loadedUsersList ? (
        usersList.map((user) => {
          return (
            <div
              key={user.id}
              className={cx('flex items-center justify-between px-4', styles.listItem)}>
              <div
                className="flex cursor-pointer items-center space-x-2"
                onClick={() => {
                  setCheckValues((prev) => ({ ...prev, [user.id]: !prev[user.id] }));
                }}>
                <Checkbox checked={checkValues[user.id]} />

                <div className="flex items-center space-x-1.5">
                  <div className="">
                    <BusterUserAvatar size={24} name={user.name} />
                  </div>
                  <div className="flex flex-col">
                    <Text className="select-none">{user.name}</Text>
                    <Text type="secondary" className="select-none">
                      {user.email}
                    </Text>
                  </div>
                </div>
              </div>

              <div>
                {!hideRole && checkValues[user.id] && (
                  <Select
                    variant="borderless"
                    defaultActiveFirstOption
                    options={organizationRoleOptions}
                    defaultValue={organizationRoleOptions[0]! as any}
                    value={checkRoleValues[user.id] || BusterOrganizationRole.member}
                    onSelect={(value) => {
                      setCheckRoleValues((prev) => ({
                        ...prev,
                        [user.id]: value as BusterOrganizationRole
                      }));
                    }}
                  />
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="p-4">{/* <Skeleton /> */}</div>
      )}
    </>
  );
};
