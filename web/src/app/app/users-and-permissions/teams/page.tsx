'use client';

import { useMemoizedFn } from 'ahooks';
import { useEffect, useMemo, useState, useTransition } from 'react';
import React from 'react';
import { BusterList, BusterListColumn, BusterListRow } from '@/components/list';
import { BusterPermissionListTeam } from '@/api/busterv2/permissions';
import { Input } from 'antd';
import { BusterRoutes, createBusterRoute } from '@/routes';
import pluralize from 'pluralize';
import { AppContent } from '../../_components/AppContent';
import { usePermissionsContextSelector } from '@/context/Permissions';
import { usePermissionTeamsListIndividual } from '@/context/Permissions/usePermissionsTeams';
import { ContainerEmptyState } from '../_components/ContainerEmptyState';
import { TeamSelectedPopup } from './_TeamSelectedPopup';

export default function Page() {
  const loadedTeamsList = usePermissionsContextSelector((x) => x.loadedTeamsList);
  const teamsList = usePermissionTeamsListIndividual({});
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [isSearching, startTransition] = useTransition();
  const [searchedTeams, setSearchedTeams] = useState<BusterPermissionListTeam[]>(teamsList);

  const onSearchTeamsInputChange = useMemoizedFn((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value.toLowerCase();
    startTransition(() => {
      if (!newSearchTerm) {
        setSearchedTeams(teamsList);
      } else {
        setSearchedTeams(
          teamsList.filter((team) => {
            return team.name?.toLowerCase().includes(newSearchTerm);
          })
        );
      }
    });
  });

  const columns: BusterListColumn[] = useMemo(() => {
    return [
      {
        title: 'Name',
        dataIndex: 'name',
        headerRender: () => {
          return (
            <Input
              className="max-w-[260px]"
              size="small"
              placeholder="Search by name..."
              onChange={onSearchTeamsInputChange}
            />
          );
        }
      },
      {
        title: 'Members',
        dataIndex: 'member_count',
        width: 110,
        render: (data) => pluralize('Member', data, true)
      },
      {
        title: 'Groups',
        dataIndex: 'permission_group_count',
        width: 80,
        render: (data) => pluralize('Group', data, true)
      }
    ];
  }, [onSearchTeamsInputChange]);

  const rows: BusterListRow[] = useMemo(() => {
    return searchedTeams.map((team) => {
      return {
        id: team.id,
        data: team,
        link: createBusterRoute({
          route: BusterRoutes.APP_TEAMS_ID,
          teamId: team.id
        })
      };
    });
  }, [searchedTeams]);

  useEffect(() => {
    setSearchedTeams(teamsList);
  }, [teamsList.length]);

  return (
    <AppContent>
      <BusterList
        rows={rows}
        columns={columns}
        selectedRowKeys={selectedTeamIds}
        onSelectChange={setSelectedTeamIds}
        emptyState={loadedTeamsList ? <TeamsEmptyState /> : <></>}
      />
      <TeamSelectedPopup selectedRowKeys={selectedTeamIds} onSelectChange={setSelectedTeamIds} />
    </AppContent>
  );
}

const TeamsEmptyState: React.FC<{}> = () => {
  const setOpenCreateTeamModal = usePermissionsContextSelector((x) => x.setOpenCreateTeamModal);

  return (
    <div className="">
      <ContainerEmptyState
        title="You don't have any teams yet"
        description="You don't have any teams. As soon as you do, they will appear here."
        onClick={() => {
          setOpenCreateTeamModal(true);
        }}
        buttonText="New team"
      />
    </div>
  );
};
