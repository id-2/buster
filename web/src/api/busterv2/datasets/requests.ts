import { BusterDataset, BusterDatasetData, BusterDatasetListItem } from './responseInterfaces';
import { mainApi } from '../../buster';
import * as config from './config';

export const getDatasets = async (params?: {
  page?: number;
  page_size?: number;
  search?: string;
  admin_view?: boolean;
  imported?: boolean;
  enabled?: boolean;
  permission_group_id?: string;
  belongs_to?: string;
}): Promise<BusterDatasetListItem[]> => {
  const { page = 0, page_size = 1000, ...allParams } = params || {};
  return await mainApi
    .get<BusterDatasetListItem[]>(`/datasets`, { params: { page, page_size, ...allParams } })
    .then((res) => res.data);
};

export const getDatasetMetadata = async (datasetId: string): Promise<BusterDataset> => {
  return await mainApi
    .get<BusterDataset>(config.GET_DATASET_URL(datasetId))
    .then((res) => res.data);
};

export const getDatasetDataSample = async (datasetId: string): Promise<BusterDatasetData> => {
  return await mainApi
    .get<BusterDatasetData>(`/datasets/${datasetId}/data/sample`)
    .then((res) => res.data);
};

export const createDataset = async (dataset: BusterDataset): Promise<BusterDataset> => {
  return await mainApi.post<BusterDataset>(`/datasets`, dataset).then((res) => res.data);
};

export const deleteDataset = async (datasetId: string): Promise<void> => {
  return await mainApi.delete(`/datasets/${datasetId}`).then((res) => res.data);
};

export const deployDataset = async ({
  dataset_id,
  ...params
}: {
  dataset_id: string;
  sql: string;
  yml: string;
}): Promise<void> => {
  return await mainApi
    .post(`/datasets/deploy`, { id: dataset_id, ...params })
    .then((res) => res.data);
};

export const updateDataset = async (data: { id: string; name: string }) => {
  return await mainApi.put(`/datasets/${data.id}`, data).then((res) => res.data);
};
