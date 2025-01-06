import React from 'react';
import { getAppSplitterLayout } from '@/components/layout/splitContentHelper';
import { UserAndPermissionsLayout } from './_layout';

export default function LayoutForRoute({ children, ...rest }: { children: React.ReactNode }) {
  const defaultLayout = getAppSplitterLayout('user-permission-layout', ['auto', '300px']);

  return (
    <UserAndPermissionsLayout defaultLayout={defaultLayout}>{children}</UserAndPermissionsLayout>
  );
}
