export interface ListPermissionGroupsResponse {
  id: string;
  name: string;
  assigned: boolean;
}

export interface ListDatasetGroupsResponse {
  id: string;
  name: string;
  assigned: boolean;
}

export interface ListPermissionUsersResponse {
  id: string;
  name: string;
  assigned: boolean;
}

export interface DatasetPermissionOverviewUser {
  id: string;
  name: string;
  can_query: boolean;
  lineage: any[];
}

export interface DatasetPermissionsOverviewResponse {
  dataset_id: string;
  users: DatasetPermissionOverviewUser[];
}
