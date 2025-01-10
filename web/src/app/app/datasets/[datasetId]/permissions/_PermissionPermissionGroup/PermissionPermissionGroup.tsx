import React, { useEffect, useState, useTransition } from 'react';
import { HeaderExplanation } from '../HeaderExplanation';
import { PermissionSearch } from '../PermissionSearch';
import { useDebounceFn, useMemoizedFn } from 'ahooks';
import { Button } from 'antd';
import { AppMaterialIcons } from '@/components';
import { PermissionListPermissionGroupContainer } from './PermissionListPermissionGroupContainer';
import { ListPermissionGroupsResponse, useListPermissionGroups } from '@/api/busterv2/datasets';
import { NewPermissionGroupModal } from './NewPermissionGroupModal';

export const PermissionPermissionGroup: React.FC<{
  datasetId: string;
}> = React.memo(({ datasetId }) => {
  const [isPending, startTransition] = useTransition();
  const { data: permissionGroups, isFetched: isPermissionGroupsFetched } =
    useListPermissionGroups(datasetId);
  const [isNewPermissionGroupModalOpen, setIsNewPermissionGroupModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredPermissionGroups, setFilteredPermissionGroups] = useState<
    ListPermissionGroupsResponse[]
  >([]);

  const filterPermissionGroups = useMemoizedFn((text: string): ListPermissionGroupsResponse[] => {
    if (!text) return permissionGroups || [];
    const lowerCaseSearchText = text.toLowerCase();
    return (permissionGroups || []).filter((p) => {
      return p.name.toLowerCase().includes(lowerCaseSearchText);
    });
  });

  const updateFilteredPermissionGroups = useMemoizedFn((text: string) => {
    startTransition(() => {
      setFilteredPermissionGroups(filterPermissionGroups(text));
    });
  });

  const { run: debouncedSearch } = useDebounceFn(
    (text: string) => {
      updateFilteredPermissionGroups(text);
    },
    { wait: 300 }
  );

  const handleSearchChange = useMemoizedFn((text: string) => {
    setSearchText(text);
    debouncedSearch(text);
  });

  const onCloseNewPermissionGroupModal = useMemoizedFn(() => {
    setIsNewPermissionGroupModalOpen(false);
  });

  const onOpenNewPermissionGroupModal = useMemoizedFn(() => {
    setIsNewPermissionGroupModalOpen(true);
  });

  useEffect(() => {
    setFilteredPermissionGroups(permissionGroups || []);
  }, [permissionGroups]);

  return (
    <>
      <HeaderExplanation
        className="mb-5"
        title="Dataset permissions"
        description="Manage who can build dashboards & metrics using this dataset"
      />
      <div className="flex h-full flex-col space-y-3">
        <div className="flex items-center justify-between">
          <PermissionSearch
            searchText={searchText}
            setSearchText={handleSearchChange}
            placeholder="Search by permission group"
          />

          <Button
            type="default"
            icon={<AppMaterialIcons icon="add" />}
            onClick={onOpenNewPermissionGroupModal}>
            New permission group
          </Button>
        </div>
        {isPermissionGroupsFetched && (
          <PermissionListPermissionGroupContainer
            filteredPermissionGroups={filteredPermissionGroups}
            datasetId={datasetId}
          />
        )}
      </div>

      <NewPermissionGroupModal
        isOpen={isNewPermissionGroupModalOpen}
        onClose={onCloseNewPermissionGroupModal}
        datasetId={datasetId}
      />
    </>
  );
});

PermissionPermissionGroup.displayName = 'PermissionPermissionGroup';
