import { useCreateReactQuery, useCreateReactMutation } from '@/api/createReactQuery';
import {
  getDatasetPermissionsOverview,
  listDatasetDatasetGroups,
  listPermissionGroups,
  listPermissionUsers,
  updateDatasetGroups,
  updatePermissionGroups,
  updatePermissionUsers
} from './requests';
import { useMemoizedFn } from 'ahooks';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { getDatasetPermissionsOverview_server } from './serverRequests';
import { ListPermissionUsersResponse } from './responseInterfaces';

export const useGetDatasetPermissionsOverview = (dataset_id: string) => {
  const queryFn = useMemoizedFn(() => getDatasetPermissionsOverview({ dataset_id }));

  return useCreateReactQuery({
    queryKey: ['dataset_permissions_overview', dataset_id],
    queryFn
  });
};

export const prefetchGetDatasetPermissionsOverview = async (
  datasetId: string,
  queryClientProp?: QueryClient
) => {
  const queryClient = queryClientProp || new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['dataset_permissions_overview', datasetId],
    queryFn: () => getDatasetPermissionsOverview_server(datasetId)
  });
  return queryClient;
};

export const useListPermissionGroups = (dataset_id: string) => {
  const queryFn = useMemoizedFn(() => listPermissionGroups({ dataset_id }));

  return useCreateReactQuery({
    queryKey: ['list_permission_groups', dataset_id],
    queryFn,
    staleTime: 1000 * 5 // 5 seconds
  });
};

export const useListDatasetDatasetGroups = (dataset_id: string) => {
  const queryFn = useMemoizedFn(() => listDatasetDatasetGroups({ dataset_id }));

  return useCreateReactQuery({
    queryKey: ['list_dataset_groups', dataset_id],
    queryFn
  });
};

export const useListPermissionUsers = (dataset_id: string) => {
  const queryFn = useMemoizedFn(() => listPermissionUsers({ dataset_id }));

  return useCreateReactQuery({
    queryKey: ['list_permission_users', dataset_id],
    queryFn
  });
};

export const useUpdatePermissionGroups = (dataset_id: string) => {
  const queryClient = useQueryClient();
  const mutationFn = useMemoizedFn((groups: { id: string; assigned: boolean }[]) => {
    const keyedChanges: Record<string, { id: string; assigned: boolean }> = {};
    groups.forEach(({ id, assigned }) => {
      keyedChanges[id] = { id, assigned };
    });
    queryClient.setQueryData(
      ['list_permission_groups', dataset_id],
      (oldData: ListPermissionUsersResponse[]) => {
        return oldData?.map((group) => {
          const updatedGroup = keyedChanges[group.id];
          if (updatedGroup) return { ...group, assigned: updatedGroup.assigned };
          return group;
        });
      }
    );

    return updatePermissionGroups({ dataset_id, groups });
  });

  return useCreateReactMutation({
    mutationFn
  });
};

export const useUpdateDatasetGroups = (dataset_id: string) => {
  const queryClient = useQueryClient();
  const mutationFn = useMemoizedFn((groups: { id: string; assigned: boolean }[]) => {
    const keyedChanges: Record<string, { id: string; assigned: boolean }> = {};
    groups.forEach(({ id, assigned }) => {
      keyedChanges[id] = { id, assigned };
    });
    queryClient.setQueryData(
      ['list_dataset_groups', dataset_id],
      (oldData: ListPermissionUsersResponse[]) => {
        return oldData?.map((group) => {
          const updatedGroup = keyedChanges[group.id];
          if (updatedGroup) return { ...group, assigned: updatedGroup.assigned };
          return group;
        });
      }
    );
    return updateDatasetGroups({ dataset_id, groups });
  });

  return useCreateReactMutation({
    mutationFn
  });
};

export const useUpdatePermissionUsers = (dataset_id: string) => {
  const queryClient = useQueryClient();
  const mutationFn = useMemoizedFn((users: { id: string; assigned: boolean }[]) => {
    const keyedChanges: Record<string, { id: string; assigned: boolean }> = {};
    users.forEach(({ id, assigned }) => {
      keyedChanges[id] = { id, assigned };
    });
    queryClient.setQueryData(
      ['list_permission_users', dataset_id],
      (oldData: ListPermissionUsersResponse[]) => {
        return oldData?.map((user) => {
          const updatedUser = keyedChanges[user.id];
          if (updatedUser) return { ...user, assigned: updatedUser.assigned };
          return user;
        });
      }
    );
    return updatePermissionUsers({ dataset_id, users });
  });

  return useCreateReactMutation({
    mutationFn
  });
};
