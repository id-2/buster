import { BusterDatasetListItem } from './responseInterfaces';
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
