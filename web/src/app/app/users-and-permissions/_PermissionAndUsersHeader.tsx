'use client';

import React, { useMemo, useState } from 'react';
import { AppContentHeader } from '../_components/AppContentHeader';
import { Breadcrumb, Button, Skeleton } from 'antd';
import { BreadcrumbProps } from 'antd/lib';
import { BreadcrumbSeperator } from '@/styles/context/useBreadcrumbStyles';
import Link from 'next/link';
import { BusterRoutes, createBusterRoute } from '@/routes';
import { AppMaterialIcons, AppSegmented } from '@/components';
import {
  usePermissionsContextSelector,
  usePermissionsUserIndividual,
  usePermissionsTeamIndividual,
  usePermissionsGroupIndividual
} from '@/context/Permissions';
import { useAppLayoutContextSelector } from '@/context/BusterAppLayout';
import { UserApp } from './_helpers';
import { usePrevious } from 'ahooks';
import { CreatePermissionGroupModal } from './permission-groups/[permissionGroupId]/CreatePermissionGroupModal';
import { NewTeamModal } from '../_components/NewTeamModal';

const useHookRecord = {
  [UserApp.USERS]: usePermissionsUserIndividual,
  [UserApp.TEAMS]: usePermissionsTeamIndividual,
  [UserApp.PERMISSION_GROUPS]: usePermissionsGroupIndividual
};

export const PermissionAndUsersHeader: React.FC<{
  userId?: string;
  permissionGroupId?: string;
  teamId?: string;
  selectedApp: UserApp;
}> = ({ userId, permissionGroupId, teamId, selectedApp }) => {
  const loadedUsersList = usePermissionsContextSelector((x) => x.loadedUsersList);
  const setOpenCreateTeamModal = usePermissionsContextSelector((x) => x.setOpenCreateTeamModal);
  const openCreatePermissionGroupModal = usePermissionsContextSelector(
    (x) => x.openCreatePermissionGroupModal
  );
  const setOpenCreatePermissionGroupModal = usePermissionsContextSelector(
    (x) => x.setOpenCreatePermissionGroupModal
  );
  const openCreateTeamModal = usePermissionsContextSelector((x) => x.openCreateTeamModal);

  const hookResult = useHookRecord[selectedApp]({
    userId: userId!,
    permissionGroupId: permissionGroupId!,
    teamId: teamId!
  });
  const previousSelectedApp = usePrevious(selectedApp);

  const backHref = useMemo(() => {
    const hrefRecord: Record<UserApp, string> = {
      [UserApp.USERS]: createBusterRoute({ route: BusterRoutes.APP_USERS }),
      [UserApp.TEAMS]: createBusterRoute({ route: BusterRoutes.APP_TEAMS }),
      [UserApp.PERMISSION_GROUPS]: createBusterRoute({ route: BusterRoutes.APP_PERMISSIONS })
    };
    if (userId) return hrefRecord[UserApp.USERS];
    if (permissionGroupId) return hrefRecord[UserApp.PERMISSION_GROUPS];
    if (teamId) return hrefRecord[UserApp.TEAMS];
    return hrefRecord[UserApp.USERS];
  }, [selectedApp, userId, permissionGroupId, teamId, previousSelectedApp]);

  const showSkeletonLoader = useMemo(() => {
    if (selectedApp === UserApp.USERS) return userId ? !hookResult?.id : !loadedUsersList;
    if (selectedApp === UserApp.TEAMS) return false;
    if (selectedApp === UserApp.PERMISSION_GROUPS) return false;
    return false;
  }, [loadedUsersList, hookResult]);

  const items: BreadcrumbProps['items'] = [
    {
      title: (
        <Link suppressHydrationWarning className={`truncate`} href={backHref}>
          {getPrimaryBreadcrumbText(selectedApp, {
            userId,
            permissionGroupId,
            teamId
          })}
        </Link>
      )
    },
    {
      title: hookResult?.name || null
    }
  ].filter((v) => v.title);

  return (
    <>
      <AppContentHeader>
        {!showSkeletonLoader ? (
          <div className="flex w-full items-center justify-between space-x-2">
            <div className="flex items-center space-x-1">
              <Breadcrumb items={items} separator={<BreadcrumbSeperator />} />
              <UserAppSelection
                isBase={!userId && !permissionGroupId && !teamId}
                selectedApp={selectedApp}
              />
            </div>
            <div className="flex items-center space-x-2">
              <RightContent
                userId={userId}
                permissionGroupId={permissionGroupId}
                teamId={teamId}
                selectedApp={selectedApp}
                setOpenCreatePermissionGroupModal={setOpenCreatePermissionGroupModal}
                setOpenCreateTeamModal={setOpenCreateTeamModal}
              />
            </div>
          </div>
        ) : (
          <SkeletonLoader />
        )}
      </AppContentHeader>

      {selectedApp === UserApp.PERMISSION_GROUPS && (
        <CreatePermissionGroupModal
          open={openCreatePermissionGroupModal}
          onClose={() => {
            setOpenCreatePermissionGroupModal(false);
          }}
        />
      )}

      {selectedApp === UserApp.TEAMS && (
        <NewTeamModal
          open={openCreateTeamModal}
          onClose={() => {
            setOpenCreateTeamModal(false);
          }}
        />
      )}
    </>
  );
};

