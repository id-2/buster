import { AppMaterialIcons } from '@/components';
import React from 'react';

export enum DatasetApps {
  SQL = 'sql',
  DESCRIPTIONS = 'descriptions',
  OVERVIEW = 'overview'
}

export const DataSetAppText: Record<DatasetApps, string> = {
  [DatasetApps.OVERVIEW]: 'Overview',
  [DatasetApps.DESCRIPTIONS]: 'Metadata',
  [DatasetApps.SQL]: 'SQL Editor'
};

export const DataSetAppIcons: Record<DatasetApps, React.ReactNode> = {
  [DatasetApps.OVERVIEW]: <AppMaterialIcons icon="info" />,
  [DatasetApps.DESCRIPTIONS]: <AppMaterialIcons icon="menu_book" />,
  [DatasetApps.SQL]: <AppMaterialIcons icon="data_object" />
};
