import { prefetchGetDatasets } from '@/api/busterv2/datasets';
import { DatasetsPageContent } from './DatasetsPageContent';

export default async function DashboardPage() {
  await prefetchGetDatasets();

  return <DatasetsPageContent />;
}
