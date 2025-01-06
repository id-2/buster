import { BusterOrganizationRole } from '@/api/busterv2';
import { BusterPermissionGroup } from '@/api/busterv2/permissions';
import React, { useContext, useEffect, useMemo } from 'react';
import { ItemContainer, Title } from '@/components';
import {
  PermissionListTeamRequest,
  PermissionsListUsersRequest
} from '@/api/buster-socket/permissions';
import { useMemoizedFn, useMount } from 'ahooks';
import { UserGroupRow } from './_TeamModalContent';
import { TeamGroupRow } from './_UserModalContent';
import { useStyles } from '../_UserIndividualContent';
import { BusterDatasetListItem } from '@/api/busterv2/datasets';
import { Checkbox } from 'antd';
import { Text } from '@/components/text';
import { usePermissionsContextSelector } from '@/context/Permissions';
import { usePermissionUsersIndividual } from '@/context/Permissions/usePermissionsUsers';
import { useDatasetListItemsIndividual } from '@/context/Permissions/usePermissionDatasets';
import { usePermissionTeamsListIndividual } from '@/context/Permissions/usePermissionsTeams';

export const createPermissionGroupsBaseParams = (permissionGroupId: string) => ({
  permission_group_id: permissionGroupId,
  belongs_to: null
});

export const PermissionGroupModalContent: React.FC<{
  selectedPermissionGroup: BusterPermissionGroup;
  setCheckValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  checkValues: Record<string, boolean>;
  checkRoleValues: Record<string, BusterOrganizationRole>;
  setCheckRoleValues: React.Dispatch<React.SetStateAction<Record<string, BusterOrganizationRole>>>;
  type: 'permission_teams' | 'permission_users' | 'permission_datasets';
  open: boolean;
}> = ({
  selectedPermissionGroup,
  setCheckValues,
  checkValues,
  checkRoleValues,
  setCheckRoleValues,
  type,
  open
}) => {
  const initPermissionUsersList = usePermissionsContextSelector((x) => x.initPermissionUsersList);
  const initTeamList = usePermissionsContextSelector((x) => x.initTeamList);
  const initDatasetListItems = usePermissionsContextSelector((x) => x.initDatasetListItems);

  const teamsFilters: Omit<PermissionListTeamRequest['payload'], 'page' | 'page_size'> =
    createPermissionGroupsBaseParams(selectedPermissionGroup.id);
  const usersFilters: Omit<PermissionsListUsersRequest['payload'], 'page' | 'page_size'> =
    createPermissionGroupsBaseParams(selectedPermissionGroup.id);

  const usersList = usePermissionUsersIndividual(usersFilters);
  const teamsList = usePermissionTeamsListIndividual(teamsFilters);
  const datasetsList = useDatasetListItemsIndividual({
    permissionGroupId: selectedPermissionGroup.id
  });

  const onReset = useMemoizedFn(() => {
    if (type === 'permission_teams') {
      const checkValues = selectedPermissionGroup.teams.reduce<Record<string, boolean>>(
        (acc, team) => {
          acc[team.id] = true;
          return acc;
        },
        {}
      );
      setCheckValues(checkValues);
    } else if (type === 'permission_users') {
      const checkValues = selectedPermissionGroup.users.reduce<Record<string, boolean>>(
        (acc, user) => {
          acc[user.id] = true;
          return acc;
        },
        {}
      );
      setCheckValues(checkValues);

      const checkRolesValues = selectedPermissionGroup.users.reduce<
        Record<string, BusterOrganizationRole>
      >((acc, user) => {
        acc[user.id] = user.role || user.team_role;
        return acc;
      }, {});
      setCheckRoleValues(checkRolesValues);
    } else if (type === 'permission_datasets') {
      const checkValues = selectedPermissionGroup.datasets.reduce<Record<string, boolean>>(
        (acc, dataset) => {
          acc[dataset.id] = true;
          return acc;
        },
        {}
      );
      setCheckValues(checkValues);
      setCheckRoleValues({});
    }
  });

  useEffect(() => {
    if (open) onReset();
  }, [open]);

  useMount(async () => {
    if (type === 'permission_teams') {
      await initTeamList(teamsFilters);
    } else if (type === 'permission_users') {
      const res = await initPermissionUsersList(usersFilters);
      const checkValues = res.reduce<Record<string, boolean>>((acc, user) => {
        acc[user.id] = user.belongs_to;
        return acc;
      }, {});
      setCheckValues(checkValues);
    } else if (type === 'permission_datasets') {
      const res = await initDatasetListItems(selectedPermissionGroup.id);
      const checkValues = res.reduce<Record<string, boolean>>((acc, dataset) => {
        acc[dataset.id] = !!dataset.belongs_to;
        return acc;
      }, {});
      setCheckValues(checkValues);
    }
  });

  const modalTitle = useMemo(() => {
    if (type === 'permission_teams') {
      return 'Teams';
    } else if (type === 'permission_users') {
      return 'Users';
    } else {
      return 'Datasets';
    }
  }, [type]);

  return (
    <>
      <div className="p-2">
        <div className="flex space-x-2.5">
          <div className="flex flex-col">
            <Title level={4}>{selectedPermissionGroup.name}</Title>
          </div>
        </div>

        <ItemContainer
          className="mt-5 max-h-[500px] overflow-auto"
          bodyClass="!p-0"
          title={modalTitle}>
          {type === 'permission_datasets' && <></>}

          {type === 'permission_users' && (
            <UserGroupRow
              loadedUsersList={true}
              usersList={usersList}
              setCheckValues={setCheckValues}
              checkValues={checkValues}
              checkRoleValues={checkRoleValues}
              setCheckRoleValues={setCheckRoleValues}
              hideRole={true}
            />
          )}

          {type === 'permission_teams' && (
            <>
              <TeamGroupRow
                loadedTeams={true}
                teams={teamsList}
                setCheckValues={setCheckValues}
                checkValues={checkValues}
                checkRoleValues={checkRoleValues}
                setCheckRoleValues={setCheckRoleValues}
                hideRole={true}
              />
            </>
          )}

          {type === 'permission_datasets' && (
            <DatasetGroupRow
              datasets={datasetsList}
              setCheckValues={setCheckValues}
              checkValues={checkValues}
            />
          )}
        </ItemContainer>
      </div>
    </>
  );
};

const DatasetGroupRow: React.FC<{
  setCheckValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  checkValues: Record<string, boolean>;
  datasets: BusterDatasetListItem[];
}> = ({ setCheckValues, datasets, checkValues }) => {
  const { styles, cx } = useStyles();

  return (
    <>
      {datasets.map((dataset) => {
        return (
          <div
            key={dataset.id}
            className={cx('flex items-center justify-between space-x-4 px-4', styles.listItem)}>
            <div
              className="flex cursor-pointer items-center space-x-2"
              onClick={() => {
                setCheckValues((prev) => ({ ...prev, [dataset.id]: !prev[dataset.id] }));
              }}>
              <Checkbox checked={checkValues[dataset.id]} />
              <Text className="select-none">{dataset.name}</Text>
            </div>
            <div>
              <Text ellipsis type="secondary">
                {dataset.data_source?.name}
              </Text>
            </div>
          </div>
        );
      })}
    </>
  );
};
