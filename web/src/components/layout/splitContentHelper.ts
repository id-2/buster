import { cookies } from 'next/headers';
import { createAutoSaveId } from './helper';

export function getAppSplitterLayout(
  id: string = '',
  defaultLayout: string[] = ['300px', 'auto']
): [string, string] {
  const key = createAutoSaveId(id);
  const layout = cookies().get(key);
  if (layout) {
    return JSON.parse(layout.value) as [string, string];
  }
  return defaultLayout as [string, string];
}
