import { mainApi } from '../../buster';
import { GetPermissionGroupResponse } from './responseInterfaces';

export const listPermissionGroups = async (): Promise<GetPermissionGroupResponse[]> => {
  return await mainApi.get(`/permission_groups`).then((res) => res.data);
};

export const getPermissionGroup = async ({
  id
}: {
  id: string;
}): Promise<GetPermissionGroupResponse> => {
  return await mainApi.get(`/permission_groups/${id}`).then((res) => res.data);
};

export const updatePermissionGroup = async ({
  id,
  data
}: {
  id: string;
  data: { id: string; name: string }[];
}): Promise<void> => {
  return await mainApi.put(`/permission_groups/${id}`, data);
};

export const deletePermissionGroup = async ({ id }: { id: string }): Promise<void> => {
  return await mainApi.delete(`/permission_groups/${id}`);
};

export const createPermissionGroup = async (data: { name: string }): Promise<void> => {
  return await mainApi.post(`/permission_groups`, data);
};
