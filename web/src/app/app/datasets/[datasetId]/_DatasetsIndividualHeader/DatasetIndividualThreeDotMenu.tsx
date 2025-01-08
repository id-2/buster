import { AppMaterialIcons } from '@/components';
import { Button } from 'antd';
import React from 'react';

export const DatasetIndividualThreeDotMenu: React.FC = React.memo(() => {
  return <Button type="text" icon={<AppMaterialIcons icon="more_horiz" />} />;
});
DatasetIndividualThreeDotMenu.displayName = 'DatasetIndividualThreeDotMenu';
