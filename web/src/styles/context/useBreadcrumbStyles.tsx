import { AppMaterialIcons } from '@/components';
import React from 'react';

export const BreadcrumbSeperator: React.FC<{
  style?: React.CSSProperties;
}> = React.memo(
  ({ style }) => <AppMaterialIcons style={style} size={16} icon="chevron_right" />,
  () => true
);
BreadcrumbSeperator.displayName = 'BreadcrumbSeperator';
