import { DatasetHeader } from '../../datasets/_DatasetsHeader';
import { SettingsEmptyState } from '../_SettingsEmptyState';
import { SettingsPageHeader } from '../_SettingsPageHeader';

export default function Page() {
  return (
    <div>
      <SettingsPageHeader title="Datasets" description="Manage your datasets" />
      <SettingsEmptyState />
    </div>
  );
}
