import { BASE_URL } from '@/api/buster/instances';
import { BusterDatasetListItem } from './interfaces';

interface ListDatasetsAdminParams {
    jwtToken: string;
    page?: number;
    page_size?: number;
    admin_view?: boolean;
    enabled?: boolean;
    imported?: boolean;
    permission_group_id?: string;
    belongs_to?: boolean | null;
}

export const listDatasetsAdmin = async ({
    jwtToken,
    page = 0,
    page_size = 1000,
    admin_view = true,
    enabled,
    imported,
    permission_group_id,
    belongs_to
}: ListDatasetsAdminParams): Promise<BusterDatasetListItem[]> => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: page_size.toString(),
            admin_view: admin_view.toString()
        });

        if (enabled !== undefined) {
            params.append('enabled', enabled.toString());
        }
        if (imported !== undefined) {
            params.append('imported', imported.toString());
        }
        if (permission_group_id) {
            params.append('permission_group_id', permission_group_id);
        }
        if (belongs_to !== undefined && belongs_to !== null) {
            params.append('belongs_to', belongs_to.toString());
        }

        const response = await fetch(`${BASE_URL}/datasets?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${jwtToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch datasets');
        }

        const datasets = await response.json();
        if (Array.isArray(datasets)) {
            return datasets;
        }
        
        console.warn('Unexpected API response format:', datasets);
        return [];
    } catch (error) {
        console.error('Error fetching datasets:', error);
        return [];
    }
}; 