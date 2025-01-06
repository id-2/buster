'use client';

import { usePermissionsContextSelector } from '@/context/Permissions';
import { useMemoizedFn } from 'ahooks';
import { startTransition, useEffect, useMemo, useState } from 'react';
import React from 'react';
import { BusterList, BusterListColumn, BusterListRow } from '@/components/list';
import { BusterPermissionListGroup } from '@/api/busterv2/permissions';
import { Input } from 'antd';
import { BusterRoutes, createBusterRoute } from '@/routes';
import pluralize from 'pluralize';
import { AppContent } from '../../_components/AppContent';
import { usePermissionGroupsListIndividual } from '@/context/Permissions/usePermissionsGroups';
import { ContainerEmptyState } from '../_components/ContainerEmptyState';
import { PermissionSelectedPopup } from './PermissionSelectedPopup';

export default function Page() {
  const loadedGroupsList = usePermissionsContextSelector((x) => x.loadedGroupsList);
  const permissionGroupsList = usePermissionGroupsListIndividual();
  const [searchedPermissionGroups, setSearchedPermissionGroups] =
    useState<BusterPermissionListGroup[]>(permissionGroupsList);
  const [selectedPermissionGroupIds, setSelectedPermissionGroupIds] = useState<string[]>([]);

  const onSearchPermissionGroupsInputChange = useMemoizedFn(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchTerm = e.target.value.toLowerCase();
      startTransition(() => {
        if (!newSearchTerm) {
          setSearchedPermissionGroups(permissionGroupsList);
        } else {
          setSearchedPermissionGroups(
            permissionGroupsList.filter((permissionGroup) => {
              return permissionGroup.name?.toLowerCase().includes(newSearchTerm);
            })
          );
        }
      });
    }
  );

  const columns: BusterListColumn[] = useMemo(() => {
    return [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        headerRender: () => {
          return (
            <Input
              className="max-w-[260px]"
              size="small"
              placeholder="Search by name..."
              onChange={onSearchPermissionGroupsInputChange}
            />
          );
        }
      },
      {
        key: 'teams',
        title: 'Teams',
        dataIndex: 'team_count',
        width: 80,
        render: (value) => pluralize('Team', value, true)
      },
      {
        key: 'members',
        title: 'Members',
        dataIndex: 'member_count',
        width: 110,
        render: (value) => pluralize('Member', value, true)
      },
      {
        key: 'datasets',
        title: 'Datasets',
        dataIndex: 'dataset_count',
        width: 85,
        render: (value) => pluralize('Dataset', value, true)
      }
    ];
  }, []);

  const rows: BusterListRow[] = useMemo(() => {
    return searchedPermissionGroups.map((permissionGroup) => {
      return {
        id: permissionGroup.id,
        data: permissionGroup,
        link: createBusterRoute({
          route: BusterRoutes.APP_PERMISSIONS_ID,
          permissionId: permissionGroup.id
        })
      };
    });
  }, [searchedPermissionGroups]);

  useEffect(() => {
    setSearchedPermissionGroups(permissionGroupsList);
  }, [permissionGroupsList.length]);

  return (
    <>
      <AppContent>
        <BusterList
          rows={rows}
          columns={columns}
          emptyState={loadedGroupsList ? <PermissionGroupsEmptyState /> : undefined}
          selectedRowKeys={selectedPermissionGroupIds}
          onSelectChange={setSelectedPermissionGroupIds}
        />

        <PermissionSelectedPopup
          selectedRowKeys={selectedPermissionGroupIds}
          onSelectChange={setSelectedPermissionGroupIds}
        />
      </AppContent>
    </>
  );
}

const PermissionGroupsEmptyState: React.FC<{}> = () => {
  const setOpenCreatePermissionGroupModal = usePermissionsContextSelector(
    (x) => x.setOpenCreatePermissionGroupModal
  );

  return (
    <ContainerEmptyState
      title="You have no permission groups"
      description="You don't have any permission groups. As soon as you do, they will appear here."
      onClick={() => {
        setOpenCreatePermissionGroupModal(true);
      }}
      buttonText="New permission group"
    />
  );
};
