import { DataSource } from '../datasources';

export interface BusterDatasetListItem {
  id: string;
  name: string;
  data_source?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  definition: string;
  deleted_at: null | string;
  enabled: boolean;
  imported: boolean;
  owner: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
  database_name: string;
  belongs_to: string | null;
}

export type BusterDataset = {
  created_at: string;
  created_by: string;
  data_source_id: string;
  database_name: string;
  definition: string; //aka SQL
  deleted_at: null;
  enabled: boolean;
  id: string;
  name: string;
  schema: string;
  type: 'view';
  updated_at: string;
  updated_by: string;
  when_not_to_use: string;
  when_to_use: string;
  columns: BusterDatasetColumn[];
  created_by_name: string;
  data_source: DataSource;
  data: Record<string, string | number | null>[];
  imported: boolean;
};

export interface BusterDatasetColumn {
  id: string;
  name: string;
  type: string;
  stored_values: boolean;
  created_at: string;
  dataset_id: string;
  description: string | null;
  deleted_at: string | null;
  nullable: boolean;
  updated_at: string;
}

export interface BusterDatasetData {
  data: Record<string, string | number | null>[];
}
