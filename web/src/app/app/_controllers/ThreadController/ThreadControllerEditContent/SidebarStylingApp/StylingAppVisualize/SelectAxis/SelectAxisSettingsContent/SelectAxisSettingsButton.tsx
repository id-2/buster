import { AppMaterialIcons, AppPopover } from '@/components';
import { Button } from 'antd';
import React from 'react';
import { SelectAxisContainerId } from '../config';
import { SelectAxisSettingContent } from './SelectAxisSettingContent';
import { useSelectAxisContextSelector } from '../useSelectAxisContext';
import { zoneIdToAxisSettingContent } from './config';

export const SelectAxisSettingsButton: React.FC<{
  zoneId: SelectAxisContainerId;
}> = React.memo(({ zoneId }) => {
  const selectedChartType = useSelectAxisContextSelector((x) => x.selectedChartType);

  if (selectedChartType === 'pie' || zoneIdToAxisSettingContent[zoneId] === null) return null;

  return (
    <AppPopover
      content={<SelectAxisSettingContent zoneId={zoneId} />}
      trigger="click"
      destroyTooltipOnHide
      performant
      placement="leftBottom">
      <Button type="text" icon={<AppMaterialIcons icon="tune" />} />
    </AppPopover>
  );
});
SelectAxisSettingsButton.displayName = 'SelectAxisSettingsButton';
