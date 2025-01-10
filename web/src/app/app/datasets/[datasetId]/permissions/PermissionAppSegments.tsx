'use client';

import React from 'react';
import { AppSegmented } from '@/components';
import { PermissionApps } from './config';
import { useMemoizedFn } from 'ahooks';
import { SegmentedValue } from 'antd/es/segmented';
import { Divider } from 'antd';

const options: { label: string; value: PermissionApps }[] = [
  {
    label: 'Overview',
    value: PermissionApps.OVERVIEW
  },
  {
    label: 'Permission Groups',
    value: PermissionApps.PERMISSION_GROUPS
  },
  {
    label: 'Dataset Groups',
    value: PermissionApps.DATASET_GROUPS
  },
  {
    label: 'Users',
    value: PermissionApps.USERS
  }
];

export const PermissionAppSegments: React.FC<{
  selectedApp: PermissionApps;
  setSelectedApp: (app: PermissionApps) => void;
}> = React.memo(({ selectedApp, setSelectedApp }) => {
  const handleSelect = useMemoizedFn((app: SegmentedValue) => {
    setSelectedApp(app as PermissionApps);
  });

  return (
    <div className="flex flex-col justify-center space-x-0 space-y-2">
      <AppSegmented options={options} value={selectedApp} onChange={handleSelect} />
      <Divider className="" />
    </div>
  );
});

PermissionAppSegments.displayName = 'PermissionAppSegments';
