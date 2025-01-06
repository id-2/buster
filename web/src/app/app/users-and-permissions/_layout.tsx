'use client';

import { AppSplitter } from '@/components/layout';
import React, { PropsWithChildren, useContext, useMemo } from 'react';
import { shareWithOptions, UserApp } from './_helpers';
import { PermissionAndUsersHeader } from './_PermissionAndUsersHeader';
import { useParams, useSelectedLayoutSegment } from 'next/navigation';
import { AppContentHeader } from '../_components/AppContentHeader';
import { Select, Skeleton, Switch } from 'antd';
import { AppMaterialIcons } from '@/components';
import { Text } from '@/components';
import { BusterOrganizationRole } from '@/api/busterv2';
import { PermissionUserUpdateRequest } from '@/api/buster-socket/permissions';
import { useBusterNotifications } from '@/context/BusterNotifications';
import {
  usePermissionsContextSelector,
  usePermissionsTeamIndividual,
  usePermissionsUserIndividual
} from '@/context/Permissions';
import { useMemoizedFn } from 'ahooks';

export const UserAndPermissionsLayout: React.FC<
  PropsWithChildren<{
    defaultLayout: [string, string];
  }>
> = ({ children, defaultLayout }) => {
  const selectedApp = useSelectedLayoutSegment() as UserApp;
  const params = useParams<{
    userId?: string;
    permissionGroupId?: string;
    teamId?: string;
  }>();

  const rightHidden = useMemo(() => {
    if (selectedApp === UserApp.USERS && params.userId) return false;
    if (selectedApp === UserApp.TEAMS && params.teamId) return false;
    if (selectedApp === UserApp.PERMISSION_GROUPS) return true;
    return true;
  }, [selectedApp, params]);

  return (
    <>
      <AppSplitter
        defaultLayout={defaultLayout}
        autoSaveId="user-permission-layout"
        leftChildren={
          <>
            <PermissionAndUsersHeader selectedApp={selectedApp || UserApp.USERS} {...params} />
            {children}
          </>
        }
        rightChildren={
          rightHidden ? null : (
            <>
              <RightPanelHeader selectedApp={selectedApp} {...params} />
              <RightPanelContent selectedApp={selectedApp} {...params} />
            </>
          )
        }
        rightHidden={rightHidden}
        preserveSide="right"
        rightPanelMinSize={'250px'}
        rightPanelMaxSize={'450px'}
      />
    </>
  );
};

const RightPanelHeader: React.FC<{
  selectedApp: UserApp;
  userId?: string;
  permissionGroupId?: string;
  teamId?: string;
}> = ({ selectedApp }) => {
  const title = useMemo(() => {
    if (selectedApp === UserApp.USERS) return 'Permissions';
    if (selectedApp === UserApp.TEAMS) return 'Team Details';
    if (selectedApp === UserApp.PERMISSION_GROUPS) return 'Permissions';
  }, [selectedApp]);

  return (
    <>
      <AppContentHeader className="flex h-full flex-col items-center">
        <div className="flex h-full w-full items-center justify-between">
          <Text>{title}</Text>
          <AppMaterialIcons className="cursor-pointer" icon="help" />
        </div>
      </AppContentHeader>
    </>
  );
};

const RightPanelContent: React.FC<{
  selectedApp: UserApp;
  userId?: string;
  permissionGroupId?: string;
  teamId?: string;
}> = ({ selectedApp, ...params }) => {
  const Component = ContentComponentRecord[selectedApp];

  return (
    <div className="p-3">
      <Component selectedApp={selectedApp} {...params} />
    </div>
  );
};

