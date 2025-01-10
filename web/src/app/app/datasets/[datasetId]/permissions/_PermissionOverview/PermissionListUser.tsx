import React from 'react';
import { DatasetPermissionOverviewUser } from '@/api/busterv2/datasets';

export const PermissionListUser: React.FC<{
  className?: string;
  user: DatasetPermissionOverviewUser;
}> = React.memo(({ className = '', user }) => {
  return <div className={`flex flex-col space-y-1.5 ${className}`}>swag</div>;
});
PermissionListUser.displayName = 'PermissionListUser';
