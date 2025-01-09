import { BusterDataset, BusterDatasetData, BusterDatasetListItem } from './responseInterfaces';
import { mainApi } from '../../buster';

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
  return await mainApi.get<BusterDataset>(`/datasets/${datasetId}`).then((res) => res.data);
};

export const getDatasetData = async (datasetId: string): Promise<BusterDatasetData> => {
  return await mainApi
    .get<BusterDatasetData>(`/datasets/${datasetId}/data`)
    .then((res) => res.data);
};

export const createDataset = async (dataset: BusterDataset): Promise<BusterDataset> => {
  return await mainApi.post<BusterDataset>(`/datasets`, dataset).then((res) => res.data);
};
