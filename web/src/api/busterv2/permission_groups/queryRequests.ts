import { useCreateReactQuery, useCreateReactMutation } from '@/api/createReactQuery';
import {
  getPermissionGroup,
  listPermissionGroups,
  createPermissionGroup,
  deletePermissionGroup,
  updatePermissionGroup
} from './requests';
import { useMemoizedFn } from 'ahooks';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

export const useListPermissionGroups = () => {
  return useCreateReactQuery({
    queryKey: ['permission_groups'],
    queryFn: listPermissionGroups
  });
};

export const useGetPermissionGroup = (permissionGroupId: string) => {
  const queryFn = useMemoizedFn(() => getPermissionGroup({ id: permissionGroupId }));
  return useCreateReactQuery({
    queryKey: ['permission_group', permissionGroupId],
    queryFn
  });
};

export const useCreatePermissionGroup = (dataset_id?: string) => {
  const queryClient = useQueryClient();
  return useCreateReactMutation({
    mutationFn: createPermissionGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission_groups'] });
      if (dataset_id) {
        queryClient.invalidateQueries({ queryKey: ['list_permission_groups', dataset_id] });
      }
    }
  });
};

export const useDeletePermissionGroup = () => {
  const queryClient = useQueryClient();
  return useCreateReactMutation({
    mutationFn: deletePermissionGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission_groups'] });
    }
  });
};

export const useUpdatePermissionGroup = () => {
  const queryClient = useQueryClient();
  return useCreateReactMutation({
    mutationFn: updatePermissionGroup,
    onSuccess: (data, varaiables, context) => {
      // queryClient.invalidateQueries({ queryKey: ['permission_groups'] });
    }
  });
};
