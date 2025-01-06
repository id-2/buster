import { BusterOrganizationRole } from '@/api/busterv2';
import { BusterPermissionUser, BusterPermissionListTeam } from '@/api/busterv2/permissions';
import { BusterUserAvatar, ItemContainer } from '@/components';
import React, { useEffect } from 'react';
import { Checkbox, Select } from 'antd';
import { useStyles } from '../_UserIndividualContent';
import { organizationRoleOptions } from '../../../_helpers';
import { Text, Title } from '@/components';
import { useMemoizedFn, useMount } from 'ahooks';
import { PermissionGroupRowCheck } from '../../../_components/PermissionGroupRowCheck';
import { usePermissionsContextSelector } from '@/context/Permissions';
import { usePermissionTeamsListIndividual } from '@/context/Permissions/usePermissionsTeams';
import { usePermissionGroupsListIndividual } from '@/context/Permissions/usePermissionsGroups';

export const createUsersBaseParams = (userId: string) => ({
  user_id: userId,
  belongs_to: null
});

export const UserModalContent: React.FC<{
  selectedUser: BusterPermissionUser;
  type: 'user_group' | 'user_team';
  setCheckValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  checkValues: Record<string, boolean>;
  checkRoleValues: Record<string, BusterOrganizationRole>;
  setCheckRoleValues: React.Dispatch<React.SetStateAction<Record<string, BusterOrganizationRole>>>;
  userId: string;
  open: boolean;
}> = ({
  selectedUser,
  type,
  setCheckValues,
  checkValues,
  checkRoleValues,
  setCheckRoleValues,
  userId,
  open
}) => {
  const initPermissionGroupsList = usePermissionsContextSelector((x) => x.initPermissionGroupsList);
  const initTeamList = usePermissionsContextSelector((x) => x.initTeamList);
  const permissionGroupsList = usePermissionGroupsListIndividual(createUsersBaseParams(userId));
  const teamsList = usePermissionTeamsListIndividual(createUsersBaseParams(userId));

  const onReset = useMemoizedFn(() => {
    if (type === 'user_group' && selectedUser) {
      const checkValues = selectedUser.permission_groups.reduce<Record<string, boolean>>(
        (acc, group) => {
          acc[group.id] = true;
          return acc;
        },
        {}
      );
      setCheckValues(checkValues);
    }

    if (type === 'user_team' && selectedUser) {
      const checkValues = selectedUser.teams.reduce<Record<string, boolean>>((acc, team) => {
        acc[team.id] = true;
        return acc;
      }, {});
      setCheckValues(checkValues);
      const checkRoleValues = selectedUser.teams.reduce<Record<string, BusterOrganizationRole>>(
        (acc, team) => {
          acc[team.id] = team.team_role;
          return acc;
        },
        {}
      );
      setCheckRoleValues(checkRoleValues);
    }
  });

  useEffect(() => {
    if (open) onReset();
  }, [open]);

  useMount(async () => {
    if (type === 'user_team') {
      const res = await initTeamList(createUsersBaseParams(userId));
      const checkValues = res.reduce<Record<string, boolean>>((acc, team) => {
        acc[team.id] = team.belongs_to;
        return acc;
      }, {});
      setCheckValues(checkValues);
      const checkRoleValues = res.reduce<Record<string, BusterOrganizationRole>>((acc, team) => {
        acc[team.id] = team.team_role;
        return acc;
      }, {});
      setCheckRoleValues(checkRoleValues);
    }

    //removed when opening users permission group modal
    // if (type === 'user_group') {
    //   await initPermissionGroupsList(createUsersBaseParams(userId));
    // }
  });

  return (
    <div className="p-2">
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

      <ItemContainer
        className="mt-5 max-h-[500px] overflow-auto"
        bodyClass="!p-0"
        title={type === 'user_group' ? 'Permission Groups' : 'Teams'}>
        {type === 'user_group' ? (
          <PermissionGroupRowCheck
            permissionGroupsList={permissionGroupsList}
            setCheckValues={setCheckValues}
            checkValues={checkValues}
          />
        ) : (
          <TeamGroupRow
            teams={teamsList}
            loadedTeams={true}
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

export const TeamGroupRow: React.FC<{
  setCheckValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  checkValues: Record<string, boolean>;
  loadedTeams: boolean;
  teams: BusterPermissionListTeam[];
  checkRoleValues: Record<string, BusterOrganizationRole>;
  setCheckRoleValues: React.Dispatch<React.SetStateAction<Record<string, BusterOrganizationRole>>>;
  hideRole?: boolean;
}> = ({
  hideRole,
  setCheckRoleValues,
  checkRoleValues,
  setCheckValues,
  teams,
  checkValues,
  loadedTeams
}) => {
  const { styles, cx } = useStyles();

  return (
    <>
      {loadedTeams ? (
        teams.map((team) => {
          return (
            <div
              key={team.id}
              className={cx('flex items-center justify-between px-4', styles.listItem)}>
              <div
                className="flex cursor-pointer items-center space-x-2"
                onClick={() => {
                  setCheckValues((prev) => ({ ...prev, [team.id]: !prev[team.id] }));
                }}>
                <Checkbox checked={checkValues[team.id]} />
                <Text className="select-none">{team.name}</Text>
              </div>
              <div>
                {!hideRole && checkValues[team.id] && (
                  <Select
                    variant="borderless"
                    defaultActiveFirstOption
                    options={organizationRoleOptions}
                    value={checkRoleValues[team.id] || BusterOrganizationRole.member}
                    onSelect={(value) => {
                      setCheckRoleValues((prev) => ({
                        ...prev,
                        [team.id]: value as BusterOrganizationRole
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
