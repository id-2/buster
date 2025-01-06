import type { BusterThreadMessage } from '../threads/interfaces';

export interface SQLRunResponse {
  data: Record<string, string | number | null>[];
  data_metadata: BusterThreadMessage['data_metadata'];
}
