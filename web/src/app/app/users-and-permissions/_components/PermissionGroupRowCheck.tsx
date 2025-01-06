import { BusterPermissionListGroup } from '@/api/busterv2/permissions';
import React from 'react';
import { useStyles } from '../users/[userId]/_UserIndividualContent';
import { AppTooltip, Text } from '@/components';
import { Checkbox } from 'antd';
import pluralize from 'pluralize';

export const PermissionGroupRowCheck: React.FC<{
  permissionGroupsList: BusterPermissionListGroup[];
  setCheckValues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  checkValues: Record<string, boolean>;
}> = ({ checkValues, setCheckValues, permissionGroupsList }) => {
  const { styles, cx } = useStyles();

  return (
    <>
      {permissionGroupsList.map((group) => {
        const isDisabled = !!group.teams?.length;

        return (
          <div
            key={group.id}
            className={cx('flex items-center justify-between px-4', styles.listItem)}>
            <div
              className="flex cursor-pointer items-center space-x-2"
              onClick={() => {
                if (isDisabled) return;
                setCheckValues((prev) => ({ ...prev, [group.id]: !prev[group.id] }));
              }}>
              <AppTooltip
                mouseEnterDelay={0.01}
                title={
                  isDisabled
                    ? `Permission is given through team(s): ${group.teams?.map((team) => team.name).join(', ')}`
                    : ''
                }>
                <Checkbox disabled={isDisabled} checked={checkValues[group.id]} />
              </AppTooltip>
              <Text className="select-none">{group.name}</Text>
            </div>
            <div>
              <Text>{pluralize('dataset', group.dataset_count, true)}</Text>
            </div>
          </div>
        );
      })}
    </>
  );
};
