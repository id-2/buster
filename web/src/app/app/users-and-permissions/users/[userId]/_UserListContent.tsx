'use client';

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition } from 'react';
import { AppContent } from '../../../_components/AppContent';
import { usePermissionsContextSelector } from '@/context/Permissions';
import { useDebounce, useMemoizedFn } from 'ahooks';
import { Dropdown, MenuProps } from 'antd';
import { BusterPermissionListUser } from '@/api/busterv2/permissions';
import Link from 'next/link';
import { BusterRoutes, createBusterRoute } from '@/routes';
import pluralize from 'pluralize';
import { createPermissionUserRoleName } from '../../_helpers';
import { AppMaterialIcons, BusterUserAvatar } from '@/components';
import { Input } from 'antd';
import { Text } from '@/components';
import { usePermissionUsersIndividual } from '@/context/Permissions/usePermissionsUsers';
import {
  BusterList,
  BusterListColumn,
  BusterListContextMenu,
  BusterListRow
} from '@/components/list';
import { useAppLayoutContextSelector } from '@/context/BusterAppLayout';
import { UsersSelectedPopup } from './_UserSelectedPopup';
import { ContainerEmptyState } from '../../_components/ContainerEmptyState';

export const UserListContent: React.FC = () => {
  const onChangePage = useAppLayoutContextSelector((x) => x.onChangePage);
  const loadedUsersList = usePermissionsContextSelector((x) => x.loadedUsersList);
  const usersList = usePermissionUsersIndividual();
  const [isSearching, startTransition] = useTransition();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<BusterPermissionListUser[]>(usersList);

  const columns: BusterListColumn[] = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        headerRender: () => {
          return (
            <Input
              className="max-w-[260px]"
              size="small"
              placeholder="Search by name or email..."
              onChange={onSearchUsersInputChange}
            />
          );
        },
        render: (_, user) => {
          return (
            <div className="flex items-center space-x-2">
              <div>
                <BusterUserAvatar useToolTip={false} size={18} name={user?.name} />
              </div>
              <div className="flex flex-col space-y-0">
                <Text>{user?.name || user?.email}</Text>
                {!!user?.name && (
                  <Text size="sm" type="secondary">
                    {user.email}
                  </Text>
                )}
              </div>
            </div>
          );
        }
      },
      {
        title: 'Teams',
        dataIndex: 'team_count',
        width: 80,
        render: (teamCount) => {
          return pluralize('team', teamCount, true);
        }
      },
      {
        title: 'Groups',
        dataIndex: 'permission_group_count',
        width: 80,
        render: (permissionGroupCount) => {
          return pluralize('group', permissionGroupCount, true);
        }
      },
      {
        title: 'Role',
        dataIndex: 'role',
        width: 75,
        render: (role) => {
          return createPermissionUserRoleName(role);
        }
      }
    ],
    []
  );

  const rows: BusterListRow[] = useMemo(() => {
    return searchedUsers.map((user) => {
      return {
        id: user.id,
        data: user,
        link: createBusterRoute({
          route: BusterRoutes.APP_USERS_ID,
          userId: user.id
        })
      };
    });
  }, [usersList, searchedUsers]);

  const contextMenu: BusterListContextMenu = useMemo(() => {
    return {
      items: [
        {
          key: 'open',
          label: 'Open',
          icon: <AppMaterialIcons icon="arrow_forward" />,
          onClick: (id) => {
            onChangePage({
              route: BusterRoutes.APP_USERS_ID,
              userId: id
            });
          }
        }
      ]
    };
  }, [onChangePage]);

  const onSearchUsersInputChange = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value.toLowerCase();
    startTransition(() => {
      if (!newSearchTerm) {
        setSearchedUsers(usersList);
      } else {
        setSearchedUsers(
          usersList.filter((user) => {
            return (
              user.name.toLowerCase().includes(newSearchTerm) ||
              user.email.toLowerCase().includes(newSearchTerm)
            );
          })
        );
      }
    });
  });

  useLayoutEffect(() => {
    setSearchedUsers(usersList);
  }, [usersList.length]);

  return (
    <AppContent>
      <BusterList
        emptyState={loadedUsersList ? <UsersEmptyState /> : <></>}
        columns={columns}
        rows={rows}
        onSelectChange={setSelectedRowKeys}
        selectedRowKeys={selectedRowKeys}
        contextMenu={contextMenu}
      />

      <UsersSelectedPopup selectedRowKeys={selectedRowKeys} onSelectChange={setSelectedRowKeys} />
    </AppContent>
  );
};

const UsersEmptyState: React.FC<{}> = () => {
  return (
    <ContainerEmptyState
      title="No users found"
      description="There are no users in this workspace"
      onClick={() => {}}
      buttonText="Add user"
    />
  );
};
