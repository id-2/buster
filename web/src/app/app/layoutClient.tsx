'use client';

import { AppProviders } from '@/context/AppProviders';
import React from 'react';
import { AppLayout } from './_controllers/AppLayout';
import { BusterUserResponse } from '@/api/busterv2';
import { useSupabaseServerContext } from '@/context/Supabase/useSupabaseContext';
import { GlobalErrorComponent } from './_components/GlobalErrorComponent';

export const AppLayoutClient = ({
  children,
  userInfo,
  supabaseContext,
  defaultLayout,
  signOut
}: {
  children: React.ReactNode;
  userInfo: BusterUserResponse | undefined;
  supabaseContext: Awaited<ReturnType<typeof useSupabaseServerContext>>;
  defaultLayout: [string, string];
  signOut: () => void;
}) => {
  return (
    <GlobalErrorComponent>
      <AppProviders userInfo={userInfo} supabaseContext={supabaseContext}>
        <AppLayout defaultLayout={defaultLayout} signOut={signOut}>
          {children}
        </AppLayout>
      </AppProviders>
    </GlobalErrorComponent>
  );
};
