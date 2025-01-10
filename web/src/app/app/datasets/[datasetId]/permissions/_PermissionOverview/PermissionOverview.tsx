import {
  DatasetPermissionOverviewUser,
  useGetDatasetPermissionsOverview
} from '@/api/busterv2/datasets';
import React, { useMemo, useState, useTransition, useEffect } from 'react';
import { Title, Text } from '@/components/text';
import { Input } from 'antd';
import { useMemoizedFn } from 'ahooks';
import { AppMaterialIcons } from '@/components';
import { useDebounceFn } from 'ahooks';
import { HeaderExplanation } from './HeaderExplanation';
import { PermissionOverviewSearch } from './PermissionOverviewSearch';
import { PermissionListUserContainer } from './PermissionListUserContainer';

export const PermissionOverview: React.FC<{
  datasetId: string;
}> = React.memo(({ datasetId }) => {
  const { data: datasetPermissionsOverview } = useGetDatasetPermissionsOverview(datasetId);
  const [searchText, setSearchText] = useState('');
  const [isPending, startTransition] = useTransition();

  // Memoize the filtering logic
  const filterUsers = useMemoizedFn((text: string): DatasetPermissionOverviewUser[] => {
    if (!text) return datasetPermissionsOverview?.users || [];
    const lowerCaseSearchText = text.toLowerCase();
    return (datasetPermissionsOverview?.users || []).filter((user) => {
      return (
        user.name.toLowerCase().includes(lowerCaseSearchText) ||
        user.email?.toLowerCase().includes(lowerCaseSearchText)
      );
    });
  });

  const [filteredUsers, setFilteredUsers] = useState<DatasetPermissionOverviewUser[]>(
    datasetPermissionsOverview?.users || []
  );

  // Update filtered results in a transition
  const updateFilteredUsers = useMemoizedFn((text: string) => {
    startTransition(() => {
      setFilteredUsers(filterUsers(text));
    });
  });

  // Debounce the search with 300ms delay
  const { run: debouncedSearch } = useDebounceFn(
    (text: string) => {
      updateFilteredUsers(text);
    },
    { wait: 300 }
  );

  // Update search text immediately but debounce the filtering
  const handleSearchChange = useMemoizedFn((text: string) => {
    setSearchText(text);
    debouncedSearch(text);
  });

  // Initialize filtered users when data loads
  useEffect(() => {
    setFilteredUsers(datasetPermissionsOverview?.users || []);
  }, [datasetPermissionsOverview]);

  return (
    <>
      <HeaderExplanation className="mb-5" />
      <div className="flex h-full flex-col space-y-3">
        <PermissionOverviewSearch searchText={searchText} setSearchText={handleSearchChange} />
        <PermissionListUserContainer filteredUsers={filteredUsers} />
        {/* You can use filteredUsers here to display the results */}
      </div>
    </>
  );
});

PermissionOverview.displayName = 'PermissionOverview';