const UserAppSelection: React.FC<{
  isBase?: boolean;
  selectedApp: UserApp;
}> = ({ selectedApp, isBase }) => {
  if (!isBase) return;

  const items = [
    {
      label: <Link href={createBusterRoute({ route: BusterRoutes.APP_USERS })}>Users</Link>,
      value: UserApp.USERS
    },
    {
      label: (
        <Link
          href={createBusterRoute({
            route: BusterRoutes.APP_TEAMS
          })}>
          Teams
        </Link>
      ),
      value: UserApp.TEAMS
    },
    {
      label: (
        <Link
          href={createBusterRoute({
            route: BusterRoutes.APP_PERMISSIONS
          })}>
          Permissions groups
        </Link>
      ),
      value: UserApp.PERMISSION_GROUPS
    }
  ];

  return (
    <div className="flex space-x-2">
      <AppSegmented options={items} value={selectedApp} size="small" />
    </div>
  );
};

const RightContent: React.FC<{
  userId?: string;
  permissionGroupId?: string;
  teamId?: string;
  selectedApp: UserApp;
  setOpenCreatePermissionGroupModal: (value: boolean) => void;
  setOpenCreateTeamModal: (value: boolean) => void;
}> = ({
  userId,
  permissionGroupId,
  teamId,
  setOpenCreatePermissionGroupModal,
  setOpenCreateTeamModal,
  selectedApp
}) => {
  const onToggleInviteModal = useAppLayoutContextSelector((s) => s.onToggleInviteModal);

  if (selectedApp === UserApp.USERS && !userId) {
    return (
      <Button
        onClick={() => {
          onToggleInviteModal();
        }}
        icon={<AppMaterialIcons icon="add" />}>
        Invite User
      </Button>
    );
  }

  if (selectedApp === UserApp.PERMISSION_GROUPS && !permissionGroupId) {
    return (
      <Button
        onClick={() => {
          setOpenCreatePermissionGroupModal(true);
        }}
        icon={<AppMaterialIcons icon="add" />}>
        New group
      </Button>
    );
  }

  if (selectedApp === UserApp.TEAMS && !teamId) {
    return (
      <Button
        onClick={() => {
          setOpenCreateTeamModal(true);
        }}
        icon={<AppMaterialIcons icon="add" />}>
        New team
      </Button>
    );
  }

  return <></>;
};

const SkeletonLoader: React.FC = () => {
  const active = false;
  const size = 'small';
  const buttonShape = 'round';

  return (
    <div className="flex h-full w-1/2 items-center justify-center space-x-2">
      <Skeleton.Button
        className="!flex h-full min-w-12 !items-center"
        active={active}
        size={size}
        shape={buttonShape}
        style={{ width: '100%' }}
      />

      <Skeleton.Input
        block
        className="!flex h-full w-12 !items-center overflow-hidden rounded"
        active={active}
        size={size}
      />
    </div>
  );
};

const getPrimaryBreadcrumbText = (
  selectedApp: UserApp,
  params: { userId?: string; permissionGroupId?: string; teamId?: string }
) => {
  const { userId, permissionGroupId, teamId } = params;
  if (selectedApp === UserApp.USERS && userId) return `Users`;
  if (selectedApp === UserApp.TEAMS && teamId) return `Teams`;
  if (selectedApp === UserApp.PERMISSION_GROUPS && permissionGroupId) return `Permission groups`;
  return `Users & Permissions`;
};
