import { mainApi } from '../../../buster';
import {
  DatasetPermissionsOverviewResponse,
  ListDatasetGroupsResponse,
  ListPermissionGroupsResponse,
  ListPermissionUsersResponse
} from './responseInterfaces';
import * as config from './config';

export const listPermissionGroups = async ({
  dataset_id
}: {
  dataset_id: string;
}): Promise<ListPermissionGroupsResponse[]> => {
  return await mainApi.get(`/datasets/${dataset_id}/permission_groups`).then((res) => res.data);
};

export const listDatasetGroups = async ({
  dataset_id
}: {
  dataset_id: string;
}): Promise<ListDatasetGroupsResponse[]> => {
  return await mainApi.get(`/datasets/${dataset_id}/dataset_groups`).then((res) => res.data);
};

export const listPermissionUsers = async ({
  dataset_id
}: {
  dataset_id: string;
}): Promise<ListPermissionUsersResponse[]> => {
  return await mainApi.get(`/datasets/${dataset_id}/users`).then((res) => res.data);
};

export const updatePermissionUsers = async ({
  dataset_id,
  users
}: {
  dataset_id: string;
  users: {
    id: string;
    assigned: boolean;
  }[];
}): Promise<void> => {
  return await mainApi.put(`/datasets/${dataset_id}/users`, users);
};

export const updatePermissionGroups = async ({
  dataset_id,
  groups
}: {
  dataset_id: string;
  groups: { id: string; assigned: boolean }[];
}): Promise<void> => {
  return await mainApi.put(`/datasets/${dataset_id}/permission_groups`, groups);
};

export const updateDatasetGroups = async ({
  dataset_id,
  groups
}: {
  dataset_id: string;
  groups: { id: string; assigned: boolean }[];
}): Promise<void> => {
  return await mainApi.put(`/datasets/${dataset_id}/dataset_groups`, groups);
};

export const getDatasetPermissionsOverview = async ({
  dataset_id
}: {
  dataset_id: string;
}): Promise<DatasetPermissionsOverviewResponse> => {
  return await mainApi.get(config.GET_PERMISSIONS_OVERVIEW(dataset_id)).then((res) => res.data);
};