const RightPanelContentUsers: React.FC<{ selectedApp: UserApp; userId?: string }> = ({
  userId
}) => {
  const updateUser = usePermissionsContextSelector((x) => x.updateUser);
  const selectedUser = usePermissionsUserIndividual({ userId: userId! });

  const onChangeCanShareWith = (v: PermissionUserUpdateRequest['payload']['sharing_setting']) => {
    updateUser({
      id: userId!,
      sharing_setting: v
    });
  };

  if (!selectedUser)
    return (
      <div className="flex w-full flex-col">
        <Skeleton />
      </div>
    );

  return (
    <div className="flex w-full flex-col space-y-5">
      {/* <div className="flex flex-col space-y-2.5">
        <Text type="secondary">Workspace role</Text>
        <Select
          options={permissionRolesOptions}
          defaultActiveFirstOption
          value={selectedUser.role}
          onChange={(v) => {
            onChangeWorkspaceRole(v as BusterOrganizationRole);
          }}
        />
      </div> */}
      <div className="flex flex-col space-y-2.5">
        <Text type="secondary">Can share with...</Text>
        <Select
          options={shareWithOptions}
          defaultActiveFirstOption
          value={selectedUser.sharing_setting}
          onChange={(v) => {
            onChangeCanShareWith(v as PermissionUserUpdateRequest['payload']['sharing_setting']);
          }}
        />
      </div>

      {/* <div className="flex flex-col space-y-2.5">
        <Text type="secondary">Additional permissions</Text>
        <RowSwitch
          title="Edit SQL statements"
          value={selectedUser.edit_sql}
          onChange={(v) => {
            updateUser({
              id: userId!,
              edit_sql: v
            });
          }}
        />
        <RowSwitch
          title="Uploads (CSVs)"
          value={selectedUser.upload_csv}
          onChange={(v) => {
            updateUser({
              id: userId!,
              upload_csv: v
            });
          }}
        />
        <RowSwitch
          title="Exports (PDFs & CSVs)"
          value={selectedUser.export_assets}
          onChange={(v) => {
            updateUser({
              id: userId!,
              export_assets: v
            });
          }}
        />
        <RowSwitch
          title="Slack & email reports"
          value={selectedUser.email_slack_enabled}
          onChange={(v) => {
            updateUser({
              id: userId!,
              email_slack_enabled: v
            });
          }}
        />
      </div> */}
    </div>
  );
};

const RightPanelContentTeams: React.FC<{ selectedApp: UserApp; teamId?: string }> = ({
  teamId
}) => {
  const { openInfoMessage } = useBusterNotifications();
  const updateTeam = usePermissionsContextSelector((x) => x.updateTeam);
  const selectedTeam = usePermissionsTeamIndividual({ teamId: teamId! });

  const onChangeWorkspaceRole = useMemoizedFn((v: BusterOrganizationRole) => {
    // updateUser({
    //   id: userId!
    // });
    openInfoMessage('TODO: Update user role');
  });

  const onChangeCanShareWith = useMemoizedFn(
    (v: PermissionUserUpdateRequest['payload']['sharing_setting']) => {
      updateTeam({
        id: teamId!,
        sharing_setting: v
      });
    }
  );

  if (!selectedTeam)
    return (
      <div className="flex w-full flex-col">
        <Skeleton />
      </div>
    );

  return (
    <div className="flex w-full flex-col space-y-5">
      {/* <div className="flex flex-col space-y-2.5">
        <Text type="secondary">Workspace role</Text>
        <Select
          options={permissionRolesOptions}
          defaultActiveFirstOption
          value={selectedUser.role}
          onChange={(v) => {
            onChangeWorkspaceRole(v as BusterOrganizationRole);
          }}
        />
      </div> */}
      <div className="flex flex-col space-y-2.5">
        <Text type="secondary">Can share with...</Text>
        <Select
          options={shareWithOptions}
          defaultActiveFirstOption
          value={selectedTeam.sharing_setting}
          onChange={(v) => {
            onChangeCanShareWith(v as PermissionUserUpdateRequest['payload']['sharing_setting']);
          }}
        />
      </div>

      <div className="flex flex-col space-y-2.5">
        <Text type="secondary">Additional permissions</Text>
        <RowSwitch
          title="Edit SQL statements"
          value={selectedTeam.edit_sql}
          onChange={(v) => {
            updateTeam({
              id: teamId!,
              edit_sql: v
            });
          }}
        />
        <RowSwitch
          title="Uploads (CSVs)"
          value={selectedTeam.upload_csv}
          onChange={(v) => {
            updateTeam({
              id: teamId!,
              upload_csv: v
            });
          }}
        />
        <RowSwitch
          title="Exports (PDFs & CSVs)"
          value={selectedTeam.export_assets}
          onChange={(v) => {
            updateTeam({
              id: teamId!,
              export_assets: v
            });
          }}
        />
        <RowSwitch
          title="Slack & email reports"
          value={selectedTeam.email_slack_enabled}
          onChange={(v) => {
            updateTeam({
              id: teamId!,
              email_slack_enabled: v
            });
          }}
        />
      </div>
    </div>
  );
};

const RowSwitch: React.FC<{
  title: string;
  value: boolean;
  onChange: (v: boolean) => void;
}> = ({ title, value, onChange }) => {
  return (
    <div className="flex justify-between">
      <Text>{title}</Text>
      <Switch
        value={value}
        onChange={(v) => {
          onChange(v);
        }}
      />
    </div>
  );
};

const ContentComponentRecord: Record<UserApp, React.FC<{ selectedApp: UserApp }>> = {
  [UserApp.USERS]: RightPanelContentUsers,
  [UserApp.TEAMS]: RightPanelContentTeams,
  [UserApp.PERMISSION_GROUPS]: () => <></>
};
